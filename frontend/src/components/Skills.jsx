import { useState } from "react";
import Keyboard from "./Keyboard";
import TrueFocus from "./TrueFocus";

const Skills = () => {
  const [skillTitle, setSkillTitle] = useState("Skills");

  // If title is "Skills", we want it blurred (index null).
  // If it's a specific skill, we want it focused (index 0).
  const activeIndex = skillTitle === "Skills" ? -1 : 0;

  return (
    <section
      id="skills"
      className="relative w-full min-h-dvh scroll-mt-24"
    >
      <div className="mx-auto px-4">
        <div className="mb-2 min-h-[100px] flex items-center justify-center relative z-10">
          <TrueFocus 
            words={[skillTitle]} 
            manualMode={true} 
            activeIndex={activeIndex}
            blurAmount={4}
            borderColor="#e8390d"
            glowColor="rgba(232, 57, 13, 0.3)"
            animationDuration={0.3}
          />
        </div>
        <p className="text-center text-gray-500 mt-2 text-sm animate-pulse">
          (Type on your keyboard or tap the keys)
        </p>
        <div className="relative -mt-20 sm:-mt-16 lg:-mt-10 h-[80vh] sm:h-[80vh] w-full">
          <Keyboard onSkillChange={setSkillTitle} />
        </div>
      </div>
    </section>
  );
};

export default Skills;
