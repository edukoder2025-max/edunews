export default function Terminos() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 prose prose-invert prose-slate">
      <h1 className="text-3xl font-bold mb-8">Términos y Condiciones de Uso</h1>
      <p className="text-slate-400 mb-4">Última actualización: {new Date().toLocaleDateString('es-ES')}</p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">1. Aceptación de los Términos</h2>
      <p className="text-slate-300 mb-4">Al acceder al sitio web EduNews, usted acepta estar sujeto a estos términos de servicio, a todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de cualquier ley local aplicable. Si no está de acuerdo con alguno de estos términos, tiene prohibido utilizar o acceder a este sitio.</p>

      <h2 className="text-xl font-semibold mt-8 mb-4">2. Naturaleza del Contenido y Periodismo Ético con IA</h2>
      <p className="text-slate-300 mb-4">EduNews es un medio informativo automatizado que emplea modelos avanzados de Inteligencia Artificial para reescribir y resumir noticias públicas globales. Nuestro objetivo es presentar la información libre de sesgos políticos, buscando el periodismo ético y neutral. Sin embargo, no garantizamos la absoluta exactitud o actualidad de toda la información en un momento dado, dado que la IA puede estar sujeta a alucinaciones o errores de las fuentes originales.</p>

      <h2 className="text-xl font-semibold mt-8 mb-4">3. Limitaciones</h2>
      <p className="text-slate-300 mb-4">En ningún caso EduNews o sus proveedores serán responsables de ningún daño (incluyendo, sin limitación, daños por pérdida de datos o ganancias, o debido a la interrupción del negocio) que surja del uso o la incapacidad de usar los materiales en EduNews.</p>

      <h2 className="text-xl font-semibold mt-8 mb-4">4. Enlaces</h2>
      <p className="text-slate-300 mb-4">EduNews no ha revisado todos los sitios vinculados a su sitio web y no es responsable del contenido de dichos sitios vinculados. La inclusión de cualquier enlace no implica el respaldo por parte de EduNews del sitio. El uso de cualquier sitio web vinculado es bajo el propio riesgo del usuario.</p>
    </div>
  );
}
