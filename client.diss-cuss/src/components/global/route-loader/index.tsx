"use client"; //makes the component client so we can use hooks

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLoader } from "@/contexts/LoaderStateProvider";

const Loader = () => {
  const pathname = usePathname();
  const context = useLoader();

  useEffect(() => {
    if (context) {
      context.setProgress(60);
      context.setShowLoader(true);
    }
  }, [pathname]);

  return (
    <div
      className={`h-[1px] bg-accent fixed z-[999999] top-0 left-0 transition-all duration-300 ${
        context && context.showLoader ? "opacity-100 w-full" : "opacity-0 w-0"
      }`}
      style={{
        width: `${context && context.progress ? context.progress : 0}%`,
        transition:
          context && context.showLoader ? "none" : "width 0.3s ease-in-out",
      }}
    />
  );
};

export default Loader;
