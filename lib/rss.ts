import Parser from 'rss-parser';
import { isValidImageUrl } from '@/lib/articleUtils';

type CustomItem = {
  content?: string;
  'content:encoded'?: string;
  description?: string;
  enclosure?: any;
  'media:content'?: any;
  'media:group'?: any;
  'media:thumbnail'?: any;
  itunes?: any;
  image?: any;
  link?: string;
  [key: string]: any;
};

const parser = new Parser<any, CustomItem>({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
  customFields: {
    item: [
      'content:encoded',
      'media:content',
      'media:group',
      'media:thumbnail',
      'itunes:image',
      'image',
    ],
  },
});

function normalizeImageUrl(url: string, baseUrl: string) {
  let normalized = String(url || '').trim();
  if (!normalized) return '';

  normalized = normalized.replace(/^['"]+|['"]+$/g, '');
  normalized = normalized.replace(/&amp;/g, '&');
  normalized = normalized.replace(/\s+/g, '');

  if (normalized.startsWith('//')) {
    normalized = `https:${normalized}`;
  }

  if (normalized.startsWith('/')) {
    try {
      normalized = new URL(normalized, baseUrl).href;
    } catch {
      return '';
    }
  }

  return normalized;
}

function pickUrlFromField(field: any): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (Array.isArray(field)) {
    for (const item of field) {
      const candidate = pickUrlFromField(item);
      if (candidate) return candidate;
    }
    return '';
  }
  if (typeof field === 'object') {
    return field.url || field.href || field?.['$']?.url || '';
  }
  return '';
}

export async function fetchRssFeed(feedUrl: string) {
  try {
    const feed = await parser.parseURL(feedUrl);

    const articles = feed.items.map((item: any) => {
      let imageUrl = '';

      imageUrl = pickUrlFromField(item.enclosure) ||
        pickUrlFromField(item['media:content']) ||
        pickUrlFromField(item['media:group']?.['media:content']) ||
        pickUrlFromField(item['media:thumbnail']) ||
        pickUrlFromField(item.itunes?.image) ||
        pickUrlFromField(item.image);

      if (!imageUrl) {
        const fullContent = (item['content:encoded'] || item.content || item.description || '');
        const imgMatch = fullContent.match(/<img[^>]+src=["']([^"'>]+\.(?:jpg|jpeg|gif|png|webp|avif|svg)(?:\?[^"'>]*)?)["']/i);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
        }
      }

      if (imageUrl) {
        imageUrl = normalizeImageUrl(imageUrl, feedUrl);
        if (!isValidImageUrl(imageUrl)) {
          imageUrl = '';
        }
      }

      return {
        title: item.title || '',
        link: item.link || '',
        content: item['content:encoded'] || item.content || item.description || '',
        pubDate: item.pubDate || '',
        imageUrl,
        sourceName: feed.title || 'Unknown Source',
      };
    });

    return articles;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${feedUrl}:`, error);
    return [];
  }
}
