#!/usr/bin/env python3
"""Static fail-closed checks for the staged editorial route; no network or DB access."""
from pathlib import Path
import re
import sys

root = Path(__file__).parent.parent
route = (root / "app/api/fetch-news/route.ts").read_text(encoding="utf-8")
sources = (root / "lib/newsSources.ts").read_text(encoding="utf-8")
review = (root / "lib/editorialReview.ts").read_text(encoding="utf-8")
migration = (root / "supabase/migrations/20261014_editorial_review_queue.sql").read_text(encoding="utf-8")

checks = {
    "publication pause is closed": "EDITORIAL_PUBLICATION_PAUSED = true" in route,
    "review gate is closed": "EDITORIAL_REVIEW_GATE_READY = false" in route,
    "queue schema gate is closed": "EDITORIAL_QUEUE_SCHEMA_READY = false" in route,
    "AI budget gate is closed": "EDITORIAL_AI_BUDGET_APPROVED = false" in route,
    "no public article insert": not re.search(r"\.from\(['\"]news_articles['\"]\)\s*\.insert", route),
    "no public IndexNow call": "/api/indexnow" not in route,
    "private queue uses atomic RPC": "rpc('enqueue_editorial_review_candidate'" in route,
    "AI approval remains pending, never published": "queueStatus = 'review_pending'" in route and "publishedCount: 0" in route,
    "review uses a separate credential": "process.env.EDITORIAL_REVIEW_API_KEY" in review and "process.env.GEMINI_API_KEY;" not in review,
    "all configured sources are disabled": sources.count("enabled: false") == 22 and "enabled: true" not in sources,
    "migration has no public publishing status": "'published'" not in migration and "published_article_id" not in migration,
    "private RPC permission is service-role-only": "grant execute on function public.enqueue_editorial_review_candidate" in migration and "from public, anon, authenticated" in migration,
}
for name, ok in checks.items():
    print(("PASS" if ok else "FAIL") + " " + name)
if not all(checks.values()):
    sys.exit(1)
