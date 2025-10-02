const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function addViewCountColumn() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'emma_resources_cms'
    });

    try {
        console.log('🔧 Adding view_count column to resources table...');
        
        // Add view_count column
        await connection.execute(
            'ALTER TABLE resources ADD COLUMN view_count INT DEFAULT 0'
        );
        
        console.log('✅ view_count column added successfully');
        
        // Update existing records to set view_count to 0
        const [result] = await connection.execute(
            'UPDATE resources SET view_count = 0 WHERE view_count IS NULL'
        );
        
        console.log(`✅ Updated ${result.affectedRows} existing records`);
        
        // Verify the column was added
        const [columns] = await connection.execute(
            'DESCRIBE resources'
        );
        
        const viewCountColumn = columns.find(col => col.Field === 'view_count');
        if (viewCountColumn) {
            console.log('✅ view_count column verified:', viewCountColumn);
        } else {
            console.log('❌ view_count column not found');
        }
        
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('ℹ️ view_count column already exists');
        } else {
            console.error('❌ Error:', error);
        }
    } finally {
        await connection.end();
    }
}

addViewCountColumn();
