#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Emma CMS Setup Script');
console.log('========================\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
    console.error('❌ Node.js version 16 or higher is required.');
    console.error(`   Current version: ${nodeVersion}`);
    process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if package.json exists
if (!fs.existsSync('package.json')) {
    console.error('❌ package.json not found. Please run this script from the project root directory.');
    process.exit(1);
}

console.log('✅ Project structure found');

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
} catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
}

// Create necessary directories
console.log('\n📁 Creating directories...');
const directories = ['database', 'uploads', 'admin'];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    } else {
        console.log(`✅ Directory exists: ${dir}`);
    }
});

// Check if config.env exists
if (!fs.existsSync('config.env')) {
    console.log('\n⚠️  config.env not found. Using default SQLite configuration.');
    console.log('   You can customize settings by editing config.env');
} else {
    console.log('✅ Configuration file found');
}

// Check if database already exists
const dbPath = './database/emma_cms.db';
if (fs.existsSync(dbPath)) {
    console.log('✅ Database already exists');
} else {
    console.log('📊 Database will be created automatically on first run');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\nNext steps:');
console.log('1. Start the server: npm start');
console.log('2. Open your browser: http://localhost:3000');
console.log('3. Access admin panel: http://localhost:3000/admin');
console.log('4. Login with: admin / admin123');
console.log('\nFor development with auto-reload: npm run dev');
console.log('\nHappy coding! 🚀');
