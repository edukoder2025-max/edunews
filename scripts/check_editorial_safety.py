#!/usr/bin/env python3
"""Static fail-closed checks for the staged editorial route; no network or DB access."""
from pathlib import Path
import re
import sys

root = Path(__file__).parent.parent
route = (root / "app/api/fetch-news/route.ts").read_text(encoding="utf-8")
sources = (root / "lib/newsSources.ts").read_text(encoding="utf-8")
review = (root / "lib/editorialReview.ts").read_text(encoding="utf-8")
gemini = (root / "lib/gemini.ts").read_text(encoding="utf-8")
migration = (root / "supabase/migrations/20261014_editorial_review_queue.sql").read_text(encoding="utf-8")
visibility = (root / "lib/publicationVisibility.ts").read_text(encoding="utf-8")
public_surfaces = [
    "app/page.tsx",
    "app/layout.tsx",
    "app/categoria/[slug]/page.tsx",
    "app/search/page.tsx",
    "app/temas/[slug]/page.tsx",
    "app/noticias/[category]/[articlePath]/page.tsx",
    "app/news/[id]/page.tsx",
    "app/noticias/[category]/[articlePath]/opengraph-image.tsx",
    "app/sitemap.ts",
    "app/api/check-db/route.ts",
    "app/api/inspect-target/route.ts",
    "app/api/debug-category/route.ts",
]
visibility_ok = all(
    "PUBLIC_NEWS_CUTOFF" in (root / path).read_text(encoding="utf-8")
    and ".gte('created_at', PUBLIC_NEWS_CUTOFF)" in (root / path).read_text(encoding="utf-8")
    for path in public_surfaces
)

checks = {
    "publication pause is closed": "EDITORIAL_PUBLICATION_PAUSED = true" in route,
    "review gate is closed": "EDITORIAL_REVIEW_GATE_READY = false" in route,
    "queue schema gate is closed": "EDITORIAL_QUEUE_SCHEMA_READY = false" in route,
    "AI budget gate is closed": "EDITORIAL_AI_BUDGET_APPROVED = false" in route,
    "no public article insert": not re.search(r"\.from\(['\"]news_articles['\"]\)\s*\.insert", route),
    "no public IndexNow call": "/api/indexnow" not in route,
    "private queue uses atomic RPC": "rpc('enqueue_editorial_review_candidate'" in route,
    "AI approval remains pending, never published": "queueStatus = 'review_pending'" in route and "publishedCount: 0" in route,
    "same Gemini credential powers a separate redactor call": "process.env.GEMINI_API_KEY" in review and "redactedHtmlContent" in review and "redactedHtmlContent" in route and "EDITORIAL_REVIEW_API_KEY" not in review,
    "redactor follows El Irónico's original critical model": "no es un periódico que reescribe feeds" in review and "hagas sustitución mecánica" in review and "editorialComparison" in review and "editorialComparison" in route,
    "source criticism must cite approved evidence": "evidenceUrls.some((url) => !allowedUrls.has(url))" in review and "comparisonComplete" in review,
    "pilot is limited to one story per execution": "MAX_STORIES_PER_RUN = 1" in route,
    "pilot uses the same Gemini key without fallback": "allowFallback: false" in route and "options.allowFallback !== false" in gemini,
    "all configured sources are disabled": sources.count("enabled: false") == 22 and "enabled: true" not in sources,
    "migration has no public publishing status": "'published'" not in migration and "published_article_id" not in migration,
    "private RPC permission is service-role-only": "grant execute on function public.enqueue_editorial_review_candidate" in migration and "from public, anon, authenticated" in migration,
    "cutoff is explicitly fixed for this preview": "2026-10-14T15:49:00.000Z" in visibility,
    "public site surfaces filter by created_at cutoff": visibility_ok,
    "empty homepage does not expose the fetch endpoint": "/api/fetch-news" not in (root / "app/page.tsx").read_text(encoding="utf-8"),
    "retired article metadata is noindex": "robots: { index: false, follow: false }" in (root / "app/noticias/[category]/[articlePath]/page.tsx").read_text(encoding="utf-8"),
}
for name, ok in checks.items():
    print(("PASS" if ok else "FAIL") + " " + name)
if not all(checks.values()):
    sys.exit(1)
