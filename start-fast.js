#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Emma CMS Server (Optimized)...');
console.log('⏱️  Timing startup performance...\n');

const startTime = Date.now();

const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

server.on('spawn', () => {
    console.log(`✅ Server process started in ${Date.now() - startTime}ms`);
});

server.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGTERM');
    process.exit(0);
});
