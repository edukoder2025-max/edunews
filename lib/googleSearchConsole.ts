export async function submitSitemapToSearchConsole(siteUrl: string, sitemapUrl: string, accessToken: string) {
  const siteId = encodeURIComponent(siteUrl.replace(/\/$/, ''));
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${siteId}/sitemaps/${encodeURIComponent(sitemapUrl)}`;

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/xml',
    },
  });

  const payload = await response.text();
  let json: unknown;

  try {
    json = response.ok ? JSON.parse(payload || '{}') : JSON.parse(payload);
  } catch {
    json = { body: payload };
  }

  return {
    status: response.status,
    ok: response.ok,
    response: json,
    sitemapUrl,
    siteUrl,
    endpoint,
  };
}
