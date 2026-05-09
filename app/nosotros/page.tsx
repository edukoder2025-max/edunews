export default function Nosotros() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12 text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Sobre <span className="text-gradient">EduNews</span>
        </h1>
        <p className="text-slate-400 text-lg">
          El primer periódico digital impulsado por Inteligencia Artificial con un propósito claro: el periodismo ético.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>
            En un mundo donde los medios tradicionales a menudo están atados a agendas políticas, corporativas o intereses particulares, nace <strong>EduNews</strong>.
          </p>
          <p>
            Hemos desarrollado un sistema autónomo que recolecta las noticias más importantes de las agencias globales, y utiliza modelos avanzados de <strong>Inteligencia Artificial</strong> para reescribirlas. El objetivo de la IA es extraer los hechos puros, eliminar la opinión sesgada, el sensacionalismo y la retórica política.
          </p>
          <div className="p-6 glass-panel rounded-xl border-l-4 border-primary">
            <h3 className="font-bold text-white mb-2">Nuestra Misión</h3>
            <p className="text-sm">
              Devolver a las personas su derecho fundamental a la información limpia, permitiendo que cada individuo forme su propio criterio sin influencias externas.
            </p>
          </div>
        </div>
        <div className="relative h-80 rounded-2xl overflow-hidden glass-panel flex items-center justify-center p-8 text-center">
           <div>
             <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 text-4xl mb-6">
                E
              </div>
              <h3 className="text-2xl font-bold text-white">Periodismo del Futuro</h3>
              <p className="text-slate-400 mt-2">100% Hechos. 0% Política.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
