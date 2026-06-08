import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getGeminiModel } from '@/lib/gemini';
import { sendNewsletterCampaign, sendTestEmail } from '@/lib/brevo';

export async function POST(request: Request) {
  try {
    const { sendToAll, previewEmail, newsletterType = 'daily' } = await request.json().catch(() => ({}));

    // 1. Obtener las últimas 5 noticias neutralizadas de Supabase
    const { data: articles, error: dbError } = await supabase
      .from('news_articles')
      .select('id, ai_title, ai_content, category, published_at')
      .order('published_at', { ascending: false })
      .limit(5);

    if (dbError) {
      console.error('Error fetching articles for newsletter:', dbError);
      return NextResponse.json({ success: false, error: 'Error al obtener noticias de la base de datos.' }, { status: 500 });
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({ success: false, error: 'No hay noticias recientes para compilar.' }, { status: 400 });
    }

    // 2. Preparar el prompt para Gemini para generar el HTML del boletín
    const articlesData = articles.map((art, idx) => ({
      idx: idx + 1,
      id: art.id,
      title: art.ai_title,
      category: art.category,
      snippet: art.ai_content.replace(/<[^>]*>/g, '').slice(0, 300) + '...'
    }));

    let prompt = '';
    let targetListName = 'Boletín El Irónico'; // Default daily list

    if (newsletterType === 'plus') {
      targetListName = 'El Irónico - Plan Plus';
      prompt = `
      Eres el Redactor Jefe del portal El Irónico. Tu tarea es compilar las últimas noticias neutralizadas en nuestro boletín semanal exclusivo \"El Irónico - Plus Report\" (Plan Plus) en formato HTML responsivo.
      
      Noticias de la semana a incluir:
      ${JSON.stringify(articlesData, null, 2)}
      
      Este boletín es PREMIUM (de pago) y tiene un valor de ARS 8.000 mensual. Para justificar este precio, DEBES incluir una sección especial llamada \"EXCLUSIVO IA: Análisis de Sesgo Profundo\".
      
      Lineamientos de contenido y diseño del correo:
      1. Estilo Visual: Utiliza una estética tecnológica y analítica premium. Fondo muy oscuro (#090d16), panel del cuerpo del mensaje en gris oscuro (#111827) y bordes muy finos en color gris claro o blanco/5%.
      2. Color de acento: Cian eléctrico (#00e5ff) y azul cobalto (#2979ff). Los botones, badges de categoría y decoraciones deben usar este acento cian.
      3. Cabecera: Título grande y elegante \"EL IRÓNICO // PLUS REPORT\" con el subtítulo \"Inteligencia Fáctica y Auditoría de Medios\".
      4. Sección \"EXCLUSIVO IA: Análisis de Sesgo Profundo\":
         - Analiza cómo las cadenas tradicionales y medios hegemónicos manipularon o sesgaron la cobertura de las noticias de esta semana.
         - Presenta un desglose detallado (ej: comparando qué palabras cargadas usaron otros medios frente a los hechos puros que publicamos nosotros).
         - Haz que esta sección sea sumamente reveladora, objetiva y valiosa para el lector.
      5. Listado de noticias: Muestra cada una de las 5 noticias en formato tarjeta con badge de categoría en cian. Los enlaces de títulos deben apuntar a \"https://elironico.com/noticias/[CATEGORIA]/[SLUG]-[ID_DE_LA_NOTICIA]\".
      6. Pie de página: Misión del sitio, contacto (edukoder2025@gmail.com) y enlaces legales.
      7. Asegúrate de usar estilos CSS en línea (inline-styles) y compatibilidad móvil completa.
      
      Responde estrictamente en formato JSON con la siguiente estructura:
      {
        \"subject\": \"🔥 El Irónico Plus Report: Análisis de Sesgo y Resumen Semanal\",
        \"htmlContent\": \"código HTML completo del correo\"
      }
      `;
    } else if (newsletterType === 'premium') {
      targetListName = 'El Irónico - Plan Premium (Lifetime)';
      prompt = `
      Eres el Redactor Jefe de El Irónico. Tu tarea es compilar las últimas noticias neutralizadas en nuestro boletín de élite semanal \"El Irónico - Premium Intelligence\" (Acceso Lifetime) en formato HTML responsivo.
      
      Noticias de la semana a incluir:
      ${JSON.stringify(articlesData, null, 2)}
      
      Este boletín es el de MÁS ALTO VALOR de nuestro portal (de pago, acceso de por vida) y tiene un valor de ARS 15.000. Para justificar este precio premium, DEBES incluir dos secciones de altísimo nivel:
      1. \"EXCLUSIVO IA: Análisis de Sesgo Profundo\": Auditoría objetiva del framing manipulador de los medios hegemónicos esta semana.
      2. \"EXCLUSIVO IA: Predicción de Narrativas & Tendencias de Desinformación\": Un análisis donde la IA prevé las próximas narrativas mediáticas y focos de propaganda en base al panorama actual, junto con guías de qué detalles auditar en los próximos días.
      
      Lineamientos de contenido y diseño del correo:
      1. Estilo Visual: Estética de editorial tradicional de lujo. Fondo midnight ultra oscuro (#050814), cuerpo en azul marino profundo/grisáceo (#0e1424), tipografía serif de alta alcurnia y detalles dorados (#d4af37 / #aa8010).
      2. Color de acento: Oro brillante (#d4af37) y blanco roto (#faf8f3) para textos.
      3. Cabecera: Título imponente \"EL IRÓNICO – PREMIUM INTELLIGENCE\" con el subtítulo \"Análisis Geopolítico & Pronóstico de Narrativas\".
      4. Sección \"EXCLUSIVO IA: Análisis de Sesgo Profundo\".
      5. Sección \"EXCLUSIVO IA: Predicción de Narrativas & Tendencias de Desinformación\".
      6. Listado de noticias: Con diseño clásico y distinguido. Los enlaces de títulos deben apuntar a \"https://elironico.com/noticias/[CATEGORIA]/[SLUG]-[ID_DE_LA_NOTICIA]\".
      7. Pie de página: Misión del sitio, contacto (edukoder2025@gmail.com) y enlaces legales.
      8. Asegúrate de usar estilos CSS en línea (inline-styles) y compatibilidad móvil completa.
      
      Responde estrictamente en formato JSON con la siguiente estructura:
      {
        \"subject\": \"✨ El Irónico Premium Intelligence: Predicción de Narrativas y Análisis de Medios\",
        \"htmlContent\": \"código HTML completo del correo\"
      }
      `;
    } else {
      // daily (default)
      prompt = `
      Eres el Redactor Jefe del portal El Irónico. Tu tarea es compilar las últimas noticias neutralizadas en un boletín diario de email marketing para nuestros suscriptores.
      
      Noticias del día a incluir:
      ${JSON.stringify(articlesData, null, 2)}
      
      Genera un correo HTML responsivo, limpio y estéticamente premium.
      
      Lineamientos de diseño del correo:
      1. Fondo oscuro: usa un color gris oscuro para el fondo general del email (#0b0f19) y un panel interno un poco más claro (#131924) para el cuerpo del mensaje.
      2. Colores de acento: Rojo brillante (#ff3838) y Cyan eléctrico (#00d2d3).
      3. Cabecera: Incluir el título grande "El Irónico" (estilo periódico, elegante) con el subtítulo "Boletín Diario · Periodismo sin Sesgos".
      4. Introducción: Un saludo breve, inteligente y neutral que invite a la lectura fáctica del día.
      5. Listado de noticias:
         - Muestra cada una de las noticias en tarjetas ordenadas.
         - Incluye la categoría en mayúsculas como un badge con su color respectivo (p. ej., Economía: verde, Deportes: naranja, Tecnología: magenta, Argentina: celeste, Mundo: rojo).
         - El título del artículo debe ser un enlace que apunte a "https://elironico.com/noticias/[CATEGORIA]/[SLUG]-[ID_DE_LA_NOTICIA]".
         - Muestra el resumen neutralizado.
      6. Pie de página: Añadir información sobre la misión del sitio (periodismo objetivo con IA) y el enlace de contacto edukoder2025@gmail.com.
      7. Compatibilidad: Asegúrate de usar estilos CSS en línea (inline-styles) y tablas si es necesario, de modo que se renderice a la perfección tanto en dispositivos móviles como en Gmail, Outlook, Apple Mail, etc.
      
      Responde estrictamente en formato JSON con la siguiente estructura:
      {
        "subject": "Boletín Diario El Irónico: Resumen del [Fecha de Hoy en español]",
        "htmlContent": "código HTML completo del correo"
      }
      `;
    }

    // 3. Generar el correo con Gemini
    const model = getGeminiModel(false);
    const geminiRes = await model.generateContent(prompt);
    const responseText = geminiRes.response.text();
    
    // Limpiar posibles markdown fences del JSON
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    const digestData = JSON.parse(cleanText);

    const { subject, htmlContent } = digestData;

    // 4. Enviar
    if (previewEmail) {
      // Envío de prueba (SMTP transaccional)
      const testResult = await sendTestEmail(previewEmail, `[PREVIEW] ${subject}`, htmlContent);
      if (!testResult.success) {
        throw new Error(testResult.error || 'Error al enviar email de prueba.');
      }
      return NextResponse.json({
        success: true,
        previewSent: true,
        recipient: previewEmail,
        subject: `[PREVIEW] ${subject}`,
        html: htmlContent
      });
    }

    if (sendToAll) {
      // Obtener o crear la lista de Brevo dinámicamente
      const { getOrCreateListByName } = await import('@/lib/brevo');
      const listId = await getOrCreateListByName(targetListName);

      if (!listId) {
        throw new Error(`No se pudo obtener o crear la lista de Brevo: "${targetListName}"`);
      }

      // Envío masivo real (Campaña Brevo a la lista correspondiente)
      const campaignResult = await sendNewsletterCampaign(subject, htmlContent, listId);
      if (!campaignResult.success) {
        throw new Error(campaignResult.error || 'Error al enviar la campaña de Brevo.');
      }
      return NextResponse.json({
        success: true,
        campaignSent: true,
        campaignId: campaignResult.campaignId,
        subject
      });
    }

    // Si no se especifica ninguna acción de envío, solo devolver la previsualización generada
    return NextResponse.json({
      success: true,
      previewOnly: true,
      subject,
      html: htmlContent
    });

  } catch (error: any) {
    console.error('API Newsletter Send Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error general en el servidor.' }, { status: 500 });
  }
}
