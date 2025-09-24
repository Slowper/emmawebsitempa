const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Generate sitemap.xml with SQLite
async function generateSitemap() {
    try {
        const dbPath = path.join(__dirname, 'database', 'emma_cms.db');
        const db = new sqlite3.Database(dbPath);
        
        // Base URL
        const baseUrl = 'https://emma.kodefast.com';
        const currentDate = new Date().toISOString();
        
        // Static MPA pages
        const staticPages = [
            {
                url: `${baseUrl}/`,
                lastmod: currentDate,
                changefreq: 'daily',
                priority: '1.0'
            },
            {
                url: `${baseUrl}/about`,
                lastmod: currentDate,
                changefreq: 'weekly',
                priority: '0.8'
            },
            {
                url: `${baseUrl}/pricing`,
                lastmod: currentDate,
                changefreq: 'weekly',
                priority: '0.9'
            },
            {
                url: `${baseUrl}/resources`,
                lastmod: currentDate,
                changefreq: 'weekly',
                priority: '0.7'
            },
            {
                url: `${baseUrl}/contact`,
                lastmod: currentDate,
                changefreq: 'monthly',
                priority: '0.6'
            }
        ];
        
        // Get blogs
        const blogs = await new Promise((resolve, reject) => {
            db.all(`
                SELECT id, title, updated_at 
                FROM blogs 
                WHERE status = 'published' 
                ORDER BY updated_at DESC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Get use cases
        const useCases = await new Promise((resolve, reject) => {
            db.all(`
                SELECT id, title, updated_at 
                FROM use_cases 
                WHERE status = 'published' 
                ORDER BY updated_at DESC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        // Get case studies
        const caseStudies = await new Promise((resolve, reject) => {
            db.all(`
                SELECT id, title, updated_at 
                FROM case_studies 
                WHERE status = 'published' 
                ORDER BY updated_at DESC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        db.close();
        
        // Generate sitemap XML
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

        // Add static pages
        staticPages.forEach(page => {
            sitemap += `
    <url>
        <loc>${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
        <image:image>
            <image:loc>https://emma.kodefast.com/Logo And Recording/cropped_circle_image.png</image:loc>
            <image:title>Emma AI Logo</image:title>
            <image:caption>Emma AI - Intelligent AI Assistant Platform</image:caption>
        </image:image>
    </url>`;
        });
        
        // Add blog pages
        blogs.forEach(blog => {
            sitemap += `
    <url>
        <loc>${baseUrl}/blog/${blog.id}</loc>
        <lastmod>${new Date(blog.updated_at).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>`;
        });
        
        // Add use case pages
        useCases.forEach(useCase => {
            sitemap += `
    <url>
        <loc>${baseUrl}/usecase/${useCase.id}</loc>
        <lastmod>${new Date(useCase.updated_at).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>`;
        });
        
        // Add case study pages
        caseStudies.forEach(caseStudy => {
            sitemap += `
    <url>
        <loc>${baseUrl}/casestudy/${caseStudy.id}</loc>
        <lastmod>${new Date(caseStudy.updated_at).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>`;
        });
        
        sitemap += `
</urlset>`;
        
        // Write sitemap to file
        fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
        console.log('✅ Sitemap generated successfully with SQLite!');
        console.log(`📊 Generated sitemap with:`);
        console.log(`   - ${staticPages.length} static pages`);
        console.log(`   - ${blogs.length} blog posts`);
        console.log(`   - ${useCases.length} use cases`);
        console.log(`   - ${caseStudies.length} case studies`);
        
    } catch (error) {
        console.error('❌ Error generating sitemap:', error.message);
        // Generate basic sitemap even if database fails
        generateBasicSitemap();
    }
}

// Generate basic sitemap if database fails
function generateBasicSitemap() {
    const baseUrl = 'https://emma.kodefast.com';
    const currentDate = new Date().toISOString();
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    
    <!-- Homepage -->
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <image:image>
            <image:loc>${baseUrl}/Logo And Recording/cropped_circle_image.png</image:loc>
            <image:title>Emma AI Logo</image:title>
            <image:caption>Emma AI - Intelligent AI Assistant Platform</image:caption>
        </image:image>
    </url>
    
    <!-- Main MPA pages -->
    <url>
        <loc>${baseUrl}/about</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    
    <url>
        <loc>${baseUrl}/pricing</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    
    <url>
        <loc>${baseUrl}/resources</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    
    <url>
        <loc>${baseUrl}/contact</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    
</urlset>`;

    fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);
    console.log('✅ Basic sitemap generated successfully!');
}

// Run if called directly
if (require.main === module) {
    generateSitemap();
}

module.exports = { generateSitemap };
