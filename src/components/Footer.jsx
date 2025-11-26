import React from "react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border py-6 px-4 text-sm text-muted-foreground">
      <div className="mx-auto max-w-[960px] flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-center md:text-left">
          © 2025 Danylo Samedov. All rights reserved.
        </p>

        <div className="flex items-center">
          <a
            href="#home"
            aria-label="Back to top"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-white/70 dark:bg-neutral-900/70 px-4 py-2 font-semibold text-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 hover:[&>svg]:-translate-y-[3px]"
          >
            <svg
              className="w-5 h-5 transition-transform duration-300 transform-gpu will-change-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <span>Back to top</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
