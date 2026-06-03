export function slugify(text: string) {
  if (!text) return 'noticia';
  const slug = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return slug.substring(0, 80) || 'noticia';
}

function normalizePotentialImageUrl(url: string, baseUrl?: string) {
  let normalized = String(url || '').trim();

  if (!normalized) return '';

  normalized = normalized.replace(/^['"]+|['"]+$/g, '');
  normalized = normalized.replace(/&amp;/g, '&');
  normalized = normalized.replace(/\s+/g, '');

  if (normalized.startsWith('//')) {
    normalized = `https:${normalized}`;
  }

  if (normalized.startsWith('/')) {
    if (!baseUrl) return '';
    try {
      normalized = new URL(normalized, baseUrl).href;
    } catch {
      return '';
    }
  }

  return normalized;
}

// Known CDN / image domains that serve images without file extensions
const TRUSTED_IMAGE_DOMAINS = [
  'ichef.bbci.co.uk',
  'media.ambito.com',
  'infobae.com',
  'clarin.com',
  'pagina12.com.ar',
  'lanacion.com.ar',
  'cronista.com',
  'telam.com.ar',
  'lavoz.com.ar',
  'elcomercio.pe',
  'eluniversal.com',
  'elpais.com',
  'elmundo.es',
  'cdn.cnn.com',
  'static01.nyt.com',
  'upload.wikimedia.org',
  'images.bbc.com',
  'scontent',       // Facebook CDN
  'pbs.twimg.com',  // Twitter CDN
  'i.imgur.com',
];

export function isValidImageUrl(url: string) {
  const normalized = normalizePotentialImageUrl(url);
  if (!normalized) return false;

  const lowerUrl = normalized.toLowerCase();
  const forbiddenPatterns = [
    'data:',
    'javascript:',
    'vbscript:',
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'player',
    '/embed/',
    'vodgc.net',
  ];

  if (forbiddenPatterns.some((pattern) => lowerUrl.includes(pattern))) {
    return false;
  }

  // Accept URLs with known image extensions
  if (/^https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i.test(lowerUrl)) {
    return true;
  }

  // Accept URLs from trusted image CDN / news domains even without explicit extension
  try {
    const urlObj = new URL(normalized);
    if (TRUSTED_IMAGE_DOMAINS.some(d => urlObj.hostname.includes(d))) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function buildArticleUrl(articleId: string, title: string, baseUrl?: string) {
  const slug = slugify(title || 'noticia');
  const path = `/news/${articleId}${slug ? `-${slug}` : ''}`;
  return baseUrl ? `${baseUrl.replace(/\/$/, '')}${path}` : path;
}

export function extractArticleId(pathParam: string) {
  if (!pathParam) return pathParam;

  const uuidMatch = pathParam.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
  if (uuidMatch) {
    return uuidMatch[0];
  }

  const parts = pathParam.split('-');
  if (parts.length > 1 && /^[0-9]+$/.test(parts[0])) {
    return parts[0];
  }

  return pathParam;
}

export function getArticleImage(article: {
  image_url?: string;
  ai_title?: string;
  original_title?: string;
  category?: string;
  id?: string;
}) {
  const normalizedImageUrl = normalizePotentialImageUrl(article.image_url || '');
  if (normalizedImageUrl && isValidImageUrl(normalizedImageUrl)) {
    return normalizedImageUrl;
  }

  const seed = slugify(article.ai_title || article.original_title || article.category || article.id || 'noticia');
  return `https://images.unsplash.com/seed/${encodeURIComponent(seed)}?q=80&w=1200&auto=format&fit=crop`;
}
