import List from "@/components/global/list";
import { prisma } from "@/lib/prisma";
import React, { Suspense } from "react";
import HomeSkelton from "./_components/HomeSkelton";
import Skeleton from "@/components/global/skelton";
import { toast } from "react-toastify";

const data = [
  {
    id: 1,
    name: "Pirates of the Caribbean",
    number: 101,
    date: new Date("2023-11-15T14:30:00"),
  },
  {
    id: 2,
    name: "The Matrix",
    number: 87,
    date: new Date("2024-01-10T09:00:00"),
  },
  {
    id: 3,
    name: "Inception",
    number: 134,
    date: new Date("2023-12-05T18:45:00"),
  },
  {
    id: 4,
    name: "Interstellar",
    number: 76,
    date: new Date("2024-02-20T20:15:00"),
  },
  {
    id: 5,
    name: "The Lord of the Rings",
    number: 150,
    date: new Date("2024-03-01T16:00:00"),
  },
];

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
    return <HomeSkelton/>
  }

  // Parse JSON
  const movieData = await movieRes.json();
  const tvShowData = await tvShowRes.json();

  return (
    <div className="">
      <Suspense fallback={<HomeSkelton/>}>
        <h2 className="pt-4 text-center w-full text-text">Diss-Cuss</h2>
        <List heading="popular movies" data={movieData} />
        <List heading="popular web series / TV" data={tvShowData} />
      </Suspense>
    </div>
  );
};

export default Home;
