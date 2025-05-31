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
    }
  }, [pathname]);

  return (
    <div
      className={`h-[2px] bg-accent fixed z-[999999] top-0 left-0 duration-300 ${
        context && context.showLoader
          ? "opacity-100 w-full transition-all"
          : "opacity-0 w-0 transition-none"
      }`}
      style={{
        width: `${context && context.progress ? context.progress : 0}%`,
      }}
    />
  );
};

export default Loader;
