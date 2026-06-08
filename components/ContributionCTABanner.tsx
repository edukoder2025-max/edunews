import ContributionButton from "@/components/ContributionButton";

export default function ContributionCTABanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="rounded-[2rem] border border-primary/20 bg-primary/10 p-8 shadow-2xl shadow-primary/10">
        <p className="text-xs uppercase tracking-[0.35em] font-black text-primary mb-3">Apoyá el periodismo neutro</p>
        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-4">
          Con tu contribución podemos seguir alimentando a nuestros agentes para que los artículos sean cada vez más neutrales.
        </h2>
        <p className="text-slate-300 max-w-3xl leading-relaxed mb-6">
          Hacé clic en el botón para abrir el CTA de contribución de Google y ayudarnos a mantener el sitio libre de sesgos.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <ContributionButton />
          <span className="text-sm text-slate-400 max-w-2xl">
            El botón se muestra en todos los artículos y en las páginas más importantes del sitio.
          </span>
        </div>
      </div>
    </div>
  );
}
