# Fase 4 — fidelización y newsletters temáticos

## Cambios incorporados

- El formulario de suscripción permite elegir:
  - resumen general;
  - ANSES, jubilaciones y pensiones;
  - empleo y trabajo;
  - economía argentina;
  - Córdoba y Punilla.
- El contacto se agrega al boletín general y, cuando corresponde, a una lista temática de Brevo.
- Las listas temáticas se crean bajo demanda, solo cuando una persona elige ese tema.
- El endpoint protegido de newsletter acepta `topic` y puede compilar las cinco noticias más recientes relacionadas con ese tema.
- Se evita enviar un boletín temático a la lista general si la lista específica no pudo resolverse.

## Uso operativo

El boletín general continúa funcionando con el cron existente. Para una campaña temática se puede usar el mismo endpoint protegido con `topic=anses`, `topic=empleo`, `topic=economia` o `topic=cordoba`.

Las campañas temáticas deben probarse primero con un correo de vista previa antes de enviarse a una lista completa.

## Próximo paso

Crear una programación semanal diferenciada por tema solo después de observar cuántos suscriptores tiene cada lista. No conviene enviar alertas temáticas con poca audiencia ni saturar a quienes eligieron más de un interés.
