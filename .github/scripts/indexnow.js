#!/usr/bin/env node
const SITE_URL = process.env.SITE_URL
const INDEXNOW_KEY = process.env.INDEXNOW_KEY
const KEY_LOCATION = process.env.KEY_LOCATION || (SITE_URL ? `${SITE_URL.replace(/\/$/, '')}/${INDEXNOW_KEY}.txt` : undefined)

if (!SITE_URL || !INDEXNOW_KEY) {
  console.error('Missing SITE_URL or INDEXNOW_KEY environment variables')
  process.exit(1)
}

async function main() {
  try {
    const sitemapUrl = `${SITE_URL.replace(/\/$/, '')}/sitemap.xml`
    console.log('Fetching sitemap:', sitemapUrl)
    const res = await fetch(sitemapUrl)
    if (!res.ok) {
      console.error('Failed to fetch sitemap:', res.status)
      process.exit(1)
    }
    const xml = await res.text()
    const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    const urls = matches.map(m => m[1]).filter(Boolean)
    if (urls.length === 0) {
      console.log('No URLs found in sitemap')
      return
    }

    const payload = {
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls.slice(0, 100)
    }

    console.log('Submitting', payload.urlList.length, 'URLs to IndexNow')
    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    })

    const text = await r.text()
    console.log('IndexNow response code:', r.status)
    console.log(text)
    if (!r.ok) process.exit(1)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()
