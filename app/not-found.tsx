import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="space-y-6">
        <h1 className="text-6xl md:text-8xl font-black font-serif text-primary italic tracking-tighter animate-pulse">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
          Página no encontrada
        </h2>
        <p className="text-slate-400 max-w-md mx-auto text-sm">
          La noticia o sección que buscas no está disponible o ha sido movida a nuestro archivo histórico.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-primary text-white text-xs font-black uppercase tracking-widest rounded-full border border-white/10 hover:border-primary transition-all duration-300"
        >
          <Home size={14} />
          Regresar al Inicio
        </Link>
      </div>
    </div>
  );
}