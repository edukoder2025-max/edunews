import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import WeatherWidget from "@/components/WeatherWidget";
import CryptoTickerWidget from "@/components/CryptoTickerWidget";
import SearchInput from "@/components/SearchInput";
import Script from "next/script";

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
  title: "EduNews - Periodismo Ético con IA",
  description: "El primer periódico digital impulsado por IA enfocado en el periodismo ético, libre de intereses políticos.",
};

async function getTickerNews() {
  try {
    const { data, error } = await supabase
      .from('news_articles')
      .select('id, ai_title, original_title')
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
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <div className="min-h-screen flex flex-col">
          {/* Top Info Bar */}
          <div className="bg-slate-950/80 border-b border-white/5 text-[10px] font-bold uppercase tracking-wider py-2 px-6 flex items-center justify-between text-slate-500">
            <div>Edición Digital Estándar</div>
            <div className="flex gap-4">
              <Link href="/nosotros" className="hover:text-white transition-colors">Quiénes Somos</Link>
              <span>•</span>
              <Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link>
            </div>
          </div>

          {/* Centered Newspaper Masthead */}
          <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col items-center">
            {/* Logo/Name */}
            <Link href="/" className="group flex flex-col items-center gap-1 hover:opacity-95 transition-opacity text-center">
              <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                INDEPENDIENTE & OBJETIVO
              </span>
              <h1 className="text-6xl md:text-8xl font-black font-serif italic tracking-tighter text-white select-none">
                Edu<span className="text-primary group-hover:text-secondary transition-colors duration-500">News</span>
              </h1>
              <p className="text-[10px] tracking-widest text-slate-400 uppercase font-bold mt-1 max-w-md hidden md:block">
                Información neutralizada y reescrita mediante Inteligencia Artificial
              </p>
            </Link>

            {/* Newspaper Metadata Sub-header with double borders */}
            <div className="w-full border-newspaper-double py-2.5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
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

            {/* Navigation links styled as sections */}
            <nav className="w-full mt-4 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs font-black uppercase tracking-widest border-b border-white/5 pb-4">
              <Link href="/" className="py-1 border-b-2 border-transparent text-white hover:text-primary hover:border-primary transition-all">
                Portada
              </Link>
              <Link href="/como-funciona" className="py-1 border-b-2 border-transparent text-primary hover:text-white hover:border-white transition-all font-bold flex items-center gap-1">
                Cómo Funciona <span className="text-[10px]">🤖</span>
              </Link>
              <Link href="/category/Mundo" className="py-1 border-b-2 border-transparent text-slate-400 hover:text-cat-mundo hover:border-cat-mundo transition-all">
                Mundo
              </Link>
              <Link href="/category/Argentina" className="py-1 border-b-2 border-transparent text-slate-400 hover:text-cat-argentina hover:border-cat-argentina transition-all">
                Argentina
              </Link>
              <Link href="/category/Tecnología" className="py-1 border-b-2 border-transparent text-slate-400 hover:text-cat-tecnologia hover:border-cat-tecnologia transition-all">
                Tecnología
              </Link>
              <Link href="/category/Economía" className="py-1 border-b-2 border-transparent text-slate-400 hover:text-cat-economia hover:border-cat-economia transition-all">
                Economía
              </Link>
              <Link href="/category/Ciencia" className="py-1 border-b-2 border-transparent text-slate-400 hover:text-cat-cultura hover:border-cat-cultura transition-all">
                Ciencia
              </Link>
              <Link href="/category/Deportes" className="py-1 border-b-2 border-transparent text-slate-400 hover:text-cat-deportes hover:border-cat-deportes transition-all">
                Deportes
              </Link>
              <Link href="/category/Cultura" className="py-1 border-b-2 border-transparent text-slate-400 hover:text-cat-general hover:border-cat-general transition-all">
                Cultura
              </Link>
              <SearchInput />
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
                    <Link key={`${news.id}-${i}`} href={`/news/${news.id}`} className="hover:text-primary transition-colors flex items-center gap-2">
                      <span className="text-primary font-black">•</span>
                      {news.ai_title || news.original_title}
                    </Link>
                  ))}
                  {/* Duplicate for infinite loop */}
                  {tickerNews.map((news, i) => (
                    <Link key={`${news.id}-dup-${i}`} href={`/news/${news.id}`} className="hover:text-primary transition-colors flex items-center gap-2">
                      <span className="text-primary font-black">•</span>
                      {news.ai_title || news.original_title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Crypto Market Ticker - TradingView Widget */}
          <CryptoTickerWidget />

          {/* Main Content */}
          <main className="flex-1 w-full">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-white/5 bg-slate-950 mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-bold text-white font-serif">EduNews</h3>
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
                <p>© {new Date().getFullYear()} EduNews. Todos los derechos reservados.</p>
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
