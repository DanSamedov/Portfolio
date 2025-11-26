import React from "react";
import Header from "./components/Header";
import Home from "./components/Home";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ScrollProgressBar from "./components/ScrollProgressBar";
import NavTracker from "./components/NavTracker";

function App() {
  return (
    <>
      <Header />
      <ScrollProgressBar />
      <main>
        <Home />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;
