// Example API endpoint for dynamic resources
// This file demonstrates how to integrate with your CMS or database

const express = require('express');
const app = express();

// Mock database - replace with your actual database
const resources = [
    {
        id: 1,
        type: 'blog',
        title: 'The Future of AI in Healthcare Operations',
        excerpt: 'Discover how AI is transforming healthcare operations, from patient care coordination to administrative automation.',
        author: 'Emma AI Team',
        date: '2024-01-15',
        image: '📝',
        link: '/blog/1',
        tags: ['Healthcare', 'AI', 'Automation'],
        published: true
    },
    {
        id: 2,
        type: 'blog',
        title: 'Banking AI: Revolutionizing Customer Experience',
        excerpt: 'Learn how intelligent automation is reshaping banking operations and improving customer satisfaction.',
        author: 'Emma AI Team',
        date: '2024-01-10',
        image: '🏦',
        link: '/blog/2',
        tags: ['Banking', 'Customer Experience', 'AI'],
        published: true
    },
    {
        id: 3,
        type: 'case-study',
        title: 'Regional Hospital: 40% Reduction in Admin Time',
        excerpt: 'How a regional hospital implemented Emma AI to streamline patient scheduling and reduce administrative overhead.',
        author: 'Healthcare',
        date: '2024-01-08',
        image: '🏥',
        link: '/casestudy/1',
        tags: ['Healthcare', 'Case Study', 'ROI'],
        published: true
    },
    {
        id: 4,
        type: 'use-case',
        title: 'Intelligent Customer Support Automation',
        excerpt: 'Learn how to implement AI-powered customer support that handles 80% of inquiries automatically.',
        author: 'Multi-Industry',
        date: '2024-01-05',
        image: '🤖',
        link: '/usecase/1',
        tags: ['Customer Support', 'Automation', 'AI'],
        published: true
    }
];

// API endpoint to get all resources
app.get('/api/resources', (req, res) => {
    try {
        const { type, search, page = 1, limit = 10 } = req.query;
        
        let filteredResources = resources.filter(resource => resource.published);
        
        // Filter by type
        if (type && type !== 'all') {
            filteredResources = filteredResources.filter(resource => resource.type === type);
        }
        
        // Search functionality
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredResources = filteredResources.filter(resource => 
                resource.title.toLowerCase().includes(searchTerm) ||
                resource.excerpt.toLowerCase().includes(searchTerm) ||
                resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedResources = filteredResources.slice(startIndex, endIndex);
        
        res.json({
            resources: paginatedResources,
            total: filteredResources.length,
            page: parseInt(page),
            totalPages: Math.ceil(filteredResources.length / limit)
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API endpoint to get a single resource
app.get('/api/resources/:id', (req, res) => {
    const resource = resources.find(r => r.id === parseInt(req.params.id));
    if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(resource);
});

// API endpoint to add a new resource (for CMS integration)
app.post('/api/resources', (req, res) => {
    try {
        const newResource = {
            id: resources.length + 1,
            ...req.body,
            date: new Date().toISOString().split('T')[0],
            published: true
        };
        
        resources.unshift(newResource);
        res.status(201).json(newResource);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create resource' });
    }
});

// API endpoint to update a resource
app.put('/api/resources/:id', (req, res) => {
    try {
        const index = resources.findIndex(r => r.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        resources[index] = { ...resources[index], ...req.body };
        res.json(resources[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update resource' });
    }
});

// API endpoint to delete a resource
app.delete('/api/resources/:id', (req, res) => {
    try {
        const index = resources.findIndex(r => r.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        resources.splice(index, 1);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

module.exports = app;
