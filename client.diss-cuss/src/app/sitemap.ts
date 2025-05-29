import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";
import { Languages } from "next/dist/lib/metadata/types/alternative-urls-types";

type Sitemap = Array<{
  url: string
  lastModified?: string | Date
  changeFrequency?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
  priority?: number
  alternates?: {
    languages?: Languages<string>
  },
  images? : string[]
}>

// export async function generateSitemaps() {
//   const discussions = await prisma.discussion.count();
//   const length = (discussions + 44999)/45000;
//   const sitemaps : {id : number}[] = [];
//   Array([{length}]).map((_,id) => {
//     sitemaps.push({id})
//   })
//   return sitemaps;
// }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTBASE_URL || "https://diss-cuss.vercel.appp";
  
    // Fetch all discussion slugs (imdb_ids)
    const discussions = await prisma.discussion.findMany({
      select: { imdb_id: true,type : true,poster: true },
    });
  
    const routes : Sitemap = [] ;

    routes.push({
      url : `${baseUrl}`,
      lastModified : new Date(),
      changeFrequency : 'daily',
      priority : 1
    })

    discussions.forEach((discussion) => {
      routes.push({
        url : `${baseUrl}/discuss/${discussion.type}/${discussion.imdb_id}`,
        lastModified : new Date(),
        changeFrequency : 'daily',
        priority : 0.9,
        images:[`${discussion.poster.length > 0 ? "https://image.tmdb.org/t/p/w1280/" + discussion.poster : baseUrl + "/default_poster.png"}`]
      })
    })

  
    return routes
}