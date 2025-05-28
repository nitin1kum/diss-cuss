import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXTBASE_URL || "https://your-domain.com";

  // Fetch all discussion slugs (imdb_ids)
  const discussions = await prisma.discussion.findMany({
    select: { imdb_id: true,type : true },
  });

  const routes = discussions.map((discussion) => {
    return `
      <url>
        <loc>${baseUrl}/discuss/${discussion.type}/${discussion.imdb_id}</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
    `;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset 
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
                          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      ${routes.join("")}
    </urlset>
  `;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
