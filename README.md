# elironico

Dominio: elironico.com

## Google Indexing and Search Console Integration

This project supports server-side Search Console sitemap submission and Google Indexing API requests through secure environment variables.

### Environment variables

- `NEXT_PUBLIC_SITE_URL` - your production site URL, e.g. `https://elironico.com`
- `GOOGLE_SEARCH_CONSOLE_API_KEY` - Search Console API key for `sitemaps.submit`
- `GOOGLE_SEARCH_CONSOLE_SITE_URL` - Search Console property URL, typically the same as `NEXT_PUBLIC_SITE_URL`
- `GOOGLE_INDEXING_SERVICE_ACCOUNT` - service account JSON string for the Indexing API
- `GOOGLE_INDEXING_SERVICE_ACCOUNT_BASE64` - optional base64-encoded service account JSON

### API routes

- `GET /api/ping-sitemap` - ping Google and Bing sitemap endpoints
- `GET /api/google-search-console/submit-sitemap` - submit the site`s sitemap directly to Google Search Console
- `POST /api/google-indexing` - publish a URL update or deletion to Google Indexing API

### Example Indexing request

```bash
curl -X POST https://elironico.com/api/google-indexing \
  -H "Content-Type: application/json" \
  -d '{"url":"https://elironico.com/noticias/some-article","type":"URL_UPDATED"}'
```
