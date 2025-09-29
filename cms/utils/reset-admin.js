#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

console.log('🔄 Resetting admin user...');

async function resetAdmin() {
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'emma_resources_cms',
        charset: 'utf8mb4'
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Update or insert admin user
        await connection.execute(`
            INSERT INTO users (username, email, password, first_name, last_name, role, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            password = VALUES(password),
            is_active = VALUES(is_active),
            updated_at = CURRENT_TIMESTAMP
        `, ['admin', 'admin@emma.com', hashedPassword, 'Admin', 'User', 'admin', true]);
        
        console.log('✅ Admin user reset successfully');
        console.log('👤 Username: admin');
        console.log('🔑 Password: admin123');
        console.log('📧 Email: admin@emma.com');
        console.log('👑 Role: admin');
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error resetting admin user:', error.message);
        console.log('\n💡 Make sure:');
        console.log('1. Database is running');
        console.log('2. Database exists: emma_resources_cms');
        console.log('3. User has proper permissions');
        console.log('4. Config.env file is correct');
    }
}

resetAdmin();
