# Pending public comparison field — do not apply yet

The new public article and listing components fail closed unless `news_articles.editorial_comparison` contains a complete, paired comparison. The current public table does not yet expose this field, so existing rows remain hidden from this new editorial presentation. This note is documentation only: no migration has been applied and no data has been changed.

A future, separately authorized database change may add a nullable JSONB field with a shape equivalent to:

```sql
alter table public.news_articles
  add column if not exists editorial_comparison jsonb;
```

The private review queue stores the second-pass value at `review_result.editorialComparison`. A future publication implementation must explicitly map that value into `news_articles.editorial_comparison` only after the intended editorial approval and publication gates are active. It must not concatenate the comparison into `ai_content`, infer it from legacy bias fields, or populate it by copying source text. Validate each source observation against cited approved evidence and pair it with the corresponding El Irónico action. Do not backfill historical rows automatically.

Before any application, confirm the live schema, evidence permissions, and RLS behavior, review the exact migration plan, and obtain explicit authorization. This file does not change Supabase, RLS, or publication state.
