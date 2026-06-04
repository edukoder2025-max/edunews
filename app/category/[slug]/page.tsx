import { normalizeCategorySlug } from '@/lib/articleUtils';
import { redirect } from 'next/navigation';

export default function CategoryLegacyRedirect({ params }: { params: { slug: string } }) {
  const normalized = normalizeCategorySlug(decodeURIComponent(params.slug));
  redirect(`/categoria/${normalized}`);
}
