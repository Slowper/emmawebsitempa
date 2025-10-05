// Test Language Switching Functionality
// This script helps test and debug language switching issues

(function() {
    'use strict';
    
    console.log('Language switching test script loaded');
    
    // Test function to check current language state
    window.testLanguageState = function() {
        console.log('=== LANGUAGE STATE TEST ===');
        
        // Check localStorage
        const localStorageLang = localStorage.getItem('emma-language');
        console.log('localStorage language:', localStorageLang);
        
        // Check sessionStorage
        const sessionStorageLang = sessionStorage.getItem('emma-language');
        console.log('sessionStorage language:', sessionStorageLang);
        
        // Check translation engine
        if (window.translationEngine) {
            console.log('Translation engine current language:', window.translationEngine.currentLanguage);
            console.log('Translation engine is RTL:', window.translationEngine.isRTL());
        } else {
            console.log('Translation engine not found');
        }
        
        // Check document direction
        console.log('Document direction:', document.documentElement.getAttribute('dir'));
        console.log('Body RTL class:', document.body.classList.contains('rtl'));
        
        // Check language switcher state
        const switcher = document.getElementById('language-switcher');
        if (switcher) {
            const switchElement = switcher.querySelector('.lang-switch');
            const flag = switcher.querySelector('.lang-flag');
            const labels = switcher.querySelectorAll('.lang-label');
            
            console.log('Language switcher found:', {
                switchClasses: switchElement?.className,
                flagText: flag?.textContent,
                activeLabels: Array.from(labels).map(l => ({ text: l.textContent, classes: l.className }))
            });
        } else {
            console.log('Language switcher not found');
        }
        
        return {
            localStorage: localStorageLang,
            sessionStorage: sessionStorageLang,
            translationEngine: window.translationEngine?.currentLanguage,
            documentDir: document.documentElement.getAttribute('dir'),
            bodyRTL: document.body.classList.contains('rtl')
        };
    };
    
    // Test function to force language switch
    window.testLanguageSwitch = function(lang = 'ar') {
        console.log(`=== TESTING LANGUAGE SWITCH TO ${lang.toUpperCase()} ===`);
        
        if (window.translationEngine) {
            window.translationEngine.setLanguage(lang);
            console.log(`Language switched to: ${lang}`);
        } else {
            console.log('Translation engine not found, creating new instance');
            window.translationEngine = new TranslationEngine();
            setTimeout(() => {
                window.translationEngine.setLanguage(lang);
            }, 1000);
        }
        
        // Test state after switch
        setTimeout(() => {
            window.testLanguageState();
        }, 500);
    };
    
    // Test function to reset language to English
    window.testResetToEnglish = function() {
        console.log('=== RESETTING TO ENGLISH ===');
        
        // Clear storage
        localStorage.removeItem('emma-language');
        sessionStorage.removeItem('emma-language');
        
        // Set to English
        if (window.translationEngine) {
            window.translationEngine.setLanguage('en');
        }
        
        // Force English state
        document.documentElement.setAttribute('dir', 'ltr');
        document.body.classList.remove('rtl');
        
        console.log('Reset to English completed');
        
        // Test state after reset
        setTimeout(() => {
            window.testLanguageState();
        }, 500);
    };
    
    // Test function to check language persistence
    window.testLanguagePersistence = function() {
        console.log('=== TESTING LANGUAGE PERSISTENCE ===');
        
        // Save current state
        const currentState = window.testLanguageState();
        
        // Simulate page reload by clearing and reloading translation engine
        if (window.translationEngine) {
            const savedLang = localStorage.getItem('emma-language') || sessionStorage.getItem('emma-language');
            console.log('Saved language should persist:', savedLang);
            
            // Test if language would be restored
            if (savedLang) {
                console.log('✅ Language persistence working - saved language found:', savedLang);
            } else {
                console.log('❌ Language persistence issue - no saved language found');
            }
        }
        
        return currentState;
    };
    
    // Auto-run tests on page load
    setTimeout(() => {
        console.log('=== AUTO-RUNNING LANGUAGE TESTS ===');
        window.testLanguageState();
        window.testLanguagePersistence();
    }, 2000);
    
    // Add keyboard shortcuts for testing
    document.addEventListener('keydown', function(e) {
        // Ctrl+Shift+L = Test language state
        if (e.ctrlKey && e.shiftKey && e.key === 'L') {
            e.preventDefault();
            window.testLanguageState();
        }
        
        // Ctrl+Shift+A = Test Arabic switch
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            window.testLanguageSwitch('ar');
        }
        
        // Ctrl+Shift+E = Test English switch
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            window.testResetToEnglish();
        }
        
        // Ctrl+Shift+P = Test persistence
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            window.testLanguagePersistence();
        }
    });
    
    console.log('Language testing shortcuts enabled:');
    console.log('Ctrl+Shift+L = Test language state');
    console.log('Ctrl+Shift+A = Switch to Arabic');
    console.log('Ctrl+Shift+E = Switch to English');
    console.log('Ctrl+Shift+P = Test persistence');
    
})();
