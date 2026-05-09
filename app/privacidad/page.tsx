export default function Privacidad() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 prose prose-invert prose-slate">
      <h1 className="text-3xl font-bold mb-8">Política de Privacidad</h1>
      <p className="text-slate-400 mb-4">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">1. Introducción</h2>
      <p className="text-slate-300 mb-4">En EduNews, el primer periódico digital impulsado por IA para un periodismo ético, la privacidad de nuestros visitantes es de extrema importancia. Este documento detalla qué tipos de información personal recopilamos y cómo la utilizamos.</p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">2. Uso de Google AdSense y Cookies DoubleClick DART</h2>
      <p className="text-slate-300 mb-4">Google, como proveedor externo, utiliza cookies para publicar anuncios en EduNews. El uso de la cookie DART por parte de Google le permite servir anuncios a nuestros usuarios basados en su visita a nuestros sitios y otros sitios en Internet.</p>
      <p className="text-slate-300 mb-4">Los usuarios pueden inhabilitar el uso de la cookie DART a través del anuncio de Google y la política de privacidad de la red de contenido en la siguiente URL: <a href="http://www.google.com/privacy_ads.html" className="text-primary hover:underline" target="_blank" rel="noreferrer">http://www.google.com/privacy_ads.html</a></p>

      <h2 className="text-xl font-semibold mt-8 mb-4">3. Archivos de Registro</h2>
      <p className="text-slate-300 mb-4">Como muchos otros sitios web, EduNews hace uso de archivos de registro. La información dentro de los archivos de registro incluye el protocolo de internet (IP), el tipo de navegador, el proveedor de servicios de internet (ISP), el sello de fecha/hora, páginas de referencia/salida y el número de clics para analizar tendencias, administrar el sitio, rastrear el movimiento de los usuarios y recopilar información demográfica.</p>

      <h2 className="text-xl font-semibold mt-8 mb-4">4. Política de Contenido de IA</h2>
      <p className="text-slate-300 mb-4">EduNews utiliza Inteligencia Artificial para curar y reescribir noticias de diversas fuentes públicas con el único fin de eliminar sesgos políticos y fomentar un periodismo ético. No recolectamos información personal en el proceso de generación de noticias.</p>

      <h2 className="text-xl font-semibold mt-8 mb-4">5. Contacto</h2>
      <p className="text-slate-300 mb-4">Si requiere más información o tiene preguntas sobre nuestra política de privacidad, no dude en contactarnos a través de nuestra página de <a href="/contacto" className="text-primary hover:underline">Contacto</a>.</p>
    </div>
  );
}
