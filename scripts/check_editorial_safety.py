#!/usr/bin/env python3
"""Static fail-closed checks for the editorial pilot; no network or DB access."""
from pathlib import Path
import re
import sys

root = Path(__file__).parent.parent
read = lambda path: (root / path).read_text(encoding="utf-8")
route = read("app/api/fetch-news/route.ts")
sources = read("lib/newsSources.ts")
review = read("lib/editorialReview.ts")
gemini = read("lib/gemini.ts")
migration = read("supabase/migrations/20261014_editorial_review_queue.sql")
visibility = read("lib/publicationVisibility.ts")
article = read("app/noticias/[category]/[articlePath]/page.tsx")
comparison = read("components/EditorialComparisonPanel.tsx")
comparison_validator = read("lib/editorialComparison.ts")
home = read("app/page.tsx")
public_display = "\n".join(read(path) for path in [
    "app/page.tsx", "app/categoria/[slug]/page.tsx", "app/search/page.tsx",
    "app/temas/[slug]/page.tsx", "app/news/[id]/page.tsx",
    "app/noticias/[category]/[articlePath]/page.tsx",
    "app/noticias/[category]/[articlePath]/opengraph-image.tsx", "app/sitemap.ts",
])
public_surfaces = [
    "app/page.tsx", "app/categoria/[slug]/page.tsx", "app/search/page.tsx",
    "app/temas/[slug]/page.tsx", "app/noticias/[category]/[articlePath]/page.tsx",
    "app/news/[id]/page.tsx", "app/noticias/[category]/[articlePath]/opengraph-image.tsx",
    "app/sitemap.ts", "app/api/check-db/route.ts", "app/api/inspect-target/route.ts", "app/api/debug-category/route.ts",
]
visibility_ok = all(
    "PUBLIC_NEWS_CUTOFF" in read(path)
    and ".gte('created_at', PUBLIC_NEWS_CUTOFF)" in read(path)
    for path in public_surfaces
)
all_app_files = "\n".join(p.read_text(encoding="utf-8") for p in (root / "app").rglob("*.tsx"))

checks = {
    "publication pause remains closed": "EDITORIAL_PUBLICATION_PAUSED = true" in route,
    "review gate remains closed": "EDITORIAL_REVIEW_GATE_READY = false" in route,
    "queue schema gate remains closed": "EDITORIAL_QUEUE_SCHEMA_READY = false" in route,
    "AI budget gate remains closed": "EDITORIAL_AI_BUDGET_APPROVED = false" in route,
    "no public article insert": not re.search(r"\.from\(['\"]news_articles['\"]\)\s*\.insert", route),
    "no public IndexNow call": "/api/indexnow" not in route,
    "private queue uses atomic RPC": "rpc('enqueue_editorial_review_candidate'" in route,
    "AI approval remains pending, never published": "queueStatus = 'review_pending'" in route and "publishedCount: 0" in route,
    "same Gemini credential powers separate redactor call": "process.env.GEMINI_API_KEY" in review and "redactedHtmlContent" in review and "EDITORIAL_REVIEW_API_KEY" not in review,
    "redactor follows original critical model": "no es un periódico que reescribe feeds" in review and "hagas sustitución mecánica" in review and "editorialComparison" in review and "editorialComparison" in route,
    "source criticism cites approved evidence": "evidenceUrls.some((url) => !allowedUrls.has(url))" in review and "comparisonComplete" in review,
    "pilot is limited to one story per execution": "MAX_STORIES_PER_RUN = 1" in route,
    "pilot uses same Gemini key without fallback": "allowFallback: false" in route and "options.allowFallback !== false" in gemini,
    "all configured sources are disabled": sources.count("enabled: false") == 22 and "enabled: true" not in sources,
    "queue migration has no public publishing status": "'published'" not in migration and "published_article_id" not in migration,
    "private RPC permission is service-role-only": "grant execute on function public.enqueue_editorial_review_candidate" in migration and "from public, anon, authenticated" in migration,
    "preview cutoff remains fixed": "2026-10-14T15:49:00.000Z" in visibility,
    "all checked public surfaces preserve the created-at cutoff": visibility_ok,
    "homepage fails closed on complete comparison": "hasValidEditorialComparison(article.editorial_comparison)" in home,
    "homepage empty state does not expose fetch endpoint": "/api/fetch-news" not in home,
    "article body requires title, own body and valid separate comparison": "!article.ai_title?.trim() || !article.ai_content?.trim() || !comparison" in article,
    "generated article HTML uses an allowlist sanitizer": "sanitizeEditorialHtml(article.ai_content)" in article and "export function sanitizeEditorialHtml" in comparison_validator,
    "comparison parser requires evidence and paired aspects": "item.evidenceUrls.length < 1" in comparison_validator and "findingKeys.some((key) => !improvementKeys.includes(key))" in comparison_validator,
    "old transparency panel is not imported or used": "AiTransparencyPanel" not in all_app_files and "AiTransparencyPanel" not in article,
    "article never renders full original body": "original_content" not in article and "original_content" not in comparison,
    "no hard-coded bias/objectivity scores remain on public surfaces": not re.search(r"\b(?:98\.4|72)%?\b|bias_score|neutrality index|índice de neutralidad", public_display, re.I),
    "no legacy original-body fallback in new listings": "original_content" not in public_display,
    "comparison shows source title and concise paired evidence": "sourceTitle" in comparison and "evidenceUrls" in comparison and "improvement.action" in comparison,
    "comparison body is a distinct module, not concatenated to article": "EditorialComparisonPanel" in article and "sanitizeEditorialHtml(article.ai_content)" in article,
    "public tables do not write new article rows": not re.search(r"\.from\(['\"]news_articles['\"]\)\s*\.insert", all_app_files),
    "pending comparison schema is documented, not applied": "do not apply yet" in read("docs/pending-editorial-comparison-column.md") and not (root / "supabase/migrations/20261015_editorial_comparison.sql").exists(),
}
for name, ok in checks.items():
    print(("PASS" if ok else "FAIL") + " " + name)
if not all(checks.values()):
    sys.exit(1)
