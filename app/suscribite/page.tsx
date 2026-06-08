import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import WaitlistForm from '@/components/WaitlistForm';
import GoogleRRMButton from '@/components/GoogleRRMButton';

const publicationId = process.env.NEXT_PUBLIC_GOOGLE_SWG_PUBLICATION_ID || 'CAowg7u3DA';

export default function SubscribePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">

      {/* ─────────────────────────────────────────────────────────────
          Script oficial de Google Reader Revenue Manager (SWG Basic)
          Se carga async y detecta automáticamente los botones con
          el atributo  swg-standard-button="subscription|contribution"
          ───────────────────────────────────────────────────────────── */}
      <Script
        src="https://news.google.com/swg/js/v1/swg-basic.js"
        strategy="afterInteractive"
      />

      {/*
        Init del SDK:
        - NO declaramos isPartOfProductId aquí porque esta es la página
          de COMPRA, no un artículo de pago. Si lo declaramos, Google
          muestra el "regwall" (muro de pago) en lugar del flujo de compra.
        - Solo configuramos la publicación y el idioma.
        - Los botones con swg-standard-button="subscription" abren
          directamente el catálogo de ofertas configurado en Publisher Center.
      */}
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

      <div className="bg-slate-950/60 border border-white/10 rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-black/50 space-y-16">

        {/* ─── Header ─── */}
        <header className="max-w-3xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-xs font-black uppercase tracking-[0.2em] text-primary">
            <Sparkles size={12} /> Suscripción El Irónico
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-serif text-white leading-tight">
            Apoyá el Periodismo Libre de Sesgos
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Elegí el plan que mejor se adapte a vos y accedé a toda la información
            neutralizada con inteligencia artificial, sin publicidad ni manipulaciones emocionales.
          </p>
        </header>

        {/* ─── Planes ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Plan Mensual */}
          <div className="rounded-2xl border border-white/10 bg-white/3 p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white">Plan Mensual · Plus</h2>
              <div className="text-4xl font-extrabold text-white">ARS&nbsp;8.000</div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Facturación mensual</p>
              <ul className="space-y-2 text-sm text-slate-300">
                {[
                  '📰 Acceso completo e ilimitado a todos los artículos',
                  '📧 Newsletter especial con análisis semanales',
                  '🙅 Experiencia de lectura 100% libre de anuncios',
                  '✨ Apoyo al periodismo neutral impulsado por IA',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              {/* swg-standard-button="subscription" → Google abre el flujo de suscripción */}
              <GoogleRRMButton
                type="subscription"
                label="Suscribirse — Plan Mensual"
                className="w-full"
              />
              <p className="text-[11px] text-slate-500 text-center">
                Pago seguro procesado por Google · Cancelá cuando quieras
              </p>
            </div>
          </div>

          {/* Plan Lifetime */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 flex flex-col justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-primary text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                Mejor valor
              </span>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-black text-white">Acceso Lifetime Premium</h2>
              <div className="text-4xl font-extrabold text-white">ARS&nbsp;15.000</div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Pago único — acceso de por vida</p>
              <ul className="space-y-2 text-sm text-slate-300">
                {[
                  '♾️ Acceso de por vida a todo el contenido del sitio',
                  '📧 Newsletter premium y análisis exclusivos profundos',
                  '🙅 Experiencia de lectura libre de anuncios para siempre',
                  '✨ Contribución directa al periodismo independiente',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <GoogleRRMButton
                type="subscription"
                label="Suscribirse — Plan Lifetime"
                className="w-full"
              />
              <p className="text-[11px] text-slate-500 text-center">
                Pago seguro procesado por Google · Un solo pago, acceso permanente
              </p>
            </div>
          </div>

        </div>

        {/* ─── Divider ─── */}
        <div className="border-t border-white/10 w-full" />

        {/* ─── Sección secundaria ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

          {/* Newsletter / Contacto */}
          <div className="rounded-3xl border border-white/5 bg-white/3 p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-2xl font-black font-serif text-white">
                ¿Querés recibir novedades?
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dejá tu correo para enterarte de nuevos planes, beneficios exclusivos y
                lanzamientos de nuevas herramientas de transparencia de El Irónico.
              </p>
              <WaitlistForm />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-primary hover:bg-primary/20 transition-all w-full text-center"
              >
                Contactanos
                <ArrowRight size={14} className="ml-2" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all w-full text-center"
              >
                Ir a Portada
              </Link>
            </div>
          </div>

          {/* Contribución directa (sin plan) */}
          <div className="rounded-3xl border border-white/5 bg-slate-950/45 p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-black font-serif text-white">
                Contribución Rápida
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                ¿Solo querés apoyar nuestro trabajo sin suscribirte a un plan a largo plazo?
                Podés realizar una contribución única directamente a través del sistema de Google.
              </p>
            </div>
            <div className="space-y-4 pt-4 border-t border-white/5">
              {/* swg-standard-button="contribution" → flujo de contribución única de RRM */}
              <GoogleRRMButton
                type="contribution"
                label="Contribuir con Google"
                className="w-full"
              />
              <p className="text-[11px] text-slate-500 text-center">
                Seguro y procesado de forma oficial por Google Reader Revenue Manager.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
