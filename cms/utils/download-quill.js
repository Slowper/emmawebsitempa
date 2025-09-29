#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create quill directory
const quillDir = 'quill';
if (!fs.existsSync(quillDir)) {
    fs.mkdirSync(quillDir, { recursive: true });
}

// Files to download
const files = [
    {
        url: 'https://cdn.quilljs.com/1.3.6/quill.min.js',
        filename: 'quill.min.js'
    },
    {
        url: 'https://cdn.quilljs.com/1.3.6/quill.snow.css',
        filename: 'quill.snow.css'
    }
];

function downloadFile(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(quillDir, filename));
        
        https.get(url, (response) => {
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                console.log(`✅ Downloaded ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filename, () => {}); // Delete the file on error
            console.error(`❌ Error downloading ${filename}:`, err.message);
            reject(err);
        });
    });
}

async function downloadQuill() {
    console.log('📦 Downloading Quill.js files...');
    
    try {
        for (const file of files) {
            await downloadFile(file.url, file.filename);
        }
        
        console.log('\n✅ Quill.js files downloaded successfully!');
        console.log('📁 Files saved to:', path.resolve(quillDir));
        console.log('\n📋 To use local Quill files, update your HTML:');
        console.log('<link href="./quill/quill.snow.css" rel="stylesheet">');
        console.log('<script src="./quill/quill.min.js"></script>');
        
    } catch (error) {
        console.error('\n❌ Download failed:', error.message);
        console.log('\n💡 Alternative: Use the local admin interface at cms-admin-local.html');
    }
}

downloadQuill();
