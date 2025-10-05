// Hero Section Fix Script
// Ensures hero section is always visible and properly displayed

(function() {
    'use strict';
    
    console.log('Hero section fix script loaded');
    
    // Function to ensure hero section is visible
    function ensureHeroSectionVisible() {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            // Force show hero section
            heroSection.style.opacity = '1';
            heroSection.style.visibility = 'visible';
            heroSection.style.display = 'flex';
            heroSection.style.transition = 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out';
            console.log('Hero section visibility ensured');
            
            // Ensure hero content is visible
            const heroContent = heroSection.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.opacity = '1';
                heroContent.style.visibility = 'visible';
            }
            
            // Ensure hero visual is visible
            const heroVisual = heroSection.querySelector('.hero-visual');
            if (heroVisual) {
                heroVisual.style.opacity = '1';
                heroVisual.style.visibility = 'visible';
            }
            
            // Ensure hero text is visible
            const heroText = heroSection.querySelector('.hero-text');
            if (heroText) {
                heroText.style.opacity = '1';
                heroText.style.visibility = 'visible';
            }
        } else {
            console.warn('Hero section not found');
        }
    }
    
    // Function to ensure all main sections are visible
    function ensureAllSectionsVisible() {
        const sections = document.querySelectorAll('section, .hero-section, .capabilities, .industries, .badges-section');
        sections.forEach(section => {
            if (section) {
                section.style.opacity = '1';
                section.style.visibility = 'visible';
                section.style.transition = 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out';
            }
        });
        console.log('All sections visibility ensured');
    }
    
    // Run immediately
    ensureHeroSectionVisible();
    ensureAllSectionsVisible();
    
    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            ensureHeroSectionVisible();
            ensureAllSectionsVisible();
        });
    }
    
    // Run after window load
    window.addEventListener('load', function() {
        ensureHeroSectionVisible();
        ensureAllSectionsVisible();
    });
    
    // Run after a delay as fallback
    setTimeout(() => {
        ensureHeroSectionVisible();
        ensureAllSectionsVisible();
    }, 1000);
    
    // Run after longer delay as final fallback
    setTimeout(() => {
        ensureHeroSectionVisible();
        ensureAllSectionsVisible();
    }, 3000);
    
    // Watch for changes in hero section visibility
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                const heroSection = document.querySelector('.hero-section');
                if (heroSection && 
                    (heroSection.style.opacity === '0' || 
                     heroSection.style.visibility === 'hidden' || 
                     heroSection.style.display === 'none')) {
                    console.log('Hero section hidden, restoring visibility');
                    ensureHeroSectionVisible();
                }
            }
        });
    });
    
    // Start observing
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        observer.observe(heroSection, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
    // Global function to force show hero section
    window.forceShowHeroSection = function() {
        console.log('Force showing hero section');
        ensureHeroSectionVisible();
        ensureAllSectionsVisible();
    };
    
    // Global function to check hero section status
    window.checkHeroSectionStatus = function() {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            console.log('Hero section status:', {
                opacity: heroSection.style.opacity,
                visibility: heroSection.style.visibility,
                display: heroSection.style.display,
                computedOpacity: window.getComputedStyle(heroSection).opacity,
                computedVisibility: window.getComputedStyle(heroSection).visibility,
                computedDisplay: window.getComputedStyle(heroSection).display
            });
            return {
                opacity: heroSection.style.opacity,
                visibility: heroSection.style.visibility,
                display: heroSection.style.display,
                computedOpacity: window.getComputedStyle(heroSection).opacity,
                computedVisibility: window.getComputedStyle(heroSection).visibility,
                computedDisplay: window.getComputedStyle(heroSection).display
            };
        } else {
            console.log('Hero section not found');
            return null;
        }
    };
    
})();
