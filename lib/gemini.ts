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
  Actúa como un redactor jefe de un prestigioso diario internacional. Tu objetivo es crear un artículo de fondo, rico en matices y visualmente estructurado para la web.
  
  REGLAS ELITE DE MAQUETACIÓN HTML:
  1. ENTRADILLA: Comienza con un párrafo <p><strong>...</strong></p> que enganche al lector.
  2. SUBTÍTULOS: Usa varios <h2> que dividan la noticia en secciones temáticas (ej: "El origen del conflicto", "Impacto en la sociedad", "Perspectivas a futuro").
  3. CITAS (BLOCKQUOTE): Selecciona una frase impactante y ponla dentro de un <blockquote>...</blockquote>. Esto da un aire de "reportaje de revista".
  4. DETALLES: Usa <strong> para nombres propios o fechas clave. Usa <ul> y <li> para listas de datos o consecuencias.
  5. VOLUMEN: El texto debe ser extenso (mínimo 600 palabras), analizando no solo el qué, sino el porqué y el cómo.
  
  Información de referencia:
  Título: ${originalTitle}
  Contenido: ${originalContent}
  
  Responde estrictamente en JSON:
  {
    "new_title": "Título con gancho editorial",
    "new_content": "HTML enriquecido (p, h2, blockquote, strong, ul/li)",
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
