import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Script from 'next/script';
import Link from 'next/link';
import CookieBanner from '@/components/CookieBanner';
import { getSiteUrl } from '@/lib/seoUtils';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const siteUrl = getSiteUrl();
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'El Irónico | Crítica y análisis del periodismo',
    template: '%s | El Irónico',
  },
  description: 'El Irónico examina cómo se construyen las piezas periodísticas: sus títulos, evidencias, atribuciones y contexto. No reescribimos noticias; publicamos análisis críticos propios.',
  keywords: ['crítica periodística', 'análisis editorial', 'periodismo', 'medios', 'fuentes', 'El Irónico'],
  alternates: { canonical: siteUrl },
  other: adsenseClientId ? { 'google-adsense-account': adsenseClientId } : {},
  openGraph: {
    title: 'El Irónico | Crítica y análisis del periodismo',
    description: 'No repetimos la noticia. Examinamos cómo fue contada.',
    url: siteUrl,
    siteName: 'El Irónico',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Irónico | Crítica y análisis del periodismo',
    description: 'No repetimos la noticia. Examinamos cómo fue contada.',
  },
};

const primaryLinks = [
  { href: '/', label: 'Portada' },
  { href: '/temas', label: 'Temas' },
  { href: '/search', label: 'Buscar' },
  { href: '/metodologia', label: 'Método' },
  { href: '/nosotros', label: 'Quiénes somos' },
  { href: '/contacto', label: 'Contacto' },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body className={`${inter.variable} ${playfair.variable} editorial-paper font-sans antialiased`}>
        {adsenseClientId && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
        {gaMeasurementId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', ${JSON.stringify(gaMeasurementId)}, { page_path: window.location.pathname });`}
            </Script>
          </>
        )}

        <div className="min-h-screen flex flex-col">
          <header className="border-b border-[#d9d1c5] bg-[#f8f5ed]">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-5 sm:px-8 sm:py-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Link href="/" className="group flex items-center gap-3" aria-label="El Irónico, portada">
                  <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-full border border-[#b23a34] font-serif text-xl font-bold text-[#a33a34]">EI</span>
                  <span>
                    <span className="block font-serif text-2xl font-bold tracking-[-.04em] text-[#191a17] sm:text-3xl">El Irónico</span>
                    <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[.15em] text-[#777064]">Crítica del relato periodístico</span>
                  </span>
                </Link>
                <p className="hidden max-w-xs text-right text-sm leading-5 text-[#777064] md:block">No repetimos la noticia.<br /><strong className="text-[#3b3933]">Examinamos cómo fue contada.</strong></p>
              </div>
              <nav aria-label="Navegación principal" className="flex flex-wrap gap-x-6 gap-y-2 border-t border-[#e3ddd3] pt-4">
                {primaryLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="text-sm font-semibold text-[#4d4941] transition hover:text-[#a33a34]">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <div id="contenido" className="flex-1">{children}</div>

          <footer className="border-t border-[#d9d1c5] bg-[#eee8dc]">
            <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.3fr_.7fr] md:py-14">
              <div>
                <Link href="/" className="font-serif text-2xl font-bold text-[#191a17]">El Irónico</Link>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#5d594f]">
                  Analizamos las decisiones editoriales de las piezas periodísticas. La crítica se dirige al texto y a su tratamiento de la información, no a las personas.
                </p>
                <a href="mailto:edukoder2025@gmail.com" className="mt-4 inline-block text-sm font-semibold text-[#9b3732] underline underline-offset-4">Contacto editorial</a>
              </div>
              <nav aria-label="Enlaces legales" className="grid grid-cols-2 gap-x-5 gap-y-3 content-start text-sm font-medium text-[#5d594f]">
                <Link href="/metodologia" className="hover:text-[#9b3732]">Metodología</Link>
                <Link href="/nosotros" className="hover:text-[#9b3732]">Quiénes somos</Link>
                <Link href="/privacidad" className="hover:text-[#9b3732]">Privacidad</Link>
                <Link href="/terminos" className="hover:text-[#9b3732]">Términos</Link>
                <Link href="/cookies" className="hover:text-[#9b3732]">Cookies</Link>
                <Link href="/contacto" className="hover:text-[#9b3732]">Contacto</Link>
              </nav>
              <div className="border-t border-[#d9d1c5] pt-4 text-xs leading-5 text-[#777064] md:col-span-2 md:flex md:items-center md:justify-between">
                <p>© {new Date().getFullYear()} El Irónico.</p>
                <p>Las críticas se apoyan en evidencias disponibles y explicitan sus límites.</p>
              </div>
            </div>
          </footer>
          <CookieBanner />
        </div>
      </body>
    </html>
  );
}
