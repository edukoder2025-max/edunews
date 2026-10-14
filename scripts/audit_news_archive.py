#!/usr/bin/env python3
"""Read-only triage report for public.news_articles; heuristics are not editorial approval."""
import argparse
import csv
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timezone

FIELDS = "id,original_title,ai_title,category,source_name,source_url,published_at,original_content,ai_content,sources_used"
PAGE_SIZE = 250


def text(value):
    return html.unescape(re.sub(r"<[^>]*>", " ", value or "")).replace("\xa0", " ")


def tokens(value):
    return re.findall(r"[^\W_]+", text(value).casefold(), flags=re.UNICODE)


def shingles(words, size=5):
    if len(words) < size:
        return set()
    return {tuple(words[i:i + size]) for i in range(len(words) - size + 1)}


def overlap_jaccard(left, right):
    a, b = shingles(tokens(left)), shingles(tokens(right))
    if not a or not b:
        return ""
    return round(len(a & b) / len(a | b), 4)


def parse_sources(value):
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            decoded = json.loads(value)
            return decoded if isinstance(decoded, list) else []
        except json.JSONDecodeError:
            return []
    return []


def fetch_page(base_url, anon_key, start, end):
    query = urllib.parse.urlencode({"select": FIELDS, "order": "published_at.desc"})
    url = base_url.rstrip("/") + "/rest/v1/news_articles?" + query
    request = urllib.request.Request(
        url,
        headers={
            "apikey": anon_key,
            "Authorization": "Bearer " + anon_key,
            "Range": f"{start}-{end}",
            "Prefer": "count=exact",
            "Accept": "application/json",
        },
        method="GET",
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        body = response.read()
        content_range = response.headers.get("Content-Range", "")
    match = re.search(r"/(\d+|\*)$", content_range)
    total = int(match.group(1)) if match and match.group(1).isdigit() else None
    rows = json.loads(body)
    if not isinstance(rows, list):
        raise ValueError("Supabase devolvió una respuesta que no es una lista de filas")
    return rows, total


def main():
    parser = argparse.ArgumentParser(description="Auditoría mecánica de solo lectura del archivo editorial")
    parser.add_argument("--out", default="editorial_archive_audit.csv", help="Ruta del CSV de salida")
    parser.add_argument("--summary", default="editorial_archive_summary.json", help="Ruta del resumen JSON")
    parser.add_argument("--pause", type=float, default=0.15, help="Pausa entre páginas, en segundos")
    args = parser.parse_args()

    base_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    anon_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "").strip()
    if not base_url or not anon_key:
        sys.exit("Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY; no se realizó ninguna escritura.")

    all_rows = []
    total = None
    start = 0
    while True:
        rows, page_total = fetch_page(base_url, anon_key, start, start + PAGE_SIZE - 1)
        all_rows.extend(rows)
        if total is None and page_total is not None:
            total = page_total
        if not rows:
            break
        start += len(rows)
        if (total is not None and start >= total) or len(rows) < PAGE_SIZE:
            break
        time.sleep(max(0.0, args.pause))

    source_url_counts = Counter((r.get("source_url") or "").strip() for r in all_rows if r.get("source_url"))
    normalized_title_counts = Counter(" ".join(tokens(r.get("ai_title") or r.get("original_title"))) for r in all_rows)
    output = []
    flag_counts = Counter()
    source_counts = Counter()
    category_counts = Counter()
    word_counts = []
    now = datetime.now(timezone.utc)

    for row in all_rows:
        ai_body = row.get("ai_content") or ""
        original_body = row.get("original_content") or ""
        ai_words = len(tokens(ai_body))
        original_words = len(tokens(original_body))
        title = row.get("ai_title") or row.get("original_title") or ""
        normalized_title = " ".join(tokens(title))
        evidence_sources = parse_sources(row.get("sources_used"))
        source_name = row.get("source_name") or ""
        category = row.get("category") or ""
        source_counts[source_name or "(sin fuente)"] += 1
        category_counts[category or "(sin categoría)"] += 1
        word_counts.append(ai_words)

        flags = []
        if not (row.get("source_url") or "").strip(): flags.append("missing_source_url")
        if not source_name: flags.append("missing_source_name")
        if not ai_body.strip(): flags.append("missing_ai_body")
        if not evidence_sources: flags.append("missing_sources_used")
        elif len(evidence_sources) == 1: flags.append("single_source_recorded")
        if ai_words < 100: flags.append("very_short_under_100")
        elif ai_words < 200: flags.append("short_under_200")
        if ai_words > 1400: flags.append("very_long_over_1400")
        if row.get("source_url") and source_url_counts[row["source_url"].strip()] > 1: flags.append("duplicate_source_url")
        if normalized_title and normalized_title_counts[normalized_title] > 1: flags.append("duplicate_normalized_title")
        overlap = overlap_jaccard(ai_body, original_body)
        if isinstance(overlap, float) and overlap >= 0.35: flags.append("high_source_overlap_signal")

        for flag in flags:
            flag_counts[flag] += 1
        output.append({
            "id": row.get("id", ""),
            "published_at": row.get("published_at", ""),
            "source_name": source_name,
            "category": category,
            "title": text(title).strip(),
            "source_url": row.get("source_url", ""),
            "recorded_source_count": len(evidence_sources),
            "article_words": ai_words,
            "source_words": original_words,
            "five_word_shingle_jaccard": overlap,
            "risk_flags": ";".join(flags),
            "triage_only": "flagged_for_review" if flags else "no_flags_not_approved",
        })

    columns = ["id", "published_at", "source_name", "category", "title", "source_url", "recorded_source_count", "article_words", "source_words", "five_word_shingle_jaccard", "risk_flags", "triage_only"]
    with open(args.out, "w", newline="", encoding="utf-8-sig") as file:
        writer = csv.DictWriter(file, fieldnames=columns)
        writer.writeheader()
        writer.writerows(output)

    word_counts.sort()
    median_words = word_counts[len(word_counts) // 2] if word_counts else 0
    summary = {
        "generated_at_utc": now.isoformat(),
        "rows_returned": len(all_rows),
        "server_count_reported": total,
        "read_only": True,
        "interpretation": "Triage mecánico; no verifica hechos, licencias, calidad editorial ni originalidad, y no aprueba publicaciones.",
        "median_article_words_approx": median_words,
        "flag_counts": dict(flag_counts.most_common()),
        "source_counts": dict(source_counts.most_common()),
        "category_counts": dict(category_counts.most_common()),
        "csv_path": args.out,
    }
    with open(args.summary, "w", encoding="utf-8") as file:
        json.dump(summary, file, ensure_ascii=False, indent=2)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print("CSV:", args.out)
    print("Resumen:", args.summary)
    print("Nota: un artículo sin banderas mecánicas no se considera aprobado.")


if __name__ == "__main__":
    main()
