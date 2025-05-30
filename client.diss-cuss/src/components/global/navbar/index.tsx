"use client"

import { LogIn, LogOut } from "lucide-react";
import React from "react";
import SearchBar from "./SearchBar";
import ThemeToogle from "./ThemeToogle";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import RouteLoader from "../route-loader";

const Navbar = () => {
  const { data } = useSession();

  return (
    <div className="flex fixed z-50 top-0 w-full justify-between border-b border-border bg-bg shadow-md px-4 sm:px-8 py-2">
      <Link
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
      </Link>
      {!usePathname().startsWith("/auth") && <div className="flex justify-between gap-5 items-center">
        <ThemeToogle />
          <SearchBar />
        {data ? (
          <button
            onClick={() => signOut()}
            className="flex gap-2 items-center text-text p-2 rounded-md bg-accent brightness-90 hover:brightness-100"
          >
            <LogOut className="size-5" />{" "}
            <span className="hidden sm:block">Log out</span>
          </button>
        ) : (
          <Link
            href={"/auth/sign-in"}
            className="flex gap-2 items-center text-text p-2 rounded-md bg-accent brightness-90 hover:brightness-100"
          >
            <LogIn className="size-5" />{" "}
            <span className="hidden sm:block">Log In</span>
          </Link>
        )}
      </div>}
    </div>
  );
};

export default Navbar;
