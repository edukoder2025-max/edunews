import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getGeminiModel } from '@/lib/gemini';
import { sendNewsletterCampaign, sendTestEmail } from '@/lib/brevo';

export async function POST(request: Request) {
  try {
    const { sendToAll, previewEmail } = await request.json().catch(() => ({}));

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

    const prompt = `
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
       - El título del artículo debe ser un enlace que apunte a "https://elironico.com/news/[ID_DE_LA_NOTICIA]-[SLUG]" o la forma SEO-friendly equivalente.
       - Muestra el resumen neutralizado.
    6. Pie de página: Añadir información sobre la misión del sitio (periodismo objetivo con IA) y el enlace de contacto edukoder2025@gmail.com.
    7. Compatibilidad: Asegúrate de usar estilos CSS en línea (inline-styles) y tablas si es necesario, de modo que se renderice a la perfección tanto en dispositivos móviles como en Gmail, Outlook, Apple Mail, etc.
    
    Responde estrictamente en formato JSON con la siguiente estructura:
    {
      "subject": "Boletín Diario El Irónico: Resumen del [Fecha de Hoy en español]",
      "htmlContent": "código HTML completo del correo"
    }
    `;

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
      // Envío masivo real (Campaña Brevo)
      const campaignResult = await sendNewsletterCampaign(subject, htmlContent);
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
