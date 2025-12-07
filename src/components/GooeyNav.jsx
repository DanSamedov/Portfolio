import { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigation } from "../context/NavigationContext";

const GooeyNav = ({
  items = [
    { label: "Home", href: "#home", id: "home" },
    { label: "Skills", href: "#skills", id: "skills" },
    { label: "Projects", href: "#projects", id: "projects" },
    { label: "Contact", href: "#contact", id: "contact" },
  ],
  animationTime = 450,
  particleCount = 20,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 200,
  colors = ['black'],
}) => {
  const { activeLink, setActiveLink, smoothScrollTo } = useNavigation();
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const textRef = useRef(null);
  
  // Map activeLink (string) to index (number)
  const activeIndex = useMemo(() => {
    const index = items.findIndex(item => item.id === activeLink);
    return index !== -1 ? index : 0;
  }, [activeLink, items]);

  // Scroll Tracking Logic (ported from NavTracker)
  const intentId = useRef(null);
  const intentDeadline = useRef(0);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (intentId.current && performance.now() < intentDeadline.current)
          return;

        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
           // Center Strip Strategy
           visibleEntries.sort((a, b) => b.intersectionRect.height - a.intersectionRect.height);
           setActiveLink(visibleEntries[0].target.id);
        }
      },
      {
        threshold: 0,
        rootMargin: "-45% 0px -45% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, [items, setActiveLink]);

  // Gooey Effect Logic
  const noise = (n = 1) => n / 2 - Math.random() * n;
  const getXY = (distance, pointIndex, totalPoints) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };
  
  const createParticle = (i, t, d, r) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      // Select color based on index
      color: colors[i % colors.length], 
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };

  const makeParticles = element => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);
    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');
      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', p.color);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);
        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // do nothing
          }
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = element => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  };

  const handleClick = (e, index, id) => {
    e.preventDefault();
    const liEl = e.currentTarget.parentElement;
    
    // Update active state
    setActiveLink(id);
    intentId.current = id;
    intentDeadline.current = performance.now() + (reduced ? 200 : 1600);
    smoothScrollTo(id);

    // Trigger effect
    updateEffectPosition(liEl);
    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.particle');
      particles.forEach(p => filterRef.current.removeChild(p));
    }
    if (textRef.current) {
      textRef.current.classList.remove('active');
      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }
    if (filterRef.current) {
      makeParticles(filterRef.current);
    }
  };

  const handleKeyDown = (e, index, id) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e, index, id);
    }
  };

  // Update position when activeIndex changes (e.g. via scroll)
  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex];
    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add('active');
    }
    
    // Also update on resize
    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex];
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  return (
    <>
      <style>
        {`
          :root {
            --linear-ease: linear(0, 0.068, 0.19 2.7%, 0.804 8.1%, 1.037, 1.199 13.2%, 1.245, 1.27 15.8%, 1.274, 1.272 17.4%, 1.249 19.1%, 0.996 28%, 0.949, 0.928 33.3%, 0.926, 0.933 36.8%, 1.001 45.6%, 1.013, 1.019 50.8%, 1.018 54.4%, 1 63.1%, 0.995 68%, 1.001 85%, 1);
          }
          .effect {
            position: absolute;
            opacity: 1;
            pointer-events: none;
            display: grid;
            place-items: center;
            z-index: 1;
          }
          .effect.text {
            color: white;
            transition: color 0.3s ease;
            font-weight: 600;
            font-size: 1.05rem;
            text-shadow: none;
          }
          .effect.text.active {
            color: var(--color-background);
          }
          .effect.filter {
            filter: url(#goo);
          }
          .effect.filter::before {
            /* Removed black background pseudo-element */
            content: none;
          }
          .effect.filter::after {
            content: none;
          }
          .particle,
          .point {
            display: block;
            opacity: 0;
            width: 20px;
            height: 20px;
            border-radius: 9999px;
            transform-origin: center;
          }
          .particle {
            --time: 5s;
            position: absolute;
            top: calc(50% - 8px);
            left: calc(50% - 8px);
            animation: particle calc(var(--time)) ease 1 -350ms;
          }
          .point {
            background: var(--color);
            opacity: 1;
            animation: point calc(var(--time)) ease 1 -350ms;
          }
          @keyframes particle {
            0% {
              transform: rotate(0deg) translate(calc(var(--start-x)), calc(var(--start-y)));
              opacity: 1;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            70% {
              transform: rotate(calc(var(--rotate) * 0.5)) translate(calc(var(--end-x) * 1.2), calc(var(--end-y) * 1.2));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: rotate(calc(var(--rotate) * 0.66)) translate(calc(var(--end-x)), calc(var(--end-y)));
              opacity: 1;
            }
            100% {
              transform: rotate(calc(var(--rotate) * 1.2)) translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5));
              opacity: 1;
            }
          }
          @keyframes point {
            0% {
              transform: scale(0);
              opacity: 0;
              animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45);
            }
            25% {
              transform: scale(calc(var(--scale) * 0.25));
            }
            38% {
              opacity: 1;
            }
            65% {
              transform: scale(var(--scale));
              opacity: 1;
              animation-timing-function: ease;
            }
            85% {
              transform: scale(var(--scale));
              opacity: 1;
            }
            100% {
              transform: scale(0);
              opacity: 0;
            }
          }
          .gooey-nav li.active,
          .gooey-nav li.active a {
            color: transparent !important;
            text-shadow: none;
          }
          .gooey-nav li.active::after {
            opacity: 1;
            transform: scale(1);
          }
          .gooey-nav li::after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: 12px;
            background: black;
            opacity: 0;
            transform: scale(0);
            transition: all 0.3s ease;
            z-index: -1;
          }
        `}
      </style>
      <div className="relative nav-glass rounded-xl" ref={containerRef}>
        <nav className="flex relative" style={{ transform: 'translate3d(0,0,0.01px)' }}>
          <ul
            ref={navRef}
            className="gooey-nav flex gap-4 sm:gap-6 list-none py-1 px-3 m-0 relative z-[3]"
          >
            {items.map((item, index) => (
              <li
                key={index}
                className={`rounded-xl relative cursor-pointer transition-[background-color_color_box-shadow] duration-300 ease text-foreground/90 ${
                  activeIndex === index ? 'active' : ''
                }`}
              >
                <a
                  onClick={e => handleClick(e, index, item.id)}
                  href={item.href}
                  onKeyDown={e => handleKeyDown(e, index, item.id)}
                  className="outline-none py-2 px-4 inline-block font-semibold text-[1.05rem]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <span className="effect filter" ref={filterRef} />
        <span className="effect text" ref={textRef} />
      </div>
      
      {/* SVG Filter Definition */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    </>
  );
};

export default GooeyNav;
