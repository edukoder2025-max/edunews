const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'edukoder2025@gmail.com';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'EduNews';

type BrevoHeaders = Record<string, string>;

function getHeaders(): BrevoHeaders {
  if (!BREVO_API_KEY) {
    console.warn("WARNING: BREVO_API_KEY is not defined in environment variables.");
  }
  return {
    'api-key': BREVO_API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

/**
 * Suscribe un correo electrónico al boletín.
 * Si el contacto ya existe, actualiza su estado.
 */
export async function subscribeContact(email: string) {
  try {
    const listId = await getDefaultListId();
    
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        email,
        updateEnabled: true,
        listIds: listId ? [listId] : undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Si el código es 200/204 o ya existe y se actualizó, Brevo a veces devuelve errores específicos
      if (response.status === 400 && errorData.message?.includes('already exist')) {
        return { success: true, message: 'Ya estás suscrito al boletín.' };
      }
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    return { success: true, message: 'Suscripción exitosa. ¡Bienvenido a EduNews!' };
  } catch (error: any) {
    console.error('Error subscribing contact to Brevo:', error);
    return { success: false, error: error.message || 'Error al procesar la suscripción.' };
  }
}

/**
 * Obtiene la cantidad total de suscriptores/contactos en Brevo.
 */
export async function getSubscriberCount(): Promise<number> {
  try {
    // Si queremos el número total de contactos:
    const response = await fetch('https://api.brevo.com/v3/contacts?limit=1', {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error('Error fetching subscriber count from Brevo:', error);
    return 0;
  }
}

/**
 * Obtiene la lista por defecto o crea una si no existe.
 */
export async function getDefaultListId(): Promise<number | null> {
  try {
    // 1. Intentar obtener listas existentes
    const response = await fetch('https://api.brevo.com/v3/contacts/lists?limit=10', {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (data.lists && data.lists.length > 0) {
      // Usar la primera lista disponible
      return data.lists[0].id;
    }

    // 2. Si no hay listas, intentar obtener o crear una carpeta primero (las listas necesitan carpetas en Brevo)
    // Busquemos carpetas existentes
    const folderRes = await fetch('https://api.brevo.com/v3/contacts/folders?limit=1', {
      method: 'GET',
      headers: getHeaders(),
    });
    let folderId = 1;
    if (folderRes.ok) {
      const folderData = await folderRes.json();
      if (folderData.folders && folderData.folders.length > 0) {
        folderId = folderData.folders[0].id;
      } else {
        // Crear carpeta si no hay
        const createFolderRes = await fetch('https://api.brevo.com/v3/contacts/folders', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ name: 'EduNews Marketing' }),
        });
        if (createFolderRes.ok) {
          const newFolder = await createFolderRes.json();
          folderId = newFolder.id;
        }
      }
    }

    // Crear la lista por defecto
    const createListRes = await fetch('https://api.brevo.com/v3/contacts/lists', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: 'Boletín EduNews',
        folderId: folderId,
      }),
    });

    if (createListRes.ok) {
      const newList = await createListRes.json();
      return newList.id;
    }

    return null;
  } catch (error) {
    console.error('Error getting default list ID from Brevo:', error);
    // Retornamos un list ID tentativo si falla la llamada
    return 2;
  }
}

/**
 * Crea y envía una campaña de email (boletín) a los suscriptores.
 */
export async function sendNewsletterCampaign(subject: string, htmlContent: string, customListId?: number) {
  try {
    const listId = customListId || (process.env.BREVO_LIST_ID ? parseInt(process.env.BREVO_LIST_ID, 10) : null) || await getDefaultListId();
    if (!listId) {
      throw new Error('No se pudo encontrar ni crear una lista de contactos en Brevo.');
    }

    // 1. Crear la campaña de email
    const campaignName = `EduNews Digest - ${new Date().toLocaleDateString('es-ES')}`;
    const campaignPayload = {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      name: campaignName,
      subject: subject,
      htmlContent: htmlContent,
      recipients: {
        listIds: [listId],
      },
    };

    console.log('Brevo campaign payload (sender):', campaignPayload.sender, '| listId:', listId);

    const createCampaignRes = await fetch('https://api.brevo.com/v3/emailCampaigns', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(campaignPayload),
    });

    if (!createCampaignRes.ok) {
      const errorText = await createCampaignRes.text();
      let errorData: any = {};
      try { errorData = JSON.parse(errorText); } catch {}
      // Log completo para diagnóstico
      console.error(`Brevo createCampaign HTTP ${createCampaignRes.status}:`, errorText);
      throw new Error(
        errorData.message || errorData.error || 
        `Error creando campaña: HTTP ${createCampaignRes.status} — ${errorText.slice(0, 300)}`
      );
    }

    const campaignData = await createCampaignRes.json();
    const campaignId = campaignData.id;
    console.log('Brevo campaign created, id:', campaignId);

    // 2. Enviar la campaña de forma inmediata
    const sendCampaignRes = await fetch(`https://api.brevo.com/v3/emailCampaigns/${campaignId}/sendNow`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!sendCampaignRes.ok) {
      const errorText = await sendCampaignRes.text();
      let errorData: any = {};
      try { errorData = JSON.parse(errorText); } catch {}
      console.error(`Brevo sendNow HTTP ${sendCampaignRes.status}:`, errorText);
      throw new Error(errorData.message || `Error enviando campaña: HTTP ${sendCampaignRes.status} — ${errorText.slice(0, 300)}`);
    }

    return { success: true, campaignId };
  } catch (error: any) {
    console.error('Error sending newsletter campaign:', error);
    return { success: false, error: error.message || 'Error desconocido al enviar campaña.' };
  }
}

/**
 * Envía un correo de prueba de forma transaccional (SMTP) a un destinatario específico.
 */
export async function sendTestEmail(toEmail: string, subject: string, htmlContent: string) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return { success: false, error: error.message || 'Error al enviar email de prueba.' };
  }
}
