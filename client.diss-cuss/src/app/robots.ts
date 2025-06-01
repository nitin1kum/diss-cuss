import type { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTBASE_URL || "http://localhost:3000";
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/auth','/api'],
    },
    sitemap: `${baseUrl}/sitemap_index.xml`,
  }
}