/**
 * Resources Translation Manager
 * Manages translation of dynamic content for the Resources page
 */

class ResourcesTranslationManager {
    constructor() {
        this.translationAPI = window.translationAPI;
        this.cache = new Map();
        this.cacheKey = 'emma_resources_translations';
        this.loadCache();
    }

    /**
     * Load cached resource translations from localStorage
     */
    loadCache() {
        try {
            const stored = localStorage.getItem(this.cacheKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.cache = new Map(Object.entries(data));
                console.log('📦 Loaded resources translation cache:', this.cache.size, 'resources');
            }
        } catch (error) {
            console.error('Error loading resources cache:', error);
        }
    }

    /**
     * Save cache to localStorage
     */
    saveCache() {
        try {
            const data = Object.fromEntries(this.cache);
            localStorage.setItem(this.cacheKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving resources cache:', error);
        }
    }

    /**
     * Get cached translation for a resource
     */
    getCachedTranslation(resourceId) {
        return this.cache.get(String(resourceId));
    }

    /**
     * Cache a resource translation
     */
    cacheTranslation(resourceId, translation) {
        this.cache.set(String(resourceId), {
            ...translation,
            cachedAt: Date.now()
        });
        this.saveCache();
    }

    /**
     * Translate a single resource
     * @param {Object} resource - Resource object to translate
     * @returns {Promise<Object>} Resource with translated fields
     */
    async translateResource(resource) {
        if (!resource || !resource.id) {
            return resource;
        }

        // Check local cache first
        const cached = this.getCachedTranslation(resource.id);
        if (cached && this.isCacheValid(cached)) {
            console.log(`✅ Using cached translation for resource #${resource.id}`);
            return {
                ...resource,
                displayTitle: cached.title_ar,
                displayExcerpt: cached.excerpt_ar
            };
        }

        try {
            // Try to get translation from server (database cache)
            console.log(`🌐 Fetching translation for resource #${resource.id}...`);
            
            const response = await fetch(`/api/resources/${resource.id}/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    targetLang: 'ar'
                })
            });

            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.translation) {
                // Cache the translation locally
                this.cacheTranslation(resource.id, data.translation);

                return {
                    ...resource,
                    displayTitle: data.translation.title_ar || resource.title,
                    displayExcerpt: data.translation.excerpt_ar || resource.excerpt
                };
            }

            // Fallback to original
            return {
                ...resource,
                displayTitle: resource.title,
                displayExcerpt: resource.excerpt
            };

        } catch (error) {
            console.error(`Error translating resource #${resource.id}:`, error);
            // Return original as fallback
            return {
                ...resource,
                displayTitle: resource.title,
                displayExcerpt: resource.excerpt
            };
        }
    }

    /**
     * Translate multiple resources
     * @param {Object[]} resources - Array of resource objects
     * @returns {Promise<Object[]>} Array of resources with translated fields
     */
    async translateResources(resources) {
        if (!resources || resources.length === 0) {
            return [];
        }

        console.log(`🌐 Translating ${resources.length} resources...`);

        // Process resources in batches to avoid overwhelming the server
        const batchSize = 10;
        const results = [];

        for (let i = 0; i < resources.length; i += batchSize) {
            const batch = resources.slice(i, i + batchSize);
            const batchPromises = batch.map(resource => this.translateResource(resource));
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Small delay between batches to avoid rate limiting
            if (i + batchSize < resources.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log(`✅ Translated ${results.length} resources`);
        return results;
    }

    /**
     * Check if cached translation is still valid (24 hours)
     */
    isCacheValid(cached) {
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        return cached.cachedAt && (Date.now() - cached.cachedAt) < maxAge;
    }

    /**
     * Clear translation cache
     */
    clearCache() {
        this.cache.clear();
        localStorage.removeItem(this.cacheKey);
        console.log('🗑️ Resources translation cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            resources: Array.from(this.cache.keys()).slice(0, 10)
        };
    }

    /**
     * Pre-fetch translations for visible resources
     * This can be called when resources are first loaded
     */
    async prefetchTranslations(resources) {
        console.log('🔄 Pre-fetching translations...');
        
        // Only fetch for resources not in cache
        const toFetch = resources.filter(r => !this.getCachedTranslation(r.id));
        
        if (toFetch.length === 0) {
            console.log('✅ All translations already cached');
            return;
        }

        // Fetch in background without blocking
        this.translateResources(toFetch).catch(error => {
            console.error('Pre-fetch error:', error);
        });
    }
}

// Create global instance
window.resourcesTranslationManager = new ResourcesTranslationManager();

console.log('✅ Resources Translation Manager initialized');
