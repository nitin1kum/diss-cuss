import { NextRequest, NextResponse } from "next/server";
import { options } from "../option";

export async function GET(
  req: NextRequest
) {
  try {
    const { searchParams } = new URL(req.url);
    const query = decodeURIComponent(searchParams.get('q') || "");
    const type = searchParams.get('t'); // movie or tv
    const page = searchParams.get('page') || 1; // movie or tv

    if (!query || query.length < 1) {
      return NextResponse.json({ data: [] });
    }

    const res = await fetch(
      `${process.env.TMDB_BASE_URL}/search/${type}?query=${query}&language=en-US&page=${page}&sort_by=popularity.desc`
    ,options);
    
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.log("error while fetching movies : " ,error)
    return NextResponse.json({ data: [] });
  }
}
