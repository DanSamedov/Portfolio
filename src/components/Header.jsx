import NavTracker from "./NavTracker";

const Header = () => {
  return (
    <header
      role="banner"
      className="fixed inset-x-0 bottom-2 sm:top-4 sm:bottom-auto z-50 flex justify-center pointer-events-none"
    >
      <nav aria-label="Main navigation" className="pointer-events-auto">
        <NavTracker />
      </nav>
    </header>
  );
};

export default Header;
