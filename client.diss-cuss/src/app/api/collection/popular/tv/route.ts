import { NextResponse } from "next/server";
import { options } from "../../option";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.TMDB_BASE_URL}/tv/popular?language=en-US&page=1`,
      options
    );
    if (!res.ok) throw new Error("Error while geting popular movies");
    const data = await res.json();
    const top10 = data.results.slice(0, 15);
    top10.forEach((e : any) => e.media_type = "tv")
    return NextResponse.json({ data: top10 });
  } catch (error) {
    console.error("Error fetching popular TV shows:", error);
    return NextResponse.json(
      { message: "Failed to fetch popular TV shows" },
      { status: 500 }
    );
  }
}
