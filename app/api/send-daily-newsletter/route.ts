import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { buildArticleUrl } from '@/lib/articleUtils';
import { sendNewsletterCampaign } from '@/lib/brevo';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}

async function handleRequest(request: Request) {
  try {
    // 1. Validar la protección por CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Si CRON_SECRET está configurado, exigir la cabecera correspondiente
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Acceso no autorizado' },
        { status: 401 }
      );
    }

    // 2. Obtener las últimas 5 noticias neutralizadas de Supabase
    const { data: articles, error: dbError } = await supabase
      .from('news_articles')
      .select('id, ai_title, original_title, ai_content, original_content, category, published_at')
      .order('published_at', { ascending: false })
      .limit(5);

    if (dbError) {
      console.error('Error fetching articles for daily newsletter:', dbError);
      return NextResponse.json(
        { success: false, error: `Error en base de datos: ${dbError.message}` },
        { status: 500 }
      );
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay noticias recientes para compilar.' },
        { status: 400 }
      );
    }

    // 3. Formatear la fecha actual en español
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    // 4. Compilar los elementos de noticias en HTML
    const newsItemsHtml = articles.map(art => {
      const cleanSummary = (art.ai_content || art.original_content || '')
        .replace(/<[^>]*>/g, '') // Quitar HTML tags
        .substring(0, 320)
        .trim() + '...';
        
      const title = art.ai_title || art.original_title || 'Noticia sin título';
      const category = art.category || 'General';
      const link = buildArticleUrl(art.id, title, category, 'https://elironico.com');

      return `
        <div class="news-item">
          <div class="news-category">${category}</div>
          <a href="${link}" class="news-title">
            ${title}
          </a>
          <p class="news-summary">
            ${cleanSummary}
          </p>
          <div class="news-meta">
            <span class="bias-badge">✓ Sesgo neutralizado</span>
            <a href="${link}" class="read-link">Leer análisis completo →</a>
          </div>
        </div>
      `;
    }).join('\n');

    // 5. Construir el HTML final reemplazando las partes correspondientes
    const htmlTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>El Irónico – Resumen Diario</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&family=Courier+Prime:wght@400;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f0ede6;
      font-family: 'Source Serif 4', Georgia, serif;
      color: #1a1a18;
      -webkit-font-smoothing: antialiased;
    }

    .email-wrapper {
      background-color: #f0ede6;
      padding: 32px 16px;
    }

    .email-container {
      max-width: 620px;
      margin: 0 auto;
      background-color: #faf8f3;
      border: 1px solid #c8c4b8;
    }

    /* ── HEADER ── */
    .header {
      background-color: #1a1a18;
      padding: 0;
      text-align: center;
      border-bottom: 4px double #c8a84b;
    }

    .header-top {
      padding: 12px 32px 8px;
      border-bottom: 1px solid #333;
    }

    .header-meta {
      font-family: 'Courier Prime', 'Courier New', monospace;
      font-size: 10px;
      color: #888880;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-main {
      padding: 20px 32px 16px;
    }

    .logo-label {
      font-family: 'Courier Prime', monospace;
      font-size: 9px;
      color: #c8a84b;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .logo {
      font-family: 'Playfair Display', 'Times New Roman', serif;
      font-size: 52px;
      font-weight: 900;
      color: #faf8f3;
      letter-spacing: -1px;
      line-height: 1;
      margin-bottom: 4px;
    }

    .logo span {
      color: #c8a84b;
    }

    .tagline {
      font-family: 'Courier Prime', monospace;
      font-size: 10px;
      color: #888880;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      margin-top: 8px;
    }

    .header-stripe {
      background-color: #c8a84b;
      padding: 5px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-stripe span {
      font-family: 'Courier Prime', monospace;
      font-size: 9px;
      color: #1a1a18;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      font-weight: 700;
    }

    /* ── INTRO SECTION ── */
    .intro-section {
      padding: 28px 36px 20px;
      border-bottom: 3px double #c8c4b8;
    }

    .edition-label {
      font-family: 'Courier Prime', monospace;
      font-size: 9px;
      color: #888880;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }

    .intro-headline {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 700;
      color: #1a1a18;
      line-height: 1.2;
      margin-bottom: 10px;
    }

    .intro-body {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 14px;
      color: #4a4a46;
      line-height: 1.75;
    }

    /* ── SECTION TITLE ── */
    .section-header {
      padding: 0 36px;
      margin: 24px 0 0;
    }

    .section-title {
      font-family: 'Courier Prime', monospace;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #1a1a18;
      border-top: 2px solid #1a1a18;
      border-bottom: 1px solid #1a1a18;
      padding: 5px 0;
      margin-bottom: 0;
    }

    /* ── NEWS ITEMS ── */
    .news-list {
      padding: 0 36px;
    }

    .news-item {
      padding: 20px 0;
      border-bottom: 1px solid #d8d4cc;
    }

    .news-item:last-child {
      border-bottom: none;
    }

    .news-category {
      font-family: 'Courier Prime', monospace;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #c8a84b;
      margin-bottom: 6px;
    }

    .news-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a18;
      line-height: 1.25;
      margin-bottom: 8px;
      text-decoration: none;
      display: block;
    }

    .news-title:hover {
      color: #c8a84b;
    }

    .news-summary {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 13px;
      color: #4a4a46;
      line-height: 1.7;
      margin-bottom: 10px;
    }

    .news-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bias-badge {
      font-family: 'Courier Prime', monospace;
      font-size: 9px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background-color: #e8f4e8;
      color: #2d6e2d;
      border: 1px solid #a8d4a8;
      padding: 3px 8px;
      font-weight: 700;
    }

    .read-link {
      font-family: 'Courier Prime', monospace;
      font-size: 10px;
      color: #888880;
      text-decoration: none;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .read-link:hover { color: #1a1a18; }

    /* ── FEATURED QUOTE ── */
    .quote-section {
      margin: 4px 36px 0;
      padding: 20px 24px;
      border-left: 4px solid #c8a84b;
      background-color: #f0ede6;
    }

    .quote-label {
      font-family: 'Courier Prime', monospace;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #888880;
      margin-bottom: 10px;
    }

    .quote-text {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-style: italic;
      color: #1a1a18;
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .quote-source {
      font-family: 'Courier Prime', monospace;
      font-size: 10px;
      color: #888880;
    }

    /* ── AI ENGINE BOX ── */
    .ai-section {
      margin: 24px 36px;
      border: 1px solid #c8c4b8;
      padding: 18px 20px;
      background-color: #f5f2ea;
    }

    .ai-section-title {
      font-family: 'Courier Prime', monospace;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #888880;
      margin-bottom: 10px;
    }

    .ai-stats {
      display: flex;
      gap: 0;
    }

    .ai-stat {
      flex: 1;
      text-align: center;
      padding: 8px 0;
      border-right: 1px solid #c8c4b8;
    }

    .ai-stat:last-child { border-right: none; }

    .ai-stat-num {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 700;
      color: #1a1a18;
      display: block;
    }

    .ai-stat-label {
      font-family: 'Courier Prime', monospace;
      font-size: 9px;
      color: #888880;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    /* ── CTA ── */
    .cta-section {
      padding: 24px 36px;
      text-align: center;
      border-top: 3px double #c8c4b8;
      border-bottom: 3px double #c8c4b8;
    }

    .cta-title {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a18;
      margin-bottom: 8px;
    }

    .cta-body {
      font-family: 'Source Serif 4', serif;
      font-size: 13px;
      color: #4a4a46;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .cta-button {
      display: inline-block;
      background-color: #1a1a18;
      color: #faf8f3 !important;
      font-family: 'Courier Prime', monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      text-decoration: none;
      padding: 12px 28px;
      border: 2px solid #1a1a18;
    }

    /* ── FOOTER ── */
    .footer {
      background-color: #1a1a18;
      padding: 24px 36px;
      text-align: center;
    }

    .footer-logo {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 900;
      color: #faf8f3;
      letter-spacing: -0.5px;
      margin-bottom: 12px;
    }

    .footer-logo span { color: #c8a84b; }

    .footer-links {
      margin-bottom: 14px;
    }

    .footer-links a {
      font-family: 'Courier Prime', monospace;
      font-size: 9px;
      color: #888880;
      text-decoration: none;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin: 0 10px;
    }

    .footer-divider {
      border: none;
      border-top: 1px solid #333;
      margin: 14px 0;
    }

    .footer-legal {
      font-family: 'Courier Prime', monospace;
      font-size: 9px;
      color: #555550;
      letter-spacing: 0.08em;
      line-height: 1.7;
    }

    .footer-legal a {
      color: #888880;
      text-decoration: underline;
    }

    .unsubscribe {
      margin-top: 10px;
    }

    .unsubscribe a {
      font-family: 'Courier Prime', monospace;
      font-size: 9px;
      color: #666660;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    /* ── DIVIDER ── */
    .ornament {
      text-align: center;
      padding: 6px 0;
      font-family: 'Courier Prime', monospace;
      font-size: 11px;
      color: #c8c4b8;
      letter-spacing: 0.3em;
    }

    @media only screen and (max-width: 480px) {
      .email-wrapper { padding: 0; }
      .header-main { padding: 16px 20px 12px; }
      .logo { font-size: 38px; }
      .intro-section, .news-list, .section-header,
      .ai-section, .cta-section { padding-left: 20px; padding-right: 20px; }
      .quote-section { margin: 4px 20px 0; }
      .footer { padding: 20px; }
      .header-meta { flex-direction: column; gap: 3px; }
      .ai-stats { flex-direction: column; }
      .ai-stat { border-right: none; border-bottom: 1px solid #c8c4b8; }
      .ai-stat:last-child { border-bottom: none; }
    }
  </style>
</head>
<body>
<div class="email-wrapper">
<table class="email-container" width="100%" cellpadding="0" cellspacing="0" role="presentation">

  <!-- ═══ HEADER ═══ -->
  <tr>
    <td class="header">
      <div class="header-top">
        <div class="header-meta">
          <span>Edición Digital · Vol. I</span>
          <span>${capitalizedDate}</span>
          <span>Nº ${Math.floor(Math.random() * 200) + 100}</span>
        </div>
      </div>
      <div class="header-main">
        <div class="logo-label">Periodismo ético con inteligencia artificial</div>
        <div class="logo">Edu<span>News</span></div>
        <div class="tagline">Independiente &nbsp;·&nbsp; Objetivo &nbsp;·&nbsp; Verificable</div>
      </div>
      <div class="header-stripe">
        <span>Resumen Diario</span>
        <span>★ ★ ★</span>
        <span>Sesgo reducido 95.8%</span>
      </div>
    </td>
  </tr>

  <!-- ═══ INTRO ═══ -->
  <tr>
    <td class="intro-section">
      <div class="edition-label">Editorial del día</div>
      <div class="intro-headline">Las noticias que importan, sin la retórica que sobra</div>
      <p class="intro-body">
        Bienvenido a tu resumen diario de El Irónico. Esta edición reúne las cinco noticias más relevantes procesadas por nuestra IA con Gemini para eliminar el lenguaje sesgado y entregarte únicamente los hechos verificados. Sin clickbait, sin agenda política.
      </p>
    </td>
  </tr>

  <!-- ═══ NOTICIAS ═══ -->
  <tr>
    <td>
      <div class="section-header">
        <div class="section-title">Las noticias del día</div>
      </div>

      <div class="news-list">
        ${newsItemsHtml}
      </div>
    </td>
  </tr>

  <!-- ═══ QUOTE ═══ -->
  <tr>
    <td>
      <div class="ornament">— ✦ —</div>
      <div class="quote-section">
        <div class="quote-label">Cita de la semana</div>
        <p class="quote-text">"El periodismo es el primer borrador de la historia. El Irónico se asegura de que ese borrador no esté contaminado por el interés de quien lo escribe."</p>
        <div class="quote-source">— Redacción El Irónico</div>
      </div>
    </td>
  </tr>

  <!-- ═══ AI ENGINE ═══ -->
  <tr>
    <td>
      <div class="ai-section">
        <div class="ai-section-title">Motor IA — estadísticas de esta edición</div>
        <div class="ai-stats">
          <div class="ai-stat">
            <span class="ai-stat-num">5</span>
            <span class="ai-stat-label">Noticias procesadas</span>
          </div>
          <div class="ai-stat">
            <span class="ai-stat-num">95.8%</span>
            <span class="ai-stat-label">Sesgo reducido</span>
          </div>
          <div class="ai-stat">
            <span class="ai-stat-num">100%</span>
            <span class="ai-stat-label">Fuentes citadas</span>
          </div>
          <div class="ai-stat">
            <span class="ai-stat-num">IA</span>
            <span class="ai-stat-label">Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>
    </td>
  </tr>

  <!-- ═══ CTA ═══ -->
  <tr>
    <td class="cta-section">
      <div class="cta-title">¿Sabías que podés auditar cada nota?</div>
      <p class="cta-body">
        En cada artículo de El Irónico podés comparar el texto neutralizado con la fuente original y ver exactamente qué cambió nuestra IA. Transparencia radical, sin letra chica.
      </p>
      <a href="https://elironico.com/como-funciona" class="cta-button">Ver cómo funciona la IA</a>
    </td>
  </tr>

  <!-- ═══ FOOTER ═══ -->
  <tr>
    <td class="footer">
      <div class="footer-logo">Edu<span>News</span></div>
      <div class="footer-links">
        <a href="https://elironico.com/">Portada</a>
        <a href="https://elironico.com/categoria/argentina">Argentina</a>
        <a href="https://elironico.com/categoria/mundo">Mundo</a>
        <a href="https://elironico.com/categoria/economia">Economía</a>
        <a href="https://elironico.com/nosotros">Quiénes Somos</a>
      </div>
      <hr class="footer-divider">
      <div class="footer-legal">
        Estás recibiendo este email porque te suscribiste en <a href="https://elironico.com">elironico.com</a><br>
        © 2026 El Irónico · Todos los derechos reservados<br>
        Las noticias son extraídas de fuentes públicas y reescritas bajo principios de neutralidad por IA.
      </div>
      <div class="unsubscribe">
        <a href="{{ unsubscribeLink }}">Cancelar suscripción</a>
        &nbsp;·&nbsp;
        <a href="{{ updateProfileLink }}" style="color:#666660;font-family:'Courier Prime',monospace;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;">Actualizar preferencias</a>
      </div>
    </td>
  </tr>

</table>
</div>
</body>
</html>`;

    // 6. Enviar campaña a través de Brevo
    const subject = `El Irónico – Resumen Diario: ${capitalizedDate}`;
    const result = await sendNewsletterCampaign(subject, htmlTemplate);

    if (!result.success) {
      throw new Error(result.error || 'Error al enviar la campaña de Brevo.');
    }

    return NextResponse.json({
      success: true,
      message: 'Boletín de noticias diario enviado con éxito.',
      campaignId: result.campaignId,
      date: capitalizedDate
    });

  } catch (error: any) {
    console.error('API Send Daily Newsletter Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error general en el servidor.' },
      { status: 500 }
    );
  }
}
