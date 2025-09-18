// Dynamic Content Loader for Emma Website
// This script loads content from the CMS and updates the website in real-time

class DynamicContentLoader {
    constructor() {
        this.apiBase = '/api/content';
        this.updateInterval = 30000; // Update every 30 seconds (much more reasonable)
        this.lastUpdate = 0;
        this.isLoading = false;
        this.requestCache = new Map();
        this.cacheTimeout = 60000; // Cache responses for 1 minute
        this.init();
    }

    async init() {
        try {
            await this.loadAllContent();
            this.startAutoUpdate();
        } catch (error) {
            console.error('Error initializing dynamic content:', error);
        }
    }

    async loadAllContent() {
        if (this.isLoading) {
            return;
        }
        
        this.isLoading = true;
        try {
            // Load content in parallel instead of sequentially
            const promises = [
                this.loadNavigation(),
                this.loadHeroSection(),
                this.loadBanners(),
                this.loadSections(),
                this.loadPricingData()
            ];
            
            await Promise.allSettled(promises);
        } catch (error) {
            console.error('Error loading content:', error);
        } finally {
            this.isLoading = false;
        }
    }

    async loadNavigation() {
        try {
            const response = await this.cachedFetch(`${this.apiBase}/navigation`);
            if (response && response.ok) {
                const navData = await response.json();
                this.updateNavigation(navData);
            }
        } catch (error) {
            console.error('Error loading navigation:', error);
        }
    }

    async loadHeroSection() {
        try {
            const response = await this.cachedFetch(`${this.apiBase}/hero`);
            if (response && response.ok) {
                const heroData = await response.json();
                this.updateHeroSection(heroData);
                console.log('Hero section loaded:', heroData);
            } else {
                console.error('Failed to load hero section:', response?.status);
            }
        } catch (error) {
            console.error('Error loading hero section:', error);
        }
    }

    async loadBanners() {
        try {
            const response = await this.cachedFetch(`${this.apiBase}/banners`);
            if (response && response.ok) {
                const banners = await response.json();
                this.updateBanners(banners);
            }
        } catch (error) {
            console.error('Error loading banners:', error);
        }
    }

    async loadSections() {
        try {
            const response = await this.cachedFetch(`${this.apiBase}/sections`);
            if (response && response.ok) {
                const sections = await response.json();
                this.updateSections(sections);
            }
        } catch (error) {
            console.error('Error loading sections:', error);
        }
    }

    async loadPricingData() {
        try {
            const response = await this.cachedFetch(`${this.apiBase}/pricing`);
            if (response && response.ok) {
                const pricingData = await response.json();
                this.updatePricingContent(pricingData);
            } else {
                console.error('Failed to load pricing data:', response?.status, response?.statusText);
            }
        } catch (error) {
            console.error('Error loading pricing data:', error);
        }
    }

    updateNavigation(navData) {
        const navLinks = document.getElementById('nav-links');
        if (navLinks && navData.links) {
            navLinks.innerHTML = '';
            navData.links.forEach(link => {
                const navLink = document.createElement('a');
                navLink.href = link.href || '#';
                navLink.className = 'nav-link';
                navLink.textContent = link.text;
                navLinks.appendChild(navLink);
            });
        }
    }

    updateHeroSection(heroData) {
        // Check if elements exist
        const heroTitle = document.getElementById('hero-title');
        const heroSubtitle = document.getElementById('hero-subtitle');
        const heroDescription = document.getElementById('hero-description');
        const primaryBtn = document.getElementById('hero-primary-btn');
        const primaryText = document.getElementById('hero-primary-text');
        
        // Add a subtle update indicator
        if (heroTitle) {
            heroTitle.style.transition = 'all 0.3s ease';
            heroTitle.style.opacity = '0.7';
            setTimeout(() => {
                if (heroTitle) heroTitle.style.opacity = '1';
            }, 100);
        }
        
        // Update hero title
        if (heroTitle && heroData.title) {
            heroTitle.textContent = heroData.title;
        }

        // Update hero subtitle
        if (heroSubtitle && heroData.subtitle) {
            heroSubtitle.textContent = heroData.subtitle;
        }

        // Update hero description
        if (heroDescription && heroData.description) {
            heroDescription.textContent = heroData.description;
        }

        // Update primary button
        if (primaryBtn && heroData.primaryButton) {
            if (primaryText) {
                const buttonText = heroData.primaryButton.text || 'See Emma in Action';
                primaryText.textContent = buttonText;
            }
            if (heroData.primaryButton.href) {
                primaryBtn.onclick = () => window.location.href = heroData.primaryButton.href;
            }
        }

        // Update secondary button
        const secondaryBtn = document.getElementById('hero-secondary-btn');
        const secondaryText = document.getElementById('hero-secondary-text');
        if (secondaryBtn && heroData.secondaryButton) {
            if (secondaryText && heroData.secondaryButton.text) {
                secondaryText.textContent = heroData.secondaryButton.text;
            }
            if (heroData.secondaryButton.href) {
                secondaryBtn.onclick = () => window.location.href = heroData.secondaryButton.href;
            }
            secondaryBtn.style.display = heroData.secondaryButton.show ? 'inline-flex' : 'none';
        }
    }

    updateBanners(banners) {
        // This will be implemented to show banners in the hero section
    }

    updateSections(sections) {
        // Update various sections of the website
        Object.keys(sections).forEach(sectionKey => {
            const section = sections[sectionKey];
            this.updateSection(sectionKey, section);
        });
    }

    updateSection(sectionKey, sectionData) {
        // Update section titles and content
        const titleElement = document.getElementById(`${sectionKey}-title`);
        if (titleElement && sectionData.title) {
            titleElement.textContent = sectionData.title;
        }

        const subtitleElement = document.getElementById(`${sectionKey}-subtitle`);
        if (subtitleElement && sectionData.subtitle) {
            subtitleElement.textContent = sectionData.subtitle;
        }
    }

    updatePricingContent(pricingData) {
        // Update pricing section title and subtitle
        const pricingTitle = document.querySelector('.pricing .section-title');
        const pricingSubtitle = document.querySelector('.pricing .section-subtitle');
        
        if (pricingTitle && pricingData.title) {
            pricingTitle.textContent = pricingData.title;
        }
        if (pricingSubtitle && pricingData.subtitle) {
            pricingSubtitle.textContent = pricingData.subtitle;
        }

        // Update pricing cards
        const pricingCards = document.querySelector('.pricing-cards');
        
        if (pricingCards && pricingData.plans && pricingData.plans.length > 0) {
            pricingCards.innerHTML = '';
            
            pricingData.plans.forEach((plan, index) => {
                const card = this.createPricingCard(plan);
                pricingCards.appendChild(card);
            });
        } else {
            console.error('Pricing cards container not found or no plans data');
        }

        // Update custom solutions section
        this.updateCustomSolutions(pricingData.customSolutions);
    }

    createPricingCard(plan) {
        const card = document.createElement('div');
        card.className = `pricing-card ${plan.featured ? 'featured' : ''}`;
        
        const features = Array.isArray(plan.features) ? plan.features : [];
        const featuresHtml = features.map(feature => `
            <div class="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"></path>
                </svg>
                <span>${feature}</span>
            </div>
        `).join('');

        // Get different icons for different plans
        let iconSvg = '';
        if (plan.id === 'starter') {
            iconSvg = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
            `;
        } else if (plan.id === 'professional') {
            iconSvg = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
            `;
        } else if (plan.id === 'enterprise') {
            iconSvg = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"></path>
                </svg>
            `;
        } else {
            iconSvg = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
            `;
        }
        
        card.innerHTML = `
            ${plan.featured ? '<div class="popular-badge">Most Popular</div>' : ''}
            <div class="card-header">
                <div class="plan-icon">
                    ${iconSvg}
                </div>
                <h3 class="plan-name">${plan.name}</h3>
                ${plan.description && plan.description.trim() ? `<p class="plan-description">${plan.description}</p>` : ''}
            </div>
            <div class="plan-features">
                ${featuresHtml}
            </div>
            <div class="plan-price">
                <span class="price-amount">${plan.price || 'Custom'}</span>
                <span class="price-period">${plan.period || 'Contact Sales'}</span>
            </div>
            <button class="btn ${plan.featured ? 'btn-primary' : 'btn-outline'} plan-btn" onclick="showContactForm()">${plan.buttonText || 'Contact Sales'}</button>
        `;
        
        return card;
    }

    updateCustomSolutions(customSolutions) {
        if (!customSolutions) return;
        
        // Update custom solutions title
        const customTitle = document.querySelector('.custom-solutions h3');
        if (customTitle && customSolutions.title) {
            customTitle.textContent = customSolutions.title;
        }
        
        // Update custom solutions description
        const customDescription = document.querySelector('.custom-solutions p');
        if (customDescription && customSolutions.description) {
            customDescription.textContent = customSolutions.description;
        }
        
        // Update custom solutions features
        const customFeatures = document.querySelector('.custom-features');
        if (customFeatures && customSolutions.features) {
            customFeatures.innerHTML = '';
            customSolutions.features.forEach(feature => {
                const featureElement = document.createElement('div');
                featureElement.className = 'custom-feature';
                featureElement.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 12l2 2 4-4"></path>
                    </svg>
                    <span>${feature}</span>
                `;
                customFeatures.appendChild(featureElement);
            });
        }
    }

    startAutoUpdate() {
        // Load content immediately
        this.loadAllContent();
        
        // Set up interval for regular updates (much less frequent)
        setInterval(() => {
            this.checkForUpdates();
        }, this.updateInterval);
    }
    
    async checkForUpdates() {
        if (this.isLoading) {
            console.log('Update check skipped - content already loading');
            return;
        }
        
        try {
            const response = await this.cachedFetch(`${this.apiBase}/hero`);
            if (response && response.ok) {
                const heroData = await response.json();
                const currentTime = Date.now();
                
                // Only update if we have new data or it's been a while
                if (currentTime - this.lastUpdate > 10000) { // 10 seconds minimum between updates
                    this.updateHeroSection(heroData);
                    this.lastUpdate = currentTime;
                }
            }
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }

    // Method to manually refresh content
    async refresh() {
        console.log('Manual refresh triggered');
        await this.loadAllContent();
    }

    // Method to refresh hero section specifically
    async refreshHero() {
        console.log('Hero refresh triggered');
        await this.loadHeroSection();
    }

    // Method to test pricing cards specifically
    async testPricingCards() {
        console.log('Testing pricing cards...');
        await this.loadPricingData();
    }

    // Cached fetch method to prevent duplicate requests
    async cachedFetch(url) {
        const now = Date.now();
        const cacheKey = url;
        
        // Check if we have a cached response that's still valid
        if (this.requestCache.has(cacheKey)) {
            const cached = this.requestCache.get(cacheKey);
            if (now - cached.timestamp < this.cacheTimeout) {
                // Clone the response to avoid body stream issues
                return cached.response.clone();
            } else {
                // Cache expired, remove it
                this.requestCache.delete(cacheKey);
            }
        }
        
        try {
            const response = await fetch(url);
            
            // Clone the response for caching and immediate use
            const responseClone = response.clone();
            
            // Cache the cloned response
            this.requestCache.set(cacheKey, {
                response: responseClone,
                timestamp: now
            });
            
            return response;
        } catch (error) {
            console.error('Fetch error for:', url, error);
            throw error;
        }
    }
}

// Initialize the dynamic content loader when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dynamicContent = new DynamicContentLoader();
    
    // Test function to check if elements exist
    window.testElements = () => {
        console.log('Testing elements...');
        const elements = {
            'hero-title': document.getElementById('hero-title'),
            'hero-subtitle': document.getElementById('hero-subtitle'),
            'hero-description': document.getElementById('hero-description'),
            'hero-primary-btn': document.getElementById('hero-primary-btn'),
            'hero-primary-text': document.getElementById('hero-primary-text')
        };
        
        Object.keys(elements).forEach(id => {
            console.log(`${id}:`, elements[id] ? 'Found' : 'Not found');
        });
    };
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicContentLoader;
}
