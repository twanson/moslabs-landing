// ===== MosLab Landing Page JavaScript =====

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initFAQ();
    initParticles();
    initScrollAnimations();
    initSmoothScroll();
    initHome();
    initCalculator();
});

// ===== Calculadora de ahorro (Fase 2) =====
// Se ejecuta solo si existe #calc (en /precios y /calculadora-ahorro).
function initCalculator() {
    const calc = document.getElementById('calc');
    if (!calc) return;
    const isEN = document.documentElement.lang === 'en';
    const $ = id => document.getElementById(id);
    // Formato de euro consciente del idioma. En ES: "1.990 €" (punto de millar,
    // € al final). En EN: "€1,990" (coma de millar, € delante). Agrupamos a mano
    // porque toLocaleString no agrupa los 4 dígitos en algunos entornos.
    const eur = n => {
        const num = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, isEN ? ',' : '.');
        return isEN ? '€' + num : num + ' €';
    };

    function recalc() {
        const personas = Math.max(0, +$('calc-personas').value || 0);
        const horas    = Math.max(0, +$('calc-horas').value || 0);
        const coste    = Math.max(0, +$('calc-coste').value || 0);
        const leads    = Math.max(0, +$('calc-leads').value || 0);
        const ticket   = Math.max(0, +$('calc-ticket').value || 0);

        if ($('calc-coste-out')) $('calc-coste-out').textContent = isEN ? '€' + coste : coste + ' €';

        const horasMes = personas * horas * 4.33;      // semanas/mes
        const eurHoras = horasMes * coste;
        const eurLeads = leads * ticket * 0.20;         // 20% de recuperación estimada
        const mes  = eurHoras + eurLeads;
        const anual = mes * 12;

        $('calc-horas-eur').textContent = eur(eurHoras);
        $('calc-leads-eur').textContent = eur(eurLeads);
        $('calc-anual').textContent = eur(anual);

        // Paquete recomendado según ahorro mensual
        let precio, nombre;
        if (mes >= 2000)      { precio = 3900; nombre = 'Motor completo'; }
        else if (mes >= 800)  { precio = 1990; nombre = 'Sistema'; }
        else                  { precio = 890;  nombre = 'Arranque'; }
        $('calc-paquete').textContent = nombre;
        $('calc-precio').textContent = eur(precio);

        if (mes > 0) {
            const meses = Math.max(1, Math.ceil(precio / mes));
            const unit = isEN ? (meses === 1 ? ' month' : ' months') : (meses === 1 ? ' mes' : ' meses');
            $('calc-roi-meses').textContent = meses + unit;
        } else {
            $('calc-roi-meses').textContent = '—';
        }
        if ($('calc-cta-eur')) $('calc-cta-eur').textContent = eur(anual) + (isEN ? '/year' : '/año');
    }

    calc.querySelectorAll('input').forEach(i => i.addEventListener('input', recalc));
    recalc();
}

// ===== Navbar Scroll Effect =====
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
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
    if (!toggle || !menu) return;
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
        if (!question) return; // FAQ nativa (<details>/<summary>) no necesita JS

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
    // La home usa su propio sistema `.reveal` (initHome); evitar que este
    // observer legacy añada `.animate-on-scroll` a sus .faq-item y duplique
    // el control de opacidad.
    if (document.body.classList.contains('home')) return;

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
    const navbar = document.getElementById('navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;
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

// ===== Home 2026 (mockup v2) =====
// Solo se ejecuta en <body class="home"> (index.html). Cada bloque va
// guardado para no afectar a las páginas legacy que también cargan script.js.
function initHome() {
    if (!document.body.classList.contains('home')) return;

    // Marquee: duplicar contenido para loop infinito
    const track = document.getElementById('track');
    if (track) track.innerHTML += track.innerHTML;

    // Reveal + stagger por hermanos, con red de seguridad anti-saltos.
    const revealEls = document.querySelectorAll('.home .reveal');
    if (revealEls.length) {
        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                const sib = [...e.target.parentElement.querySelectorAll(':scope > .reveal')];
                const i = sib.indexOf(e.target);
                e.target.style.transitionDelay = (i > 0 ? Math.min(i, 6) * 0.09 : 0) + 's';
                e.target.classList.add('visible');
                obs.unobserve(e.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
        revealEls.forEach(el => io.observe(el));

        // Red de seguridad: revela cualquier .reveal que ya esté en o por encima
        // del viewport aunque el IntersectionObserver no dispare (pestaña en 2º
        // plano, scroll con saltos/anchors, carga lenta o elementos muy altos).
        // Lo que queda por debajo del fold conserva su animación al hacer scroll.
        const sweep = () => {
            revealEls.forEach(el => {
                if (el.classList.contains('visible')) return;
                if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add('visible');
            });
        };
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(() => { sweep(); ticking = false; }); ticking = true; }
        }, { passive: true });
        window.addEventListener('resize', sweep, { passive: true });
        sweep();
        setTimeout(sweep, 300);
        setTimeout(sweep, 1200);
    }

    // KPIs: gauge + ecg + barras al entrar en viewport
    const kpis = document.getElementById('kpis');
    if (kpis) {
        const kio = new IntersectionObserver((es) => {
            es.forEach(e => {
                if (!e.isIntersecting) return;
                kpis.classList.add('visible-kpis');
                const ring = document.getElementById('ring');
                if (ring) ring.style.strokeDashoffset = 188.5 * (1 - 0.75);
                const t = document.getElementById('ringTxt');
                if (t) { let v = 0; const iv = setInterval(() => { v++; t.textContent = v + 'h'; if (v >= 18) clearInterval(iv); }, 60); }
                kio.disconnect();
            });
        }, { threshold: 0.4 });
        kio.observe(kpis);
    }

    // Punto que recorre el pipeline (respeta reduce-motion)
    const dot = document.getElementById('pulseDot');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (dot && !reduceMotion) {
        let x = 10, dir = 1;
        setInterval(() => { x += 3.2 * dir; if (x > 670) x = 10; dot.setAttribute('cx', x); }, 30);
    }

    // Partículas flotantes + estrellas fugaces. En móvil (≤768px): la mitad de
    // partículas y sin estrellas fugaces (rendimiento).
    const mobileFx = window.innerWidth <= 768;
    document.querySelectorAll('.home .fx-layer').forEach(layer => {
        const n = Math.round(parseInt(layer.dataset.fx || 20, 10) * (mobileFx ? 0.5 : 1));
        for (let i = 0; i < n; i++) {
            const p = document.createElement('div'); p.className = 'particle';
            const s = 1.5 + Math.random() * 3, r = Math.random();
            p.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${s}px;height:${s}px;opacity:${.12 + Math.random() * .3};background:${r < .4 ? '#ffffff' : r < .7 ? '#53ddfc' : '#8B5CF6'};animation-duration:${15 + Math.random() * 20}s;animation-delay:${-Math.random() * 20}s`;
            layer.appendChild(p);
        }
        if (!mobileFx) {
            for (let i = 0; i < 3; i++) {
                const st = document.createElement('div'); st.className = 'shooting';
                st.style.cssText = `left:${20 + Math.random() * 70}%;top:${Math.random() * 55}%;animation-duration:${6 + Math.random() * 8}s;animation-delay:${Math.random() * 9}s`;
                layer.appendChild(st);
            }
        }
    });

    // Parallax suave de orbes al hacer scroll (desactivado con reduce-motion)
    const orbs = [...document.querySelectorAll('.home [data-parallax]')];
    if (orbs.length && !reduceMotion) {
        let ticking = false;
        const parallax = () => {
            orbs.forEach(o => {
                const rct = o.parentElement.getBoundingClientRect();
                const offset = (rct.top + rct.height / 2 - window.innerHeight / 2) * parseFloat(o.dataset.parallax);
                o.style.transform = `translateY(${-offset}px)`;
            });
            ticking = false;
        };
        window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(parallax); ticking = true; } }, { passive: true });
        parallax();
    }
}

// ===== Console message =====
console.log('%c MosLab ', 'background: linear-gradient(135deg, #00D4FF, #8B5CF6); color: #0a0a0f; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 5px;');
console.log('%c Automatización de Marketing y Ventas para PYMEs ', 'color: #9CA3AF; font-size: 12px;');

// ===== Back-to-top con isotipo MosLab =====
(function () {
    if (document.getElementById('ml-top')) return;
    var css = ''
        + '#ml-top{position:fixed;right:22px;bottom:22px;width:48px;height:48px;'
        + 'display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;'
        + 'border-radius:50%;background:rgba(14,14,21,0.72);backdrop-filter:blur(10px);'
        + 'box-shadow:0 4px 20px rgba(0,0,0,0.35),inset 0 0 0 1px rgba(83,221,252,0.35);'
        + 'opacity:0;visibility:hidden;transform:translateY(12px);'
        + 'transition:opacity .3s ease,transform .3s ease,visibility .3s ease;z-index:900;padding:0;}'
        + '#ml-top.show{opacity:1;visibility:visible;transform:translateY(0);}'
        + '#ml-top:hover{box-shadow:0 6px 26px rgba(83,221,252,0.25),inset 0 0 0 1px rgba(83,221,252,0.7);}'
        + '#ml-top svg{width:20px;height:20px;display:block;transition:transform .3s ease;}'
        + '#ml-top:hover svg{transform:translateY(-2px);}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var btn = document.createElement('button');
    btn.id = 'ml-top'; btn.type = 'button';
    btn.setAttribute('aria-label', 'Volver arriba');
    btn.innerHTML = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
        + '<path d="M60,69.22l59.99-34.67v73.23c0,1.36,1.1,2.47,2.47,2.47h21.54v6.71l-84,48.5v-96.23Z" fill="#f4f0fb"/></svg>';
    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.body.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(btn);
    var getY = function () { return Math.max(window.pageYOffset || 0, document.body.scrollTop || 0, document.documentElement.scrollTop || 0); };
    var onScroll = function () { (getY() > 600) ? btn.classList.add('show') : btn.classList.remove('show'); };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    onScroll();
})();
