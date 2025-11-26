import { createContext, useState, useContext, useCallback } from "react";

const NavigationContext = createContext();

export const useNavigation = () => useContext(NavigationContext);

export const NavigationProvider = ({ children }) => {
  const [activeLink, setActiveLink] = useState("home");

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const smoothScrollTo = useCallback(
    (id) => {
      const element = document.getElementById(id);
      if (element) {
        setActiveLink(id); // Set active link immediately on click
        element.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }
    },
    [reduced]
  );

  const value = {
    activeLink,
    setActiveLink,
    smoothScrollTo,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
