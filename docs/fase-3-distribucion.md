# Fase 3 — distribución y medición

## Cambios incorporados

- Se creó `lib/marketingUrls.ts` para generar enlaces UTM consistentes.
- Los botones de compartir en X, Facebook y WhatsApp usan etiquetas UTM diferentes.
- Los clics en los botones de compartir emiten el evento `share` de Google Analytics cuando GA4 está configurado.
- Copiar el enlace conserva la URL canónica limpia, sin parámetros de campaña.
- El boletín diario agrega `utm_source=newsletter`, `utm_medium=email`, `utm_campaign=daily_digest` y un identificador por artículo.
- Los boletines generados con IA reciben la URL etiquetada de cada noticia y deben usar ese campo exacto.

## Convención de campañas

- Redes: `utm_medium=social`.
- Email: `utm_medium=email`.
- La fuente identifica el canal (`x`, `instagram`, `facebook`, `whatsapp`, `newsletter`).
- La campaña identifica el formato (`article_share`, `daily_digest`, `weekly_digest`).
- `utm_content` identifica la pieza o el artículo.

## Siguiente control

Revisar en GA4 y Search Console qué canales generan visitas y ajustar la frecuencia de Buffer sin publicar contenido duplicado. Las publicaciones ya existentes no se modifican retroactivamente.
