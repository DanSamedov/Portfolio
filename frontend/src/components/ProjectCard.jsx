import { useState } from "react";
import StickerPeel from "./StickerPeel";

const TechPill = ({ tech }) => {
  const pillClasses =
    "w-12 h-12 rounded-full bg-white flex items-center justify-center text-[24px] shadow-md -ml-4 group-hover:ml-0 transition-all duration-500";

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

  return (
    <div
      className="project-card-container"
      style={{ 
        perspective: "1200px", 
      }}
    >
      <div
        className="project-card-inner relative w-full"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          height: "100%",
        }}
      >
        {/* FRONT OF CARD */}
        <div
          className="project-card-front group cursor-pointer rounded-xl overflow-hidden w-full h-full"
          style={{
            boxShadow: "0 0 15px rgba(232, 57, 13, 0.3), 0 0 30px rgba(232, 57, 13, 0.12)",
            background: project.background,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: isFlipped ? "none" : "auto",
          }}
          onClick={() => setIsFlipped(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsFlipped(true);
            }
          }}
          tabIndex={isFlipped ? -1 : 0}
          role="button"
        >
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 px-6 pt-4">
            <div className="w-full md:w-2/3">
              <h3 className="text-xl md:text-2xl font-bold text-white">{project.title}</h3>
              <p className="mt-2 text-sm md:text-base text-white/80">
                {project.description}
              </p>
              
              {/* Mobile Action Buttons (Front) */}
              {(project.liveUrl || project.repoUrl) && (
                <div className="md:hidden mt-4 flex flex-wrap items-center gap-3">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="project-link inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-4 py-2 text-sm rounded-xl hover:opacity-80 transition cursor-pointer z-20"
                    >
                      Live Preview
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="project-link inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-4 py-2 text-sm rounded-xl hover:opacity-80 transition cursor-pointer z-20"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              )}
              
              {/* Mobile Technologies Text */}
              <p className="md:hidden mt-4 text-sm font-semibold text-white">
                Technologies used <span className="text-xs font-normal text-white/60">(try to drag them)</span>
              </p>
            </div>

            <div className="tech-pills hidden md:flex justify-center md:justify-end transition-all duration-700 ease-[cubic-bezier(.22,.61,.36,1)]">
              {project.tech.map((tech, i) => (
                <TechPill key={i} tech={tech} />
              ))}
            </div>
          </div>

          {/* Mobile Stickers (Front) */}
          <div className="md:hidden absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 40 }}>
            {project.tech.filter(tech => !tech.isText && tech.icon).map((tech, index) => {
              const col = index % 3;
              const row = Math.floor(index / 3);
              return (
                <StickerPeel
                  key={tech.name}
                  imageSrc={tech.icon}
                  label={tech.name}
                  width={60}
                  rotate={0}
                  peelDirection={0}
                  shadowIntensity={0.4}
                  lightingIntensity={0.08}
                  peelBackHoverPct={25}
                  peelBackActivePct={35}
                  initialPosition={{ x: 10 + col * 110, y: 210 + row * 90 }}
                  className="pointer-events-auto"
                />
              );
            })}
          </div>

          <div className="hidden md:flex relative w-full justify-center items-end z-10 max-h-[180px] sm:max-h-[300px] md:max-h-none mt-6">
            <img
              alt={`${project.title} preview`}
              className="card-preview duration-500 object-contain rounded-xl w-[80%]"
              src={project.image}
            />
          </div>
        </div>

        {/* BACK OF CARD */}
        <div
          className="project-card-back rounded-xl overflow-hidden text-white w-full h-full flex flex-col"
          style={{
            boxShadow: "0 0 15px rgba(232, 57, 13, 0.3), 0 0 30px rgba(232, 57, 13, 0.12)",
            background: project.background,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: isFlipped ? "auto" : "none",
          }}
        >
          {/* Flip back button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors cursor-pointer z-50"
            aria-label="Flip card back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Top Section - Name & Description */}
          <div className="p-6 pb-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{project.title}</h2>
            <p className="mt-2 text-base text-white/80">
              {project.full_description || project.description}
            </p>

            {/* Action Buttons (Back - Desktop Only) */}
            {(project.liveUrl || project.repoUrl) && (
              <div className="mt-4 hidden md:block">
                <div className="flex flex-wrap items-center gap-3">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-5 py-2.5 text-base rounded-xl hover:opacity-80 transition cursor-pointer z-20"
                    >
                      Live Preview
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link inline-flex items-center gap-2 bg-white text-gray-900 font-semibold px-5 py-2.5 text-base rounded-xl hover:opacity-80 transition cursor-pointer z-20"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Section - Stickers Area (Desktop Only) */}
          <div className="hidden md:block px-6 mt-4 relative z-10">
            <p className="text-base tracking-wide mb-2">
              <span className="font-semibold text-white">Technologies used</span>{" "}
              <span className="text-white/60">(try to drag them)</span>
            </p>
          </div>
          
          {/* Sticker container that covers entire card for dragging (Desktop Only) */}
          <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
            <div className="relative w-full h-full pointer-events-auto">
              {project.tech.filter(tech => !tech.isText && tech.icon).map((tech, index) => (
                <StickerPeel
                  key={tech.name}
                  imageSrc={tech.icon}
                  label={tech.name}
                  width={80}
                  rotate={0}
                  peelDirection={0}
                  shadowIntensity={0.4}
                  lightingIntensity={0.08}
                  peelBackHoverPct={25}
                  peelBackActivePct={35}
                  initialPosition={{ x: 24 + index * 110, y: 300 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
