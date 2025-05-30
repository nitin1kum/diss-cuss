import { redirect } from "next/navigation";
import React from "react";
import SearchPage from "./_components/SearchPage";

const Search = async ({ params }: { params: Promise<any> }) => {
  const { query } = await params;
  const [type, name] = query;
  if (!query || !name || name.length === 0) {
    return redirect("/");
  }

  return <SearchPage type={type} name={name} />;
};

export default Search;
