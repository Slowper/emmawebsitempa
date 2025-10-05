const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
// SSR handler removed - using MPA instead
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
            scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "data:", "https:"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:3001", "http://localhost:3000", "https://unpkg.com"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"],
            upgradeInsecureRequests: []
        }
    }
}));
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8000'],
    credentials: true
}));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'emma-cms-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 30 * 60 * 1000 // 30 minutes
    }
}));

// Rate limiting - Optimized for development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Increased limit for development
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for localhost in development
        return req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    }
});
app.use('/api/', limiter);

// More lenient rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Allow more auth attempts
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/cms/uploads', express.static('uploads'));
app.use('/Logo And Recording', express.static('Logo And Recording'));
app.use('/Team Pics', express.static('Team Pics'));
app.use(express.static('public'));
app.use(express.static('.')); // Serve files from root directory (CSS, JS, etc.)

// Database connection with improved configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'emma_resources_cms',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    // MySQL specific settings
    charset: 'utf8mb4',
    timezone: 'Z'
};

// Create database pool asynchronously after server starts
let pool;
setTimeout(() => {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Database pool created');
}, 100);

// Database connection health check (disabled for instant startup)
const checkDatabaseConnection = async () => {
    if (!pool) return false;
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        return true;
    } catch (error) {
        return false;
    }
};

// Database health check endpoint
app.get('/api/health/database', async (req, res) => {
    try {
        const isHealthy = await checkDatabaseConnection();
        res.json({
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            message: isHealthy ? 'Database connection is working properly' : 'Database connection issues detected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = process.env.UPLOAD_PATH || './uploads';
        
        console.log('📁 Upload destination check:', {
            fieldname: file.fieldname,
            url: req.url,
            bodyType: req.body.type,
            contentType: req.body.content_type
        });
        
        // Special handling for different content types
        if (file.fieldname === 'logo') {
            uploadPath = path.join(uploadPath, 'logo');
        } else if (file.fieldname === 'blogImage' || file.fieldname === 'blogAuthorImage') {
            uploadPath = path.join(uploadPath, 'blogs');
            console.log('📁 Routing to blogs folder (direct blog fields)');
        } else if (file.fieldname === 'useCaseGallery') {
            uploadPath = path.join(uploadPath, 'usecases');
            console.log('📁 Routing to usecases folder (direct usecase fields)');
        } else if (file.fieldname === 'caseStudyImage' || file.fieldname === 'caseStudyGallery') {
            uploadPath = path.join(uploadPath, 'casestudies');
            console.log('📁 Routing to casestudies folder (direct casestudy fields)');
        } else if (req.url.includes('/resources')) {
            // For resources endpoint, try to determine content type
            const contentType = req.body.type || req.body.content_type || req.body.resource_type;
            
            if (contentType === 'blog' || contentType === 'Blog Post') {
                uploadPath = path.join(uploadPath, 'blogs');
                console.log('📁 Routing to blogs folder (detected blog type)');
            } else if (contentType === 'use-case' || contentType === 'Use Case') {
                uploadPath = path.join(uploadPath, 'usecases');
                console.log('📁 Routing to usecases folder (detected usecase type)');
            } else if (contentType === 'case-study' || contentType === 'Case Study') {
                uploadPath = path.join(uploadPath, 'casestudies');
                console.log('📁 Routing to casestudies folder (detected casestudy type)');
            } else {
                // Default to resources folder for unknown types
                uploadPath = path.join(uploadPath, 'resources');
                console.log('📁 Routing to resources folder (unknown type, default)');
            }
        } else if (file.fieldname === 'featured_image' || file.fieldname === 'author_image' || file.fieldname === 'gallery') {
            // Fallback for direct image uploads
            uploadPath = path.join(uploadPath, 'resources');
            console.log('📁 Routing to resources folder (fallback for image fields)');
        } else {
            // Default fallback
            uploadPath = path.join(uploadPath, 'resources');
            console.log('📁 Routing to resources folder (default fallback)');
        }
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Initialize database tables
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        
        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'editor') DEFAULT 'editor',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create content_sections table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS content_sections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                section_key VARCHAR(100) UNIQUE NOT NULL,
                section_name VARCHAR(200) NOT NULL,
                content_type ENUM('text', 'html', 'image', 'json') DEFAULT 'text',
                content LONGTEXT,
                image_url VARCHAR(500),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create website_settings table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS website_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) UNIQUE NOT NULL,
                setting_value LONGTEXT,
                setting_type ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
                description TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create media_files table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS media_files (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                original_name VARCHAR(255) NOT NULL,
                mimetype VARCHAR(100),
                size INT,
                file_path VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create resources table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS resources (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type ENUM('blog', 'case-study', 'use-case') NOT NULL,
                title VARCHAR(500) NOT NULL,
                excerpt TEXT,
                content LONGTEXT,
                author VARCHAR(200),
                authorImage VARCHAR(500),
                date DATE,
                tags JSON,
                industry VARCHAR(100),
                slug VARCHAR(500),
                image_url VARCHAR(500),
                readTime VARCHAR(50),
                status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create pricing_plans table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS pricing_plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                plan_name VARCHAR(100) NOT NULL,
                plan_description TEXT,
                plan_type ENUM('starter', 'professional', 'enterprise', 'custom') DEFAULT 'custom',
                price_amount VARCHAR(50) DEFAULT 'Custom',
                price_period VARCHAR(50) DEFAULT 'Contact Sales',
                is_featured BOOLEAN DEFAULT false,
                features JSON,
                button_text VARCHAR(100) DEFAULT 'Contact Sales',
                button_action VARCHAR(100) DEFAULT 'contact',
                display_order INT DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create pricing_sections table for section content
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS pricing_sections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                section_key VARCHAR(100) UNIQUE NOT NULL,
                section_name VARCHAR(200) NOT NULL,
                content_type ENUM('text', 'html', 'json') DEFAULT 'text',
                content LONGTEXT,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Insert default admin user if not exists
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
        if (users[0].count === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await connection.execute(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                ['admin', 'admin@emma.com', hashedPassword, 'admin']
            );
            console.log('Default admin user created: admin / admin123');
        }

        // Insert default content sections
        const defaultSections = [
            {
                section_key: 'hero_title',
                section_name: 'Hero Title',
                content_type: 'text',
                content: 'Meet Emma'
            },
            {
                section_key: 'hero_subtitle',
                section_name: 'Hero Subtitle',
                content_type: 'text',
                content: 'Your Intelligent AI Assistant'
            },
            {
                section_key: 'hero_description',
                section_name: 'Hero Description',
                content_type: 'text',
                content: 'Built to Power the Future of Operations'
            },
            {
                section_key: 'capabilities_title',
                section_name: 'Capabilities Section Title',
                content_type: 'text',
                content: "Emma's Core Capabilities"
            },
            {
                section_key: 'capabilities_subtitle',
                section_name: 'Capabilities Section Subtitle',
                content_type: 'text',
                content: 'Intelligent automation that adapts, learns, and takes initiative'
            },
            {
                section_key: 'industries_title',
                section_name: 'Industries Section Title',
                content_type: 'text',
                content: 'Industry Solutions'
            },
            {
                section_key: 'industries_subtitle',
                section_name: 'Industries Section Subtitle',
                content_type: 'text',
                content: 'Tailored AI agents for your specific industry needs'
            },
            {
                section_key: 'pricing_title',
                section_name: 'Pricing Section Title',
                content_type: 'text',
                content: 'Custom Pricing Plans'
            },
            {
                section_key: 'pricing_subtitle',
                section_name: 'Pricing Section Subtitle',
                content_type: 'text',
                content: 'Tailored solutions for every organization\'s unique needs'
            },
            {
                section_key: 'custom_solutions_title',
                section_name: 'Custom Solutions Title',
                content_type: 'text',
                content: 'Need a Custom Solution?'
            },
            {
                section_key: 'custom_solutions_description',
                section_name: 'Custom Solutions Description',
                content_type: 'text',
                content: 'Every organization is unique. Let\'s work together to create the perfect AI solution for your specific needs, industry requirements, and scale.'
            },
            {
                section_key: 'pricing_title',
                section_name: 'Pricing Section Title',
                content_type: 'text',
                content: 'Custom Pricing Plans'
            },
            {
                section_key: 'pricing_subtitle',
                section_name: 'Pricing Section Subtitle',
                content_type: 'text',
                content: 'Tailored solutions for every organization\'s unique needs'
            },
            {
                section_key: 'custom_solutions_title',
                section_name: 'Custom Solutions Title',
                content_type: 'text',
                content: 'Need a Custom Solution?'
            },
            {
                section_key: 'custom_solutions_description',
                section_name: 'Custom Solutions Description',
                content_type: 'text',
                content: 'Every organization is unique. Let\'s work together to create the perfect AI solution for your specific needs, industry requirements, and scale.'
            },
            {
                section_key: 'footer_company_description',
                section_name: 'Footer Company Description',
                content_type: 'text',
                content: 'Building the future of autonomous AI agents.'
            }
        ];

        for (const section of defaultSections) {
            await connection.execute(
                'INSERT IGNORE INTO content_sections (section_key, section_name, content_type, content) VALUES (?, ?, ?, ?)',
                [section.section_key, section.section_name, section.content_type, section.content]
            );
        }

        // Insert default pricing plans
        const defaultPricingPlans = [
            {
                plan_name: 'Starter',
                plan_description: 'Perfect for small teams getting started with AI automation',
                plan_type: 'starter',
                price_amount: 'Custom',
                price_period: 'Contact Sales',
                is_featured: false,
                features: JSON.stringify([
                    'Up to 1,000 conversations/month',
                    'Basic AI capabilities',
                    'Email & SMS integration',
                    'Standard support'
                ]),
                button_text: 'Contact Sales',
                button_action: 'contact',
                display_order: 1,
                is_active: true
            },
            {
                plan_name: 'Professional',
                plan_description: 'Advanced features for growing organizations',
                plan_type: 'professional',
                price_amount: 'Custom',
                price_period: 'Contact Sales',
                is_featured: true,
                features: JSON.stringify([
                    'Up to 10,000 conversations/month',
                    'Advanced AI capabilities',
                    'Multi-channel integration',
                    'Custom workflows',
                    'Priority support'
                ]),
                button_text: 'Contact Sales',
                button_action: 'contact',
                display_order: 2,
                is_active: true
            },
            {
                plan_name: 'Enterprise',
                plan_description: 'Complete solution for large organizations',
                plan_type: 'enterprise',
                price_amount: 'Custom',
                price_period: 'Contact Sales',
                is_featured: false,
                features: JSON.stringify([
                    'Unlimited conversations',
                    'Full AI customization',
                    'All integrations included',
                    'Dedicated account manager',
                    '24/7 premium support'
                ]),
                button_text: 'Contact Sales',
                button_action: 'contact',
                display_order: 3,
                is_active: true
            }
        ];

        for (const plan of defaultPricingPlans) {
            await connection.execute(
                'INSERT IGNORE INTO pricing_plans (plan_name, plan_description, plan_type, price_amount, price_period, is_featured, features, button_text, button_action, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [plan.plan_name, plan.plan_description, plan.plan_type, plan.price_amount, plan.price_period, plan.is_featured, plan.features, plan.button_text, plan.button_action, plan.display_order, plan.is_active]
            );
        }

        // Insert sample resources data
        const sampleResources = [
            {
                type: 'blog',
                title: 'The Future of AI in Healthcare Operations',
                excerpt: 'Discover how AI is transforming healthcare operations, from patient care coordination to administrative automation.',
                content: 'Full blog content about AI in healthcare...',
                author: 'Dr. Sarah Johnson',
                authorImage: '/Team Pics/Shikha.png',
                date: '2024-01-15',
                tags: JSON.stringify(['Healthcare', 'AI', 'Automation']),
                industry: 'healthcare',
                slug: 'future-ai-healthcare-operations',
                image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop&crop=center',
                readTime: '5 min read',
                status: 'published'
            },
            {
                type: 'blog',
                title: 'Banking AI: Revolutionizing Customer Experience',
                excerpt: 'Learn how intelligent automation is reshaping banking operations and improving customer satisfaction.',
                content: 'Full blog content about banking AI...',
                author: 'Michael Chen',
                authorImage: '/Team Pics/Ravi.jpeg',
                date: '2024-01-10',
                tags: JSON.stringify(['Banking', 'Customer Experience', 'AI']),
                industry: 'banking',
                slug: 'banking-ai-revolutionizing-customer-experience',
                image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&crop=center',
                readTime: '7 min read',
                status: 'published'
            },
            {
                type: 'case-study',
                title: 'Regional Hospital: 40% Reduction in Admin Time',
                excerpt: 'How a regional hospital implemented Emma AI to streamline patient scheduling and reduce administrative overhead.',
                content: 'Full case study content...',
                author: 'Healthcare Team',
                authorImage: '/Team Pics/Radha.webp',
                date: '2024-01-08',
                tags: JSON.stringify(['Healthcare', 'Case Study', 'ROI']),
                industry: 'healthcare',
                slug: 'regional-hospital-40-percent-reduction-admin-time',
                image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop&crop=center',
                readTime: '10 min read',
                status: 'published'
            },
            {
                type: 'use-case',
                title: 'Intelligent Customer Support Automation',
                excerpt: 'Learn how to implement AI-powered customer support that handles 80% of inquiries automatically.',
                content: 'Full use case content...',
                author: 'Multi-Industry Team',
                authorImage: '/Team Pics/Jay.webp',
                date: '2024-01-05',
                tags: JSON.stringify(['Customer Support', 'Automation', 'AI']),
                industry: 'retail',
                slug: 'intelligent-customer-support-automation',
                image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop&crop=center',
                readTime: '8 min read',
                status: 'published'
            },
            {
                type: 'blog',
                title: 'AI in Education: Personalized Learning at Scale',
                excerpt: 'Explore how AI is enabling personalized learning experiences and administrative efficiency in education.',
                content: 'Full blog content about AI in education...',
                author: 'Dr. Emily Rodriguez',
                authorImage: '/Team Pics/Suman.avif',
                date: '2024-01-12',
                tags: JSON.stringify(['Education', 'AI', 'Learning']),
                industry: 'education',
                slug: 'ai-education-personalized-learning-scale',
                image_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop&crop=center',
                readTime: '6 min read',
                status: 'published'
            },
            {
                type: 'case-study',
                title: 'National Bank: 60% Faster Loan Processing',
                excerpt: 'A major bank\'s journey to automate loan processing and improve customer experience with AI.',
                content: 'Full case study content...',
                author: 'Banking Team',
                authorImage: '/Team Pics/Shree.jpeg',
                date: '2024-01-06',
                tags: JSON.stringify(['Banking', 'Case Study', 'Automation']),
                industry: 'banking',
                slug: 'national-bank-60-percent-faster-loan-processing',
                image_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop&crop=center',
                readTime: '12 min read',
                status: 'published'
            },
            {
                type: 'use-case',
                title: 'Manufacturing Quality Control Automation',
                excerpt: 'Implement AI-powered quality control systems that reduce defects by 85% in manufacturing.',
                content: 'Full use case content...',
                author: 'Manufacturing Team',
                authorImage: '/Team Pics/Mohith.png',
                date: '2024-01-03',
                tags: JSON.stringify(['Manufacturing', 'Quality Control', 'AI']),
                industry: 'manufacturing',
                slug: 'manufacturing-quality-control-automation',
                image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=200&fit=crop&crop=center',
                readTime: '9 min read',
                status: 'published'
            },
            {
                type: 'blog',
                title: 'Financial Services: AI-Powered Risk Assessment',
                excerpt: 'How financial institutions are using AI to improve risk assessment and compliance.',
                content: 'Full blog content about financial services AI...',
                author: 'Finance Team',
                authorImage: '/Team Pics/Prasad.webp',
                date: '2024-01-01',
                tags: JSON.stringify(['Finance', 'Risk Assessment', 'AI']),
                industry: 'finance',
                slug: 'financial-services-ai-powered-risk-assessment',
                image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&crop=center',
                readTime: '11 min read',
                status: 'published'
            }
        ];

        // Insert sample resources
        for (const resource of sampleResources) {
            await connection.execute(
                'INSERT IGNORE INTO resources (type, title, excerpt, content, author, authorImage, date, tags, industry, slug, image_url, readTime, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [resource.type, resource.title, resource.excerpt, resource.content, resource.author, resource.authorImage, resource.date, resource.tags, resource.industry, resource.slug, resource.image_url, resource.readTime, resource.status]
            );
        }

        connection.release();
        console.log('Database initialized successfully with sample resources');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// API Routes

// Endpoint to increment the view count for a resource
app.post('/api/resources/:slug/view', async (req, res) => {
    try {
        const { slug } = req.params;
        console.log('📊 View count increment request for slug:', slug);

        // Atomically update the view count in the database
        // Try slug first, then ID if slug doesn't exist
        let [result] = await pool.execute(
            'UPDATE resources SET view_count = view_count + 1 WHERE slug = ?',
            [slug]
        );
        
        // If no rows affected by slug, try as ID
        if (result.affectedRows === 0) {
            [result] = await pool.execute(
                'UPDATE resources SET view_count = view_count + 1 WHERE id = ?',
                [slug]
            );
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        console.log('✅ View count incremented for slug:', slug);
        res.json({ success: true, message: 'View count updated.' });
    } catch (error) {
        console.error('❌ Error updating view count:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Debug endpoint to check database and users
app.get('/api/debug/users', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, username, email, role, created_at FROM users');
        res.json({ 
            success: true, 
            userCount: rows.length, 
            users: rows,
            message: 'Database connection working'
        });
    } catch (error) {
        console.error('Debug users error:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
});

// Reset admin password endpoint
app.post('/api/debug/reset-password', async (req, res) => {
    try {
        const newPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await pool.execute(
            'UPDATE users SET password = ? WHERE username = ?',
            [hashedPassword, 'admin']
        );
        
        console.log('✅ Admin password reset to: admin123');
        res.json({ 
            success: true, 
            message: 'Admin password reset to: admin123',
            username: 'admin',
            password: 'admin123'
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Password reset failed', details: error.message });
    }
});

// Rate limit reset endpoint for development
app.post('/api/debug/reset-rate-limit', (req, res) => {
    // This doesn't actually reset the rate limit, but provides info
    res.json({ 
        success: true, 
        message: 'Rate limit info: 1000 requests per 15 minutes for /api/, 50 for /api/auth/',
        suggestion: 'Wait a few minutes or restart the server to reset rate limits'
    });
});

// Create resources table endpoint
app.post('/api/debug/create-resources-table', async (req, res) => {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS resources (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type ENUM('blog', 'case-study', 'use-case') NOT NULL,
                title VARCHAR(500) NOT NULL,
                excerpt TEXT,
                content LONGTEXT,
                author VARCHAR(200),
                date DATE,
                tags JSON,
                status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        res.json({ success: true, message: 'Resources table created successfully' });
    } catch (error) {
        console.error('Table creation error:', error);
        res.status(500).json({ error: 'Failed to create resources table', details: error.message });
    }
});

// Enhanced API endpoints for the new website structure
app.get('/api/hero', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM content_sections WHERE section_key = ?', ['hero_title']);
        const heroData = rows.length > 0 ? (() => {
            try {
                return JSON.parse(rows[0].content || '{}');
            } catch (e) {
                return { title: rows[0].content || "Meet Emma", subtitle: "Intelligent AI Assistant" };
            }
        })() : {
            title: "Transform Your Operations with Emma AI",
            subtitle: "Intelligent automation solutions for Healthcare, Banking, Education, and more",
            ctaText: "Get Started",
            ctaLink: "/contact"
        };
        res.json(heroData);
    } catch (error) {
        console.error('Hero endpoint error:', error);
        res.status(500).json({ error: 'Failed to load hero data' });
    }
});

app.put('/api/hero', async (req, res) => {
    try {
        const heroData = req.body;
        await pool.execute(
            'INSERT INTO content_sections (section_key, section_name, content, content_type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)',
            ['hero_title', 'Hero Section', JSON.stringify(heroData), 'json']
        );
        res.json({ success: true, message: 'Hero data saved successfully' });
    } catch (error) {
        console.error('Hero save error:', error);
        res.status(500).json({ error: 'Failed to save hero data' });
    }
});

app.get('/api/navigation', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM content_sections WHERE section_key = ?', ['navigation_links']);
        const navData = rows.length > 0 ? (() => {
            try {
                return JSON.parse(rows[0].content || '{}');
            } catch (e) {
                return { links: [] };
            }
        })() : { 
            links: [
                { name: "Home", url: "/" },
                { name: "About", url: "/about" },
                { name: "Pricing", url: "/pricing" },
                { name: "Resources", url: "/resources" },
                { name: "Contact", url: "/contact" }
            ]
        };
        res.json(navData);
    } catch (error) {
        console.error('Navigation endpoint error:', error);
        res.status(500).json({ error: 'Failed to load navigation data' });
    }
});

app.put('/api/navigation', async (req, res) => {
    try {
        const navData = req.body;
        await pool.execute(
            'INSERT INTO content_sections (section_key, section_name, content, content_type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)',
            ['navigation_links', 'Navigation Links', JSON.stringify(navData), 'json']
        );
        res.json({ success: true, message: 'Navigation data saved successfully' });
    } catch (error) {
        console.error('Navigation save error:', error);
        res.status(500).json({ error: 'Failed to save navigation data' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        console.log('📊 Loading dashboard stats...');
        
        // Use the retry mechanism for database queries
        const publishedRows = await executeWithRetry('SELECT COUNT(*) as count FROM resources WHERE status = "published"');
        const draftRows = await executeWithRetry('SELECT COUNT(*) as count FROM resources WHERE status = "draft"');
        const blogRows = await executeWithRetry('SELECT COUNT(*) as count FROM resources WHERE type = "blog" AND status = "published"');
        const caseStudyRows = await executeWithRetry('SELECT COUNT(*) as count FROM resources WHERE type = "case-study" AND status = "published"');
        const useCaseRows = await executeWithRetry('SELECT COUNT(*) as count FROM resources WHERE type = "use-case" AND status = "published"');
        const userRows = await executeWithRetry('SELECT COUNT(*) as count FROM users');
        
        // Get total views from view_count column
        const viewsRows = await executeWithRetry('SELECT SUM(COALESCE(view_count, 0)) as total FROM resources');
        const totalViews = viewsRows[0].total || 0;
        
        const stats = {
            total_published: publishedRows[0].count,
            total_drafts: draftRows[0].count,
            views_last_30_days: totalViews, // Using total views for now
            total_blogs: blogRows[0].count,
            total_case_studies: caseStudyRows[0].count,
            total_use_cases: useCaseRows[0].count,
            total_users: userRows[0].count,
            last_updated: new Date().toISOString()
        };
        
        console.log('📊 Stats calculated:', stats);
        res.json(stats);
    } catch (error) {
        console.error('Stats endpoint error:', error);
        res.status(500).json({ 
            error: 'Failed to load stats',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Database connection timeout'
        });
    }
});

// Media management endpoints
app.get('/api/media', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM media_files ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Media endpoint error:', error);
        res.status(500).json({ error: 'Failed to load media files' });
    }
});

app.post('/api/media/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const fileData = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        };
        
        await pool.execute(
            'INSERT INTO media_files (filename, original_name, mimetype, size, file_path) VALUES (?, ?, ?, ?, ?)',
            [fileData.filename, fileData.originalName, fileData.mimetype, fileData.size, fileData.path]
        );
        
        res.json({ success: true, file: fileData });
    } catch (error) {
        console.error('Media upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// SEO endpoints
app.get('/api/seo', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM content_sections WHERE section_key = ?', ['seo_settings']);
        const seoData = rows.length > 0 ? JSON.parse(rows[0].content || '{}') : {
            title: "Emma AI - Intelligent Automation Solutions",
            description: "Transform your operations with Emma AI's intelligent automation platform",
            keywords: "AI, automation, healthcare, banking, education"
        };
        res.json(seoData);
    } catch (error) {
        console.error('SEO endpoint error:', error);
        res.status(500).json({ error: 'Failed to load SEO data' });
    }
});

app.put('/api/seo', async (req, res) => {
    try {
        const seoData = req.body;
        await pool.execute(
            'INSERT INTO content_sections (section_key, section_name, content, content_type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)',
            ['seo_settings', 'SEO Settings', JSON.stringify(seoData), 'json']
        );
        res.json({ success: true, message: 'SEO data saved successfully' });
    } catch (error) {
        console.error('SEO save error:', error);
        res.status(500).json({ error: 'Failed to save SEO data' });
    }
});

// Theme endpoints
app.get('/api/theme', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM content_sections WHERE section_key = ?', ['theme_settings']);
        const themeData = rows.length > 0 ? JSON.parse(rows[0].content || '{}') : {
            primaryColor: '#3b82f6',
            secondaryColor: '#8b5cf6',
            accentColor: '#10b981'
        };
        res.json(themeData);
    } catch (error) {
        console.error('Theme endpoint error:', error);
        res.status(500).json({ error: 'Failed to load theme data' });
    }
});

app.put('/api/theme', async (req, res) => {
    try {
        const themeData = req.body;
        await pool.execute(
            'INSERT INTO content_sections (section_key, section_name, content, content_type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)',
            ['theme_settings', 'Theme Settings', JSON.stringify(themeData), 'json']
        );
        res.json({ success: true, message: 'Theme data saved successfully' });
    } catch (error) {
        console.error('Theme save error:', error);
        res.status(500).json({ error: 'Failed to save theme data' });
    }
});

// Settings endpoints
app.get('/api/settings', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM website_settings');
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json(settings);
    } catch (error) {
        console.error('Settings endpoint error:', error);
        res.status(500).json({ error: 'Failed to load settings' });
    }
});

app.put('/api/settings', async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            await pool.execute(
                'INSERT INTO website_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
                [key, value]
            );
        }
        res.json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
        console.error('Settings save error:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// Features endpoints
app.get('/api/features', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM content_sections WHERE section_key = ?', ['features_list']);
        const features = rows.length > 0 ? JSON.parse(rows[0].content || '{}') : { features: [] };
        res.json(features);
    } catch (error) {
        console.error('Features endpoint error:', error);
        res.status(500).json({ error: 'Failed to load features' });
    }
});

app.put('/api/features', async (req, res) => {
    try {
        const features = req.body;
        await pool.execute(
            'INSERT INTO content_sections (section_key, section_name, content, content_type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)',
            ['features_list', 'Features List', JSON.stringify(features), 'json']
        );
        res.json({ success: true, message: 'Features saved successfully' });
    } catch (error) {
        console.error('Features save error:', error);
        res.status(500).json({ error: 'Failed to save features' });
    }
});

// About endpoints
app.get('/api/about', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM content_sections WHERE section_key = ?', ['about_content']);
        const aboutData = rows.length > 0 ? JSON.parse(rows[0].content || '{}') : {
            title: "About Emma AI",
            content: "Revolutionizing operations through intelligent automation"
        };
        res.json(aboutData);
    } catch (error) {
        console.error('About endpoint error:', error);
        res.status(500).json({ error: 'Failed to load about data' });
    }
});

app.put('/api/about', async (req, res) => {
    try {
        const aboutData = req.body;
        await pool.execute(
            'INSERT INTO content_sections (section_key, section_name, content, content_type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = VALUES(content)',
            ['about_content', 'About Content', JSON.stringify(aboutData), 'json']
        );
        res.json({ success: true, message: 'About data saved successfully' });
    } catch (error) {
        console.error('About save error:', error);
        res.status(500).json({ error: 'Failed to save about data' });
    }
});

// Helper function for database queries with retry logic
const executeWithRetry = async (query, params = [], maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error(`Database query attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Wait before retry (exponential backoff)
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Resources endpoints
app.get('/api/resources', async (req, res) => {
    try {
        const { type, status, limit, sort, order } = req.query;
        
        let query = `
            SELECT r.id, r.type, r.title, r.excerpt, r.content, r.author, r.date, r.tags, r.status, 
                   r.created_at, r.updated_at, r.featured_image as image_url, r.author_image as authorImage, 
                   r.gallery, r.industry_id, r.meta_title, r.meta_description, r.meta_keywords, 
                   r.read_time, r.slug, r.view_count, i.name as industry_name
            FROM resources r
            LEFT JOIN industries i ON r.industry_id = i.id
        `;
        
        const conditions = [];
        const params = [];
        
        if (type) {
            conditions.push('r.type = ?');
            params.push(type);
        }
        
        if (status) {
            conditions.push('r.status = ?');
            params.push(status);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ` ORDER BY r.${sort || 'created_at'} ${order || 'DESC'}`;
        
        if (limit) {
            query += ` LIMIT ${parseInt(limit)}`;
        }
        
        const rows = await executeWithRetry(query, params);
        
        // Clean up Quill editor artifacts from content
        const cleanedRows = rows.map(row => ({
            ...row,
            content: cleanQuillContent(row.content)
        }));
        
        // Return consistent format
        res.json({
            resources: cleanedRows,
            total: cleanedRows.length,
            success: true
        });
    } catch (error) {
        console.error('Resources endpoint error:', error);
        res.status(500).json({ 
            error: 'Failed to load resources',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Database connection timeout'
        });
    }
});

// Industries endpoints
app.get('/api/industries', async (req, res) => {
    try {
        const rows = await executeWithRetry(`
            SELECT id, name, slug, description, color, icon, is_active, sort_order, created_at, updated_at
            FROM industries 
            WHERE is_active = 1
            ORDER BY sort_order ASC, name ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Industries endpoint error:', error);
        res.status(500).json({ 
            error: 'Failed to load industries',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Database connection timeout'
        });
    }
});

app.post('/api/industries', authenticateToken, async (req, res) => {
    try {
        const { name, description, color, icon, sort_order } = req.body;
        
        if (!name) {
            return res.status(400).json({ 
                success: false, 
                error: 'Industry name is required' 
            });
        }

        // Generate slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');

        const [result] = await pool.execute(`
            INSERT INTO industries (name, slug, description, color, icon, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [name, slug, description || '', color || '#3b82f6', icon || '', sort_order || 0]);

        res.json({ 
            success: true, 
            message: 'Industry created successfully',
            id: result.insertId 
        });
    } catch (error) {
        console.error('Industry creation error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create industry', 
            details: error.message 
        });
    }
});

app.put('/api/industries/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, color, icon, sort_order, is_active } = req.body;
        
        if (!name) {
            return res.status(400).json({ 
                success: false, 
                error: 'Industry name is required' 
            });
        }

        // Generate slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');

        await pool.execute(`
            UPDATE industries SET 
                name = ?, slug = ?, description = ?, color = ?, icon = ?, 
                sort_order = ?, is_active = ?, updated_at = NOW()
            WHERE id = ?
        `, [name, slug, description || '', color || '#3b82f6', icon || '', sort_order || 0, is_active !== undefined ? is_active : 1, id]);

        res.json({ 
            success: true, 
            message: 'Industry updated successfully' 
        });
    } catch (error) {
        console.error('Industry update error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update industry', 
            details: error.message 
        });
    }
});

app.delete('/api/industries/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if industry is being used by any resources
        const [resources] = await pool.execute('SELECT COUNT(*) as count FROM resources WHERE industry_id = ?', [id]);
        
        if (resources[0].count > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Cannot delete industry that is being used by resources. Please reassign resources first.' 
            });
        }
        
        await pool.execute('DELETE FROM industries WHERE id = ?', [id]);
        
        res.json({ 
            success: true, 
            message: 'Industry deleted successfully' 
        });
    } catch (error) {
        console.error('Industry deletion error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete industry', 
            details: error.message 
        });
    }
});

// Add image_url column to resources table if it doesn't exist
app.post('/api/resources/add-image-column', async (req, res) => {
    try {
        await pool.execute(`
            ALTER TABLE resources 
            ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) NULL
        `);
        res.json({ success: true, message: 'Image URL column added to resources table' });
    } catch (error) {
        console.error('Column addition error:', error);
        res.status(500).json({ error: 'Failed to add image column' });
    }
});

// Resource image upload endpoint
app.post('/api/resources/upload-image', authenticateToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        
        const imageUrl = `/cms/uploads/resources/${req.file.filename}`;
        res.json({ 
            message: 'Resource image uploaded successfully',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Resource image upload error:', error);
        res.status(500).json({ error: 'Failed to upload resource image' });
    }
});

app.post('/api/resources', authenticateToken, upload.fields([
    { name: 'featured_image', maxCount: 1 },
    { name: 'author_image', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
]), async (req, res) => {
    try {
        // Post-process uploaded files to ensure they're in the correct folder
        const contentType = req.body.type || req.body.content_type || req.body.resource_type;
        const files = req.files;
        
        console.log('🔍 Post-processing files:', {
            contentType,
            hasFiles: !!files,
            fileFields: files ? Object.keys(files) : []
        });
        
        if (files && contentType) {
            const correctFolder = contentType === 'blog' || contentType === 'Blog Post' ? 'blogs' :
                                contentType === 'use-case' || contentType === 'Use Case' ? 'usecases' :
                                contentType === 'case-study' || contentType === 'Case Study' ? 'casestudies' :
                                'resources';
            
            console.log(`📁 Determined correct folder: ${correctFolder}`);
            
            // Move files to correct folder if they're in the wrong place
            for (const fieldName in files) {
                const fileList = files[fieldName];
                for (const file of fileList) {
                    const currentPath = file.path;
                    const fileName = path.basename(currentPath);
                    const correctPath = path.join(process.env.UPLOAD_PATH || './uploads', correctFolder, fileName);
                    
                    console.log(`📁 Processing file: ${fileName}`);
                    console.log(`   Current path: ${currentPath}`);
                    console.log(`   Correct path: ${correctPath}`);
                    
                    if (currentPath !== correctPath) {
                        try {
                            // Ensure target directory exists
                            const targetDir = path.dirname(correctPath);
                            if (!fs.existsSync(targetDir)) {
                                fs.mkdirSync(targetDir, { recursive: true });
                            }
                            
                            // Move file
                            fs.renameSync(currentPath, correctPath);
                            file.path = correctPath;
                            console.log(`✅ Moved ${fileName} to ${correctFolder} folder`);
                        } catch (moveError) {
                            console.error(`❌ Error moving file ${fileName}:`, moveError);
                        }
                    } else {
                        console.log(`✅ File ${fileName} already in correct location`);
                    }
                }
            }
        } else {
            console.log('⚠️  No files or content type to process');
        }
        
        const {
            title,
            type,
            excerpt,
            content,
            author,
            industry_id,
            tags,
            meta_title,
            meta_description,
            meta_keywords,
            status = 'draft'
        } = req.body;

        if (!title || !type || !content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Title, type, and content are required' 
            });
        }

        // Generate slug from title
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');

        // Extract plain text from content for reading time calculation
        const contentPlain = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const readTime = Math.max(1, Math.ceil(contentPlain.split(' ').length / 200));

        // Handle image uploads
        let featuredImagePath = '';
        let authorImagePath = '';
        let galleryArray = [];

        if (req.files.featured_image) {
            // Use the actual file path after post-processing
            const filePath = req.files.featured_image[0].path;
            featuredImagePath = filePath.replace(process.env.UPLOAD_PATH || './uploads', '/uploads');
        }

        if (req.files.author_image) {
            // Use the actual file path after post-processing
            const filePath = req.files.author_image[0].path;
            authorImagePath = filePath.replace(process.env.UPLOAD_PATH || './uploads', '/uploads');
        }

        if (req.files.gallery) {
            galleryArray = req.files.gallery.map(file => {
                const filePath = file.path;
                return filePath.replace(process.env.UPLOAD_PATH || './uploads', '/uploads');
            });
        }

        // Parse tags
        const tagsArray = tags ? JSON.parse(tags) : [];

        // Handle industry_id - convert empty string to NULL
        const industryId = industry_id && industry_id.trim() !== '' ? parseInt(industry_id) : null;

        const [result] = await pool.execute(`
            INSERT INTO resources (
                type, title, slug, excerpt, content, author, industry_id, featured_image, 
                author_image, gallery, tags, meta_title, meta_description, 
                meta_keywords, status, read_time, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            type, title, slug, excerpt, content, author, industryId, featuredImagePath,
            authorImagePath, JSON.stringify(galleryArray), JSON.stringify(tagsArray),
            meta_title, meta_description, meta_keywords, status, readTime
        ]);

        res.json({ 
            success: true, 
            message: 'Resource created successfully',
            id: result.insertId 
        });
    } catch (error) {
        console.error('Resource creation error:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create resource', 
            details: error.message 
        });
    }
});

app.get('/api/resources/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT *, view_count FROM resources WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        // Clean up Quill editor artifacts from content
        const cleanedRow = {
            ...rows[0],
            content: cleanQuillContent(rows[0].content)
        };
        
        res.json(cleanedRow);
    } catch (error) {
        console.error('Resource fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch resource' });
    }
});

// CMS-specific resource update endpoint - only accessible from CMS interface
app.put('/api/cms/resources/:id', authenticateToken, upload.fields([
    { name: 'featured_image', maxCount: 1 },
    { name: 'author_image', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            type,
            excerpt,
            content,
            author,
            industry_id,
            tags,
            meta_title,
            meta_description,
            meta_keywords,
            status
        } = req.body;

        if (!title || !type || !content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Title, type, and content are required' 
            });
        }

        // Generate slug from title
        const slug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');

        // Extract plain text from content for reading time calculation
        const contentPlain = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const readTime = Math.max(1, Math.ceil(contentPlain.split(' ').length / 200));

        // Get existing resource data
        const [existingRows] = await pool.execute('SELECT featured_image, author_image, gallery FROM resources WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }

        const existing = existingRows[0];

        // Handle image uploads - keep existing if no new ones provided
        let featuredImagePath = existing.featured_image || '';
        let authorImagePath = existing.author_image || '';
        let galleryArray = existing.gallery ? JSON.parse(existing.gallery) : [];

        if (req.files.featured_image) {
            // Use the actual file path after post-processing
            const filePath = req.files.featured_image[0].path;
            featuredImagePath = filePath.replace(process.env.UPLOAD_PATH || './uploads', '/uploads');
        }

        if (req.files.author_image) {
            // Use the actual file path after post-processing
            const filePath = req.files.author_image[0].path;
            authorImagePath = filePath.replace(process.env.UPLOAD_PATH || './uploads', '/uploads');
        }

        if (req.files.gallery) {
            galleryArray = req.files.gallery.map(file => {
                const filePath = file.path;
                return filePath.replace(process.env.UPLOAD_PATH || './uploads', '/uploads');
            });
        }

        // Parse tags
        const tagsArray = tags ? JSON.parse(tags) : [];

        // Handle industry_id - convert empty string to NULL
        const industryId = industry_id && industry_id.trim() !== '' ? parseInt(industry_id) : null;

        await pool.execute(`
            UPDATE resources SET 
                type = ?, title = ?, slug = ?, excerpt = ?, content = ?, author = ?, industry_id = ?, 
                featured_image = ?, author_image = ?, gallery = ?, tags = ?, 
                meta_title = ?, meta_description = ?, meta_keywords = ?, 
                status = ?, read_time = ?, updated_at = NOW()
            WHERE id = ?
        `, [
            type, title, slug, excerpt, content, author, industryId,
            featuredImagePath, authorImagePath, JSON.stringify(galleryArray), JSON.stringify(tagsArray),
            meta_title, meta_description, meta_keywords, status, readTime, id
        ]);

        res.json({ 
            success: true, 
            message: 'Resource updated successfully' 
        });
    } catch (error) {
        console.error('Resource update error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to update resource',
            details: error.message 
        });
    }
});

app.delete('/api/resources/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // First, get the resource details to clean up files
        const [resources] = await pool.execute('SELECT featured_image, author_image, gallery FROM resources WHERE id = ?', [id]);
        
        if (resources.length > 0) {
            const resource = resources[0];
            const uploadPath = process.env.UPLOAD_PATH || './uploads';
            
            // Clean up featured image
            if (resource.featured_image) {
                const imagePath = path.join(uploadPath, resource.featured_image.replace('/uploads/', ''));
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log(`🗑️  Deleted featured image: ${imagePath}`);
                }
            }
            
            // Clean up author image
            if (resource.author_image) {
                const imagePath = path.join(uploadPath, resource.author_image.replace('/uploads/', ''));
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log(`🗑️  Deleted author image: ${imagePath}`);
                }
            }
            
            // Clean up gallery images
            if (resource.gallery) {
                try {
                    const galleryImages = JSON.parse(resource.gallery);
                    if (Array.isArray(galleryImages)) {
                        galleryImages.forEach(imagePath => {
                            const fullPath = path.join(uploadPath, imagePath.replace('/uploads/', ''));
                            if (fs.existsSync(fullPath)) {
                                fs.unlinkSync(fullPath);
                                console.log(`🗑️  Deleted gallery image: ${fullPath}`);
                            }
                        });
                    }
                } catch (parseError) {
                    console.log('Gallery images not in JSON format, skipping cleanup');
                }
            }
        }
        
        // Delete from database
        await pool.execute('DELETE FROM resources WHERE id = ?', [id]);
        res.json({ success: true, message: 'Resource and associated files deleted successfully' });
    } catch (error) {
        console.error('Resource deletion error:', error);
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

// Industries endpoint
app.get('/api/industries', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM industries ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching industries:', error);
        res.status(500).json({ error: 'Failed to fetch industries' });
    }
});

// Tags endpoint
app.get('/api/tags', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM tags ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// Blog endpoints
app.get('/api/blogs', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not ready yet' });
        }
        const [rows] = await pool.execute(`
            SELECT id, title, excerpt, content, author, status, created_at, updated_at,
                   featured_image as image_url, author_image as authorImage, gallery, view_count
            FROM resources 
            WHERE type = 'blog' AND status = 'published' 
            ORDER BY created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Blogs endpoint error:', error);
        res.status(500).json({ 
            error: 'Failed to load blogs',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Database connection timeout'
        });
    }
});

// Use cases endpoints
app.get('/api/usecases', async (req, res) => {
    try {
        const rows = await executeWithRetry(`
            SELECT r.*, r.view_count, i.name as industry_name
            FROM resources r
            LEFT JOIN industries i ON r.industry_id = i.id
            WHERE r.type = "use-case" 
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Use cases endpoint error:', error);
        res.status(500).json({ 
            error: 'Failed to load use cases',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Database connection timeout'
        });
    }
});

// Case studies endpoints
app.get('/api/casestudies', async (req, res) => {
    try {
        const rows = await executeWithRetry(`
            SELECT r.*, r.view_count, i.name as industry_name
            FROM resources r
            LEFT JOIN industries i ON r.industry_id = i.id
            WHERE r.type = "case-study" 
            ORDER BY r.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Case studies endpoint error:', error);
        res.status(500).json({ 
            error: 'Failed to load case studies',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Database connection timeout'
        });
    }
});

// Individual case study endpoint with view tracking
app.get('/api/casestudies/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        console.log('📊 Fetching case study:', slug);

        // Try to find by slug first, then by ID
        let rows = await executeWithRetry(`
            SELECT r.*, r.view_count, i.name as industry_name
            FROM resources r
            LEFT JOIN industries i ON r.industry_id = i.id
            WHERE r.type = "case-study" AND r.slug = ?
        `, [slug]);

        // If not found by slug, try by ID
        if (rows.length === 0) {
            rows = await executeWithRetry(`
                SELECT r.*, r.view_count, i.name as industry_name
                FROM resources r
                LEFT JOIN industries i ON r.industry_id = i.id
                WHERE r.type = "case-study" AND r.id = ?
            `, [slug]);
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Case study not found' });
        }

        const caseStudy = rows[0];
        
        // Increment view count
        try {
            await pool.execute(
                'UPDATE resources SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?',
                [caseStudy.id]
            );
            console.log('✅ View count incremented for case study:', caseStudy.id);
        } catch (viewError) {
            console.error('❌ Error incrementing view count:', viewError);
        }

        // Return the case study data with updated view count
        caseStudy.view_count = (caseStudy.view_count || 0) + 1;
        res.json(caseStudy);
    } catch (error) {
        console.error('Case study endpoint error:', error);
        res.status(500).json({ 
            error: 'Failed to load case study',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Database connection timeout'
        });
    }
});

// Individual use case endpoint with view tracking
app.get('/api/usecases/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        console.log('📊 Fetching use case:', slug);

        // Try to find by slug first, then by ID
        let rows = await executeWithRetry(`
            SELECT r.*, r.view_count, i.name as industry_name
            FROM resources r
            LEFT JOIN industries i ON r.industry_id = i.id
            WHERE r.type = "use-case" AND r.slug = ?
        `, [slug]);

        // If not found by slug, try by ID
        if (rows.length === 0) {
            rows = await executeWithRetry(`
                SELECT r.*, r.view_count, i.name as industry_name
                FROM resources r
                LEFT JOIN industries i ON r.industry_id = i.id
                WHERE r.type = "use-case" AND r.id = ?
            `, [slug]);
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Use case not found' });
        }

        const useCase = rows[0];
        
        // Increment view count
        try {
            await pool.execute(
                'UPDATE resources SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?',
                [useCase.id]
            );
            console.log('✅ View count incremented for use case:', useCase.id);
        } catch (viewError) {
            console.error('❌ Error incrementing view count:', viewError);
        }

        // Return the use case data with updated view count
        useCase.view_count = (useCase.view_count || 0) + 1;
        res.json(useCase);
    } catch (error) {
        console.error('Use case endpoint error:', error);
        res.status(500).json({ 
            error: 'Failed to load use case',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Database connection timeout'
        });
    }
});

// Authentication routes
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ 
        message: 'Token is valid',
        user: req.user 
    });
});

app.get('/api/content/auth/verify', authenticateToken, (req, res) => {
    res.json({ 
        message: 'Token is valid',
        user: req.user 
    });
});

app.post('/api/content/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Login attempt:', { username, password: password ? '[PROVIDED]' : '[MISSING]' });
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        console.log('Database query result:', { userCount: rows.length, users: rows.map(u => ({ id: u.id, username: u.username, email: u.email, role: u.role })) });

        if (rows.length === 0) {
            console.log('No user found with username/email:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        console.log('Password validation:', { isValid: isValidPassword, hashedPassword: user.password ? '[EXISTS]' : '[MISSING]' });

        if (!isValidPassword) {
            console.log('Password mismatch for user:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Content management routes

// Hero section endpoint
app.get('/api/content/hero', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM content_sections WHERE section_key IN (?, ?, ?) AND is_active = true',
            ['hero_title', 'hero_subtitle', 'hero_description']
        );
        
        const heroData = {
            title: '',
            subtitle: '',
            description: '',
            primaryButton: {
                text: 'See Emma in Action',
                href: '#demo'
            },
            secondaryButton: {
                text: 'Learn More',
                href: '#about',
                show: true
            }
        };
        
        rows.forEach(row => {
            switch(row.section_key) {
                case 'hero_title':
                    heroData.title = row.content;
                    break;
                case 'hero_subtitle':
                    heroData.subtitle = row.content;
                    break;
                case 'hero_description':
                    heroData.description = row.content;
                    break;
            }
        });
        
        res.json(heroData);
    } catch (error) {
        console.error('Error fetching hero section:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Navigation endpoint
app.get('/api/content/navigation', async (req, res) => {
    try {
        const navData = {
            links: [
                { text: 'Home', href: '#home' },
                { text: 'About Us', href: '#about' },
                { text: 'Pricing', href: '#pricing' },
                { text: 'Resources', href: '#resources' },
                { text: 'Sign In', href: '#signin' }
            ]
        };
        res.json(navData);
    } catch (error) {
        console.error('Error fetching navigation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Banners endpoint
app.get('/api/content/banners', async (req, res) => {
    try {
        const banners = [];
        res.json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Sections endpoint
app.get('/api/content/sections', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM content_sections WHERE is_active = true ORDER BY section_name'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching sections:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/content/section/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const [rows] = await pool.execute(
            'SELECT * FROM content_sections WHERE section_key = ? AND is_active = true',
            [key]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Section not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching section:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/content/section/:key', authenticateToken, async (req, res) => {
    try {
        const { key } = req.params;
        const { content, content_type } = req.body;
        
        const [result] = await pool.execute(
            'UPDATE content_sections SET content = ?, content_type = ?, updated_at = CURRENT_TIMESTAMP WHERE section_key = ?',
            [content, content_type || 'text', key]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Section not found' });
        }
        
        res.json({ message: 'Content updated successfully' });
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/content/section', authenticateToken, async (req, res) => {
    try {
        const { section_key, section_name, content_type, content } = req.body;
        
        if (!section_key || !section_name) {
            return res.status(400).json({ error: 'Section key and name are required' });
        }
        
        const [result] = await pool.execute(
            'INSERT INTO content_sections (section_key, section_name, content_type, content) VALUES (?, ?, ?, ?)',
            [section_key, section_name, content_type || 'text', content || '']
        );
        
        res.json({ 
            message: 'Section created successfully',
            id: result.insertId 
        });
    } catch (error) {
        console.error('Error creating section:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Section key already exists' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Image upload route
app.post('/api/upload/image', authenticateToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        
        const imageUrl = `/cms/uploads/${req.file.filename}`;
        res.json({ 
            message: 'Image uploaded successfully',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Update section with image
app.put('/api/content/section/:key/image', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { key } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        
        const imageUrl = `/cms/uploads/${req.file.filename}`;
        
        const [result] = await pool.execute(
            'UPDATE content_sections SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE section_key = ?',
            [imageUrl, key]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Section not found' });
        }
        
        res.json({ 
            message: 'Image updated successfully',
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Blog API routes
app.get('/api/blogs', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id, title, category, author, excerpt, content, image, authorImage, 
                   gallery, created_at, updated_at, status
            FROM blogs 
            WHERE status = 'published' 
            ORDER BY created_at DESC
        `);
        
        const blogs = rows.map(blog => ({
            ...blog,
            gallery: blog.gallery ? (() => {
                try {
                    return JSON.parse(blog.gallery);
                } catch (e) {
                    return [];
                }
            })() : []
        }));
        
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/blogs/:id', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not ready yet' });
        }
        
        const { id } = req.params;
        
        // Check if id is numeric (direct ID lookup) or a slug
        const isNumericId = /^\d+$/.test(id);
        
        let query, params;
        if (isNumericId) {
            // Direct ID lookup
            query = `
                SELECT id, title, excerpt, content, author, status, created_at, updated_at,
                       featured_image as image_url, author_image as authorImage, gallery
                FROM resources 
                WHERE id = ? AND type = 'blog' AND status = 'published'
            `;
            params = [id];
        } else {
            // Slug-based lookup - create slug from title
            query = `
                SELECT id, title, excerpt, content, author, status, created_at, updated_at,
                       featured_image as image_url, author_image as authorImage, gallery
                FROM resources 
                WHERE type = 'blog' AND status = 'published'
            `;
            params = [];
        }
        
        const [rows] = await pool.execute(query, params);
        
        let blog = null;
        if (isNumericId) {
            blog = rows[0];
        } else {
            // Find blog by matching slug
            blog = rows.find(row => {
                const slug = row.title
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim();
                return slug === id;
            });
        }
        
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        const blogData = {
            ...blog,
            featured_image: blog.image_url,
            published_date: blog.created_at,
            gallery: blog.gallery ? (() => {
                try {
                    return JSON.parse(blog.gallery);
                } catch (e) {
                    return [];
                }
            })() : []
        };
        
        res.json(blogData);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/blogs', authenticateToken, upload.fields([
    { name: 'blogImage', maxCount: 1 },
    { name: 'blogAuthorImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, category, author, excerpt, content, gallery } = req.body;
        
        if (!title || !category || !author || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        let imagePath = '';
        let authorImagePath = '';
        
        if (req.files.blogImage) {
            imagePath = `/cms/uploads/blogs/${req.files.blogImage[0].filename}`;
        }
        
        if (req.files.blogAuthorImage) {
            authorImagePath = `/cms/uploads/blogs/${req.files.blogAuthorImage[0].filename}`;
        }
        
        const galleryArray = gallery ? gallery.split('\n').filter(url => url.trim()) : [];
        
        // Clean the content to remove Quill editor artifacts
        const cleanContent = content; // Temporarily disable cleaning to test
        
        const [result] = await pool.execute(`
            INSERT INTO blogs (title, category, author, excerpt, content, image, authorImage, gallery, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())
        `, [title, category, author, excerpt, cleanContent, imagePath, authorImagePath, JSON.stringify(galleryArray)]);
        
        res.json({ 
            message: 'Blog created successfully', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Blog update endpoint removed for security - blog updates must be done through CMS only
// This prevents direct API access to blog updates, ensuring all content changes go through the CMS interface

app.delete('/api/blogs/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.execute('DELETE FROM blogs WHERE id = ?', [id]);
        
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running updated code', timestamp: new Date().toISOString() });
});

// Use Cases API routes - removed duplicate, using the one above

app.post('/api/usecases', authenticateToken, upload.fields([
    { name: 'useCaseGallery', maxCount: 10 }
]), async (req, res) => {
    try {
        const { title, industry, icon, description, tags, stats, detailedContent, gallery } = req.body;
        
        if (!title || !industry || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        let galleryArray = [];
        if (req.files.useCaseGallery) {
            galleryArray = req.files.useCaseGallery.map(file => `/cms/uploads/usecases/${file.filename}`);
        } else if (gallery) {
            galleryArray = gallery.split('\n').filter(url => url.trim());
        }
        
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
        const statsArray = stats ? JSON.parse(stats) : [];
        
        const [result] = await pool.execute(`
            INSERT INTO use_cases (title, description, industry, stats, gallery, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'published', NOW(), NOW())
        `, [title, description, industry, JSON.stringify(statsArray), JSON.stringify(galleryArray)]);
        
        res.json({ 
            message: 'Use case created successfully', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Error creating use case:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Use case update endpoint removed for security - use case updates must be done through CMS only
// This prevents direct API access to use case updates, ensuring all content changes go through the CMS interface

app.delete('/api/usecases/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.execute('DELETE FROM use_cases WHERE id = ?', [id]);
        
        res.json({ message: 'Use case deleted successfully' });
    } catch (error) {
        console.error('Error deleting use case:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Case Studies API routes
app.get('/api/casestudies', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id, title, client, industry, summary, results, tags, 
                   created_at, updated_at, status
            FROM case_studies 
            WHERE status = 'published' 
            ORDER BY created_at DESC
        `);
        
        const caseStudies = rows.map(caseStudy => ({
            ...caseStudy,
            results: caseStudy.results ? (() => {
                try {
                    return JSON.parse(caseStudy.results);
                } catch (e) {
                    return [];
                }
            })() : [],
            tags: caseStudy.tags ? (() => {
                try {
                    return JSON.parse(caseStudy.tags);
                } catch (e) {
                    return [];
                }
            })() : [],
            published: caseStudy.status === 'published',
            date: caseStudy.created_at
        }));
        
        res.json(caseStudies);
    } catch (error) {
        console.error('Error fetching case studies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/casestudies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(`
            SELECT id, title, client, industry, summary, results, tags, 
                   created_at, updated_at, status
            FROM case_studies 
            WHERE id = ? AND status = 'published'
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Case study not found' });
        }
        
        const caseStudy = {
            ...rows[0],
            results: rows[0].results ? JSON.parse(rows[0].results) : [],
            tags: rows[0].tags ? JSON.parse(rows[0].tags) : [],
            published: rows[0].status === 'published',
            date: rows[0].created_at
        };
        
        res.json(caseStudy);
    } catch (error) {
        console.error('Error fetching case study:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/casestudies', authenticateToken, upload.fields([
    { name: 'caseStudyImage', maxCount: 1 },
    { name: 'caseStudyGallery', maxCount: 10 }
]), async (req, res) => {
    try {
        const { title, client, industry, date, summary, tags, results, content, gallery } = req.body;
        
        if (!title || !client || !industry) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        let galleryArray = [];
        if (req.files.caseStudyGallery) {
            galleryArray = req.files.caseStudyGallery.map(file => `/cms/uploads/casestudies/${file.filename}`);
        } else if (gallery) {
            galleryArray = gallery.split('\n').filter(url => url.trim());
        }
        
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
        const resultsArray = results ? JSON.parse(results) : [];
        
        const [result] = await pool.execute(`
            INSERT INTO case_studies (title, client, industry, summary, results, tags, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())
        `, [title, client, industry, summary, JSON.stringify(resultsArray), JSON.stringify(tagsArray)]);
        
        res.json({ 
            message: 'Case study created successfully', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Error creating case study:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Case study update endpoint removed for security - case study updates must be done through CMS only
// This prevents direct API access to case study updates, ensuring all content changes go through the CMS interface

app.delete('/api/casestudies/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.execute('DELETE FROM case_studies WHERE id = ?', [id]);
        
        res.json({ message: 'Case study deleted successfully' });
    } catch (error) {
        console.error('Error deleting case study:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Pricing content endpoint (for dynamic content system)
app.get('/api/content/pricing', async (req, res) => {
    try {
        // Get pricing section content
        const [sectionRows] = await pool.execute(
            'SELECT * FROM content_sections WHERE section_key IN (?, ?) AND is_active = true',
            ['pricing_title', 'pricing_subtitle']
        );
        
        // Get pricing plans
        const [planRows] = await pool.execute(`
            SELECT * FROM pricing_plans 
            WHERE is_active = true 
            ORDER BY display_order ASC
        `);
        
        const plans = planRows.map(plan => ({
            id: plan.plan_type || 'plan',
            name: plan.plan_name || 'Plan Name',
            price: plan.price_amount || 'Contact Us',
            period: plan.price_period || 'per month',
            featured: plan.is_featured || false,
            features: plan.features ? (() => {
                try {
                    return JSON.parse(plan.features);
                } catch (e) {
                    return [];
                }
            })() : [],
            buttonText: plan.button_text || 'Contact Sales'
        }));
        
        // Get custom solutions content
        const [customRows] = await pool.execute(
            'SELECT * FROM content_sections WHERE section_key IN (?, ?) AND is_active = true',
            ['custom_solutions_title', 'custom_solutions_description']
        );
        
        const customSolutions = {
            title: 'Need a Custom Solution?',
            description: 'Every organization is unique. Let\'s work together to create the perfect AI solution for your specific needs, industry requirements, and scale.',
            features: [
                'Tailored AI capabilities',
                'Industry-specific customization',
                'Scalable architecture',
                'Dedicated support team'
            ]
        };
        
        customRows.forEach(row => {
            if (row.section_key === 'custom_solutions_title') {
                customSolutions.title = row.content;
            } else if (row.section_key === 'custom_solutions_description') {
                customSolutions.description = row.content;
            }
        });
        
        const pricingData = {
            title: 'Custom Pricing Plans',
            subtitle: 'Tailored solutions for every organization\'s unique needs',
            plans: plans,
            customSolutions: customSolutions
        };
        
        // Update title and subtitle from database
        sectionRows.forEach(row => {
            if (row.section_key === 'pricing_title') {
                pricingData.title = row.content;
            } else if (row.section_key === 'pricing_subtitle') {
                pricingData.subtitle = row.content;
            }
        });
        
        res.json(pricingData);
    } catch (error) {
        console.error('Error fetching pricing content:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/pricing/plans', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT * FROM pricing_plans 
            WHERE is_active = true 
            ORDER BY display_order ASC
        `);
        
        const plans = rows.map(plan => ({
            ...plan,
            features: plan.features ? (() => {
                try {
                    return JSON.parse(plan.features);
                } catch (e) {
                    return [];
                }
            })() : []
        }));
        
        res.json(plans);
    } catch (error) {
        console.error('Error fetching pricing plans:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/pricing/plan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(
            'SELECT * FROM pricing_plans WHERE id = ? AND is_active = true',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pricing plan not found' });
        }
        
        const plan = {
            ...rows[0],
            features: rows[0].features ? (() => {
                try {
                    return JSON.parse(rows[0].features);
                } catch (e) {
                    return [];
                }
            })() : []
        };
        
        res.json(plan);
    } catch (error) {
        console.error('Error fetching pricing plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/pricing/plan', authenticateToken, async (req, res) => {
    try {
        const { plan_name, plan_description, plan_type, price_amount, price_period, is_featured, features, button_text, button_action, display_order } = req.body;
        
        if (!plan_name) {
            return res.status(400).json({ error: 'Plan name is required' });
        }
        
        const [result] = await pool.execute(`
            INSERT INTO pricing_plans (plan_name, plan_description, plan_type, price_amount, price_period, is_featured, features, button_text, button_action, display_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
        `, [plan_name, plan_description, plan_type || 'custom', price_amount || 'Custom', price_period || 'Contact Sales', is_featured || false, JSON.stringify(features || []), button_text || 'Contact Sales', button_action || 'contact', display_order || 0]);
        
        res.json({ 
            message: 'Pricing plan created successfully', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Error creating pricing plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Pricing plan update endpoint removed for security - pricing plan updates must be done through CMS only
// This prevents direct API access to pricing plan updates, ensuring all content changes go through the CMS interface

app.delete('/api/pricing/plan/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.execute('DELETE FROM pricing_plans WHERE id = ?', [id]);
        
        res.json({ message: 'Pricing plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting pricing plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Pricing sections API
app.get('/api/pricing/sections', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT * FROM pricing_sections 
            WHERE is_active = true 
            ORDER BY section_name
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching pricing sections:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/pricing/section/:key', authenticateToken, async (req, res) => {
    try {
        const { key } = req.params;
        const { content, content_type } = req.body;
        
        const [result] = await pool.execute(
            'UPDATE pricing_sections SET content = ?, content_type = ?, updated_at = CURRENT_TIMESTAMP WHERE section_key = ?',
            [content, content_type || 'text', key]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pricing section not found' });
        }
        
        res.json({ message: 'Pricing section updated successfully' });
    } catch (error) {
        console.error('Error updating pricing section:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Website settings routes
app.get('/api/settings', async (req, res) => {
    try {
        console.log('Fetching website settings...');
        const [rows] = await pool.execute('SELECT * FROM website_settings');
        console.log('Settings rows:', rows);
        
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = {
                value: row.setting_value,
                type: row.setting_type,
                description: row.description
            };
        });
        
        console.log('Settings object:', settings);
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/settings/:key', authenticateToken, async (req, res) => {
    try {
        const { key } = req.params;
        const { value, type } = req.body;
        
        console.log(`Updating setting ${key} with value:`, value);
        
        const [result] = await pool.execute(
            'INSERT INTO website_settings (setting_key, setting_value, setting_type) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), setting_type = VALUES(setting_type), updated_at = CURRENT_TIMESTAMP',
            [key, value, type || 'text']
        );
        
        console.log('Setting updated successfully');
        res.json({ message: 'Setting updated successfully' });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logo upload endpoint
app.post('/api/upload/logo', authenticateToken, upload.single('logo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No logo file uploaded' });
        }
        
        const logoUrl = `/cms/uploads/logo/${req.file.filename}`;
        console.log('Logo uploaded:', logoUrl);
        
        res.json({ 
            message: 'Logo uploaded successfully',
            url: logoUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error uploading logo:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Media API routes
app.get('/api/content/media', async (req, res) => {
    try {
        // This is a simple implementation - in production you'd want to store media metadata in database
        const mediaFiles = [];
        res.json(mediaFiles);
    } catch (error) {
        console.error('Error fetching media files:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/content/media/upload', authenticateToken, upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        
        const uploadedFiles = req.files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.originalname,
            url: `/cms/uploads/${file.filename}`,
            size: file.size,
            type: file.mimetype
        }));
        
        res.json({ 
            message: 'Files uploaded successfully',
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

app.delete('/api/content/media/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;
        // In production, you'd delete the actual file and remove from database
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve uploaded files
app.use('/cms/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

// Serve manifest.json
app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

// SSR Routes removed - using MPA instead

// MPA Routes - Serve individual pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'home.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'about.html'));
});

app.get('/pricing', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'pricing.html'));
});

app.get('/resources', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'resources.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'contact.html'));
});

app.get('/schedule-demo', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'schedule-demo.html'));
});

// Enhanced Resource Routes with SEO-friendly URLs
// SEO-friendly blog URLs
app.get('/blog/:slug', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).sendFile(path.join(__dirname, 'pages', '404.html'));
        }
        
        const { slug } = req.params;
        console.log('🔍 Blog route hit with slug:', slug);
        
        let [rows] = [];
        
        // Check if slug is numeric (direct ID lookup)
        const isNumericId = /^\d+$/.test(slug);
        
        if (isNumericId) {
            // Try to find by ID first
            try {
                [rows] = await pool.execute(
                    `SELECT id, title, excerpt, content, author, status, created_at, updated_at,
                            featured_image as image_url, author_image as authorImage, gallery, view_count
                     FROM resources 
                     WHERE id = ? AND type = 'blog' AND status = "published"`,
                    [slug]
                );
                console.log('📝 Found by ID:', rows.length);
            } catch (error) {
                console.log('❌ Error finding blog by ID:', error.message);
                [rows] = [];
            }
        } else {
            // Try to find by slug match (generate slug from title and compare)
            try {
                // Add retry logic for database timeouts
                let retries = 3;
                while (retries > 0) {
                    try {
                        [rows] = await pool.execute(
                            `SELECT id, title, excerpt, content, author, status, created_at, updated_at,
                                    featured_image as image_url, author_image as authorImage, gallery, view_count
                             FROM resources 
                             WHERE type = 'blog' AND status = "published"`,
                            []
                        );
                        break; // Success, exit retry loop
                    } catch (dbError) {
                        retries--;
                        if (retries === 0) throw dbError;
                        console.log(`🔄 Database timeout, retrying... (${retries} attempts left)`);
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                    }
                }
                
                // Find blog by matching slug
                const blog = rows.find(row => {
                    const generatedSlug = row.title
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim();
                    
                    // Check if the provided slug matches the generated slug
                    // Also handle cases where slug might be duplicated or have extra characters
                    return generatedSlug === slug || 
                           slug.includes(generatedSlug) || 
                           generatedSlug.includes(slug.replace(/-+/g, '-'));
                });
                
                if (blog) {
                    rows = [blog];
                    console.log('📝 Found by slug match:', blog.title);
                } else {
                    rows = [];
                    console.log('❌ No blog found matching slug:', slug);
                }
            } catch (error) {
                console.log('❌ Error finding blog by slug:', error.message);
                [rows] = [];
            }
        }
        
        if (!rows || rows.length === 0) {
            console.log('❌ No blog found for slug:', slug);
            return res.status(404).sendFile(path.join(__dirname, 'pages', '404.html'));
        }
        
        const blog = rows[0];
        console.log('✅ Blog found:', blog.title);
        console.log('📸 Author image:', blog.authorImage);
        console.log('📸 Author image type:', typeof blog.authorImage);
        console.log('📸 Full blog object keys:', Object.keys(blog));
        console.log('📝 Content length:', blog.content ? blog.content.length : 'No content');
        console.log('📝 Content preview:', blog.content ? blog.content.substring(0, 200) + '...' : 'No content');
        
        // Increment view count
        try {
            await pool.execute(
                'UPDATE resources SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?',
                [blog.id]
            );
            console.log('📊 View count incremented for blog:', blog.title);
        } catch (error) {
            console.error('❌ Error incrementing view count:', error);
        }
        console.log('📝 Excerpt:', blog.excerpt ? blog.excerpt.substring(0, 100) + '...' : 'No excerpt');
        console.log('🔍 View count value:', blog.view_count, 'Type:', typeof blog.view_count);
        
        // Read the blog detail HTML template
        const blogTemplate = fs.readFileSync(path.join(__dirname, 'pages', 'blog-detail.html'), 'utf8');
        
        // Replace placeholders with actual blog data
        let renderedHtml = blogTemplate
            .replace('<title id="page-title">Blog Post - Emma AI</title>', `<title id="page-title">${blog.title} - Emma AI</title>`)
            .replace('content="Read our latest insights on AI automation and intelligent workflows."', `content="${(blog.excerpt || blog.content.substring(0, 160)).replace(/"/g, '&quot;')}"`)
            .replace('<h1 class="article-title" id="article-title">Loading...</h1>', `<h1 class="article-title" id="article-title">${blog.title}</h1>`)
            .replace('<div class="article-excerpt" id="article-excerpt">Loading excerpt...</div>', `<div class="article-excerpt" id="article-excerpt">${blog.excerpt || ''}</div>`)
            .replace('Loading content...', cleanQuillContent(blog.content))
            .replace('<span id="author-name">Emma AI Team</span>', `<span id="author-name">${blog.author || 'Emma AI Team'}</span>`)
            .replace(/<div class="author-avatar" id="author-avatar">E<\/div>/, (() => {
                if (blog.authorImage) {
                    const imageUrl = blog.authorImage.startsWith('/') ? blog.authorImage : '/' + blog.authorImage;
                    return `<div class="author-avatar" id="author-avatar"><img src="${imageUrl}" alt="${blog.author || 'Author'}" /></div>`;
                } else {
                    return `<div class="author-avatar" id="author-avatar">${(blog.author || 'E').charAt(0).toUpperCase()}</div>`;
                }
            })())
            .replace('<span id="article-date">Loading...</span>', `<span id="article-date">${new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>`)
            .replace('<span id="view-count-number">0</span>', `<span id="view-count-number">${blog.view_count || 0}</span>`)
            .replace('<!-- DEBUG: view_count -->', `<!-- DEBUG: view_count = ${blog.view_count} -->`)
            .replace('<body>', `<body data-view-count="${blog.view_count || 0}" data-blog-id="${blog.id}">`)
            .replace('<img class="article-image" id="article-image" src="" alt="" style="display: none;">', `<img class="article-image" id="article-image" src="${blog.image_url ? (blog.image_url.startsWith('/') ? blog.image_url : '/' + blog.image_url) : ''}" alt="${blog.title}" style="${blog.image_url ? 'display: block;' : 'display: none;'}">`)
            .replace('<div class="loading-state" id="loading-state">', '<div class="loading-state" id="loading-state" style="display: none;">')
            .replace('<div id="article-content" style="display: none;">', '<div id="article-content" style="display: block;">');
        
        res.send(renderedHtml);
    } catch (error) {
        console.error('Error serving blog:', error);
        res.status(500).sendFile(path.join(__dirname, 'pages', '404.html'));
    }
});

// API endpoint to get current blog data
app.get('/api/blog/current', async (req, res) => {
    try {
        if (!req.session || !req.session.currentBlog) {
            return res.status(404).json({ error: 'No blog data found' });
        }
        
        res.json(req.session.currentBlog);
    } catch (error) {
        console.error('Error getting current blog:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// SEO-friendly case study URLs
app.get('/casestudy/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Try to find by ID first (since slug column might not exist yet)
        let [rows] = await pool.execute(
            'SELECT * FROM resources WHERE id = ? AND type = "case-study" AND status = "published"',
            [slug]
        );
        
        // If not found by ID, try to find by slug (if column exists)
        if (rows.length === 0) {
            try {
                [rows] = await pool.execute(
                    'SELECT * FROM resources WHERE slug = ? AND type = "case-study" AND status = "published"',
                    [slug]
                );
            } catch (slugError) {
                // If slug column doesn't exist, just continue with empty results
                console.log('Slug column not available, using ID-based lookup only');
            }
        }
        
        if (rows.length === 0) {
            return res.status(404).sendFile(path.join(__dirname, 'pages', '404.html'));
        }
        
        const caseStudy = rows[0];
        
        // Increment view count
        try {
            await pool.execute(
                'UPDATE resources SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?',
                [caseStudy.id]
            );
            console.log('📊 View count incremented for case study:', caseStudy.title);
        } catch (error) {
            console.error('❌ Error incrementing view count:', error);
        }
        
        // Serve the static case study detail page
        res.sendFile(path.join(__dirname, 'pages', 'case-study-detail.html'));
    } catch (error) {
        console.error('Error serving case study:', error);
        res.status(500).sendFile(path.join(__dirname, 'pages', '404.html'));
    }
});

// SEO-friendly use case URLs
app.get('/usecase/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Try to find by ID first (since slug column might not exist yet)
        let [rows] = await pool.execute(
            'SELECT * FROM resources WHERE id = ? AND type = "use-case" AND status = "published"',
            [slug]
        );
        
        // If not found by ID, try to find by slug (if column exists)
        if (rows.length === 0) {
            try {
                [rows] = await pool.execute(
                    'SELECT * FROM resources WHERE slug = ? AND type = "use-case" AND status = "published"',
                    [slug]
                );
            } catch (slugError) {
                // If slug column doesn't exist, just continue with empty results
                console.log('Slug column not available, using ID-based lookup only');
            }
        }
        
        if (rows.length === 0) {
            return res.status(404).sendFile(path.join(__dirname, 'pages', '404.html'));
        }
        
        const useCase = rows[0];
        
        // Increment view count
        try {
            await pool.execute(
                'UPDATE resources SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?',
                [useCase.id]
            );
            console.log('📊 View count incremented for use case:', useCase.title);
        } catch (error) {
            console.error('❌ Error incrementing view count:', error);
        }
        
        // Serve the static use case detail page
        res.sendFile(path.join(__dirname, 'pages', 'use-case-detail.html'));
    } catch (error) {
        console.error('Error serving use case:', error);
        res.status(500).sendFile(path.join(__dirname, 'pages', '404.html'));
    }
});

// Legacy routes for backward compatibility - removed duplicate redirect

// Remove duplicate redirects - these were causing infinite loops

// SPA fallback removed - using MPA only

// CMS Admin Routes
app.get('/cms-admin-local.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms/admin/cms-admin-local.html'));
});

app.get('/cms-admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms/admin/cms-admin.html'));
});

app.get('/cms-admin-standalone.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms/admin/cms-admin-standalone.html'));
});

app.get('/cms-blogs.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms/admin/cms-blogs.html'));
});

app.get('/cms-case-studies.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms/admin/cms-case-studies.html'));
});

app.get('/cms-resources.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms/admin/cms-resources.html'));
});

app.get('/cms-use-cases.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms/admin/cms-use-cases.html'));
});

// Serve CMS admin JavaScript
app.get('/cms-admin.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms/admin/cms-admin.js'));
});

// Serve Quill editor files
app.get('/quill/:file', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms/quill', req.params.file));
});

// Old admin dashboard removed - using new CMS at port 3001

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Helper function to generate SEO-friendly slugs
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim('-'); // Remove leading/trailing hyphens
}

// Helper function to clean Quill editor artifacts from content
function cleanQuillContent(content) {
    if (!content) return content;
    
    let cleanContent = content;
    
    // Only remove actual Quill editor artifacts, not the main content
    cleanContent = cleanContent
        .replace(/<div class="ql-clipboard"[^>]*>[\s\S]*?<\/div>/g, '')
        .replace(/<div class="ql-tooltip[^>]*>[\s\S]*?<\/div>/g, '')
        .replace(/<input[^>]*data-formula[^>]*>/g, '')
        .replace(/<a class="ql-preview"[^>]*>[\s\S]*?<\/a>/g, '')
        .replace(/<a class="ql-action"[^>]*>[\s\S]*?<\/a>/g, '')
        .replace(/<a class="ql-remove"[^>]*>[\s\S]*?<\/a>/g, '')
        // Only remove specific Quill toolbar elements, not content
        .replace(/<div class="ql-toolbar"[^>]*>[\s\S]*?<\/div>/g, '')
        .replace(/<div class="ql-container"[^>]*>[\s\S]*?<\/div>/g, '');
    
    return cleanContent;
}

// Function to update existing resources with slugs
async function updateResourcesWithSlugs() {
    try {
        console.log('🔄 Updating resources with SEO-friendly slugs...');
        
        // Get all resources without slugs
        const [rows] = await pool.execute(
            'SELECT id, title FROM resources WHERE slug IS NULL OR slug = ""'
        );
        
        for (const resource of rows) {
            const slug = generateSlug(resource.title);
            await pool.execute(
                'UPDATE resources SET slug = ? WHERE id = ?',
                [slug, resource.id]
            );
            console.log(`✅ Updated resource ${resource.id}: "${resource.title}" -> "${slug}"`);
        }
        
        console.log(`✅ Updated ${rows.length} resources with slugs`);
    } catch (error) {
        console.error('❌ Error updating resources with slugs:', error);
    }
}

// Page Generation Functions
function generateBlogPage(blog) {
    let tags = [];
    try {
        tags = blog.tags && blog.tags !== '' ? JSON.parse(blog.tags) : [];
    } catch (error) {
        console.log('⚠️ Error parsing tags, using empty array:', error.message);
        tags = [];
    }
    const formattedDate = new Date(blog.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${blog.title} - Emma AI Blog</title>
    <meta name="description" content="${blog.excerpt}">
    <meta property="og:title" content="${blog.title}">
    <meta property="og:description" content="${blog.excerpt}">
    <meta property="og:image" content="${blog.featured_image || '/Logo And Recording/cropped_circle_image.png'}">
    <link rel="canonical" href="https://emma.kodefast.com/blog/${blog.id}">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
    <style>
        body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; margin: 0; }
        .navbar { position: fixed; top: 0; left: 0; width: 100%; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); z-index: 1000; padding: 1rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.3); }
        .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { display: flex; align-items: center; gap: 0.75rem; }
        .logo-container { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; }
        .logo-image { width: 24px; height: 24px; object-fit: cover; }
        .nav-links { display: flex; list-style: none; margin: 0; padding: 0; gap: 2rem; }
        .nav-links a { color: #94a3b8; text-decoration: none; font-weight: 500; transition: color 0.3s ease; }
        .nav-links a:hover { color: #3b82f6; }
        .blog-container { max-width: 800px; margin: 0 auto; padding: 8rem 2rem 4rem; }
        .blog-header { margin-bottom: 3rem; }
        .blog-title { font-size: 3rem; font-weight: 800; margin-bottom: 1rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.1; }
        .blog-meta { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; color: #94a3b8; }
        .author-info { display: flex; align-items: center; gap: 0.5rem; }
        .author-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
        .author-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .blog-image { width: 100%; height: 500px; object-fit: contain; border-radius: 1rem; margin-bottom: 2rem; }
        .blog-content { font-size: 1.1rem; line-height: 1.8; color: #cbd5e1; }
        .blog-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 2rem; }
        .tag { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 0.5rem 1rem; border-radius: 2rem; font-size: 0.9rem; font-weight: 500; }
        .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: #3b82f6; text-decoration: none; margin-bottom: 2rem; }
        .back-link:hover { color: #60a5fa; }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <div class="logo-container">
                    <img src="/Logo And Recording/cropped_circle_image.png" alt="Emma AI Logo" class="logo-image">
                </div>
                <span style="font-weight: 700; color: #f8fafc;">Emma AI</span>
            </div>
            <ul class="nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/pricing">Pricing</a></li>
                <li><a href="/resources">Resources</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <div class="blog-container">
        <a href="/resources" class="back-link">
            <i class="fas fa-arrow-left"></i>
            Back to Resources
        </a>
        
        <div class="blog-header">
            <h1 class="blog-title">${blog.title}</h1>
            <div class="blog-meta">
                <div class="author-info">
                    <div class="author-avatar">
                        ${blog.author_image ? 
                            `<img src="${blog.author_image}" alt="${blog.author}" onerror="this.parentElement.innerHTML='${blog.author.split(' ').map(n => n[0]).join('').toUpperCase()}'">` : 
                            blog.author.split(' ').map(n => n[0]).join('').toUpperCase()
                        }
                    </div>
                    <span>${blog.author}</span>
                </div>
                <span>•</span>
                <span>${formattedDate}</span>
                <span>•</span>
                <span>${blog.read_time || '5 min read'}</span>
            </div>
        </div>

        ${blog.featured_image ? `<img src="${blog.featured_image}" alt="${blog.title}" class="blog-image">` : ''}
        
        <div class="blog-content">
            ${cleanQuillContent(blog.content || blog.excerpt)}
        </div>

        <div class="blog-tags">
            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    </div>
</body>
</html>`;
}

function generateCaseStudyPage(caseStudy) {
    const tags = caseStudy.tags ? JSON.parse(caseStudy.tags) : [];
    const formattedDate = new Date(caseStudy.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${caseStudy.title} - Emma AI Case Study</title>
    <meta name="description" content="${caseStudy.excerpt}">
    <meta property="og:title" content="${caseStudy.title}">
    <meta property="og:description" content="${caseStudy.excerpt}">
    <meta property="og:image" content="${caseStudy.image_url || '/Logo And Recording/cropped_circle_image.png'}">
    <link rel="canonical" href="https://emma.kodefast.com/casestudy/${caseStudy.id}">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
    <style>
        body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; margin: 0; }
        .navbar { position: fixed; top: 0; left: 0; width: 100%; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); z-index: 1000; padding: 1rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.3); }
        .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { display: flex; align-items: center; gap: 0.75rem; }
        .logo-container { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; }
        .logo-image { width: 24px; height: 24px; object-fit: cover; }
        .nav-links { display: flex; list-style: none; margin: 0; padding: 0; gap: 2rem; }
        .nav-links a { color: #94a3b8; text-decoration: none; font-weight: 500; transition: color 0.3s ease; }
        .nav-links a:hover { color: #3b82f6; }
        .case-study-container { max-width: 800px; margin: 0 auto; padding: 8rem 2rem 4rem; }
        .case-study-header { margin-bottom: 3rem; }
        .case-study-title { font-size: 3rem; font-weight: 800; margin-bottom: 1rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.1; }
        .case-study-meta { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; color: #94a3b8; }
        .author-info { display: flex; align-items: center; gap: 0.5rem; }
        .author-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
        .author-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .case-study-image { width: 100%; height: 400px; object-fit: cover; border-radius: 1rem; margin-bottom: 2rem; }
        .case-study-content { font-size: 1.1rem; line-height: 1.8; color: #cbd5e1; }
        .case-study-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 2rem; }
        .tag { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 0.5rem 1rem; border-radius: 2rem; font-size: 0.9rem; font-weight: 500; }
        .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: #3b82f6; text-decoration: none; margin-bottom: 2rem; }
        .back-link:hover { color: #60a5fa; }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <div class="logo-container">
                    <img src="/Logo And Recording/cropped_circle_image.png" alt="Emma AI Logo" class="logo-image">
                </div>
                <span style="font-weight: 700; color: #f8fafc;">Emma AI</span>
            </div>
            <ul class="nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/pricing">Pricing</a></li>
                <li><a href="/resources">Resources</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <div class="case-study-container">
        <a href="/resources" class="back-link">
            <i class="fas fa-arrow-left"></i>
            Back to Resources
        </a>
        
        <div class="case-study-header">
            <h1 class="case-study-title">${caseStudy.title}</h1>
            <div class="case-study-meta">
                <div class="author-info">
                    <div class="author-avatar">
                        ${caseStudy.authorImage ? 
                            `<img src="${caseStudy.authorImage}" alt="${caseStudy.author}" onerror="this.parentElement.innerHTML='${caseStudy.author.split(' ').map(n => n[0]).join('').toUpperCase()}'">` : 
                            caseStudy.author.split(' ').map(n => n[0]).join('').toUpperCase()
                        }
                    </div>
                    <span>${caseStudy.author}</span>
                </div>
                <span>•</span>
                <span>${formattedDate}</span>
                <span>•</span>
                <span>${caseStudy.readTime || '10 min read'}</span>
            </div>
        </div>

        ${caseStudy.image_url ? `<img src="${caseStudy.image_url}" alt="${caseStudy.title}" class="case-study-image">` : ''}
        
        <div class="case-study-content">
            ${cleanQuillContent(caseStudy.content || caseStudy.excerpt)}
        </div>

        <div class="case-study-tags">
            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    </div>
</body>
</html>`;
}

function generateUseCasePage(useCase) {
    const tags = useCase.tags ? JSON.parse(useCase.tags) : [];
    const formattedDate = new Date(useCase.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${useCase.title} - Emma AI Use Case</title>
    <meta name="description" content="${useCase.excerpt}">
    <meta property="og:title" content="${useCase.title}">
    <meta property="og:description" content="${useCase.excerpt}">
    <meta property="og:image" content="${useCase.image_url || '/Logo And Recording/cropped_circle_image.png'}">
    <link rel="canonical" href="https://emma.kodefast.com/usecase/${useCase.id}">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css">
    <style>
        body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; margin: 0; }
        .navbar { position: fixed; top: 0; left: 0; width: 100%; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(10px); z-index: 1000; padding: 1rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.3); }
        .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo { display: flex; align-items: center; gap: 0.75rem; }
        .logo-container { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; }
        .logo-image { width: 24px; height: 24px; object-fit: cover; }
        .nav-links { display: flex; list-style: none; margin: 0; padding: 0; gap: 2rem; }
        .nav-links a { color: #94a3b8; text-decoration: none; font-weight: 500; transition: color 0.3s ease; }
        .nav-links a:hover { color: #3b82f6; }
        .use-case-container { max-width: 800px; margin: 0 auto; padding: 8rem 2rem 4rem; }
        .use-case-header { margin-bottom: 3rem; }
        .use-case-title { font-size: 3rem; font-weight: 800; margin-bottom: 1rem; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1.1; }
        .use-case-meta { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; color: #94a3b8; }
        .author-info { display: flex; align-items: center; gap: 0.5rem; }
        .author-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; }
        .author-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .use-case-image { width: 100%; height: 400px; object-fit: cover; border-radius: 1rem; margin-bottom: 2rem; }
        .use-case-content { font-size: 1.1rem; line-height: 1.8; color: #cbd5e1; }
        .use-case-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 2rem; }
        .tag { background: rgba(59, 130, 246, 0.1); color: #60a5fa; padding: 0.5rem 1rem; border-radius: 2rem; font-size: 0.9rem; font-weight: 500; }
        .back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: #3b82f6; text-decoration: none; margin-bottom: 2rem; }
        .back-link:hover { color: #60a5fa; }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <div class="logo-container">
                    <img src="/Logo And Recording/cropped_circle_image.png" alt="Emma AI Logo" class="logo-image">
                </div>
                <span style="font-weight: 700; color: #f8fafc;">Emma AI</span>
            </div>
            <ul class="nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/pricing">Pricing</a></li>
                <li><a href="/resources">Resources</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <div class="use-case-container">
        <a href="/resources" class="back-link">
            <i class="fas fa-arrow-left"></i>
            Back to Resources
        </a>
        
        <div class="use-case-header">
            <h1 class="use-case-title">${useCase.title}</h1>
            <div class="use-case-meta">
                <div class="author-info">
                    <div class="author-avatar">
                        ${useCase.authorImage ? 
                            `<img src="${useCase.authorImage}" alt="${useCase.author}" onerror="this.parentElement.innerHTML='${useCase.author.split(' ').map(n => n[0]).join('').toUpperCase()}'">` : 
                            useCase.author.split(' ').map(n => n[0]).join('').toUpperCase()
                        }
                    </div>
                    <span>${useCase.author}</span>
                </div>
                <span>•</span>
                <span>${formattedDate}</span>
                <span>•</span>
                <span>${useCase.readTime || '8 min read'}</span>
            </div>
        </div>

        ${useCase.image_url ? `<img src="${useCase.image_url}" alt="${useCase.title}" class="use-case-image">` : ''}
        
        <div class="use-case-content">
            ${cleanQuillContent(useCase.content || useCase.excerpt)}
        </div>

        <div class="use-case-tags">
            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    </div>
</body>
</html>`;
}

// Start server (database initialization skipped for MPA-only mode)
app.listen(PORT, async () => {
    console.log(`Emma CMS Server running on port ${PORT}`);
    console.log(`Main website: http://localhost:${PORT}`);
    console.log(`About: http://localhost:${PORT}/about`);
    console.log(`Pricing: http://localhost:${PORT}/pricing`);
    console.log(`Resources: http://localhost:${PORT}/resources`);
    console.log(`Contact: http://localhost:${PORT}/contact`);
    console.log(`CMS Admin: http://localhost:${PORT}/cms-admin-local.html`);
});
