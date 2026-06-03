import Image from 'next/image';

type StoreProduct = {
  title: string;
  href: string;
  image?: string;
  price?: string;
};

async function fetchStoreProducts(): Promise<StoreProduct[]> {
  const baseUrl = 'https://www.bolushop.com';
  const url = `${baseUrl}/productos`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];

    const html = await res.text();
    const products: StoreProduct[] = [];

    const jsonLdMatches = Array.from(html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match[1]);
        const entries = Array.isArray(data) ? data : [data];

        for (const item of entries) {
          if (!item || item['@type'] !== 'Product') continue;
          products.push({
            title: item.name || item.headline || 'Producto Bolushop',
            href: item.url ? new URL(item.url, baseUrl).toString() : url,
            image: item.image
              ? Array.isArray(item.image)
                ? new URL(item.image[0], baseUrl).toString()
                : new URL(item.image, baseUrl).toString()
              : undefined,
            price: item.offers?.price
              ? `${item.offers.price} ${item.offers.priceCurrency || ''}`.trim()
              : undefined,
          });
        }
      } catch {
        continue;
      }
    }

    if (products.length > 0) {
      return products.slice(0, 8);
    }

    const anchorPattern = /<a[^>]+href=["'](\/producto[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;

    while ((match = anchorPattern.exec(html)) && products.length < 12) {
      const href = match[1];
      const block = match[2];
      const titleMatch = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
      const imageMatch = block.match(/<img[^>]+src=["']([^"']+)["']/i);
      const priceMatch = block.match(/\$\s*([0-9.,]+)/);

      if (!titleMatch) continue;

      const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      if (!title) continue;

      products.push({
        title,
        href: new URL(href, baseUrl).toString(),
        image: imageMatch ? new URL(imageMatch[1], baseUrl).toString() : undefined,
        price: priceMatch ? `$${priceMatch[1].trim()}` : undefined,
      });
    }

    return products.slice(0, 8);
  } catch (error) {
    console.error('Error fetching store products:', error);
    return [];
  }
}

export default async function ProductsCarousel() {
  const products = await fetchStoreProducts();
  const visibleProducts = products.slice(0, 3);
  if (!visibleProducts.length) return null;

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/90 p-5 shadow-2xl shadow-black/30">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-black mb-1">Patrocinado</p>
          <h3 className="text-lg font-black text-white">Recomendaciones ligeras</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
            Productos seleccionados que ayudan a sostener el periodismo independiente.
          </p>
        </div>
        <a
          href="https://www.bolushop.com/productos"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] uppercase tracking-[0.32em] text-primary font-black hover:text-secondary transition"
        >
          Ver tienda
        </a>
      </div>

      <div className="space-y-3">
        {visibleProducts.map((product, index) => (
          <a
            key={`${product.href}-${index}`}
            href={product.href}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-3xl border border-white/10 bg-slate-900/80 p-3 transition hover:border-primary"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-950">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[11px] text-slate-500">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500 font-bold mb-1">{product.price || 'En bolushop'}</p>
                <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                  {product.title}
                </h4>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
