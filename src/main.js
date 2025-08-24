import "./styles.css";

// Portfolio functionality
document.addEventListener('DOMContentLoaded', function() {
  // Filter text elements (now just for display)
  const filterTexts = document.querySelectorAll('.filter-text');
  
  // You can add filtering logic here later if needed
  // For now, they're just display elements

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Form handling
  const contactForm = document.querySelector('input[placeholder="Your Name"]')?.closest('form') || 
                     document.querySelector('input[placeholder="Your Name"]')?.closest('div')?.parentElement;
  
  if (contactForm) {
    const inputs = contactForm.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      // Add focus effects
      input.addEventListener('focus', function() {
        this.classList.remove('error', 'success');
      });
      
      // Add validation on blur
      input.addEventListener('blur', function() {
        validateInput(this);
      });
    });
  }

  // Add scroll effects
  window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero-content');
    
    if (parallax) {
      const speed = scrolled * 0.5;
      parallax.style.transform = `translateY(${speed}px)`;
    }
  });

  // Add intersection observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animatedElements = document.querySelectorAll('.project-card, .skill-tag, .section-header');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
});

// Filter projects function (placeholder for future use)
function filterProjects(filterType) {
  // This function can be implemented later if you want to add filtering functionality
  console.log('Filtering by:', filterType);
}

// Input validation function
function validateInput(input) {
  const value = input.value.trim();
  
  if (input.placeholder === 'Your Name') {
    if (value.length < 2) {
      input.classList.add('error');
      return false;
    } else {
      input.classList.add('success');
      return true;
    }
  }
  
  if (input.placeholder === 'Your Email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      input.classList.add('error');
      return false;
    } else {
      input.classList.add('success');
      return true;
    }
  }
  
  if (input.placeholder === 'Your Message') {
    if (value.length < 10) {
      input.classList.add('error');
      return false;
    } else {
      input.classList.add('success');
      return true;
    }
  }
  
  return true;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .project-card {
    animation: fadeIn 0.5s ease-in-out;
  }
`;
document.head.appendChild(style);
