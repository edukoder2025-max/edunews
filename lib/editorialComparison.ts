export type EditorialComparisonData = {
  sourceFindings: Array<{ aspect: string; observation: string; evidenceUrls: string[] }>;
  elIronicoImprovements: Array<{ aspect: string; action: string }>;
};

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text && text.length <= maxLength ? text : null;
}

function safeEvidenceUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return null;
    if (['localhost', '127.0.0.1', '::1'].includes(url.hostname.toLowerCase())) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function aspectKey(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es-AR').replace(/\s+/g, ' ');
}

/** Parse the separately stored comparison. Any incomplete, unmatched or unlinked comparison fails closed. */
export function parseEditorialComparison(raw: unknown): EditorialComparisonData | null {
  if (!raw || typeof raw !== 'object') return null;
  const value = raw as Record<string, unknown>;
  if (!Array.isArray(value.sourceFindings) || !Array.isArray(value.elIronicoImprovements)) return null;
  if (value.sourceFindings.length < 1 || value.sourceFindings.length > 5 || value.elIronicoImprovements.length !== value.sourceFindings.length) return null;

  const findings: EditorialComparisonData['sourceFindings'] = [];
  for (const rawFinding of value.sourceFindings) {
    if (!rawFinding || typeof rawFinding !== 'object') return null;
    const item = rawFinding as Record<string, unknown>;
    const aspect = cleanText(item.aspect, 120);
    const observation = cleanText(item.observation, 1000);
    if (!aspect || !observation || !Array.isArray(item.evidenceUrls) || item.evidenceUrls.length < 1 || item.evidenceUrls.length > 5) return null;
    const evidenceUrls = [...new Set(item.evidenceUrls.map(safeEvidenceUrl).filter((url): url is string => Boolean(url)))];
    if (!evidenceUrls.length || evidenceUrls.length !== item.evidenceUrls.length) return null;
    findings.push({ aspect, observation, evidenceUrls });
  }

  const improvements: EditorialComparisonData['elIronicoImprovements'] = [];
  for (const rawImprovement of value.elIronicoImprovements) {
    if (!rawImprovement || typeof rawImprovement !== 'object') return null;
    const item = rawImprovement as Record<string, unknown>;
    const aspect = cleanText(item.aspect, 120);
    const action = cleanText(item.action, 1000);
    if (!aspect || !action) return null;
    improvements.push({ aspect, action });
  }

  const findingKeys = findings.map((item) => aspectKey(item.aspect));
  const improvementKeys = improvements.map((item) => aspectKey(item.aspect));
  if (new Set(findingKeys).size !== findingKeys.length || new Set(improvementKeys).size !== improvementKeys.length) return null;
  if (findingKeys.some((key) => !improvementKeys.includes(key))) return null;

  return {
    sourceFindings: findings,
    elIronicoImprovements: findingKeys.map((key) => improvements[improvementKeys.indexOf(key)]),
  };
}

export function hasValidEditorialComparison(value: unknown): boolean {
  return parseEditorialComparison(value) !== null;
}

/** Keep only simple editorial markup from generated HTML; remove executable content and all unapproved attributes. */
export function sanitizeEditorialHtml(raw: string): string {
  const allowed = new Set(['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'blockquote', 'br', 'hr', 'a']);
  return (raw || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|iframe|object|embed|svg|math|form|textarea|select|button|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(script|style|iframe|object|embed|svg|math|form|textarea|select|button|noscript)\b[^>]*\/?>/gi, '')
    .replace(/<\s*(\/?)\s*([a-z0-9]+)\b([^>]*)>/gi, (_match, closing: string, rawTag: string, attrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!allowed.has(tag)) return '';
      if (closing) return `</${tag}>`;
      if (tag !== 'a') return `<${tag}>`;
      const hrefMatch = attrs.match(/\bhref\s*=\s*(["'])(.*?)\1/i);
      const href = hrefMatch ? safeEvidenceUrl(hrefMatch[2]) : null;
      if (!href) return '<a>';
      const escaped = href.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      return `<a href="${escaped}" rel="nofollow noopener noreferrer">`;
    });
}
