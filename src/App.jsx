import React from "react";
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
      <Header />
      <ScrollProgressBar />
      <main>
        <Home />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </NavigationProvider>
  );
}

export default App;
