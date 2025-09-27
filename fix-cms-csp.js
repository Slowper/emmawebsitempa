#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing CMS CSP issues...');

// 1. Download Quill.js files locally
console.log('📦 Downloading Quill.js files...');

const https = require('https');

function downloadFile(url, filename) {
    return new Promise((resolve, reject) => {
        const quillDir = 'quill';
        if (!fs.existsSync(quillDir)) {
            fs.mkdirSync(quillDir, { recursive: true });
        }
        
        const file = fs.createWriteStream(path.join(quillDir, filename));
        
        https.get(url, (response) => {
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`✅ Downloaded ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            console.error(`❌ Error downloading ${filename}:`, err.message);
            reject(err);
        });
    });
}

async function fixCSPIssues() {
    try {
        // Download Quill files
        await downloadFile('https://cdn.quilljs.com/1.3.6/quill.min.js', 'quill.min.js');
        await downloadFile('https://cdn.quilljs.com/1.3.6/quill.snow.css', 'quill.snow.css');
        
        // 2. Create a fixed version of cms-admin.html with local Quill files
        console.log('📝 Creating fixed admin interface...');
        
        const adminHtml = fs.readFileSync('cms-admin.html', 'utf8');
        const fixedAdminHtml = adminHtml
            .replace('https://cdn.quilljs.com/1.3.6/quill.snow.css', './quill/quill.snow.css')
            .replace('https://cdn.quilljs.com/1.3.6/quill.min.js', './quill/quill.min.js');
        
        fs.writeFileSync('cms-admin-fixed.html', fixedAdminHtml);
        
        // 3. Update the server to serve static files from quill directory
        console.log('🔧 Updating server configuration...');
        
        const serverJs = fs.readFileSync('cms-resources-server.js', 'utf8');
        const updatedServerJs = serverJs.replace(
            "app.use('/cms-uploads', express.static('cms-uploads'));",
            "app.use('/cms-uploads', express.static('cms-uploads'));\napp.use('/quill', express.static('quill'));"
        );
        
        fs.writeFileSync('cms-resources-server.js', updatedServerJs);
        
        console.log('\n✅ CSP issues fixed!');
        console.log('\n📋 Next steps:');
        console.log('1. Restart the CMS server: node cms-resources-server.js');
        console.log('2. Use the fixed admin interface: http://localhost:3001/cms-admin-fixed.html');
        console.log('3. Or use the local version: http://localhost:3001/cms-admin-local.html');
        
    } catch (error) {
        console.error('❌ Error fixing CSP issues:', error.message);
        console.log('\n💡 Alternative solutions:');
        console.log('1. Use cms-admin-local.html (no external dependencies)');
        console.log('2. Disable CSP temporarily for development');
        console.log('3. Add quilljs.com to your CSP whitelist');
    }
}

fixCSPIssues();
