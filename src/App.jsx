import { NavigationProvider } from "./context/NavigationContext.jsx";
import Header from "./components/Header";
import TargetCursor from "./components/TargetCursor";
import Home from "./components/Home";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ScrollProgressBar from "./components/ScrollProgressBar";

function App() {
  return (
    <NavigationProvider>
      <TargetCursor targetSelector="button, a, .nav-link, .project-card, .cursor-target, .skill-tag, .social-icon, .filter-btn, input, textarea" />
      <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground selection:bg-primary/30">
        <Header />
        <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
          <Home />
          <Skills />
          <Projects />
          <Contact />
        </main>
        <Footer />
        <ScrollProgressBar />
      </div>
    </NavigationProvider>
  );
}

export default App;
