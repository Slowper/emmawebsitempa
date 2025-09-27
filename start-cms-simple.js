#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Starting Emma Resources CMS (Simple Version)...\n');

function startServer() {
    console.log('📊 Starting CMS server on port 3001...');
    console.log('🔗 Admin Panel: http://localhost:3001/admin');
    console.log('🔗 Local Admin: http://localhost:3001/admin-local');
    console.log('📡 API Base: http://localhost:3001/api');
    console.log('👤 Sample data included for testing');
    console.log('\nPress Ctrl+C to stop the server\n');
    
    const server = spawn('node', ['cms-simple-server.js'], { stdio: 'inherit' });
    
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
startServer();
