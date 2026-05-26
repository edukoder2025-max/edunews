import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with the API key from environment variables
// Initialize instances for both primary and fallback keys
const genAIPrimary = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const genAIFallback = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_FALLBACK || '');

export const getGeminiModel = (useFallback = false) => {
  const genAI = useFallback ? genAIFallback : genAIPrimary;
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: "application/json" }
  });
};

// Función para asegurar una estructura HTML impecable
function cleanHtml(html: string): string {
  if (!html) return '';

  // Limpieza profunda: convertimos cualquier tipo de salto de línea en cierre y apertura de párrafo
  let cleaned = html
    .replace(/<\/p>\s*<p>/gi, '</p>\n<p>') // Normalizar párrafos existentes
    .replace(/<br\s*\/?>/gi, '</p><p>')    // Convertir BR en párrafos
    .replace(/\n/g, '</p><p>')             // CUALQUIER salto de línea se vuelve un párrafo nuevo
    .replace(/<p>\s*<\/p>/g, '')           // Eliminar párrafos vacíos
    .trim();

  if (!cleaned.startsWith('<p>')) {
    cleaned = `<p>${cleaned}`;
  }
  if (!cleaned.endsWith('</p>')) {
    cleaned = `${cleaned}</p>`;
  }

  // Corregir posibles anidamientos erróneos de <p><p>
  cleaned = cleaned.replace(/<p>\s*<p>/g, '<p>').replace(/<\/p>\s*<\/p>/g, '</p>');

  return cleaned;
}

export async function rewriteNews(originalTitle: string, originalContent: string) {
  const prompt = `
  Actúa como un Auditor de Datos y Redactor Jefe de un prestigioso y neutral servicio de prensa internacional. Tu misión es transformar la información de referencia en un reportaje periodístico impecable, libre de sesgos y de una neutralidad científica absoluta.

  DIRECTRICES DE NEUTRALIDAD RADICAL (MUY IMPORTANTE):
  1. ELIMINACIÓN DE SESGO ADJETIVO: Identifica y remueve todos los adjetivos cargados emocionalmente (ej. "catastrófico", "histórico", "nefasto", "brillante", "ajuste salvaje", "especulación feroz", "éxito rotundo"). Los hechos y cifras deben hablar por sí mismos.
  2. ENCUADRE DE OPINIÓN (FRAMING): Si la información cruda contiene disputas o declaraciones políticas, preséntalas de forma estrictamente simétrica. No tomes partido gramatical. Utiliza fórmulas de atribución neutras: "El sector oficial argumenta que..." y "La oposición sostiene que...".
  3. TRATAMIENTO DE CITAS: Las opiniones subjetivas de los protagonistas de la noticia deben aislarse estrictamente en etiquetas <blockquote>...</blockquote>. La IA nunca debe afirmar como hecho objetivo la opinión de un tercero.
  4. RIGOR FÁCTICO (CERO ALUCINACIONES): No inventes nombres, fechas, cifras ni estadísticas que no existan en el texto de referencia. La transparencia exige apegarse estrictamente a los hechos comprobables del original.

  ESTRUCTURA HTML OBLIGATORIA (MUY IMPORTANTE):
  1. CADA PÁRRAFO debe estar encerrado en etiquetas <p>...</p>. No uses saltos de línea simples.
  2. LOS SUBTÍTULOS deben ser etiquetas <h2>...</h2> atractivas, lógicas e informativas (nunca sensacionalistas). ¡No los pongas como texto plano ni solo con negritas!
  3. LA ENTRADILLA: El primer párrafo debe ser <p><strong>...</strong></p> (solo el primer párrafo). Debe resumir objetivamente el Qué, Quién, Cuándo y Dónde del hecho.
  4. ESPACIADO: Asegúrate de que el contenido fluya. Usa <blockquote> para citas importantes si las hay.
  5. PROHIBICIÓN: No devuelvas texto sin etiquetas HTML. Todo el contenido de "new_content" debe ser HTML puro.
  
  ESTILO EDITORIAL:
  - Tono sofisticado, neutral y profundo.
  - Mínimo 600 palabras.
  - Divide la noticia en al menos 3 secciones con <h2>.
  
  Información de referencia:
  Título: ${originalTitle}
  Contenido: ${originalContent}
  
  Responde estrictamente en JSON:
  {
    "new_title": "Título informativo, declarativo y 100% libre de clickbait",
    "new_content": "Cuerpo completo con <p>, <h2>, <blockquote>, <ul>/<li>",
    "category": "Categoría (Mundo, Argentina, Tecnología, Ciencia, Economía, Deportes o Cultura)"
  }
  `;

  // Try primary key first
  try {
    const model = getGeminiModel(false);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);
    return {
      ...data,
      new_content: cleanHtml(data.new_content)
    };
  } catch (primaryError: any) {
    const isQuotaError = primaryError.message?.includes('429') || primaryError.message?.includes('quota');

    if (isQuotaError && process.env.GEMINI_API_KEY_FALLBACK) {
      console.warn("Cuota excedida en API principal, intentando con API de respaldo...");
      try {
        const fallbackModel = getGeminiModel(true);
        const result = await fallbackModel.generateContent(prompt);
        const text = result.response.text();
        const data = JSON.parse(text);
        return {
          ...data,
          new_content: cleanHtml(data.new_content)
        };
      } catch (fallbackError: any) {
        console.error("Error en API de respaldo:", fallbackError.message || fallbackError);
        return { error: fallbackError.message || 'Error in fallback API' };
      }
    }

    console.error("Error exacto de Gemini:", primaryError.message || primaryError);
    return { error: primaryError.message || 'Error parsing JSON' };
  }
}
