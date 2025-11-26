import Keyboard from "./Keyboard";

const Skills = () => {
  return (
    <section
      id="skills"
      className="relative w-full min-h-dvh scroll-mt-14 pt-16"
    >
      <div className="mx-auto max-w-[960px] px-4">
        <h2 className="text-4xl font-bold text-center text-foreground">
          My <span className="text-accent">Skills</span>
        </h2>
        <div className="relative mt-8 h-[400px] md:h-[500px]">
          <Keyboard />
        </div>
      </div>
    </section>
  );
};

export default Skills;
