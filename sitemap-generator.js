const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'emma_cms',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Generate sitemap.xml
async function generateSitemap() {
    try {
        const connection = await pool.getConnection();
        
        // Base URL
        const baseUrl = 'https://emma.kodefast.com';
        const currentDate = new Date().toISOString();
        
        // Static pages
        const staticPages = [
            {
                url: `${baseUrl}/`,
                lastmod: currentDate,
                changefreq: 'daily',
                priority: '1.0'
            },
            {
                url: `${baseUrl}/#about`,
                lastmod: currentDate,
                changefreq: 'weekly',
                priority: '0.8'
            },
            {
                url: `${baseUrl}/#pricing`,
                lastmod: currentDate,
                changefreq: 'weekly',
                priority: '0.9'
            },
            {
                url: `${baseUrl}/#resources`,
                lastmod: currentDate,
                changefreq: 'weekly',
                priority: '0.7'
            }
        ];
        
        // Get blogs
        const [blogs] = await connection.execute(`
            SELECT id, title, updated_at 
            FROM blogs 
            WHERE status = 'published' 
            ORDER BY updated_at DESC
        `);
        
        // Get use cases
        const [useCases] = await connection.execute(`
            SELECT id, title, updated_at 
            FROM use_cases 
            WHERE status = 'published' 
            ORDER BY updated_at DESC
        `);
        
        // Get case studies
        const [caseStudies] = await connection.execute(`
            SELECT id, title, updated_at 
            FROM case_studies 
            WHERE status = 'published' 
            ORDER BY updated_at DESC
        `);
        
        connection.release();
        
        // Generate sitemap XML
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add static pages
        staticPages.forEach(page => {
            sitemap += `
    <url>
        <loc>${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
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
        console.log('Sitemap generated successfully!');
        
    } catch (error) {
        console.error('Error generating sitemap:', error);
    }
}

// Generate robots.txt
function generateRobots() {
    const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://emma.kodefast.com/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /uploads/
Disallow: /node_modules/

# Allow important static files
Allow: /styles.css
Allow: /script.js
Allow: /particles.min.js
Allow: /Logo And Recording/

# Specific bot instructions
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2`;

    fs.writeFileSync(path.join(__dirname, 'robots.txt'), robotsContent);
    console.log('Robots.txt generated successfully!');
}

// Run if called directly
if (require.main === module) {
    generateSitemap().then(() => {
        generateRobots();
        process.exit(0);
    });
}

module.exports = { generateSitemap, generateRobots };
