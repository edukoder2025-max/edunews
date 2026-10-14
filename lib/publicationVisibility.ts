/**
 * Preview-only cutover for the fresh-start demonstration.
 * Existing rows created before this timestamp remain stored, but site queries
 * exclude them. Reconfirm the timestamp before any production rollout.
 */
export const PUBLIC_NEWS_CUTOFF = '2026-10-14T15:49:00.000Z';
