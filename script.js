document.addEventListener("DOMContentLoaded", function() {
  let cloneCard = null;
  let isMouseDown = false;
  let pressedCard = null;
  let removeScrollUpListeners = null;

  // SWAY EFFECT
  const swayElements = document.querySelectorAll('.sway-element:not(.fullscreen-card)');
  let swayRequestId = null;
  function handleSwayMouseMove(event) {
    if (window.innerWidth < 768) return;
    const { clientX, clientY } = event;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const xPercent = (clientX / windowWidth - 0.5) * 2;
    const yPercent = (clientY / windowHeight - 0.5) * 2;
    swayElements.forEach(element => {
      const rotateY = xPercent * 5;
      const rotateX = -yPercent * 5;
      const translateX = xPercent * 5;
      const translateY = yPercent * 5;
      element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${translateX}px, ${translateY}px)`;
    });
  }
  function handleSwayMouseLeave() {
    swayElements.forEach(element => {
      element.style.transform = `rotateX(0deg) rotateY(0deg) translate(0px,0px)`;
    });
  }
  document.addEventListener('mousemove', (event) => {
    if (swayRequestId) return;
    swayRequestId = requestAnimationFrame(() => {
      handleSwayMouseMove(event);
      swayRequestId = null;
    });
  });
  document.addEventListener('mouseleave', handleSwayMouseLeave);

  // SCROLL REVEAL
  const hiddenElements = document.querySelectorAll('.hidden');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      } else {
        entry.target.classList.remove('show');
      }
    });
  }, { threshold: 0.1 });
  hiddenElements.forEach(el => revealObserver.observe(el));

  // ACTIVE NAVBAR LINK
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.navbar a');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active-link'));
        const activeLink = document.querySelector(`.navbar a[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active-link');
      }
    });
  }, { threshold: 0.6 });
  sections.forEach(section => sectionObserver.observe(section));

  // TYPING ANIMATION
  function createTypingAnimation(element, text, speed, onComplete) {
    let index = 0;
    let timeoutId;
    element.textContent = '';
    element.classList.remove('blink');
    function type() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        timeoutId = setTimeout(type, speed);
      } else {
        element.classList.add('blink');
        if (onComplete) onComplete();
      }
    }
    type();
    return () => clearTimeout(timeoutId);
  }
  const typingConfigs = [
    { target: document.getElementById('typingTarget'), text: "Hi, I'm Henri", speed: 75, observerTarget: document.getElementById('home') },
    { target: document.getElementById('projectsTypingTarget'), text: "Projects", speed: 85, observerTarget: document.querySelector('.projects-title') },
    { target: document.getElementById('skillsTypingTarget'), text: "Skills", speed: 83, observerTarget: document.querySelector('.skills-title') },
    { target: document.getElementById('contactTypingTarget'), text: "Get in touch", speed: 82, observerTarget: document.querySelector('.contact-title') },
  ];
  const typingCancelers = {};
  typingConfigs.forEach(config => {
    const { target, text, speed, observerTarget } = config;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (typingCancelers[target.id]) typingCancelers[target.id]();
          typingCancelers[target.id] = createTypingAnimation(target, text, speed);
        } else {
          if (typingCancelers[target.id]) {
            typingCancelers[target.id]();
            typingCancelers[target.id] = null;
          }
          target.textContent = '';
          target.classList.remove('blink');
        }
      });
    }, { threshold: 0.1 });
    observer.observe(observerTarget);
  });

  // SINGLE FULLSCREEN-CARD EXPANSION LOGIC
  function expandCard(originalCard) {
    if (cloneCard) return;
    const rect = originalCard.getBoundingClientRect();
    cloneCard = originalCard.cloneNode(true);
    cloneCard.classList.remove('sway-element');
    cloneCard.classList.add('fullscreen-card');
    const isCard2 = originalCard.classList.contains('card2');
    let attemptingClose = false;
    
    function handleWheel(e) {
      if (cloneCard.scrollTop === 0 && e.deltaY < 0) {
        if (!attemptingClose) {
          cloneCard.classList.add('ready-to-close');
          attemptingClose = true;
        } else {
          closeFullscreen();
        }
      } else {
        attemptingClose = false;
        cloneCard.classList.remove('ready-to-close');
      }
    }

    let touchStartY = 0;
    function handleTouchStart(e) {
      touchStartY = e.touches[0].clientY;
    }
    function handleTouchMove(e) {
      const currentY = e.touches[0].clientY;
      const touchDiff = currentY - touchStartY;
      // Only prevent default when pulling down from the top:
      if (cloneCard.scrollTop === 0 && touchDiff > 0) {
        e.preventDefault();
        if (!attemptingClose) {
          cloneCard.classList.add('ready-to-close');
          attemptingClose = true;
        } else if (touchDiff > 100) {
          closeFullscreen();
        }
      } else {
        attemptingClose = false;
        cloneCard.classList.remove('ready-to-close');
      }
    }
    function handleTouchEnd() {
      if (!attemptingClose) {
        cloneCard.classList.remove('ready-to-close');
      }
    }

    // Add listeners for scroll-up-close
    cloneCard.addEventListener('wheel', handleWheel);
    cloneCard.addEventListener('touchstart', handleTouchStart, { passive: false });
    cloneCard.addEventListener('touchmove', handleTouchMove, { passive: false });
    cloneCard.addEventListener('touchend', handleTouchEnd);

    removeScrollUpListeners = function() {
      cloneCard.removeEventListener('wheel', handleWheel);
      cloneCard.removeEventListener('touchstart', handleTouchStart);
      cloneCard.removeEventListener('touchmove', handleTouchMove);
      cloneCard.removeEventListener('touchend', handleTouchEnd);
    };

    originalCard.classList.add('hidden-state');
    setTimeout(() => {
      originalCard.style.visibility = 'hidden';
    }, 200);

    // Make the clone fill the screen with iOS friendly scrolling
    Object.assign(cloneCard.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: '0',
      zIndex: '1000',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    });

    let hiddenContent;
    if (isCard2) {
      hiddenContent = cloneCard.querySelector('.card2-hiddencontent');
    } else {
      hiddenContent = cloneCard.querySelector('.card-content');
    }
    if (hiddenContent) hiddenContent.style.display = 'block';

    document.body.appendChild(cloneCard);
    document.body.classList.add('expanded-mode');
    cloneCard.offsetWidth; // force reflow
    cloneCard.classList.add('fullscreen-card');

    setTimeout(() => {
      Object.assign(cloneCard.style, {
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh'
      });
    }, 50);

    cloneCard.addEventListener('transitionend', function showContent(e) {
      if (e.propertyName === 'width') {
        cloneCard.removeEventListener('transitionend', showContent);
        requestAnimationFrame(() => {
          cloneCard.classList.add('content-ready');
          setTimeout(() => {
            cloneCard.classList.add('content-visible');
          }, 50);
        });
      }
    });
  }

  function closeFullscreen() {
    if (!cloneCard) return;
    if (removeScrollUpListeners) {
      removeScrollUpListeners();
      removeScrollUpListeners = null;
    }
    let cloneHeaderText = '';
    const headerH2 = cloneCard.querySelector('.card-header h2');
    if (headerH2) cloneHeaderText = headerH2.textContent.trim();
    let originalCard = null;
    const allCards = document.querySelectorAll('.card, .card2');
    for (let card of allCards) {
      const cardH2 = card.querySelector('.card-header h2');
      if (cardH2 && cardH2.textContent.trim() === cloneHeaderText) {
        originalCard = card;
        break;
      }
    }
    if (!originalCard) {
      originalCard = document.querySelector('.card2'); 
    }
    cloneCard.classList.add('closing');
    cloneCard.classList.remove('content-visible');
    setTimeout(() => {
      const rect = originalCard.getBoundingClientRect();
      Object.assign(cloneCard.style, {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
      });
    }, 200);

    cloneCard.addEventListener('transitionend', function cleanup(e) {
      if (e.propertyName === 'width') {
        cloneCard.removeEventListener('transitionend', cleanup);
        document.body.removeChild(cloneCard);
        cloneCard = null;
        document.body.classList.remove('expanded-mode');
        originalCard.classList.remove('hidden-state');
        originalCard.classList.remove('pressed');
        originalCard.style.visibility = 'visible';
      }
    });
  }

  // CARD CLICK EVENT ATTACHMENT
  function attachCardClickEvents() {
    const cards = document.querySelectorAll('.card, .card2');
    cards.forEach(card => {
      if (!card.dataset.listenerAttached) {
        card.addEventListener('mousedown', () => {
          isMouseDown = true;
          card.classList.add('pressed');
          pressedCard = card;
        });
        card.addEventListener('mouseup', () => {
          if (pressedCard === card) {
            expandCard(card);
          }
          setTimeout(() => {
            if (pressedCard === card) {
              pressedCard.classList.remove('pressed');
              pressedCard = null;
            }
            isMouseDown = false;
          }, 100);
        });
        card.addEventListener('mouseleave', () => {
          if (isMouseDown && pressedCard === card) {
            card.classList.remove('pressed');
            pressedCard = null;
          }
        });
        card.dataset.listenerAttached = 'true';
      }
    });
  }

  document.addEventListener('mouseup', () => {
    isMouseDown = false;
    if (pressedCard) {
      pressedCard.classList.remove('pressed');
      pressedCard = null;
    }
  });

  attachCardClickEvents();
  const projectsCardsContainer = document.querySelector('.projects-cards');
  if (projectsCardsContainer) {
    const projectsCardsObserver = new MutationObserver(() => {
      attachCardClickEvents();
    });
    projectsCardsObserver.observe(projectsCardsContainer, { 
      childList: true, 
      subtree: true 
    });
  }
});
