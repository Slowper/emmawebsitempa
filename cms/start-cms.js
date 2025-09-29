#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Emma Resources CMS...\n');

// Check if database is set up
async function checkDatabase() {
    const mysql = require('mysql2/promise');
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'emma_resources_cms'
        });
        
        await connection.execute('SELECT 1');
        await connection.end();
        return true;
    } catch (error) {
        return false;
    }
}

// Check if Quill files exist
function checkQuillFiles() {
    return fs.existsSync('quill/quill.min.js') && fs.existsSync('quill/quill.snow.css');
}

// Main startup function
async function startCMS() {
    try {
        // Check database
        console.log('🔍 Checking database connection...');
        const dbConnected = await checkDatabase();
        
        if (!dbConnected) {
            console.log('❌ Database not found. Running setup...');
            const setup = spawn('node', ['setup-cms.js'], { stdio: 'inherit' });
            
            setup.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Database setup completed');
                    startServer();
                } else {
                    console.error('❌ Database setup failed');
                    process.exit(1);
                }
            });
            return;
        }
        
        console.log('✅ Database connected');
        
        // Check Quill files
        if (!checkQuillFiles()) {
            console.log('📦 Downloading Quill.js files...');
            const fix = spawn('node', ['fix-cms-csp.js'], { stdio: 'inherit' });
            
            fix.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Quill files downloaded');
                    startServer();
                } else {
                    console.log('⚠️  Quill download failed, using local editor');
                    startServer();
                }
            });
            return;
        }
        
        console.log('✅ Quill files found');
        startServer();
        
    } catch (error) {
        console.error('❌ Error starting CMS:', error.message);
        process.exit(1);
    }
}

function startServer() {
    console.log('\n🚀 Starting CMS server...');
    console.log('📊 Database: emma_resources_cms');
    console.log('🔗 Admin Panel: http://localhost:3001/cms-admin-fixed.html');
    console.log('🔗 Local Admin: http://localhost:3001/cms-admin-local.html');
    console.log('👤 Default Login: admin / admin123');
    console.log('\nPress Ctrl+C to stop the server\n');
    
    const server = spawn('node', ['cms-resources-server.js'], { stdio: 'inherit' });
    
    server.on('close', (code) => {
        console.log(`\n🛑 CMS server stopped with code ${code}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down CMS server...');
        server.kill('SIGINT');
        process.exit(0);
    });
}

// Start the CMS
startCMS();
