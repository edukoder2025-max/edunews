import { ShieldAlert, BookOpen, Layers, CheckCircle2, RefreshCw, Mail } from "lucide-react";
import Link from "next/link";

export default function MetodologiaPage() {
  const categories = [
    {
      name: "Fuentes Globales / Agencias Neutras",
      description: "Agencias internacionales de noticias con estándares de neutralidad fáctica.",
      feeds: [
        { name: "BBC Mundo", type: "Global Centrista", domain: "bbc.co.uk/mundo" },
        { name: "El País", type: "España / Centro-Izquierda", domain: "elpais.com" },
        { name: "El Mundo", type: "España / Centro-Derecha", domain: "elmundo.es" },
        { name: "RTVE Noticias", type: "España / Pública", domain: "rtve.es" }
      ]
    },
    {
      name: "Argentina (Espectro Progresista / Keynesianismo)",
      description: "Medios con línea editorial de centro-izquierda, socialismo o enfoque estatal.",
      feeds: [
        { name: "Página 12", type: "Izquierda Nacional", domain: "pagina12.com.ar" },
        { name: "La Izquierda Diario", type: "Socialismo-Marxismo", domain: "laizquierdadiario.com" },
        { name: "Ámbito Financiero", type: "Centro-Izquierda Económica", domain: "ambito.com" },
        { name: "elDiario.es", type: "España / Progresismo", domain: "eldiario.es" }
      ]
    },
    {
      name: "Argentina (Espectro Conservador / Liberal / Finanzas)",
      description: "Medios con enfoque comercial, centrista, liberal, libertario o de negocios.",
      feeds: [
        { name: "TN Noticias", type: "Centro-Derecha Comercial", domain: "tn.com.ar" },
        { name: "Clarín", type: "Centro Comercial", domain: "clarin.com" },
        { name: "La Nación", type: "Conservador-Liberal", domain: "lanacion.com.ar" },
        { name: "Infobae", type: "Centro-Derecha Masivo", domain: "infobae.com" },
        { name: "El Cronista", type: "Negocios y Finanzas", domain: "cronista.com" },
        { name: "Libertad Digital", type: "España / Liberal-Libertario", domain: "libertaddigital.com" },
        { name: "Perfil", type: "Centrista Analítico", domain: "perfil.com" }
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Header */}
      <header className="text-center space-y-4">
        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-black tracking-widest uppercase inline-block">
          Algoritmos y Transparencia
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-white font-serif tracking-tight uppercase italic">
          Metodología <span className="text-gradient">Editorial</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Explicación detallada de cómo funciona el motor de inteligencia artificial de EduNews para asegurar noticias neutrales y balanceadas.
        </p>
      </header>

      {/* 1. Las 4 Directrices Editoriales */}
      <section className="bg-slate-950/40 border border-white/5 rounded-3xl p-8 space-y-6">
        <h2 className="text-2xl font-black font-serif text-white uppercase tracking-tight flex items-center gap-2.5">
          <BookOpen className="text-secondary" />
          1. Directrices Algorítmicas de Neutralización
        </h2>
        
        <p className="text-sm text-slate-400 leading-relaxed font-sans">
          Nuestro motor de IA no opina ni escribe artículos de opinión. Está restringido a reescribir la información de referencia bajo cinco directrices matemáticas inalterables:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-400 leading-relaxed pt-2">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
            <strong className="text-white block">A. Remoción de Adjetivos Subjetivos</strong>
            <p>Se eliminan calificativos que denotan opinión, valor o emoción del redactor (ej. <em>brutal, catastrófico, excelente, fracaso, histórico</em>). Se preservan únicamente los hechos empíricos y datos objetivos.</p>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
            <strong className="text-white block">B. Encuadre Simétrico (Equal Framing)</strong>
            <p>En acontecimientos polarizados o de debate político, la IA presenta las explicaciones y argumentos de ambos lados del espectro ideológico con igual espacio de texto y con fórmulas verbales neutras.</p>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
            <strong className="text-white block">C. Aislamiento de Declaraciones Directas</strong>
            <p>Las opiniones o justificaciones de políticos y protagonistas siempre se enmarcan dentro de bloques de cita (`&lt;blockquote&gt;`), indicando claramente quién lo dice, sin parafraseo que altere el sentido original.</p>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
            <strong className="text-white block">D. Preservación Estricta de Datos Numéricos</strong>
            <p>Los precios, cotizaciones, porcentajes de inflación, fechas y estadísticas oficiales se consideran hechos factuales del original y se conservan exactamente igual con sus unidades de medida correspondientes.</p>
          </div>
        </div>
      </section>

      {/* 2. Fuentes Monitoreadas */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black font-serif text-white uppercase tracking-tight flex items-center gap-2.5">
          <Layers className="text-primary" />
          2. Fuentes Monitoreadas y Balance Ideológico
        </h2>
        
        <p className="text-sm text-slate-400 leading-relaxed font-sans max-w-3xl">
          Para garantizar la diversidad de perspectivas, monitoreamos medios de comunicación de distintos orígenes y tendencias editoriales declaradas. A continuación se detalla la lista de fuentes utilizadas:
        </p>

        <div className="space-y-8 pt-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-500">{cat.description}</p>
              
              <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                      <th className="p-4">Medio</th>
                      <th className="p-4">Tendencia / Enfoque</th>
                      <th className="p-4">Dominio web</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {cat.feeds.map((feed, fIdx) => (
                      <tr key={fIdx} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white">{feed.name}</td>
                        <td className="p-4">{feed.type}</td>
                        <td className="p-4 font-mono text-[11px] text-slate-500">{feed.domain}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Cálculo de Objetividad */}
      <section className="bg-slate-950/40 border border-white/5 rounded-3xl p-8 space-y-6">
        <h2 className="text-2xl font-black font-serif text-white uppercase tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="text-secondary" />
          3. Cálculo del Índice de Neutralidad
        </h2>

        <div className="space-y-4 text-sm text-slate-400 leading-relaxed font-sans">
          <p>
            El <strong>Índice de Neutralidad</strong> o Nivel de Objetividad que se muestra en la pestaña de auditoría se calcula en tiempo real por el auditor de la IA comparando la noticia cruda del feed RSS frente al texto limpio generado.
          </p>
          
          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Fórmula de Estimación de Sesgo:</h4>
            <div className="font-mono text-xs text-primary bg-black/40 p-4 rounded-xl text-center">
              Sesgo = (Número de adjetivos cargados + Términos tendenciosos + Frases de framing unilateral) / Total Palabras * 100
            </div>
            <p className="text-xs text-slate-500">
              El <strong>Nivel de Objetividad</strong> resultante es <span className="font-bold text-white">100 - Sesgo</span>. Nuestro objetivo es llevar cada noticia a un nivel superior al 95% de objetividad sintáctica.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Actualización y Auditoría */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 space-y-3">
          <RefreshCw className="text-primary animate-spin" size={28} />
          <h3 className="text-base font-black uppercase tracking-wider text-white">Frecuencia y Actualización</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nuestro portal ejecuta un proceso cron automatizado cada 2 horas que consulta los feeds RSS, filtra noticias duplicadas y reescribe los últimos 3 artículos de cada fuente. No hay editores humanos que modifiquen la redacción de la IA, garantizando un flujo sistemático y libre de sesgo humano adicional.
          </p>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 space-y-3">
          <Mail className="text-secondary" size={28} />
          <h3 className="text-base font-black uppercase tracking-wider text-white">Revisión Humana y Reportes</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dado que los modelos LLM pueden cometer fallos temporales (alucinaciones de estilo), un administrador revisa semanalmente los reportes enviados por los lectores. Si encuentras un artículo sesgado, puedes reportarlo a <a href="mailto:edukoder2025@gmail.com" className="text-primary hover:underline">edukoder2025@gmail.com</a> indicando la URL para refinar nuestro prompt de control.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="text-center pt-8 border-t border-white/5">
        <Link 
          href="/como-funciona" 
          className="inline-flex items-center gap-1.5 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all"
        >
          Probar Simulador de IA en Vivo
        </Link>
      </footer>

    </div>
  );
}
