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
  redactedTitle: string | null;
  redactedHtmlContent: string | null;
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
    redactedTitle: null,
    redactedHtmlContent: null,
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
  const redactedTitle = typeof value.redactedTitle === 'string' ? value.redactedTitle.trim().slice(0, 500) : null;
  const redactedHtmlContent = typeof value.redactedHtmlContent === 'string' ? value.redactedHtmlContent.trim().slice(0, 100000) : null;
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
  if (decision === 'approve' && (!redactedTitle || !redactedHtmlContent || claims.length === 0 || anyUnsupported || severeIssue)) finalDecision = 'hold';

  return {
    decision: finalDecision,
    model,
    summary: typeof value.summary === 'string' ? value.summary : 'La segunda etapa terminó sin resumen.',
    redactedTitle,
    redactedHtmlContent,
    claims,
    issues,
  };
}

/**
 * Second-pass Gemini redaction and evidence review using the existing Gemini credential.
 * It is a separate prompt/call, not an independent provider and not proof of truth or originality.
 * Missing/weak evidence, invalid output, or API failure always holds.
 */
export async function reviewEditorialDraft(input: {
  title: string;
  htmlContent: string;
  category: string;
  evidence: EditorialEvidence[];
}): Promise<EditorialReviewResult> {
  const modelName = process.env.GEMINI_REDACTOR_MODEL || 'gemini-2.5-flash';
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return held(modelName, 'gemini_api_key_missing', 'No está configurada la credencial Gemini ya usada por la primera etapa.');
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

  const prompt = `Sos la IA redactora de segunda etapa de El Irónico. Usás la misma credencial Gemini que la etapa generadora, pero trabajás como una llamada y un prompt separados. Tu tarea es crear una versión editorial final del borrador: original en estructura y redacción, clara, precisa, equilibrada y con valor propio. No hagas sustitución mecánica de sinónimos ni copies frases de las fuentes.\n\nUsá exclusivamente las evidencias adjuntas. No uses memoria, conocimiento externo ni completes datos faltantes. No inventes hechos, cifras, citas, fechas, enlaces ni atribuciones. Conservá el contexto material; distinguí hechos de declaraciones; atribuí las afirmaciones según la evidencia. Si algo no está respaldado, omitilo o marcá la limitación en la redacción y registralo como unsupported/partial. Dos dominios del mismo grupo no son evidencia independiente.\n\nAdemás de redactar, audita todas las afirmaciones materiales de la versión propuesta. El campo decision solo puede ser approve si el texto final es completo, no copia sustancialmente las fuentes y cada afirmación material queda apoyada por evidencias aprobadas; en caso de dudas, contradicciones, insuficiencia o similitud relevante usa hold o revise. Esta etapa no certifica verdad ni originalidad y no reemplaza la edición final de Zapia. Las URLs de evidenceUrls deben copiarse exactamente de las evidencias adjuntas.\n\nDevolvé exclusivamente JSON con esta forma: {"decision":"approve|revise|hold|reject","summary":"...","redactedTitle":"título nuevo","redactedHtmlContent":"contenido HTML nuevo","claims":[{"claim":"...","status":"supported|partial|unsupported|contradicted","evidenceUrls":["URL exacta"],"note":"..."}],"issues":[{"severity":"critical|major|minor","code":"...","description":"..."}]}. Incluí todas las afirmaciones factuales materiales. Si no podés producir una redacción respaldada, devuelve decision=hold y deja redactedTitle/redactedHtmlContent vacíos.\n\nBORRADOR DE LA PRIMERA ETAPA:\nTítulo: ${input.title}\nCategoría: ${input.category}\nHTML: ${input.htmlContent.slice(0, 24000)}\n\nEVIDENCIAS APROBADAS:\n${JSON.stringify(evidenceBlock)}`;

  try {
    const response = await model.generateContent(prompt);
    const parsed = JSON.parse(response.response.text());
    return validateReview(parsed, modelName, evidenceUrls);
  } catch {
    return held(modelName, 'redactor_unavailable_or_invalid', 'La segunda etapa de redacción falló; el artículo debe quedar retenido.');
  }
}
