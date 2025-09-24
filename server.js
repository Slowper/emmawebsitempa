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
// SSR handler removed - using MPA instead
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
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

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use('/Logo And Recording', express.static('Logo And Recording'));
app.use('/Team Pics', express.static('Team Pics'));
app.use(express.static('public'));
app.use(express.static('.')); // Serve files from root directory (CSS, JS, etc.)

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

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = process.env.UPLOAD_PATH || './uploads';
        
        // Special handling for different content types
        if (file.fieldname === 'logo') {
            uploadPath = path.join(uploadPath, 'logo');
        } else if (file.fieldname === 'blogImage' || file.fieldname === 'blogAuthorImage') {
            uploadPath = path.join(uploadPath, 'blogs');
        } else if (file.fieldname === 'useCaseGallery') {
            uploadPath = path.join(uploadPath, 'usecases');
        } else if (file.fieldname === 'caseStudyImage' || file.fieldname === 'caseStudyGallery') {
            uploadPath = path.join(uploadPath, 'casestudies');
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

        connection.release();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// API Routes

// Authentication routes
app.get('/api/content/auth/verify', authenticateToken, (req, res) => {
    res.json({ 
        message: 'Token is valid',
        user: req.user 
    });
});

app.post('/api/auth/login', async (req, res) => {
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
        
        const imageUrl = `/uploads/${req.file.filename}`;
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
        
        const imageUrl = `/uploads/${req.file.filename}`;
        
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
            gallery: blog.gallery ? JSON.parse(blog.gallery) : []
        }));
        
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(`
            SELECT id, title, category, author, excerpt, content, image, authorImage, 
                   gallery, created_at, updated_at, status
            FROM blogs 
            WHERE id = ? AND status = 'published'
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        const blog = {
            ...rows[0],
            gallery: rows[0].gallery ? JSON.parse(rows[0].gallery) : []
        };
        
        res.json(blog);
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
            imagePath = `/uploads/blogs/${req.files.blogImage[0].filename}`;
        }
        
        if (req.files.blogAuthorImage) {
            authorImagePath = `/uploads/blogs/${req.files.blogAuthorImage[0].filename}`;
        }
        
        const galleryArray = gallery ? gallery.split('\n').filter(url => url.trim()) : [];
        
        const [result] = await pool.execute(`
            INSERT INTO blogs (title, category, author, excerpt, content, image, authorImage, gallery, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', NOW(), NOW())
        `, [title, category, author, excerpt, content, imagePath, authorImagePath, JSON.stringify(galleryArray)]);
        
        res.json({ 
            message: 'Blog created successfully', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/blogs/:id', authenticateToken, upload.fields([
    { name: 'blogImage', maxCount: 1 },
    { name: 'blogAuthorImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, author, excerpt, content, gallery } = req.body;
        
        if (!title || !category || !author || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Get existing blog data
        const [existingRows] = await pool.execute('SELECT image, authorImage FROM blogs WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        let imagePath = existingRows[0].image;
        let authorImagePath = existingRows[0].authorImage;
        
        if (req.files.blogImage) {
            imagePath = `/uploads/blogs/${req.files.blogImage[0].filename}`;
        }
        
        if (req.files.blogAuthorImage) {
            authorImagePath = `/uploads/blogs/${req.files.blogAuthorImage[0].filename}`;
        }
        
        const galleryArray = gallery ? gallery.split('\n').filter(url => url.trim()) : [];
        
        await pool.execute(`
            UPDATE blogs 
            SET title = ?, category = ?, author = ?, excerpt = ?, content = ?, 
                image = ?, authorImage = ?, gallery = ?, updated_at = NOW()
            WHERE id = ?
        `, [title, category, author, excerpt, content, imagePath, authorImagePath, JSON.stringify(galleryArray), id]);
        
        res.json({ message: 'Blog updated successfully' });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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

// Use Cases API routes
app.get('/api/usecases', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT id, title, description, industry, stats, gallery, 
                   created_at, updated_at, status
            FROM use_cases 
            WHERE status = 'published' 
            ORDER BY created_at DESC
        `);
        
        const useCases = rows.map(useCase => ({
            ...useCase,
            stats: useCase.stats ? JSON.parse(useCase.stats) : [],
            gallery: useCase.gallery ? JSON.parse(useCase.gallery) : [],
            tags: useCase.tags ? JSON.parse(useCase.tags) : []
        }));
        
        res.json(useCases);
    } catch (error) {
        console.error('Error fetching use cases:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/usecases/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(`
            SELECT id, title, description, industry, stats, gallery, 
                   created_at, updated_at, status
            FROM use_cases 
            WHERE id = ? AND status = 'published'
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Use case not found' });
        }
        
        const useCase = {
            ...rows[0],
            stats: rows[0].stats ? JSON.parse(rows[0].stats) : [],
            gallery: rows[0].gallery ? JSON.parse(rows[0].gallery) : [],
            tags: rows[0].tags ? JSON.parse(rows[0].tags) : []
        };
        
        res.json(useCase);
    } catch (error) {
        console.error('Error fetching use case:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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
            galleryArray = req.files.useCaseGallery.map(file => `/uploads/usecases/${file.filename}`);
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

app.put('/api/usecases/:id', authenticateToken, upload.fields([
    { name: 'useCaseGallery', maxCount: 10 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, industry, icon, description, tags, stats, detailedContent, gallery } = req.body;
        
        if (!title || !industry || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Get existing use case data
        const [existingRows] = await pool.execute('SELECT gallery FROM use_cases WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Use case not found' });
        }
        
        let galleryArray = existingRows[0].gallery ? JSON.parse(existingRows[0].gallery) : [];
        
        if (req.files.useCaseGallery) {
            galleryArray = req.files.useCaseGallery.map(file => `/uploads/usecases/${file.filename}`);
        } else if (gallery) {
            galleryArray = gallery.split('\n').filter(url => url.trim());
        }
        
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
        const statsArray = stats ? JSON.parse(stats) : [];
        
        await pool.execute(`
            UPDATE use_cases 
            SET title = ?, description = ?, industry = ?, stats = ?, gallery = ?, updated_at = NOW()
            WHERE id = ?
        `, [title, description, industry, JSON.stringify(statsArray), JSON.stringify(galleryArray), id]);
        
        res.json({ message: 'Use case updated successfully' });
    } catch (error) {
        console.error('Error updating use case:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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
            results: caseStudy.results ? JSON.parse(caseStudy.results) : [],
            tags: caseStudy.tags ? JSON.parse(caseStudy.tags) : [],
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
            galleryArray = req.files.caseStudyGallery.map(file => `/uploads/casestudies/${file.filename}`);
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

app.put('/api/casestudies/:id', authenticateToken, upload.fields([
    { name: 'caseStudyImage', maxCount: 1 },
    { name: 'caseStudyGallery', maxCount: 10 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, client, industry, date, summary, tags, results, content, gallery } = req.body;
        
        if (!title || !client || !industry) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Get existing case study data
        const [existingRows] = await pool.execute('SELECT tags FROM case_studies WHERE id = ?', [id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Case study not found' });
        }
        
        let galleryArray = [];
        if (req.files.caseStudyGallery) {
            galleryArray = req.files.caseStudyGallery.map(file => `/uploads/casestudies/${file.filename}`);
        } else if (gallery) {
            galleryArray = gallery.split('\n').filter(url => url.trim());
        }
        
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
        const resultsArray = results ? JSON.parse(results) : [];
        
        await pool.execute(`
            UPDATE case_studies 
            SET title = ?, client = ?, industry = ?, summary = ?, results = ?, tags = ?, updated_at = NOW()
            WHERE id = ?
        `, [title, client, industry, summary, JSON.stringify(resultsArray), JSON.stringify(tagsArray), id]);
        
        res.json({ message: 'Case study updated successfully' });
    } catch (error) {
        console.error('Error updating case study:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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
            features: plan.features ? JSON.parse(plan.features) : [],
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
            features: plan.features ? JSON.parse(plan.features) : []
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
            features: rows[0].features ? JSON.parse(rows[0].features) : []
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

app.put('/api/pricing/plan/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { plan_name, plan_description, plan_type, price_amount, price_period, is_featured, features, button_text, button_action, display_order, is_active } = req.body;
        
        if (!plan_name) {
            return res.status(400).json({ error: 'Plan name is required' });
        }
        
        await pool.execute(`
            UPDATE pricing_plans 
            SET plan_name = ?, plan_description = ?, plan_type = ?, price_amount = ?, price_period = ?, 
                is_featured = ?, features = ?, button_text = ?, button_action = ?, display_order = ?, is_active = ?
            WHERE id = ?
        `, [plan_name, plan_description, plan_type, price_amount, price_period, is_featured, JSON.stringify(features || []), button_text, button_action, display_order, is_active !== undefined ? is_active : true, id]);
        
        res.json({ message: 'Pricing plan updated successfully' });
    } catch (error) {
        console.error('Error updating pricing plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

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
        
        const logoUrl = `/uploads/logo/${req.file.filename}`;
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
            url: `/uploads/${file.filename}`,
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Blog routes
app.get('/blog/:id', (req, res) => {
    const blogId = req.params.id;
    const blogPath = path.join(__dirname, 'pages', 'blog', `${blogId}.html`);
    
    if (fs.existsSync(blogPath)) {
        res.sendFile(blogPath);
    } else {
        res.status(404).sendFile(path.join(__dirname, 'pages', '404.html'));
    }
});

// Use case routes
app.get('/usecase/:id', (req, res) => {
    const useCaseId = req.params.id;
    const useCasePath = path.join(__dirname, 'pages', 'usecase', `${useCaseId}.html`);
    
    if (fs.existsSync(useCasePath)) {
        res.sendFile(useCasePath);
    } else {
        res.status(404).sendFile(path.join(__dirname, 'pages', '404.html'));
    }
});

// Case study routes
app.get('/casestudy/:id', (req, res) => {
    const caseStudyId = req.params.id;
    const caseStudyPath = path.join(__dirname, 'pages', 'casestudy', `${caseStudyId}.html`);
    
    if (fs.existsSync(caseStudyPath)) {
        res.sendFile(caseStudyPath);
    } else {
        res.status(404).sendFile(path.join(__dirname, 'pages', '404.html'));
    }
});

// SPA fallback removed - using MPA only

// Serve admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

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

// Start server (database initialization skipped for MPA-only mode)
app.listen(PORT, () => {
    console.log(`Emma CMS Server running on port ${PORT}`);
    console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
    console.log(`Main website: http://localhost:${PORT}`);
    console.log(`About: http://localhost:${PORT}/about`);
    console.log(`Pricing: http://localhost:${PORT}/pricing`);
    console.log(`Resources: http://localhost:${PORT}/resources`);
    console.log(`Contact: http://localhost:${PORT}/contact`);
});
