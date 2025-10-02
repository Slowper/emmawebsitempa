const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function checkDatabase() {
    let connection;
    try {
        console.log('🔄 Checking database connection...');
        
        // Simple connection config
        const config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'emma_cms',
            charset: 'utf8mb4',
            connectTimeout: 5000
        };
        
        connection = await mysql.createConnection(config);
        console.log('✅ Connected to MySQL database');
        
        // Check if essential tables exist
        const [tables] = await connection.execute("SHOW TABLES LIKE 'resources'");
        if (tables.length === 0) {
            console.log('⚠️ Resources table not found. Creating basic tables...');
            
            // Create only the essential resources table
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS resources (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    type ENUM('blog', 'case-study', 'use-case', 'resource') NOT NULL,
                    title VARCHAR(500) NOT NULL,
                    excerpt TEXT,
                    content LONGTEXT,
                    author VARCHAR(200),
                    author_image VARCHAR(500),
                    featured_image VARCHAR(500),
                    gallery TEXT,
                    tags TEXT,
                    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
                    meta_title VARCHAR(200),
                    meta_description TEXT,
                    meta_keywords TEXT,
                    read_time INT DEFAULT 5,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Resources table created');
        } else {
            console.log('✅ Resources table exists');
        }
        
        // Check if there are any blogs
        const [blogs] = await connection.execute("SELECT COUNT(*) as count FROM resources WHERE type = 'blog'");
        console.log(`📊 Found ${blogs[0].count} blogs in database`);
        
        console.log('🎉 Database is ready!');
        console.log('📝 You can now start the server with: npm start');
        
    } catch (error) {
        console.error('❌ Database check failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the check
if (require.main === module) {
    checkDatabase();
}

module.exports = { checkDatabase };
