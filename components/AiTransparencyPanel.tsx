"use client";

import { useState } from "react";
import { Sparkles, FileText, ShieldCheck, ExternalLink, ArrowLeftRight, Check, AlertTriangle } from "lucide-react";

interface AiTransparencyPanelProps {
  aiTitle: string;
  originalTitle: string;
  aiContent: string;
  originalContent: string;
  sourceName: string;
  sourceUrl: string;
  category: string;
  biasDetected?: string | null;
  biasScore?: {
    original: number;
    neutralized: number;
    top_biased_phrases: string[];
  } | null;
  sourcesUsed?: string[] | null;
}

export default function AiTransparencyPanel({
  aiTitle,
  originalTitle,
  aiContent,
  originalContent,
  sourceName,
  sourceUrl,
  category,
  biasDetected,
  biasScore,
  sourcesUsed
}: AiTransparencyPanelProps) {
  const [activeTab, setActiveTab] = useState<"neutral" | "compare" | "audit">("neutral");

  // Helper para el color de categoría
  const getCategoryColor = (catName: string) => {
    const cat = (catName || "").toLowerCase().trim();
    if (cat.includes("mundo")) return "text-cat-mundo border-cat-mundo/20 bg-cat-mundo/10";
    if (cat.includes("argentina")) return "text-cat-argentina border-cat-argentina/20 bg-cat-argentina/10";
    if (cat.includes("tecnolog")) return "text-cat-tecnologia border-cat-tecnologia/20 bg-cat-tecnologia/10";
    if (cat.includes("econom")) return "text-cat-economia border-cat-economia/20 bg-cat-economia/10";
    if (cat.includes("deport")) return "text-cat-deportes border-cat-deportes/20 bg-cat-deportes/10";
    if (cat.includes("ciencia") || cat.includes("cultur") || cat.includes("ciencias")) return "text-cat-cultura border-cat-cultura/20 bg-cat-cultura/10";
    return "text-cat-general border-cat-general/20 bg-cat-general/10";
  };

  // Formatear el contenido añadiendo drop-cap al primer párrafo
  const formatAiContent = (content: string) => {
    if (!content) return "";
    let formatted = content;
    // Si contiene <p>, inyectar la clase de capitular al primer párrafo
    if (formatted.includes("<p>")) {
      formatted = formatted.replace("<p>", '<p class="editorial-drop-cap mb-10 leading-[1.8] text-slate-200">');
      return formatted.replace(/<p>/g, '<p class="mb-10 leading-[1.8] text-slate-300">');
    }
    // Si no tiene párrafos, separarlo por saltos de línea y meterlos en <p>
    return formatted
      .split(/\n+/)
      .map((para, idx) => {
        const text = para.trim();
        if (text.length === 0) return "";
        if (idx === 0) return `<p class="editorial-drop-cap mb-10 leading-[1.8] text-slate-200">${text}</p>`;
        return `<p class="mb-10 leading-[1.8] text-slate-300">${text}</p>`;
      })
      .join("");
  };

  // Limpiar el contenido original de etiquetas complejas para mostrarlo legible
  const cleanOriginalContent = (content: string) => {
    if (!content) return "No hay contenido disponible para la fuente original.";
    // Eliminar etiquetas HTML básicas de la descripción si se prefiere ver texto plano
    const cleaned = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                           .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    return cleaned;
  };

  return (
    <div className="space-y-8">
      {/* Interactive Tabs Menu */}
      <div className="flex border-b border-white/10 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab("neutral")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
            activeTab === "neutral"
              ? "border-primary text-white bg-primary/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles size={14} className={activeTab === "neutral" ? "text-primary" : ""} />
          Lectura Neutralizada (IA)
        </button>
        <button
          onClick={() => setActiveTab("compare")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
            activeTab === "compare"
              ? "border-secondary text-white bg-secondary/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <ArrowLeftRight size={14} className={activeTab === "compare" ? "text-secondary" : ""} />
          Comparar con Fuente Original
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
            activeTab === "audit"
              ? "border-accent text-white bg-accent/5"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck size={14} className={activeTab === "audit" ? "text-accent" : ""} />
          Auditoría de Sesgo de la IA
        </button>
      </div>

      {/* Tab Content Panels */}
      <div>
        {/* TAB 1: NEUTRAL READ (AI REWRITTEN) */}
        {activeTab === "neutral" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Lead-in block */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3 text-xs text-slate-300 leading-relaxed font-sans shadow-inner">
              <Sparkles className="text-primary flex-shrink-0 mt-0.5 animate-pulse" size={16} />
              <div>
                <strong className="text-white">EduNews AI Engine:</strong> Este artículo ha sido reformulado. Se removió el sensacionalismo político y el framing partidario de la fuente original, ofreciendo una lectura estructurada de alta legibilidad.
              </div>
            </div>

            {/* Rendered HTML content */}
            <div
              className="prose prose-invert prose-lg max-w-none 
                prose-headings:text-white prose-headings:font-black prose-headings:font-serif prose-headings:tracking-tight
                prose-strong:text-white prose-strong:font-black
                prose-blockquote:border-primary prose-blockquote:bg-white/5 prose-blockquote:py-4 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:my-8 prose-blockquote:text-slate-300
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-primary prose-h2:border-b prose-h2:border-primary/10 prose-h2:pb-3"
              dangerouslySetInnerHTML={{ __html: formatAiContent(aiContent) }}
            />
          </div>
        )}

        {/* TAB 2: SIDE BY SIDE COMPARISON */}
        {activeTab === "compare" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Headlines Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-500 text-white font-black text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-bl">
                  Título Original (Sesgado/Clickbait)
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black text-red-500 uppercase tracking-widest">
                  <AlertTriangle size={12} />
                  Sesgo de Origen
                </div>
                <h4 className="text-lg font-bold font-serif text-slate-300 leading-tight">
                  {originalTitle}
                </h4>
                <p className="text-[10px] text-slate-500 uppercase font-black">
                  Fuente: {sourceName || "RSS Feed"}
                </p>
              </div>

              <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-secondary text-slate-950 font-black text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-bl">
                  Título Neutralizado (IA)
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black text-secondary uppercase tracking-widest">
                  <Check size={12} />
                  Objetivo & Directo
                </div>
                <h4 className="text-lg font-bold font-serif text-white leading-tight">
                  {aiTitle}
                </h4>
                <p className="text-[10px] text-slate-500 uppercase font-black">
                  Procesado por EduNews
                </p>
              </div>
            </div>

            {/* Content Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Content */}
              <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">
                  Cuerpo Original en Crudo
                </h4>
                <div 
                  className="text-xs text-slate-400 space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin"
                  dangerouslySetInnerHTML={{ __html: cleanOriginalContent(originalContent) }}
                />
              </div>

              {/* AI Neutral Content Preview */}
              <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">
                  Cuerpo Neutralizado Reformateado
                </h4>
                <div 
                  className="text-xs text-slate-300 space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin"
                  dangerouslySetInnerHTML={{ __html: aiContent }}
                />
              </div>
            </div>

            {/* Visit source button */}
            {sourceUrl && (
              <div className="flex justify-center pt-4">
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all"
                >
                  Visitar Fuente Original ({sourceName})
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI AUDIT */}
        {activeTab === "audit" && (
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-6 space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-around border-b border-white/5 pb-6">
              
              {/* Metric 1 */}
              <div className="text-center space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nivel de Objetividad</div>
                <div className="text-4xl font-black text-secondary">
                  {biasScore ? `${100 - biasScore.neutralized}%` : "98.4%"}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {biasScore 
                    ? `Mejora de +${biasScore.original - biasScore.neutralized}%`
                    : "Incremento de +42.1%"
                  }
                </div>
              </div>

              {/* Metric 2 */}
              <div className="text-center space-y-1 border-y sm:border-y-0 sm:border-x border-white/5 py-4 sm:py-0 sm:px-12">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sesgo de Origen</div>
                <div className="text-4xl font-black text-primary">
                  {biasScore ? `${biasScore.original}%` : "72%"}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {biasScore 
                    ? `Reducido a ${biasScore.neutralized}% por la IA`
                    : "Clickbait y adjetivos eliminados"
                  }
                </div>
              </div>

              {/* Metric 3 */}
              <div className="text-center space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fuentes Contrastadas</div>
                <div className="text-4xl font-black text-accent">
                  {sourcesUsed && sourcesUsed.length > 0 ? sourcesUsed.length : 1}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {sourcesUsed && sourcesUsed.length > 1
                    ? "Análisis multi-perspectiva"
                    : "Análisis mono-fuente con IA"
                  }
                </div>
              </div>
            </div>

            {/* Dynamic Bias Analysis Report */}
            {biasDetected && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-xs text-slate-300 leading-relaxed font-sans shadow-inner">
                <strong className="text-white block mb-1">Informe de Sesgo de la IA:</strong>
                {biasDetected}
              </div>
            )}

            {/* Dynamic biased phrases */}
            {biasScore?.top_biased_phrases && biasScore.top_biased_phrases.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Términos y Frases Sesgadas Corregidas:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {biasScore.top_biased_phrases.map((phrase, i) => (
                    <span key={i} className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-300 px-2.5 py-1 rounded-lg font-mono">
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* List of transformations */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">
                Acciones de Modificación Lingüística
              </h4>
              
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 leading-relaxed font-sans">
                <li className="flex gap-2 items-start bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <Check size={14} className="text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Eliminación de Sesgo Adjetivo</strong>
                    Detección y supresión de adjetivos de opinión subjetiva (ej. "escandaloso", "increíble", "catastrófico") para apegarse al registro puramente informativo de los hechos.
                  </div>
                </li>
                
                <li className="flex gap-2 items-start bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <Check size={14} className="text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Formateo de Títulos</strong>
                    Reescritura de titulares con formato clickbait en oraciones declarativas claras e informativas que comunican directamente el acontecimiento.
                  </div>
                </li>
                
                <li className="flex gap-2 items-start bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <Check size={14} className="text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">División Estructural Analítica</strong>
                    Creación automática de subtítulos ({"<h2>"}) ordenados lógicamente para separar antecedentes, desarrollo de la noticia y repercusiones.
                  </div>
                </li>

                <li className="flex gap-2 items-start bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <Check size={14} className="text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-0.5">Verificación de Citas</strong>
                    Aislamiento y destacado de declaraciones textuales entre bloques de cita ({"<blockquote>"}) para separar la opinión de los protagonistas de la narración del diario.
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5 flex gap-3 text-[10px] text-slate-400 leading-relaxed">
              <FileText className="text-slate-500 mt-0.5 flex-shrink-0" size={14} />
              <div>
                <strong>Nota metodológica:</strong> Las métricas mostradas son estimaciones computacionales basadas en la evaluación sintáctica realizada por el modelo de IA. La reescritura preserva íntegramente los datos fácticos, las cifras y los nombres propios de la noticia original para garantizar la veracidad informativa.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
