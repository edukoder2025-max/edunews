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

export async function rewriteNews(originalTitle: string, originalContent: string) {
  const prompt = `
  Actúa como el Redactor Jefe de un prestigioso diario digital. Tu misión es transformar la información en un reportaje profesional y visualmente impecable.
  
  ESTRUCTURA HTML OBLIGATORIA (MUY IMPORTANTE):
  1. CADA PÁRRAFO debe estar encerrado en etiquetas <p>...</p>. No uses saltos de línea simples.
  2. LOS SUBTÍTULOS deben ser etiquetas <h2>...</h2> atractivas y analíticas. ¡No los pongas como texto plano ni solo con negritas!
  3. LA ENTRADILLA: El primer párrafo debe ser <p><strong>...</strong></p> (solo el primer párrafo).
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
    "new_title": "Título periodístico de alto impacto",
    "new_content": "Cuerpo completo con <p>, <h2>, <blockquote>, <ul>/<li>",
    "category": "Categoría (Mundo, Argentina, Tecnología, Ciencia, Economía, Deportes o Cultura)"
  }
  `;

  // Try primary key first
  try {
    const model = getGeminiModel(false);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (primaryError: any) {
    const isQuotaError = primaryError.message?.includes('429') || primaryError.message?.includes('quota');
    
    if (isQuotaError && process.env.GEMINI_API_KEY_FALLBACK) {
      console.warn("Cuota excedida en API principal, intentando con API de respaldo...");
      try {
        const fallbackModel = getGeminiModel(true);
        const result = await fallbackModel.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(text);
      } catch (fallbackError: any) {
        console.error("Error en API de respaldo:", fallbackError.message || fallbackError);
        return { error: fallbackError.message || 'Error in fallback API' };
      }
    }

    console.error("Error exacto de Gemini:", primaryError.message || primaryError);
    return { error: primaryError.message || 'Error parsing JSON' };
  }
}
