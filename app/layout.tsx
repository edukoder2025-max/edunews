import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduNews - Periodismo Ético con IA",
  description: "El primer periódico digital impulsado por IA enfocado en el periodismo ético, libre de intereses políticos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
                E
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                Edu<span className="text-gradient">News</span>
              </h1>
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
              <Link href="/" className="text-white hover:text-primary transition-colors">Portada</Link>
              <Link href="/category/Mundo" className="hover:text-white transition-colors">Mundo</Link>
              <Link href="/category/Argentina" className="hover:text-white transition-colors">Argentina</Link>
              <Link href="/category/Tecnologia" className="hover:text-white transition-colors">Tecnología</Link>
              <Link href="/category/Economia" className="hover:text-white transition-colors">Economía</Link>
            </nav>
            <button className="md:hidden text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer Optimizado para AdSense */}
          <footer className="border-t border-slate-800 bg-slate-900/80 mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold text-white mb-4">Sobre EduNews</h3>
                  <p className="text-sm text-slate-400 max-w-md">
                    El primer periódico digital informativo impulsado por IA diseñado para evitar el contenido generado por intereses políticos. Promovemos un periodismo ético, transparente y correcto.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Legal</h3>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li><a href="/privacidad" className="hover:text-primary transition-colors">Política de Privacidad</a></li>
                    <li><a href="/terminos" className="hover:text-primary transition-colors">Términos de Servicio</a></li>
                    <li><a href="/cookies" className="hover:text-primary transition-colors">Política de Cookies</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Comunidad</h3>
                  <ul className="space-y-2 text-sm text-slate-400">
                    <li><a href="/nosotros" className="hover:text-primary transition-colors">Quiénes Somos</a></li>
                    <li><a href="/contacto" className="hover:text-primary transition-colors">Contacto</a></li>
                  </ul>
                </div>
              </div>
              <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
                <p>© {new Date().getFullYear()} EduNews. Todos los derechos reservados.</p>
                <p className="mt-2">Las noticias generadas por IA son extraídas de fuentes públicas y reescritas bajo principios de neutralidad.</p>
              </div>
            </div>
          </footer>
          
          {/* Banner de Cookies para Cumplimiento GDPR/AdSense */}
          <CookieBanner />
        </div>
      </body>
    </html>
  );
}
