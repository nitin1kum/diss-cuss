import { NextResponse } from "next/server";
import { options } from "../option";

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(
      `${process.env.TMDB_BASE_URL}/discover/movie?&page=1&primary_release_date.gte=2025-06-01&release_date.gte=2025-06-01&sort_by=popularity.asc`,
      options
    );
    if (!res.ok) throw new Error("Error while geting popular movies");
    const data = await res.json();
    const top10 = data.results.slice(0, 15);
    top10.forEach((e : any) => e.media_type = "movie")
    return NextResponse.json({ data: top10 });
  } catch (error) {
    console.error("Error fetching popular TV shows:", error);
    return NextResponse.json(
      { message: "Failed to fetch popular TV shows" },
      { status: 500 }
    );
  }
}
