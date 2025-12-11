import { useState, useCallback } from "react";
import ResumeButton from "./ResumeButton";

const Contact = () => {
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("submitting");

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${apiUrl}/contact/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <section id="contact" className="w-full scroll-mt-14 py-12">
      <div className="mx-auto max-w-[960px] px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-20 items-start">
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

            <div className="group inline-flex h-10 items-center rounded-xl text-foreground border border-border bg-muted shadow-sm transition-colors duration-300 ease-in-out hover:bg-primary hover:text-white hover:border-primary">
              <span className="pl-4 pr-2 py-2 select-none font-semibold">
                samedovdanylo@gmail.com
              </span>

              <button
                type="button"
                className="ml-1.5 mr-1.5 h-8 rounded-xl px-3 text-sm font-semibold border border-border bg-primary text-white transition-colors duration-300 ease-in-out group-hover:bg-muted group-hover:text-foreground group-hover:border-border group-focus-within:bg-muted group-focus-within:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onClick={handleCopyEmail}
                aria-label="Copy email to clipboard"
              >
                {copyButtonText}
              </button>
            </div>

            <ResumeButton />

            <p className="text-muted-foreground">Follow Me</p>
            <div className="mt-6 flex gap-4 justify-center md:justify-start">
              <a
                href="https://github.com/DanSamedov"
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-xl transition-all duration-300 transform hover:-translate-y-1.5 bg-muted backdrop-blur-sm text-foreground shadow-xl border border-border/50"
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
                className="p-5 rounded-xl transition-all duration-300 transform hover:-translate-y-1.5 bg-muted backdrop-blur-sm text-foreground shadow-xl border border-border/50"
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
            className="md:col-span-3 rounded-2xl border border-border bg-muted/80 backdrop-blur p-6 shadow-sm space-y-4"
            onSubmit={handleSubmit}
          >
            <label className="block">
              <span className="sr-only">Name</span>
              <input
                name="name"
                type="text"
                placeholder="Name"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={status === "submitting"}
                maxLength={200}
                className="w-full h-12 rounded-xl bg-background border border-border px-4 text-base text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition disabled:opacity-50"
              />
            </label>

            <label className="block">
              <span className="sr-only">Email</span>
              <input
                name="email"
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={status === "submitting"}
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                title="Please enter a valid email address (e.g., user@example.com)"
                className="w-full h-12 rounded-xl bg-background border border-border px-4 text-base text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition disabled:opacity-50"
              />
            </label>

            <label className="block">
              <span className="sr-only">Message</span>
              <textarea
                name="message"
                placeholder="Message"
                required
                value={formData.message}
                onChange={handleChange}
                disabled={status === "submitting"}
                className="w-full min-h-36 rounded-xl bg-background border border-border p-4 text-base text-foreground placeholder:text-muted-foreground shadow-sm resize-y focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition disabled:opacity-50"
              ></textarea>
            </label>

            <div className="flex flex-col items-center pt-1 gap-2">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="group relative inline-flex items-center gap-2 rounded-xl h-12 px-6 bg-primary text-primary-foreground text-sm sm:text-base font-semibold overflow-hidden hover:bg-primary/90 active:translate-y-[1px] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></span>

                <span className="relative z-10 transition-all duration-300 group-hover:translate-x-1">
                  {status === "submitting" ? "Sending..." : "Send Message"}
                </span>

                {status !== "submitting" && (
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
                )}

                <span className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 group-hover:opacity-0 transition-all duration-500 ease-out opacity-100"></span>
              </button>

              {status === "success" && (
                <p className="text-green-600 font-medium text-sm animate-fade-in-up">
                  Message sent successfully!
                </p>
              )}
              {status === "error" && (
                <p className="text-red-600 font-medium text-sm animate-fade-in-up">
                  Failed to send message. Please try again.
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
