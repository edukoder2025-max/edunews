#!/usr/bin/env node
/**
 * Script para probar el webhook de Reader Revenue Manager localmente.
 * Uso: node test-webhook.js
 */

const https = require('https');
const http = require('http');

// Configuración
const RRM_WEBHOOK_SECRET = process.env.RRM_WEBHOOK_SECRET || 'test-secret-local';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/reader-revenue/webhook';

// Payload de prueba
const testPayload = {
  type: 'purchase',
  productId: 'SWGPD.6475-3335-7339-51942',
  customerEmail: 'test@example.com',
  customerName: 'Test User',
};

console.log('🧪 Webhook Test Runner');
console.log('='.repeat(50));
console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);
console.log(`🔐 Secret: ${RRM_WEBHOOK_SECRET}`);
console.log('📦 Payload:', JSON.stringify(testPayload, null, 2));
console.log('='.repeat(50));

const bodyString = JSON.stringify(testPayload);
const url = new URL(WEBHOOK_URL);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(bodyString),
    'x-rrm-secret': RRM_WEBHOOK_SECRET,
  },
};

console.log('\n📤 Enviando solicitud...\n');

const req = client.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
    console.log('📥 Response Headers:', res.headers);
    console.log('📝 Response Body:', data);

    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('\n✨ ¡Webhook ejecutado exitosamente!');
      process.exit(0);
    } else {
      console.log('\n❌ Error en webhook (status no-2xx)');
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Error enviando solicitud:', err.message);
  console.log('\n💡 Asegúrate de que:');
  console.log('  1. El servidor esté corriendo: npm run dev');
  console.log('  2. La URL sea correcta: ' + WEBHOOK_URL);
  console.log('  3. RRM_WEBHOOK_SECRET sea válido\n');
  process.exit(1);
});

req.write(bodyString);
req.end();
