"use client";

import { LogIn, LogOut } from "lucide-react";
import React from "react";
import SearchBar from "./SearchBar";
import ThemeToogle from "./ThemeToogle";
import Image from "next/image";
import { usePathname } from "next/navigation";
import DefaultLink from "../default-link";
import { useUser } from "@/contexts/AuthProvider";

const Navbar = () => {
  const { user, loading, logout } = useUser();

  return (
    <div className="flex fixed z-50 top-0 w-full justify-between border-b border-border bg-bg shadow-md px-4 sm:px-8 py-2">
      <DefaultLink
        href={"/"}
        className="flex flex-shrink-0 gap-3 items-center text-subtext"
      >
        <Image
          src={"/logo.png"}
          alt="logo"
          width={25}
          height={25}
          className="size-8"
        />
        <span className="sm:block hidden text-xl font-bold tracking-wider">
          Diss-Cuss
        </span>
      </DefaultLink>
      {!usePathname().startsWith("/auth") && (
        <div className="flex justify-between gap-5 items-center">
          <ThemeToogle />
          <SearchBar />
          {loading ? (
            <button
              onClick={() => logout()}
              className="flex h-9 w-8 sm:w-20 skeleton-shimmer gap-2 items-center text-text p-2 rounded-md bg-accent brightness-90 hover:brightness-100"
            ></button>
          ) : user ? (
            <button
              onClick={() => logout()}
              className="flex gap-2 items-center text-text p-2 rounded-md bg-accent brightness-90 hover:brightness-100"
            >
              <LogOut className="size-5" />{" "}
              <span className="hidden sm:block">Log out</span>
            </button>
          ) : (
            <DefaultLink
              href={"/auth/sign-in"}
              className="flex gap-2 items-center text-text p-2 rounded-md bg-accent brightness-90 hover:brightness-100"
            >
              <LogIn className="size-5" />{" "}
              <span className="hidden sm:block">Log In</span>
            </DefaultLink>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
