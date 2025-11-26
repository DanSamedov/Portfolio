import { useState, useEffect, useMemo } from "react";
import projectsData from "../data/projects.json";

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setProjects(projectsData);
  }, []);

  const filteredProjects = useMemo(() => {
    if (filter === "all") {
      return projects;
    }
    return projects.filter((p) => p.category === filter);
  }, [projects, filter]);

  return {
    projects: filteredProjects,
    setFilter,
  };
};
