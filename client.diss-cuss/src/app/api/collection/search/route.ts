import { NextRequest, NextResponse } from "next/server";
import { options } from "../option";

export async function GET(
  req: NextRequest
) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const type = searchParams.get('t'); // movie or tv

    if (!query || query.length < 1) {
      return NextResponse.json({ data: [] });
    }

    const res = await fetch(
      `${process.env.TMDB_BASE_URL}/search/${type}?query=${query}&language=en-US&page=1`
    ,options);
    
    const data = await res.json();
    const {results} = data;

    return NextResponse.json({ data: results });
  } catch (error) {
    console.log("error while fetching movies : " ,error)
    return NextResponse.json({ data: [] });
  }
}
