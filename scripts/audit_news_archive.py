#!/usr/bin/env python3
"""Read-only mechanical triage of news_articles; never editorial or factual approval."""
import argparse
import csv
import html
import json
import re
import sys
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from html.parser import HTMLParser

FIELDS = "id,original_title,ai_title,category,source_name,source_url,published_at,original_content,ai_content,sources_used"
PAGE_SIZE = 50


class VisibleText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.hidden_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag.lower() in {"script", "style", "noscript"}:
            self.hidden_depth += 1
        elif tag.lower() in {"p", "br", "div", "li", "h1", "h2", "h3", "blockquote"}:
            self.parts.append(" ")

    def handle_endtag(self, tag):
        if tag.lower() in {"script", "style", "noscript"} and self.hidden_depth:
            self.hidden_depth -= 1
        elif tag.lower() in {"p", "br", "div", "li", "h1", "h2", "h3", "blockquote"}:
            self.parts.append(" ")

    def handle_data(self, data):
        if not self.hidden_depth:
            self.parts.append(data)


def text(value):
    if not isinstance(value, str):
        return ""
    parser = VisibleText()
    try:
        parser.feed(value)
        value = " ".join(parser.parts)
    except Exception:
        value = re.sub(r"<[^>]*>", " ", value)
    return re.sub(r"\s+", " ", html.unescape(value)).replace("\xa0", " ").strip()


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


def valid_date(value):
    if not isinstance(value, str) or not value.strip():
        return False
    candidate = value.strip().replace("Z", "+00:00")
    try:
        datetime.fromisoformat(candidate)
        return True
    except ValueError:
        return False


def fetch_page(base_url, api_key, start, end):
    query = urllib.parse.urlencode({"select": FIELDS, "order": "published_at.desc"})
    url = base_url.rstrip("/") + "/rest/v1/news_articles?" + query
    request = urllib.request.Request(url, headers={
        "apikey": api_key, "Authorization": "Bearer " + api_key,
        "Range": f"{start}-{end}", "Prefer": "count=exact", "Accept": "application/json",
    }, method="GET")
    with urllib.request.urlopen(request, timeout=45) as response:
        body = response.read()
        content_range = response.headers.get("Content-Range", "")
    match = re.search(r"/(\d+|\*)$", content_range)
    total = int(match.group(1)) if match and match.group(1).isdigit() else None
    rows = json.loads(body)
    if not isinstance(rows, list):
        raise ValueError("Supabase response was not a list")
    return rows, total


def read_stdin_pages():
    # curl may pretty-print arrays across many lines; decode adjacent JSON arrays
    # separated by whitespace without ever writing the raw response to disk.
    payload = sys.stdin.read()
    decoder = json.JSONDecoder()
    rows, index, pages = [], 0, 0
    while index < len(payload):
        while index < len(payload) and payload[index].isspace():
            index += 1
        if index >= len(payload):
            break
        try:
            page, index = decoder.raw_decode(payload, index)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON page after {pages} complete page(s)") from exc
        if not isinstance(page, list):
            raise ValueError(f"Page {pages + 1} is not a list")
        rows.extend(page)
        pages += 1
    return rows


def percentile(sorted_values, p):
    if not sorted_values:
        return 0
    index = (len(sorted_values) - 1) * p
    lo, hi = int(index), min(int(index) + 1, len(sorted_values) - 1)
    return round(sorted_values[lo] + (sorted_values[hi] - sorted_values[lo]) * (index - lo), 1)


def main():
    parser = argparse.ArgumentParser(description="Read-only mechanical triage; not an editorial approval tool")
    parser.add_argument("--out", default="editorial_archive_audit.csv", help="CSV output path (metadata only)")
    parser.add_argument("--summary", default="editorial_archive_summary.json", help="JSON summary path")
    parser.add_argument("--pause", type=float, default=0.15, help="Delay between REST pages")
    parser.add_argument("--stdin-pages", action="store_true", help="Read adjacent JSON arrays from stdin (for externally fetched pages)")
    parser.add_argument("--reported-total", type=int, default=None, help="Exact row count obtained separately, if stdin mode is used")
    args = parser.parse_args()

    total = args.reported_total if args.stdin_pages else None
    if args.stdin_pages:
        all_rows = read_stdin_pages()
    else:
        base_url = __import__("os").getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip()
        api_key = __import__("os").getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "").strip()
        if not base_url or not api_key:
            sys.exit("Missing NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY; no writes were performed.")
        import time
        all_rows, total, start = [], None, 0
        while True:
            rows, page_total = fetch_page(base_url, api_key, start, start + PAGE_SIZE - 1)
            all_rows.extend(rows)
            if total is None and page_total is not None:
                total = page_total
            if not rows:
                break
            start += len(rows)
            if (total is not None and start >= total) or len(rows) < PAGE_SIZE:
                break
            time.sleep(max(0.0, args.pause))

    source_url_counts = Counter()
    normalized_title_counts = Counter()
    for row in all_rows:
        source_url = (row.get("source_url") or "").strip()
        if source_url:
            source_url_counts[source_url] += 1
        title = row.get("ai_title") or row.get("original_title") or ""
        normalized_title_counts[" ".join(tokens(title))] += 1

    output, flag_counts = [], Counter()
    source_counts, category_counts = Counter(), Counter()
    source_evidence_counts = Counter()
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
        source_url = (row.get("source_url") or "").strip()
        published_at = row.get("published_at") or ""
        source_counts[source_name or "(missing)"] += 1
        category_counts[category or "(missing)"] += 1
        source_evidence_counts[str(len(evidence_sources))] += 1
        word_counts.append(ai_words)

        flags = []
        if not title.strip(): flags.append("missing_title")
        if not source_url: flags.append("missing_source_url")
        if not source_name: flags.append("missing_source_name")
        if not ai_body.strip(): flags.append("missing_ai_body")
        if not published_at: flags.append("missing_published_at")
        elif not valid_date(published_at): flags.append("invalid_published_at")
        if not evidence_sources: flags.append("missing_sources_used")
        elif len(evidence_sources) == 1: flags.append("single_source_recorded")
        if ai_words < 100: flags.append("very_short_under_100")
        elif ai_words < 200: flags.append("short_under_200")
        if ai_words > 1400: flags.append("very_long_over_1400")
        if source_url and source_url_counts[source_url] > 1: flags.append("duplicate_source_url")
        if normalized_title and normalized_title_counts[normalized_title] > 1: flags.append("duplicate_normalized_title")
        overlap = overlap_jaccard(ai_body, original_body)
        if isinstance(overlap, float) and overlap >= 0.35: flags.append("high_source_overlap_signal")

        for flag in flags:
            flag_counts[flag] += 1
        output.append({
            "id": row.get("id", ""),
            "published_at": published_at,
            "source_name": source_name,
            "category": category,
            "title": text(title),
            "source_url": source_url,
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

    sorted_words = sorted(word_counts)
    summary = {
        "generated_at_utc": now.isoformat(),
        "rows_returned": len(all_rows),
        "server_count_reported": total,
        "read_only": True,
        "article_bodies_saved": False,
        "interpretation": "Mechanical triage only; no factual, licensing, editorial, or originality verification. Unflagged rows are not approved for publication.",
        "article_word_count_approx": {
            "min": min(sorted_words) if sorted_words else 0,
            "p10": percentile(sorted_words, .10),
            "median": percentile(sorted_words, .50),
            "p90": percentile(sorted_words, .90),
            "max": max(sorted_words) if sorted_words else 0,
            "under_100": sum(n < 100 for n in sorted_words),
            "under_200": sum(n < 200 for n in sorted_words),
            "under_300": sum(n < 300 for n in sorted_words),
            "over_1400": sum(n > 1400 for n in sorted_words),
        },
        "recorded_sources_used_distribution": dict(source_evidence_counts.most_common()),
        "flag_counts": dict(flag_counts.most_common()),
        "source_counts": dict(source_counts.most_common()),
        "category_counts": dict(category_counts.most_common()),
        "csv_path": args.out,
    }
    with open(args.summary, "w", encoding="utf-8") as file:
        json.dump(summary, file, ensure_ascii=False, indent=2)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print("CSV:", args.out)
    print("Summary:", args.summary)


if __name__ == "__main__":
    main()
