import { generateSitemaps } from "@/app/sitemap";
import { NextResponse } from "next/server";
export const revalidate = 60

export async function GET() {
  try {
    const dynamicSitemaps = await generateSitemaps();
    const baseUrl = process.env.NEXTBASE_URL || "http://localhost:3000";
    const sitemaps: string[] = dynamicSitemaps.map(
      ({ id }) => `${baseUrl}/sitemap/${id}.xml`
    );

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps
    .map(
      (url) => `
    <sitemap>
      <loc>${url}</loc>
    </sitemap>
  `
    )
    .join("\n")}
</sitemapindex>`;

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Length": Buffer.byteLength(sitemap).toString(),
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
