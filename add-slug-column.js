const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'emma_cms',
    port: process.env.DB_PORT || 3306
};

async function addSlugColumn() {
    let connection;
    
    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');

        // Check if slug column exists
        console.log('🔍 Checking if slug column exists...');
        const [columns] = await connection.execute(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'resources' AND COLUMN_NAME = 'slug'"
        );
        
        if (columns.length === 0) {
            console.log('➕ Adding slug column to resources table...');
            await connection.execute('ALTER TABLE resources ADD COLUMN slug VARCHAR(255) UNIQUE AFTER title');
            console.log('✅ Slug column added successfully');
        } else {
            console.log('✅ Slug column already exists');
        }

        console.log('🎉 Database schema updated successfully!');

    } catch (error) {
        console.error('❌ Error updating schema:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

addSlugColumn();
