import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Sparkles } from 'lucide-react';
import ContributionButton from '@/components/ContributionButton';
import PlanCard from '@/components/PlanCard';
import WaitlistForm from '@/components/WaitlistForm';

export default function SubscribePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
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
          // Expose the instance so swgClient.ts can call methods directly
          window.SWG_BASIC = basicSubscriptions;
          window.dispatchEvent(new Event('swg-ready'));
        });`}
      </Script>

      <div className="bg-slate-950/60 border border-white/10 rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-black/50 space-y-16">
        {/* Header */}
        <header className="max-w-3xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-xs font-black uppercase tracking-[0.2em] text-primary">
            <Sparkles size={12} /> Suscripción El Irónico
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-serif text-white leading-tight">
            Apoyá el Periodismo Libre de Sesgos
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Elegí el plan que mejor se adapte a vos y accedé a toda la información neutralizada con inteligencia artificial, sin publicidad ni manipulaciones emocionales.
          </p>
        </header>

        {/* Section 1: Planes Disponibles */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PlanCard
              title="Plan Mensual - Plus"
              price="ARS 8.000"
              billing="Mensual"
              bullets={[
                "📰 Acceso completo e ilimitado a todos los artículos",
                "📧 Newsletter especial con análisis semanales",
                "🙅 Experiencia de lectura 100% libre de anuncios",
                "✨ Apoyo al periodismo neutral impulsado por IA"
              ]}
              productId="SWGPD.8127-6310-7908-87558"
            />
            <PlanCard
              title="Acceso Lifetime Premium"
              price="ARS 15.000"
              billing="Una sola vez"
              bullets={[
                "♾️ Acceso de por vida a todo el contenido del sitio",
                "📧 Newsletter premium y análisis exclusivos profundos",
                "🙅 Experiencia de lectura libre de anuncios para siempre",
                "✨ Contribución directa para sostener el periodismo independiente"
              ]}
              productId="SWGPD.6766-5588-5806-80332"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 w-full" />

        {/* Section 2: Secondary options (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Column 1: Waitlist / Contact */}
          <div className="rounded-3xl border border-white/5 bg-white/3 p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-2xl font-black font-serif text-white">
                ¿Querés recibir novedades?
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dejá tu correo para enterarte de nuevos planes, beneficios exclusivos y lanzamientos de nuevas herramientas de transparencia de El Irónico.
              </p>
              <WaitlistForm />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
              <Link href="/contacto" className="inline-flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 px-6 py-3 text-xs font-black uppercase tracking-[0.15em] text-primary hover:bg-primary/20 transition-all w-full text-center">
                Contactanos
                <ArrowRight size={14} className="ml-2" />
              </Link>
              <Link href="/" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all w-full text-center">
                Ir a Portada
              </Link>
            </div>
          </div>

          {/* Column 2: Direct SWG Contribution */}
          <div className="rounded-3xl border border-white/5 bg-slate-950/45 p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-black font-serif text-white">
                Contribución Rápida
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                ¿Solo querés apoyar nuestro trabajo sin suscribirte a un plan a largo plazo? Podés realizar una contribución única directamente a través del sistema de Google.
              </p>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-white/5">
              <ContributionButton className="w-full" />
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
