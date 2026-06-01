-- Habilitar soporte de auditoría de sesgo en la tabla `news_articles` de Supabase
-- Ejecuta este script en el editor SQL de tu panel de Supabase (https://supabase.com)

ALTER TABLE news_articles 
ADD COLUMN IF NOT EXISTS bias_detected text,
ADD COLUMN IF NOT EXISTS bias_score jsonb,
ADD COLUMN IF NOT EXISTS sources_used text[];

-- Comentario explicativo de las columnas:
-- * `bias_detected`: Contiene el análisis cualitativo en texto plano provisto por Gemini sobre los sesgos y adjetivos eliminados.
-- * `bias_score`: Estructura JSON que almacena el puntaje original de sesgo, puntaje neutralizado y frases cargadas detectadas.
-- * `sources_used`: Array de textos con los nombres/dominios de las fuentes que se contrastaron en la reescritura.
