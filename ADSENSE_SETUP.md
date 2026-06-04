# Configuración de Google AdSense en El Irónico

Este documento contiene instrucciones para configurar Google AdSense en el sitio.

## Cambios Realizados

### 1. **Variables de Entorno**
- Actualizado `.env.local` con tu client ID real: `ca-pub-5416044136120955`
- El script de AdSense ahora se carga automáticamente en todas las páginas

### 2. **Componentes Creados**
- `components/AdSense.tsx` — Componente React reutilizable para insertar anuncios
- `lib/adSlots.ts` — Configuración centralizada de slots de anuncios

### 3. **Anuncios Integrados**

#### Página Principal (`app/page.tsx`)
- **Banner superior** — Anuncio responsivo en la parte superior

#### Página de Artículos (`app/news/[id]/page.tsx`)
- **Anuncio en el medio** — Después del panel de transparencia
- **Anuncio en la barra lateral** — Vertical (300x600 o responsivo)

## Próximos Pasos: Crear Slots en Google AdSense

Necesitas crear los slots de anuncios en tu cuenta de Google AdSense. **Cada slot debe estar activado y funcional** para que los anuncios aparezcan.

### Instrucciones para Crear Slots:

1. **Accede a Google AdSense**
   - Ve a https://adsense.google.com
   - Inicia sesión con tu cuenta de Google

2. **Crea slots de anuncios por ubicación**
   - En el menú izquierdo, ve a **"Anuncios"** → **"Por sitio"**
   - Selecciona tu sitio: **elironico.com**
   - Haz clic en **"+ Nuevo código de anuncio"**

3. **Elige el tipo de anuncio**
   - **Portada (Top Banner)**: Display - Banner responsivo (728x90 o mayor)
   - **Artículos (Middle)**: Display - Cuadrado/Responsive (300x250 o auto)
   - **Artículos (Sidebar)**: Display - Vertical (300x600 o auto)

4. **Copia el ID del Slot**
   - Una vez creado, Google te da un código JavaScript
   - Extrae el `data-ad-slot` (ej: "1234567890")
   - Actualiza `lib/adSlots.ts` con ese valor

### Ejemplo de Código Generado por AdSense:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5416044136120955"
     crossorigin="anonymous"></script>
<!-- El Irónico - Top Banner -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-5416044136120955"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

**El ID del slot que necesitas**: `1234567890`

## Actualizar lib/adSlots.ts

Una vez tengas todos los slots creados, actualiza el archivo:

```typescript
export const AD_SLOTS = {
  HOMEPAGE_TOP: 'TU_SLOT_ID_AQUI',          // De Google AdSense
  ARTICLE_MIDDLE: 'TU_SLOT_ID_AQUI',        // De Google AdSense
  ARTICLE_BOTTOM: 'TU_SLOT_ID_AQUI',        // De Google AdSense
};
```

## Cómo Funciona

1. **Script Global**
   - El archivo `app/layout.tsx` carga el script de AdSense una sola vez
   - Está disponible en todas las páginas

2. **Componente AdSense**
   - `components/AdSense.tsx` envuelve la configuración del anuncio
   - Se puede usar en cualquier página con: `<AdSense slot="ID" />`

3. **Inicialización**
   - El componente automáticamente inicializa los anuncios cuando monta
   - Los anuncios se renderizan solo si el client ID está configurado

## Testing

Para verificar que funciona:

1. **Desarrollo Local**
   ```bash
   npm run dev
   # Abre http://localhost:3000
   # Verifica que no haya errores en la consola
   ```

2. **En Producción**
   - Google AdSense tardará 24-48 horas en activar los anuncios
   - Pueden aparecer "anuncios de servicio público" mientras se activan

## Solución de Problemas

### Los anuncios no aparecen
1. Verifica que el `data-ad-client` es correcto (`ca-pub-5416044136120955`)
2. Verifica que el `data-ad-slot` existe en tu cuenta de AdSense
3. Espera 24-48 horas para que AdSense active los slots
4. Revisa la consola del navegador para errores

### El script no carga
1. Verifica que `NEXT_PUBLIC_ADSENSE_CLIENT_ID` está en `.env.local`
2. Reinicia el servidor: `npm run dev`

### Aparecen "anuncios de servicio público"
- Es normal cuando AdSense está procesando nuevos slots
- Espera 48 horas

## Consideraciones de SEO

- Los anuncios **no afectan negativamente al SEO** si están bien colocados
- Google recomienda máximo 3 anuncios por página
- Los anuncios en páginas de artículos mejoran la monetización sin afectar el ranking

## Ingresos Estimados

Con el tráfico que genera El Irónico:
- **Publicidad Display**: $0.50 - $3 por 1000 impresiones
- **CPM promedio**: $1-2 (dependiendo de geografía y nicho)

## Contacto y Soporte

Si tienes problemas:
1. Revisa https://support.google.com/adsense
2. Contacta a soporte de AdSense directamente
