-- Private draft/review staging only. This migration deliberately has no public publication path.
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
    check (status in ('candidate', 'evidence_ready', 'draft', 'review_pending', 'held', 'rejected', 'withdrawn')),
  review_result jsonb,
  writer_model text,
  reviewer_model text,
  prompt_version text,
  story_key text,
  revision_number integer not null default 1 check (revision_number > 0),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
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

-- Insert a queue item and its audit event atomically. It cannot write to news_articles.
create or replace function public.enqueue_editorial_review_candidate(
  p_source_id text,
  p_source_name text,
  p_source_url text,
  p_original_title text,
  p_original_content text,
  p_source_published_at timestamptz,
  p_evidence jsonb,
  p_draft_title text,
  p_draft_content text,
  p_category text,
  p_status text,
  p_review_result jsonb,
  p_writer_model text,
  p_reviewer_model text,
  p_prompt_version text,
  p_story_key text,
  p_last_error text,
  p_event_details jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  new_queue_id uuid;
begin
  insert into public.editorial_review_queue (
    source_id, source_name, source_url, original_title, original_content,
    source_published_at, evidence, draft_title, draft_content, category, status,
    review_result, writer_model, reviewer_model, prompt_version, story_key, last_error
  ) values (
    p_source_id, p_source_name, p_source_url, p_original_title, coalesce(p_original_content, ''),
    p_source_published_at, coalesce(p_evidence, '[]'::jsonb), p_draft_title, p_draft_content,
    p_category, p_status, p_review_result, p_writer_model, p_reviewer_model,
    p_prompt_version, p_story_key, p_last_error
  ) returning id into new_queue_id;

  insert into public.editorial_review_events (
    queue_id, actor, event_type, from_status, to_status, details
  ) values (
    new_queue_id, 'system:fetch-news', 'candidate_staged', null, p_status,
    coalesce(p_event_details, '{}'::jsonb)
  );

  return new_queue_id;
end;
$$;

revoke all on function public.enqueue_editorial_review_candidate(
  text, text, text, text, text, timestamptz, jsonb, text, text, text, text,
  jsonb, text, text, text, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.enqueue_editorial_review_candidate(
  text, text, text, text, text, timestamptz, jsonb, text, text, text, text,
  jsonb, text, text, text, text, text, jsonb
) to service_role;

comment on table public.editorial_review_queue is 'Private candidate and draft staging; this schema has no public publishing path.';
comment on table public.editorial_review_events is 'Append-only editorial status and review audit trail.';
