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

export type EditorialComparison = {
  sourceFindings: Array<{ aspect: string; observation: string; evidenceUrls: string[] }>;
  elIronicoImprovements: Array<{ aspect: string; action: string }>;
};

export type EditorialReviewResult = {
  decision: ReviewDecision;
  model: string;
  summary: string;
  redactedTitle: string | null;
  redactedHtmlContent: string | null;
  editorialComparison: EditorialComparison | null;
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
    editorialComparison: null,
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
  let editorialComparison: EditorialComparison | null = null;
  const comparisonRaw = value.editorialComparison;
  if (comparisonRaw && typeof comparisonRaw === 'object') {
    const comparison = comparisonRaw as Record<string, unknown>;
    const findingsRaw = Array.isArray(comparison.sourceFindings) ? comparison.sourceFindings : [];
    const improvementsRaw = Array.isArray(comparison.elIronicoImprovements) ? comparison.elIronicoImprovements : [];
    const sourceFindings: EditorialComparison['sourceFindings'] = [];
    for (const item of findingsRaw) {
      if (!item || typeof item !== 'object') return held(model, 'invalid_editorial_comparison', 'La comparación editorial contiene un hallazgo mal formado.');
      const finding = item as Record<string, unknown>;
      const evidenceUrls = Array.isArray(finding.evidenceUrls) ? finding.evidenceUrls.filter((url): url is string => typeof url === 'string') : [];
      if (typeof finding.aspect !== 'string' || !finding.aspect.trim() || typeof finding.observation !== 'string' || !finding.observation.trim() || evidenceUrls.length === 0 || evidenceUrls.some((url) => !allowedUrls.has(url))) {
        return held(model, 'invalid_editorial_comparison', 'Cada crítica a la pieza fuente debe ser concreta y citar evidencias aprobadas.');
      }
      sourceFindings.push({ aspect: finding.aspect.trim().slice(0, 120), observation: finding.observation.trim().slice(0, 1000), evidenceUrls });
    }
    const elIronicoImprovements: EditorialComparison['elIronicoImprovements'] = [];
    for (const item of improvementsRaw) {
      if (!item || typeof item !== 'object') return held(model, 'invalid_editorial_comparison', 'La comparación no describe una mejora editorial propia válida.');
      const improvement = item as Record<string, unknown>;
      if (typeof improvement.aspect !== 'string' || !improvement.aspect.trim() || typeof improvement.action !== 'string' || !improvement.action.trim()) {
        return held(model, 'invalid_editorial_comparison', 'La comparación no describe una mejora editorial propia válida.');
      }
      elIronicoImprovements.push({ aspect: improvement.aspect.trim().slice(0, 120), action: improvement.action.trim().slice(0, 1000) });
    }
    editorialComparison = { sourceFindings, elIronicoImprovements };
  }
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
  const comparisonComplete = Boolean(editorialComparison && editorialComparison.sourceFindings.length > 0 && editorialComparison.elIronicoImprovements.length > 0);
  if (decision === 'approve' && (!redactedTitle || !redactedHtmlContent || !comparisonComplete || claims.length === 0 || anyUnsupported || severeIssue)) finalDecision = 'hold';

  return {
    decision: finalDecision,
    model,
    summary: typeof value.summary === 'string' ? value.summary : 'La segunda etapa terminó sin resumen.',
    redactedTitle,
    redactedHtmlContent,
    editorialComparison,
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

  const prompt = `Sos la redactora crítica de segunda etapa de El Irónico. Usás una llamada separada, pero la misma credencial Gemini que la IA generativa. MODELO EDITORIAL: El Irónico no es un periódico que reescribe feeds ni reproduce la noticia con otras palabras. Publica artículos propios que examinan críticamente cómo la fuente original construyó su pieza y, al mismo tiempo, ofrecen al lector una versión periodística mejor documentada, precisa y bien armada. Tu trabajo no es resumir ni parafrasear: usá el borrador inicial como material de trabajo, no como texto final, y reconstruí una pieza original con tesis, estructura y valor propios.

ARTÍCULO PRINCIPAL (redactedTitle y redactedHtmlContent):
- Escribí para el lector, no como una carta o una instrucción directa al medio. El título debe expresar la tesis o el problema editorial comprobable con precisión y sin clickbait; no uses fórmulas genéricas como “así se debe escribir” ni acusaciones vacías.
- La nota debe hacer una crítica fuerte, concreta y argumentada de las decisiones periodísticas observables en la pieza fuente: título y enfoque, relación entre título y contenido, entrada, evidencia y fuentes, atribuciones, contexto, equilibrio, tratamiento de cifras/citas, estructura y claridad. Elegí solo los aspectos que puedas demostrar; no fuerces todos los puntos.
- Construí un artículo legible y completo: entrada que explique por qué importa el caso, desarrollo con ejemplos verificables, contexto indispensable, análisis de cómo esas decisiones afectan la comprensión del lector y cierre que deje clara la lección o el límite. La propia nota debe demostrar el estándar que reclama mediante exactitud, fuentes, atribuciones, contexto y límites explícitos.
- La crítica recae en el texto y sus decisiones editoriales, no en ataques personales. No atribuyas intención, mala fe, mentira, manipulación, incompetencia o sesgo a periodistas o medios sin evidencia directa, suficiente y relevante. No conviertas una omisión no verificable en hecho: si solo recibiste un fragmento, limita la crítica a ese fragmento.
- No inventes ni completes hechos. Usá exclusivamente las evidencias aprobadas adjuntas. Separá hechos, declaraciones e interpretación; incluí todas las limitaciones relevantes. No reproduzcas párrafos de la fuente ni hagas sustitución mecánica de sinónimos; las citas deben ser breves, necesarias y atribuidas. Dos dominios del mismo grupo no son evidencia independiente.
- Si la fuente no presenta un defecto periodístico material que pueda demostrarse con la evidencia disponible, no fabriques una crítica: decidí reject o hold y explica por qué.
- Redactá con párrafos y subtítulos HTML útiles, sin relleno; apunta a 450–800 palabras solo cuando la evidencia alcance. Si el caso es breve, preferí una pieza más corta, precisa y honesta.

COMPARACIÓN EDITORIAL SEPARADA: devolvé editorialComparison para el módulo separado de la página, no la mezcles dentro del cuerpo principal. Incluí entre 1 y 5 hallazgos concretos de la pieza fuente, cada uno con aspecto, observación y una o más URLs exactas de evidencia; y entre 1 y 5 acciones que expliquen qué hizo El Irónico para corregir o mejorar ese aspecto. La comparación tiene que corresponder a la crítica desarrollada en el artículo. No declares que El Irónico resolvió algo si la propia nota no lo demuestra.

AUDITORÍA: revisá todas las afirmaciones materiales del artículo final. decision solo puede ser approve si la pieza es original en enfoque y estructura, contiene una crítica verificable, cada afirmación factual material está apoyada por evidencias aprobadas, el cuerpo principal está completo y editorialComparison contiene hallazgos citados y mejoras propias. Si hay insuficiencia, contradicción, afirmación parcial, similitud sustancial, crítica no demostrada o comparación incompleta, elegí hold/revise/reject. Esta etapa no certifica verdad ni originalidad y no reemplaza la edición final de Zapia. Las URLs de claims y comparación deben copiarse exactamente de las evidencias proporcionadas.

Devolvé exclusivamente JSON con esta forma: {"decision":"approve|revise|hold|reject","summary":"...","redactedTitle":"título propio de El Irónico","redactedHtmlContent":"artículo crítico original en HTML","editorialComparison":{"sourceFindings":[{"aspect":"...","observation":"...","evidenceUrls":["URL exacta"]}],"elIronicoImprovements":[{"aspect":"...","action":"..."}]},"claims":[{"claim":"...","status":"supported|partial|unsupported|contradicted","evidenceUrls":["URL exacta"],"note":"..."}],"issues":[{"severity":"critical|major|minor","code":"...","description":"..."}]}. Incluí todas las afirmaciones factuales materiales. Si no hay crítica sustentable, devuelve decision=reject o hold; no inventes observaciones.

BORRADOR DE TRABAJO DE LA PRIMERA ETAPA:
Título: ${input.title}
Categoría: ${input.category}
HTML: ${input.htmlContent.slice(0, 24000)}

EVIDENCIAS APROBADAS:
${JSON.stringify(evidenceBlock)}`;

  try {
    const response = await model.generateContent(prompt);
    const parsed = JSON.parse(response.response.text());
    return validateReview(parsed, modelName, evidenceUrls);
  } catch {
    return held(modelName, 'redactor_unavailable_or_invalid', 'La segunda etapa de redacción falló; el artículo debe quedar retenido.');
  }
}
