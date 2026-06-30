const fs = require('fs');
const path = require('path');

// Load data
const keywords = require('./keywords.json').keywords;
const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

// Helper function to generate benefit HTML
function generateBenefitsHTML(beneficios) {
    return beneficios.map(beneficio => `
                <div class="benefit-card">
                    <div class="benefit-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                    </div>
                    <p class="benefit-text">${beneficio}</p>
                </div>`).join('\n');
}

// Helper function to generate related pages
function generateRelatedPages(currentSlug, allKeywords) {
    // Get 3 random pages that are not the current one
    const otherPages = allKeywords.filter(k => k.slug !== currentSlug);
    const shuffled = otherPages.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    return selected.map(page => `
                <a href="/${page.slug}/" class="related-card">
                    <h3>${page.titulo}</h3>
                    <p>Soluciones de automatización para ${page.sector_lower}</p>
                </a>`).join('\n');
}

// Generate meta description (max 155 chars, no truncation, clean sentence ending)
function generateMetaDescription(keyword) {
    const base = `${keyword.titulo}. `;
    const suffix = `. Diagnóstico gratuito.`;
    const maxSolucion = 155 - base.length - suffix.length;
    let sol = keyword.solucion.substring(0, maxSolucion);
    // Prefer cutting at last comma or period for a natural sentence break
    const lastComma = sol.lastIndexOf(',');
    const lastPeriod = sol.lastIndexOf('.');
    const cutPoint = Math.max(lastComma, lastPeriod);
    if (cutPoint > sol.length * 0.5) {
        sol = sol.substring(0, cutPoint);
    } else {
        // Fall back to last space, but avoid cutting prepositions/articles
        const lastSpace = sol.lastIndexOf(' ');
        if (lastSpace > 0) {
            sol = sol.substring(0, lastSpace);
            // Remove trailing short words (de, en, a, y, el, la, los, las, un, una, que, con, para, tu, tus, sin, sus, más)
            sol = sol.replace(/\s+(de|en|a|y|el|la|los|las|un|una|que|con|para|tu|tus|sin|sus|más)$/i, '');
        }
    }
    sol = sol.replace(/[,.\s]+$/, '');
    return `${base}${sol}${suffix}`;
}

// Generate sitemap
function generateSitemap(keywords) {
    const staticPages = [
        { url: 'https://moslab.org/', changefreq: 'weekly', priority: '1.0' },
        { url: 'https://moslab.org/recursos/', changefreq: 'weekly', priority: '0.9' },
        { url: 'https://moslab.org/sectores/', changefreq: 'weekly', priority: '0.8' },
        { url: 'https://moslab.org/blog/', changefreq: 'weekly', priority: '0.7' },
        { url: 'https://moslab.org/privacidad/', changefreq: 'monthly', priority: '0.3' },
        { url: 'https://moslab.org/aviso-legal/', changefreq: 'monthly', priority: '0.3' }
    ];

    // Load lead magnet resources from data/recursos.json (if exists)
    let recursos = [];
    const recursosPath = path.join(__dirname, '..', 'data', 'recursos.json');
    if (fs.existsSync(recursosPath)) {
        try {
            recursos = JSON.parse(fs.readFileSync(recursosPath, 'utf8'));
        } catch (e) {
            console.warn('Could not parse data/recursos.json:', e.message);
        }
    }

    // Load blog posts from data/blog-posts.json (if exists)
    let blogPosts = [];
    const blogPath = path.join(__dirname, '..', 'data', 'blog-posts.json');
    if (fs.existsSync(blogPath)) {
        try {
            const blogData = JSON.parse(fs.readFileSync(blogPath, 'utf8'));
            blogPosts = Array.isArray(blogData) ? blogData : (blogData.posts || []);
        } catch (e) {
            console.warn('Could not parse data/blog-posts.json:', e.message);
        }
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Páginas estáticas -->
`;

    // Add static pages
    staticPages.forEach(page => {
        sitemap += `  <url>
    <loc>${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    sitemap += `
  <!-- Páginas SEO programático -->
`;

    // Add SEO pages
    keywords.forEach(keyword => {
        sitemap += `  <url>
    <loc>https://moslab.org/${keyword.slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    // Add lead magnet landings (recursos)
    if (recursos.length > 0) {
        sitemap += `
  <!-- Lead Magnets / Recursos -->
`;
        recursos.forEach(r => {
            if (r.listed === false) return;
            sitemap += `  <url>
    <loc>https://moslab.org/recursos/${r.slug}/</loc>
    <lastmod>${r.updated_at || new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
`;
        });
    }

    // Add blog posts
    if (blogPosts.length > 0) {
        sitemap += `
  <!-- Blog posts -->
`;
        blogPosts.forEach(p => {
            if (p.published === false || p.draft === true) return;
            const slug = p.slug || p.id;
            if (!slug) return;
            sitemap += `  <url>
    <loc>https://moslab.org/blog/${slug}/</loc>
    <lastmod>${p.updated_at || p.published_at || new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
        });
    }

    sitemap += `</urlset>`;

    return sitemap;
}

// Generate each page
keywords.forEach(keyword => {
    // Safety: if the vertical already has custom LM banner or other
    // manual customizations, do not overwrite. Marker: <!-- LM-BANNER-CUSTOM -->
    // or presence of a "lm-banner-section" block.
    const existingPath = path.join(__dirname, '..', keyword.slug, 'index.html');
    if (fs.existsSync(existingPath)) {
        const existing = fs.readFileSync(existingPath, 'utf8');
        if (existing.indexOf('LM-BANNER-CUSTOM') !== -1 ||
            existing.indexOf('lm-banner-section') !== -1) {
            console.log(`SKIP (has custom LM banner): /${keyword.slug}/`);
            return;
        }
    }

    let page = template;

    // Replace all placeholders
    page = page.replace(/\{\{TITULO\}\}/g, keyword.titulo);
    page = page.replace(/\{\{H1\}\}/g, keyword.h1);
    page = page.replace(/\{\{KEYWORD\}\}/g, keyword.keyword);
    page = page.replace(/\{\{SLUG\}\}/g, keyword.slug);
    page = page.replace(/\{\{SECTOR\}\}/g, keyword.sector);
    page = page.replace(/\{\{SECTOR_LOWER\}\}/g, keyword.sector_lower);
    page = page.replace(/\{\{PROBLEMA\}\}/g, keyword.problema);
    page = page.replace(/\{\{SOLUCION\}\}/g, keyword.solucion);
    page = page.replace(/\{\{META_DESCRIPTION\}\}/g, generateMetaDescription(keyword));
    page = page.replace(/\{\{BENEFICIOS_HTML\}\}/g, generateBenefitsHTML(keyword.beneficios));
    page = page.replace(/\{\{RELATED_PAGES\}\}/g, generateRelatedPages(keyword.slug, keywords));

    // Create directory and write file
    const dirPath = path.join(__dirname, '..', keyword.slug);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(path.join(dirPath, 'index.html'), page);
    console.log(`Generated: /${keyword.slug}/`);
});

// Generate and save sitemap
const sitemap = generateSitemap(keywords);
fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), sitemap);
console.log(`\nSitemap updated with ${keywords.length + 3} URLs`);

console.log(`Total pages generated: ${keywords.length}`);
