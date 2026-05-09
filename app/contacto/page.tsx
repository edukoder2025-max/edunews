export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-black text-white mb-8 tracking-tighter uppercase">Contacto</h1>
      <p className="text-xl text-slate-400 mb-12">¿Tienes alguna duda, sugerencia o quieres reportar un error? Estamos aquí para escucharte.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-2xl font-bold text-white">Canales Directos</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-black text-primary uppercase">Email Editorial</p>
              <p className="text-slate-300">redaccion@edunews.com</p>
            </div>
            <div>
              <p className="text-xs font-black text-primary uppercase">Soporte Técnico</p>
              <p className="text-slate-300">tecnico@edunews.com</p>
            </div>
            <div>
              <p className="text-xs font-black text-primary uppercase">Publicidad</p>
              <p className="text-slate-300">ads@edunews.com</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-8 rounded-3xl border border-primary/20">
          <h2 className="text-2xl font-bold text-white mb-4">Ubicación</h2>
          <p className="text-slate-300 leading-relaxed">
            Nuestra redacción principal opera de forma 100% remota y descentralizada, garantizando la independencia informativa y la seguridad de nuestros colaboradores.
          </p>
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-sm font-bold text-white italic">"Periodismo Ético e Independiente impulsado por IA."</p>
          </div>
        </div>
      </div>
    </div>
  );
}
