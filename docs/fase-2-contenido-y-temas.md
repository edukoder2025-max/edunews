# Fase 2 — deduplicación y cobertura temática

## Cambios incorporados

- Se agregó un índice liviano de historias recientes para detectar títulos que describen el mismo hecho aunque estén redactados de manera diferente.
- La ingestión evita volver a publicar historias con una similitud alta de palabras útiles.
- Se crearon hubs de contenido para:
  - ANSES, jubilaciones y pensiones;
  - empleo y trabajo;
  - economía argentina;
  - Córdoba y Punilla.
- Se agregó `/temas` y páginas individuales para cada hub.
- Los hubs tienen metadatos, canonical, descripción editorial y enlaces a los artículos relacionados.
- Las nuevas páginas se incorporaron al sitemap.
- Se agregaron enlaces a `Temas de interés` y `Registro editorial` en el pie del sitio.

## Criterio editorial

Los hubs no reemplazan las noticias de actualidad. Funcionan como puertas de entrada permanentes para agrupar artículos relacionados y mejorar el enlazado interno. La detección automática es conservadora: si no hay suficientes palabras útiles en común, la noticia no se descarta.

## Próximo paso

Cuando exista una migración controlada de Supabase, conviene persistir un `story_cluster_key` y la relación entre una historia y sus fuentes. Eso permitirá actualizar una historia existente en vez de crear artículos paralelos cuando aparezcan nuevas versiones del mismo hecho.
