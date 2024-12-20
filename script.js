document.addEventListener("DOMContentLoaded", function() {
  /* ======================================
     SWAY EFFECT
  ====================================== */
  const swayElements = document.querySelectorAll('.sway-element:not(.fullscreen-card)');
  
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

  let swayRequestId = null;
  document.addEventListener('mousemove', (event) => {
    if (swayRequestId) return;
    swayRequestId = requestAnimationFrame(() => {
      handleSwayMouseMove(event);
      swayRequestId = null;
    });
  });
  document.addEventListener('mouseleave', handleSwayMouseLeave);


  /* ======================================
     SCROLL REVEAL
  ====================================== */
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


  /* ======================================
     ACTIVE NAVBAR LINK
  ====================================== */
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


  /* ======================================
     TYPING ANIMATION
  ====================================== */
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


  /* ======================================
     CARD EXPANSION LOGIC
  ====================================== */
  let cloneCard = null;
  let isMouseDown = false;
  let pressedCard = null;

  function attachCardClickEvents() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      if (!card.dataset.listenerAttached) {
        card.addEventListener('mousedown', () => {
          isMouseDown = true;
          card.classList.add('pressed');
          pressedCard = card;
        });

        card.addEventListener('mouseup', (e) => {
          if (pressedCard === card && !e.target.classList.contains('close-button')) {
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
  const skillsContentContainer = document.querySelector('.skills-content');

  const projectsCardsObserver = new MutationObserver(attachCardClickEvents);
  projectsCardsObserver.observe(projectsCardsContainer, { childList: true, subtree: true });
  projectsCardsObserver.observe(skillsContentContainer, { childList: true, subtree: true });


  /* ======================================
     EXPAND CARD
  ====================================== */
  function expandCard(originalCard) {
    if (cloneCard) return;
    const rect = originalCard.getBoundingClientRect();
    cloneCard = originalCard.cloneNode(true);
    cloneCard.classList.remove('sway-element');
    cloneCard.classList.add('fullscreen-card');

    const closeButtonContainer = document.createElement('div');
    closeButtonContainer.style.position = 'fixed';
    closeButtonContainer.style.top = '0';
    closeButtonContainer.style.left = '0';
    closeButtonContainer.style.right = '0';
    closeButtonContainer.style.zIndex = '1002';
    closeButtonContainer.style.pointerEvents = 'none';

    const closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.textContent = 'X';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.style.opacity = '0';
    closeButton.style.transition = 'opacity 0.2s ease-in-out';
    closeButton.style.pointerEvents = 'auto';

    let lastScrollPosition = 100;
    let velocity = 0;
    let targetPosition = 0;
    let currentPosition = 0;
    let lastTime = Date.now();
    let scrollTimeout;
    let bounceTimeout;
    let animationFrame;
    let lastVelocities = Array(5).fill(0);

    const scrollHandler = () => {
      if (!cloneCard) return;
      const currentScroll = cloneCard.scrollTop;
      const currentTime = Date.now();
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.064);
      const scrollDiff = currentScroll - lastScrollPosition;
      const newVelocity = scrollDiff * 0.1;
      lastVelocities.shift();
      lastVelocities.push(newVelocity);
      const smoothedVelocity = lastVelocities.reduce((a, b) => a + b) / lastVelocities.length;
      velocity = velocity * 0.85 + smoothedVelocity * 0.15;
      targetPosition = Math.min(Math.max(velocity * 2.0, -35), 35);

      const updatePosition = () => {
        const spring = 0.15;
        const damping = 0.75;
        const displacement = targetPosition - currentPosition;
        const springForce = displacement * spring;
        velocity = (velocity + springForce) * damping;
        currentPosition += velocity * 0.8;
        closeButton.style.transform = `translateY(${currentPosition}px)`;
        if (Math.abs(velocity) > 0.005 || Math.abs(displacement) > 0.005) {
          animationFrame = requestAnimationFrame(updatePosition);
        }
      };

      cancelAnimationFrame(animationFrame);
      updatePosition();

      if (currentScroll === 0 && lastScrollPosition > 50) {
        clearTimeout(bounceTimeout);
        velocity = 0;
        currentPosition = 0;
        targetPosition = 0;
        cancelAnimationFrame(animationFrame);
        closeButton.style.transform = '';
        void closeButton.offsetWidth;
        closeButton.classList.add('bounce');
        bounceTimeout = setTimeout(() => {
          closeButton.classList.remove('bounce');
        }, 800);
      }

      lastScrollPosition = currentScroll;
      lastTime = currentTime;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        targetPosition = 0;
        updatePosition();
      }, 200);
    };

    const cleanup = () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(scrollTimeout);
      clearTimeout(bounceTimeout);
    };

    cloneCard.addEventListener('scroll', scrollHandler);

    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      cleanup();
      closeButton.style.opacity = '0';
      closeFullscreen();
    });

    closeButtonContainer.appendChild(closeButton);
    document.body.appendChild(closeButtonContainer);

    originalCard.classList.add('hidden-state');

    setTimeout(() => {
      originalCard.style.visibility = 'hidden';
    }, 200);

    Object.assign(cloneCard.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: '0',
      zIndex: '1000',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      overflowY: 'auto'
    });

    const content = cloneCard.querySelector('.card-content');
    if (content) content.classList.remove('hidden-content');

    document.body.appendChild(cloneCard);
    document.body.classList.add('expanded-mode');

    cloneCard.offsetWidth;

    cloneCard.classList.add('fullscreen-card');
    setTimeout(() => {
      Object.assign(cloneCard.style, {
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
      });
    }, 50);

    cloneCard.addEventListener('transitionend', function showContent(e) {
      if (e.propertyName === 'width') {
        cloneCard.removeEventListener('transitionend', showContent);
        requestAnimationFrame(() => {
          cloneCard.classList.add('content-ready');
          setTimeout(() => {
            cloneCard.classList.add('content-visible');
            closeButton.style.opacity = '1';
          }, 50);
        });
      }
    });
  }


  /* ======================================
     CLOSE FULLSCREEN
  ====================================== */
  function closeFullscreen() {
    if (!cloneCard) return;

    const cloneHeaderText = cloneCard.querySelector('.card-header h2').textContent;
    const originalCard = Array.from(document.querySelectorAll('.card'))
      .find(card => card.querySelector('.card-header h2')?.textContent === cloneHeaderText);

    if (!originalCard) return;

    const closeButtonContainer = document.querySelector('.close-button').parentElement;
    setTimeout(() => {
      if (closeButtonContainer) {
        closeButtonContainer.remove();
      }
    }, 400);

    cloneCard.classList.add('closing');
    cloneCard.classList.remove('content-visible');

    setTimeout(() => {
      const rect = originalCard.getBoundingClientRect();
      Object.assign(cloneCard.style, {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
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
});
