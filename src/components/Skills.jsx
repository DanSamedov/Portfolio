import { useState } from "react";
import Keyboard from "./Keyboard";

const Skills = () => {
  const [skillTitle, setSkillTitle] = useState("Skills");

  return (
    <section
      id="skills"
      className="relative w-full min-h-dvh scroll-mt-24 pt-16 mt-32"
    >
      <div className="mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-foreground">
          <span className="text-accent">{skillTitle}</span>
        </h2>
        <p className="text-center text-gray-500 mt-2 text-sm animate-pulse">
          (Type on your keyboard or click the keys)
        </p>
        <div className="relative -mt-40 aspect-video min-h-[500px]">
          <Keyboard onSkillChange={setSkillTitle} />
        </div>
      </div>
    </section>
  );
};

export default Skills;
