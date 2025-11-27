import { useState } from "react";
import Keyboard from "./Keyboard";

const Skills = () => {
  const [skillTitle, setSkillTitle] = useState("Skills");

  return (
    <section
      id="skills"
      className="relative w-full min-h-dvh scroll-mt-14 pt-16"
    >
      <div className="mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-foreground">
          <span className="text-accent">{skillTitle}</span>
        </h2>
        <div className="relative -mt-40 aspect-video min-h-[500px]">
          <Keyboard onSkillChange={setSkillTitle} />
        </div>
      </div>
    </section>
  );
};

export default Skills;
