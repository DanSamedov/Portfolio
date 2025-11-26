import { useState } from "react";

const ProjectFilter = ({ setFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("All");

  const filters = ["All", "Websites", "Bots", "Programs", "Other"];

  const handleFilterClick = (filter) => {
    setSelected(filter);
    setFilter(filter.toLowerCase());
    setIsOpen(false);
  };

  return (
    <div className="flex gap-3 p-3 flex-wrap pr-4">
      <div className="relative inline-block">
        <details
          id="project-filter"
          className="group"
          open={isOpen}
          onToggle={(e) => setIsOpen(e.currentTarget.open)}
        >
          <summary
            className="flex items-center gap-2 rounded-xl px-3 py-2 border border-border bg-muted text-foreground cursor-pointer list-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 [&::-webkit-details-marker]:hidden"
            role="button"
            aria-haspopup="listbox"
          >
            <span data-label className="text-sm font-medium">
              {selected}
            </span>
            <svg
              className="size-5 transition-transform group-open:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
            </svg>
          </summary>
          <div
            className="absolute z-50 mt-2 w-48 rounded-xl border border-border bg-background shadow-lg p-1"
            role="listbox"
            aria-label="Filter projects"
          >
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                role="option"
                aria-selected={selected === filter}
                className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-muted"
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

export default ProjectFilter;
