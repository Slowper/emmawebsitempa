// Emma Resources CMS Integration Script
// This script integrates the new CMS with the existing website

class EmmaCMSIntegration {
    constructor() {
        this.apiBase = 'http://localhost:3001/api';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupIntegration());
        } else {
            this.setupIntegration();
        }
    }

    setupIntegration() {
        // Check if we're on the resources page
        if (window.location.pathname.includes('/resources')) {
            this.integrateResourcesPage();
        }
        
        // Check if we're on a resource detail page
        if (this.isResourceDetailPage()) {
            this.integrateResourceDetailPage();
        }
    }

    isResourceDetailPage() {
        const path = window.location.pathname;
        return path.includes('/blog/') || path.includes('/casestudy/') || path.includes('/usecase/');
    }

    async integrateResourcesPage() {
        try {
            // Load resources from CMS API
            const resources = await this.loadResources();
            
            // Update the resources grid
            this.updateResourcesGrid(resources);
            
            // Update statistics
            this.updateStatistics(resources);
            
            // Set up filtering
            this.setupFiltering(resources);
            
        } catch (error) {
            console.error('Error integrating resources page:', error);
            this.showFallbackContent();
        }
    }

    async loadResources() {
        const cacheKey = 'resources_all';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.apiBase}/resources?status=published&limit=50`);
            const data = await response.json();
            
            this.cache.set(cacheKey, {
                data: data.resources || [],
                timestamp: Date.now()
            });
            
            return data.resources || [];
        } catch (error) {
            console.error('Error loading resources from CMS:', error);
            return [];
        }
    }

    updateResourcesGrid(resources) {
        const grid = document.getElementById('resources-grid');
        if (!grid) return;

        // Hide loading state
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.style.display = 'none';
        }

        // Clear existing content
        const existingCards = grid.querySelectorAll('.resource-card');
        existingCards.forEach(card => card.remove());

        if (resources.length === 0) {
            this.showEmptyState();
            return;
        }

        // Create resource cards
        resources.forEach(resource => {
            const card = this.createResourceCard(resource);
            grid.appendChild(card);
        });
    }

    createResourceCard(resource) {
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.setAttribute('data-category', resource.type);
        card.setAttribute('data-industry', resource.industry_id || 'all');

        const typeConfig = {
            'blog': { icon: '📝', category: 'Blog Post' },
            'case-study': { icon: '📊', category: 'Case Study' },
            'use-case': { icon: '🔧', category: 'Use Case' }
        };

        const config = typeConfig[resource.type] || typeConfig['blog'];
        const formattedDate = new Date(resource.published_at || resource.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Parse tags
        let tags = [];
        if (resource.tags) {
            try {
                tags = typeof resource.tags === 'string' ? JSON.parse(resource.tags) : resource.tags;
            } catch (e) {
                tags = [];
            }
        }

        // Create link based on type
        let linkUrl = '#';
        if (resource.type === 'blog') {
            linkUrl = `/blog/${resource.slug}`;
        } else if (resource.type === 'case-study') {
            linkUrl = `/casestudy/${resource.slug}`;
        } else if (resource.type === 'use-case') {
            linkUrl = `/usecase/${resource.slug}`;
        }

        card.innerHTML = `
            <div class="resource-image">
                ${resource.featured_image ? 
                    `<img src="${resource.featured_image}" alt="${resource.title}" onerror="this.parentElement.innerHTML='<div class=\\"fallback-icon\\">${config.icon}</div>'">` :
                    `<div class="fallback-icon">${config.icon}</div>`
                }
            </div>
            <div class="resource-content">
                <div class="resource-category">${config.category}</div>
                <h3 class="resource-title">${resource.title}</h3>
                <p class="resource-excerpt">${resource.excerpt || 'No description available.'}</p>
                <div class="resource-meta">
                    <div class="author-info">
                        <div class="author-avatar">
                            ${resource.author_image ? 
                                `<img src="${resource.author_image}" alt="${resource.author_name}" onerror="this.parentElement.innerHTML='${(resource.author_name || 'A').charAt(0).toUpperCase()}'">` :
                                (resource.author_name || 'A').charAt(0).toUpperCase()
                            }
                        </div>
                        <span>${resource.author_name || 'Unknown'} • ${formattedDate} • ${resource.read_time || 5} min read</span>
                    </div>
                    <a href="${linkUrl}" class="resource-link">${resource.type === 'blog' ? 'Read More' : 'View'} →</a>
                </div>
                <div class="resource-tags">
                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        return card;
    }

    updateStatistics(resources) {
        const stats = {
            total: resources.length,
            blogs: resources.filter(r => r.type === 'blog').length,
            caseStudies: resources.filter(r => r.type === 'case-study').length,
            useCases: resources.filter(r => r.type === 'use-case').length
        };

        // Update stat elements if they exist
        const totalEl = document.getElementById('total-resources');
        if (totalEl) totalEl.textContent = stats.total;

        const blogsEl = document.getElementById('use-cases-count');
        if (blogsEl) blogsEl.textContent = stats.blogs;

        const caseStudiesEl = document.getElementById('case-studies-count');
        if (caseStudiesEl) caseStudiesEl.textContent = stats.caseStudies;

        const useCasesEl = document.getElementById('use-cases-count');
        if (useCasesEl) useCasesEl.textContent = stats.useCases;
    }

    setupFiltering(resources) {
        // Set up type filtering
        const typeFilters = document.querySelectorAll('.filter-tab');
        typeFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                const type = filter.onclick ? filter.onclick.toString().match(/filterByType\('([^']+)'\)/)?.[1] : null;
                this.filterResources(resources, type);
            });
        });

        // Set up industry filtering
        const industryFilters = document.querySelectorAll('.industry-tag');
        industryFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                const industry = filter.onclick ? filter.onclick.toString().match(/filterByIndustry\('([^']+)'\)/)?.[1] : null;
                this.filterResourcesByIndustry(resources, industry);
            });
        });
    }

    filterResources(resources, type) {
        const filtered = type === 'all' ? resources : resources.filter(r => r.type === type);
        this.updateResourcesGrid(filtered);
        this.updateActiveFilter('type', type);
    }

    filterResourcesByIndustry(resources, industry) {
        const filtered = industry === 'all' ? resources : resources.filter(r => r.industry_id == industry);
        this.updateResourcesGrid(filtered);
        this.updateActiveFilter('industry', industry);
    }

    updateActiveFilter(type, value) {
        // Remove active class from all filters of this type
        const selector = type === 'type' ? '.filter-tab' : '.industry-tag';
        document.querySelectorAll(selector).forEach(el => el.classList.remove('active'));
        
        // Add active class to clicked filter
        const activeFilter = Array.from(document.querySelectorAll(selector)).find(el => {
            const onclick = el.onclick ? el.onclick.toString() : '';
            const pattern = type === 'type' ? /filterByType\('([^']+)'\)/ : /filterByIndustry\('([^']+)'\)/;
            const match = onclick.match(pattern);
            return match && match[1] === value;
        });
        
        if (activeFilter) {
            activeFilter.classList.add('active');
        }
    }

    showEmptyState() {
        const grid = document.getElementById('resources-grid');
        if (!grid) return;

        grid.innerHTML = `
            <div class="empty-state">
                <h3>No resources found</h3>
                <p>Check back later for new content.</p>
            </div>
        `;
    }

    showFallbackContent() {
        // If CMS is not available, show a message
        const grid = document.getElementById('resources-grid');
        if (!grid) return;

        grid.innerHTML = `
            <div class="empty-state">
                <h3>Resources temporarily unavailable</h3>
                <p>We're working to restore our resources. Please check back soon.</p>
            </div>
        `;
    }

    async integrateResourceDetailPage() {
        // Redirect to the CMS resource reader
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        
        if (segments.length >= 2) {
            const slug = segments[1];
            window.location.href = `/cms-resource-reader.html?slug=${slug}`;
        }
    }

    // Method to refresh cache
    clearCache() {
        this.cache.clear();
    }

    // Method to preload resources
    async preloadResources() {
        try {
            await this.loadResources();
        } catch (error) {
            console.error('Error preloading resources:', error);
        }
    }
}

// Global functions for backward compatibility with existing website
function filterByType(type) {
    if (window.cmsIntegration) {
        window.cmsIntegration.filterResources(window.cmsIntegration.cache.get('resources_all')?.data || [], type);
    }
}

function filterByIndustry(industry) {
    if (window.cmsIntegration) {
        window.cmsIntegration.filterResourcesByIndustry(window.cmsIntegration.cache.get('resources_all')?.data || [], industry);
    }
}

// Initialize integration
document.addEventListener('DOMContentLoaded', () => {
    window.cmsIntegration = new EmmaCMSIntegration();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmmaCMSIntegration;
}
