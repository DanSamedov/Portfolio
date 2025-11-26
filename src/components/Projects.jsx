import React from "react";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "./ProjectCard";
import ProjectFilter from "./ProjectFilter";

const Projects = () => {
  const { projects, setFilter } = useProjects();

  return (
    <section id="projects" className="w-full scroll-mt-14 py-12">
      <div className="mx-auto max-w-[960px] px-4">
        <h2 className="section-header">Projects</h2>

        <ProjectFilter setFilter={setFilter} />

        <div id="projects-grid" className="grid grid-cols-1 gap-6 p-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
