import { useState } from "react";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "./ProjectCard";
import ProjectFilter from "./ProjectFilter";
import ProjectModal from "./ProjectModal";

const Projects = () => {
  const { projects, setFilter } = useProjects();
  const [selectedProject, setSelectedProject] = useState(null);
  const [visibleCount, setVisibleCount] = useState(3);

  const showMoreProjects = () => {
    setVisibleCount(5);
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
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`transition-all duration-500 ease-in-out ${
                index < visibleCount
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4 h-0 overflow-hidden"
              }`}
            >
              <ProjectCard
                project={project}
                onCardClick={() => setSelectedProject(project)}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-4">
          {visibleCount < 5 && projects.length > 3 && (
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
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
};

export default Projects;
