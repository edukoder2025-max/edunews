import Parser from 'rss-parser';

type CustomItem = {
  content?: string;
  'content:encoded'?: string;
  description?: string;
  enclosure?: { url: string };
  'media:content'?: { $: { url: string } };
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
    ],
  },
});

export async function fetchRssFeed(feedUrl: string) {
  try {
    const feed = await parser.parseURL(feedUrl);

    const articles = feed.items.map((item: any) => {
      // Búsqueda exhaustiva de imágenes
      let imageUrl = '';
      
      // 1. Intentar con enclosure (estándar)
      if (item.enclosure?.url) {
        imageUrl = item.enclosure.url;
      } 
      // 2. Intentar con media:content (estándar extendido)
      else if (item['media:content']?.$?.url) {
        imageUrl = item['media:content'].$.url;
      }
      else if (Array.isArray(item['media:content'])) {
        imageUrl = item['media:content'][0]?.$?.url;
      }
      // 3. Intentar con media:thumbnail
      else if (item['media:thumbnail']?.$?.url) {
        imageUrl = item['media:thumbnail'].$.url;
      }
      // 4. Búsqueda por Regex en el contenido (HTML)
      else {
        const fullContent = (item['content:encoded'] || item.content || item.description || '');
        // Buscamos la primera etiqueta <img> que tenga una URL absoluta
        const imgMatch = fullContent.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
        }
      }

      return {
        title: item.title || '',
        link: item.link || '',
        content: item['content:encoded'] || item.content || item.description || '',
        pubDate: item.pubDate || '',
        imageUrl: imageUrl,
        sourceName: feed.title || 'Unknown Source'
      };
    });

    return articles;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${feedUrl}:`, error);
    return [];
  }
}
