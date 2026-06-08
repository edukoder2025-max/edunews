import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Sparkles, CheckCircle, Brain, ShieldAlert, Cpu, Heart } from 'lucide-react';
import WaitlistForm from '@/components/WaitlistForm';
import GoogleRRMButton from '@/components/GoogleRRMButton';

const publicationId = process.env.NEXT_PUBLIC_GOOGLE_SWG_PUBLICATION_ID || 'CAowg7u3DA';

export default function SubscribePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">

      {/* ─────────────────────────────────────────────────────────────
          Script oficial de Google Reader Revenue Manager (SWG Basic)
          Se carga async y detecta automáticamente los botones con
          el atributo  swg-standard-button="subscription|contribution"
          ───────────────────────────────────────────────────────────── */}
      <Script
        src="https://news.google.com/swg/js/v1/swg-basic.js"
        strategy="afterInteractive"
      />

      <Script id="rrm-init" strategy="afterInteractive">{`
        (self.SWG_BASIC = self.SWG_BASIC || []).push(function(basicSubscriptions) {
          basicSubscriptions.init({
            type: "NewsArticle",
            isPartOfType: ["Product"],
            isPartOfProductId: "${publicationId}:openaccess",
            clientOptions: { theme: "light", lang: "es-419" },
          });

          // Exponer instancia para debug
          window._swgBasic = basicSubscriptions;
          console.log('[RRM] SDK listo. Publication ID: ${publicationId}');
        });
      `}</Script>

      <div className="bg-slate-950/60 border border-white/10 rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-black/50 space-y-16 overflow-hidden relative">
        {/* Background glow effects */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        {/* ─── Hero Header ─── */}
        <header className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-black uppercase tracking-[0.2em] text-primary">
            <Sparkles size={12} className="animate-pulse" /> FINANCIAR LA NEUTRALIDAD
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-serif text-white leading-tight">
            Alimentá la Inteligencia que Neutraliza el Sesgo
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            El Irónico no tiene sponsors corporativos, pauta oficial ni dueños políticos.
            Nuestros agentes de IA leen cientos de fuentes diariamente para reconstruir las noticias de forma limpia. 
            Tu contribución financia directamente el cómputo y el entrenamiento que los hace más inteligentes.
          </p>
        </header>

        {/* ─── AI Agents Funding Explanation (Grid layout) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Card 1: API Compute */}
          <div className="bg-white/3 border border-white/5 rounded-2xl p-8 space-y-4 hover:border-white/10 transition-all duration-300 group">
            <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
              <Cpu size={24} />
            </div>
            <h3 className="text-lg font-bold text-white font-serif">Poder de Cómputo 24/7</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Procesar grandes volúmenes de texto de portadas nacionales e internacionales requiere llamadas constantes a las APIs de modelos de lenguaje avanzados. Tu aporte paga directamente el procesamiento en tiempo real.
            </p>
          </div>

          {/* Card 2: Neutrality Training */}
          <div className="bg-white/3 border border-white/5 rounded-2xl p-8 space-y-4 hover:border-white/10 transition-all duration-300 group">
            <div className="p-3 bg-secondary/10 text-secondary rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
              <Brain size={24} />
            </div>
            <h3 className="text-lg font-bold text-white font-serif">Modelos Más Inteligentes</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Constantemente entrenamos y refinamos los prompts de análisis de sesgo cruzado. Más fondos nos permiten acceder a modelos con ventanas de contexto gigantescas y mayor capacidad de razonamiento crítico.
            </p>
          </div>

          {/* Card 3: Independence */}
          <div className="bg-white/3 border border-white/5 rounded-2xl p-8 space-y-4 hover:border-white/10 transition-all duration-300 group">
            <div className="p-3 bg-green-500/10 text-green-400 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
              <Heart size={24} />
            </div>
            <h3 className="text-lg font-bold text-white font-serif">Independencia Absoluta</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              La única forma de garantizar que una IA se mantenga libre de sesgos es que su financiamiento venga de sus propios lectores. Sin pauta política, el algoritmo de neutralización responde únicamente a la verdad objetiva.
            </p>
          </div>
        </div>

        {/* ─── Interactive AI System Visualizer ─── */}
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 max-w-4xl mx-auto flex flex-col items-center justify-center space-y-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
            ESQUEMA DEL PROCESO DE NEUTRALIZACIÓN
          </span>
          
          <div className="w-full max-w-2xl grid grid-cols-5 items-center gap-2 md:gap-4 py-4 relative z-10">
            {/* Fuente con Sesgo */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <ShieldAlert size={20} />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Fuentes con Sesgo</span>
            </div>

            {/* Linea 1 */}
            <div className="h-0.5 bg-gradient-to-r from-red-500/30 to-primary/50 relative">
              <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            </div>

            {/* Agentes de IA */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center text-primary shadow-lg shadow-primary/15">
                <Cpu size={28} />
              </div>
              <span className="text-xs font-black text-white uppercase tracking-wider">Agentes de IA</span>
            </div>

            {/* Linea 2 */}
            <div className="h-0.5 bg-gradient-to-r from-primary/50 to-green-500/30 relative">
              <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
            </div>

            {/* Noticia Neutral */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
                <CheckCircle size={20} />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase">Noticia Neutral</span>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Tu contribución ayuda a pagar los tokens de procesamiento de este ciclo. Cada centavo se traduce directamente en más artículos procesados y mejores algoritmos de detección de sesgo emocional.
          </p>
        </div>

        {/* ─── Contribution Block (The Centerpiece) ─── */}
        <div className="max-w-xl mx-auto bg-gradient-to-b from-slate-900 to-slate-950 border border-primary/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-300" />
          
          <div className="text-center space-y-6">
            <div className="inline-flex p-3.5 bg-primary/15 text-primary rounded-2xl">
              <Heart size={28} className="fill-primary/25 group-hover:scale-110 transition-transform duration-300" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white font-serif">Contribución Rápida</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                ¿Solo querés apoyar nuestro trabajo sin suscribirte a un plan a largo plazo?
                Podés realizar una contribución única directamente a través del sistema de Google.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <GoogleRRMButton
                type="contribution"
                label="Contribuir con Google"
                className="w-full"
              />
              <p className="text-[11px] text-slate-500">
                Procesado de forma oficial por Google Reader Revenue Manager.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Footer-like Secondary Sections ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-8 border-t border-white/5">
          {/* Newsletter Form */}
          <div className="rounded-3xl border border-white/5 bg-white/3 p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-serif text-white">
                ¿Querés recibir novedades?
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dejá tu correo para enterarte de nuevos planes, beneficios exclusivos y lanzamientos de nuevas herramientas de transparencia de El Irónico.
              </p>
              <WaitlistForm />
            </div>
          </div>

          {/* Navigation options */}
          <div className="rounded-3xl border border-white/5 bg-slate-950/45 p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-serif text-white">
                Explorar el proyecto
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Si aún no estás listo para contribuir, podés leer cómo funciona nuestro algoritmo o volver a la portada para leer noticias neutralizadas sin pauta corporativa.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
              <Link
                href="/como-funciona"
                className="inline-flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-primary hover:bg-primary/20 transition-all w-full text-center"
              >
                Cómo Funciona
                <ArrowRight size={14} className="ml-2" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all w-full text-center"
              >
                Volver a Portada
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
