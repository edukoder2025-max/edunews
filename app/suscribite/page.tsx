import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function SubscribePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      <Script
        src="https://news.google.com/swg/js/v1/swg-basic.js"
        strategy="afterInteractive"
        async
      />
      <Script id="google-swg-init" strategy="afterInteractive">
        {`(self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
          basicSubscriptions.init({
            type: "NewsArticle",
            isPartOfType: ["Product"],
            isPartOfProductId: "CAowg7u3DA:openaccess",
            clientOptions: { theme: "light", lang: "es-419" },
          });
        });`}
      </Script>
      <div className="bg-slate-950/60 border border-white/10 rounded-[2rem] p-10 lg:p-14 shadow-2xl shadow-black/40">
        <header className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-xs uppercase tracking-[0.35em] text-primary font-black">Suscripción El Irónico</p>
          <h1 className="text-5xl md:text-6xl font-black font-serif text-white leading-tight">Accede a noticias exclusivas y mantén activo el periodismo neutral</h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Pronto vamos a habilitar el muro de pago para que puedas suscribirte y apoyar el periodismo independiente de El Irónico. Mientras tanto, podés contactarnos directamente para recibir aviso cuando esté disponible.
          </p>
        </header>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="space-y-8">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-4">
              <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                <CheckCircle size={18} /> Beneficios
              </div>
              <ul className="space-y-3 text-slate-300 text-sm leading-relaxed">
                <li>✔️ Noticias neutralizadas por IA sin sesgos políticos.</li>
                <li>✔️ Acceso anticipado a análisis y resúmenes exclusivos.</li>
                <li>✔️ Contenidos seleccionados para lectores críticos.</li>
                <li>✔️ Apoyo directo a un periodismo independiente y transparente.</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-4">
              <h2 className="text-2xl font-black text-white">¿Qué vas a encontrar aquí?</h2>
              <p className="text-slate-400 leading-relaxed">
                Esta página será la base de suscripción de El Irónico. Cuando el paywall esté activo, te permitirá elegir planes, ver beneficios y suscribirte con facilidad.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Por ahora, podés dejar tu contacto y te avisaremos cuando abramos la suscripción. También podés consultar sobre planes personalizados para empresas o lectores frecuentes.
              </p>
            </section>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-white">¿Querés recibir aviso?</h3>
              <p className="text-slate-400 leading-relaxed">
                Dejá tu correo o escribinos y te avisamos apenas esté listo el muro de pago. Mientras tanto, podés seguirnos y leer todas las noticias gratis.
              </p>
            </div>

            <div className="space-y-4">
              <Link href="/contacto" className="inline-flex items-center justify-center w-full rounded-full bg-primary px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-primary/90">
                Contactanos ahora
                <ArrowRight size={18} className="ml-3" />
              </Link>
              <Link href="/" className="inline-flex items-center justify-center w-full rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                Volver a la portada
              </Link>
            </div>

            <div className="mt-6 rounded-3xl border border-primary/20 bg-primary/5 p-6 text-center">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-3">Botón de contribución</p>
              <p className="text-sm text-slate-300 mb-6">
                Este botón abre el CTA de contribución de Google directamente en la página.
              </p>
              <button
                swg-standard-button="contribution"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:bg-primary/90"
              >
                Contribuí con Google
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 font-bold mb-3">Consejo rápido</p>
              <p className="text-slate-300 text-sm leading-relaxed">
                Usa esta página como destino del botón de tu CTA: así la experiencia de usuario ya está lista cuando actives el muro de pago.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
