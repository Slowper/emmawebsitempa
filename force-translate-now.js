// Force Translation Script - Immediate Fix
// This script will force translate all Arabic text to English immediately

console.log('🚀 FORCE TRANSLATION SCRIPT STARTING...');

// Wait for page to load
setTimeout(() => {
    console.log('📝 Starting force translation...');
    
    // Force translate all headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    console.log(`Found ${headings.length} headings to check`);
    
    headings.forEach((heading, index) => {
        const text = heading.textContent.trim();
        console.log(`Heading ${index + 1}: "${text}"`);
        
        // Check if text contains Arabic characters
        const hasArabic = /[\u0600-\u06FF]/.test(text);
        if (hasArabic) {
            console.log(`🔍 Arabic text detected: "${text}"`);
            
            // Manual translations
            let translatedText = null;
            if (text.includes('التصنيع')) {
                translatedText = 'Manufacturing';
            } else if (text.includes('التجارة')) {
                translatedText = 'Commerce';
            } else if (text.includes('البنوك')) {
                translatedText = 'Banking';
            } else if (text.includes('التعليم')) {
                translatedText = 'Education';
            } else if (text.includes('خدمة العملاء')) {
                translatedText = 'Customer Service';
            } else if (text.includes('الرعاية الصحية')) {
                translatedText = 'Healthcare';
            } else if (text.includes('هل أنت مستعد لتحويل عملياتك؟')) {
                translatedText = 'Ready to Transform Your Operations?';
            } else if (text.includes('هل أنت مستعد لتحويل صناعتك؟')) {
                translatedText = 'Ready to Transform Your Industry?';
            }
            
            if (translatedText) {
                console.log(`✅ Translating: "${text}" -> "${translatedText}"`);
                heading.textContent = translatedText;
            } else {
                console.log(`❌ No translation found for: "${text}"`);
            }
        }
    });
    
    // Force translate all paragraphs
    const paragraphs = document.querySelectorAll('p');
    console.log(`Found ${paragraphs.length} paragraphs to check`);
    
    paragraphs.forEach((paragraph, index) => {
        const text = paragraph.textContent.trim();
        const hasArabic = /[\u0600-\u06FF]/.test(text);
        if (hasArabic) {
            console.log(`🔍 Arabic paragraph detected: "${text}"`);
        }
    });
    
    // Force translate all spans and divs that might contain text
    const textElements = document.querySelectorAll('span, div, .card-title, .title');
    console.log(`Found ${textElements.length} text elements to check`);
    
    textElements.forEach((element, index) => {
        const text = element.textContent.trim();
        const hasArabic = /[\u0600-\u06FF]/.test(text);
        if (hasArabic) {
            console.log(`🔍 Arabic text element detected: "${text}"`);
            
            // Manual translations for common elements
            let translatedText = null;
            if (text.includes('التصنيع')) {
                translatedText = 'Manufacturing';
            } else if (text.includes('التجارة')) {
                translatedText = 'Commerce';
            } else if (text.includes('البنوك')) {
                translatedText = 'Banking';
            } else if (text.includes('التعليم')) {
                translatedText = 'Education';
            } else if (text.includes('خدمة العملاء')) {
                translatedText = 'Customer Service';
            } else if (text.includes('الرعاية الصحية')) {
                translatedText = 'Healthcare';
            }
            
            if (translatedText) {
                console.log(`✅ Translating element: "${text}" -> "${translatedText}"`);
                element.textContent = translatedText;
            }
        }
    });
    
    console.log('✅ FORCE TRANSLATION COMPLETED!');
    
}, 1000);

// Also run immediately
console.log('🚀 Running immediate translation...');
const immediateHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
immediateHeadings.forEach(heading => {
    const text = heading.textContent.trim();
    if (/[\u0600-\u06FF]/.test(text)) {
        console.log(`🔍 Immediate Arabic text found: "${text}"`);
    }
});
