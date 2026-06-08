"use client";

import { useState, useEffect, useRef } from "react";
import { ShieldCheck, Cpu, ArrowRight, Network, Sparkles, AlertTriangle, CheckCircle2, ChevronRight, Terminal, RefreshCw } from "lucide-react";
import Link from "next/link";

interface TopicData {
  title: string;
  leftSource: string;
  leftHeadline: string;
  rightSource: string;
  rightHeadline: string;
  neutralTitle: string;
  neutralSummary: string;
  stats: {
    adjectivesRemoved: number;
    biasMitigation: string;
    processingTime: string;
  };
}

const TOPICS: Record<string, TopicData> = {
  inflacion: {
    title: "Cifras de Inflación Mensual",
    leftSource: "Página 12 (Izquierda)",
    leftHeadline: "La desaceleración consolida el éxito de las medidas oficiales frente a la crisis heredada.",
    rightSource: "La Nación (Derecha)",
    rightHeadline: "La suba incontrolable de precios licúa los salarios y golpea dramáticamente a las familias.",
    neutralTitle: "El índice de inflación mensual se situó en 4.2% según el informe oficial del INDEC.",
    neutralSummary: "El organismo de estadísticas reportó una variación de precios del 4.2% para el último período. El acumulado interanual registra cambios significativos, mientras analistas y sectores económicos debaten el impacto y proyectan tendencias fiscales para el próximo trimestre.",
    stats: {
      adjectivesRemoved: 14,
      biasMitigation: "96.4%",
      processingTime: "1.2s"
    }
  },
  alquileres: {
    title: "Regulación de Alquileres",
    leftSource: "La Izquierda Diario (Socialista)",
    leftHeadline: "La voracidad y especulación inmobiliaria hambrea a miles de inquilinos sin techo.",
    rightSource: "Libertad Digital (Libertario)",
    rightHeadline: "La nefasta ley socialista asfixia a propietarios y destruye por completo el mercado.",
    neutralTitle: "Congreso debate reformas a la normativa de contratos de alquiler inmobiliario.",
    neutralSummary: "Legisladores discuten modificaciones en los plazos legales de los contratos de locación y en los mecanismos de indexación de precios. El sector inmobiliario reporta fluctuaciones en la oferta, mientras agrupaciones de inquilinos solicitan mantener protecciones básicas.",
    stats: {
      adjectivesRemoved: 18,
      biasMitigation: "98.1%",
      processingTime: "1.4s"
    }
  },
  comercio: {
    title: "Tratado de Libre Comercio",
    leftSource: "La Gaceta (Conservador)",
    leftHeadline: "Polémico acuerdo comercial entrega la soberanía nacional ante corporaciones extranjeras.",
    rightSource: "El Cronista (Negocios)",
    rightHeadline: "Histórico acuerdo comercial abrirá lluvias de inversiones y empleo de calidad.",
    neutralTitle: "Países firman acuerdo de intercambio comercial bilateral para reducir aranceles.",
    neutralSummary: "Se formalizó un tratado comercial que reduce aranceles de importación en bienes de capital y productos agrícolas entre ambas regiones. Cámaras industriales evalúan el impacto competitivo local, mientras el gobierno proyecta un incremento en el volumen exportador.",
    stats: {
      adjectivesRemoved: 11,
      biasMitigation: "95.9%",
      processingTime: "0.9s"
    }
  }
};

export default function ComoFuncionaPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>("inflacion");
  const [simStatus, setSimStatus] = useState<"idle" | "fetching" | "extracting" | "filtering" | "done">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const activeTopic = TOPICS[selectedTopic];

  // Auto-scroll para la consola de logs
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Simular proceso de neutralización
  const runSimulation = () => {
    setSimStatus("fetching");
    setLogs([
      "🔋 Iniciando El Irónico AI Engine...",
      `📡 Conectando a feeds RSS en tiempo real...`,
      `🔍 Escaneando titulares sobre: "${activeTopic.title}"...`
    ]);

    setTimeout(() => {
      setSimStatus("extracting");
      setLogs(prev => [
        ...prev,
        `📥 Entrada RSS Cargada:`,
        `   └─ [A]: "${activeTopic.leftHeadline}" (${activeTopic.leftSource})`,
        `   └─ [B]: "${activeTopic.rightHeadline}" (${activeTopic.rightSource})`,
        `📊 Correlacionando datos y hechos fácticos comunes...`
      ]);
    }, 1500);

    setTimeout(() => {
      setSimStatus("filtering");
      setLogs(prev => [
        ...prev,
        `🚫 Detección de sesgos en proceso...`,
        `   └─ Filtro: Eliminando adjetivos emocionales / Clickbaits...`,
        `   └─ Eliminado: "incontrolable", "desaceleración exitosa", "nefasta", "socialista", "voracidad feroz"`,
        `🧼 Reconstruyendo sintaxis en voz gramatical neutral...`
      ]);
    }, 3200);

    setTimeout(() => {
      setSimStatus("done");
      setLogs(prev => [
        ...prev,
        `✅ Artículo neutralizado con éxito.`,
        `📝 Título Aprobado: "${activeTopic.neutralTitle}"`,
        `🚀 Desplegando en El Irónico Frontpage.`
      ]);
    }, 5000);
  };

  const resetSim = () => {
    setSimStatus("idle");
    setLogs([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Header */}
      <header className="text-center space-y-4">
        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-black tracking-widest uppercase inline-block">
          Radical Transparency / Transparencia Radical
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-white font-serif tracking-tight uppercase italic text-center">
          La Caja Negra de El Irónico
        </h1>
        <p className="text-base text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
          Los diarios tradicionales ocultan sus sesgos editoriales. Nosotros te mostramos exactamente cómo nuestro algoritmo de IA desarma la retórica partidista para entregarte los hechos limpios.
        </p>
      </header>

      {/* ================= SIMULADOR INTERACTIVO (DASHBOARD) ================= */}
      <section className="bg-slate-950/40 border border-white/5 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/5 pb-4 gap-4">
          <div>
            <h2 className="text-xl font-black font-serif text-white flex items-center gap-2">
              <Terminal className="text-primary animate-pulse" size={20} />
              Demostración de Transparencia Radical
            </h2>
            <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider mt-0.5">
              Simula el procesamiento lingüístico de la IA sobre temas polarizados
            </p>
          </div>
          
          {/* Selector de Tópico */}
          <div className="flex flex-wrap gap-2">
            {Object.keys(TOPICS).map((key) => (
              <button
                key={key}
                disabled={simStatus !== "idle"}
                onClick={() => setSelectedTopic(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  selectedTopic === key
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white/5 text-slate-400 hover:text-white disabled:opacity-40"
                }`}
              >
                {key === "inflacion" ? "Inflación" : key === "alquileres" ? "Alquileres" : "Comercio"}
              </button>
            ))}
          </div>
        </div>

        {/* El Dashboard de 3 Columnas (Transparencia Radical) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA 1: ENTRADA (INPUT FEEDS) */}
          <div className="lg:col-span-4 space-y-4 flex flex-col">
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">
              <Network size={14} className="text-primary" />
              1. Entrada (Feeds RSS)
            </div>
            
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {/* Left Wing Feed */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-500/10 border-l border-b border-red-500/20 text-red-400 font-black text-[7px] uppercase tracking-wider px-2 py-0.5 rounded-bl">
                  Corriente A (Izquierda)
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{activeTopic.leftSource}</p>
                <p className="text-xs text-slate-300 font-serif italic leading-relaxed">
                  "{activeTopic.leftHeadline}"
                </p>
              </div>

              {/* Arrow divider on mobile */}
              <div className="flex justify-center text-slate-600 lg:hidden">
                <ArrowRight size={20} className="rotate-90" />
              </div>

              {/* Right Wing Feed */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-500/10 border-l border-b border-blue-500/20 text-blue-400 font-black text-[7px] uppercase tracking-wider px-2 py-0.5 rounded-bl">
                  Corriente B (Derecha)
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{activeTopic.rightSource}</p>
                <p className="text-xs text-slate-300 font-serif italic leading-relaxed">
                  "{activeTopic.rightHeadline}"
                </p>
              </div>
            </div>
          </div>

          {/* COLUMNA 2: PROCESAMIENTO (LA CAJA NEGRA) */}
          <div className="lg:col-span-4 space-y-4 flex flex-col">
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">
              <Cpu size={14} className="text-secondary" />
              2. Procesamiento de IA
            </div>
            
            <div className="bg-black/80 rounded-2xl border border-white/10 p-4 font-mono text-[10px] text-emerald-400 min-h-[220px] max-h-[280px] overflow-y-auto flex flex-col justify-between shadow-inner relative">
              {/* Scanlines overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none bg-[size:100%_4px] opacity-10"></div>
              
              <div className="space-y-2 relative z-10 flex-1">
                {logs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 space-y-2 py-8">
                    <Terminal size={24} />
                    <p className="text-[10px] uppercase font-bold tracking-widest">Consola Lista</p>
                    <p className="text-[9px] lowercase font-medium">esperando inicio de procesamiento</p>
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
                <div ref={consoleEndRef} />
              </div>

              {simStatus === "idle" && (
                <div className="pt-4 relative z-10">
                  <button
                    onClick={runSimulation}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-black text-[9px] uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={12} className="animate-spin" />
                    Iniciar Procesamiento IA
                  </button>
                </div>
              )}

              {simStatus !== "idle" && simStatus !== "done" && (
                <div className="pt-4 text-center text-slate-500 font-bold uppercase text-[9px] animate-pulse flex items-center justify-center gap-1.5 relative z-10">
                  <RefreshCw size={10} className="animate-spin text-secondary" />
                  Ejecutando filtros lingüísticos...
                </div>
              )}

              {simStatus === "done" && (
                <div className="pt-4 relative z-10">
                  <button
                    onClick={resetSim}
                    className="w-full bg-white/5 hover:bg-white/10 text-slate-300 font-black text-[9px] uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    Resetear Consola
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA 3: SALIDA (NEUTRAL OUTPUT) */}
          <div className="lg:col-span-4 space-y-4 flex flex-col">
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">
              <CheckCircle2 size={14} className="text-secondary" />
              3. Salida Neutralizada
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              {simStatus !== "done" ? (
                <div className="h-full bg-white/5 border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-slate-500 space-y-3 py-10 min-h-[220px]">
                  <Cpu size={28} className="text-slate-600 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-wider">Esperando datos procesados</p>
                  <p className="text-[10px] leading-relaxed max-w-[200px]">Los resultados aparecerán al completar la simulación lingüística.</p>
                </div>
              ) : (
                <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[9px] bg-secondary text-slate-950 font-black px-2 py-0.5 rounded uppercase">
                      Aprobado por IA
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Reporte Neutral</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-black font-serif text-white leading-tight">
                      {activeTopic.neutralTitle}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans line-clamp-4">
                      {activeTopic.neutralSummary}
                    </p>
                  </div>

                  {/* Micro stats dashboard */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[8px] bg-black/40 border border-white/5 rounded-xl p-2 font-mono">
                    <div>
                      <div className="text-slate-500 uppercase">Adjetivos</div>
                      <div className="text-primary font-black">-{activeTopic.stats.adjectivesRemoved}</div>
                    </div>
                    <div className="border-x border-white/5">
                      <div className="text-slate-500 uppercase">Mitigado</div>
                      <div className="text-secondary font-black">{activeTopic.stats.biasMitigation}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 uppercase">Tiempo</div>
                      <div className="text-accent font-black">{activeTopic.stats.processingTime}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ================= DETALLES METODOLÓGICOS ================= */}
      <section className="bg-slate-950/40 border border-white/5 rounded-3xl p-8 space-y-6">
        <h2 className="text-2xl font-black font-serif text-white uppercase tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="text-secondary" />
          Nuestras 4 Directrices Algorítmicas de Escritura
        </h2>
        
        <p className="text-sm text-slate-400 leading-relaxed font-sans max-w-3xl">
          El periodismo moderno sufre una crisis de credibilidad. Para asegurar la imparcialidad radical, El Irónico programa a sus agentes de IA bajo parámetros lógicos inalterables diseñados para filtrar la paja retórica y rescatar la verdad empírica.
        </p>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-400 leading-relaxed">
            <li className="flex gap-3 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-[9px] flex-shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-white block mb-0.5">Erradicación de Adjetivos Evaluativos</strong>
                Se descartan calificativos subjetivos como "nefasto", "brutal", "catastrófico" u "histórico". Los hechos, cifras y porcentajes demuestran el peso por sí solos, sin sesgo emotivo.
              </div>
            </li>
            
            <li className="flex gap-3 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
              <span className="h-5 w-5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center font-black text-[9px] flex-shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-white block mb-0.5">Encuadre Equilibrado (Equal Framing)</strong>
                Si una noticia involucra una disputa o controversia de ideas, se obliga a la IA a presentar las declaraciones fácticas de ambos espectros ideológicos de forma equivalente, impidiendo favorecer a un bando mediante adjetivos.
              </div>
            </li>
            
            <li className="flex gap-3 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
              <span className="h-5 w-5 rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center justify-center font-black text-[9px] flex-shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-white block mb-0.5">Preservación de Declaraciones Directas</strong>
                Las citas textuales de políticos y protagonistas se aíslan estrictamente en bloques de cita `&lt;blockquote&gt;`, impidiendo que el algoritmo las parafrasee de un modo que pueda alterar su sentido fáctico.
              </div>
            </li>

            <li className="flex gap-3 items-start bg-white/5 p-4 rounded-2xl border border-white/5">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-[9px] flex-shrink-0 mt-0.5">4</span>
              <div>
                <strong className="text-white block mb-0.5">Atribución de Fuente de Fuente Abierta</strong>
                El Irónico preserva la trazabilidad total del reporte. Cada noticia reescrita enlaza visualmente a la fuente RSS cruda original, permitiendo al usuario contrastar el origen cuando lo desee.
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Closing Call to Action */}
      <footer className="text-center p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl space-y-4">
        <h3 className="text-xl font-black font-serif text-white">¿Quieres auditar el sistema en vivo?</h3>
        <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed font-sans">
          Navega a cualquiera de nuestros artículos en la portada y haz clic en la pestaña **"Comparar con Fuente Original"** o **"Auditoría de Sesgo de la IA"** para observar el contraste en tiempo real.
        </p>
        <div className="pt-2">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 px-6 py-3 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
          >
            Ir a la Portada
          </Link>
        </div>
      </footer>

    </div>
  );
}
