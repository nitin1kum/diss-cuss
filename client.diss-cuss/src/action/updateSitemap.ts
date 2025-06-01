import fs from "fs";
import path from "path";
import lockfile from "proper-lockfile";

export async function updateSitemap(url: string, image?: string) {
  const filePath = path.resolve("public/sitemap2.xml");

  try {
    if (!fs.existsSync(filePath)) return;

    // Acquire file lock
    await lockfile.lock(filePath);

    const rawXml = fs.readFileSync(filePath, "utf-8");

    if (rawXml.includes(`<loc>${url}</loc>`)) {
      console.log("URL already exists. Skipping.");
      return;
    }

    const urlCount = rawXml.split("<url>").length - 1;
    if (urlCount >= 50000) {
      console.log("Sitemap limit reached. Skipping.");
      return;
    }

    const updated = rawXml.replace(
      "</urlset>",
      `<url>
  <loc>${url}</loc>
  <image:image>
    <image:loc>${
      image
        ? `https://image.tmdb.org/t/p/w1280/${image}`
        : `${process.env.NEXTBASE_URL}/default_poster.png`
    }</image:loc>
  </image:image>
  <lastmod>${new Date().toISOString()}</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.9</priority>
</url>
</urlset>`
    );

    fs.writeFileSync(filePath, updated, "utf-8");
    console.log("Sitemap updated.");
  } catch (err) {
    console.error("Sitemap update error:", err);
  } finally {
    // Always release lock
    if (lockfile.checkSync(filePath)) {
      await lockfile.unlock(filePath);
    }
  }
}
