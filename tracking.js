// ===== MosLab — Booking CTA Tracking =====
// Detecta clicks a las páginas de contacto (/contacto/ ES · /en/contact/ EN),
// dispara evento GA4 'book_call_click' con cta_location (nav/hero/footer/
// cta-final/mid) y reescribe el href con UTMs + source únicos por página +
// posición. Permite saber qué CTA pulsó cada visitante.
//
// Los CTAs ya no apuntan directamente a Zoho Bookings: pasan primero por el
// formulario de contacto (Tally). El valor 'source' viaja por el funnel
// (/contacto/ → /gracias/) hasta el iframe de Zoho, que lo reinyecta como
// ?Origen=... — misma atribución que antes, ahora con filtro anti-spam.
//
// Autocontenido. Solo requiere que gtag.js esté cargado (lo está en todas
// las páginas vía Google Tag Manager / GA4). Si no está, el tracking se
// hace silenciosamente sin afectar la navegación.

(function () {
    'use strict';

    // Enlaces de reserva: ahora son las páginas de contacto, no Zoho.
    var BOOKING_SELECTOR = 'a[href*="/contacto/"], a[href*="/en/contact/"]';
    function isBookingLink(href) {
        return !!href && (href.indexOf('/contacto/') !== -1 || href.indexOf('/en/contact/') !== -1);
    }

    // Los selectores de idioma apuntan a /contacto/ y /en/contact/, pero son
    // navegación, no CTAs de reserva. Sin excluirlos ensuciarían el evento
    // GA4 'book_call_click' y le añadirían UTMs a un enlace de idioma.
    // .lang-switch = nav de escritorio · .m-drawer-lang = drawer móvil
    // (este último lo genera script.js en tiempo de ejecución).
    function isLangSwitch(el) {
        return !!(el && el.closest && el.closest('.lang-switch, .m-drawer-lang'));
    }

    function detectCtaLocation(el) {
        var node = el;
        while (node && node !== document.body) {
            var tag = (node.tagName || '').toLowerCase();
            var classList = node.classList;
            var id = (node.id || '').toLowerCase();
            var has = function (c) { return classList && classList.contains(c); };
            if (tag === 'nav' || has('navbar') || id === 'navbar') return 'nav';
            if (tag === 'footer' || has('footer')) return 'footer';
            // Sección final de CTA: <section class="cta"> en home, o variantes en otras páginas
            if (tag === 'section' && (has('cta') || has('cta-section') || has('final-cta'))) return 'cta-final';
            if (has('hero') || has('hero-section') || id.indexOf('hero') !== -1) return 'hero';
            node = node.parentElement;
        }
        return 'mid';
    }

    function pageSlug() {
        var path = location.pathname.replace(/^\/|\/$/g, '');
        if (!path) return 'home';
        return path.replace(/\//g, '-');
    }

    // fireEvent=false → solo anota el href (al cargar la página).
    // fireEvent=true  → anota y además dispara el evento GA4 (al hacer clic).
    // Separarlos es lo que hace que 'book_call_click' cuente clics reales y no
    // impresiones de CTA: antes se disparaba también en preAnnotate().
    function annotateAndTrack(link, fireEvent) {
        if (!link || !link.href) return;
        if (!isBookingLink(link.href)) return;
        if (isLangSwitch(link)) return;

        var ctaLocation = detectCtaLocation(link);
        var slug = pageSlug();
        var origenValue = slug + '/' + ctaLocation;

        // Reescribir href (idempotente). El destino ya NO usa hash routing:
        // - source=slug/cta → viaja por el funnel (/contacto/ → /gracias/) y
        //   la página de gracias lo reinyecta en el iframe de Zoho como
        //   ?Origen=slug/cta (mismo formato que antes generaba este script).
        // - utm_* → atribución estándar en GA4 + hidden fields del Tally.
        if (!link.dataset.utmSet) {
            try {
                var url = new URL(link.href);
                url.searchParams.set('source', origenValue);
                url.searchParams.set('utm_source', 'web');
                url.searchParams.set('utm_medium', 'cta');
                url.searchParams.set('utm_campaign', slug);
                url.searchParams.set('utm_content', ctaLocation);
                link.href = url.toString();
                link.dataset.utmSet = 'true';
            } catch (e) { /* href no parseable, dejamos como estaba */ }
        }

        // Disparar evento GA4 (transport beacon = no bloquea la navegación)
        if (fireEvent && typeof window.gtag === 'function') {
            window.gtag('event', 'book_call_click', {
                cta_location: ctaLocation,
                cta_text: (link.textContent || '').trim().slice(0, 80),
                page_path: location.pathname,
                page_slug: slug,
                origen: origenValue,
                transport_type: 'beacon'
            });
        }
    }

    function preAnnotate() {
        var links = document.querySelectorAll(BOOKING_SELECTOR);
        for (var i = 0; i < links.length; i++) annotateAndTrack(links[i], false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preAnnotate);
    } else {
        preAnnotate();
    }

    // Click delegation: captura también enlaces añadidos dinámicamente
    document.addEventListener('click', function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        var link = t.closest(BOOKING_SELECTOR);
        if (link) annotateAndTrack(link, true);
    }, true);
})();

// ===== MosLab — Lead Magnet Tracking =====
// Detecta clicks a /recursos/auditoria-6-fugas/ y dispara evento GA4
// 'lm_banner_click' con placement extraído del utm_content del href.
// El submit del form Tally se trackea desde la propia landing del LM
// con un listener de postMessage 'tally-form-submitted'.
(function () {
    'use strict';

    var LM_PATH = 'auditoria-6-fugas';

    function getPlacementFromHref(href) {
        try {
            var u = new URL(href, location.href);
            return u.searchParams.get('utm_content') || 'unknown';
        } catch (e) { return 'unknown'; }
    }

    function trackLmClick(link) {
        if (!link || !link.href) return;
        if (link.href.indexOf(LM_PATH) === -1) return;
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', 'lm_banner_click', {
            lm_id: 'auditoria-6-fugas',
            placement: getPlacementFromHref(link.href),
            page_path: location.pathname,
            link_text: (link.textContent || '').trim().slice(0, 80),
            transport_type: 'beacon'
        });
    }

    document.addEventListener('click', function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        var link = t.closest('a[href*="' + LM_PATH + '"]');
        if (link) trackLmClick(link);
    }, true);
})();

// ===== MosLab — WhatsApp FAB =====
// Botón flotante de WhatsApp (wa.me) inyectado en todas las páginas que
// cargan tracking.js. Autocontenido: estilos + markup + evento GA4
// 'whatsapp_click'. Número: WhatsApp Business API de MosLab.
(function () {
    'use strict';

    var WA_NUMBER = '34676786713';
    var isEN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0
        || location.pathname.indexOf('/en/') === 0;
    var WA_TEXT = isEN
        ? 'Hi, I came from moslab.org and I would like to automate my business.'
        : 'Hola, vengo de moslab.org y me gustaría automatizar mi negocio.';
    var WA_LABEL = isEN ? 'Chat on WhatsApp' : '¿Hablamos por WhatsApp?';
    var WA_URL = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(WA_TEXT);

    function injectFab() {
        if (document.getElementById('ml-wa-fab')) return;

        var css = [
            '#ml-wa-fab{position:fixed;right:18px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:900;display:flex;align-items:center;gap:10px;text-decoration:none}',
            '#ml-wa-fab .ml-wa-tip{background:rgba(8,8,13,.92);color:#e8e8ef;font:500 13px/1 Inter,system-ui,sans-serif;padding:10px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.12);opacity:0;transform:translateX(6px);transition:opacity .25s,transform .25s;pointer-events:none;white-space:nowrap}',
            '#ml-wa-fab:hover .ml-wa-tip{opacity:1;transform:translateX(0)}',
            '#ml-wa-fab .ml-wa-btn{width:56px;height:56px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(37,211,102,.35);transition:transform .2s,box-shadow .2s}',
            '#ml-wa-fab:hover .ml-wa-btn{transform:scale(1.08);box-shadow:0 8px 30px rgba(37,211,102,.5)}',
            '#ml-wa-fab svg{width:30px;height:30px;fill:#fff}',
            '@media(max-width:640px){#ml-wa-fab{right:16px}#ml-wa-fab .ml-wa-tip{display:none}#ml-wa-fab .ml-wa-btn{width:52px;height:52px}}'
        ].join('');

        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);

        var a = document.createElement('a');
        a.id = 'ml-wa-fab';
        a.href = WA_URL;
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-label', WA_LABEL);
        a.innerHTML =
            '<span class="ml-wa-tip">' + WA_LABEL + '</span>' +
            '<span class="ml-wa-btn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></span>';

        document.body.appendChild(a);
    }

    // Tracking delegado: cubre el FAB y los botones .btn-wa de las
    // tarjetas de precios. placement: 'fab' | 'pricing'.
    document.addEventListener('click', function (e) {
        var t = e.target;
        if (!t || !t.closest) return;
        var link = t.closest('a[href*="wa.me"]');
        if (!link) return;
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', 'whatsapp_click', {
            page_path: location.pathname,
            placement: link.id === 'ml-wa-fab' ? 'fab' : 'pricing',
            transport_type: 'beacon'
        });
    }, true);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectFab);
    } else {
        injectFab();
    }
})();
