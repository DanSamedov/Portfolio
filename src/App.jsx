import { NavigationProvider } from "./context/NavigationContext.jsx";
import Header from "./components/Header";
import Home from "./components/Home";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ScrollProgressBar from "./components/ScrollProgressBar";

function App() {
  return (
    <NavigationProvider>
      <div className="relative min-h-screen w-full overflow-x-hidden">
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
