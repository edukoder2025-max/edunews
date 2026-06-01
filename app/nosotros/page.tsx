import { Shield, Sparkles, HeartHandshake, Mail, CheckCircle2 } from "lucide-react";

export default function Nosotros() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Hero Header */}
      <header className="text-center space-y-4">
        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-black tracking-widest uppercase inline-block">
          La Identidad Detrás del Algoritmo
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-white font-serif tracking-tight uppercase italic">
          Sobre <span className="text-gradient">EduNews</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Un proyecto independiente nacido para combatir la desinformación, el sensacionalismo y la polarización sistemática de los medios de prensa modernos.
        </p>
      </header>

      {/* Grid: Misión e Historia */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7 space-y-6 text-slate-300 leading-relaxed">
          <h2 className="text-2xl font-black font-serif text-white uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="text-primary" size={22} />
            La Motivación del Proyecto
          </h2>
          <p>
            En un ecosistema informativo donde los grandes medios responden a agendas comerciales, corporativas o intereses políticos particulares, la verdad suele quedar sepultada bajo capas de adjetivos emotivos y manipulación ideológica.
          </p>
          <p>
            <strong>EduNews</strong> nació en 2026 de la mano de un pequeño grupo de periodistas y desarrolladores de software independientes como un experimento de código abierto. Nuestra pregunta fue simple: <em>¿Qué ocurre si eliminamos la opinión, los sesgos y el lenguaje cargado, y presentamos únicamente los hechos empíricos y datos objetivos?</em>
          </p>
          <p>
            El resultado es este periódico digital 100% automatizado, que monitoriza los principales canales de noticias de Argentina y el mundo, y los procesa con inteligencia artificial bajo una serie de directrices editoriales estrictas antes de publicarlos.
          </p>
        </div>

        <div className="md:col-span-5 relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary to-secondary opacity-30 blur-lg"></div>
          <div className="relative bg-slate-950/60 border border-white/10 rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20 text-3xl">
              EN
            </div>
            <h3 className="text-xl font-bold text-white">Periodismo Autónomo</h3>
            <p className="text-xs text-slate-400">
              Procesado algorítmicamente mediante Gemini 2.5 Flash para neutralidad radical.
            </p>
            <div className="pt-2">
              <span className="text-[10px] bg-white/5 border border-white/10 text-slate-300 px-3 py-1 rounded-full font-mono">
                Versión 1.0 (Junio 2026)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Compromiso Editorial (Carta Firmada) */}
      <section className="bg-slate-950/40 border border-white/5 rounded-3xl p-8 md:p-10 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <Shield className="text-secondary" size={24} />
          <h2 className="text-2xl font-black font-serif text-white uppercase tracking-tight">
            Compromiso Editorial Firmado
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed text-slate-400">
          <div className="space-y-4">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-secondary" />
              Lo que EduNews promete
            </h3>
            <ul className="space-y-2 list-none pl-0">
              <li className="flex gap-2 items-start">
                <span className="text-secondary font-black">•</span>
                <span><strong>Hechos comprobables primero:</strong> Cada artículo se centrará en cifras, estadísticas, fechas y acontecimientos confirmados por múltiples fuentes.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-secondary font-black">•</span>
                <span><strong>Trazabilidad abierta:</strong> Siempre enlazaremos directamente a la fuente original del feed RSS para que puedas auditar el trabajo de la IA.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-secondary font-black">•</span>
                <span><strong>Simetría en controversias:</strong> Si hay un conflicto de visiones, daremos el mismo espacio y tono lingüístico a ambas partes de forma equilibrada.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-red-500" />
              Lo que EduNews NO promete
            </h3>
            <ul className="space-y-2 list-none pl-0">
              <li className="flex gap-2 items-start">
                <span className="text-red-500 font-black">•</span>
                <span><strong>Infallibilidad absoluta:</strong> La inteligencia artificial puede cometer errores de redacción o interpretación. Por eso incluimos la pestaña de auditoría abierta.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-red-500 font-black">•</span>
                <span><strong>Opinión propia:</strong> EduNews no tiene opinión política, editorial ni de partido. Tampoco emitimos editoriales firmadas con criterio subjetivo.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-red-500 font-black">•</span>
                <span><strong>Primicias exclusivas:</strong> No realizamos periodismo de investigación propio. Actuamos como un curador y reescritor ético de la información existente.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>Proyecto de Código Abierto e Independiente</div>
          <div className="text-slate-300 italic">El Equipo de EduNews</div>
        </div>
      </section>

      {/* Sección de Financiamiento y Contacto */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Finanzas */}
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 space-y-4">
          <HeartHandshake className="text-primary" size={32} />
          <h3 className="text-lg font-black font-serif text-white uppercase tracking-tight">Financiación Ética</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            EduNews no vende espacio editorial ni favorece a anunciantes corporativos. Mostramos anuncios a través de Google AdSense de forma puramente programática y estandarizada para costear el servidor en Vercel y el consumo de la API de inteligencia artificial. No priorizamos noticias por clics sensacionalistas, ya que todos nuestros titulares son neutralizados por diseño.
          </p>
        </div>

        {/* Contacto / Reportar Sesgo */}
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 space-y-4">
          <Mail className="text-secondary" size={32} />
          <h3 className="text-lg font-black font-serif text-white uppercase tracking-tight">Reporte de Sesgo Editorial</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            ¿Consideras que la IA ha cometido un error o ha mantenido lenguaje sesgado o partidario en alguna noticia? Queremos corregirlo. Envíanos el enlace de la noticia de nuestro portal a nuestro correo electrónico de soporte. Analizaremos el prompt de reescritura para corregir el modelo.
          </p>
          <div className="pt-2">
            <a
              href="mailto:edukoder2025@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary hover:text-white transition-colors"
            >
              edukoder2025@gmail.com
              <Mail size={14} />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
