import React, { useEffect } from "react";

const ProjectModal = ({ project, onClose }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  if (!project) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl rounded-xl overflow-hidden text-white shadow-2xl p-6"
        style={{ background: project.background }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 size-10 grid place-items-center rounded-full bg-black/30 text-white hover:bg-black/50 z-50"
          onClick={onClose}
          aria-label="Close"
        >
          <svg
            className="block size-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 6 12 12" />
          </svg>
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold">{project.title}</h2>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          {project.description}
        </p>

        <div className="mt-4 overflow-hidden rounded-lg">
          <img
            src={project.image}
            alt={`${project.title} preview`}
            className="w-full h-auto object-contain"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black text-white font-semibold px-5 py-2.5 text-base rounded-3xl hover:opacity-80 transition"
              >
                Live Preview
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-black text-white font-semibold px-5 py-2.5 text-base rounded-3xl hover:opacity-80 transition"
              >
                GitHub
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            {project.tech.slice(0, 3).map((tech) => (
              <div
                key={tech.name}
                className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center text-[20px] shadow-md"
              >
                {tech.isText ? (
                  <span className="font-bold text-black">{tech.name}</span>
                ) : (
                  <img src={tech.icon} alt={tech.name} className="w-6 h-6" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
