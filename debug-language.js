// Language System Debug Script
// This script helps debug language switching issues

console.log('🔧 Language Debug Script Loaded');

function debugLanguageSystem() {
    console.log('🔍 Debugging Language System...');
    
    // Check if language manager exists
    if (window.languageManager) {
        console.log('✅ Language Manager: Found');
        console.log('📱 Current Language:', window.languageManager.getCurrentLanguage());
        console.log('🔄 Is RTL:', window.languageManager.isRTL());
    } else {
        console.log('❌ Language Manager: Not Found');
    }
    
    // Check if translations exist
    if (typeof translations !== 'undefined') {
        console.log('✅ Translations: Loaded');
        console.log('📚 Available languages:', Object.keys(translations));
    } else {
        console.log('❌ Translations: Not Loaded');
    }
    
    // Check language switcher
    const switcher = document.getElementById('language-switcher');
    if (switcher) {
        console.log('✅ Language Switcher: Found');
        
        const switchElement = switcher.querySelector('.lang-switch');
        const flag = switcher.querySelector('.lang-flag');
        const labels = switcher.querySelectorAll('.lang-label');
        
        console.log('🔘 Switch Element:', switchElement ? 'Found' : 'Not Found');
        console.log('🏳️ Flag Element:', flag ? 'Found' : 'Not Found');
        console.log('🏷️ Labels:', labels.length);
        
        if (switchElement) {
            console.log('🎨 Switch Classes:', switchElement.className);
        }
        if (flag) {
            console.log('🏳️ Flag Text:', flag.textContent);
        }
        
        labels.forEach((label, index) => {
            console.log(`🏷️ Label ${index + 1}:`, {
                text: label.textContent,
                lang: label.dataset.lang,
                active: label.classList.contains('active')
            });
        });
    } else {
        console.log('❌ Language Switcher: Not Found');
    }
    
    // Check HTML attributes
    console.log('🌐 HTML Lang:', document.documentElement.lang);
    console.log('📐 HTML Dir:', document.documentElement.getAttribute('dir'));
    console.log('📄 Page Title:', document.title);
    
    // Check for RTL class
    console.log('🔄 Body RTL Class:', document.body.classList.contains('rtl'));
    
    // Check localStorage
    try {
        const savedLang = localStorage.getItem('emma-language');
        console.log('💾 Saved Language:', savedLang);
    } catch (error) {
        console.log('❌ localStorage Error:', error.message);
    }
    
    // Check for data-translate elements
    const translateElements = document.querySelectorAll('[data-translate]');
    console.log('🔄 Data-translate Elements:', translateElements.length);
    
    // Sample some translate elements
    const sampleElements = Array.from(translateElements).slice(0, 5);
    sampleElements.forEach((element, index) => {
        console.log(`🔄 Element ${index + 1}:`, {
            tag: element.tagName,
            key: element.getAttribute('data-translate'),
            text: element.textContent.substring(0, 50) + '...'
        });
    });
    
    console.log('🔍 Language System Debug Complete');
}

function forceLanguageSwitch(lang) {
    console.log(`🔧 Force switching to language: ${lang}`);
    
    if (window.languageManager) {
        window.languageManager.setLanguage(lang);
    } else {
        console.log('❌ Language Manager not available');
    }
}

function testLanguageSwitcher() {
    console.log('🧪 Testing Language Switcher...');
    
    const switcher = document.getElementById('language-switcher');
    if (!switcher) {
        console.log('❌ Language switcher not found');
        return;
    }
    
    const switchElement = switcher.querySelector('.lang-switch');
    if (!switchElement) {
        console.log('❌ Switch element not found');
        return;
    }
    
    // Simulate click
    console.log('🖱️ Simulating click on language switcher...');
    switchElement.click();
    
    setTimeout(() => {
        console.log('✅ Language switcher test complete');
        debugLanguageSystem();
    }, 1000);
}

function resetLanguageSystem() {
    console.log('🔄 Resetting Language System...');
    
    // Clear saved language
    try {
        localStorage.removeItem('emma-language');
        sessionStorage.removeItem('emma-language');
        console.log('✅ Cleared saved language preferences');
    } catch (error) {
        console.log('❌ Error clearing language preferences:', error);
    }
    
    // Reset to English
    if (window.languageManager) {
        window.languageManager.setLanguage('en');
        console.log('✅ Reset to English');
    }
    
    // Reload page after a short delay
    setTimeout(() => {
        console.log('🔄 Reloading page...');
        window.location.reload();
    }, 1000);
}

// Make functions globally available
window.debugLanguageSystem = debugLanguageSystem;
window.forceLanguageSwitch = forceLanguageSwitch;
window.testLanguageSwitcher = testLanguageSwitcher;
window.resetLanguageSystem = resetLanguageSystem;

// Auto-run debug when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(debugLanguageSystem, 2000);
});

console.log('🔧 Language Debug Script Ready');
console.log('📝 Available commands:');
console.log('  - debugLanguageSystem()');
console.log('  - forceLanguageSwitch("en" or "ar")');
console.log('  - testLanguageSwitcher()');
console.log('  - resetLanguageSystem()');
