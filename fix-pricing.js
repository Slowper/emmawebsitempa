// Script to fix pricing issues
const http = require('http');

console.log('🔧 Fixing pricing issues...');

// Test if server is running
function testServer() {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/api/content/pricing',
            method: 'GET'
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const pricingData = JSON.parse(data);
                    console.log('✅ Pricing API is working');
                    console.log('📊 Current pricing plans:', pricingData.plans?.length || 0);
                    resolve(pricingData);
                } catch (e) {
                    console.log('❌ Error parsing pricing data:', e.message);
                    reject(e);
                }
            });
        });
        
        req.on('error', (e) => {
            console.log('❌ Server not responding:', e.message);
            reject(e);
        });
        
        req.setTimeout(5000, () => {
            console.log('⏰ Request timeout');
            reject(new Error('Timeout'));
        });
        
        req.end();
    });
}

// Test the server
testServer().catch(() => {
    console.log('🚀 Starting server...');
    // If server fails, provide instructions
    console.log(`
    To fix the pricing issues:
    
    1. Start the server: node working-hero-server.js
    2. Add this CSS to hide descriptions:
       .plan-description { display: none !important; }
    
    3. Check if pricing API works: curl http://localhost:3000/api/content/pricing
    
    4. If pricing plans don't show in CMS, check:
       - /api/content/pricing endpoint exists
       - pricingContent object is properly defined
       - Admin dashboard loads pricing section
    `);
});
