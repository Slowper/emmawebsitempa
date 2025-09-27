const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('.'));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Simple authentication (in-memory for demo)
let users = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@emma.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
    }
];

// Sample data storage (in-memory for now)
let resources = [
    {
        id: 1,
        title: "Welcome to Emma Resources CMS",
        slug: "welcome-to-emma-resources-cms",
        type: "blog",
        status: "published",
        excerpt: "Learn about the new Emma Resources CMS and how it can help you manage your content effectively.",
        content: "<h2>Welcome to Emma Resources CMS</h2><p>We're excited to introduce the new Emma Resources CMS, a powerful content management system designed specifically for managing blogs, case studies, and use cases.</p><h3>Key Features</h3><ul><li><strong>Rich Text Editor:</strong> Create beautiful content with our integrated Quill editor</li><li><strong>Media Management:</strong> Upload and organize images, documents, and galleries</li><li><strong>Industry Categorization:</strong> Organize content by industry for better filtering</li><li><strong>SEO Optimization:</strong> Built-in SEO tools for better search engine visibility</li><li><strong>Responsive Design:</strong> Beautiful reading experience on all devices</li></ul>",
        author_name: "Emma AI Team",
        industry_id: 6,
        industry_name: "Technology",
        tags: ["CMS", "Content Management", "Emma AI"],
        read_time: 5,
        view_count: 0,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString()
    },
    {
        id: 2,
        title: "Healthcare AI Implementation Success Story",
        slug: "healthcare-ai-implementation-success-story",
        type: "case-study",
        status: "published",
        excerpt: "How Emma AI transformed patient care at a leading hospital through intelligent automation.",
        content: "<h2>Healthcare AI Implementation Success Story</h2><p>This case study explores how Emma AI helped a leading healthcare provider improve patient outcomes and operational efficiency through intelligent automation.</p><h3>Challenge</h3><p>The hospital was facing several critical challenges including high patient wait times, manual scheduling processes, and limited staff availability for routine tasks.</p><h3>Solution</h3><p>Emma AI implemented a comprehensive automation solution that included intelligent appointment scheduling, automated patient data processing, smart resource allocation, and predictive analytics for patient care.</p><h3>Results</h3><p>The implementation delivered remarkable results: 40% reduction in patient wait times, 60% improvement in scheduling efficiency, 25% increase in staff productivity, and 95% accuracy in patient data processing.</p>",
        author_name: "Emma AI Team",
        industry_id: 1,
        industry_name: "Healthcare",
        tags: ["Healthcare", "AI Implementation", "Case Study"],
        read_time: 7,
        view_count: 0,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString()
    }
];

let industries = [
    { id: 1, name: "Healthcare", slug: "healthcare", color: "#10b981", icon: "🏥" },
    { id: 2, name: "Banking & Finance", slug: "banking-finance", color: "#3b82f6", icon: "🏦" },
    { id: 3, name: "Education", slug: "education", color: "#8b5cf6", icon: "🎓" },
    { id: 4, name: "Manufacturing", slug: "manufacturing", color: "#f59e0b", icon: "🏭" },
    { id: 5, name: "Retail", slug: "retail", color: "#ef4444", icon: "🛍️" },
    { id: 6, name: "Technology", slug: "technology", color: "#06b6d4", icon: "💻" }
];

let tags = [
    { id: 1, name: "AI Automation", slug: "ai-automation", color: "#3b82f6" },
    { id: 2, name: "Machine Learning", slug: "machine-learning", color: "#8b5cf6" },
    { id: 3, name: "Digital Transformation", slug: "digital-transformation", color: "#10b981" },
    { id: 4, name: "Process Optimization", slug: "process-optimization", color: "#f59e0b" },
    { id: 5, name: "Customer Experience", slug: "customer-experience", color: "#ef4444" }
];

// Authentication Routes
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    // Simple demo authentication (accept any password for admin)
    if (username === 'admin') {
        const user = users.find(u => u.username === username);
        if (user) {
            const token = 'demo-token-' + Date.now();
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            });
            return;
        }
    }
    
    res.status(401).json({ error: 'Invalid credentials' });
});

// API Routes
app.get('/api/industries', (req, res) => {
    res.json(industries);
});

app.get('/api/tags', (req, res) => {
    res.json(tags);
});

app.get('/api/resources', (req, res) => {
    const { type, status = 'published', industry, search, limit = 50 } = req.query;
    
    let filteredResources = resources.filter(resource => {
        if (status && resource.status !== status) return false;
        if (type && resource.type !== type) return false;
        if (industry && resource.industry_id != industry) return false;
        if (search) {
            const searchTerm = search.toLowerCase();
            return resource.title.toLowerCase().includes(searchTerm) || 
                   resource.excerpt.toLowerCase().includes(searchTerm);
        }
        return true;
    });
    
    const limitedResources = filteredResources.slice(0, parseInt(limit));
    
    res.json({
        resources: limitedResources,
        pagination: {
            page: 1,
            limit: parseInt(limit),
            total: filteredResources.length,
            pages: Math.ceil(filteredResources.length / limit)
        }
    });
});

app.get('/api/resources/:slug', (req, res) => {
    const { slug } = req.params;
    const resource = resources.find(r => r.slug === slug);
    
    if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Increment view count
    resource.view_count = (resource.view_count || 0) + 1;
    
    res.json(resource);
});

app.get('/api/stats', (req, res) => {
    const stats = {
        total_published: resources.filter(r => r.status === 'published').length,
        total_drafts: resources.filter(r => r.status === 'draft').length,
        total_blogs: resources.filter(r => r.type === 'blog').length,
        total_case_studies: resources.filter(r => r.type === 'case-study').length,
        total_use_cases: resources.filter(r => r.type === 'use-case').length,
        views_last_30_days: resources.reduce((sum, r) => sum + (r.view_count || 0), 0),
        created_last_30_days: resources.length
    };
    
    res.json(stats);
});

// Admin routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms-admin-standalone.html'));
});

app.get('/admin-local', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms-admin-local.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Emma Resources CMS Server running on port ${PORT}`);
    console.log(`🔗 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🔗 Local Admin: http://localhost:${PORT}/admin-local`);
    console.log(`👤 Sample data loaded with ${resources.length} resources`);
});

module.exports = app;
