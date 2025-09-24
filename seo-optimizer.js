const fs = require('fs');
const path = require('path');

// Performance optimization for SEO
class SEOOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.optimizeHTML();
        this.generateManifest();
        this.optimizeImages();
    }

    // Optimize HTML for better Core Web Vitals
    optimizeHTML() {
        const htmlPath = path.join(__dirname, 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');
        
        // Add critical CSS inline
        const criticalCSS = `
        <style>
        /* Critical CSS for above-the-fold content */
        body { margin: 0; font-family: 'Inter', sans-serif; }
        .loading-screen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #0f172a; z-index: 9999; }
        .navbar { position: fixed; top: 0; left: 0; width: 100%; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); z-index: 1000; }
        .hero-section { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        </style>`;
        
        // Add preload hints for critical resources
        const preloadHints = `
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
        <link rel="preload" href="styles.css" as="style">
        <link rel="preload" href="script.js" as="script">
        <link rel="preload" href="particles.min.js" as="script">`;
        
        // Add resource hints
        const resourceHints = `
        <link rel="dns-prefetch" href="//fonts.googleapis.com">
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com">
        <link rel="dns-prefetch" href="//unpkg.com">`;
        
        // Insert optimizations
        html = html.replace('</head>', `${criticalCSS}${preloadHints}${resourceHints}</head>`);
        
        // Add lazy loading for images
        html = html.replace(/<img/g, '<img loading="lazy"');
        
        // Add async/defer to non-critical scripts
        html = html.replace(/<script src="particles\.min\.js"><\/script>/g, '<script src="particles.min.js" defer></script>');
        
        fs.writeFileSync(htmlPath, html);
        console.log('HTML optimized for SEO');
    }

    // Generate web app manifest
    generateManifest() {
        const manifest = {
            "name": "Emma AI - Intelligent AI Assistant Platform",
            "short_name": "Emma AI",
            "description": "Cutting-edge AI platform delivering smart, autonomous AI agents",
            "start_url": "/",
            "display": "standalone",
            "background_color": "#0f172a",
            "theme_color": "#3b82f6",
            "orientation": "portrait-primary",
            "icons": [
                {
                    "src": "/Logo And Recording/cropped_circle_image.png",
                    "sizes": "192x192",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": "/Logo And Recording/cropped_circle_image.png",
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "any maskable"
                }
            ],
            "categories": ["business", "productivity", "utilities"],
            "lang": "en",
            "dir": "ltr"
        };

        fs.writeFileSync(
            path.join(__dirname, 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        console.log('Web app manifest generated');
    }

    // Optimize images (placeholder for future implementation)
    optimizeImages() {
        console.log('Image optimization ready - implement with sharp or imagemin');
    }

    // Generate sitemap with priority and changefreq
    generateAdvancedSitemap() {
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
    
    <!-- Homepage -->
    <url>
        <loc>https://emma.kodefast.com/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <image:image>
            <image:loc>https://emma.kodefast.com/Logo And Recording/cropped_circle_image.png</image:loc>
            <image:title>Emma AI Logo</image:title>
            <image:caption>Emma AI - Intelligent AI Assistant Platform</image:caption>
        </image:image>
    </url>
    
    <!-- Main sections -->
    <url>
        <loc>https://emma.kodefast.com/#about</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    
    <url>
        <loc>https://emma.kodefast.com/#pricing</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    
    <url>
        <loc>https://emma.kodefast.com/#resources</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    
</urlset>`;

        fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
        console.log('Advanced sitemap generated');
    }
}

// Run optimizations
if (require.main === module) {
    const optimizer = new SEOOptimizer();
    optimizer.generateAdvancedSitemap();
}

module.exports = SEOOptimizer;
