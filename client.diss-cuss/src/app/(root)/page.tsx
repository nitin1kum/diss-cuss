import List from "@/components/global/list";
import React, { Suspense } from "react";
import HomeSkelton from "./_components/HomeSkelton";
import UpdateLoader from "@/components/global/update-loader";

const Home = async () => {
  const moviePromise = fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/popular/movies?page=1&limit=10`,
    { next: { revalidate: 60 * 60 * 24 } }
  );
  const tvShowPromise = fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/popular/tv?page=1&limit=10`,
    { next: { revalidate: 60 * 60 * 24 } }
  );
  const upcomingMovies = fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/upcoming/movies?page=1&limit=10`,
    { next: { revalidate: 60 * 60 * 24 } }
  );

  const [movieRes, tvShowRes, upcomingMoviesRes] = await Promise.all([
    moviePromise,
    tvShowPromise,
    upcomingMovies,
  ]);

  // Optionally: check for errors
  if (!movieRes.ok && !tvShowRes.ok && !upcomingMoviesRes.ok) {
    console.log("Oops! Some error occurred");
    return <HomeSkelton />;
  }

  // Parse JSON
  const movieData = await movieRes.json();
  const tvShowData = await tvShowRes.json();
  const upcomingMoviesData = await upcomingMoviesRes.json();

  return (
    <div className="">
      <Suspense fallback={<HomeSkelton />}>
        <UpdateLoader />
        <h2 className="pt-4 text-center text-4xl w-full text-text">
          Diss-Cuss
        </h2>
        {movieData && movieData.results && (
          <List heading="popular movies" data={movieData.results} />
        )}
        {tvShowData && tvShowData.results && (
          <List heading="popular web series / TV" data={tvShowData.results} />
        )}
        {upcomingMoviesData && upcomingMoviesData.results && (
          <List heading="upcoming movies" data={upcomingMoviesData.results} />
        )}
      </Suspense>
    </div>
  );
};

export default Home;
