// Simple and Robust Language Manager for Hi Emma Website
// This replaces the complex translation engine with a cleaner approach

class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = null;
        this.rtlLanguages = ['ar'];
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Language Manager...');
        
        try {
            // Load translations
            await this.loadTranslations();
            
            // Get saved language preference
            const savedLang = this.getSavedLanguage();
            if (savedLang && this.translations[savedLang]) {
                this.currentLanguage = savedLang;
                console.log(`📱 Loaded saved language: ${savedLang}`);
            } else {
                this.currentLanguage = 'en';
                this.saveLanguagePreference('en');
                console.log('📱 Defaulting to English');
            }
            
            // Apply language immediately
            this.applyLanguage(this.currentLanguage);
            
            // Initialize language switcher
            this.initLanguageSwitcher();
            
            // Handle RTL support
            this.handleRTLSupport();
            
            this.isInitialized = true;
            console.log('✅ Language Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Language Manager:', error);
            this.currentLanguage = 'en';
            this.isInitialized = true;
        }
    }

    async loadTranslations() {
        try {
            if (typeof translations !== 'undefined') {
                this.translations = translations;
            } else {
                const response = await fetch('/js/translations.js');
                const text = await response.text();
                eval(text);
                this.translations = window.translations;
            }
            console.log('📚 Translations loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load translations:', error);
            this.translations = { en: {}, ar: {} };
        }
    }

    getSavedLanguage() {
        try {
            return localStorage.getItem('emma-language') || 
                   sessionStorage.getItem('emma-language') || 
                   'en';
        } catch (error) {
            console.error('❌ Failed to get saved language:', error);
            return 'en';
        }
    }

    saveLanguagePreference(lang) {
        try {
            localStorage.setItem('emma-language', lang);
            sessionStorage.setItem('emma-language', lang);
            console.log(`💾 Language preference saved: ${lang}`);
        } catch (error) {
            console.error('❌ Failed to save language preference:', error);
        }
    }

    initLanguageSwitcher() {
        const switcher = document.getElementById('language-switcher');
        if (!switcher) {
            console.log('⚠️ Language switcher not found');
            return;
        }

        const switchElement = switcher.querySelector('.lang-switch');
        const labels = switcher.querySelectorAll('.lang-label');
        
        if (!switchElement || !labels.length) {
            console.log('⚠️ Language switcher elements not found');
            return;
        }

        // Add click event to the switch
        switchElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleLanguage();
        });

        // Add click events to labels
        labels.forEach(label => {
            label.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const lang = label.dataset.lang;
                if (lang && this.translations[lang] && lang !== this.currentLanguage) {
                    this.setLanguage(lang);
                }
            });
        });

        // Update switcher display
        this.updateLanguageSwitcher();
        
        console.log('🔄 Language switcher initialized');
    }

    toggleLanguage() {
        const newLang = this.currentLanguage === 'en' ? 'ar' : 'en';
        console.log(`🔄 Toggling language: ${this.currentLanguage} → ${newLang}`);
        this.setLanguage(newLang);
    }

    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.error(`❌ Language ${lang} not supported`);
            return;
        }

        if (lang === this.currentLanguage) {
            console.log(`ℹ️ Already in language: ${lang}`);
            return;
        }

        console.log(`🌍 Switching to language: ${lang}`);
        
        // Update current language
        this.currentLanguage = lang;
        this.saveLanguagePreference(lang);
        
        // Apply language changes
        this.applyLanguage(lang);
        
        // Update switcher display
        this.updateLanguageSwitcher();
        
        // Handle RTL support
        this.handleRTLSupport();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang, isRTL: this.isRTL() } 
        }));
        
        console.log(`✅ Language switched to: ${lang}`);
    }

    applyLanguage(lang) {
        if (!this.translations[lang]) {
            console.error(`❌ No translations for language: ${lang}`);
            return;
        }

        console.log(`🎯 Applying language: ${lang}`);
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        // Update meta tags
        this.updateMetaTags(lang);
        
        // Update page title
        this.updatePageTitle(lang);
        
        // Translate all elements with data-translate attribute
        this.translateElements(lang);
        
        console.log(`✅ Language applied: ${lang}`);
    }

    updateLanguageSwitcher() {
        const switcher = document.getElementById('language-switcher');
        if (!switcher) return;

        const switchElement = switcher.querySelector('.lang-switch');
        const flag = switcher.querySelector('.lang-flag');
        const labels = switcher.querySelectorAll('.lang-label');

        if (!switchElement || !flag || !labels.length) return;

        console.log(`🔄 Updating language switcher for: ${this.currentLanguage}`);

        // Clear all classes
        switchElement.classList.remove('en', 'ar');
        
        // Set appropriate class and flag
        if (this.currentLanguage === 'ar') {
            flag.textContent = '🇸🇦';
            switchElement.classList.add('ar');
        } else {
            flag.textContent = '🇺🇸';
            switchElement.classList.add('en');
        }

        // Update active labels
        labels.forEach(label => {
            label.classList.remove('active');
            if (label.dataset.lang === this.currentLanguage) {
                label.classList.add('active');
            }
        });
        
        console.log('✅ Language switcher updated');
    }

    translateElements(lang) {
        const translations = this.translations[lang];
        if (!translations) return;

        const elements = document.querySelectorAll('[data-translate]');
        console.log(`🔄 Translating ${elements.length} elements to ${lang}`);
        
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (!key || key === 'false') return;
            
            const translatedText = this.getNestedTranslation(translations, key);
            if (translatedText) {
                if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email')) {
                    element.placeholder = translatedText;
                } else if (element.tagName === 'TEXTAREA') {
                    element.placeholder = translatedText;
                } else {
                    element.textContent = translatedText;
                }
            }
        });
        
        console.log(`✅ Translated ${elements.length} elements`);
    }

    getNestedTranslation(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    updateMetaTags(lang) {
        const metaDescription = document.querySelector('meta[name="description"]');
        const metaTitle = document.querySelector('meta[name="title"]');
        
        if (lang === 'ar') {
            if (metaDescription) {
                metaDescription.content = "إيما للذكاء الاصطناعي - منصة المساعد الذكي المتطورة التي توفر وكلاء ذكاء اصطناعي ذكيين ومستقلين عبر صناعات الرعاية الصحية والبنوك والتعليم. حوّل عملياتك بالأتمتة الذكية.";
            }
            if (metaTitle) {
                metaTitle.content = "إيما للذكاء الاصطناعي - منصة المساعد الذكي | كودفاست";
            }
        } else {
            if (metaDescription) {
                metaDescription.content = "Hi Emma - Cutting-edge AI platform delivering smart, autonomous AI agents across Healthcare, Banking, and Education industries. Transform your operations with intelligent automation.";
            }
            if (metaTitle) {
                metaTitle.content = "Hi Emma - Intelligent AI Assistant Platform | KodeFast";
            }
        }
    }

    updatePageTitle(lang) {
        let title = "Hi Emma";
        if (lang === 'ar') {
            title = "إيما للذكاء الاصطناعي";
        }

        const currentPath = window.location.pathname;
        if (currentPath.includes('/about')) {
            title += lang === 'ar' ? ' - من نحن' : ' - About';
        } else if (currentPath.includes('/pricing')) {
            title += lang === 'ar' ? ' - الأسعار' : ' - Pricing';
        } else if (currentPath.includes('/resources')) {
            title += lang === 'ar' ? ' - الموارد' : ' - Resources';
        } else if (currentPath.includes('/contact')) {
            title += lang === 'ar' ? ' - اتصل بنا' : ' - Contact';
        }

        document.title = title;
    }

    handleRTLSupport() {
        const isRTL = this.rtlLanguages.includes(this.currentLanguage);
        
        console.log(`🔄 Setting layout direction: ${isRTL ? 'RTL' : 'LTR'}`);
        
        if (isRTL) {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
        }
        
        // Add RTL styles if needed
        this.addRTLStyles();
    }

    addRTLStyles() {
        // Remove existing RTL styles
        const existingStyle = document.getElementById('rtl-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Only add RTL styles if current language is RTL
        if (!this.rtlLanguages.includes(this.currentLanguage)) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'rtl-styles';
        style.textContent = `
            [dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
            }
            [dir="rtl"] * {
                direction: rtl !important;
            }
            [dir="rtl"] .hero-content,
            [dir="rtl"] .section-header,
            [dir="rtl"] .nav-links,
            [dir="rtl"] .footer-links-grid,
            [dir="rtl"] .use-case-cards,
            [dir="rtl"] .industries-grid,
            [dir="rtl"] .capabilities-grid {
                direction: rtl !important;
            }
            [dir="rtl"] h1, [dir="rtl"] h2, [dir="rtl"] h3, [dir="rtl"] h4, [dir="rtl"] h5, [dir="rtl"] h6,
            [dir="rtl"] p {
                text-align: right !important;
                direction: rtl !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ RTL styles added');
    }

    // Public methods
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    isRTL() {
        return this.rtlLanguages.includes(this.currentLanguage);
    }

    // Force language switch (for debugging)
    forceLanguage(lang) {
        console.log(`🔧 Force switching to language: ${lang}`);
        this.setLanguage(lang);
    }
}

// Global functions for backward compatibility
window.toggleLanguage = function() {
    if (window.languageManager) {
        window.languageManager.toggleLanguage();
    } else {
        console.error('❌ Language manager not initialized');
    }
};

window.setLanguage = function(lang) {
    if (window.languageManager) {
        window.languageManager.setLanguage(lang);
    } else {
        console.error('❌ Language manager not initialized');
    }
};

window.getCurrentLanguage = function() {
    if (window.languageManager) {
        return window.languageManager.getCurrentLanguage();
    }
    return 'en';
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing Language Manager...');
    if (!window.languageManager) {
        window.languageManager = new LanguageManager();
    }
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('⏳ DOM still loading, waiting for DOMContentLoaded...');
} else {
    console.log('⚡ DOM already loaded, initializing Language Manager immediately...');
    if (!window.languageManager) {
        window.languageManager = new LanguageManager();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageManager;
} else {
    window.LanguageManager = LanguageManager;
}
