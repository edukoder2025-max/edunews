// lib/seoUtils.ts
// Utilidades para generar descripciones SEO dinámicas y keyword-rich

export function generateCategoryKeywords(category: string): string {
  const cat = (category || '').toLowerCase().trim();
  
  const categoryKeywords: Record<string, string> = {
    'mundo': 'noticias internacionales, mundo, geopolítica, noticias globales',
    'argentina': 'noticias Argentina, política Argentina, economía Argentina, Argentina',
    'tecnología': 'tecnología, innovación, gadgets, ciencia y tecnología, startups',
    'economía': 'economía, finanzas, mercados, negocios, inversión, cotizaciones',
    'deportes': 'deportes, fútbol, deporte, competiciones, atletas',
    'ciencia': 'ciencia, investigación, descubrimientos, salud, medicina',
    'cultura': 'cultura, arte, entretenimiento, cine, música',
  };

  for (const [key, keywords] of Object.entries(categoryKeywords)) {
    if (cat.includes(key)) {
      return keywords;
    }
  }
  return 'noticias, periodismo, información';
}

export function generateArticleDescription(
  title: string,
  content: string,
  category: string
): string {
  // Limpiar el contenido
  const cleanContent = (content || '')
    .replace(/<[^>]*>/g, '') // Remover HTML
    .replace(/\n+/g, ' ') // Remover saltos de línea
    .replace(/\s+/g, ' ') // Remover espacios múltiples
    .trim();

  // Tomar primeras 155 caracteres para meta description (recomendado 155-160)
  let description = cleanContent.substring(0, 155);
  
  // Asegurar que no corte en medio de una palabra
  const lastSpace = description.lastIndexOf(' ');
  if (lastSpace > 0 && description.length > 140) {
    description = description.substring(0, lastSpace);
  }

  description = description + '...';
  
  return description;
}

export function generateArticleTitle(title: string, category: string): string {
  // Formato: "Título | Categoría | El Irónico" (máximo ~60 caracteres para SEO)
  const baseTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
  return `${baseTitle} - ${category || 'Noticias'} | El Irónico`;
}

export function generateSitemapDescription(category: string): string {
  const descriptions: Record<string, string> = {
    'mundo': 'Últimas noticias internacionales sin sesgo',
    'argentina': 'Noticias de Argentina neutralizadas por IA',
    'tecnología': 'Últimas noticias de tecnología e innovación',
    'economía': 'Noticias de economía, finanzas y mercados',
    'deportes': 'Cobertura de deportes y competiciones',
    'ciencia': 'Descubrimientos científicos y de salud',
    'cultura': 'Noticias de cultura, arte y entretenimiento',
  };

  const cat = (category || '').toLowerCase().trim();
  for (const [key, desc] of Object.entries(descriptions)) {
    if (cat.includes(key)) {
      return desc;
    }
  }
  return 'Noticias de Argentina y el mundo';
}
