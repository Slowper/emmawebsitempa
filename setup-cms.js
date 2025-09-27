#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './config.env' });

class CMSSetup {
    constructor() {
        this.dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'emma_resources_cms',
            charset: 'utf8mb4'
        };
    }

    async run() {
        console.log('🚀 Setting up Emma Resources CMS...\n');

        try {
            // Step 1: Create database
            await this.createDatabase();
            
            // Step 2: Run schema
            await this.runSchema();
            
            // Step 3: Create upload directories
            await this.createDirectories();
            
            // Step 4: Install dependencies
            await this.installDependencies();
            
            // Step 5: Create sample data
            await this.createSampleData();
            
            console.log('\n✅ CMS setup completed successfully!');
            console.log('\n📋 Next steps:');
            console.log('1. Start the CMS server: npm run start');
            console.log('2. Access the admin panel: http://localhost:3001/cms-admin.html');
            console.log('3. Login with: admin / admin123');
            console.log('4. Update your main website to use the CMS integration');
            
        } catch (error) {
            console.error('\n❌ Setup failed:', error.message);
            process.exit(1);
        }
    }

    async createDatabase() {
        console.log('📊 Creating database...');
        
        const connection = await mysql.createConnection({
            host: this.dbConfig.host,
            user: this.dbConfig.user,
            password: this.dbConfig.password,
            charset: 'utf8mb4'
        });

        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${this.dbConfig.database}`);
        await connection.end();
        
        console.log('✅ Database created');
    }

    async runSchema() {
        console.log('📋 Running database schema...');
        
        const connection = await mysql.createConnection(this.dbConfig);
        
        // Read and execute schema file
        const schemaPath = path.join(__dirname, 'cms-resources-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = schema.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
            }
        }
        
        await connection.end();
        console.log('✅ Database schema applied');
    }

    async createDirectories() {
        console.log('📁 Creating upload directories...');
        
        const directories = [
            'cms-uploads',
            'cms-uploads/images',
            'cms-uploads/documents',
            'cms-uploads/gallery'
        ];

        for (const dir of directories) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
        
        console.log('✅ Upload directories created');
    }

    async installDependencies() {
        console.log('📦 Installing dependencies...');
        
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);

        try {
            // Copy package.json for CMS
            fs.copyFileSync('cms-package.json', 'package-cms.json');
            
            // Install dependencies
            await execAsync('npm install --prefix . --package-lock-only=false');
            console.log('✅ Dependencies installed');
        } catch (error) {
            console.log('⚠️  Dependencies installation failed, please run manually: npm install');
        }
    }

    async createSampleData() {
        console.log('📝 Creating sample data...');
        
        const connection = await mysql.createConnection(this.dbConfig);

        // Create sample blog post
        const sampleBlog = {
            title: 'Welcome to Emma Resources CMS',
            slug: 'welcome-to-emma-resources-cms',
            type: 'blog',
            status: 'published',
            excerpt: 'Learn about the new Emma Resources CMS and how it can help you manage your content effectively.',
            content: `
                <h2>Welcome to Emma Resources CMS</h2>
                <p>We're excited to introduce the new Emma Resources CMS, a powerful content management system designed specifically for managing blogs, case studies, and use cases.</p>
                
                <h3>Key Features</h3>
                <ul>
                    <li><strong>Rich Text Editor:</strong> Create beautiful content with our integrated Quill editor</li>
                    <li><strong>Media Management:</strong> Upload and organize images, documents, and galleries</li>
                    <li><strong>Industry Categorization:</strong> Organize content by industry for better filtering</li>
                    <li><strong>SEO Optimization:</strong> Built-in SEO tools for better search engine visibility</li>
                    <li><strong>Responsive Design:</strong> Beautiful reading experience on all devices</li>
                </ul>
                
                <h3>Getting Started</h3>
                <p>To get started with the CMS:</p>
                <ol>
                    <li>Log in to the admin panel</li>
                    <li>Create your first resource</li>
                    <li>Upload images and media</li>
                    <li>Publish your content</li>
                </ol>
                
                <blockquote>
                    <p>"The Emma Resources CMS makes content management simple and efficient. We've seen a 300% increase in content production since implementing it."</p>
                    <cite>- Emma AI Team</cite>
                </blockquote>
                
                <p>Ready to start creating amazing content? <a href="/cms-admin.html">Access the admin panel</a> and begin your content journey today!</p>
            `,
            content_plain: 'Welcome to Emma Resources CMS - Learn about the new content management system and its features.',
            author_id: 1,
            author_name: 'Emma AI Team',
            industry_id: 6, // Technology
            tags: JSON.stringify(['CMS', 'Content Management', 'Emma AI']),
            meta_title: 'Welcome to Emma Resources CMS - Content Management Made Easy',
            meta_description: 'Learn about the new Emma Resources CMS and how it can help you manage your content effectively.',
            meta_keywords: 'CMS, content management, Emma AI, blog, case studies',
            read_time: 5,
            word_count: 250,
            published_at: new Date()
        };

        await connection.execute(`
            INSERT IGNORE INTO resources (
                title, slug, type, status, excerpt, content, content_plain,
                author_id, author_name, industry_id, tags, meta_title, 
                meta_description, meta_keywords, read_time, word_count, published_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            sampleBlog.title, sampleBlog.slug, sampleBlog.type, sampleBlog.status,
            sampleBlog.excerpt, sampleBlog.content, sampleBlog.content_plain,
            sampleBlog.author_id, sampleBlog.author_name, sampleBlog.industry_id,
            sampleBlog.tags, sampleBlog.meta_title, sampleBlog.meta_description,
            sampleBlog.meta_keywords, sampleBlog.read_time, sampleBlog.word_count,
            sampleBlog.published_at
        ]);

        // Create sample case study
        const sampleCaseStudy = {
            title: 'Healthcare AI Implementation Success Story',
            slug: 'healthcare-ai-implementation-success-story',
            type: 'case-study',
            status: 'published',
            excerpt: 'How Emma AI transformed patient care at a leading hospital through intelligent automation.',
            content: `
                <h2>Healthcare AI Implementation Success Story</h2>
                <p>This case study explores how Emma AI helped a leading healthcare provider improve patient outcomes and operational efficiency through intelligent automation.</p>
                
                <h3>Challenge</h3>
                <p>The hospital was facing several critical challenges:</p>
                <ul>
                    <li>High patient wait times</li>
                    <li>Manual scheduling processes</li>
                    <li>Limited staff availability for routine tasks</li>
                    <li>Complex patient data management</li>
                </ul>
                
                <h3>Solution</h3>
                <p>Emma AI implemented a comprehensive automation solution that included:</p>
                <ul>
                    <li>Intelligent appointment scheduling</li>
                    <li>Automated patient data processing</li>
                    <li>Smart resource allocation</li>
                    <li>Predictive analytics for patient care</li>
                </ul>
                
                <h3>Results</h3>
                <p>The implementation delivered remarkable results:</p>
                <ul>
                    <li><strong>40% reduction</strong> in patient wait times</li>
                    <li><strong>60% improvement</strong> in scheduling efficiency</li>
                    <li><strong>25% increase</strong> in staff productivity</li>
                    <li><strong>95% accuracy</strong> in patient data processing</li>
                </ul>
                
                <h3>Conclusion</h3>
                <p>Emma AI's intelligent automation solution transformed the hospital's operations, improving both patient satisfaction and staff efficiency. The success of this implementation demonstrates the power of AI in healthcare settings.</p>
            `,
            content_plain: 'Healthcare AI Implementation Success Story - How Emma AI transformed patient care through intelligent automation.',
            author_id: 1,
            author_name: 'Emma AI Team',
            industry_id: 1, // Healthcare
            tags: JSON.stringify(['Healthcare', 'AI Implementation', 'Case Study', 'Automation']),
            meta_title: 'Healthcare AI Implementation Success Story - Emma AI',
            meta_description: 'How Emma AI transformed patient care at a leading hospital through intelligent automation.',
            meta_keywords: 'healthcare AI, automation, case study, patient care, Emma AI',
            read_time: 7,
            word_count: 350,
            published_at: new Date()
        };

        await connection.execute(`
            INSERT IGNORE INTO resources (
                title, slug, type, status, excerpt, content, content_plain,
                author_id, author_name, industry_id, tags, meta_title, 
                meta_description, meta_keywords, read_time, word_count, published_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            sampleCaseStudy.title, sampleCaseStudy.slug, sampleCaseStudy.type, sampleCaseStudy.status,
            sampleCaseStudy.excerpt, sampleCaseStudy.content, sampleCaseStudy.content_plain,
            sampleCaseStudy.author_id, sampleCaseStudy.author_name, sampleCaseStudy.industry_id,
            sampleCaseStudy.tags, sampleCaseStudy.meta_title, sampleCaseStudy.meta_description,
            sampleCaseStudy.meta_keywords, sampleCaseStudy.read_time, sampleCaseStudy.word_count,
            sampleCaseStudy.published_at
        ]);

        await connection.end();
        console.log('✅ Sample data created');
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    const setup = new CMSSetup();
    setup.run();
}

module.exports = CMSSetup;
