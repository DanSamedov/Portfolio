import RoleRotator from "./RoleRotator";
import Avatar from "./Avatar";
import { useNavigation } from "../context/NavigationContext";
import ResumeButton from "./ResumeButton";

const Home = () => {
  const phrases = ["Backend Developer", "CS & Econometrics Student"];
  const { smoothScrollTo } = useNavigation();

  const handleScrollClick = (e, targetId) => {
    e.preventDefault();
    smoothScrollTo(targetId);
  };

  return (
    <section id="home" className="relative w-full min-h-dvh scroll-mt-14 pt-16">
      <div className="mx-auto max-w-[960px] px-4 @container">
        <div className="@[480px]:p-4 min-h-[calc(100dvh-4rem)] flex items-center translate-y-[-6vh] sm:translate-y-[-7vh] md:translate-y-[-8vh]">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 w-full py-2 -mt-8 sm:-mt-10 md:-mt-14">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl sm:text-6xl font-bold text-foreground">
                  Hey, I'm <span className="text-accent">Danylo</span>
                </h1>
                <span
                  className="text-4xl sm:text-5xl wave-hand"
                  aria-hidden="true"
                >
                  👋
                </span>
              </div>

              <p className="flex items-center mt-4 text-accent gap-2 text-sm sm:text-lg">
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
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-accent">Based in Poland</span>
              </p>

              <div className="mt-4 text-lg sm:text-3xl font-medium block text-left text-foreground/90">
                <RoleRotator phrases={phrases} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3 relative z-30">
                <ResumeButton />
                <a
                  href="#contact"
                  onClick={(e) => handleScrollClick(e, "contact")}
                  aria-label="Go to contact section"
                  className="group relative inline-flex justify-center items-center h-10 overflow-hidden rounded-xl border border-border bg-muted shadow-sm px-4 text-center font-semibold text-foreground"
                >
                  <span className="inline-flex items-center gap-2 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6"
                      aria-hidden="true"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                    <span>Contact Me</span>
                  </span>
                  <div className="absolute inset-0 z-10 flex h-full w-full items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:bg-primary group-hover:opacity-100">
                    <span>Contact Me</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-6 h-6"
                      aria-hidden="true"
                    >
                      <path d="M21 8V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"></path>
                      <path d="m3 8 9 6 9-6"></path>
                      <path d="M21 8 12 2 3 8"></path>
                    </svg>
                  </div>
                </a>
              </div>
            </div>
            <Avatar />
          </div>
        </div>
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2">
          <button
            id="scroll-cue"
            type="button"
            aria-label="Scroll to next section"
            onClick={(e) => handleScrollClick(e, "skills")}
            className="group animate-scroll-cue flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-md"
          >
            <span className="text-xs sm:text-sm mb-1 sm:mb-2 font-medium">
              Scroll down
            </span>
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
              className="lucide lucide-chevron-down sm:w-6 sm:h-6"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Home;
