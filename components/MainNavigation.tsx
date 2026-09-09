import Link from 'next/link';
import SearchInput from '@/components/SearchInput';
import { getCategoryHoverClass } from '@/lib/navigationUtils';
import { normalizeCategorySlug } from '@/lib/articleUtils';

export default function MainNavigation({ activeCategories }: { activeCategories: string[] }) {
  return (
    <>
      {/* Navegación compacta para móviles: las categorías quedan dentro de Explorar. */}
      <nav className="w-full mt-3 md:hidden border-b border-white/5 pb-3" aria-label="Navegación principal móvil">
        <div className="grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-slate-950/50 overflow-hidden text-[10px] font-black uppercase tracking-wider">
          <Link href="/" className="px-2 py-3 text-center text-white hover:text-primary transition-colors">Portada</Link>
          <Link href="/como-funciona" className="px-2 py-3 text-center text-primary hover:text-white transition-colors">Cómo funciona 🤖</Link>
          <Link href="/suscribite" className="px-2 py-3 text-center text-primary hover:text-white transition-colors">Apoyanos ⭐</Link>
        </div>

        <details className="group mt-2 rounded-xl border border-white/10 bg-slate-950/40">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300 [&::-webkit-details-marker]:hidden">
            <span>Explorar secciones</span>
            <span className="text-primary transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 p-px">
            <Link href="/temas" className="bg-slate-950 px-3 py-3 text-center text-[10px] font-black uppercase tracking-wider text-primary hover:bg-slate-900">Temas</Link>
            <Link href="/registro" className="bg-slate-950 px-3 py-3 text-center text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-primary">Registro editorial</Link>
            {activeCategories.map((cat) => (
              <Link
                key={cat}
                href={`/categoria/${normalizeCategorySlug(cat)}`}
                className={`bg-slate-950 px-3 py-3 text-center text-[10px] font-black uppercase tracking-wider text-slate-400 ${getCategoryHoverClass(cat)} hover:bg-slate-900 transition-colors`}
              >
                {cat}
              </Link>
            ))}
            <div className="col-span-2 bg-slate-950 p-3">
              <SearchInput />
            </div>
          </div>
        </details>
      </nav>

      {/* Navegación completa para tablet y escritorio. */}
      <nav className="hidden w-full mt-4 flex-wrap justify-center items-center text-xs font-black uppercase tracking-widest border-b border-white/5 pb-4 md:flex" aria-label="Navegación principal">
        <Link href="/" className="px-4 py-2 border-r border-white/5 text-white hover:text-primary transition-all">
          Portada
        </Link>
        <Link href="/como-funciona" className="px-4 py-2 border-r border-white/5 text-primary hover:text-white transition-all font-bold flex items-center gap-1">
          Cómo Funciona <span className="text-[10px]">🤖</span>
        </Link>
        <Link href="/suscribite" className="px-4 py-2 border-r border-white/5 text-primary font-black hover:text-white transition-all">
          Apoyanos ⭐
        </Link>
        {activeCategories.map((cat) => (
          <Link
            key={cat}
            href={`/categoria/${normalizeCategorySlug(cat)}`}
            className={`px-4 py-2 border-r border-white/5 text-slate-400 ${getCategoryHoverClass(cat)} transition-all`}
          >
            {cat}
          </Link>
        ))}
        <div className="pl-4 py-1">
          <SearchInput />
        </div>
      </nav>
    </>
  );
}
