// Content Formatter for Emma CMS
// Automatically converts paragraph-style content to properly formatted bullet points

function formatContentForDisplay(content) {
    if (!content) return '';
    
    // Check if content is already formatted (contains HTML tags)
    if (content.includes('<ul>') || content.includes('<li>')) {
        return content;
    }
    
    // Split content into lines
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    // Check if this looks like bullet point content (contains dashes or numbers)
    const isBulletContent = lines.some(line => 
        line.includes('- ') || 
        line.match(/^\d+\./) || 
        line.includes('& ') ||
        line.includes('Call volumes') ||
        line.includes('Missed calls') ||
        line.includes('Human error')
    );
    
    if (!isBulletContent) {
        return content;
    }
    
    // Convert to proper HTML bullet points
    let formattedContent = '';
    let currentList = '';
    let inList = false;
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Check if this line should be a bullet point
        if (trimmedLine.includes('- ') || 
            trimmedLine.match(/^\d+\./) || 
            trimmedLine.includes('& ') ||
            trimmedLine.includes('Call volumes') ||
            trimmedLine.includes('Missed calls') ||
            trimmedLine.includes('Human error') ||
            trimmedLine.includes('Operational costs') ||
            trimmedLine.includes('Inconsistent service') ||
            trimmedLine.includes('Lack of data') ||
            trimmedLine.includes('Human capital')) {
            
            if (!inList) {
                if (currentList) {
                    formattedContent += currentList + '</ul>';
                }
                currentList = '<ul>';
                inList = true;
            }
            
            // Clean up the line and format it
            let cleanLine = trimmedLine
                .replace(/^\d+\.\s*/, '') // Remove number prefix
                .replace(/^-\s*/, '') // Remove dash prefix
                .trim();
            
            // Format bold text for key phrases
            cleanLine = cleanLine.replace(/^([^:]+):/, '<strong>$1:</strong>');
            cleanLine = cleanLine.replace(/^([^&]+)&([^:]+):/, '<strong>$1 & $2:</strong>');
            cleanLine = cleanLine.replace(/^([^:]+)-([^:]+):/, '<strong>$1 - $2:</strong>');
            
            currentList += `<li>${cleanLine}</li>`;
        } else {
            // This is a regular paragraph
            if (inList) {
                formattedContent += currentList + '</ul>';
                currentList = '';
                inList = false;
            }
            
            if (trimmedLine) {
                formattedContent += `<p>${trimmedLine}</p>`;
            }
        }
    });
    
    // Close any remaining list
    if (currentList) {
        formattedContent += currentList + '</ul>';
    }
    
    return formattedContent || content;
}

function formatContentForEditor(content) {
    if (!content) return '';
    
    // Always convert numbered lists to bullet points for better visual appeal
    content = content.replace(/<ol[^>]*>/g, '<ul>');
    content = content.replace(/<\/ol>/g, '</ul>');
    
    // If content is already HTML, return as is (after converting ol to ul)
    if (content.includes('<ul>') || content.includes('<li>')) {
        return content;
    }
    
    // Convert plain text to HTML for the editor
    const lines = content.split('\n').filter(line => line.trim() !== '');
    let formattedContent = '';
    let currentList = '';
    let inList = false;
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // Check if this line should be a bullet point
        if (trimmedLine.includes('- ') || 
            trimmedLine.match(/^\d+\./) || 
            trimmedLine.includes('& ') ||
            trimmedLine.includes('Call volumes') ||
            trimmedLine.includes('Missed calls') ||
            trimmedLine.includes('Human error') ||
            trimmedLine.includes('Operational costs') ||
            trimmedLine.includes('Inconsistent service') ||
            trimmedLine.includes('Lack of data') ||
            trimmedLine.includes('Human capital')) {
            
            if (!inList) {
                if (currentList) {
                    formattedContent += currentList + '</ul>';
                }
                currentList = '<ul>';
                inList = true;
            }
            
            // Clean up the line and format it
            let cleanLine = trimmedLine
                .replace(/^\d+\.\s*/, '') // Remove number prefix
                .replace(/^-\s*/, '') // Remove dash prefix
                .trim();
            
            // Format bold text for key phrases
            cleanLine = cleanLine.replace(/^([^:]+):/, '<strong>$1:</strong>');
            cleanLine = cleanLine.replace(/^([^&]+)&([^:]+):/, '<strong>$1 & $2:</strong>');
            cleanLine = cleanLine.replace(/^([^:]+)-([^:]+):/, '<strong>$1 - $2:</strong>');
            
            currentList += `<li>${cleanLine}</li>`;
        } else {
            // This is a regular paragraph
            if (inList) {
                formattedContent += currentList + '</ul>';
                currentList = '';
                inList = false;
            }
            
            if (trimmedLine) {
                formattedContent += `<p>${trimmedLine}</p>`;
            }
        }
    });
    
    // Close any remaining list
    if (currentList) {
        formattedContent += currentList + '</ul>';
    }
    
    return formattedContent || content;
}

// New function to force convert numbered lists to bullet points
function convertNumbersToBullets() {
    const editor = tinymce.get('resource-editor');
    if (editor) {
        let content = editor.getContent();
        
        // Convert numbered lists to bullet lists
        content = content.replace(/<ol[^>]*>/g, '<ul>');
        content = content.replace(/<\/ol>/g, '</ul>');
        
        // Update the editor content
        editor.setContent(content);
        console.log('✅ Converted numbered lists to bullet points');
    }
}

// New function to force convert numbered lists to bullet points in edit editor
function convertNumbersToBulletsEdit() {
    const editor = tinymce.get('edit-content');
    if (editor) {
        let content = editor.getContent();
        
        // Convert numbered lists to bullet lists
        content = content.replace(/<ol[^>]*>/g, '<ul>');
        content = content.replace(/<\/ol>/g, '</ul>');
        
        // Update the editor content
        editor.setContent(content);
        console.log('✅ Converted numbered lists to bullet points in edit editor');
    }
}

// Clean up extra spacing in content (professional approach)
function cleanupExtraSpacing(content) {
    if (!content) return '';
    
    // Remove excessive line breaks (3 or more consecutive)
    content = content.replace(/\n\s*\n\s*\n+/g, '\n\n');
    
    // Remove empty paragraphs
    content = content.replace(/(<p[^>]*>)\s*<\/p>/g, '');
    
    // Remove multiple consecutive br tags
    content = content.replace(/(<br[^>]*>\s*){3,}/g, '<br><br>');
    
    // Remove excessive whitespace within tags
    content = content.replace(/>\s+</g, '><');
    
    // Clean up spacing around list items
    content = content.replace(/(<li[^>]*>)\s+/g, '$1');
    content = content.replace(/\s+(<\/li>)/g, '$1');
    
    return content;
}

// Auto-format content when loading into editor
function autoFormatEditorContent() {
    const editor = tinymce.get('resource-editor');
    if (editor) {
        const content = editor.getContent();
        const cleaned = cleanupExtraSpacing(content);
        const formatted = formatContentForEditor(cleaned);
        if (formatted !== content) {
            editor.setContent(formatted);
        }
    }
}

// Auto-format content when loading into edit editor
function autoFormatEditEditorContent() {
    const editor = tinymce.get('edit-content');
    if (editor) {
        const content = editor.getContent();
        const formatted = formatContentForEditor(content);
        if (formatted !== content) {
            editor.setContent(formatted);
        }
    }
}

// Make functions globally available
window.formatContentForDisplay = formatContentForDisplay;
window.formatContentForEditor = formatContentForEditor;
window.autoFormatEditorContent = autoFormatEditorContent;
window.autoFormatEditEditorContent = autoFormatEditEditorContent;
window.convertNumbersToBullets = convertNumbersToBullets;
window.convertNumbersToBulletsEdit = convertNumbersToBulletsEdit;
window.cleanupExtraSpacing = cleanupExtraSpacing;
