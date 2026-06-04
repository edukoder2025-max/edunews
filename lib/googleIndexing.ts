import crypto from 'crypto';

export interface GoogleIndexingServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  token_uri: string;
}

const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing';

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function buildJwt(serviceAccount: GoogleIndexingServiceAccount, scope: string) {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: serviceAccount.client_email,
    scope,
    aud: serviceAccount.token_uri,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaims = base64UrlEncode(JSON.stringify(claims));
  const unsignedJwt = `${encodedHeader}.${encodedClaims}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedJwt);
  signer.end();

  const signature = signer.sign(serviceAccount.private_key, 'base64');
  const encodedSignature = signature
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${unsignedJwt}.${encodedSignature}`;
}

export function parseServiceAccount(rawValue?: string) {
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as GoogleIndexingServiceAccount;
  } catch {
    return null;
  }
}

export async function fetchGoogleAccessToken(serviceAccountJson: string, scope: string) {
  const serviceAccount = parseServiceAccount(serviceAccountJson);
  if (!serviceAccount) {
    throw new Error('Invalid Google service account JSON.');
  }

  const jwt = buildJwt(serviceAccount, scope);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  });

  const response = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`Google token request failed: ${response.status} ${JSON.stringify(payload)}`);
  }

  if (!payload.access_token) {
    throw new Error(`Missing access token from Google token response: ${JSON.stringify(payload)}`);
  }

  return payload.access_token as string;
}

export async function fetchGoogleIndexingAccessToken(serviceAccountJson: string) {
  return fetchGoogleAccessToken(serviceAccountJson, INDEXING_SCOPE);
}

export async function publishIndexingUrl(url: string, type: 'URL_UPDATED' | 'URL_DELETED', accessToken: string) {
  const endpoint = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, type }),
  });

  const json = await response.json();
  return {
    status: response.status,
    ok: response.ok,
    response: json,
    url,
    type,
  };
}
