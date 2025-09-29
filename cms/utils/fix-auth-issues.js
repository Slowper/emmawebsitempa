#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './config.env' });

console.log('🔧 Fixing authentication issues in Emma CMS...');

class AuthFixer {
    constructor() {
        this.dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'emma_resources_cms',
            charset: 'utf8mb4'
        };
        this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    }

    async run() {
        try {
            console.log('📊 1. Checking database connection...');
            await this.checkDatabaseConnection();
            
            console.log('👤 2. Checking admin user...');
            await this.checkAdminUser();
            
            console.log('🔑 3. Testing authentication...');
            await this.testAuthentication();
            
            console.log('🌐 4. Testing API endpoints...');
            await this.testAPIEndpoints();
            
            console.log('\n✅ Authentication issues fixed successfully!');
            console.log('\n📋 Next steps:');
            console.log('1. Restart your CMS server: node api/cms-resources-server.js');
            console.log('2. Access the admin panel: http://localhost:3001/cms-admin-local.html');
            console.log('3. Login with: admin / admin123');
            console.log('4. If you still get token errors, clear your browser cache and try again');
            
        } catch (error) {
            console.error('\n❌ Error fixing authentication:', error.message);
            console.log('\n💡 Manual fixes:');
            console.log('1. Check your database connection settings in config.env');
            console.log('2. Run the setup script: node utils/setup-cms.js');
            console.log('3. Check if the database exists and has the correct schema');
            console.log('4. Verify the JWT_SECRET is set correctly');
        }
    }

    async checkDatabaseConnection() {
        try {
            const connection = await mysql.createConnection(this.dbConfig);
            await connection.ping();
            console.log('✅ Database connection successful');
            await connection.end();
        } catch (error) {
            console.log('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    async checkAdminUser() {
        const connection = await mysql.createConnection(this.dbConfig);
        
        try {
            // Check if admin user exists
            const [users] = await connection.execute(
                'SELECT id, username, email, role, is_active FROM users WHERE username = ?',
                ['admin']
            );
            
            if (users.length === 0) {
                console.log('⚠️ Admin user not found, creating...');
                await this.createAdminUser(connection);
            } else {
                const admin = users[0];
                console.log('✅ Admin user found:', {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role,
                    is_active: admin.is_active
                });
                
                if (!admin.is_active) {
                    console.log('⚠️ Admin user is inactive, activating...');
                    await connection.execute(
                        'UPDATE users SET is_active = true WHERE id = ?',
                        [admin.id]
                    );
                    console.log('✅ Admin user activated');
                }
            }
        } finally {
            await connection.end();
        }
    }

    async createAdminUser(connection) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await connection.execute(`
            INSERT INTO users (username, email, password, first_name, last_name, role, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, ['admin', 'admin@emma.com', hashedPassword, 'Admin', 'User', 'admin', true]);
        
        console.log('✅ Admin user created successfully');
    }

    async testAuthentication() {
        const connection = await mysql.createConnection(this.dbConfig);
        
        try {
            // Test login
            const [users] = await connection.execute(
                'SELECT id, username, email, password, role, is_active FROM users WHERE username = ? AND is_active = true',
                ['admin']
            );
            
            if (users.length === 0) {
                throw new Error('Admin user not found or inactive');
            }
            
            const user = users[0];
            const isValidPassword = await bcrypt.compare('admin123', user.password);
            
            if (!isValidPassword) {
                throw new Error('Invalid password for admin user');
            }
            
            // Generate test token
            const token = jwt.sign(
                { userId: user.id, username: user.username, role: user.role },
                this.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            console.log('✅ Authentication test successful');
            console.log('🔑 Test token generated (expires in 24h)');
            
            // Verify token
            const decoded = jwt.verify(token, this.JWT_SECRET);
            console.log('✅ Token verification successful:', {
                userId: decoded.userId,
                username: decoded.username,
                role: decoded.role
            });
            
        } finally {
            await connection.end();
        }
    }

    async testAPIEndpoints() {
        console.log('🌐 Testing API endpoints...');
        
        // Test login endpoint
        try {
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
                console.log('✅ Login endpoint working');
                console.log('🔑 Token received:', data.token ? 'Yes' : 'No');
                
                // Test resources endpoint with token
                const resourcesResponse = await fetch('http://localhost:3001/api/resources', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${data.token}`
                    }
                });
                
                if (resourcesResponse.ok) {
                    console.log('✅ Resources endpoint working with token');
                } else {
                    console.log('⚠️ Resources endpoint failed:', resourcesResponse.status);
                }
                
            } else {
                console.log('❌ Login endpoint failed:', response.status);
            }
        } catch (error) {
            console.log('⚠️ API test failed (server might not be running):', error.message);
        }
    }
}

// Run the fixer
const fixer = new AuthFixer();
fixer.run();
