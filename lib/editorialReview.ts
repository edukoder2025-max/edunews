import { GoogleGenerativeAI } from '@google/generative-ai';

export type ReviewDecision = 'approve' | 'revise' | 'hold' | 'reject';
export type ClaimStatus = 'supported' | 'partial' | 'unsupported' | 'contradicted';

export type EditorialEvidence = {
  publisher: string;
  title: string;
  url: string;
  excerpt: string;
  rightsStatus: 'approved' | 'restricted' | 'unknown';
  independenceGroup?: string;
  publishedAt?: string | null;
  isPrimarySource?: boolean;
};

export type ClaimReview = {
  claim: string;
  status: ClaimStatus;
  evidenceUrls: string[];
  note: string;
};

export type ReviewIssue = {
  severity: 'critical' | 'major' | 'minor';
  code: string;
  description: string;
};

export type EditorialReviewResult = {
  decision: ReviewDecision;
  model: string;
  summary: string;
  claims: ClaimReview[];
  issues: ReviewIssue[];
};

const ALLOWED_DECISIONS = new Set<ReviewDecision>(['approve', 'revise', 'hold', 'reject']);
const ALLOWED_CLAIM_STATUSES = new Set<ClaimStatus>(['supported', 'partial', 'unsupported', 'contradicted']);

function held(model: string, code: string, description: string): EditorialReviewResult {
  return {
    decision: 'hold',
    model,
    summary: description,
    claims: [],
    issues: [{ severity: 'major', code, description }],
  };
}

function hostOf(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

function validateReview(raw: unknown, model: string, allowedUrls: Set<string>): EditorialReviewResult {
  if (!raw || typeof raw !== 'object') return held(model, 'invalid_review_json', 'La revisión no devolvió un objeto válido.');
  const value = raw as Record<string, unknown>;
  const decision = value.decision as ReviewDecision;
  const claimsRaw = Array.isArray(value.claims) ? value.claims : [];
  const issuesRaw = Array.isArray(value.issues) ? value.issues : [];

  if (!ALLOWED_DECISIONS.has(decision)) return held(model, 'invalid_review_decision', 'La revisión no devolvió una decisión permitida.');

  const claims: ClaimReview[] = [];
  for (const item of claimsRaw) {
    if (!item || typeof item !== 'object') return held(model, 'invalid_claim_review', 'La revisión contiene una afirmación mal formada.');
    const claim = item as Record<string, unknown>;
    const status = claim.status as ClaimStatus;
    const evidenceUrls = Array.isArray(claim.evidenceUrls)
      ? claim.evidenceUrls.filter((url): url is string => typeof url === 'string')
      : [];
    if (typeof claim.claim !== 'string' || !ALLOWED_CLAIM_STATUSES.has(status) || typeof claim.note !== 'string') {
      return held(model, 'invalid_claim_review', 'La revisión contiene una afirmación sin estado o nota válidos.');
    }
    if (evidenceUrls.some((url) => !allowedUrls.has(url))) {
      return held(model, 'unrecognized_evidence_url', 'La revisión citó una URL que no estaba entre las evidencias suministradas.');
    }
    claims.push({ claim: claim.claim, status, evidenceUrls, note: claim.note });
  }

  const issues: ReviewIssue[] = [];
  for (const item of issuesRaw) {
    if (!item || typeof item !== 'object') continue;
    const issue = item as Record<string, unknown>;
    const severity = issue.severity as ReviewIssue['severity'];
    if ((severity !== 'critical' && severity !== 'major' && severity !== 'minor') || typeof issue.code !== 'string' || typeof issue.description !== 'string') continue;
    issues.push({ severity, code: issue.code, description: issue.description });
  }

  let finalDecision = decision;
  const anyUnsupported = claims.some((claim) => claim.status !== 'supported' || claim.evidenceUrls.length === 0);
  const severeIssue = issues.some((issue) => issue.severity === 'critical' || issue.severity === 'major');
  if (decision === 'approve' && (claims.length === 0 || anyUnsupported || severeIssue)) finalDecision = 'hold';

  return {
    decision: finalDecision,
    model,
    summary: typeof value.summary === 'string' ? value.summary : 'La revisión terminó sin resumen.',
    claims,
    issues,
  };
}

/**
 * Independent second-pass review. This is a separate model call, not proof of truth
 * or originality. Missing/weak evidence, invalid output, or API failure always holds.
 */
export async function reviewEditorialDraft(input: {
  title: string;
  htmlContent: string;
  category: string;
  evidence: EditorialEvidence[];
}): Promise<EditorialReviewResult> {
  const modelName = process.env.EDITORIAL_REVIEW_MODEL || 'gemini-2.5-pro';
  const apiKey = process.env.EDITORIAL_REVIEW_API_KEY;
  if (!apiKey) return held(modelName, 'review_api_key_missing', 'No está configurada la credencial separada para la revisión editorial.');
  if (!input.title.trim() || !input.htmlContent.trim()) return held(modelName, 'empty_draft', 'El borrador está vacío.');

  const usableEvidence = input.evidence.filter((item) => {
    const host = hostOf(item.url);
    return Boolean(item.rightsStatus === 'approved' && host && item.title.trim() && item.publisher.trim() && item.excerpt.trim().length >= 120);
  });
  const distinctOrigins = new Set(usableEvidence.map((item) => item.independenceGroup?.trim() || hostOf(item.url)).filter(Boolean));
  if (usableEvidence.length < 2 || distinctOrigins.size < 2) {
    return held(modelName, 'insufficient_approved_evidence', 'Se requieren al menos dos evidencias utilizables, con permiso editorial aprobado y orígenes independientes; si falta permiso o corroboración, la nota queda retenida.');
  }

  const evidenceUrls = new Set(usableEvidence.map((item) => item.url));
  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: 'application/json', temperature: 0 },
  });

  const evidenceBlock = usableEvidence.slice(0, 5).map((item, index) => ({
    index: index + 1,
    publisher: item.publisher,
    title: item.title,
    url: item.url,
    rightsStatus: item.rightsStatus,
    independenceGroup: item.independenceGroup || hostOf(item.url),
    publishedAt: item.publishedAt || null,
    isPrimarySource: Boolean(item.isPrimarySource),
    excerpt: item.excerpt.slice(0, 6000),
  }));

  const prompt = `Sos la revisora editorial independiente de El Irónico. Revisá el borrador únicamente contra las evidencias adjuntas; no uses memoria previa ni completes datos faltantes. Una segunda IA no certifica verdad ni originalidad.\n\nCriterios: revisá cada afirmación material, nombres, fechas, cifras, unidades, citas, atribuciones, contexto omitido, tono valorativo, título y similitud con las evidencias. Distinguí hechos de declaraciones. No inventes fuentes ni enlaces. Considerá que dos dominios pueden pertenecer al mismo grupo y no son automáticamente independientes.\n\nAprobá solo si cada afirmación material queda apoyada de manera suficiente y atribuida; si hay duda, una sola fuente no primaria, contradicción, contexto importante faltante o similitud sustancial, decidí hold o revise. Las citas de evidencia deben copiar exactamente una de las URLs provistas.\n\nDevolvé exclusivamente JSON con esta forma: {"decision":"approve|revise|hold|reject","summary":"...","claims":[{"claim":"...","status":"supported|partial|unsupported|contradicted","evidenceUrls":["URL exacta de evidencia"],"note":"..."}],"issues":[{"severity":"critical|major|minor","code":"...","description":"..."}]}. Incluí todas las afirmaciones factuales materiales, no solo una muestra.\n\nBORRADOR:\nTítulo: ${input.title}\nCategoría: ${input.category}\nHTML: ${input.htmlContent.slice(0, 24000)}\n\nEVIDENCIAS:\n${JSON.stringify(evidenceBlock)}`;

  try {
    const response = await model.generateContent(prompt);
    const parsed = JSON.parse(response.response.text());
    return validateReview(parsed, modelName, evidenceUrls);
  } catch {
    return held(modelName, 'review_unavailable_or_invalid', 'La revisión independiente no terminó correctamente; el artículo debe quedar retenido.');
  }
}
