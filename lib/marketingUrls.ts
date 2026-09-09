export type MarketingChannel = 'x' | 'facebook' | 'whatsapp' | 'instagram' | 'newsletter' | 'direct';

/** Agrega etiquetas UTM sin alterar el destino editorial del artículo. */
export function withMarketingUtm(
  rawUrl: string,
  channel: MarketingChannel,
  campaign = 'article_distribution',
  content?: string,
) {
  try {
    const url = new URL(rawUrl);
    url.searchParams.set('utm_source', channel);
    url.searchParams.set('utm_medium', channel === 'newsletter' ? 'email' : 'social');
    url.searchParams.set('utm_campaign', campaign);
    if (content) url.searchParams.set('utm_content', content);
    return url.toString();
  } catch {
    return rawUrl;
  }
}
