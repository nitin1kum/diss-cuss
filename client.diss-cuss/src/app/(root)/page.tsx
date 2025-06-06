export const dynamic = "force-dynamic";
import List from "@/components/global/list";
import React, { Suspense } from "react";
import HomeSkelton from "./_components/HomeSkelton";
import { toast } from "react-toastify";
import UpdateLoader from "@/components/global/update-loader";

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
        <UpdateLoader />
        <h2 className="pt-4 text-center text-4xl w-full text-text">
          Diss-Cuss
        </h2>
        <List heading="popular movies" data={movieData.data} />
        <List heading="popular web series / TV" data={tvShowData.data} />
      </Suspense>
    </div>
  );
};

export default Home;
