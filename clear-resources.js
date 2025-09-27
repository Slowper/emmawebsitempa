const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'emma_cms',
    port: process.env.DB_PORT || 3306
};

async function clearResources() {
    let connection;
    
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Clear all resources
        console.log('🗑️ Clearing all resources...');
        await connection.execute('DELETE FROM resources');
        console.log('✅ All resources cleared');

        // Reset auto increment
        console.log('🔄 Resetting auto increment...');
        await connection.execute('ALTER TABLE resources AUTO_INCREMENT = 1');
        console.log('✅ Auto increment reset');

        console.log('🎉 Database cleared successfully!');
        console.log('📝 You can now test fresh resources from the CMS');

    } catch (error) {
        console.error('❌ Error clearing resources:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

clearResources();
