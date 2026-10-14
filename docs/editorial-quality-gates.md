# El Irónico — controles editoriales para la nueva etapa

**Estado:** especificación de trabajo; no habilita publicaciones por sí sola. El flujo de noticias y newsletters permanece pausado hasta que los controles y la escritura segura se prueben en una versión de prueba.

## Principio de publicación

Una nota solo puede pasar a `published` después de completar la selección de fuentes, la redacción, la revisión independiente y las comprobaciones deterministas. Si falta evidencia, falla un control, vence una llamada o el resultado no es válido, el artículo queda en `held`; nunca se publica como alternativa automática.

## Flujo y estados

`candidate → evidence_ready → draft → review_pending → approved → published`

Estados de salida alternativos: `held`, `rejected`, `withdrawn`. Cada cambio registra fecha, versión de prompts/modelos, URLs de evidencia, resultado de controles y motivo. El redactor no puede asignarse a sí mismo `approved`.

## Fuentes y evidencia

- Cada fuente debe tener editor responsable, dominio, sección, última comprobación de salud y estado de permiso: `approved`, `restricted` o `unknown`.
- `unknown` y `restricted` no habilitan reescritura ni publicación. Mostrar un RSS públicamente no equivale a tener permiso para reproducir o transformar su contenido; respetar sus condiciones y conservar atribución y enlace.
- Guardar URL y fecha de cada fuente, además del texto de evidencia realmente utilizado. No aceptar un snippet como prueba completa de una afirmación.
- Toda afirmación material debe poder vincularse a evidencia. Para datos, citas, imputaciones, salud, seguridad, política, finanzas y procesos judiciales se exige respaldo directo y atribución explícita; si la evidencia es insuficiente o contradictoria, retener la nota.
- Contar independencia por origen editorial y evidencia, no por cantidad de dominios. Una fuente primaria puede establecer un hecho sobre su propio comunicado, pero no demuestra por sí sola afirmaciones externas ni sus consecuencias.

## Redacción con valor propio

- No limitarse a parafrasear un artículo de RSS. Construir un reporte breve y original a partir de hechos contrastados, enlaces y contexto pertinente para Argentina.
- Separar hechos comprobados, declaraciones atribuidas, interpretación y datos que todavía no se conocen. No fabricar equilibrio entre posiciones cuando la evidencia no lo justifica.
- Abrir con el dato más informativo; explicar qué muestra y qué no muestra; añadir contexto solo si aporta comprensión; evitar relleno y subtítulos artificiales.
- Ajustar la extensión a la evidencia disponible. Una fuente breve no autoriza completar palabras con contexto genérico.
- Citas textuales breves, exactas y atribuidas. No convertir opiniones de protagonistas en hechos.

## Revisión independiente

La revisión debe ser una llamada separada de la redacción, con contexto de evidencia completo y salida estructurada. Debe señalar:

- afirmaciones no sustentadas, parcialmente sustentadas o contradictorias, cada una con su evidencia;
- errores posibles en nombres, fechas, cifras, unidades, citas y atribuciones;
- contexto material omitido, encuadre engañoso, titular más fuerte que la evidencia y lenguaje valorativo;
- dependencia excesiva de una sola fuente, similitud textual relevante y contenido genérico sin valor añadido;
- decisión `approve`, `revise`, `hold` o `reject`, con motivos concretos.

Un segundo modelo ayuda a detectar problemas, pero no certifica verdad ni originalidad. El chequeo de similitud es una señal para retener y revisar, no una prueba jurídica de plagio.

## Comprobaciones antes de publicar

1. Fuente permitida, accesible, reciente para el tema y con URL canónica.
2. No duplicada por URL ni por grupo de historia dentro de la ventana editorial.
3. Título, categoría, fecha y atribución coherentes con la evidencia.
4. Texto HTML válido, sin etiquetas o scripts no permitidos y sin contenido vacío.
5. Datos y citas trazables; revisión independiente aprobada; similitud aceptable tras calibrar umbrales con ejemplos revisados.
6. Sin error de modelo, de almacenamiento o de control; todo fallo cierra el circuito y conserva el artículo en `held`.

Los umbrales numéricos de extensión, novedad y similitud se calibrarán en una muestra estratificada antes de automatizar decisiones. Los chequeos mecánicos no equivalen a aprobación editorial.

## Revisión del archivo existente

Conservar los textos originales y una copia/versionado antes de cualquier modificación. Clasificar primero por riesgo: actualidad perecedera, afirmaciones graves, falta de fuentes, duplicados, extensión atípica y categorías sensibles. Reescribir, consolidar, actualizar o ocultar solamente con decisión registrada y opción de reversión. No borrar registros para resolver problemas de calidad.

## Seguridad y relanzamiento

- La API pública conserva solo lectura. No restaurar `INSERT` público.
- La escritura debe usar una credencial solo del servidor, nunca `NEXT_PUBLIC_*`; la ruta valida `CRON_SECRET`, permiso de fuente, estado de aprobación y límites diarios.
- La clave del modelo y el acceso de escritura faltantes deben configurarse de forma segura antes de probar publicaciones reales.
- Reabrir solo después de pruebas en preview para credenciales ausentes, feed inválido, duplicados, falta de evidencia, JSON inválido, timeout del revisor y fallo de base de datos. La fecha estimada de regreso no sustituye esos criterios.

## Auditoría mecánica del archivo

El script `scripts/audit_news_archive.py` consulta el archivo con permisos de lectura y produce un CSV de priorización más un resumen JSON. Requiere `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`; no inserta, actualiza ni elimina filas y no llama a modelos. Marca señales como textos muy breves o extensos, falta de URL/fuente, registro de una sola fuente, duplicados y coincidencia textual con el original. Un resultado sin banderas **no es aprobación**: sirve para ordenar la revisión factual y editorial por lotes.
