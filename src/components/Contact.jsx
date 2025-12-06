import { useState, useCallback } from "react";
import ResumeButton from "./ResumeButton";

const Contact = () => {
  const [copyButtonText, setCopyButtonText] = useState("Copy");

  const handleCopyEmail = useCallback(() => {
    const email = "samedovdanylo@gmail.com";
    navigator.clipboard.writeText(email).then(
      () => {
        setCopyButtonText("Copied!");
        setTimeout(() => setCopyButtonText("Copy"), 2000);
      },
      (err) => {
        console.error("Failed to copy email: ", err);
        setCopyButtonText("Failed!");
        setTimeout(() => setCopyButtonText("Copy"), 2000);
      }
    );
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission
  };

  return (
    <section id="contact" className="w-full scroll-mt-14 py-12">
      <div className="mx-auto max-w-[960px] px-4">
        <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-start">
          <div className="md:col-span-2 text-center md:text-left space-y-4">
            <h2 className="flex items-center justify-center md:justify-start gap-3 text-4xl sm:text-5xl font-extrabold text-foreground">
              Contact Me
              <svg
                className="w-7 h-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </h2>
            <p className="text-muted-foreground">
              Let’s work together or just say hi
            </p>

            <div className="group inline-flex h-10 items-center rounded-full text-foreground border border-border bg-white/90 shadow-sm transition-colors duration-300 ease-in-out hover:bg-primary hover:text-white hover:border-primary">
              <span className="pl-4 pr-2 py-2 select-none font-semibold">
                samedovdanylo@gmail.com
              </span>

              <button
                type="button"
                className="ml-1.5 mr-1.5 h-8 rounded-full px-3 text-sm font-semibold border border-border bg-primary text-white transition-colors duration-300 ease-in-out group-hover:bg-white/90 group-hover:text-foreground group-hover:border-white/70 group-focus-within:bg-white/90 group-focus-within:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onClick={handleCopyEmail}
                aria-label="Copy email to clipboard"
              >
                {copyButtonText}
              </button>
            </div>

            <ResumeButton />

            <p className="text-muted-foreground">Follow Me</p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://github.com/DanSamedov"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-xl transition-all duration-300 transform hover:-translate-y-1.5 bg-white/70 backdrop-blur-sm text-slate-900/90 shadow-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/in/danylo-samedov-b557132b1/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-xl transition-all duration-300 transform hover:-translate-y-1.5 bg-white/70 backdrop-blur-sm text-slate-900/90 shadow-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          <form
            className="md:col-span-3 rounded-2xl border border-border bg-white/80 backdrop-blur p-6 shadow-sm space-y-4"
            onSubmit={handleSubmit}
          >
            <label className="block">
              <span className="sr-only">Your Name</span>
              <input
                name="name"
                type="text"
                placeholder="Your Name"
                required
                className="w-full h-12 rounded-xl bg-white border border-border px-4 text-foreground placeholder:text-[#7a8ea4] shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition"
              />
            </label>

            <label className="block">
              <span className="sr-only">Your Email</span>
              <input
                name="email"
                type="email"
                placeholder="Your Email"
                required
                className="w-full h-12 rounded-xl bg-white border border-border px-4 text-foreground placeholder:text-[#7a8ea4] shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition"
              />
            </label>

            <label className="block">
              <span className="sr-only">Your Message</span>
              <textarea
                name="message"
                placeholder="Your Message"
                required
                className="w-full min-h-36 rounded-xl bg-white border border-border p-4 text-foreground placeholder:text-[#7a8ea4] shadow-sm resize-y focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition"
              ></textarea>
            </label>

            <div className="flex justify-center pt-1">
              <button
                type="submit"
                className="group relative inline-flex items-center gap-2 rounded-full h-12 px-6 bg-foreground text-white text-sm sm:text-base font-semibold overflow-hidden hover:bg-[#0b1620] active:translate-y-[1px] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-foreground/20"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></span>

                <span className="relative z-10 transition-all duration-300 group-hover:translate-x-1">
                  Send Message
                </span>

                <svg
                  className="relative z-10 w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110 group-hover:rotate-12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 2L11 13"></path>
                  <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                </svg>

                <span className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 group-hover:opacity-0 transition-all duration-500 ease-out opacity-100"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
