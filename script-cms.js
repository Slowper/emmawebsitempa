// CMS Integration Script
class CMSService {
    constructor() {
        this.apiBase = window.location.origin + '/api';
        this.contentCache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    async fetchContent(sectionKey) {
        // Check cache first
        const cached = this.contentCache.get(sectionKey);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.apiBase}/content/section/${sectionKey}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch content for ${sectionKey}`);
            }
            
            const data = await response.json();
            
            // Cache the result
            this.contentCache.set(sectionKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.warn(`Failed to load content for ${sectionKey}:`, error);
            return null;
        }
    }

    async loadAllContent() {
        try {
            const response = await fetch(`${this.apiBase}/content/sections`);
            if (!response.ok) {
                throw new Error('Failed to fetch content sections');
            }
            
            const sections = await response.json();
            const contentMap = new Map();
            
            sections.forEach(section => {
                contentMap.set(section.section_key, section);
            });
            
            return contentMap;
        } catch (error) {
            console.warn('Failed to load content sections:', error);
            return new Map();
        }
    }

    async loadWebsiteSettings() {
        try {
            const response = await fetch(`${this.apiBase}/settings`);
            if (!response.ok) {
                throw new Error('Failed to fetch website settings');
            }
            
            const settings = await response.json();
            const settingsMap = new Map();
            
            // Handle the API response format
            Object.keys(settings).forEach(key => {
                settingsMap.set(key, settings[key].value);
            });
            
            return settingsMap;
        } catch (error) {
            console.warn('Failed to load website settings:', error);
            return new Map();
        }
    }

    updateElementContent(elementId, content, isHtml = false) {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (isHtml) {
            element.innerHTML = content;
        } else {
            element.textContent = content;
        }
    }

    updateLogo(logoUrl, altText = 'Emma Logo') {
        console.log('Updating logo with URL:', logoUrl);
        const logoImage = document.querySelector('.logo-image');
        const logoFallback = document.querySelector('.logo-fallback');
        
        console.log('Logo image element:', logoImage);
        console.log('Logo fallback element:', logoFallback);
        
        if (logoImage) {
            logoImage.src = logoUrl;
            logoImage.alt = altText;
            logoImage.style.display = 'block';
            
            if (logoFallback) {
                logoFallback.style.display = 'none';
            }
            console.log('Logo updated successfully');
        } else {
            console.warn('Logo image element not found');
        }
    }

    async loadLogo() {
        try {
            console.log('Loading logo from CMS...');
            const settings = await this.loadWebsiteSettings();
            console.log('Settings loaded:', settings);
            
            const logoUrl = settings.get('logo_url') || 'Logo And Recording/cropped_circle_image.png';
            const altText = settings.get('logo_alt_text') || 'Emma Logo';
            
            console.log('Logo URL:', logoUrl);
            console.log('Alt Text:', altText);
            
            this.updateLogo(logoUrl, altText);
        } catch (error) {
            console.warn('Failed to load logo from CMS:', error);
            // Keep default logo
        }
    }

    async loadBlogStyles() {
        try {
            console.log('Loading blog styles from CMS...');
            const settings = await this.loadWebsiteSettings();
            
            const quoteStyle = settings.get('blog_quote_style') || 'default';
            const authorStyle = settings.get('blog_author_style') || 'default';
            const metaStyle = settings.get('blog_meta_style') || 'default';
            const contentStyle = settings.get('blog_content_style') || 'default';
            
            console.log('Blog styles loaded:', { quoteStyle, authorStyle, metaStyle, contentStyle });
            
            this.applyBlogStyles(quoteStyle, authorStyle, metaStyle, contentStyle);
        } catch (error) {
            console.warn('Failed to load blog styles from CMS:', error);
        }
    }

    applyBlogStyles(quoteStyle, authorStyle, metaStyle, contentStyle) {
        // Create or update style element
        let styleElement = document.getElementById('dynamic-blog-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'dynamic-blog-styles';
            document.head.appendChild(styleElement);
        }
        
        const css = this.generateBlogStyleCSS(quoteStyle, authorStyle, metaStyle, contentStyle);
        styleElement.textContent = css;
    }

    generateBlogStyleCSS(quoteStyle, authorStyle, metaStyle, contentStyle) {
        let css = '';
        
        // Quote styles
        switch(quoteStyle) {
            case 'purple':
                css += `.blog-quote { background: linear-gradient(135deg, #8b5cf6, #a855f7) !important; color: white !important; border-left: 4px solid #7c3aed !important; }`;
                break;
            case 'green':
                css += `.blog-quote { background: linear-gradient(135deg, #10b981, #059669) !important; color: white !important; border-left: 4px solid #047857 !important; }`;
                break;
            case 'orange':
                css += `.blog-quote { background: linear-gradient(135deg, #f59e0b, #d97706) !important; color: white !important; border-left: 4px solid #b45309 !important; }`;
                break;
            case 'minimal':
                css += `.blog-quote { background: #f8fafc !important; color: #64748b !important; border-left: 4px solid #cbd5e1 !important; }`;
                break;
            default:
                css += `.blog-quote { background: #f0f9ff !important; color: #1e40af !important; border-left: 4px solid #3b82f6 !important; }`;
        }
        
        // Author styles
        switch(authorStyle) {
            case 'minimal':
                css += `.blog-author { background: none !important; padding: 0 !important; border: none !important; } .blog-author span { color: #6b7280 !important; }`;
                break;
            case 'highlighted':
                css += `.blog-author { background: linear-gradient(135deg, #fef3c7, #fde68a) !important; padding: 0.5rem 1rem !important; border-radius: 25px !important; border: 1px solid #f59e0b !important; } .blog-author span { color: #92400e !important; }`;
                break;
            case 'bordered':
                css += `.blog-author { background: white !important; padding: 0.5rem 1rem !important; border-radius: 25px !important; border: 2px solid #e5e7eb !important; } .blog-author span { color: #374151 !important; }`;
                break;
            default:
                css += `.blog-author { background: rgba(0, 0, 0, 0.1) !important; padding: 0.5rem 1rem !important; border-radius: 25px !important; border: 1px solid rgba(0, 0, 0, 0.1) !important; } .blog-author span { color: #1e293b !important; }`;
        }
        
        // Meta styles
        switch(metaStyle) {
            case 'dark':
                css += `.blog-detail-meta { background: #1f2937 !important; color: white !important; } .blog-category { background: linear-gradient(135deg, #8b5cf6, #a855f7) !important; } .blog-date { background: rgba(255, 255, 255, 0.1) !important; color: #d1d5db !important; }`;
                break;
            case 'colorful':
                css += `.blog-category { background: linear-gradient(135deg, #ec4899, #be185d) !important; } .blog-date { background: linear-gradient(135deg, #06b6d4, #0891b2) !important; color: white !important; }`;
                break;
            case 'minimal':
                css += `.blog-detail-meta { background: none !important; border: none !important; } .blog-category { background: #f3f4f6 !important; color: #374151 !important; } .blog-date { background: #f3f4f6 !important; color: #6b7280 !important; }`;
                break;
            default:
                css += `.blog-detail-meta { background: rgba(248, 250, 252, 0.8) !important; border: 1px solid rgba(226, 232, 240, 0.5) !important; }`;
        }
        
        return css;
    }

    updateElementAttribute(elementId, attribute, value) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.setAttribute(attribute, value);
    }

    updateImageSource(elementId, imageUrl) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        if (element.tagName === 'IMG') {
            element.src = imageUrl;
        } else {
            element.style.backgroundImage = `url(${imageUrl})`;
        }
    }
}

// Initialize CMS service
const cms = new CMSService();

// Content mapping configuration
const contentMapping = {
    // Hero section
    'hero_title': { elementId: 'hero-title', isHtml: false },
    'hero_subtitle': { elementId: 'hero-subtitle', isHtml: false },
    'hero_description': { elementId: 'hero-description', isHtml: false },
    
    // Capabilities section
    'capabilities_title': { elementId: 'capabilities-title', isHtml: false },
    'capabilities_subtitle': { elementId: 'capabilities-subtitle', isHtml: false },
    
    // Industries section
    'industries_title': { elementId: 'industries-title', isHtml: false },
    'industries_subtitle': { elementId: 'industries-subtitle', isHtml: false },
    
    // Footer
    'footer_company_description': { elementId: 'footer-description', isHtml: false }
};

// Load dynamic content when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load all content sections
        const contentMap = await cms.loadAllContent();
        
        // Update elements with dynamic content
        for (const [sectionKey, config] of Object.entries(contentMapping)) {
            const section = contentMap.get(sectionKey);
            if (section && section.content) {
                const element = document.getElementById(config.elementId);
                if (element) {
                    if (config.isHtml) {
                        element.innerHTML = section.content;
                    } else {
                        element.textContent = section.content;
                    }
                }
            }
        }

        // Update specific elements that might not have IDs
        updateHeroContent(contentMap);
        updateCapabilitiesContent(contentMap);
        updateIndustriesContent(contentMap);
        updateFooterContent(contentMap);
        
        // Load pricing content
        await loadPricingContent();
        
        console.log('Dynamic content loaded successfully');
    } catch (error) {
        console.error('Error loading dynamic content:', error);
    }
});

// Helper functions to update specific sections
function updateHeroContent(contentMap) {
    const heroTitle = contentMap.get('hero_title');
    if (heroTitle && heroTitle.content) {
        const titleElement = document.querySelector('.hero-title');
        if (titleElement) {
            titleElement.textContent = heroTitle.content;
        }
    }

    const heroSubtitle = contentMap.get('hero_subtitle');
    if (heroSubtitle && heroSubtitle.content) {
        const subtitleElement = document.querySelector('.hero-subtitle');
        if (subtitleElement) {
            subtitleElement.textContent = heroSubtitle.content;
        }
    }

    const heroDescription = contentMap.get('hero_description');
    if (heroDescription && heroDescription.content) {
        const descriptionElement = document.querySelector('.hero-description');
        if (descriptionElement) {
            descriptionElement.textContent = heroDescription.content;
        }
    }
}

function updateCapabilitiesContent(contentMap) {
    const capabilitiesTitle = contentMap.get('capabilities_title');
    if (capabilitiesTitle && capabilitiesTitle.content) {
        const titleElement = document.querySelector('#capabilities .section-title');
        if (titleElement) {
            titleElement.textContent = capabilitiesTitle.content;
        }
    }

    const capabilitiesSubtitle = contentMap.get('capabilities_subtitle');
    if (capabilitiesSubtitle && capabilitiesSubtitle.content) {
        const subtitleElement = document.querySelector('#capabilities .section-subtitle');
        if (subtitleElement) {
            subtitleElement.textContent = capabilitiesSubtitle.content;
        }
    }
}

function updateIndustriesContent(contentMap) {
    const industriesTitle = contentMap.get('industries_title');
    if (industriesTitle && industriesTitle.content) {
        const titleElement = document.querySelector('#industries .section-title');
        if (titleElement) {
            titleElement.textContent = industriesTitle.content;
        }
    }

    const industriesSubtitle = contentMap.get('industries_subtitle');
    if (industriesSubtitle && industriesSubtitle.content) {
        const subtitleElement = document.querySelector('#industries .section-subtitle');
        if (subtitleElement) {
            subtitleElement.textContent = industriesSubtitle.content;
        }
    }
}

function updateFooterContent(contentMap) {
    const footerDescription = contentMap.get('footer_company_description');
    if (footerDescription && footerDescription.content) {
        const descriptionElement = document.querySelector('.footer-section p');
        if (descriptionElement) {
            descriptionElement.textContent = footerDescription.content;
        }
    }
}

// Admin link functionality - HIDDEN from public website
// This function is disabled to keep the admin dashboard private
function addAdminLink() {
    // Admin link is hidden from the public website
    // To access admin dashboard, go directly to: http://localhost:3000/admin
    return;
}

// Admin link is not added to the public website
// document.addEventListener('DOMContentLoaded', addAdminLink);

// Pricing content loading
async function loadPricingContent() {
    try {
        const response = await fetch('/api/content/pricing');
        if (response.ok) {
            const pricingData = await response.json();
            updatePricingSection(pricingData);
        }
    } catch (error) {
        console.error('Error loading pricing content:', error);
    }
}

function updatePricingSection(pricingData) {
    // Update section title and subtitle
    const titleElement = document.getElementById('pricing-title');
    const subtitleElement = document.getElementById('pricing-subtitle');
    
    if (titleElement) titleElement.textContent = pricingData.title;
    if (subtitleElement) subtitleElement.textContent = pricingData.subtitle;
    
    // Update pricing cards
    const cardsContainer = document.getElementById('pricing-cards');
    if (cardsContainer && pricingData.plans) {
        cardsContainer.innerHTML = '';
        
        pricingData.plans.forEach(plan => {
            const card = createPricingCard(plan);
            cardsContainer.appendChild(card);
        });
    }
    
    // Update custom solutions
    const customTitle = document.getElementById('custom-solutions-title');
    const customDescription = document.getElementById('custom-solutions-description');
    const customFeatures = document.getElementById('custom-solutions-features');
    
    if (customTitle && pricingData.customSolutions) {
        customTitle.textContent = pricingData.customSolutions.title;
    }
    if (customDescription && pricingData.customSolutions) {
        customDescription.textContent = pricingData.customSolutions.description;
    }
    if (customFeatures && pricingData.customSolutions && pricingData.customSolutions.features) {
        customFeatures.innerHTML = '';
        pricingData.customSolutions.features.forEach(feature => {
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

function createPricingCard(plan) {
    const card = document.createElement('div');
    card.className = `pricing-card ${plan.featured ? 'featured' : ''}`;
    
    const badge = plan.featured ? '<div class="popular-badge">Most Popular</div>' : '';
    
    const features = plan.features.map(feature => `
        <div class="feature-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
            </svg>
            <span>${feature}</span>
        </div>
    `).join('');
    
    const buttonClass = plan.buttonStyle === 'primary' ? 'btn btn-primary' : 'btn btn-outline';
    
    card.innerHTML = `
        ${badge}
        <div class="card-header">
            <div class="plan-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
            </div>
            <h3 class="plan-name">${plan.name}</h3>
            <p class="plan-description">${plan.description}</p>
        </div>
        <div class="plan-features">
            ${features}
        </div>
        <div class="plan-price">
            <span class="price-amount">${plan.price}</span>
            <span class="price-period">${plan.period}</span>
        </div>
        <button class="${buttonClass} plan-btn">${plan.buttonText}</button>
    `;
    
    return card;
}

// Export for use in other scripts
window.CMSService = CMSService;
window.cms = cms;
