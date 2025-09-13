const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config({ path: './config.env' });

// Migration script to move from SQLite to MySQL
async function migrateToMySQL() {
    console.log('Starting migration from SQLite to MySQL...');
    
    // Connect to SQLite database
    const sqliteDb = new sqlite3.Database(process.env.DB_PATH || './database/emma_cms.db');
    
    // Connect to MySQL database
    const mysqlConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'emma_cms',
        multipleStatements: true
    };
    
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
        // Create MySQL tables
        console.log('Creating MySQL tables...');
        await mysqlConnection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'editor') DEFAULT 'editor',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        await mysqlConnection.execute(`
            CREATE TABLE IF NOT EXISTS content_sections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                section_key VARCHAR(100) UNIQUE NOT NULL,
                section_name VARCHAR(200) NOT NULL,
                content_type ENUM('text', 'html', 'image', 'json') DEFAULT 'text',
                content LONGTEXT,
                image_url VARCHAR(500),
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        await mysqlConnection.execute(`
            CREATE TABLE IF NOT EXISTS website_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) UNIQUE NOT NULL,
                setting_value LONGTEXT,
                setting_type ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
                description TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        // Migrate users
        console.log('Migrating users...');
        const users = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM users', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        for (const user of users) {
            await mysqlConnection.execute(
                'INSERT IGNORE INTO users (id, username, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [user.id, user.username, user.email, user.password, user.role, user.created_at, user.updated_at]
            );
        }
        
        // Migrate content sections
        console.log('Migrating content sections...');
        const sections = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM content_sections', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        for (const section of sections) {
            await mysqlConnection.execute(
                'INSERT IGNORE INTO content_sections (id, section_key, section_name, content_type, content, image_url, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [section.id, section.section_key, section.section_name, section.content_type, section.content, section.image_url, section.is_active, section.created_at, section.updated_at]
            );
        }
        
        // Migrate website settings
        console.log('Migrating website settings...');
        const settings = await new Promise((resolve, reject) => {
            sqliteDb.all('SELECT * FROM website_settings', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        for (const setting of settings) {
            await mysqlConnection.execute(
                'INSERT IGNORE INTO website_settings (id, setting_key, setting_value, setting_type, description, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                [setting.id, setting.setting_key, setting.setting_value, setting.setting_type, setting.description, setting.updated_at]
            );
        }
        
        console.log('Migration completed successfully!');
        console.log(`Migrated ${users.length} users, ${sections.length} content sections, and ${settings.length} settings.`);
        
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        sqliteDb.close();
        await mysqlConnection.end();
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateToMySQL()
        .then(() => {
            console.log('Migration script completed.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration script failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateToMySQL };
