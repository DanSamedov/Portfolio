import { useState } from "react";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "./ProjectCard";
import ProjectFilter from "./ProjectFilter";

const Projects = () => {
  const { projects, setFilter } = useProjects();
  const [visibleCount, setVisibleCount] = useState(3);

  const showMoreProjects = () => {
    setVisibleCount(projects.length);
  };

  const showLessProjects = () => {
    setVisibleCount(3);
  };

  return (
    <section id="projects" className="w-full scroll-mt-14 py-12">
      <div className="mx-auto max-w-[960px] px-4">
        <h2 className="section-header">Projects</h2>

        <ProjectFilter setFilter={setFilter} />

        <div
          id="projects-grid"
          className="grid grid-cols-1 gap-6 p-4 transition-all duration-500"
        >
          {projects.slice(0, visibleCount).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-4">
          {visibleCount < projects.length && (
            <button
              onClick={showMoreProjects}
              className="inline-flex items-center gap-2 h-10 rounded-full px-5 font-semibold border border-border bg-white/90 text-[#0d141c] shadow-sm transition-colors duration-300 ease-in-out hover:bg-primary hover:text-white"
            >
              <span>Show More</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </button>
          )}
          {visibleCount > 3 && (
            <button
              onClick={showLessProjects}
              className="inline-flex items-center gap-2 h-10 rounded-full px-5 font-semibold border border-border bg-white/90 text-[#0d141c] shadow-sm transition-colors duration-300 ease-in-out hover:bg-primary hover:text-white"
            >
              <span>Show Less</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m18 15-6-6-6 6"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
