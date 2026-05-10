// ===== MOS Labs — Booking CTA Tracking =====
// Detecta clicks a Zoho Bookings, dispara evento GA4 'book_call_click' con
// cta_location (nav/hero/footer/cta-final/mid) y reescribe el href con UTMs
// únicos por página + posición. Permite saber qué CTA pulsó cada visitante.
//
// Autocontenido. Solo requiere que gtag.js esté cargado (lo está en todas
// las páginas vía Google Tag Manager / GA4). Si no está, el tracking se
// hace silenciosamente sin afectar la navegación.

(function () {
    'use strict';

    var BOOKING_HOST = 'zohobookings.eu';

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

    function annotateAndTrack(link) {
        if (!link || !link.href) return;
        if (link.href.indexOf(BOOKING_HOST) === -1) return;

        var ctaLocation = detectCtaLocation(link);
        var slug = pageSlug();
        var origenValue = slug + '/' + ctaLocation;

        // Reescribir href (idempotente):
        // - UTMs antes del hash → consumidos por GA4 si hiciera falta
        // - ?Origen=... DESPUÉS del hash → consumido por Zoho Bookings
        //   para pre-rellenar el campo "Origen" del formulario.
        //   Zoho usa hash routing (#/moslabs), por eso los params para Zoho
        //   van detrás del hash. Doc: help.zoho.com/.../bookings-booking-page
        if (!link.dataset.utmSet) {
            try {
                var url = new URL(link.href);
                url.searchParams.set('utm_source', 'web');
                url.searchParams.set('utm_medium', 'cta');
                url.searchParams.set('utm_campaign', slug);
                url.searchParams.set('utm_content', ctaLocation);
                var newHref = url.toString();

                // Añadir Origen detrás del hash si hay hash routing
                var hashIdx = newHref.indexOf('#');
                if (hashIdx !== -1) {
                    var hashPart = newHref.substring(hashIdx + 1);
                    var separator = hashPart.indexOf('?') !== -1 ? '&' : '?';
                    newHref = newHref.substring(0, hashIdx + 1) + hashPart + separator + 'Origen=' + encodeURIComponent(origenValue);
                }

                link.href = newHref;
                link.dataset.utmSet = 'true';
            } catch (e) { /* href no parseable, dejamos como estaba */ }
        }

        // Disparar evento GA4 (transport beacon = no bloquea la navegación)
        if (typeof window.gtag === 'function') {
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
        var links = document.querySelectorAll('a[href*="' + BOOKING_HOST + '"]');
        for (var i = 0; i < links.length; i++) annotateAndTrack(links[i]);
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
        var link = t.closest('a[href*="' + BOOKING_HOST + '"]');
        if (link) annotateAndTrack(link);
    }, true);
})();

// ===== MOS Labs — Lead Magnet Tracking =====
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
