import { useState, useEffect, useRef } from "react";

const RoleRotator = ({ phrases }) => {
  const [text, setText] = useState("");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const typewriterRef = useRef(null);

  useEffect(() => {
    if (reduced) {
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % phrases.length;
        setText(phrases[i]);
      }, 2200);
      return () => clearInterval(interval);
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let timeoutId;

    const TYPE = 80;
    const ERASE = 40;
    const HOLD = 1400;
    const GAP = 200;

    const type = () => {
      const word = phrases[phraseIndex];
      if (charIndex <= word.length) {
        setText(word.slice(0, charIndex));
        charIndex += 1;
        timeoutId = setTimeout(type, TYPE);
      } else {
        timeoutId = setTimeout(() => {
          timeoutId = setTimeout(erase, GAP);
        }, HOLD);
      }
    };

    const erase = () => {
      const word = phrases[phraseIndex];
      if (charIndex > 0) {
        charIndex -= 1;
        setText(word.slice(0, charIndex));
        timeoutId = setTimeout(erase, ERASE);
      } else {
        phraseIndex = (phraseIndex + 1) % phrases.length;
        timeoutId = setTimeout(type, GAP);
      }
    };

    type();

    return () => clearTimeout(timeoutId);
  }, [phrases, reduced]);

  return (
    <span className="typewriter">
      <span ref={typewriterRef} className="typewriter__text">
        {text}
      </span>
      <span className="typewriter__cursor" aria-hidden="true">
        |
      </span>
    </span>
  );
};

export default RoleRotator;
