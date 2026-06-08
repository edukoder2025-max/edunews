import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase italic">Contacto</h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">¿Tienes una primicia, una sugerencia o quieres anunciarte? Estamos aquí para escucharte.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Canales de Email */}
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Mail className="text-primary" /> Canales Directos
          </h2>
          
          <div className="space-y-6">
            <div className="group">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Redacción Editorial</p>
              <a href="mailto:edukoder2025@gmail.com" className="text-lg text-slate-200 hover:text-white transition-colors font-medium underline decoration-primary/30 underline-offset-4">
                edukoder2025@gmail.com
              </a>
            </div>

            <div className="group">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Soporte Técnico</p>
              <a href="mailto:sarmientoisrael118@gmail.com" className="text-lg text-slate-200 hover:text-white transition-colors font-medium underline decoration-primary/30 underline-offset-4">
                sarmientoisrael118@gmail.com
              </a>
            </div>

            <div className="group">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Publicidad y Ventas</p>
              <a href="mailto:23sarmiento@gmail.com" className="text-lg text-slate-200 hover:text-white transition-colors font-medium underline decoration-primary/30 underline-offset-4">
                23sarmiento@gmail.com
              </a>
            </div>
          </div>
        </div>
        
        {/* Otros Medios */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-primary/10 to-transparent p-8 rounded-3xl border border-primary/20 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3 mb-6">
                <Phone className="text-primary" /> Atención al Lector
              </h2>
              <p className="text-slate-300 leading-relaxed mb-8">
                Para consultas urgentes o WhatsApp de redacción, puedes contactarnos al siguiente número:
              </p>
              <a href="tel:+543541237972" className="text-3xl font-black text-white hover:text-primary transition-colors tracking-tighter">
                +54 354 123 7972
              </a>
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/5">
              <p className="text-sm font-bold text-white italic opacity-80 flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> Redacción Descentralizada (Argentina)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20 text-center p-12 glass-panel rounded-3xl border border-white/5">
        <h3 className="text-2xl font-black text-white mb-4">Misión Editorial</h3>
        <p className="text-slate-400 max-w-3xl mx-auto italic leading-relaxed">
          "En El Irónico, nuestro compromiso es con la verdad y la tecnología. Utilizamos la Inteligencia Artificial no para reemplazar el criterio humano, sino para potenciar la neutralidad y el acceso a la información ética y transparente."
        </p>
      </div>
    </div>
  );
}
