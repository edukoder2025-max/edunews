# ✅ CONFIGURACIÓN READER REVENUE - ESTADO DE IMPLEMENTACIÓN

## 📋 QUÉ SE IMPLEMENTÓ

### ✅ **FASE 1: Configuración Base** 
- [x] Variables de entorno actualizado (`.env.local`)
  - `RRM_WEBHOOK_SECRET`: Secreto fuerte generado
  - Variables Google SWG (placeholders a configurar)
  - `SUPABASE_SERVICE_ROLE_KEY` agregado
  
- [x] Script SQL mejorado para tabla `subscriptions` en Supabase
  - Indices de performance
  - Row Level Security (RLS)
  - Views para suscripciones activas/expiradas
  - Trigger automático para `updated_at`

### ✅ **FASE 2: Utilidades de Validación**
- [x] `lib/subscriptionUtils.ts` - Funciones para:
  - `getUserPlan(email)` - Obtiene plan actual
  - `userHasBenefit(email, benefit)` - Verifica beneficios
  - `hasFullAccess(email)` - Valida acceso premium
  - `getSubscriptionDetails(email)` - Info completa
  - `getExpiredSubscriptions()` - Limpieza

### ✅ **FASE 3: Protección de Contenido**
- [x] `components/PremiumGate.tsx` - Componente para bloquear contenido
- [x] `/api/check-subscription` - Endpoint para validar acceso

### ✅ **FASE 4: GitHub Actions + Automatización**
- [x] `.github/workflows/reader-revenue-renewal.yml` - Workflow mensual
- [x] `scripts/renew-subscriptions.js` - Renovación de suscripciones
- [x] `scripts/sync-brevo-subscriptions.js` - Sincronización Brevo
- [x] `scripts/cleanup-expired-subscriptions.js` - Limpieza de expiradas
- [x] `package.json` - Scripts agregados

---

## ⚙️ PRÓXIMOS PASOS REQUERIDOS

### 1️⃣ **Crear tabla en Supabase** (CRÍTICO)
```bash
# Opción A: Copiar y ejecutar en SQL Editor de Supabase
# Archivo: documento/create_subscriptions_table.sql

# Opción B: Desde terminal (requiere supabase-cli)
supabase db push
```

**Importante**: Ejecuta PRIMERO este paso antes de probar el webhook.

---

### 2️⃣ **Configurar Google Subscribe with Google**

Obtén el `PUBLICATION_ID` de Google Publisher Center:

```bash
# Ve a: https://publishercenter.google.com
# 1. Selecciona tu publicación (elironico.com)
# 2. Copia el Publication ID
# 3. Actualiza en .env.local:

GOOGLE_SWG_PUBLICATION_ID=your-publication-id-from-google
```

---

### 3️⃣ **Reemplazar SUPABASE_SERVICE_ROLE_KEY**

El valor en `.env.local` es un placeholder. Necesitas la clave real:

```bash
# 1. Ve a Supabase Dashboard
# 2. Project Settings → API
# 3. Copia la clave "service_role" (SECRET KEY)
# 4. Reemplaza en .env.local la variable SUPABASE_SERVICE_ROLE_KEY
```

---

### 4️⃣ **Configurar GitHub Secrets** (para prod)

Si vas a usar GitHub Actions en producción:

```bash
# Ve a: GitHub → Settings → Secrets and variables → Actions
# Agrega:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BREVO_API_KEY=your-brevo-key
BREVO_SENDER_EMAIL=your-sender-email
BREVO_SENDER_NAME=your-sender-name
RRM_WEBHOOK_SECRET=your-webhook-secret
SLACK_WEBHOOK_URL=your-slack-url (opcional para notificaciones)
```

---

### 5️⃣ **Probar webhook localmente**

```bash
# Terminal 1: Inicia el servidor
npm run dev

# Terminal 2: Envía un webhook de prueba
curl -X POST http://localhost:3000/api/reader-revenue/webhook \
  -H "Content-Type: application/json" \
  -H "x-rrm-secret: mVp9kL2qR7xW4tN8mZ3aB6dF1sH5gJ9kL2mO7pQ3rS8tU4vW9xY5zC1aD4eF6" \
  -d '{
    "type": "purchase",
    "productId": "SWGPD.6475-3335-7339-51942",
    "customerEmail": "test@example.com",
    "customerName": "Test User"
  }'
```

**Respuesta esperada (200 OK)**:
```json
{
  "success": true,
  "message": "Beneficios aplicados exitosamente",
  "email": "test@example.com",
  "plan": "SWGPD.6475-3335-7339-51942"
}
```

---

### 6️⃣ **Validar en Supabase**

```sql
-- Verifica que el contacto fue creado en subscriptions
SELECT * FROM subscriptions WHERE email = 'test@example.com';
```

---

### 7️⃣ **Usar PremiumGate en tus páginas**

```typescript
// app/noticias/[id]/page.tsx
import { PremiumGate } from '@/components/PremiumGate';

export default function NewsPage({ params }) {
  const userEmail = getSessionEmail(); // Tu lógica de sesión
  
  return (
    <div>
      <h1>Noticia Exclusiva</h1>
      
      <PremiumGate 
        requiredBenefit="acceso_completo"
        userEmail={userEmail}
      >
        {/* Contenido premium aquí */}
        <p>Este contenido solo es visible para suscriptores Pro</p>
      </PremiumGate>
    </div>
  );
}
```

---

## 🔧 CONFIGURACIÓN DE READER REVENUE MANAGER

Una vez todo esté funcionando localmente, configura el webhook en Reader Revenue Manager:

### URL del Webhook
```
https://www.elironico.com/api/reader-revenue/webhook
```

### Método
```
POST
```

### Headers
```
x-rrm-secret: mVp9kL2qR7xW4tN8mZ3aB6dF1sH5gJ9kL2mO7pQ3rS8tU4vW9xY5zC1aD4eF6
```

### Payload Format
```json
{
  "type": "purchase",
  "productId": "SWGPD.6475-3335-7339-51942",
  "customerEmail": "usuario@example.com",
  "customerName": "Nombre Usuario"
}
```

---

## 📊 FLUJO COMPLETO DE COMPRA

```
1. Usuario hace clic en "Contribuí con Google"
   ↓
2. Se abre diálogo de Google (SWG)
   ↓
3. Usuario selecciona plan y paga
   ↓
4. Google notifica a Reader Revenue Manager
   ↓
5. RRM envía webhook a https://elironico.com/api/reader-revenue/webhook
   ↓
6. Webhook valida secret y mapea producto
   ↓
7. Se aplican beneficios:
   ✅ Contacto creado/actualizado en Brevo
   ✅ Registro guardado en Supabase (subscriptions)
   ✅ Email de bienvenida enviado
   ↓
8. Usuario accede a contenido premium (PremiumGate)
   ↓
9. GitHub Action (mensualmente):
   ✅ Renueva suscripciones mensuales
   ✅ Sincroniza con Brevo
   ✅ Limpia suscripciones expiradas
```

---

## 🚀 CHECKLIST DE PUESTA EN PRODUCCIÓN

- [ ] Crear tabla `subscriptions` en Supabase
- [ ] Reemplazar `SUPABASE_SERVICE_ROLE_KEY` con clave real
- [ ] Obtener `GOOGLE_SWG_PUBLICATION_ID` de Google
- [ ] Configurar `GOOGLE_SWG_ENTITLEMENTS_URL` en Google
- [ ] Probar webhook localmente con curl
- [ ] Validar datos en Supabase después de webhook
- [ ] Usar `<PremiumGate>` en páginas que requieran acceso
- [ ] Configurar webhook en Reader Revenue Manager
- [ ] Agregar GitHub Secrets para prod
- [ ] Desplegar a Vercel
- [ ] Probar compra real (o con cuenta de prueba)
- [ ] Monitorear logs de webhook y GitHub Actions

---

## 🐛 TROUBLESHOOTING

### Error 401 en webhook
```
❌ Verifica que RRM_WEBHOOK_SECRET coincida exactamente
❌ El header x-rrm-secret debe coincidir con la variable de entorno
```

### Error 500 - Tabla no existe
```
❌ Ejecuta el script SQL de subscriptions en Supabase
❌ Verifica que SUPABASE_SERVICE_ROLE_KEY sea correcta
```

### PremiumGate siempre bloquea
```
❌ Verifica que el email del usuario sea correcto
❌ Comprueba que exista un registro en subscriptions con ese email
❌ Revisa /api/check-subscription en los logs del servidor
```

### GitHub Action no se ejecuta
```
❌ Verifica que los secretos estén correctamente configurados
❌ Comprueba la hora cron (cada 1º de mes a las 6:00 AM UTC)
❌ Revisa el historio de Actions en GitHub
```

---

## 📞 SOPORTE

Si encuentras problemas:

1. **Revisa los logs**:
   - Servidor local: Terminal con `npm run dev`
   - Producción: Vercel Dashboard → Logs
   - GitHub Actions: Actions tab en tu repo

2. **Valida la base de datos**:
   ```sql
   SELECT * FROM subscriptions;
   SELECT * FROM active_subscriptions;
   ```

3. **Prueba el webhook manualmente**:
   ```bash
   npm run test-webhook
   ```

4. **Contacta con soporte**:
   - Google: https://publishercenter.google.com/support
   - Brevo: https://www.brevo.com/support
   - Supabase: https://supabase.com/support

