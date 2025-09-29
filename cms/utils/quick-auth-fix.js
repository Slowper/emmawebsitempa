#!/usr/bin/env node

const http = require('http');

console.log('🔧 Quick authentication fix for Emma CMS...');

async function quickAuthFix() {
    try {
        console.log('📡 1. Testing server connection...');
        
        // Test if server is running
        const healthResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        if (healthResponse.ok) {
            const data = await healthResponse.json();
            console.log('✅ Server is running and login successful!');
            console.log('🔑 Token received:', data.token ? 'Yes' : 'No');
            console.log('👤 User:', data.user ? data.user.username : 'Unknown');
            
            // Test the resources endpoint
            console.log('\n📡 2. Testing resources endpoint...');
            const resourcesResponse = await fetch('http://localhost:3001/api/resources', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`
                }
            });
            
            if (resourcesResponse.ok) {
                console.log('✅ Resources endpoint working!');
                console.log('🎉 Authentication is working correctly!');
            } else {
                console.log('❌ Resources endpoint failed:', resourcesResponse.status);
                const errorText = await resourcesResponse.text();
                console.log('Error details:', errorText);
            }
            
        } else {
            console.log('❌ Login failed:', healthResponse.status);
            const errorText = await healthResponse.text();
            console.log('Error details:', errorText);
            
            if (healthResponse.status === 401) {
                console.log('\n💡 The admin user might not exist. Try:');
                console.log('1. Run: node cms/utils/setup-cms.js');
                console.log('2. Or check if the database is properly initialized');
            }
        }
        
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        console.log('\n💡 Make sure:');
        console.log('1. The CMS server is running: node server.js');
        console.log('2. The server is accessible at http://localhost:3001');
        console.log('3. The database is properly set up');
    }
}

// Also provide a simple token refresh function
async function refreshToken() {
    try {
        console.log('\n🔄 Attempting to refresh token...');
        
        const response = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ New token generated!');
            console.log('🔑 Copy this token to your browser:');
            console.log(data.token);
            console.log('\n📋 To use this token:');
            console.log('1. Open browser developer tools (F12)');
            console.log('2. Go to Application/Storage tab');
            console.log('3. Find localStorage');
            console.log('4. Set cms_token to the token above');
            console.log('5. Refresh the page');
        }
    } catch (error) {
        console.log('❌ Token refresh failed:', error.message);
    }
}

quickAuthFix().then(() => {
    refreshToken();
});
