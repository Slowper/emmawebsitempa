// Translation Engine for Hi Emma Website
// Handles language switching and content translation

class TranslationEngine {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = null;
        this.rtlLanguages = ['ar']; // Right-to-left languages
        this.init();
    }

    async init() {
        // Load translations
        await this.loadTranslations();
        
        // Get saved language preference with better persistence
        const savedLang = localStorage.getItem('emma-language') || sessionStorage.getItem('emma-language');
        if (savedLang && this.translations[savedLang]) {
            this.currentLanguage = savedLang;
            console.log(`Loaded saved language: ${savedLang}`);
        } else {
            // Default to English if no saved preference
            this.currentLanguage = 'en';
            this.saveLanguagePreference('en');
        }
        
        // Apply initial language
        this.applyLanguage(this.currentLanguage);
        
        // Initialize language switcher
        this.initLanguageSwitcher();
        
        // Update language switcher display with current language after DOM is ready
        setTimeout(() => {
            this.updateLanguageSwitcher();
        }, 200);
        
        // Add RTL support
        this.handleRTLSupport();
        
        // Ensure language persistence across page navigation
        this.setupPageNavigationHandling();
    }

    async loadTranslations() {
        try {
            // Load translations from the translations.js file
            if (typeof translations !== 'undefined') {
                this.translations = translations;
            } else {
                // Fallback: try to load from file
                const response = await fetch('/js/translations.js');
                const text = await response.text();
                // This is a simple approach - in production, you'd want proper module loading
                eval(text);
                this.translations = window.translations;
            }
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Fallback to English
            this.translations = { en: {} };
        }
    }

    initLanguageSwitcher() {
        // Language switcher is now included in header.html
        // Just initialize the switch functionality
        setTimeout(() => {
            this.initSwitch();
        }, 100);
    }



    initSwitch() {
        const switcher = document.getElementById('language-switcher');
        if (!switcher) return;
        
        const switchElement = switcher.querySelector('.lang-switch');
        const labels = switcher.querySelectorAll('.lang-label');
        
        if (!switchElement || !labels.length) return;

        // Add click event to the switch
        switchElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleLanguage();
        });

        // Add click events to labels for better UX
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

        // Add keyboard support
        switchElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                this.toggleLanguage();
            }
        });

        // Make switch focusable
        switchElement.setAttribute('tabindex', '0');
        switchElement.setAttribute('role', 'button');
        switchElement.setAttribute('aria-label', 'Toggle language');
    }

    toggleLanguage() {
        const newLang = this.currentLanguage === 'en' ? 'ar' : 'en';
        console.log(`Toggling from ${this.currentLanguage} to ${newLang}`);
        this.setLanguage(newLang);
    }

    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.error(`Language ${lang} not supported`);
            return;
        }

        console.log(`Switching to language: ${lang} (previous: ${this.currentLanguage})`);
        
        // Add smooth transition effect
        this.addTransitionEffect();
        
        this.currentLanguage = lang;
        this.saveLanguagePreference(lang);
        console.log(`Current language set to: ${this.currentLanguage}`);
        
        // Update language switcher display
        this.updateLanguageSwitcher();
        
        // Reset all content to original state first
        this.resetContentToOriginal();
        
        // Apply language with smooth transition
        setTimeout(() => {
            this.applyLanguage(lang);
            
            // Handle RTL
            this.handleRTLSupport();
            
            // Force refresh all translations
            this.forceRefreshTranslations(lang);
            
            // Ensure layout is correct
            this.ensureLayoutConsistency(lang);
            
            // Remove transition effect
            this.removeTransitionEffect();
            
            // Trigger custom event for other scripts
            window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: lang, isRTL: this.isRTL() } 
            }));
        }, 150);
    }

    addTransitionEffect() {
        // Add smooth transition styles
        const style = document.createElement('style');
        style.id = 'language-transition';
        style.textContent = `
            * {
                transition: opacity 0.3s ease, transform 0.3s ease !important;
            }
            .navbar, .hero, .section, .card, .industry-card, .capability-card, .use-case-card {
                transition: opacity 0.3s ease, transform 0.3s ease !important;
            }
        `;
        document.head.appendChild(style);
        
        // Add transition class to body
        document.body.classList.add('language-transitioning');
    }

    removeTransitionEffect() {
        // Remove transition styles
        const transitionStyle = document.getElementById('language-transition');
        if (transitionStyle) {
            transitionStyle.remove();
        }
        
        // Remove transition class from body
        document.body.classList.remove('language-transitioning');
    }

    resetContentToOriginal() {
        console.log('Resetting all content to original English state');
        
        // Reset all elements with data-translate to their original English content
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (key && key !== 'false') {
                const originalText = this.getOriginalEnglishText(key);
                if (originalText) {
                    if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email')) {
                        element.placeholder = originalText;
                    } else if (element.tagName === 'TEXTAREA') {
                        element.placeholder = originalText;
                    } else {
                        element.textContent = originalText;
                    }
                }
            }
        });
        
        // Reset main content areas to English
        this.resetMainContentToEnglish();
        
        // Reset navigation links to English
        this.resetNavigationToEnglish();
        
        // Reset footer to English
        this.resetFooterToEnglish();
        
        console.log('Content reset to original English state completed');
    }

    resetMainContentToEnglish() {
        // Reset hero section
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) heroTitle.textContent = 'Meet Emma';
        
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) heroSubtitle.textContent = 'Your Intelligent AI Assistant';
        
        const heroDescription = document.querySelector('.hero-description');
        if (heroDescription) {
            heroDescription.textContent = 'Transform your business with AI that understands, learns, and adapts. From healthcare to banking to education - Emma delivers results across every industry.';
        }
        
        const heroTrustedBy = document.querySelector('[data-translate="hero.trusted_by"]');
        if (heroTrustedBy) heroTrustedBy.textContent = 'Trusted by Industry Leaders';
        
        const heroSeeHow = document.querySelector('[data-translate="hero.see_how"]');
        if (heroSeeHow) heroSeeHow.textContent = 'See how Emma transforms operations across sectors';
        
        // Reset capabilities section
        const capabilitiesTitle = document.querySelector('[data-translate="capabilities.title"]');
        if (capabilitiesTitle) capabilitiesTitle.textContent = 'Emma\'s Core Capabilities';
        
        const capabilitiesSubtitle = document.querySelector('[data-translate="capabilities.subtitle"]');
        if (capabilitiesSubtitle) capabilitiesSubtitle.textContent = 'Intelligent automation that adapts, learns, and takes initiative';
        
        // Reset capability cards
        const schedulingTitle = document.querySelector('[data-translate="capabilities.scheduling.title"]');
        if (schedulingTitle) schedulingTitle.textContent = 'Conversational Scheduling';
        
        const schedulingDesc = document.querySelector('[data-translate="capabilities.scheduling.description"]');
        if (schedulingDesc) {
            schedulingDesc.textContent = 'Manages bookings, reschedules, and sends reminders across WhatsApp, SMS, email, and voice';
        }
        
        const intelligenceTitle = document.querySelector('[data-translate="capabilities.intelligence.title"]');
        if (intelligenceTitle) intelligenceTitle.textContent = 'Smart Pre-Qualification';
        
        const intelligenceDesc = document.querySelector('[data-translate="capabilities.intelligence.description"]');
        if (intelligenceDesc) {
            intelligenceDesc.textContent = 'Gathers input, prioritizes urgent needs, and routes requests to the right place automatically';
        }
        
        const personalizationTitle = document.querySelector('[data-translate="capabilities.personalization.title"]');
        if (personalizationTitle) personalizationTitle.textContent = 'Hyper-Personalized Engagement';
        
        const personalizationDesc = document.querySelector('[data-translate="capabilities.personalization.description"]');
        if (personalizationDesc) {
            personalizationDesc.textContent = 'Delivers relevant nudges and follow-ups in multiple languages and tones';
        }
        
        // Reset industries section
        const industriesTitle = document.querySelector('[data-translate="industries.title"]');
        if (industriesTitle) industriesTitle.textContent = 'Industry Solutions';
        
        const industriesSubtitle = document.querySelector('[data-translate="industries.subtitle"]');
        if (industriesSubtitle) industriesSubtitle.textContent = 'Tailored AI agents for your specific industry needs';
        
        // Reset use cases
        const healthcareTitle = document.querySelector('[data-translate="use_cases.healthcare.title"]');
        if (healthcareTitle) healthcareTitle.textContent = 'Healthcare';
        
        const healthcareDesc = document.querySelector('[data-translate="use_cases.healthcare.description"]');
        if (healthcareDesc) {
            healthcareDesc.textContent = 'Patient scheduling, medical records, and diagnostic assistance';
        }
        
        // Reset CTA section
        const ctaTitle = document.querySelector('[data-translate="cta.title"]');
        if (ctaTitle) ctaTitle.textContent = 'Ready to Transform Your Operations?';
        
        const ctaDesc = document.querySelector('[data-translate="cta.description"]');
        if (ctaDesc) {
            ctaDesc.textContent = 'Let\'s work together to create the perfect AI solution for your organization.';
        }
        
        const ctaButton = document.querySelector('[data-translate="cta.button"]');
        if (ctaButton) ctaButton.textContent = 'Get Started Today';
    }

    getOriginalEnglishText(key) {
        // Get the original English text for a given translation key
        const englishTranslations = this.translations['en'];
        if (!englishTranslations) return null;
        
        return this.getNestedTranslation(englishTranslations, key);
    }

    resetNavigationToEnglish() {
        const navLinks = document.querySelectorAll('.nav-link');
        const englishNav = {
            'nav.home': 'Home',
            'nav.about': 'About', 
            'nav.pricing': 'Pricing',
            'nav.resources': 'Resources',
            'nav.contact': 'Contact'
        };
        
        navLinks.forEach(link => {
            const key = link.getAttribute('data-translate');
            if (key && englishNav[key]) {
                link.textContent = englishNav[key];
            }
        });

        // Reset brand text to English
        this.resetBrandToEnglish();
    }

    resetBrandToEnglish() {
        // Reset logo text
        const logoText = document.querySelector('.logo-text');
        if (logoText) {
            logoText.textContent = 'Hi Emma';
        }

        // Reset logo tagline
        const logoTagline = document.querySelector('.logo-tagline');
        if (logoTagline) {
            logoTagline.textContent = 'AI Assistant';
        }
    }

    resetFooterToEnglish() {
        // Reset footer brand name
        const brandName = document.querySelector('.footer-brand-name');
        if (brandName) brandName.textContent = 'Hi Emma';
        
        // Reset footer tagline
        const brandTagline = document.querySelector('.footer-brand-tagline');
        if (brandTagline) brandTagline.textContent = 'Intelligent AI Assistant Platform';
        
        // Reset footer description
        const brandDescription = document.querySelector('.footer-brand-description');
        if (brandDescription) {
            brandDescription.textContent = 'Building the future of autonomous AI agents. Transform your operations with intelligent automation across Healthcare, Banking, Education, and more.';
        }
        
        // Reset footer section titles
        const sectionTitles = document.querySelectorAll('.footer-section-title');
        sectionTitles.forEach(title => {
            const text = title.textContent.trim();
            if (text === 'المنتج') title.textContent = 'Product';
            else if (text === 'الشركة') title.textContent = 'Company';
            else if (text === 'الدعم') title.textContent = 'Support';
            else if (text === 'قانوني') title.textContent = 'Legal';
            else if (text === 'ابق محدثاً') title.textContent = 'Stay Updated';
        });
        
        // Reset footer links
        const footerLinks = document.querySelectorAll('.footer-link');
        const englishFooterLinks = {
            'الميزات': 'Features',
            'الأسعار': 'Pricing',
            'التكاملات': 'Integrations',
            'واجهة برمجة التطبيقات': 'API',
            'الأمان': 'Security',
            'من نحن': 'About Us',
            'الوظائف': 'Careers',
            'المدونة': 'Blog',
            'الصحافة': 'Press',
            'الشركاء': 'Partners',
            'مركز المساعدة': 'Help Center',
            'اتصل بنا': 'Contact Us',
            'حالة النظام': 'System Status',
            'الوثائق': 'Documentation',
            'المجتمع': 'Community',
            'سياسة الخصوصية': 'Privacy Policy',
            'شروط الخدمة': 'Terms of Service',
            'سياسة ملفات تعريف الارتباط': 'Cookie Policy',
            'إمكانية الوصول': 'Accessibility',
            'اشترك': 'Subscribe',
            'أدخل بريدك الإلكتروني': 'Enter your email'
        };
        
        footerLinks.forEach(link => {
            const text = link.textContent.trim();
            if (englishFooterLinks[text]) {
                link.textContent = englishFooterLinks[text];
            }
        });
    }

    ensureLayoutConsistency(lang) {
        console.log(`Ensuring layout consistency for language: ${lang}`);
        
        const isRTL = this.rtlLanguages.includes(lang);
        const currentDir = document.documentElement.getAttribute('dir');
        const hasRTLClass = document.body.classList.contains('rtl');
        
        console.log(`Current dir: ${currentDir}, Expected: ${isRTL ? 'rtl' : 'ltr'}`);
        console.log(`Has RTL class: ${hasRTLClass}, Expected: ${isRTL}`);
        
        // Force correct direction
        if (isRTL && currentDir !== 'rtl') {
            console.log('Forcing RTL direction');
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
        } else if (!isRTL && currentDir !== 'ltr') {
            console.log('Forcing LTR direction');
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
        }
        
        // Remove RTL styles if not needed
        if (!isRTL) {
            const rtlStyle = document.getElementById('rtl-styles');
            if (rtlStyle) {
                console.log('Removing RTL styles for LTR language');
                rtlStyle.remove();
            }
        }
    }

    forceRefreshTranslations(lang) {
        console.log(`Force refreshing all translations for language: ${lang}`);
        
        // Force translate all elements again
        this.translateAllPageContent(lang);
        
        // Force translate specific elements
        this.translateSpecificElements(lang);
        
        // Force translate footer
        this.translateFooter(lang);
        
        // Force translate cards specifically
        this.forceTranslateCards(lang);
        
        // Force translate headings specifically
        this.translateHeadings(lang);
        
        console.log('Force refresh completed');
    }

    forceTranslateCards(lang) {
        console.log(`Force translating cards for language: ${lang}`);
        
        // Only translate cards that explicitly have data-translate attribute set to a valid key
        const cards = document.querySelectorAll('.industry-card[data-translate]:not([data-translate="false"]), .capability-card[data-translate]:not([data-translate="false"]), .use-case-card[data-translate]:not([data-translate="false"]), .card[data-translate]:not([data-translate="false"]), [class*="card"][data-translate]:not([data-translate="false"])');
        console.log(`Found ${cards.length} cards with valid data-translate attributes to translate`);
        
        cards.forEach((card, index) => {
            console.log(`Processing card ${index + 1}:`, card);
            
            // Translate card titles - try multiple selectors but only if they have data-translate
            const titleSelectors = ['h3[data-translate]:not([data-translate="false"])', '.card-title[data-translate]:not([data-translate="false"])', '.title[data-translate]:not([data-translate="false"])', 'h2[data-translate]:not([data-translate="false"])', 'h4[data-translate]:not([data-translate="false"])', '[class*="title"][data-translate]:not([data-translate="false"])'];
            let title = null;
            
            for (const selector of titleSelectors) {
                title = card.querySelector(selector);
                if (title) {
                    console.log(`Found title with selector: ${selector}`);
                    break;
                }
            }
            
            if (title) {
                const text = title.textContent.trim();
                const translateKey = title.getAttribute('data-translate');
                console.log(`Card title text: "${text}" with data-translate="${translateKey}"`);
                
                // Only translate if data-translate is not "false"
                if (translateKey === 'false') {
                    console.log(`Skipping card title with data-translate="false": "${text}"`);
                    return;
                }
                
                const translatedText = this.findTranslationForText(text, this.translations[lang]);
                if (translatedText && translatedText !== text) {
                    console.log(`Translating card title: "${text}" -> "${translatedText}"`);
                    title.textContent = translatedText;
                } else {
                    // Try partial translation
                    const partialTranslation = this.findPartialTranslation(text, this.translations[lang]);
                    if (partialTranslation && partialTranslation !== text) {
                        console.log(`Partial card title translation: "${text}" -> "${partialTranslation}"`);
                        title.textContent = partialTranslation;
                    } else {
                        console.log(`No translation found for card title: "${text}"`);
                    }
                }
            } else {
                console.log('No title with valid data-translate attribute found in card');
            }
            
            // Translate card descriptions - only if they have data-translate
            const descriptionSelectors = ['p[data-translate]:not([data-translate="false"])', '.description[data-translate]:not([data-translate="false"])', '.card-description[data-translate]:not([data-translate="false"])', '[class*="desc"][data-translate]:not([data-translate="false"])'];
            let description = null;
            
            for (const selector of descriptionSelectors) {
                description = card.querySelector(selector);
                if (description) {
                    console.log(`Found description with selector: ${selector}`);
                    break;
                }
            }
            
            if (description) {
                const text = description.textContent.trim();
                const translateKey = description.getAttribute('data-translate');
                console.log(`Card description text: "${text}" with data-translate="${translateKey}"`);
                
                // Only translate if data-translate is not "false"
                if (translateKey === 'false') {
                    console.log(`Skipping card description with data-translate="false": "${text}"`);
                    return;
                }
                
                const translatedText = this.findTranslationForText(text, this.translations[lang]);
                if (translatedText && translatedText !== text) {
                    console.log(`Translating card description: "${text}" -> "${translatedText}"`);
                    description.textContent = translatedText;
                } else {
                    // Try partial translation
                    const partialTranslation = this.findPartialTranslation(text, this.translations[lang]);
                    if (partialTranslation && partialTranslation !== text) {
                        console.log(`Partial card description translation: "${text}" -> "${partialTranslation}"`);
                        description.textContent = partialTranslation;
                    }
                }
            }
        });
        
        // Also try to translate any remaining text that might be in cards
        this.translateAllTextInCards(lang);
    }

    translateAllTextInCards(lang) {
        console.log(`Translating all text in cards for language: ${lang}`);
        
        // Find all text nodes in cards that have data-translate and translate them
        const cardContainers = document.querySelectorAll('.industry-card[data-translate]:not([data-translate="false"]), .capability-card[data-translate]:not([data-translate="false"]), .use-case-card[data-translate]:not([data-translate="false"]), .card[data-translate]:not([data-translate="false"]), [class*="card"][data-translate]:not([data-translate="false"])');
        
        cardContainers.forEach(card => {
            const walker = document.createTreeWalker(
                card,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            let node;
            while (node = walker.nextNode()) {
                const text = node.textContent.trim();
                if (text && text.length > 2) {
                    // Check if the parent element has data-translate attribute
                    const parentElement = node.parentElement;
                    if (parentElement && parentElement.hasAttribute('data-translate') && parentElement.getAttribute('data-translate') !== 'false') {
                        const translatedText = this.findPartialTranslation(text, this.translations[lang]);
                        if (translatedText && translatedText !== text) {
                            console.log(`Translating text node with data-translate: "${text}" -> "${translatedText}"`);
                            node.textContent = translatedText;
                        }
                    }
                }
            }
        });
    }

    updateLanguageSwitcher() {
        const switcher = document.getElementById('language-switcher');
        if (!switcher) {
            console.log('Language switcher not found');
            return;
        }

        const switchElement = switcher.querySelector('.lang-switch') || switcher.querySelector('#lang-switch');
        const flag = switcher.querySelector('.lang-flag');
        const labels = switcher.querySelectorAll('.lang-label');

        if (!switchElement || !flag || !labels.length) {
            console.log('Language switcher elements not found', {
                switchElement: !!switchElement,
                flag: !!flag,
                labels: labels.length
            });
            return;
        }

        console.log(`Updating language switcher for language: ${this.currentLanguage}`);

        // Force clear all classes first
        switchElement.classList.remove('en', 'ar');
        
        // Update flag and classes based on current language
        if (this.currentLanguage === 'ar') {
            flag.textContent = '🇸🇦';
            switchElement.classList.add('ar');
            console.log('Set to Arabic mode');
        } else {
            flag.textContent = '🇺🇸';
            switchElement.classList.add('en');
            console.log('Set to English mode');
        }

        // Update active labels
        labels.forEach(label => {
            label.classList.remove('active');
            if (label.dataset.lang === this.currentLanguage) {
                label.classList.add('active');
            }
        });
        
        console.log('Language switcher updated successfully');
    }

    applyLanguage(lang) {
        if (!this.translations[lang]) {
            console.error(`No translations found for language: ${lang}`);
            return;
        }

        console.log(`Applying language: ${lang}`);
        console.log('Available translations:', this.translations[lang]);

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Update meta tags
        this.updateMetaTags(lang);

        // Force translate navigation first
        this.translateNavigation(lang);

        // Translate all elements with data-translate attribute
        this.translateElements(lang);

        // Update page title
        this.updatePageTitle(lang);

        // Force translate common elements
        this.forceTranslateCommonElements(lang);
    }

    forceTranslateCommonElements(lang) {
        const translations = this.translations[lang];
        if (!translations) return;

        // Force translate navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const text = link.textContent.trim();
            if (text === 'Home' && translations.nav?.home) {
                link.textContent = translations.nav.home;
            } else if (text === 'About' && translations.nav?.about) {
                link.textContent = translations.nav.about;
            } else if (text === 'Pricing' && translations.nav?.pricing) {
                link.textContent = translations.nav.pricing;
            } else if (text === 'Resources' && translations.nav?.resources) {
                link.textContent = translations.nav.resources;
            } else if (text === 'Contact' && translations.nav?.contact) {
                link.textContent = translations.nav.contact;
            }
        });

        // Force translate brand/logo
        if (translations.brand) {
            const logoText = document.querySelector('.logo-text');
            if (logoText && logoText.textContent.trim() === 'Hi Emma') {
                logoText.textContent = translations.brand.name;
            }

            const logoTagline = document.querySelector('.logo-tagline');
            if (logoTagline && logoTagline.textContent.trim() === 'AI Assistant') {
                logoTagline.textContent = translations.brand.tagline;
            }
        }

        // Force translate common buttons
        const buttons = document.querySelectorAll('button, .btn, .cta-button');
        buttons.forEach(button => {
            const text = button.textContent.trim();
            if (text === 'Get Started' && translations.common?.get_started) {
                button.textContent = translations.common.get_started;
            } else if (text === 'Learn More' && translations.common?.learn_more) {
                button.textContent = translations.common.learn_more;
            } else if (text === 'Contact Us' && translations.common?.contact_us) {
                button.textContent = translations.common.contact_us;
            }
        });
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
        const translations = this.translations[lang];
        if (!translations) return;

        let title = "Hi Emma";
        if (lang === 'ar') {
            title = "إيما للذكاء الاصطناعي";
        }

        // Update title based on current page
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

    translateElements(lang) {
        const translations = this.translations[lang];
        if (!translations) return;

        // Find all elements with data-translate attribute
        const elements = document.querySelectorAll('[data-translate]');
        console.log(`Found ${elements.length} elements with data-translate attribute for language: ${lang}`);
        
        elements.forEach((element, index) => {
            const key = element.getAttribute('data-translate');
            const originalText = element.textContent.trim();
            const translatedText = this.getNestedTranslation(translations, key);
            
            console.log(`Element ${index + 1}: key="${key}", original="${originalText}", translated="${translatedText}"`);
            
            if (translatedText) {
                // Handle different content types
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translatedText;
                } else if (element.tagName === 'INPUT' && element.type === 'email') {
                    element.placeholder = translatedText;
                } else if (element.tagName === 'TEXTAREA') {
                    element.placeholder = translatedText;
                } else {
                    element.textContent = translatedText;
                }
                console.log(`Translated element ${index + 1}: "${originalText}" -> "${translatedText}"`);
            } else {
                console.log(`No translation found for element ${index + 1} with key: ${key}`);
            }
        });

        // Translate all page content comprehensively
        this.translateAllPageContent(lang);
    }

    translateAllPageContent(lang) {
        const translations = this.translations[lang];
        if (!translations) return;

        // Translate all headings and text content
        this.translateHeadings(lang);
        this.translateParagraphs(lang);
        this.translateButtons(lang);
        this.translateForms(lang);
        this.translateCards(lang);
        this.translateSections(lang);
        
        // Handle specific elements by ID
        this.translateSpecificElements(lang);
    }

    translateHeadings(lang) {
        const translations = this.translations[lang];
        if (!translations) return;

        // Only translate headings that explicitly have data-translate attribute set to a valid key
        const headings = document.querySelectorAll('h1[data-translate]:not([data-translate="false"]), h2[data-translate]:not([data-translate="false"]), h3[data-translate]:not([data-translate="false"]), h4[data-translate]:not([data-translate="false"]), h5[data-translate]:not([data-translate="false"]), h6[data-translate]:not([data-translate="false"])');
        console.log(`Found ${headings.length} headings with valid data-translate attributes to translate for language: ${lang}`);
        
        headings.forEach(heading => {
            const text = heading.textContent.trim();
            const translateKey = heading.getAttribute('data-translate');
            console.log(`Processing heading with data-translate="${translateKey}": "${text}"`);
            
            // Only translate if data-translate is not "false"
            if (translateKey === 'false') {
                console.log(`Skipping heading with data-translate="false": "${text}"`);
                return;
            }
            
            // Check if text contains Arabic characters
            const hasArabic = /[\u0600-\u06FF]/.test(text);
            console.log(`Heading has Arabic: ${hasArabic}, current language: ${lang}`);
            
            if (hasArabic && lang === 'en') {
                // Force translate Arabic to English
                const manualTranslation = this.getManualTranslation(text);
                if (manualTranslation) {
                    console.log(`Manual translation: "${text}" -> "${manualTranslation}"`);
                    heading.textContent = manualTranslation;
                    return;
                }
            }
            
            const translatedText = this.findTranslationForText(text, translations);
            if (translatedText && translatedText !== text) {
                console.log(`Translating heading: "${text}" -> "${translatedText}"`);
                heading.textContent = translatedText;
            } else {
                // Try to find translation using partial matching
                const partialTranslation = this.findPartialTranslation(text, translations);
                if (partialTranslation && partialTranslation !== text) {
                    console.log(`Partial translation found: "${text}" -> "${partialTranslation}"`);
                    heading.textContent = partialTranslation;
                } else {
                    console.log(`No translation found for heading: "${text}"`);
                }
            }
        });
    }

    getManualTranslation(text) {
        // Manual translations for common Arabic text
        const manualTranslations = {
            'التصنيع': 'Manufacturing',
            'التجارة': 'Commerce',
            'البنوك': 'Banking',
            'التعليم': 'Education',
            'خدمة العملاء': 'Customer Service',
            'الرعاية الصحية': 'Healthcare',
            'هل أنت مستعد لتحويل عملياتك؟': 'Ready to Transform Your Operations?',
            'هل أنت مستعد لتحويل صناعتك؟': 'Ready to Transform Your Industry?',
            'موثوق من قادة الصناعة': 'Trusted by Industry Leaders',
            'تعرف على إيما': 'Meet Emma',
            'مساعدك الذكي للذكاء الاصطناعي': 'Your Intelligent AI Assistant'
        };
        
        // Check for exact match
        if (manualTranslations[text]) {
            return manualTranslations[text];
        }
        
        // Check for partial match
        for (const [arabic, english] of Object.entries(manualTranslations)) {
            if (text.includes(arabic)) {
                return text.replace(arabic, english);
            }
        }
        
        return null;
    }

    translateParagraphs(lang) {
        const translations = this.translations[lang];
        if (!translations) return;

        // Only translate paragraphs that explicitly have data-translate attribute set to a valid key
        const paragraphs = document.querySelectorAll('p[data-translate]:not([data-translate="false"])');
        console.log(`Found ${paragraphs.length} paragraphs with valid data-translate attributes to translate for language: ${lang}`);
        
        paragraphs.forEach(paragraph => {
            const text = paragraph.textContent.trim();
            const translateKey = paragraph.getAttribute('data-translate');
            console.log(`Processing paragraph with data-translate="${translateKey}": "${text}"`);
            
            // Only translate if data-translate is not "false"
            if (translateKey === 'false') {
                console.log(`Skipping paragraph with data-translate="false": "${text}"`);
                return;
            }
            
            const translatedText = this.findTranslationForText(text, translations);
            if (translatedText && translatedText !== text) {
                console.log(`Translating paragraph: "${text}" -> "${translatedText}"`);
                paragraph.textContent = translatedText;
            } else {
                // Try partial translation
                const partialTranslation = this.findPartialTranslation(text, translations);
                if (partialTranslation && partialTranslation !== text) {
                    console.log(`Partial paragraph translation: "${text}" -> "${partialTranslation}"`);
                    paragraph.textContent = partialTranslation;
                }
            }
        });
    }

    translateButtons(lang) {
        const translations = this.translations[lang];
        if (!translations) return;

        // Only translate buttons that explicitly have data-translate attribute set to a valid key
        const buttons = document.querySelectorAll('button[data-translate]:not([data-translate="false"]), .btn[data-translate]:not([data-translate="false"]), .cta-button[data-translate]:not([data-translate="false"]), .button[data-translate]:not([data-translate="false"])');
        buttons.forEach(button => {
            const text = button.textContent.trim();
            const translateKey = button.getAttribute('data-translate');
            
            // Only translate if data-translate is not "false"
            if (translateKey === 'false') {
                return;
            }
            
            const translatedText = this.findTranslationForText(text, translations);
            if (translatedText && translatedText !== text) {
                button.textContent = translatedText;
            }
        });
    }

    translateForms(lang) {
        const translations = this.translations[lang];
        if (!translations) return;

        // Only translate form labels that explicitly have data-translate attribute set to a valid key
        const labels = document.querySelectorAll('label[data-translate]:not([data-translate="false"])');
        labels.forEach(label => {
            const text = label.textContent.trim();
            const translateKey = label.getAttribute('data-translate');
            
            // Only translate if data-translate is not "false"
            if (translateKey === 'false') {
                return;
            }
            
            const translatedText = this.findTranslationForText(text, translations);
            if (translatedText && translatedText !== text) {
                label.textContent = translatedText;
            }
        });

        // Only translate input placeholders that explicitly have data-translate attribute set to a valid key
        const inputs = document.querySelectorAll('input[data-translate]:not([data-translate="false"]), textarea[data-translate]:not([data-translate="false"])');
        inputs.forEach(input => {
            if (input.placeholder) {
                const text = input.placeholder.trim();
                const translateKey = input.getAttribute('data-translate');
                
                // Only translate if data-translate is not "false"
                if (translateKey === 'false') {
                    return;
                }
                
                const translatedText = this.findTranslationForText(text, translations);
                if (translatedText && translatedText !== text) {
                    input.placeholder = translatedText;
                }
            }
        });
    }

    translateCards(lang) {
        const translations = this.translations[lang];
        if (!translations) return;

        // Only translate card content that explicitly has data-translate attribute set to a valid key
        const cards = document.querySelectorAll('.card[data-translate]:not([data-translate="false"]), .pricing-card[data-translate]:not([data-translate="false"]), .feature-card[data-translate]:not([data-translate="false"]), .industry-card[data-translate]:not([data-translate="false"]), .capability-card[data-translate]:not([data-translate="false"]), .use-case-card[data-translate]:not([data-translate="false"])');
        cards.forEach(card => {
            const title = card.querySelector('h3[data-translate]:not([data-translate="false"]), .card-title[data-translate]:not([data-translate="false"]), .plan-name[data-translate]:not([data-translate="false"])');
            const description = card.querySelector('p[data-translate]:not([data-translate="false"]), .card-description[data-translate]:not([data-translate="false"]), .plan-description[data-translate]:not([data-translate="false"])');
            const button = card.querySelector('button[data-translate]:not([data-translate="false"]), .btn[data-translate]:not([data-translate="false"]), .cta-button[data-translate]:not([data-translate="false"])');

            if (title) {
                const text = title.textContent.trim();
                const translateKey = title.getAttribute('data-translate');
                
                // Only translate if data-translate is not "false"
                if (translateKey === 'false') {
                    return;
                }
                
                const translatedText = this.findTranslationForText(text, translations);
                if (translatedText && translatedText !== text) {
                    title.textContent = translatedText;
                }
            }

            if (description) {
                const text = description.textContent.trim();
                const translateKey = description.getAttribute('data-translate');
                
                // Only translate if data-translate is not "false"
                if (translateKey === 'false') {
                    return;
                }
                
                const translatedText = this.findTranslationForText(text, translations);
                if (translatedText && translatedText !== text) {
                    description.textContent = translatedText;
                }
            }

            if (button) {
                const text = button.textContent.trim();
                const translateKey = button.getAttribute('data-translate');
                
                // Only translate if data-translate is not "false"
                if (translateKey === 'false') {
                    return;
                }
                
                const translatedText = this.findTranslationForText(text, translations);
                if (translatedText && translatedText !== text) {
                    button.textContent = translatedText;
                }
            }
        });
    }

    translateSections(lang) {
        const translations = this.translations[lang];
        if (!translations) return;

        // Only translate section content that explicitly has data-translate attribute set to a valid key
        const sections = document.querySelectorAll('section[data-translate]:not([data-translate="false"]), .section[data-translate]:not([data-translate="false"]), .hero[data-translate]:not([data-translate="false"]), .hero-section[data-translate]:not([data-translate="false"])');
        sections.forEach(section => {
            const title = section.querySelector('h1[data-translate]:not([data-translate="false"]), h2[data-translate]:not([data-translate="false"]), h3[data-translate]:not([data-translate="false"]), .section-title[data-translate]:not([data-translate="false"]), .hero-title[data-translate]:not([data-translate="false"])');
            const subtitle = section.querySelector('p[data-translate]:not([data-translate="false"]), .section-subtitle[data-translate]:not([data-translate="false"]), .hero-subtitle[data-translate]:not([data-translate="false"])');
            const description = section.querySelector('.description[data-translate]:not([data-translate="false"]), .hero-description[data-translate]:not([data-translate="false"])');

            if (title) {
                const text = title.textContent.trim();
                const translateKey = title.getAttribute('data-translate');
                
                // Only translate if data-translate is not "false"
                if (translateKey === 'false') {
                    return;
                }
                
                const translatedText = this.findTranslationForText(text, translations);
                if (translatedText && translatedText !== text) {
                    title.textContent = translatedText;
                }
            }

            if (subtitle) {
                const text = subtitle.textContent.trim();
                const translateKey = subtitle.getAttribute('data-translate');
                
                // Only translate if data-translate is not "false"
                if (translateKey === 'false') {
                    return;
                }
                
                const translatedText = this.findTranslationForText(text, translations);
                if (translatedText && translatedText !== text) {
                    subtitle.textContent = translatedText;
                }
            }

            if (description) {
                const text = description.textContent.trim();
                const translateKey = description.getAttribute('data-translate');
                
                // Only translate if data-translate is not "false"
                if (translateKey === 'false') {
                    return;
                }
                
                const translatedText = this.findTranslationForText(text, translations);
                if (translatedText && translatedText !== text) {
                    description.textContent = translatedText;
                }
            }
        });
    }

    findTranslationForText(text, translations) {
        // Clean up the text first
        const cleanText = text.trim();
        
        // First try exact match
        const exactMatch = this.findExactTranslation(cleanText, translations);
        if (exactMatch) return exactMatch;

        // Try partial match for common words
        const partialMatch = this.findPartialTranslation(cleanText, translations);
        if (partialMatch) return partialMatch;

        // Try to handle multi-line text by splitting and translating each line
        if (cleanText.includes('\n')) {
            const lines = cleanText.split('\n');
            const translatedLines = lines.map(line => {
                const lineMatch = this.findPartialTranslation(line.trim(), translations);
                return lineMatch || line.trim();
            });
            return translatedLines.join('\n');
        }

        // Try keyword-based translation
        const keywordMatch = this.findKeywordTranslation(cleanText, translations);
        if (keywordMatch) return keywordMatch;

        return null;
    }

    findExactTranslation(text, translations) {
        const searchInObject = (obj, searchText) => {
            for (const key in obj) {
                if (typeof obj[key] === 'string') {
                    if (obj[key] === searchText) {
                        return obj[key];
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    const result = searchInObject(obj[key], searchText);
                    if (result) return result;
                }
            }
            return null;
        };
        return searchInObject(translations, text);
    }

    findPartialTranslation(text, translations) {
        console.log(`findPartialTranslation called with text: "${text}", currentLanguage: ${this.currentLanguage}`);
        
        // Common word mappings - bidirectional
        const wordMappings = {
            // Navigation
            'Home': 'الرئيسية',
            'About': 'حول',
            'Pricing': 'الأسعار',
            'Resources': 'الموارد',
            'Contact': 'اتصل بنا',
            
            // Common actions
            'Get Started': 'ابدأ الآن',
            'Learn More': 'اعرف المزيد',
            'Contact Us': 'اتصل بنا',
            'Read More': 'اقرأ المزيد',
            'View All': 'عرض الكل',
            'Submit': 'إرسال',
            'Send': 'إرسال',
            'Cancel': 'إلغاء',
            'Close': 'إغلاق',
            'Next': 'التالي',
            'Previous': 'السابق',
            'Back': 'رجوع',
            'Continue': 'متابعة',
            'Save': 'حفظ',
            'Edit': 'تعديل',
            'Delete': 'حذف',
            'View': 'عرض',
            'Download': 'تحميل',
            'Upload': 'رفع',
            'Search': 'بحث',
            'Filter': 'تصفية',
            'Sort': 'ترتيب',
            'Refresh': 'تحديث',
            'Loading...': 'جاري التحميل...',
            'Error': 'خطأ',
            'Success': 'نجح',
            'Warning': 'تحذير',
            'Information': 'معلومات',
            
            // Home page specific mappings
            'Meet Emma': 'تعرف على إيما',
            'Your Intelligent AI Assistant': 'مساعدك الذكي للذكاء الاصطناعي',
            'Trusted by Industry Leaders': 'موثوق من قادة الصناعة',
            'Emma\'s Core Capabilities': 'قدرات إيما الأساسية',
            'Intelligent automation that adapts, learns, and takes initiative': 'أتمتة ذكية تتكيف وتتعلم وتتخذ المبادرة',
            'Industry Solutions': 'حلول الصناعة',
            'Tailored AI solutions for every sector': 'حلول ذكاء اصطناعي مصممة لكل قطاع',
            'Use Cases': 'حالات الاستخدام',
            'Real-world applications across industries': 'تطبيقات حقيقية عبر الصناعات',
            'Ready to Transform Your Industry?': 'هل أنت مستعد لتحويل عملياتك؟',
            'Join thousands of organizations already using Emma': 'انضم إلى آلاف المنظمات التي تستخدم إيما بالفعل',
            'Trusted & Certified': 'موثوق ومعتمد',
            'Emma AI': 'إيما للذكاء الاصطناعي',
            'Product': 'المنتج',
            'Company': 'الشركة',
            'Support': 'الدعم',
            'Legal': 'قانوني',
            'Stay Updated': 'ابق محدثاً',
            
            // Industry names
            'Healthcare': 'الرعاية الصحية',
            'Banking': 'البنوك',
            'Education': 'التعليم',
            'Manufacturing': 'التصنيع',
            'Retail': 'التجارة',
            'Finance': 'المالية',
            'Customer Service': 'خدمة العملاء',
            
            // Capability names
            'Conversational Scheduling': 'جدولة المحادثات',
            'Smart Pre-Qualification': 'التأهيل المسبق الذكي',
            'Hyper-Personalized Engagement': 'التفاعل الشخصي المتقدم',
            
            // Footer terms
            'Features': 'الميزات',
            'Integrations': 'التكاملات',
            'API': 'واجهة برمجة التطبيقات',
            'Security': 'الأمان',
            'About Us': 'من نحن',
            'Careers': 'الوظائف',
            'Blog': 'المدونة',
            'Press': 'الصحافة',
            'Partners': 'الشركاء',
            'Help Center': 'مركز المساعدة',
            'Contact Us': 'اتصل بنا',
            'System Status': 'حالة النظام',
            'Documentation': 'الوثائق',
            'Community': 'المجتمع',
            'Privacy Policy': 'سياسة الخصوصية',
            'Terms of Service': 'شروط الخدمة',
            'Cookie Policy': 'سياسة ملفات تعريف الارتباط',
            'Accessibility': 'إمكانية الوصول',
            'Subscribe': 'اشترك',
            'Enter your email': 'أدخل بريدك الإلكتروني',
            'We respect your privacy. Unsubscribe at any time.': 'نحن نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.',
            
            // Footer brand
            'Hi Emma': 'مرحباً إيما',
            'AI Assistant': 'مساعد الذكاء الاصطناعي',
            'Intelligent AI Assistant Platform': 'منصة مساعد الذكاء الاصطناعي الذكي',
            'Building the future of autonomous AI agents. Transform your operations with intelligent automation across Healthcare, Banking, Education, and more.': 'بناء مستقبل وكلاء الذكاء الاصطناعي المستقلين. حول عملياتك بأتمتة ذكية عبر الرعاية الصحية والبنوك والتعليم والمزيد.'
        };

        const currentLang = this.currentLanguage;
        console.log(`Translation direction: currentLang=${currentLang}, text="${text}"`);
        
        // Create reverse mapping for better performance
        if (!this.reverseWordMappings) {
            this.reverseWordMappings = {};
            for (const [en, ar] of Object.entries(wordMappings)) {
                this.reverseWordMappings[ar] = en;
            }
        }
        
        if (currentLang === 'ar') {
            // Arabic to English
            const result = this.reverseWordMappings[text] || null;
            console.log(`Arabic to English: "${text}" -> "${result}"`);
            return result;
        } else {
            // English to Arabic - but we need to check if text is actually Arabic first
            // If text contains Arabic characters, translate from Arabic to English
            const hasArabic = /[\u0600-\u06FF]/.test(text);
            if (hasArabic) {
                const result = this.reverseWordMappings[text] || null;
                console.log(`Detected Arabic text, translating to English: "${text}" -> "${result}"`);
                return result;
            } else {
                const result = wordMappings[text] || null;
                console.log(`English to Arabic: "${text}" -> "${result}"`);
                return result;
            }
        }
    }

    findKeywordTranslation(text, translations) {
        // Try to find translations based on keywords
        const keywords = text.toLowerCase().split(' ').filter(word => word.length > 2);
        
        for (const keyword of keywords) {
            const searchInObject = (obj, searchKeyword) => {
                for (const key in obj) {
                    if (typeof obj[key] === 'string') {
                        if (obj[key].toLowerCase().includes(searchKeyword)) {
                            return obj[key];
                        }
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        const result = searchInObject(obj[key], searchKeyword);
                        if (result) return result;
                    }
                }
                return null;
            };
            
            const result = searchInObject(translations, keyword);
            if (result) return result;
        }
        
        return null;
    }

    translateSpecificElements(lang) {
        const translations = this.translations[lang];
        if (!translations) return;

        // Navigation
        this.translateNavigation(lang);
        
        // Hero section
        this.translateHeroSection(lang);
        
        // Capabilities section
        this.translateCapabilitiesSection(lang);
        
        // Industries section
        this.translateIndustriesSection(lang);
        
        // Footer
        this.translateFooter(lang);
    }

    translateNavigation(lang) {
        const translations = this.translations[lang];
        if (!translations || !translations.nav) {
            console.log('No navigation translations found for language:', lang);
            return;
        }

        const nav = translations.nav;
        console.log('Navigation translations:', nav);

        // Update navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        console.log(`Found ${navLinks.length} navigation links to translate`);
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const originalText = link.textContent.trim();
            let translatedText = originalText;
            
            if (href === '/' || href.includes('home')) {
                translatedText = nav.home;
            } else if (href.includes('about')) {
                translatedText = nav.about;
            } else if (href.includes('pricing')) {
                translatedText = nav.pricing;
            } else if (href.includes('resources')) {
                translatedText = nav.resources;
            } else if (href.includes('contact')) {
                translatedText = nav.contact;
            }
            
            if (translatedText !== originalText) {
                console.log(`Translating nav link: "${originalText}" -> "${translatedText}"`);
                link.textContent = translatedText;
            }
        });

        // Translate brand/logo text
        this.translateBrand(lang);
    }

    translateBrand(lang) {
        const translations = this.translations[lang];
        if (!translations || !translations.brand) {
            console.log('No brand translations found for language:', lang);
            return;
        }

        const brand = translations.brand;
        console.log('Brand translations:', brand);

        // Update logo text
        const logoText = document.querySelector('.logo-text');
        if (logoText) {
            logoText.textContent = brand.name;
            console.log(`Translated logo text to: "${brand.name}"`);
        }

        // Update logo tagline
        const logoTagline = document.querySelector('.logo-tagline');
        if (logoTagline) {
            logoTagline.textContent = brand.tagline;
            console.log(`Translated logo tagline to: "${brand.tagline}"`);
        }
    }

    translateHeroSection(lang) {
        const hero = translations[lang].hero;
        if (!hero) return;

        // Update hero title
        const heroTitle = document.getElementById('hero-title');
        if (heroTitle) {
            heroTitle.innerHTML = `
                <span class="title-line-1">${hero.title}</span>
                <span class="title-line-2">${hero.subtitle}</span>
            `;
        }

        // Update hero description
        const heroDescription = document.getElementById('hero-description');
        if (heroDescription) {
            heroDescription.textContent = hero.description;
        }

        // Update CTA buttons
        const ctaPrimary = document.getElementById('hero-primary-text');
        if (ctaPrimary) {
            ctaPrimary.textContent = hero.cta_primary;
        }

        // Update use case showcase
        const useCaseHeader = document.querySelector('.use-case-header h3');
        if (useCaseHeader) {
            useCaseHeader.textContent = hero.trusted_by;
        }

        const useCaseSubheader = document.querySelector('.use-case-header p');
        if (useCaseSubheader) {
            useCaseSubheader.textContent = hero.see_how;
        }
    }

    translateCapabilitiesSection(lang) {
        const capabilities = translations[lang].capabilities;
        if (!capabilities) return;

        // Update section title
        const sectionTitle = document.getElementById('capabilities-title');
        if (sectionTitle) {
            sectionTitle.textContent = capabilities.title;
        }

        const sectionSubtitle = document.getElementById('capabilities-subtitle');
        if (sectionSubtitle) {
            sectionSubtitle.textContent = capabilities.subtitle;
        }

        // Update capability cards
        const schedulingCard = document.querySelector('[data-capability="scheduling"]');
        if (schedulingCard) {
            const title = schedulingCard.querySelector('h3');
            const description = schedulingCard.querySelector('p');
            const userDemo = schedulingCard.querySelector('.demo-bubble:not(.emma-response)');
            const emmaDemo = schedulingCard.querySelector('.demo-bubble.emma-response');

            if (title) title.textContent = capabilities.scheduling.title;
            if (description) description.textContent = capabilities.scheduling.description;
            if (userDemo) userDemo.textContent = capabilities.scheduling.demo_user;
            if (emmaDemo) emmaDemo.textContent = capabilities.scheduling.demo_emma;
        }

        const intelligenceCard = document.querySelector('[data-capability="intelligence"]');
        if (intelligenceCard) {
            const title = intelligenceCard.querySelector('h3');
            const description = intelligenceCard.querySelector('p');
            const userDemo = intelligenceCard.querySelector('.demo-bubble:not(.emma-response)');
            const emmaDemo = intelligenceCard.querySelector('.demo-bubble.emma-response');

            if (title) title.textContent = capabilities.intelligence.title;
            if (description) description.textContent = capabilities.intelligence.description;
            if (userDemo) userDemo.textContent = capabilities.intelligence.demo_user;
            if (emmaDemo) emmaDemo.textContent = capabilities.intelligence.demo_emma;
        }

        const personalizationCard = document.querySelector('[data-capability="personalization"]');
        if (personalizationCard) {
            const title = personalizationCard.querySelector('h3');
            const description = personalizationCard.querySelector('p');
            const userDemo = personalizationCard.querySelector('.demo-bubble:not(.emma-response)');
            const emmaDemo = personalizationCard.querySelector('.demo-bubble.emma-response');

            if (title) title.textContent = capabilities.personalization.title;
            if (description) description.textContent = capabilities.personalization.description;
            if (userDemo) userDemo.textContent = capabilities.personalization.demo_user;
            if (emmaDemo) emmaDemo.textContent = capabilities.personalization.demo_emma;
        }
    }

    translateIndustriesSection(lang) {
        const industries = translations[lang].industries;
        if (!industries) return;

        // Update section title
        const sectionTitle = document.getElementById('industries-title');
        if (sectionTitle) {
            sectionTitle.textContent = industries.title;
        }

        const sectionSubtitle = document.getElementById('industries-subtitle');
        if (sectionSubtitle) {
            sectionSubtitle.textContent = industries.subtitle;
        }

        // Update industry cards
        this.translateIndustryCard('healthcare', industries.healthcare);
        this.translateIndustryCard('banking', industries.banking);
        this.translateIndustryCard('education', industries.education);
        this.translateIndustryCard('manufacturing', industries.manufacturing);
        this.translateIndustryCard('retail', industries.retail);
        this.translateIndustryCard('finance', industries.finance);
    }

    translateIndustryCard(industry, translations) {
        const card = document.querySelector(`[data-industry="${industry}"]`);
        if (!card || !translations) return;

        // Update card title
        const title = card.querySelector('.card-title');
        if (title) {
            title.textContent = translations.title;
        }

        // Update features
        const features = card.querySelectorAll('.feature-item');
        features.forEach((feature, index) => {
            const featureTitle = feature.querySelector('h4');
            const featureDescription = feature.querySelector('p');
            
            const featureKeys = Object.keys(translations.features);
            if (featureKeys[index]) {
                const featureData = translations.features[featureKeys[index]];
                if (featureTitle) featureTitle.textContent = featureData.title;
                if (featureDescription) featureDescription.textContent = featureData.description;
            }
        });

        // Update learn more button
        const learnMoreBtn = card.querySelector('.btn-outline');
        if (learnMoreBtn) {
            learnMoreBtn.textContent = this.translations[this.currentLanguage].common.learn_more;
        }
    }

    translateFooter(lang) {
        const translations = this.translations[lang];
        if (!translations || !translations.footer) return;

        const footer = translations.footer;
        console.log('Translating footer for language:', lang);

        // Update footer brand
        const brandName = document.querySelector('.footer-brand-name');
        const brandTagline = document.querySelector('.footer-brand-tagline');
        const brandDescription = document.querySelector('.brand-description');

        if (brandName) {
            brandName.textContent = footer.brand.name;
            console.log('Translated brand name:', footer.brand.name);
        }
        if (brandTagline) {
            brandTagline.textContent = footer.brand.tagline;
            console.log('Translated brand tagline:', footer.brand.tagline);
        }
        if (brandDescription) {
            brandDescription.textContent = footer.brand.description;
            console.log('Translated brand description');
        }

        // Update footer columns
        this.translateFooterColumns(footer);
        
        // Update newsletter section
        this.translateFooterNewsletter(footer);
        
        // Update footer bottom
        this.translateFooterBottom(footer);
    }

    translateFooterColumns(footer) {
        // Product column
        const productTitle = document.querySelector('.footer-column:nth-child(1) .column-title');
        if (productTitle) {
            productTitle.textContent = footer.columns.product.title;
            console.log('Translated product title:', footer.columns.product.title);
        }
        
        const productLinks = document.querySelectorAll('.footer-column:nth-child(1) .footer-link');
        const productKeys = ['features', 'pricing', 'integrations', 'api', 'security'];
        productLinks.forEach((link, index) => {
            if (productKeys[index]) {
                const originalText = link.textContent;
                link.textContent = footer.columns.product[productKeys[index]];
                console.log(`Translated product link: "${originalText}" -> "${link.textContent}"`);
            }
        });

        // Company column
        const companyTitle = document.querySelector('.footer-column:nth-child(2) .column-title');
        if (companyTitle) {
            companyTitle.textContent = footer.columns.company.title;
            console.log('Translated company title:', footer.columns.company.title);
        }
        
        const companyLinks = document.querySelectorAll('.footer-column:nth-child(2) .footer-link');
        const companyKeys = ['about_us', 'careers', 'blog', 'press', 'partners'];
        companyLinks.forEach((link, index) => {
            if (companyKeys[index]) {
                const originalText = link.textContent;
                link.textContent = footer.columns.company[companyKeys[index]];
                console.log(`Translated company link: "${originalText}" -> "${link.textContent}"`);
            }
        });

        // Support column
        const supportTitle = document.querySelector('.footer-column:nth-child(3) .column-title');
        if (supportTitle) {
            supportTitle.textContent = footer.columns.support.title;
            console.log('Translated support title:', footer.columns.support.title);
        }
        
        const supportLinks = document.querySelectorAll('.footer-column:nth-child(3) .footer-link');
        const supportKeys = ['help_center', 'contact_us', 'system_status', 'documentation', 'community'];
        supportLinks.forEach((link, index) => {
            if (supportKeys[index]) {
                const originalText = link.textContent;
                link.textContent = footer.columns.support[supportKeys[index]];
                console.log(`Translated support link: "${originalText}" -> "${link.textContent}"`);
            }
        });

        // Legal column
        const legalTitle = document.querySelector('.footer-column:nth-child(4) .column-title');
        if (legalTitle) {
            legalTitle.textContent = footer.columns.legal.title;
            console.log('Translated legal title:', footer.columns.legal.title);
        }
        
        const legalLinks = document.querySelectorAll('.footer-column:nth-child(4) .footer-link');
        const legalKeys = ['privacy_policy', 'terms_of_service', 'cookie_policy', 'accessibility'];
        legalLinks.forEach((link, index) => {
            if (legalKeys[index]) {
                const originalText = link.textContent;
                link.textContent = footer.columns.legal[legalKeys[index]];
                console.log(`Translated legal link: "${originalText}" -> "${link.textContent}"`);
            }
        });
    }

    translateFooterNewsletter(footer) {
        const newsletterTitle = document.querySelector('.newsletter-title');
        const newsletterDescription = document.querySelector('.newsletter-description');
        const newsletterPlaceholder = document.querySelector('.newsletter-input');
        const newsletterButton = document.querySelector('.newsletter-button span');
        const newsletterDisclaimer = document.querySelector('.newsletter-disclaimer');

        if (newsletterTitle) {
            newsletterTitle.textContent = footer.newsletter.title;
            console.log('Translated newsletter title:', footer.newsletter.title);
        }
        if (newsletterDescription) {
            newsletterDescription.textContent = footer.newsletter.description;
            console.log('Translated newsletter description');
        }
        if (newsletterPlaceholder) {
            newsletterPlaceholder.placeholder = footer.newsletter.placeholder;
            console.log('Translated newsletter placeholder:', footer.newsletter.placeholder);
        }
        if (newsletterButton) {
            newsletterButton.textContent = footer.newsletter.subscribe;
            console.log('Translated newsletter button:', footer.newsletter.subscribe);
        }
        if (newsletterDisclaimer) {
            newsletterDisclaimer.textContent = footer.newsletter.disclaimer;
            console.log('Translated newsletter disclaimer');
        }
    }

    translateFooterBottom(footer) {
        const copyright = document.querySelector('.copyright p');
        const bottomLinks = document.querySelectorAll('.bottom-link');
        const bottomKeys = ['privacy_policy', 'terms_of_service', 'cookie_policy', 'accessibility'];

        if (copyright) {
            copyright.textContent = footer.bottom.copyright;
            console.log('Translated copyright text');
        }

        bottomLinks.forEach((link, index) => {
            if (bottomKeys[index]) {
                const originalText = link.textContent;
                link.textContent = footer.bottom[bottomKeys[index]];
                console.log(`Translated bottom link: "${originalText}" -> "${link.textContent}"`);
            }
        });
    }

    translateFooterColumn(columnClass, translations) {
        const column = document.querySelector(`.footer-column:has(.column-title)`);
        if (!column || !translations) return;

        const title = column.querySelector('.column-title');
        if (title) {
            title.textContent = translations.title;
        }

        const links = column.querySelectorAll('.footer-link');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href.includes('features')) {
                link.textContent = translations.features;
            } else if (href.includes('pricing')) {
                link.textContent = translations.pricing;
            } else if (href.includes('integrations')) {
                link.textContent = translations.integrations;
            } else if (href.includes('api')) {
                link.textContent = translations.api;
            } else if (href.includes('security')) {
                link.textContent = translations.security;
            }
            // Add more mappings as needed
        });
    }

    handleRTLSupport() {
        const isRTL = this.rtlLanguages.includes(this.currentLanguage);
        
        console.log(`Setting layout direction: ${isRTL ? 'RTL' : 'LTR'} for language: ${this.currentLanguage}`);
        
        if (isRTL) {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
            console.log('Applied RTL layout');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
            console.log('Applied LTR layout');
        }

        // Add RTL-specific styles
        this.addRTLStyles();
    }

    addRTLStyles() {
        // Remove existing RTL styles first
        const existingStyle = document.getElementById('rtl-styles');
        if (existingStyle) {
            existingStyle.remove();
        }

        // Only add RTL styles if current language is RTL
        if (!this.rtlLanguages.includes(this.currentLanguage)) {
            console.log('Skipping RTL styles - current language is LTR');
            return;
        }

        console.log('Adding RTL styles for language:', this.currentLanguage);

        const style = document.createElement('style');
        style.id = 'rtl-styles';
        style.textContent = `
            /* RTL Base Styles */
            [dir="rtl"] {
                direction: rtl !important;
                text-align: right !important;
            }

            [dir="rtl"] * {
                direction: rtl !important;
            }

            [dir="rtl"] .hero-content {
                text-align: right !important;
                direction: rtl !important;
            }

            [dir="rtl"] .section-header {
                text-align: right !important;
                direction: rtl !important;
            }

            [dir="rtl"] .nav-links {
                flex-direction: row-reverse !important;
                direction: rtl !important;
            }

            [dir="rtl"] .footer-links-grid {
                direction: rtl !important;
            }

            [dir="rtl"] .use-case-cards {
                direction: rtl !important;
            }

            [dir="rtl"] .industries-grid {
                direction: rtl !important;
            }

            [dir="rtl"] .capabilities-grid {
                direction: rtl !important;
            }

            /* RTL specific adjustments */
            [dir="rtl"] .logo-container {
                flex-direction: row-reverse !important;
            }

            [dir="rtl"] .cta-buttons {
                flex-direction: row-reverse !important;
            }

            [dir="rtl"] .hero-stats-section .stats-grid {
                direction: rtl !important;
            }

            /* Ensure proper text alignment for Arabic */
            [dir="rtl"] h1, [dir="rtl"] h2, [dir="rtl"] h3, [dir="rtl"] h4, [dir="rtl"] h5, [dir="rtl"] h6 {
                text-align: right !important;
                direction: rtl !important;
            }

            [dir="rtl"] p {
                text-align: right !important;
                direction: rtl !important;
            }

            [dir="rtl"] .hero-description {
                text-align: right !important;
                direction: rtl !important;
            }

            [dir="rtl"] .section-subtitle {
                text-align: right !important;
                direction: rtl !important;
            }

            /* RTL Layout Adjustments */
            [dir="rtl"] .hero {
                text-align: right !important;
                direction: rtl !important;
            }

            [dir="rtl"] .hero-content h1 {
                text-align: right !important;
                direction: rtl !important;
            }

            [dir="rtl"] .hero-content p {
                text-align: right !important;
                direction: rtl !important;
            }

            [dir="rtl"] .section {
                text-align: right !important;
                direction: rtl !important;
            }

            [dir="rtl"] .section h2 {
                text-align: right !important;
                direction: rtl !important;
            }

            [dir="rtl"] .section p {
                text-align: right !important;
                direction: rtl !important;
            }

            /* RTL Card Layouts */
            [dir="rtl"] .industry-card,
            [dir="rtl"] .capability-card,
            [dir="rtl"] .use-case-card {
                text-align: right !important;
                direction: rtl !important;
            }

            [dir="rtl"] .industry-card h3,
            [dir="rtl"] .capability-card h3,
            [dir="rtl"] .use-case-card h3 {
                text-align: right !important;
                direction: rtl !important;
            }

            [dir="rtl"] .industry-card p,
            [dir="rtl"] .capability-card p,
            [dir="rtl"] .use-case-card p {
                text-align: right !important;
                direction: rtl !important;
            }

            /* RTL Navigation */
            [dir="rtl"] .navbar {
                direction: rtl !important;
            }

            [dir="rtl"] .nav-container {
                direction: rtl !important;
            }

            /* RTL Footer */
            [dir="rtl"] .footer {
                text-align: right !important;
                direction: rtl !important;
            }

            /* RTL Language Switcher */
            [dir="rtl"] .language-switcher {
                direction: rtl !important;
            }

            [dir="rtl"] .lang-switch-container {
                direction: rtl !important;
            }
        `;
        document.head.appendChild(style);
        console.log('RTL styles added to document');
    }

    getNestedTranslation(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    // Public method to get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Public method to check if current language is RTL
    isRTL() {
        return this.rtlLanguages.includes(this.currentLanguage);
    }

    // Save language preference to both localStorage and sessionStorage
    saveLanguagePreference(lang) {
        try {
            localStorage.setItem('emma-language', lang);
            sessionStorage.setItem('emma-language', lang);
            console.log(`Language preference saved: ${lang}`);
        } catch (error) {
            console.error('Failed to save language preference:', error);
            // Fallback to sessionStorage only
            try {
                sessionStorage.setItem('emma-language', lang);
                console.log(`Language preference saved to sessionStorage only: ${lang}`);
            } catch (sessionError) {
                console.error('Failed to save language preference to sessionStorage:', sessionError);
            }
        }
    }

    // Setup page navigation handling to ensure language persists
    setupPageNavigationHandling() {
        // Listen for page navigation events
        window.addEventListener('beforeunload', () => {
            this.saveLanguagePreference(this.currentLanguage);
        });

        // Handle browser back/forward navigation
        window.addEventListener('popstate', () => {
            setTimeout(() => {
                this.applyLanguage(this.currentLanguage);
                this.updateLanguageSwitcher();
            }, 100);
        });

        // Intercept navigation links to ensure language is maintained
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
                // Save language preference before navigation
                this.saveLanguagePreference(this.currentLanguage);
            }
        });
    }

    // Force language on page load
    forceLanguageOnLoad() {
        const savedLang = localStorage.getItem('emma-language') || sessionStorage.getItem('emma-language');
        if (savedLang && this.translations[savedLang]) {
            this.currentLanguage = savedLang;
            this.applyLanguage(savedLang);
            this.updateLanguageSwitcher();
            this.handleRTLSupport();
        }
    }
}

// Initialize translation engine when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded: Initializing translation engine...');
    if (!window.translationEngine) {
        window.translationEngine = new TranslationEngine();
    } else {
        // Force language on load if engine already exists
        window.translationEngine.forceLanguageOnLoad();
    }
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
    console.log('DOM still loading, waiting for DOMContentLoaded...');
} else {
    // DOM is already loaded, initialize immediately
    console.log('DOM already loaded, initializing translation engine immediately...');
    if (!window.translationEngine) {
        window.translationEngine = new TranslationEngine();
    } else {
        // Force language on load if engine already exists
        window.translationEngine.forceLanguageOnLoad();
    }
}

// Additional fallback initialization
setTimeout(() => {
    if (!window.translationEngine) {
        console.log('Fallback: Initializing translation engine after timeout...');
        window.translationEngine = new TranslationEngine();
    } else {
        // Force language on load if engine already exists
        window.translationEngine.forceLanguageOnLoad();
    }
}, 2000);

// Force initialization on window load as well
window.addEventListener('load', function() {
    if (!window.translationEngine) {
        console.log('Window load: Initializing translation engine...');
        window.translationEngine = new TranslationEngine();
    } else {
        // Force language on load if engine already exists
        window.translationEngine.forceLanguageOnLoad();
    }
});

// Immediate language check and application
(function() {
    'use strict';
    const savedLang = localStorage.getItem('emma-language') || sessionStorage.getItem('emma-language');
    if (savedLang && savedLang !== 'en') {
        console.log(`Immediate language application: ${savedLang}`);
        // Apply RTL if needed
        if (savedLang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
        }
    }
})();

// Add global toggleLanguage function for header
window.toggleLanguage = function() {
    console.log('Toggle language clicked');
    if (window.translationEngine) {
        window.translationEngine.toggleLanguage();
    } else {
        console.log('Translation engine not found, creating new instance...');
        window.translationEngine = new TranslationEngine();
        window.translationEngine.toggleLanguage();
    }
};

// Add global function to force translate cards
window.forceTranslateCards = function(lang = 'en') {
    console.log('Force translating cards to language:', lang);
    if (window.translationEngine) {
        window.translationEngine.forceTranslateCards(lang);
    } else {
        console.log('Translation engine not found, creating new instance...');
        window.translationEngine = new TranslationEngine();
        window.translationEngine.forceTranslateCards(lang);
    }
};

// Add global function to check current language state
window.checkLanguageState = function() {
    if (window.translationEngine) {
        console.log('Current language:', window.translationEngine.currentLanguage);
        console.log('Language switcher element:', document.getElementById('language-switcher'));
        console.log('Switch element classes:', document.querySelector('.lang-switch')?.className);
        console.log('Flag element text:', document.querySelector('.lang-flag')?.textContent);
        return window.translationEngine.currentLanguage;
    } else {
        console.log('Translation engine not found');
        return null;
    }
};

// Add global function to force translate data-translate elements
window.forceTranslateDataElements = function(lang = 'en') {
    console.log('Force translating data-translate elements to language:', lang);
    if (window.translationEngine) {
        window.translationEngine.translateElements(lang);
    } else {
        console.log('Translation engine not found, creating new instance...');
        window.translationEngine = new TranslationEngine();
        window.translationEngine.translateElements(lang);
    }
};

// Add global function to force translate all headings
window.forceTranslateAllHeadings = function(lang = 'en') {
    console.log('Force translating all headings to language:', lang);
    if (window.translationEngine) {
        window.translationEngine.translateHeadings(lang);
    } else {
        console.log('Translation engine not found, creating new instance...');
        window.translationEngine = new TranslationEngine();
        window.translationEngine.translateHeadings(lang);
    }
};

// Add global function to force translate all Arabic text immediately
window.forceTranslateArabicText = function() {
    console.log('🚀 FORCE TRANSLATING ALL ARABIC TEXT TO ENGLISH...');
    
    const manualTranslations = {
        'التصنيع': 'Manufacturing',
        'التجارة': 'Commerce',
        'البنوك': 'Banking',
        'التعليم': 'Education',
        'خدمة العملاء': 'Customer Service',
        'الرعاية الصحية': 'Healthcare',
        'هل أنت مستعد لتحويل عملياتك؟': 'Ready to Transform Your Operations?',
        'هل أنت مستعد لتحويل صناعتك؟': 'Ready to Transform Your Industry?',
        'موثوق من قادة الصناعة': 'Trusted by Industry Leaders',
        'تعرف على إيما': 'Meet Emma',
        'مساعدك الذكي للذكاء الاصطناعي': 'Your Intelligent AI Assistant'
    };
    
    // Find all elements with text content
    const allElements = document.querySelectorAll('*');
    let translatedCount = 0;
    
    allElements.forEach(element => {
        if (element.children.length === 0) { // Only leaf elements
            const text = element.textContent.trim();
            if (text && /[\u0600-\u06FF]/.test(text)) {
                console.log(`🔍 Found Arabic text: "${text}"`);
                
                // Check for exact match
                if (manualTranslations[text]) {
                    console.log(`✅ Translating: "${text}" -> "${manualTranslations[text]}"`);
                    element.textContent = manualTranslations[text];
                    translatedCount++;
                } else {
                    // Check for partial match
                    let newText = text;
                    for (const [arabic, english] of Object.entries(manualTranslations)) {
                        if (newText.includes(arabic)) {
                            newText = newText.replace(arabic, english);
                        }
                    }
                    if (newText !== text) {
                        console.log(`✅ Partial translation: "${text}" -> "${newText}"`);
                        element.textContent = newText;
                        translatedCount++;
                    }
                }
            }
        }
    });
    
    console.log(`✅ FORCE TRANSLATION COMPLETED! Translated ${translatedCount} elements.`);
    return translatedCount;
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TranslationEngine;
} else {
    window.TranslationEngine = TranslationEngine;
}

