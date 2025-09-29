// CMS Integration Example for Dynamic Resources
// This shows how to integrate with your existing CMS or database

class ResourcesCMS {
    constructor() {
        this.apiBase = '/api/resources';
    }

    // Add a new blog post
    async addBlogPost(blogData) {
        const resource = {
            type: 'blog',
            title: blogData.title,
            excerpt: blogData.excerpt,
            author: blogData.author || 'Emma AI Team',
            image: blogData.image || '📝',
            link: `/blog/${blogData.slug}`,
            tags: blogData.tags || [],
            content: blogData.content,
            published: true
        };

        try {
            const response = await fetch(this.apiBase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resource)
            });

            if (response.ok) {
                const newResource = await response.json();
                // Refresh the resources page if it's open
                if (window.resourcesSystem) {
                    window.resourcesSystem.addResource(newResource);
                }
                return newResource;
            }
        } catch (error) {
            console.error('Error adding blog post:', error);
        }
    }

    // Add a new case study
    async addCaseStudy(caseStudyData) {
        const resource = {
            type: 'case-study',
            title: caseStudyData.title,
            excerpt: caseStudyData.excerpt,
            author: caseStudyData.client || 'Client',
            image: caseStudyData.image || '🏢',
            link: `/casestudy/${caseStudyData.slug}`,
            tags: caseStudyData.tags || [],
            content: caseStudyData.content,
            published: true
        };

        try {
            const response = await fetch(this.apiBase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resource)
            });

            if (response.ok) {
                const newResource = await response.json();
                if (window.resourcesSystem) {
                    window.resourcesSystem.addResource(newResource);
                }
                return newResource;
            }
        } catch (error) {
            console.error('Error adding case study:', error);
        }
    }

    // Add a new use case
    async addUseCase(useCaseData) {
        const resource = {
            type: 'use-case',
            title: useCaseData.title,
            excerpt: useCaseData.excerpt,
            author: useCaseData.industry || 'Multi-Industry',
            image: useCaseData.image || '🤖',
            link: `/usecase/${useCaseData.slug}`,
            tags: useCaseData.tags || [],
            content: useCaseData.content,
            published: true
        };

        try {
            const response = await fetch(this.apiBase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resource)
            });

            if (response.ok) {
                const newResource = await response.json();
                if (window.resourcesSystem) {
                    window.resourcesSystem.addResource(newResource);
                }
                return newResource;
            }
        } catch (error) {
            console.error('Error adding use case:', error);
        }
    }

    // Update an existing resource
    async updateResource(id, updateData) {
        try {
            const response = await fetch(`${this.apiBase}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const updatedResource = await response.json();
                if (window.resourcesSystem) {
                    window.resourcesSystem.refreshResources();
                }
                return updatedResource;
            }
        } catch (error) {
            console.error('Error updating resource:', error);
        }
    }

    // Delete a resource
    async deleteResource(id) {
        try {
            const response = await fetch(`${this.apiBase}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                if (window.resourcesSystem) {
                    window.resourcesSystem.refreshResources();
                }
                return true;
            }
        } catch (error) {
            console.error('Error deleting resource:', error);
        }
    }

    // Search resources
    async searchResources(query, filters = {}) {
        try {
            const params = new URLSearchParams({
                search: query,
                ...filters
            });

            const response = await fetch(`${this.apiBase}?${params}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error searching resources:', error);
        }
    }
}

// Example usage in your CMS or admin panel
const cms = new ResourcesCMS();

// Example: Adding a new blog post from your CMS
async function addNewBlogPost() {
    const blogData = {
        title: 'AI Trends in 2024: What to Expect',
        excerpt: 'Explore the latest AI trends and technologies that will shape business automation in 2024.',
        author: 'Emma AI Team',
        slug: 'ai-trends-2024',
        tags: ['AI', 'Trends', '2024', 'Technology'],
        content: 'Full blog post content here...',
        image: '🚀'
    };

    const newPost = await cms.addBlogPost(blogData);
    console.log('New blog post added:', newPost);
}

// Example: Adding a new case study
async function addNewCaseStudy() {
    const caseStudyData = {
        title: 'Tech Startup: 70% Faster Customer Onboarding',
        excerpt: 'How a tech startup reduced customer onboarding time by 70% using Emma AI automation.',
        client: 'TechCorp',
        slug: 'techcorp-onboarding',
        tags: ['Startup', 'Onboarding', 'Automation', 'ROI'],
        content: 'Full case study content here...',
        image: '⚡'
    };

    const newCaseStudy = await cms.addCaseStudy(caseStudyData);
    console.log('New case study added:', newCaseStudy);
}

// Example: Adding a new use case
async function addNewUseCase() {
    const useCaseData = {
        title: 'Automated Invoice Processing',
        excerpt: 'Learn how to implement AI-powered invoice processing that reduces manual work by 90%.',
        industry: 'Finance',
        slug: 'automated-invoice-processing',
        tags: ['Finance', 'Invoice', 'Automation', 'AI'],
        content: 'Full use case content here...',
        image: '📄'
    };

    const newUseCase = await cms.addUseCase(useCaseData);
    console.log('New use case added:', newUseCase);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourcesCMS;
}
