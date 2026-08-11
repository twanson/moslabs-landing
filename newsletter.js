// ===== MosLab — Newsletter opt-in =====
// Canal solo-email adicional al de los lead magnets (Tally). NO lo sustituye.
// Envía el alta al webhook de n8n ("MOS · Secuencia Bienvenida", instancia OC)
// con: email + honeypot 'web' (debe ir vacío) + source_detail (path de la
// página donde se apuntó). Éxito (200 JSON) → mensaje inline sin recargar;
// error → email de contacto. Delegación de submit: cubre bloque completo
// (landings de recursos) y el form compacto del footer con el mismo handler.
//
// Requiere que el webhook n8n devuelva cabeceras CORS (Access-Control-Allow-
// Origin) para poder leer la respuesta desde moslab.org.
(function () {
    'use strict';

    var ENDPOINT = 'https://n8n.oficioscirculares.com/webhook/moslab-newsletter';

    function isEN() {
        return (document.documentElement.getAttribute('lang') || 'es').toLowerCase().indexOf('en') === 0;
    }
    function msgOk() { return isEN() ? 'Done. Check your inbox.' : 'Hecho. Revisa tu correo.'; }
    function msgErr() {
        return isEN()
            ? "That didn't work — email me at jose.moscardo@moslab.org"
            : 'No ha funcionado, escríbeme a jose.moscardo@moslab.org';
    }

    function setStatus(form, text, ok) {
        var el = form.querySelector('.newsletter-status');
        if (!el) {
            el = document.createElement('p');
            el.className = 'newsletter-status';
            form.appendChild(el);
        }
        el.textContent = text;
        el.setAttribute('data-state', ok ? 'ok' : 'error');
        el.setAttribute('role', 'status');
    }

    // Rellena source_detail con el path actual (también para el fallback sin JS,
    // aunque el submit inline lo recalcula igualmente al enviar).
    function fillSourceDetail() {
        var fields = document.querySelectorAll('form[data-newsletter] input[name="source_detail"]');
        for (var i = 0; i < fields.length; i++) fields[i].value = location.pathname;
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fillSourceDetail);
    } else {
        fillSourceDetail();
    }

    document.addEventListener('submit', function (e) {
        var form = e.target;
        if (!form || !form.matches || !form.matches('form[data-newsletter]')) return;
        e.preventDefault();

        // Honeypot: si 'web' viene relleno, es un bot → abortamos en silencio.
        var hp = form.querySelector('input[name="web"]');
        if (hp && hp.value) return;

        var emailInput = form.querySelector('input[name="email"]');
        var email = emailInput ? emailInput.value.trim() : '';
        if (!email) return;

        var btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;

        var payload = new URLSearchParams();
        payload.set('email', email);
        payload.set('web', hp ? hp.value : '');
        payload.set('source_detail', location.pathname);

        fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload.toString()
        }).then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json().catch(function () { return {}; }); // tolera cuerpo vacío
        }).then(function () {
            setStatus(form, msgOk(), true);
            form.reset();
            var fields = form.querySelector('.newsletter-fields');
            if (fields) fields.style.display = 'none';
        }).catch(function () {
            setStatus(form, msgErr(), false);
            if (btn) btn.disabled = false;
        });
    }, false);
})();
