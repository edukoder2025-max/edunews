import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { buildArticleUrl } from "@/lib/articleUtils";
import WeatherWidget from "@/components/WeatherWidget";
import CryptoWidget from "@/components/CryptoWidget";
import SearchInput from "@/components/SearchInput";
import Script from "next/script";
import NewsletterForm from "@/components/NewsletterForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";


const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "El Irónico | Noticias de Argentina y el Mundo sin Sesgo - Periodismo IA",
  description: "El Irónico es un periódico digital 100% impulsado por IA que neutraliza noticias de Argentina, Mundo, Tecnología, Economía, Deportes y Ciencia. Periodismo ético, libre de sesgos políticos.",
  keywords: "noticias, periodismo, Argentina, mundo, tecnología, economía, inteligencia artificial, noticias sin sesgo, periodismo neutral",
  other: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
    ? {
        "google-adsense-account": process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
      }
    : {},
  openGraph: {
    title: "El Irónico | Noticias Neutrales de Argentina y el Mundo",
    description: "Periodismo impulsado por IA - Noticias neutralizadas sin intereses políticos",
    url: "https://elironico.com",
    siteName: "El Irónico",
    type: "website",
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    ],
  },
};

async function getTickerNews() {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('id, ai_title, original_title, category')
      .order('published_at', { ascending: false })
      .limit(8);
    if (error) {
      console.error("Error fetching ticker news:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Error loading ticker:", err);
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rawTickerNews = await getTickerNews();
  const tickerNews = Array.from(
    new Map(rawTickerNews.map(news => [news.id, news])).values()
  );
  const formattedDate = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-background text-slate-200 antialiased`}>
        {/* SVG Filter: Chalk-on-Blackboard turbulence effect — usado por .chalk-title */}
        <svg
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter id="chalk-rough" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
              {/* Genera ruido fractal que simula la textura granulosa de la tiza */}
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65 0.75"
                numOctaves="4"
                seed="8"
                stitchTiles="stitch"
                result="noise"
              />
              {/* Desplaza los píxeles del texto según el ruido generado */}
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="2.5"
                xChannelSelector="R"
                yChannelSelector="G"
                result="roughened"
              />
              {/* Mezcla suave: el resultado áspero a 90% + original suave a 10% */}
              <feBlend in="roughened" in2="SourceGraphic" mode="normal" result="blended" />
              <feComposite in="blended" in2="SourceGraphic" operator="in" />
            </filter>
          </defs>
        </svg>

        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
        <div className="min-h-screen flex flex-col">


          {/* Centered Newspaper Masthead */}
          <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex flex-col items-center">
            
            {/* Grilla Superior: Oreja Izquierda | Logotipo Central | Oreja Derecha */}
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-6 items-center justify-between pb-6 border-b border-white/5">
              
              {/* Oreja Izquierda: Datos Técnicos y Lema Clásico */}
              <div className="hidden md:flex flex-col text-left text-[9px] text-slate-500 font-bold uppercase tracking-wider space-y-1">
                <div>REGISTRO N.º 48.910</div>
                <div className="flex gap-2 text-slate-400">
                  <Link href="/nosotros" className="hover:text-primary transition-colors">Quiénes Somos</Link>
                  <span>•</span>
                  <Link href="/contacto" className="hover:text-primary transition-colors">Contacto</Link>
                </div>
                <div className="text-primary/70 font-serif italic text-xs tracking-normal normal-case font-bold mt-0.5">
                  “Veritas et Libertas”
                </div>
              </div>

              {/* Logotipo Central (Ocupa 2 columnas de la grilla) */}
              <div className="col-span-1 md:col-span-2 flex flex-col items-center text-center">
                <Link href="/" className="group flex flex-col items-center gap-1.5 hover:opacity-95 transition-opacity">
                  <span className="text-[9px] bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 rounded-full font-black tracking-widest uppercase">
                    INDEPENDIENTE & OBJETIVO
                  </span>
                  <h1 className="text-6xl sm:text-7xl md:text-8xl font-black font-serif italic tracking-tighter select-none leading-none chalk-title">
                    El<span className="chalk-title-accent group-hover:opacity-100 transition-opacity duration-500"> Irónico</span>
                  </h1>
                  <p className="text-[9px] tracking-widest text-slate-400 uppercase font-bold mt-2 max-w-md">
                    Información neutralizada y reescrita mediante Inteligencia Artificial
                  </p>
                </Link>
              </div>

              {/* Oreja Derecha: Selector de Idioma e Información */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 text-right">
                <div className="hidden md:block text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  EDICIÓN DIGITAL ESTÁNDAR
                </div>
                <div className="flex items-center gap-2.5 bg-slate-950/40 p-1.5 px-3 rounded-full border border-white/5">
                  <LanguageSwitcher />
                </div>
              </div>

            </div>

            {/* Newspaper Metadata Sub-header with double borders */}
            <div className="w-full border-newspaper-double py-2 mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-2 text-primary font-black">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Transmisión Continua
              </div>
              <div className="text-slate-300 font-medium font-serif italic text-center sm:text-left">
                {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
              </div>
              <div className="flex items-center gap-2">
                <WeatherWidget />
              </div>
            </div>

            {/* Principal Editorial Banner (Headline/Lema) */}
            <div className="w-full text-center py-4 border-b border-white/5">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-serif text-white tracking-normal leading-tight">
                Noticias Argentina sin sesgo y periodismo IA neutral 24/7
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 max-w-2xl mx-auto mt-1 font-medium leading-relaxed">
                Información verificada y neutralizada automáticamente mediante Inteligencia Artificial para una lectura objetiva y transparente.
              </p>
            </div>

            {/* Navigation links styled as sections */}
            <nav className="w-full mt-4 flex flex-wrap justify-center items-center text-xs font-black uppercase tracking-widest border-b border-white/5 pb-4">
              <Link href="/" className="px-4 py-2 border-r border-white/5 text-white hover:text-primary transition-all">
                Portada
              </Link>
              <Link href="/como-funciona" className="px-4 py-2 border-r border-white/5 text-primary hover:text-white transition-all font-bold flex items-center gap-1">
                Cómo Funciona <span className="text-[10px]">🤖</span>
              </Link>
              <Link href="/categoria/mundo" className="px-4 py-2 border-r border-white/5 text-slate-400 hover:text-cat-mundo transition-all">
                Mundo
              </Link>
              <Link href="/categoria/argentina" className="px-4 py-2 border-r border-white/5 text-slate-400 hover:text-cat-argentina transition-all">
                Argentina
              </Link>
              <Link href="/categoria/tecnologia" className="px-4 py-2 border-r border-white/5 text-slate-400 hover:text-cat-tecnologia transition-all">
                Tecnología
              </Link>
              <Link href="/categoria/economia" className="px-4 py-2 border-r border-white/5 text-slate-400 hover:text-cat-economia transition-all">
                Economía
              </Link>
              <Link href="/categoria/ciencia" className="px-4 py-2 border-r border-white/5 text-slate-400 hover:text-cat-cultura transition-all">
                Ciencia
              </Link>
              <Link href="/categoria/deportes" className="px-4 py-2 border-r border-white/5 text-slate-400 hover:text-cat-deportes transition-all">
                Deportes
              </Link>
              <Link href="/categoria/cultura" className="px-4 py-2 border-r border-white/5 text-slate-400 hover:text-cat-general transition-all">
                Cultura
              </Link>
              <div className="pl-4 py-1">
                <SearchInput />
              </div>
            </nav>
          </header>

          {/* Scrolling Ticker of Latest News */}
          {tickerNews.length > 0 && (
            <div className="w-full bg-slate-950/60 border-y border-white/5 py-2.5 overflow-hidden flex relative select-none z-20">
              <div className="flex-shrink-0 bg-primary text-white font-black text-[9px] uppercase tracking-wider px-3 py-1 rounded ml-6 z-10 flex items-center shadow-lg shadow-primary/20">
                Últimas Noticias
              </div>
              <div className="flex overflow-hidden w-full relative items-center ml-4">
                <div className="animate-ticker flex gap-12 text-xs font-bold text-slate-300">
                  {tickerNews.map((news, i) => (
                    <Link key={`${news.id}-${i}`} href={buildArticleUrl(news.id, news.ai_title || news.original_title, news.category)} className="hover:text-primary transition-colors flex items-center gap-2">
                      <span className="text-primary font-black">•</span>
                      {news.ai_title || news.original_title}
                    </Link>
                  ))}
                  {/* Duplicate for infinite loop */}
                  {tickerNews.map((news, i) => (
                    <Link key={`${news.id}-dup-${i}`} href={buildArticleUrl(news.id, news.ai_title || news.original_title, news.category)} className="hover:text-primary transition-colors flex items-center gap-2">
                      <span className="text-primary font-black">•</span>
                      {news.ai_title || news.original_title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Live Crypto Market Ticker con Sparklines */}
          <CryptoWidget />

          {/* Main Content */}
          <main className="flex-1 w-full">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-white/5 bg-slate-950 mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="mb-12 border-b border-white/5 pb-12">
                <NewsletterForm />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-bold text-white font-serif">El Irónico</h3>
                  <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                    El primer periódico digital impulsado por IA diseñado para evitar noticias sesgadas por intereses partidarios o políticos. Promovemos un periodismo ético, transparente y correcto.
                  </p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Contacto: <a href="mailto:edukoder2025@gmail.com" className="text-primary hover:text-white transition-colors">edukoder2025@gmail.com</a>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Legal</h3>
                  <ul className="space-y-2 text-sm text-slate-400 font-medium">
                    <li><Link href="/privacidad" className="hover:text-primary transition-colors">Política de Privacidad</Link></li>
                    <li><Link href="/terminos" className="hover:text-primary transition-colors">Términos de Servicio</Link></li>
                    <li><Link href="/cookies" className="hover:text-primary transition-colors">Política de Cookies</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Secciones</h3>
                  <ul className="space-y-2 text-sm text-slate-400 font-medium">
                    <li><Link href="/metodologia" className="hover:text-primary transition-colors">Metodología IA</Link></li>
                    <li><Link href="/nosotros" className="hover:text-primary transition-colors">Quiénes Somos</Link></li>
                    <li><Link href="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
                  </ul>
                </div>
              </div>
              <div className="pt-8 border-t border-white/5 text-center text-slate-500 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
                <p>© {new Date().getFullYear()} El Irónico. Todos los derechos reservados.</p>
                <p>Las noticias generadas por IA son extraídas de fuentes públicas y reescritas bajo principios de neutralidad.</p>
              </div>
            </div>
          </footer>
          
          <CookieBanner />
        </div>
      </body>
    </html>
  );
}
