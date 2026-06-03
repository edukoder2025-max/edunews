import { isValidImageUrl } from './articleUtils';

/**
 * Scrapes og:image or twitter:image from the source article URL
 */
export async function scrapeOgImage(sourceUrl: string): Promise<string | null> {
  if (!sourceUrl) return null;
  try {
    const res = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    const html = await res.text();

    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
                    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

    if (ogMatch && ogMatch[1]) {
      let candidate = ogMatch[1].trim();
      // Handle relative paths and make them absolute
      if (candidate.startsWith('/')) {
        try {
          const parsed = new URL(candidate, sourceUrl);
          candidate = parsed.href;
        } catch {
          return null;
        }
      } else if (candidate.startsWith('//')) {
        candidate = `https:${candidate}`;
      }
      
      if (isValidImageUrl(candidate)) {
        return candidate;
      }
    }
  } catch (err) {
    console.error(`Error scraping og:image from ${sourceUrl}:`, err);
  }
  return null;
}

/**
 * Searches Wikimedia Commons for a free-to-use image matching keywords
 */
export async function searchWikimediaCommons(title: string): Promise<string | null> {
  if (!title) return null;
  try {
    // Extract keywords: words greater than 4 characters, excluding common Spanish/English stop words
    const stopWords = new Set(['sobre', 'contra', 'entre', 'desde', 'hasta', 'para', 'como', 'donde', 'cuando', 'quien', 'about', 'after', 'against']);
    const keywords = title
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^\w\s]/g, '') // remove punctuation
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 4 && !stopWords.has(w))
      .slice(0, 3) // take first 3 significant keywords
      .join(' ');

    if (!keywords) return null;

    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(keywords)}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url&format=json&origin=*`;
    const res = await fetch(url, {
      next: { revalidate: 86400 } // Cache searches for 24h
    });
    if (!res.ok) return null;
    const data = await res.json();

    if (data && data.query && data.query.pages) {
      const pages = data.query.pages;
      for (const key in pages) {
        const page = pages[key];
        if (page.imageinfo && page.imageinfo[0] && page.imageinfo[0].url) {
          const imageUrl = page.imageinfo[0].url;
          if (isValidImageUrl(imageUrl)) {
            return imageUrl;
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error querying Wikimedia Commons for title "${title}":`, err);
  }
  return null;
}

/**
 * Gets a relevant image for an article by attempting og:image scraping,
 * then Wikimedia Commons, and falling back to a query-specific Unsplash image
 */
export async function fetchRelevantImage(title: string, sourceUrl?: string): Promise<string | null> {
  // 1. Try to scrape the original source article
  if (sourceUrl) {
    const scraped = await scrapeOgImage(sourceUrl);
    if (scraped) return scraped;
  }

  // 2. Try Wikimedia Commons
  const wikimedia = await searchWikimediaCommons(title);
  if (wikimedia) return wikimedia;

  // 3. Fallback to Unsplash with a query instead of generic random seed if possible
  const stopWords = new Set(['sobre', 'contra', 'entre', 'desde', 'hasta', 'para', 'como', 'donde', 'cuando', 'quien', 'about', 'after', 'against']);
  const cleanKeyword = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 4 && !stopWords.has(w))
    .slice(0, 2)
    .join('-');

  if (cleanKeyword) {
    return `https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop&sig=${encodeURIComponent(cleanKeyword)}`;
  }

  return null;
}
