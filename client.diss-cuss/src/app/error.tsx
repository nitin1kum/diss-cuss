"use client";

import UpdateLoader from "@/components/global/update-loader";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error occurred while rendering page - ", error);
  }, [error]);

  return (
    <div className="text-text flex flex-col items-center justify-center px-6 text-center">
      <UpdateLoader />
      <div className="relative flex items-center  justify-center">
        <h1 className="inset-0 text-[120px] sm:text-[150px] font-bold mb-4 text-sky-400/30">
          Error
        </h1>
        <div className="absolute inset-0 flex flex-col justify-center items-center">
          <p className="text-2xl font-bold mb-2 text-text">
            Something went wrong
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-link text-white rounded hover:opacity-90 transition"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
