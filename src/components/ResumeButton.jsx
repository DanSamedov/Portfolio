const ResumeButton = () => {
  return (
    <a
      href="./src/assets/static/cv.pdf"
      download="cv.pdf"
      aria-label="Download resume"
      className="group relative inline-flex justify-center items-center w-32 h-10 cursor-pointer overflow-hidden rounded-full border border-border bg-white/90 shadow-sm p-2 text-center font-semibold no-underline"
    >
      <span className="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        Resume
      </span>

      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span>Resume</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 15V3"></path>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <path d="m7 10 5 5 5-5"></path>
        </svg>
      </div>

      <div className="absolute left-[15%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-primary transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-primary"></div>
    </a>
  );
};

export default ResumeButton;
