"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeToogle = () => {
  const { theme, setTheme } = useTheme();
  function changeTheme () {
    if(theme === "dark") setTheme("light");
    else setTheme("dark");
  }
  return (
    <div className="p-1 border rounded-sm text-subtext border-border hover:border-border-secondary cursor-pointer" onClick={changeTheme}>
      {theme === "dark" ? <Moon /> : <Sun />}
    </div>
  );
};

export default ThemeToogle;
