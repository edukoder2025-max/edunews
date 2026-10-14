-- Private draft/review staging tables. No public policies are created.
-- Do not restore public INSERT on public.news_articles.

create table if not exists public.editorial_review_queue (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  source_name text not null,
  source_url text not null unique,
  original_title text not null,
  original_content text not null default '',
  source_published_at timestamptz,
  evidence jsonb not null default '[]'::jsonb,
  draft_title text,
  draft_content text,
  category text,
  status text not null default 'candidate'
    check (status in ('candidate', 'evidence_ready', 'draft', 'review_pending', 'approved', 'held', 'rejected', 'published', 'withdrawn')),
  review_result jsonb,
  writer_model text,
  reviewer_model text,
  prompt_version text,
  story_key text,
  revision_number integer not null default 1 check (revision_number > 0),
  published_article_id uuid references public.news_articles(id) on delete set null,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  published_at timestamptz
);

create index if not exists editorial_review_queue_status_created_idx
  on public.editorial_review_queue (status, created_at desc);
create index if not exists editorial_review_queue_story_key_idx
  on public.editorial_review_queue (story_key);

create table if not exists public.editorial_review_events (
  id uuid primary key default gen_random_uuid(),
  queue_id uuid not null references public.editorial_review_queue(id) on delete cascade,
  actor text not null,
  event_type text not null,
  from_status text,
  to_status text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists editorial_review_events_queue_created_idx
  on public.editorial_review_events (queue_id, created_at desc);

alter table public.editorial_review_queue enable row level security;
alter table public.editorial_review_events enable row level security;
revoke all on table public.editorial_review_queue from public, anon, authenticated;
revoke all on table public.editorial_review_events from public, anon, authenticated;
grant all on table public.editorial_review_queue to service_role;
grant all on table public.editorial_review_events to service_role;

comment on table public.editorial_review_queue is 'Private staging queue; articles are not public until independent review approval.';
comment on table public.editorial_review_events is 'Append-only editorial status and review audit trail.';
