import List from "@/components/global/list";
import React, { Suspense } from "react";
import HomeSkelton from "./_components/HomeSkelton";
import { toast } from "react-toastify";
import Head from "next/head";


const Home = async () => {
  const moviePromise = fetch(
    `${process.env.NEXTBASE_URL}/api/collection/popular/movies`
  );
  const tvShowPromise = fetch(
    `${process.env.NEXTBASE_URL}/api/collection/popular/tv`
  );

  const [movieRes, tvShowRes] = await Promise.all([
    moviePromise,
    tvShowPromise,
  ]);

  // Optionally: check for errors
  if (!movieRes.ok || !tvShowRes.ok) {
    toast.error("Oops! Some error occurred");
    return <HomeSkelton />;
  }

  // Parse JSON
  const movieData = await movieRes.json();
  const tvShowData = await tvShowRes.json();

  return (
    <div className="">
      <Suspense fallback={<HomeSkelton />}>
        <h2 className="pt-4 text-center w-full text-text">Diss-Cuss</h2>
        <List heading="popular movies" data={movieData} />
        <List heading="popular web series / TV" data={tvShowData} />
      </Suspense>
    </div>
  );
};

export default Home;
