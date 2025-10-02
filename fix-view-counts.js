const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function fixViewCounts() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'emma_resources_cms'
    });

    try {
        console.log('🔧 Fixing view counts...');
        
        // Update all resources where view_count is NULL to 0
        const [result] = await connection.execute(
            'UPDATE resources SET view_count = 0 WHERE view_count IS NULL'
        );
        
        console.log(`✅ Updated ${result.affectedRows} records`);
        
        // Check the results
        const [resources] = await connection.execute(
            'SELECT id, title, view_count FROM resources LIMIT 5'
        );
        
        console.log('📊 Sample records after update:');
        resources.forEach(resource => {
            console.log(`ID: ${resource.id}, Title: ${resource.title}, Views: ${resource.view_count}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

fixViewCounts();
