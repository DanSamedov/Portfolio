import GooeyNav from "./GooeyNav";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  return (
    <header
      role="banner"
      className="fixed inset-x-0 bottom-4 sm:top-4 sm:bottom-auto z-50 flex justify-center pointer-events-none"
    >
      <nav aria-label="Main navigation" className="pointer-events-auto flex items-center gap-2 sm:gap-4 px-2 sm:px-0">
        <GooeyNav />
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header;
