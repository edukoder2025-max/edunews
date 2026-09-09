# Fase 1 — operación y medición de El Irónico

## Cambios incorporados

- Las fuentes RSS viven en `lib/newsSources.ts`, con nombre, sección, URL, estado activo y límite por ejecución.
- `/api/fetch-news` ya no elimina artículos antiguos automáticamente.
- La ingestión devuelve métricas por fuente: artículos obtenidos, frescos, seleccionados, duplicados, publicados y errores.
- La detección de duplicados consulta primero la URL original y luego el título exacto, sin construir filtros `.or()` con texto editorial.
- El endpoint de ingestión admite protección con `CRON_SECRET`.
- Se preparó Google Analytics 4 mediante `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- Se agregó `/registro` como página pública de transparencia editorial.

## Variables de entorno pendientes

Configurar en Vercel, para Production y Preview cuando corresponda:

- `CRON_SECRET`: secreto usado por los cron de Vercel para autorizar `/api/fetch-news`.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: identificador de medición de Google Analytics 4.

Mientras `CRON_SECRET` no exista, el endpoint conserva compatibilidad con la ejecución manual y deja una advertencia en los logs. Una vez configurado, las llamadas sin `Authorization: Bearer <CRON_SECRET>` reciben `401`.

## Operación de producción

La rama de código correcta es `rename/elironico`. La implementación activa se promueve a producción desde esa rama hasta que Vercel quede configurado para seguirla automáticamente.

## Próximo control

- Confirmar que el cron diario termina dentro del límite de ejecución de Vercel.
- Revisar los conteos por fuente y pausar fuentes con errores o duplicación alta.
- Crear una restricción única sobre `source_url` en Supabase cuando se disponga de una migración controlada.
- Configurar la rama de producción de Vercel como `rename/elironico`.
