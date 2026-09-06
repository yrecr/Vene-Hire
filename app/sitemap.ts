import type { MetadataRoute } from 'next';

const SITE_URL = 'https://venehire.vercel.app';

// Static list — the only dynamic public routes are individual talent
// profiles, which we deliberately keep out of search results (see
// app/(public)/talent/[slug]/layout.tsx) so they don't belong here either.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/about', '/contact', '/talent', '/request-sign-up', '/privacy'];
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));
}
