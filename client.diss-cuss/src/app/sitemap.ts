import { Sitemap } from "@/types/types";
import { fetcher } from "@/utils/fetcher";
import { MetadataRoute } from "next";

export const revalidate = 60;

export async function generateSitemaps() {
  const discussions = await fetcher("/api/sitemap/count");
  const { discussions_count } = discussions as { discussions_count: number };
  const length = Math.ceil(discussions_count / 45000);
  const sitemaps: { id: number }[] = [];
  Array([{ length }]).map((_, id) => {
    sitemaps.push({ id });
  });
  return sitemaps;
}

export default async function sitemap({id} : {id : number}): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTBASE_URL || "http://localhost:3000";
  // Fetch all discussion slugs (imdb_ids)
  const discussions = await fetcher(`/api/sitemap/urls?page=${id + 1}&limit=${45000}`);
  console.log(discussions)
  const { discussion_urls } = discussions as {
    discussion_urls: { url: string; poster: string }[];
  };
  const routes: Sitemap = [];

  ["", "privacy-policy", "terms"].forEach((path) => {
    routes.push({
      url: `${baseUrl}/${path}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    });
  });

  discussion_urls.forEach((url) => {
    routes.push({
      url: url.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      images: [`${url.poster}`],
    });
  });

  return routes;
}
