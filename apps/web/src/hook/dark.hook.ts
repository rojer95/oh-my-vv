import { useEffect, useState } from "react";
const DARK_KEY = "USER_DARK";

export const useDark = () => {
  const [dark, setDark] = useState(
    localStorage.getItem(DARK_KEY) === null
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : localStorage.getItem(DARK_KEY) === "true"
  );

  useEffect(() => {
    if (dark) {
      document.body.setAttribute("theme-mode", "dark");
    } else {
      document.body.removeAttribute("theme-mode");
    }
  }, [dark]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const matchMode = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setDark(true);
      } else {
        setDark(false);
      }
    };
    mql.addListener(matchMode);
    return () => {
      mql.removeListener(matchMode);
    };
  }, []);

  return {
    dark,
    toggle: () => {
      const newDark = !dark;
      if (
        window.matchMedia("(prefers-color-scheme: dark)").matches === newDark
      ) {
        localStorage.removeItem(DARK_KEY);
      } else {
        localStorage.setItem(DARK_KEY, JSON.stringify(newDark));
      }
      setDark(newDark);
    },
  };
};
