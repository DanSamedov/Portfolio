import { useState, useEffect } from "react";

const ScrollProgressBar = () => {
  const [width, setWidth] = useState(0);

  const handleScroll = () => {
    const totalScroll = document.documentElement.scrollTop;
    const windowHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scroll = `${(totalScroll / windowHeight) * 100}`;
    setWidth(scroll);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      id="scroll-progress"
      className="fixed left-0 top-0 h-1 sm:h-[6px] w-0 bg-accent pointer-events-none z-[999]"
      style={{ width: `${width}%` }}
    ></div>
  );
};

export default ScrollProgressBar;
