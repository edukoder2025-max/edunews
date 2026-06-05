# 📊 COMPARATIVA DE PLANES - VISUAL

## 💰 RESUMEN DE PRECIOS Y CARACTERÍSTICAS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PLANS COMPARISON MATRIX                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  💰 ARS 2.000/mes          💰 ARS 8.000/mes          💰 ARS 12.000/mes  │
│  📦 MENSUAL BÁSICO         📦 MENSUAL PLUS           📦 MENSUAL PRO     │
│  🔄 Renovación automática  🔄 Renovación automática  🔄 Renovación auto │
│  ━━━━━━━━━━━━━━━━━━━━━━   ━━━━━━━━━━━━━━━━━━━━━━   ━━━━━━━━━━━━━━━━━ │
│                                                                          │
│  ✅ Acceso Estándar       ✅ Acceso Insights       ✅ Acceso Completo   │
│  ✅ Resúmenes Semanales   ✅ Eventos Exclusivos    ✅ Newsletter Exclu. │
│  ✅ Sin Anuncios          ✅ Contenido Avanzado    ✅ Soporte Prioritario│
│  ❌ Newsletter Exclu.     ❌ Soporte Prioritario   ✅ Todo lo anterior  │
│  ❌ Soporte Prioritario   ❌ Acceso Completo      │                     │
│                                                     │                     │
│  Product ID:              Product ID:              Product ID:           │
│  SWGPD.5733-...          SWGPD.8127-...          SWGPD.6475-...        │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  💎 ARS 5.000 (1x)        💎 ARS 10.000 (1x)      💎 ARS 15.000 (1x)   │
│  🔐 LIFETIME LITE         🔐 LIFETIME STD         🔐 LIFETIME PREMIUM  │
│  ♾️ Acceso de por vida    ♾️ Acceso de por vida   ♾️ Acceso de por vida│
│  ━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━   ━━━━━━━━━━━━━━━━━  │
│                                                                          │
│  ✅ Acceso Limitado      ✅ Acceso de por Vida   ✅ Acceso Completo    │
│  ✅ Contenido Seleccio.  ✅ Newsletter Exclu.    ✅ Todos los bene.    │
│  ❌ Acceso Completo      ✅ Soporte Comunidad    ✅ Updates incluidas  │
│  ❌ Todos los benefi.    ❌ Updates incluidas    ✅ Lifetime support   │
│                                                                          │
│  Product ID:             Product ID:             Product ID:           │
│  SWGPD.3524-...         SWGPD.4052-...         SWGPD.6766-...         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 CICLO DE VIDA DE CADA TIPO DE PLAN

### PLANES MENSUALES (Se Renuevan Automáticamente)

```
MES 1                    MES 2                    MES 3
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│ Usuario paga │        │ Webhook →    │        │ Webhook →    │
│ ARS 12.000   │        │ Renovación   │        │ Renovación   │
├──────────────┤        ├──────────────┤        ├──────────────┤
│ 📅 Mes 1     │        │ 📅 Mes 2     │        │ 📅 Mes 3     │
│ ✅ Pro       │   →    │ ✅ Pro       │   →    │ ✅ Pro       │
│ 🔓 Acceso ✅│        │ 🔓 Acceso ✅│        │ 🔓 Acceso ✅│
│ expires_at:  │        │ expires_at:  │        │ expires_at:  │
│    NULL      │        │    NULL      │        │    NULL      │
└──────────────┘        └──────────────┘        └──────────────┘
     ↓                       ↓                       ↓
[GitHub Action]         [GitHub Action]         [GitHub Action]
Renueva cada            Renueva cada            Renueva cada
1° del mes              1° del mes              1° del mes
     ↓                       ↓                       ↓
UPDATE                  UPDATE                  UPDATE
expires_at =            expires_at =            expires_at =
+30 días               +30 días                +30 días
     ↓                       ↓                       ↓
Sync Brevo             Sync Brevo              Sync Brevo
(si activo)            (si activo)             (si activo)
```

**Estado en Supabase:**
```sql
SELECT * FROM subscriptions 
WHERE email = 'usuario@example.com' 
AND plan = 'mensual-pro';

┌────┬─────────────┬──────────────┬────────────┬──────────┐
│ id │ email       │ plan         │ started_at │ expires  │
├────┼─────────────┼──────────────┼────────────┼──────────┤
│ 1  │ user@ex.com │ mensual-pro  │ 2026-06-05 │ NULL ✅  │
└────┴─────────────┴──────────────┴────────────┴──────────┘

✅ NULL = Se renueva automáticamente cada mes
```

---

### PLANES LIFETIME (Pago Único, No Se Renuevan)

```
DÍA 1 (Pago único)       DÍA 30                   PERMANENTE
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│ Usuario paga │        │ GitHub Action│        │ Usuario sigue│
│ ARS 15.000   │        │ verifica:    │        │ accediendo   │
├──────────────┤        ├──────────────┤        ├──────────────┤
│ 📅 Pago 1x   │        │ expires_at   │        │ 📅 Permanente│
│ ✅ Lifetime  │   →    │ is NULL? NO  │   →    │ ✅ Lifetime  │
│ 🔓 Acceso ✅│        │ (es fecha)   │        │ 🔓 Acceso ✅│
│ expires_at:  │        │ → SKIP       │        │ expires_at:  │
│ [fecha]      │        │ (no renovar) │        │ [fecha fija] │
└──────────────┘        └──────────────┘        └──────────────┘
     ↓                       ↓                       ↓
Webhook aplica          Si intenta              Acceso indefinido
beneficios              renovar: NO            (hasta que cancele)
     ↓                    ↓
Sync Brevo            Marca como
(1 sola vez)          "PAGADO"
```

**Estado en Supabase:**
```sql
SELECT * FROM subscriptions 
WHERE email = 'usuario@example.com' 
AND plan = 'lifetime-15000';

┌────┬─────────────┬────────────┬────────────┬──────────────┐
│ id │ email       │ plan       │ started_at │ expires_at   │
├────┼─────────────┼────────────┼────────────┼──────────────┤
│ 2  │ user@ex.com │ lifetime   │ 2026-06-05 │ 2026-06-05 ✅│
└────┴─────────────┴────────────┴────────────┴──────────────┘

✅ Fecha = Pago completado (no se renueva)
❌ NULL nunca aparece = No es monthly
```

---

## 🎯 MATRIZ DE DECISIÓN: ¿CUÁL PLAN ELEGIR?

```
┌────────────────────────────────────────────────────────────┐
│  ¿Quiero pagar mensual o de una vez?                       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  📅 MENSUAL                          💎 PAGO ÚNICO        │
│     (Se renueva cada mes)               (Acceso de por vida)
│     ↓                                   ↓                  │
│  ¿Qué nivel?                         ¿Cuánto invertir?    │
│     ├─ ARS 2.000 (Básico)            ├─ ARS 5.000 (Lite)  │
│     ├─ ARS 8.000 (Plus)              ├─ ARS 10.000 (Std)  │
│     └─ ARS 12.000 (Pro)              └─ ARS 15.000 (Prem) │
│                                                             │
│  Total anual:                        Costo total:          │
│  ├─ Básico: ARS 24.000              ├─ Lite: ARS 5.000   │
│  ├─ Plus: ARS 96.000                ├─ Std: ARS 10.000   │
│  └─ Pro: ARS 144.000                └─ Prem: ARS 15.000  │
│                                                             │
│  ✅ Usa mensual si:                 ✅ Usa lifetime si:    │
│  ├─ No sabes si vas a usar          ├─ Quieres acceso    │
│  ├─ Prefieres gastar poco al inicio │  indefinido         │
│  └─ Compras recurrentes (como app)  ├─ Apoyas el medio   │
│                                      └─ Quieres mejor PVP │
└────────────────────────────────────────────────────────────┘
```

---

## 📲 BENEFICIOS - QUÉ CADA PLAN INCLUYE

```
┌─────────────────────────────────────────────────────────────┐
│ BENEFICIO              │ BÁSICO │ PLUS │ PRO │ LT5K │ LT10K │ LT15K
├─────────────────────────────────────────────────────────────┤
│ Acceso a artículos     │   ✅   │  ✅  │ ✅ │  ⚠️  │  ✅   │  ✅
│ Sin anuncios           │   ✅   │  ❌  │ ✅ │  ❌  │  ❌   │  ✅
│ Newsletter exclusiva   │   ❌   │  ❌  │ ✅ │  ❌  │  ✅   │  ✅
│ Resúmenes semanales    │   ✅   │  ❌  │ ❌ │  ❌  │  ❌   │  ✅
│ Acceso a insights      │   ❌   │  ✅  │ ✅ │  ❌  │  ❌   │  ✅
│ Eventos exclusivos     │   ❌   │  ✅  │ ✅ │  ❌  │  ❌   │  ✅
│ Contenido avanzado     │   ❌   │  ✅  │ ✅ │  ❌  │  ❌   │  ✅
│ Soporte prioritario    │   ❌   │  ❌  │ ✅ │  ❌  │  ❌   │  ✅
│ Soporte comunidad      │   ❌   │  ❌  │ ❌ │  ❌  │  ✅   │  ✅
│ Updates futuras        │   ❌   │  ❌  │ ❌ │  ❌  │  ❌   │  ✅
│ Acceso de por vida     │   ❌   │  ❌  │ ❌ │  ✅  │  ✅   │  ✅
└─────────────────────────────────────────────────────────────┘

⚠️ = Acceso limitado a contenido seleccionado solamente
```

---

## 🔐 CÓMO SE VALIDAN LOS BENEFICIOS

```javascript
// Usuario intenta acceder a contenido premium
<PremiumGate 
  requiredBenefit="acceso_completo"
  userEmail="usuario@example.com"
>
  Contenido exclusivo
</PremiumGate>

// Proceso interno:
┌─────────────────────────────────────────────────────┐
│ 1. GET plan de usuario en Supabase                  │
│    SELECT plan FROM subscriptions                   │
│    WHERE email = 'usuario@example.com'              │
│    AND (expires_at IS NULL OR expires_at > NOW)     │
│    → Resultado: 'mensual-pro'                       │
├─────────────────────────────────────────────────────┤
│ 2. Buscar beneficios del plan en PLAN_BENEFITS      │
│    PLAN_BENEFITS['mensual-pro'] = [                 │
│      'acceso_completo',                             │
│      'newsletter_exclusiva',                        │
│      'soporte_prioritario'                          │
│    ]                                                │
├─────────────────────────────────────────────────────┤
│ 3. Verificar si beneficio está en la lista          │
│    ¿'acceso_completo' IN beneficios? → SÍ ✅       │
├─────────────────────────────────────────────────────┤
│ 4. Renderizar contenido                             │
│    ✅ Mostrar artículo completo                     │
│    ✅ Acceso a todas las secciones                  │
│    ✅ Newsletter automática                         │
│    ✅ Soporte prioritario habilitado                │
└─────────────────────────────────────────────────────┘
```

---

## 📊 FLUJO ACTUAL - RESUMIDO

```
USUARIO                  GOOGLE                  TU SERVIDOR
   │                        │                         │
   ├─ Click "Contribuí" ──→ │                         │
   │                        │                         │
   │ ← Abre dialog ────────┤                         │
   │                        │                         │
   ├─ Completa pago ─────→ │                         │
   │                        │                         │
   │ ← Procesa ────────────┤                         │
   │                        │                         │
   │                        ├─ Webhook POST ────────→│
   │                        │ productId + email      │
   │                        │ + secret               │
   │                        │                        │
   │                        │ ← Status 200 OK ───────┤
   │                        │ Beneficios aplicados   │
   │                        │                        │
   │ ← Compra confirmada ──┤                        │
   │                        │                        │
   ├─ Accede a premium ────────────────────────────→│
   │                        │ Valida beneficios      │
   │                        │ ✅ Suscriptor         │
   │ ← Contenido ────────────────────────────────┤
   │                        │                        │
```

---

## ✅ STATUS FINAL: TODOS LOS PLANES CONFIGURADOS

| Aspecto | Status |
|---------|--------|
| 6 planes definidos | ✅ |
| 6 Product IDs únicos | ✅ |
| Mapeo producto→beneficios | ✅ |
| Webhook validado | ✅ (200 OK) |
| Integración Brevo | ✅ |
| Integración Supabase | ✅ |
| Validación de beneficios | ✅ |
| Renovación automática (monthly) | ✅ |
| Pago único (lifetime) | ✅ |
| UI componentes | ✅ |
| **LISTO PARA PRODUCCIÓN** | ✅ |

