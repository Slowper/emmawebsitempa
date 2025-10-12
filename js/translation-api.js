/**
 * Translation API Manager
 * Handles communication with translation services and caching
 */

class TranslationAPI {
    constructor() {
        this.cache = new Map();
        this.cacheKey = 'emma_translations_cache';
        this.loadCacheFromStorage();
    }

    /**
     * Load cached translations from localStorage
     */
    loadCacheFromStorage() {
        try {
            const stored = localStorage.getItem(this.cacheKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.cache = new Map(Object.entries(data));
                console.log('📦 Loaded translation cache:', this.cache.size, 'items');
            }
        } catch (error) {
            console.error('Error loading translation cache:', error);
        }
    }

    /**
     * Save cache to localStorage
     */
    saveCacheToStorage() {
        try {
            const data = Object.fromEntries(this.cache);
            localStorage.setItem(this.cacheKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving translation cache:', error);
        }
    }

    /**
     * Generate cache key for a text
     */
    getCacheKey(text, targetLang, sourceLang = 'en') {
        return `${sourceLang}_${targetLang}_${text.substring(0, 100)}`;
    }

    /**
     * Translate a single text
     * @param {string} text - Text to translate
     * @param {string} targetLang - Target language code (default: 'ar')
     * @param {string} sourceLang - Source language code (default: 'en')
     * @returns {Promise<string>} Translated text
     */
    async translate(text, targetLang = 'ar', sourceLang = 'en') {
        if (!text || !text.trim()) {
            return text;
        }

        // Check cache first
        const cacheKey = this.getCacheKey(text, targetLang, sourceLang);
        if (this.cache.has(cacheKey)) {
            console.log('✅ Cache hit for:', text.substring(0, 50));
            return this.cache.get(cacheKey);
        }

        try {
            console.log('🌐 Translating:', text.substring(0, 50), '...');
            
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    targetLang,
                    sourceLang
                })
            });

            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status}`);
            }

            const data = await response.json();
            const translatedText = data.translatedText || text;

            // Cache the result
            this.cache.set(cacheKey, translatedText);
            this.saveCacheToStorage();

            return translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            // Return original text as fallback
            return text;
        }
    }

    /**
     * Translate multiple texts in batch
     * @param {string[]} texts - Array of texts to translate
     * @param {string} targetLang - Target language code (default: 'ar')
     * @param {string} sourceLang - Source language code (default: 'en')
     * @returns {Promise<string[]>} Array of translated texts
     */
    async batchTranslate(texts, targetLang = 'ar', sourceLang = 'en') {
        if (!texts || texts.length === 0) {
            return [];
        }

        // Separate cached and uncached texts
        const results = new Array(texts.length);
        const toTranslate = [];
        const toTranslateIndices = [];

        texts.forEach((text, index) => {
            const cacheKey = this.getCacheKey(text, targetLang, sourceLang);
            if (this.cache.has(cacheKey)) {
                results[index] = this.cache.get(cacheKey);
            } else {
                toTranslate.push(text);
                toTranslateIndices.push(index);
            }
        });

        if (toTranslate.length === 0) {
            console.log('✅ All texts found in cache');
            return results;
        }

        try {
            console.log(`🌐 Batch translating ${toTranslate.length} texts...`);
            
            const response = await fetch('/api/translate/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    texts: toTranslate,
                    targetLang,
                    sourceLang
                })
            });

            if (!response.ok) {
                throw new Error(`Batch translation API error: ${response.status}`);
            }

            const data = await response.json();
            const translations = data.translations || toTranslate;

            // Store results and cache them
            translations.forEach((translation, i) => {
                const originalIndex = toTranslateIndices[i];
                results[originalIndex] = translation;
                
                const cacheKey = this.getCacheKey(toTranslate[i], targetLang, sourceLang);
                this.cache.set(cacheKey, translation);
            });

            this.saveCacheToStorage();

            return results;
        } catch (error) {
            console.error('Batch translation error:', error);
            // Fill remaining slots with original texts
            toTranslateIndices.forEach((index, i) => {
                results[index] = toTranslate[i];
            });
            return results;
        }
    }

    /**
     * Clear translation cache
     */
    clearCache() {
        this.cache.clear();
        localStorage.removeItem(this.cacheKey);
        console.log('🗑️ Translation cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            items: Array.from(this.cache.keys()).slice(0, 10) // First 10 items
        };
    }
}

// Create global instance
window.translationAPI = new TranslationAPI();

console.log('✅ Translation API initialized');
