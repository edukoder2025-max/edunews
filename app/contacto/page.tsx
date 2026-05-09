export default function Contacto() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-12 text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Ponte en <span className="text-gradient">Contacto</span>
        </h1>
        <p className="text-slate-400 text-lg">
          ¿Tienes preguntas sobre nuestro modelo de Inteligencia Artificial, propuestas comerciales o necesitas soporte? Escríbenos.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-300">Nombre completo</label>
              <input 
                type="text" 
                id="name" 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">Correo electrónico</label>
              <input 
                type="email" 
                id="email" 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="juan@ejemplo.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-slate-300">Asunto</label>
            <select 
              id="subject" 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
            >
              <option>Información General</option>
              <option>Prensa y Medios</option>
              <option>Publicidad (AdSense / Directa)</option>
              <option>Soporte Técnico</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-slate-300">Mensaje</label>
            <textarea 
              id="message" 
              rows={5}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
              placeholder="¿En qué podemos ayudarte hoy?"
            ></textarea>
          </div>
          <button 
            type="button" 
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Enviar Mensaje
          </button>
          <p className="text-xs text-center text-slate-500 mt-4">
            Al enviar este formulario, aceptas nuestra <a href="/privacidad" className="text-primary hover:underline">Política de Privacidad</a>.
          </p>
        </form>
      </div>
    </div>
  );
}
