import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seoUtils';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/.env', '/.env*', '/node_modules/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
