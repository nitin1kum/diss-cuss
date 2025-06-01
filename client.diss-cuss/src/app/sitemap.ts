import { prisma } from "@/lib/prisma";
import { Sitemap } from "@/types/types";
import { MetadataRoute } from "next";

export const revalidate = 60

export async function generateSitemaps() {
  const discussions = await prisma.discussion.count();
  const length = (discussions + 44999) / 45000;
  const sitemaps: { id: number }[] = [];
  Array([{ length }]).map((_, id) => {
    sitemaps.push({ id });
  });
  return sitemaps;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTBASE_URL || "http://localhost:3000";

  // Fetch all discussion slugs (imdb_ids)
  const discussions = await prisma.discussion.findMany({
    select: { imdb_id: true, type: true, poster: true },
  });

  const routes: Sitemap = [];

  ["", "privacy-policy", "terms"].forEach((path) => {
    routes.push({
      url: `${baseUrl}/${path}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    });
  });

  discussions.forEach((discussion) => {
    routes.push({
      url: `${baseUrl}/discuss/${discussion.type}/${discussion.imdb_id}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      images: [
        `${
          discussion.poster.length > 0
            ? "https://image.tmdb.org/t/p/w1280/" + discussion.poster
            : baseUrl + "/default_poster.png"
        }`,
      ],
    });
  });

  return routes;
}
