import { useState } from "react";

const TechPill = ({ tech }) => {
  const pillClasses =
    "w-12 h-12 rounded-full bg-muted flex items-center justify-center text-[24px] shadow-md -ml-4 group-hover:ml-0 transition-all duration-500";

  if (tech.isText) {
    let textClass = "font-bold";
    if (tech.name === "@") textClass += " text-sky-600";
    if (tech.name === "API") textClass += " text-green-600";
    if (tech.name === "DX") textClass += " text-foreground";
    if (tech.name === "Py") textClass += " text-rose-600";
    if (tech.name === "DB") textClass += " text-violet-600";
    if (tech.name === "ML") textClass += " text-emerald-600";

    return (
      <div className={pillClasses}>
        <span className={textClass}>{tech.name}</span>
      </div>
    );
  }

  return (
    <div className={pillClasses}>
      <img
        src={tech.icon}
        alt={tech.name}
        className="w-7 h-7"
        loading="lazy"
        width="28"
        height="28"
      />
    </div>
  );
};

const ProjectCard = ({ project }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="project-card-container"
      style={{ perspective: "1000px", minHeight: "360px" }}
    >
      <div
        className={`project-card-inner ${isFlipped ? "is-flipped" : ""}`}
        style={{
          transition: "transform 0.6s",
          transformStyle: "preserve-3d",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          className="project-card-front group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 w-full h-full absolute"
          style={{
            boxShadow:
              "rgba(200, 200, 200, 0.2) 2px 2px 6px, rgba(160, 160, 160, 0.15) 0px 6px 10px",
            background: project.background,
            backfaceVisibility: "hidden",
          }}
          onClick={handleFlip}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleFlip();
            }
          }}
          tabIndex="0"
          role="button"
        >
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-6 pt-4">
            <div className="text-white w-full md:w-2/3">
              <h3 className="text-xl md:text-2xl font-bold">{project.title}</h3>
              <p className="mt-2 text-sm md:text-base text-white/80">
                {project.description}
              </p>
            </div>

            <div className="tech-pills flex justify-center md:justify-end transition-all duration-700 ease-[cubic-bezier(.22,.61,.36,1)]">
              {project.tech.map((tech, i) => (
                <TechPill key={i} tech={tech} />
              ))}
            </div>
          </div>

          <div className="relative w-full flex justify-center items-end z-10 max-h-[180px] sm:max-h-[300px] md:max-h-none">
            <img
              alt={`${project.title} preview`}
              className="card-preview duration-500 object-contain rounded-t-2xl w-[80%]"
              src={project.image}
            />
          </div>
        </div>

        <div
          className="project-card-back absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden text-white shadow-2xl p-6 cursor-pointer"
          style={{
            background: project.background,
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
          onClick={handleFlip}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleFlip();
            }
          }}
          tabIndex="0"
          role="button"
        >
          <h2 className="text-2xl sm:text-3xl font-bold">{project.title}</h2>
          <p className="mt-2 text-sm sm:text-base text-white/80">
            {project.full_description || project.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-5 py-2.5 text-base rounded-3xl hover:opacity-80 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  Live Preview
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-5 py-2.5 text-base rounded-3xl hover:opacity-80 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  GitHub
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              {project.tech.map((tech) => (
                <div
                  key={tech.name}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-[20px] shadow-md"
                >
                  {tech.isText ? (
                    <span className="font-bold text-foreground">{tech.name}</span>
                  ) : (
                    <img src={tech.icon} alt={tech.name} className="w-6 h-6" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
