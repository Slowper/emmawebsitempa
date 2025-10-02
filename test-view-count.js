const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function testViewCount() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'emma_resources_cms'
    });

    try {
        console.log('🔍 Testing view count functionality...');
        
        // Check current view count
        const [before] = await connection.execute(
            'SELECT id, title, view_count FROM resources WHERE id = 22'
        );
        console.log('📊 Before update:', before[0]);
        
        // Update view count
        const [result] = await connection.execute(
            'UPDATE resources SET view_count = COALESCE(view_count, 0) + 1 WHERE id = ?',
            [22]
        );
        console.log('✅ Update result:', result);
        
        // Check view count after update
        const [after] = await connection.execute(
            'SELECT id, title, view_count FROM resources WHERE id = 22'
        );
        console.log('📊 After update:', after[0]);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

testViewCount();
