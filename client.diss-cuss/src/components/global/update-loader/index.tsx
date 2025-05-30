"use client";
import { useLoader } from "@/contexts/LoaderStateProvider";
import { useEffect } from "react";

const UpdateLoader = ({ isLoading }: { isLoading?: boolean }) => {
  const context = useLoader();
  let timer: NodeJS.Timeout | undefined = undefined;
  useEffect(() => {
    if (context) {
      context.setProgress(80);
      if (!isLoading) {
        context.setProgress(100);
        setTimeout(() => {
          context.setShowLoader(false);
          context.setProgress(0);
        }, 200);
      }
    }
  }, [isLoading]);
  return null;
};

export default UpdateLoader;
