# Configuración de Webhook y automatización para Reader Revenue Manager

## 1. Variables de entorno necesarias

Configura estas variables en tu `env.local` (local) o en Vercel/GitHub Actions (producción):

```env
# Autenticación del webhook (requerido)
RRM_WEBHOOK_SECRET=tu-secreto-aleatorio-muy-largo-y-seguro

# Brevo (Email marketing)
BREVO_API_KEY=tu-api-key-brevo
BREVO_SENDER_EMAIL=noreply@tudominio.com
BREVO_SENDER_NAME=El Irónico

# Supabase (Base de datos)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key  # Recomendado para server-side operations

# GitHub Actions & Vercel (opcional para deploy automático)
VERCEL_TOKEN=tu-vercel-token
VERCEL_ORG_ID=tu-org-id
VERCEL_PROJECT_ID=tu-proyecto-id
```

## 2. Configurar webhook en Reader Revenue Manager

### URL del webhook
```
https://tu-dominio.com/api/reader-revenue/webhook
```
**Ejemplo**: `https://elironico.com/api/reader-revenue/webhook`

### Método
`POST`

### Headers personalizados
```
x-rrm-secret: tu-secreto-aleatorio-muy-largo-y-seguro
```
**Nota**: debe coincidir exactamente con `RRM_WEBHOOK_SECRET`.

### Payload esperado
El webhook espera un `POST` con este formato JSON:

```json
{
  "type": "purchase",
  "productId": "SWGPD.6475-3335-7339-51942",
  "customerEmail": "usuario@example.com",
  "customerName": "Nombre del Usuario"
}
```

### Flujo del webhook (qué sucede cuando se ejecuta)
1. **Validación**: Verifica que el header `x-rrm-secret` coincida con `RRM_WEBHOOK_SECRET`.
2. **Mapeo de producto**: Busca el `productId` en `lib/readerRevenue.PRODUCT_MAP`.
3. **Aplicar beneficios**:
   - Añade/actualiza el contacto en Brevo con atributos (`FIRSTNAME`, `PLAN_INTEREST`).
   - Persiste un registro en la tabla `subscriptions` de Supabase.
   - Envía un email de bienvenida transaccional.
4. **Respuesta**: 
   - **200 OK**: ✅ Beneficios aplicados exitosamente.
   - **401 Unauthorized**: ❌ Secret inválido.
   - **400 Bad Request**: ❌ Payload inválido.
   - **500 Server Error**: ❌ Error procesando beneficios.

## 3. Crear tabla `subscriptions` en Supabase

Ejecuta el script SQL en el editor SQL de Supabase:

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  plan text NOT NULL,
  product_id text NOT NULL,
  started_at timestamptz NOT NULL,
  expires_at timestamptz NULL,
  metadata jsonb NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_email_product_idx ON subscriptions (email, product_id);
```

O copia y ejecuta el contenido de `documento/create_subscriptions_table.sql`.

## 4. Probar webhook localmente

### Opción A: Con `curl`
```bash
curl -X POST http://localhost:3000/api/reader-revenue/webhook \
  -H "Content-Type: application/json" \
  -H "x-rrm-secret: tu-secreto-aleatorio-muy-largo-y-seguro" \
  -d '{
    "type": "purchase",
    "productId": "SWGPD.6475-3335-7339-51942",
    "customerEmail": "test@example.com",
    "customerName": "Test User"
  }'
```

### Opción B: Desde Node.js
```javascript
// test-webhook.js
const { generateWebhookSignature } = require('./lib/webhookSecurity');

const secret = 'tu-secreto-aleatorio-muy-largo-y-seguro';
const body = JSON.stringify({
  type: 'purchase',
  productId: 'SWGPD.6475-3335-7339-51942',
  customerEmail: 'test@example.com',
  customerName: 'Test User',
});

const signature = generateWebhookSignature(body, secret);
console.log('Signature:', signature);
```

### Opción C: Con Postman
1. **URL**: `http://localhost:3000/api/reader-revenue/webhook`
2. **Método**: `POST`
3. **Headers**:
   - `Content-Type: application/json`
   - `x-rrm-secret: tu-secreto-aleatorio-muy-largo-y-seguro`
4. **Body** (raw JSON):
   ```json
   {
     "type": "purchase",
     "productId": "SWGPD.6475-3335-7339-51942",
     "customerEmail": "test@example.com",
     "customerName": "Test User"
   }
   ```

## 5. Integración con el SDK SWG

Cuando el usuario compra a través del diálogo de Google, tu lógica deberá:
1. **Capturar el evento de compra** en Reader Revenue Manager.
2. **Enviar un webhook** a `/api/reader-revenue/webhook` con los datos del usuario.
3. El servidor automáticamente aplica los beneficios.

**Archivos clave**:
- `lib/readerRevenue.ts`: mapeo de productos y lógica de aplicación de beneficios.
- `lib/swgClient.ts`: helper para abrir diálogos SWG desde el front-end.
- `components/ContributionButton.tsx`: botón que abre el diálogo para un producto específico.

## 6. GitHub Actions

### CI (Continuous Integration)
**Archivo**: `/.github/workflows/ci.yml`
- Ejecuta `npm install`, `npm run lint`, `npm run build` en cada push a `main` y en PRs.
- Asegura que el código siempre compila y cumple linting.

### Deploy (opcional)
**Archivo**: `/.github/workflows/deploy.yml`
- Si `VERCEL_TOKEN` está configurado en GitHub Secrets, despliega automáticamente a Vercel con `vercel --prod`.

### Configurar secretos en GitHub
1. Ve a **Settings → Secrets and variables → Actions**.
2. Añade:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - (Opcional) Otros secretos según necesites.

## 7. Flujo de compra completo

```
Usuario clicks "Contribuí con Google"
    ↓
Abre diálogo SWG (SDKComponent)
    ↓
Usuario selecciona plan y paga
    ↓
Reader Revenue Manager procesa pago
    ↓
Reader Revenue Manager envía webhook a tu servidor
    ↓
Webhook valida secret y mapea producto
    ↓
Aplica beneficios: Brevo + Supabase + Email
    ↓
Usuario recibe email de bienvenida con acceso
    ↓
Usuario puede acceder a beneficios (newsletters, contenido, etc.)
```

## 8. Validación y seguridad

- **Secret fuerte**: Usa un secreto aleatorio de al menos 32 caracteres.
- **HTTPS en producción**: Siempre usa HTTPS para webhooks.
- **Rate limiting** (recomendado): Considera limitar webhooks por IP/tiempo si recibís muchas solicitudes.
- **Logging**: Revisa los logs de tu servidor si ves errores 401 o 500.

## 9. Troubleshooting

**Error 401 Unauthorized**:
- Verifica que `RRM_WEBHOOK_SECRET` en tu servidor coincida exactamente con el header `x-rrm-secret`.
- Revisa que el header se está enviando correctamente.

**Error 400 Bad Request**:
- Verifica que el JSON del payload sea válido.
- Asegúrate de que `type`, `productId` y `customerEmail` estén presentes.

**Error 500 Server Error**:
- Verifica los logs del servidor (`console.error` en `app/api/reader-revenue/webhook/route.ts`).
- Confirma que la tabla `subscriptions` existe en Supabase.
- Verifica que `BREVO_API_KEY` sea válido.

## 10. Siguientes pasos

- [ ] Probar webhook localmente con `curl` o Postman.
- [ ] Crear tabla `subscriptions` en Supabase.
- [ ] Configurar webhook en Reader Revenue Manager.
- [ ] Configurar secretos en GitHub Actions.
- [ ] Desplegar a producción y probar con una compra real.
- [ ] Monitorear logs y ajustar según sea necesario.

