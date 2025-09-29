const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');

const app = express();
const PORT = 3001;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:3000", "http://localhost:3001"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'self'"]
        }
    }
}));
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

// Cache for resources
let resourcesCache = [];
let industriesCache = [];
let tagsCache = [];
let lastCacheUpdate = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes - sync less frequently
let isSyncing = false; // Prevent multiple syncs from running simultaneously

// Helper function to fetch from main server
async function fetchFromMainServer(endpoint) {
    try {
        const response = await fetch(`http://localhost:3000${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching from main server ${endpoint}:`, error.message);
        return [];
    }
}

// Function to sync resources from main server
async function syncResourcesFromMainServer() {
    if (isSyncing) {
        console.log('⏳ Sync already in progress, skipping...');
        return;
    }
    
    isSyncing = true;
    try {
        console.log('🔄 Syncing resources from main server...');
        
        // Try to get all resources from the main resources endpoint first
        const allResources = await fetchFromMainServer('/api/resources');
        console.log('📊 Main resources endpoint returned:', allResources.length, 'resources');
        
        // Also try individual endpoints to get more data
        const [blogs, useCases, caseStudies] = await Promise.all([
            fetchFromMainServer('/api/blogs'),
            fetchFromMainServer('/api/usecases'),
            fetchFromMainServer('/api/casestudies')
        ]);

        console.log('📊 Individual endpoints returned:');
        console.log(`   - Blogs: ${blogs.length}`);
        console.log(`   - Use Cases: ${useCases.length}`);
        console.log(`   - Case Studies: ${caseStudies.length}`);

        // Use the individual endpoints data as they might have more complete data
        const transformedBlogs = blogs.map(blog => ({
            id: blog.id,
            title: blog.title,
            slug: blog.slug || generateSlug(blog.title),
            type: 'blog',
            status: blog.status || 'published',
            excerpt: blog.excerpt || blog.description || '',
            content: blog.content || '',
            author_name: blog.author || 'Emma AI Team',
            industry_id: getIndustryId(blog.industry || 'Technology'),
            industry_name: blog.industry || 'Technology',
            tags: blog.tags ? (typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags) : [],
            read_time: 5,
            view_count: 0,
            created_at: blog.created_at || new Date().toISOString(),
            published_at: blog.published_at || blog.created_at || new Date().toISOString()
        }));

        // Transform use cases
        const transformedUseCases = useCases.map(useCase => ({
            id: useCase.id + 1000, // Offset to avoid ID conflicts
            title: useCase.title,
            slug: useCase.slug || generateSlug(useCase.title),
            type: 'use-case',
            status: useCase.status || 'published',
            excerpt: useCase.description || useCase.summary || '',
            content: useCase.content || `<h2>${useCase.title}</h2><p>${useCase.description || useCase.summary}</p>`,
            author_name: 'Emma AI Team',
            industry_id: getIndustryId(useCase.industry || 'Technology'),
            industry_name: useCase.industry || 'Technology',
            tags: useCase.tags ? (typeof useCase.tags === 'string' ? JSON.parse(useCase.tags) : useCase.tags) : [],
            read_time: 5,
            view_count: 0,
            created_at: useCase.created_at || new Date().toISOString(),
            published_at: useCase.published_at || useCase.created_at || new Date().toISOString()
        }));

        // Transform case studies
        const transformedCaseStudies = caseStudies.map(caseStudy => ({
            id: caseStudy.id + 2000, // Offset to avoid ID conflicts
            title: caseStudy.title,
            slug: caseStudy.slug || generateSlug(caseStudy.title),
            type: 'case-study',
            status: caseStudy.status || 'published',
            excerpt: caseStudy.summary || caseStudy.description || '',
            content: caseStudy.content || `<h2>${caseStudy.title}</h2><p>${caseStudy.summary || caseStudy.description}</p>`,
            author_name: 'Emma AI Team',
            industry_id: getIndustryId(caseStudy.industry || 'Technology'),
            industry_name: caseStudy.industry || 'Technology',
            tags: caseStudy.tags ? (typeof caseStudy.tags === 'string' ? JSON.parse(caseStudy.tags) : caseStudy.tags) : [],
            read_time: 7,
            view_count: 0,
            created_at: caseStudy.created_at || new Date().toISOString(),
            published_at: caseStudy.published_at || caseStudy.created_at || new Date().toISOString()
        }));

        // Merge new resources with existing cache (don't overwrite)
        const newResources = [...transformedBlogs, ...transformedUseCases, ...transformedCaseStudies];
        const existingIds = new Set(resourcesCache.map(r => r.id));
        const uniqueNewResources = newResources.filter(r => !existingIds.has(r.id));
        
        resourcesCache = [...resourcesCache, ...uniqueNewResources];
        lastCacheUpdate = Date.now();
        
        console.log(`✅ Synced ${uniqueNewResources.length} new resources from main server`);
        console.log(`   - Total resources in cache: ${resourcesCache.length}`);
        console.log(`   - New Blogs: ${transformedBlogs.filter(r => !existingIds.has(r.id)).length}`);
        console.log(`   - New Use Cases: ${transformedUseCases.filter(r => !existingIds.has(r.id)).length}`);
        console.log(`   - New Case Studies: ${transformedCaseStudies.filter(r => !existingIds.has(r.id)).length}`);
        
        // If we got more resources from individual endpoints, log it
        if (allResources.length > 0 && allResources.length !== resourcesCache.length) {
            console.log(`⚠️  Main resources endpoint has ${allResources.length} resources, but individual endpoints have ${resourcesCache.length}`);
        }
        
    } catch (error) {
        console.error('❌ Error syncing resources:', error);
        // Fallback to sample data if sync fails
        resourcesCache = [
            {
                id: 1,
                title: "Welcome to Emma Resources CMS",
                slug: "welcome-to-emma-resources-cms",
                type: "blog",
                status: "published",
                excerpt: "Learn about the new Emma Resources CMS and how it can help you manage your content effectively.",
                content: "<h2>Welcome to Emma Resources CMS</h2><p>We're excited to introduce the new Emma Resources CMS, a powerful content management system designed specifically for managing blogs, case studies, and use cases.</p>",
                author_name: "Emma AI Team",
                industry_id: 6,
                industry_name: "Technology",
                tags: ["CMS", "Content Management", "Emma AI"],
                read_time: 5,
                view_count: 0,
                created_at: new Date().toISOString(),
                published_at: new Date().toISOString()
            }
        ];
    } finally {
        isSyncing = false;
    }
}

// Helper function to generate SEO-friendly slugs
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim('-'); // Remove leading/trailing hyphens
}

// Helper function to get industry ID by name
function getIndustryId(industryName) {
    const industryMap = {
        'Healthcare': 1,
        'Banking & Finance': 2,
        'Education': 3,
        'Manufacturing': 4,
        'Retail': 5,
        'Technology': 6
    };
    return industryMap[industryName] || 6; // Default to Technology
}

// Initialize industries and tags
industriesCache = [
    { id: 1, name: "Healthcare", slug: "healthcare", color: "#10b981", icon: "🏥" },
    { id: 2, name: "Banking & Finance", slug: "banking-finance", color: "#3b82f6", icon: "🏦" },
    { id: 3, name: "Education", slug: "education", color: "#8b5cf6", icon: "🎓" },
    { id: 4, name: "Manufacturing", slug: "manufacturing", color: "#f59e0b", icon: "🏭" },
    { id: 5, name: "Retail", slug: "retail", color: "#ef4444", icon: "🛍️" },
    { id: 6, name: "Technology", slug: "technology", color: "#06b6d4", icon: "💻" }
];

tagsCache = [
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
    res.json(industriesCache);
});

app.get('/api/tags', (req, res) => {
    res.json(tagsCache);
});

app.get('/api/resources', async (req, res) => {
    // Disable automatic sync to prevent resource loss
    // Sync only when explicitly requested via /api/sync endpoint
    // if (Date.now() - lastCacheUpdate > CACHE_DURATION && !isSyncing) {
    //     await syncResourcesFromMainServer();
    // }
    
    const { type, status, industry, search, limit = 50 } = req.query;
    
    let filteredResources = resourcesCache.filter(resource => {
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

app.get('/api/resources/:slug', async (req, res) => {
    // Disable automatic sync to prevent resource loss
    // Sync only when explicitly requested via /api/sync endpoint
    // if (Date.now() - lastCacheUpdate > CACHE_DURATION && !isSyncing) {
    //     await syncResourcesFromMainServer();
    // }
    
    const { slug } = req.params;
    const resource = resourcesCache.find(r => r.slug === slug);
    
    if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
    }
    
    // Increment view count
    resource.view_count = (resource.view_count || 0) + 1;
    
    res.json(resource);
});

app.get('/api/stats', async (req, res) => {
    // Disable automatic sync to prevent resource loss
    // Sync only when explicitly requested via /api/sync endpoint
    // if (Date.now() - lastCacheUpdate > CACHE_DURATION && !isSyncing) {
    //     await syncResourcesFromMainServer();
    // }
    
    const stats = {
        total_published: resourcesCache.filter(r => r.status === 'published').length,
        total_drafts: resourcesCache.filter(r => r.status === 'draft').length,
        total_blogs: resourcesCache.filter(r => r.type === 'blog').length,
        total_case_studies: resourcesCache.filter(r => r.type === 'case-study').length,
        total_use_cases: resourcesCache.filter(r => r.type === 'use-case').length,
        views_last_30_days: resourcesCache.reduce((sum, r) => sum + (r.view_count || 0), 0),
        created_last_30_days: resourcesCache.length
    };
    
    res.json(stats);
});

// Admin routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/cms-admin-standalone.html'));
});

app.get('/admin-local', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/cms-admin-local.html'));
});

// Separate resource pages
app.get('/cms-resources.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms-resources.html'));
});

app.get('/cms-blogs.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms-blogs.html'));
});

app.get('/cms-case-studies.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms-case-studies.html'));
});

app.get('/cms-use-cases.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cms-use-cases.html'));
});

// Manual sync endpoint
app.post('/api/sync', async (req, res) => {
    await syncResourcesFromMainServer();
    res.json({ 
        message: 'Resources synced successfully',
        count: resourcesCache.length
    });
});

// Debug endpoint to check cache state
app.get('/api/debug/cache', (req, res) => {
    res.json({
        cacheLength: resourcesCache.length,
        resources: resourcesCache,
        lastCacheUpdate: lastCacheUpdate,
        isSyncing: isSyncing
    });
});

// Resource Management Endpoints
// Create new resource
app.post('/api/resources', async (req, res) => {
    try {
        const resourceData = req.body;
        
        // Validate required fields - make title optional with default
        if (!resourceData.title || resourceData.title.trim() === '') {
            resourceData.title = 'Untitled Resource';
        }
        
        if (!resourceData.type || resourceData.type.trim() === '') {
            resourceData.type = 'blog';
        }
        
        // Generate a new ID
        const newId = Math.max(...resourcesCache.map(r => r.id), 0) + 1;
        
        // Generate slug from title (with null check)
        const slug = (resourceData.title || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        
        const newResource = {
            id: newId,
            title: resourceData.title,
            slug: slug,
            type: resourceData.type,
            status: resourceData.status || 'draft',
            excerpt: resourceData.excerpt || '',
            content: resourceData.content || '',
            author_name: resourceData.author_name || 'Admin',
            industry_id: resourceData.industry_id || 6,
            industry_name: resourceData.industry_name || 'Technology',
            tags: resourceData.tags || [],
            read_time: 5,
            view_count: 0,
            created_at: new Date().toISOString(),
            published_at: resourceData.status === 'published' ? new Date().toISOString() : null,
            meta_title: resourceData.meta_title || resourceData.title,
            meta_description: resourceData.meta_description || resourceData.excerpt,
            meta_keywords: resourceData.meta_keywords || ''
        };
        
        // Add to cache
        resourcesCache.push(newResource);
        
        console.log('✅ Created new resource:', newResource.title);
        res.json({
            success: true,
            message: 'Resource created successfully',
            resource: newResource
        });
        
    } catch (error) {
        console.error('❌ Error creating resource:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating resource',
            error: error.message
        });
    }
});

// Update resource
app.put('/api/resources/:id', async (req, res) => {
    try {
        const resourceId = parseInt(req.params.id);
        const resourceData = req.body;
        
        const resourceIndex = resourcesCache.findIndex(r => r.id === resourceId);
        if (resourceIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }
        
        // Update resource
        const updatedResource = {
            ...resourcesCache[resourceIndex],
            ...resourceData,
            id: resourceId, // Ensure ID doesn't change
            updated_at: new Date().toISOString()
        };
        
        // Generate slug if title changed
        if (resourceData.title && resourceData.title !== resourcesCache[resourceIndex].title) {
            updatedResource.slug = (resourceData.title || '')
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');
        }
        
        resourcesCache[resourceIndex] = updatedResource;
        
        console.log('✅ Updated resource:', updatedResource.title);
        res.json({
            success: true,
            message: 'Resource updated successfully',
            resource: updatedResource
        });
        
    } catch (error) {
        console.error('❌ Error updating resource:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating resource',
            error: error.message
        });
    }
});

// Delete resource
app.delete('/api/resources/:id', async (req, res) => {
    try {
        const resourceId = parseInt(req.params.id);
        
        const resourceIndex = resourcesCache.findIndex(r => r.id === resourceId);
        if (resourceIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }
        
        const deletedResource = resourcesCache[resourceIndex];
        resourcesCache.splice(resourceIndex, 1);
        
        console.log('✅ Deleted resource:', deletedResource.title);
        res.json({
            success: true,
            message: 'Resource deleted successfully',
            resource: deletedResource
        });
        
    } catch (error) {
        console.error('❌ Error deleting resource:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting resource',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Emma Resources CMS Server (Sync Version) running on port ${PORT}`);
    console.log(`🔗 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🔗 Local Admin: http://localhost:${PORT}/admin-local`);
    console.log(`🔄 Syncing resources from main server...`);
    
    // Initial sync
    await syncResourcesFromMainServer();
    
    console.log(`✅ Ready! ${resourcesCache.length} resources loaded`);
});

module.exports = app;
