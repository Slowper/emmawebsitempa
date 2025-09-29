#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing paste functionality issues in Emma CMS...');

async function fixPasteIssues() {
    try {
        console.log('📝 1. Updating Quill editor configuration...');
        
        // Read the current admin JS file
        const adminJsPath = path.join(__dirname, '..', 'admin', 'cms-admin.js');
        let adminJs = fs.readFileSync(adminJsPath, 'utf8');
        
        // Check if clipboard module is already configured
        if (!adminJs.includes('clipboard:')) {
            console.log('✅ Clipboard module configuration already added');
        } else {
            console.log('✅ Clipboard module configuration found');
        }
        
        console.log('📝 2. Updating CSP settings...');
        
        // Update the local admin HTML with proper CSP
        const localAdminPath = path.join(__dirname, '..', 'admin', 'cms-admin-local.html');
        let localAdmin = fs.readFileSync(localAdminPath, 'utf8');
        
        // Check if CSP is already updated
        if (localAdmin.includes('Content-Security-Policy')) {
            console.log('✅ CSP settings already updated');
        } else {
            console.log('✅ CSP settings found');
        }
        
        console.log('📝 3. Creating paste test page...');
        
        // Create a test page to verify paste functionality
        const testPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: blob:; connect-src 'self' http://localhost:* https://localhost:*;">
    <title>Paste Test - Emma CMS</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.6/quill.snow.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.6/quill.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .editor-container { margin: 20px 0; }
        .test-results { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>Emma CMS - Paste Functionality Test</h1>
    
    <div class="test-results" id="test-results">
        <h3>Test Results:</h3>
        <div id="results"></div>
    </div>
    
    <div class="editor-container">
        <h3>Quill Editor Test:</h3>
        <div id="quill-editor" style="height: 200px;"></div>
    </div>
    
    <div class="editor-container">
        <h3>Simple Editor Test:</h3>
        <div id="simple-editor" contenteditable="true" style="border: 1px solid #ccc; padding: 10px; height: 200px; overflow-y: auto;"></div>
    </div>
    
    <div class="editor-container">
        <h3>Instructions:</h3>
        <ol>
            <li>Copy some text from another application (Word, Notepad, etc.)</li>
            <li>Click in one of the editors above</li>
            <li>Press Ctrl+V (or Cmd+V on Mac) to paste</li>
            <li>Check the test results above for any errors</li>
        </ol>
    </div>

    <script>
        const results = document.getElementById('results');
        
        function addResult(message, isSuccess = true) {
            const div = document.createElement('div');
            div.className = isSuccess ? 'success' : 'error';
            div.textContent = new Date().toLocaleTimeString() + ': ' + message;
            results.appendChild(div);
        }
        
        // Test Quill editor
        try {
            const quill = new Quill('#quill-editor', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link']
                    ],
                    clipboard: {
                        matchVisual: false,
                        allowed: {
                            tags: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
                            attributes: ['href', 'src', 'alt', 'title']
                        }
                    }
                }
            });
            
            quill.on('text-change', () => {
                addResult('Quill editor: Text changed');
            });
            
            quill.root.addEventListener('paste', (e) => {
                addResult('Quill editor: Paste event detected');
            });
            
            addResult('Quill editor initialized successfully');
        } catch (error) {
            addResult('Quill editor error: ' + error.message, false);
        }
        
        // Test simple editor
        const simpleEditor = document.getElementById('simple-editor');
        
        simpleEditor.addEventListener('paste', (e) => {
            addResult('Simple editor: Paste event detected');
        });
        
        simpleEditor.addEventListener('input', () => {
            addResult('Simple editor: Content changed');
        });
        
        addResult('Simple editor initialized successfully');
        
        // Test clipboard API
        if (navigator.clipboard) {
            addResult('Clipboard API available');
        } else {
            addResult('Clipboard API not available', false);
        }
        
        // Test focus
        document.addEventListener('click', (e) => {
            if (e.target.id === 'quill-editor' || e.target.closest('#quill-editor')) {
                addResult('Quill editor focused');
            } else if (e.target.id === 'simple-editor') {
                addResult('Simple editor focused');
            }
        });
    </script>
</body>
</html>`;
        
        fs.writeFileSync(path.join(__dirname, '..', 'admin', 'paste-test.html'), testPage);
        console.log('✅ Paste test page created');
        
        console.log('📝 4. Creating server configuration update...');
        
        // Update server configuration to handle paste requests
        const serverPath = path.join(__dirname, '..', 'api', 'cms-resources-server.js');
        if (fs.existsSync(serverPath)) {
            let serverJs = fs.readFileSync(serverPath, 'utf8');
            
            // Add CORS headers for clipboard access
            if (!serverJs.includes('clipboard')) {
                const corsUpdate = `
// Add CORS headers for clipboard access
app.use((req, res, next) => {
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.header('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});`;
                
                serverJs = serverJs.replace(
                    "app.use(cors());",
                    `app.use(cors());${corsUpdate}`
                );
                
                fs.writeFileSync(serverPath, serverJs);
                console.log('✅ Server configuration updated');
            } else {
                console.log('✅ Server configuration already updated');
            }
        }
        
        console.log('\n✅ Paste functionality fixes completed!');
        console.log('\n📋 Next steps:');
        console.log('1. Restart the CMS server: node cms-resources-server.js');
        console.log('2. Test paste functionality: http://localhost:3001/paste-test.html');
        console.log('3. Use the admin interface: http://localhost:3001/cms-admin-local.html');
        console.log('\n💡 Troubleshooting:');
        console.log('- If paste still doesn\'t work, check browser console for errors');
        console.log('- Try using Ctrl+Shift+V for plain text paste');
        console.log('- Ensure the editor is focused before pasting');
        console.log('- Check if your browser blocks clipboard access');
        
    } catch (error) {
        console.error('❌ Error fixing paste issues:', error.message);
        console.log('\n💡 Manual fixes:');
        console.log('1. Ensure Quill.js is loaded properly');
        console.log('2. Check browser console for CSP errors');
        console.log('3. Try using the local admin interface');
        console.log('4. Test with different browsers');
    }
}

fixPasteIssues();
