import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const urlList: string[] = Array.isArray(body.urlList)
      ? body.urlList
      : body.url
      ? [body.url]
      : []

    if (urlList.length === 0) return NextResponse.json({ error: 'Missing url or urlList' }, { status: 400 })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) return NextResponse.json({ error: 'NEXT_PUBLIC_SITE_URL not set' }, { status: 500 })

    const indexKey = process.env.INDEXNOW_KEY || '02185f83b50749a28c480e57ea54180d'
    const keyLocation = `${siteUrl.replace(/\/$/, '')}/${indexKey}.txt`
    const host = new URL(siteUrl).host

    const payload = { host, key: indexKey, keyLocation, urlList }

    const resp = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    })

    const text = await resp.text()
    const status = resp.status
    let parsed: any
    try { parsed = JSON.parse(text) } catch { parsed = text }

    return NextResponse.json({ status, response: parsed }, { status })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 })
  }
}
