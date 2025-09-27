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
const slugify = require('slugify');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.CMS_PORT || 3001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://unpkg.com", "https://cdn.quilljs.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://cdn.quilljs.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "https://cdn.quilljs.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "http://localhost:3001", "http://localhost:3000", "http://localhost:8000"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"]
        }
    }
}));

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use('/cms-uploads', express.static('cms-uploads'));
app.use('/quill', express.static('quill'));

// Serve admin interface
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms-admin-standalone.html'));
});

app.get('/admin-local', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms-admin-local.html'));
});

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'emma_resources_cms',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: 'Z'
};

const pool = mysql.createPool(dbConfig);

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'cms-uploads';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and documents are allowed.'));
        }
    }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [users] = await pool.execute(
            'SELECT id, username, email, role, is_active FROM users WHERE id = ? AND is_active = true',
            [decoded.userId]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        req.user = users[0];
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Helper function to generate slug
const generateSlug = (title) => {
    return slugify(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
    });
};

// Helper function to calculate reading time
const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
};

// Helper function to extract plain text from HTML
const extractPlainText = (html) => {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

// ==================== AUTHENTICATION ROUTES ====================

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const [users] = await pool.execute(
            'SELECT id, username, email, password, first_name, last_name, role, is_active FROM users WHERE (username = ? OR email = ?) AND is_active = true',
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await pool.execute(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Register (admin only)
app.post('/api/auth/register', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { username, email, password, firstName, lastName, role = 'author' } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            'INSERT INTO users (username, email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, firstName, lastName, role]
        );

        res.json({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'Username or email already exists' });
        } else {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// ==================== RESOURCES ROUTES ====================

// Get all resources with filtering and pagination
app.get('/api/resources', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            type,
            status = 'published',
            industry,
            search,
            sort = 'published_at',
            order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = ['r.status = ?'];
        let queryParams = [status];

        if (type) {
            whereConditions.push('r.type = ?');
            queryParams.push(type);
        }

        if (industry) {
            whereConditions.push('r.industry_id = ?');
            queryParams.push(industry);
        }

        if (search) {
            whereConditions.push('(r.title LIKE ? OR r.content_plain LIKE ? OR r.excerpt LIKE ?)');
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        const query = `
            SELECT 
                r.*,
                i.name as industry_name,
                i.color as industry_color,
                i.icon as industry_icon,
                u.first_name,
                u.last_name,
                u.avatar as author_avatar
            FROM resources r
            LEFT JOIN industries i ON r.industry_id = i.id
            LEFT JOIN users u ON r.author_id = u.id
            ${whereClause}
            ORDER BY r.${sort} ${order}
            LIMIT ? OFFSET ?
        `;

        queryParams.push(parseInt(limit), parseInt(offset));

        const [resources] = await pool.execute(query, queryParams);

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM resources r
            ${whereClause}
        `;
        const [countResult] = await pool.execute(countQuery, queryParams.slice(0, -2));
        const total = countResult[0].total;

        res.json({
            resources,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single resource by slug
app.get('/api/resources/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        const [resources] = await pool.execute(`
            SELECT 
                r.*,
                i.name as industry_name,
                i.color as industry_color,
                i.icon as industry_icon,
                u.first_name,
                u.last_name,
                u.avatar as author_avatar
            FROM resources r
            LEFT JOIN industries i ON r.industry_id = i.id
            LEFT JOIN users u ON r.author_id = u.id
            WHERE r.slug = ? AND r.status = 'published'
        `, [slug]);

        if (resources.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        const resource = resources[0];

        // Increment view count
        await pool.execute(
            'UPDATE resources SET view_count = view_count + 1 WHERE id = ?',
            [resource.id]
        );

        // Log view
        const clientIP = req.ip || req.connection.remoteAddress;
        await pool.execute(
            'INSERT INTO resource_views (resource_id, ip_address, user_agent, referrer) VALUES (?, ?, ?, ?)',
            [resource.id, clientIP, req.get('User-Agent'), req.get('Referer')]
        );

        res.json(resource);
    } catch (error) {
        console.error('Get resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new resource
app.post('/api/resources', authenticateToken, upload.fields([
    { name: 'featured_image', maxCount: 1 },
    { name: 'author_image', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
]), async (req, res) => {
    try {
        const {
            title,
            type,
            excerpt,
            content,
            industry_id,
            tags,
            meta_title,
            meta_description,
            meta_keywords,
            status = 'draft'
        } = req.body;

        if (!title || !type || !content) {
            return res.status(400).json({ error: 'Title, type, and content are required' });
        }

        const slug = generateSlug(title);
        const contentPlain = extractPlainText(content);
        const readTime = calculateReadingTime(contentPlain);
        const wordCount = contentPlain.split(/\s+/).length;

        // Handle file uploads
        const featuredImage = req.files?.featured_image?.[0];
        const authorImage = req.files?.author_image?.[0];
        const galleryFiles = req.files?.gallery || [];

        const featuredImageUrl = featuredImage ? `/cms-uploads/${featuredImage.filename}` : null;
        const authorImageUrl = authorImage ? `/cms-uploads/${authorImage.filename}` : null;
        const galleryUrls = galleryFiles.map(file => `/cms-uploads/${file.filename}`);

        // Parse tags
        let tagIds = [];
        if (tags) {
            try {
                tagIds = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (e) {
                tagIds = [];
            }
        }

        const publishedAt = status === 'published' ? new Date() : null;

        const [result] = await pool.execute(`
            INSERT INTO resources (
                title, slug, type, status, excerpt, content, content_plain,
                featured_image, featured_image_alt, gallery, author_id, author_name,
                author_image, industry_id, tags, meta_title, meta_description,
                meta_keywords, read_time, word_count, published_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, slug, type, status, excerpt, content, contentPlain,
            featuredImageUrl, req.body.featured_image_alt || title, JSON.stringify(galleryUrls),
            req.user.id, `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.username,
            authorImageUrl, industry_id || null, JSON.stringify(tagIds),
            meta_title || title, meta_description || excerpt, meta_keywords,
            readTime, wordCount, publishedAt
        ]);

        res.json({ message: 'Resource created successfully', id: result.insertId, slug });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'A resource with this title already exists' });
        } else {
            console.error('Create resource error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Update resource
app.put('/api/resources/:id', authenticateToken, upload.fields([
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
            industry_id,
            tags,
            meta_title,
            meta_description,
            meta_keywords,
            status
        } = req.body;

        // Check if user can edit this resource
        const [existing] = await pool.execute(
            'SELECT author_id FROM resources WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        if (req.user.role !== 'admin' && existing[0].author_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own resources' });
        }

        const slug = generateSlug(title);
        const contentPlain = extractPlainText(content);
        const readTime = calculateReadingTime(contentPlain);
        const wordCount = contentPlain.split(/\s+/).length;

        // Handle file uploads
        const featuredImage = req.files?.featured_image?.[0];
        const authorImage = req.files?.author_image?.[0];
        const galleryFiles = req.files?.gallery || [];

        let updateFields = {
            title,
            slug,
            type,
            excerpt,
            content,
            content_plain: contentPlain,
            industry_id: industry_id || null,
            meta_title: meta_title || title,
            meta_description: meta_description || excerpt,
            meta_keywords,
            read_time: readTime,
            word_count: wordCount,
            updated_at: new Date()
        };

        if (featuredImage) {
            updateFields.featured_image = `/cms-uploads/${featuredImage.filename}`;
        }
        if (authorImage) {
            updateFields.author_image = `/cms-uploads/${authorImage.filename}`;
        }
        if (galleryFiles.length > 0) {
            updateFields.gallery = JSON.stringify(galleryFiles.map(file => `/cms-uploads/${file.filename}`));
        }
        if (status) {
            updateFields.status = status;
            if (status === 'published' && !existing[0].published_at) {
                updateFields.published_at = new Date();
            }
        }

        // Parse tags
        if (tags) {
            try {
                const tagIds = typeof tags === 'string' ? JSON.parse(tags) : tags;
                updateFields.tags = JSON.stringify(tagIds);
            } catch (e) {
                // Keep existing tags if parsing fails
            }
        }

        const setClause = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateFields);
        values.push(id);

        await pool.execute(
            `UPDATE resources SET ${setClause} WHERE id = ?`,
            values
        );

        res.json({ message: 'Resource updated successfully' });
    } catch (error) {
        console.error('Update resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete resource
app.delete('/api/resources/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user can delete this resource
        const [existing] = await pool.execute(
            'SELECT author_id FROM resources WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        if (req.user.role !== 'admin' && existing[0].author_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own resources' });
        }

        await pool.execute('DELETE FROM resources WHERE id = ?', [id]);

        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== INDUSTRIES ROUTES ====================

// Get all industries
app.get('/api/industries', async (req, res) => {
    try {
        const [industries] = await pool.execute(
            'SELECT * FROM industries WHERE is_active = true ORDER BY sort_order, name'
        );
        res.json(industries);
    } catch (error) {
        console.error('Get industries error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== TAGS ROUTES ====================

// Get all tags
app.get('/api/tags', async (req, res) => {
    try {
        const [tags] = await pool.execute(
            'SELECT * FROM tags ORDER BY usage_count DESC, name'
        );
        res.json(tags);
    } catch (error) {
        console.error('Get tags error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== STATISTICS ROUTES ====================

// Get dashboard statistics
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM resources WHERE status = 'published') as total_published,
                (SELECT COUNT(*) FROM resources WHERE status = 'draft') as total_drafts,
                (SELECT COUNT(*) FROM resources WHERE type = 'blog') as total_blogs,
                (SELECT COUNT(*) FROM resources WHERE type = 'case-study') as total_case_studies,
                (SELECT COUNT(*) FROM resources WHERE type = 'use-case') as total_use_cases,
                (SELECT COUNT(*) FROM resource_views WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as views_last_30_days,
                (SELECT COUNT(*) FROM resources WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as created_last_30_days
        `);

        res.json(stats[0]);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== FILE UPLOAD ROUTES ====================

// Upload file
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Save file info to database
        const [result] = await pool.execute(`
            INSERT INTO file_uploads (original_name, filename, file_path, file_size, mime_type, file_type, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            req.file.originalname,
            req.file.filename,
            req.file.path,
            req.file.size,
            req.file.mimetype,
            req.file.mimetype.startsWith('image/') ? 'image' : 'document',
            req.user.id
        ]);

        res.json({
            message: 'File uploaded successfully',
            file: {
                id: result.insertId,
                filename: req.file.filename,
                url: `/cms-uploads/${req.file.filename}`,
                size: req.file.size,
                type: req.file.mimetype
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }
    
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Emma Resources CMS Server running on port ${PORT}`);
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
