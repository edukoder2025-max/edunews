// lib/adSlots.ts
// Configuración de slots de anuncios para Google AdSense
// Cada slot debe ser creado previamente en https://adsense.google.com

export const AD_SLOTS = {
  // Anuncios en la portada
  HOMEPAGE_TOP: '1234567890',        // Banner en la parte superior
  HOMEPAGE_SIDEBAR: '0987654321',    // Lateral derecho
  
  // Anuncios en páginas de artículos
  ARTICLE_TOP: '1122334455',         // Encima del artículo
  ARTICLE_MIDDLE: '5544332211',      // Entre párrafos (native ads)
  ARTICLE_BOTTOM: '6677889900',      // Al final del artículo
  
  // Anuncios en categorías
  CATEGORY_TOP: '2233445566',        // Encima de la lista de noticias
  CATEGORY_SIDEBAR: '6655443322',    // Lateral en categorías
  
  // Anuncios en búsqueda
  SEARCH_TOP: '3344556677',          // Encima de resultados
  SEARCH_SIDEBAR: '7766554433',      // Lateral en búsqueda
};

/**
 * INSTRUCCIONES PARA CREAR SLOTS EN GOOGLE ADSENSE:
 * 
 * 1. Ve a https://adsense.google.com
 * 2. En el menú izquierdo, ve a "Anuncios" → "Por sitio"
 * 3. Selecciona tu sitio (elironico.com)
 * 4. Haz clic en "+ Nuevo código de anuncio"
 * 5. Elige el tipo de anuncio (Display, In-article, etc.)
 * 6. Copia el ID del slot que aparece en el código generado
 * 7. Actualiza los valores en AD_SLOTS arriba
 * 
 * RECOMENDACIONES DE UBICACIÓN:
 * - Portada: 2-3 anuncios máximo (top banner, sidebar)
 * - Artículos: 3-4 anuncios (top, middle, bottom)
 * - Categorías: 2 anuncios (top, sidebar)
 * 
 * FORMATOS RECOMENDADOS:
 * - Banner horizontal (728x90, 970x90)
 * - Cuadrado (300x250, 336x280)
 * - Vertical (120x600, 160x600, 300x600)
 * - Responsive: auto (se adapta al dispositivo)
 */
