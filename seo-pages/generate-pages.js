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

// Generate meta description
function generateMetaDescription(keyword) {
    return `${keyword.titulo}. ${keyword.solucion.substring(0, 120)}... Consultoría especializada en automatización. Diagnóstico gratuito.`;
}

// Generate sitemap
function generateSitemap(keywords) {
    const staticPages = [
        { url: 'https://www.mos-labs.com/', changefreq: 'weekly', priority: '1.0' },
        { url: 'https://www.mos-labs.com/privacidad/', changefreq: 'monthly', priority: '0.3' },
        { url: 'https://www.mos-labs.com/aviso-legal/', changefreq: 'monthly', priority: '0.3' }
    ];

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
    <loc>https://www.mos-labs.com/${keyword.slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    return sitemap;
}

// Generate each page
keywords.forEach(keyword => {
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
