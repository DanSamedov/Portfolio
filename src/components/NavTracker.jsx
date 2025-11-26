import React, { useState, useEffect, useRef } from "react";

const NavTracker = () => {
  const [activeLink, setActiveLink] = useState("home");
  const navRef = useRef(null);
  const trackerRef = useRef(null);
  const intentId = useRef(null);
  const intentDeadline = useRef(0);

  const links = [
    {
      id: "home",
      text: "Home",
      icon: (
        <svg
          className="md:hidden h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 10.5L12 4l9 6.5V20a2 2 0 0 1-2 2h-4.5a1.5 1.5 0 0 1-1.5-1.5V16a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4.5A1.5 1.5 0 0 1 7.5 22H3a2 2 0 0 1-2-2v-9.5Z" />
        </svg>
      ),
    },
    {
      id: "skills",
      text: "Skills",
      icon: (
        <svg
          className="md:hidden h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      id: "projects",
      text: "Projects",
      icon: (
        <svg
          className="md:hidden h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      id: "contact",
      text: "Contact",
      icon: (
        <svg
          className="md:hidden h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
          <path d="M3 7l9 6 9-6"></path>
        </svg>
      ),
    },
  ];

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const moveTo = (link) => {
    const trackerElement = trackerRef.current;
    if (!link || !trackerElement) return;

    const { offsetLeft, offsetWidth } = link;
    const trackerWidth = trackerElement.offsetWidth || 26;
    const bias = 0; // Adjust as needed
    const x = offsetLeft + offsetWidth / 2 - trackerWidth / 2 + bias;
    trackerElement.style.transform = `translateX(${x}px)`;
    trackerElement.style.opacity = "1";
  };

  useEffect(() => {
    const navElement = navRef.current;
    if (!navElement) return;

    const activeNav = navElement.querySelector(`[href="#${activeLink}"]`);
    if (activeNav) {
      moveTo(activeNav);
    }
  }, [activeLink]);

  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.id))
      .filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (intentId.current && performance.now() < intentDeadline.current)
          return;

        let bestEntry = null;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (
              !bestEntry ||
              entry.intersectionRatio > bestEntry.intersectionRatio
            ) {
              bestEntry = entry;
            }
          }
        });

        if (bestEntry) {
          setActiveLink(bestEntry.target.id);
        }
      },
      {
        threshold: [0.25, 0.5, 0.75],
        rootMargin: "-35% 0px -55% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, [links]);

  const handleLinkClick = (id) => {
    intentId.current = id;
    intentDeadline.current = performance.now() + (reduced ? 200 : 1600);
    setActiveLink(id);
  };

  return (
    <div
      ref={navRef}
      className="nav-glass flex items-center gap-2 sm:gap-3 px-2 py-1 rounded-full"
    >
      {links.map(({ id, text, icon }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={activeLink === id ? "page" : undefined}
          className={`nav-link ${
            activeLink === id ? "bg-muted text-primary shadow-lg" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            document
              .getElementById(id)
              ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
            handleLinkClick(id);
          }}
        >
          {icon}
          <span className="hidden md:inline">{text}</span>
        </a>
      ))}
      <span
        ref={trackerRef}
        className="nav-tracker"
        style={{ transition: reduced ? "none" : "" }}
      ></span>
    </div>
  );
};

export default NavTracker;
