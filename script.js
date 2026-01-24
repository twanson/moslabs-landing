// ===== MOS Labs Landing Page JavaScript =====

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initFAQ();
    initParticles();
    initScrollAnimations();
    initSmoothScroll();
});

// ===== Navbar Scroll Effect =====
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });
}

// ===== Mobile Menu =====
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    const links = menu.querySelectorAll('.nav-link, .nav-cta');

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    links.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ===== FAQ Accordion =====
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });

        // Keyboard accessibility
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });
}

// ===== Particles Animation =====
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random position
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;

    // Random size
    const size = 2 + Math.random() * 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Random opacity
    particle.style.opacity = 0.1 + Math.random() * 0.3;

    // Random animation duration and delay
    particle.style.animationDuration = `${15 + Math.random() * 20}s`;
    particle.style.animationDelay = `${Math.random() * 10}s`;

    // Random color (cyan or purple)
    if (Math.random() > 0.5) {
        particle.style.background = '#00D4FF';
    } else {
        particle.style.background = '#8B5CF6';
    }

    container.appendChild(particle);
}

// ===== Scroll Animations =====
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.problem-card, .service-card, .process-step, .result-card, .metric, .faq-item'
    );

    // Add animation class
    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing after animation
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
}

// ===== Smooth Scroll for Anchor Links =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if it's just "#" or "#calendly" placeholder
            if (href === '#' || href === '#calendly') {
                if (href === '#calendly') {
                    // Placeholder - scroll to CTA section
                    e.preventDefault();
                    const ctaSection = document.querySelector('.cta-section');
                    if (ctaSection) {
                        scrollToElement(ctaSection);
                    }
                }
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                scrollToElement(target);
            }
        });
    });
}

function scrollToElement(element) {
    const navbarHeight = document.getElementById('navbar').offsetHeight;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// ===== Utility: Debounce =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== Utility: Throttle =====
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== Optional: Intersection Observer for Lazy Loading Images =====
function initLazyImages() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// ===== Console message =====
console.log('%c MOS Labs ', 'background: linear-gradient(135deg, #00D4FF, #8B5CF6); color: #0a0a0f; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 5px;');
console.log('%c Automatización de Marketing y Ventas para PYMEs ', 'color: #9CA3AF; font-size: 12px;');
