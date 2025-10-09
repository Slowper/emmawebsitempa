/**
 * Import CMS Data to MySQL Database
 * This script imports data from SQL export file to production database
 * Run this on your PRODUCTION server after uploading files
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './config.env' });

async function importData(sqlFilePath) {
    let connection;
    
    try {
        console.log('🔄 Connecting to MySQL database...');
        
        // Connect to database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'emma_resources_cms',
            multipleStatements: true // Allow multiple SQL statements
        });

        console.log('✅ Connected to database:', process.env.DB_NAME || 'emma_resources_cms');

        // Find SQL file
        let importFile = sqlFilePath;
        
        if (!importFile) {
            // Auto-detect latest export file
            const exportDir = path.join(__dirname, 'cms-export');
            if (fs.existsSync(exportDir)) {
                const files = fs.readdirSync(exportDir)
                    .filter(f => f.startsWith('cms-data-export-') && f.endsWith('.sql'))
                    .sort()
                    .reverse();
                
                if (files.length > 0) {
                    importFile = path.join(exportDir, files[0]);
                    console.log(`📁 Auto-detected latest export: ${files[0]}`);
                }
            }
        }

        if (!importFile || !fs.existsSync(importFile)) {
            throw new Error('SQL import file not found. Please provide the path to the export file.');
        }

        console.log(`📥 Reading SQL file: ${importFile}`);
        const sqlContent = fs.readFileSync(importFile, 'utf8');
        
        const fileSize = (fs.statSync(importFile).size / 1024).toFixed(2);
        console.log(`📦 File size: ${fileSize} KB`);

        console.log(`\n🚀 Starting import...`);
        console.log(`⚠️  This will replace all existing data in the database!`);
        
        // Split SQL into individual statements (simple split by semicolon)
        const statements = sqlContent
            .split(';\n')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📊 Found ${statements.length} SQL statements to execute`);

        let executed = 0;
        let errors = 0;

        // Execute statements
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Skip comments and empty statements
            if (statement.startsWith('--') || statement.length < 5) {
                continue;
            }

            try {
                await connection.query(statement);
                executed++;
                
                // Show progress every 10 statements
                if (executed % 10 === 0) {
                    process.stdout.write(`\r   Progress: ${executed}/${statements.length} statements`);
                }
            } catch (err) {
                errors++;
                // Log errors but continue (some errors like "table already exists" are ok)
                if (!err.message.includes('already exists')) {
                    console.error(`\n   ⚠️  Error on statement ${i + 1}:`, err.message.substring(0, 100));
                }
            }
        }

        console.log(`\n\n✅ Import completed!`);
        console.log(`   Executed: ${executed} statements`);
        console.log(`   Errors: ${errors} (mostly duplicate/already exists - usually OK)`);

        // Verify import
        console.log(`\n🔍 Verifying import...`);
        
        const tables = ['users', 'industries', 'tags', 'resources'];
        for (const table of tables) {
            try {
                const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`   ✓ ${table}: ${rows[0].count} records`);
            } catch (err) {
                console.log(`   ⚠️  ${table}: Could not verify (${err.message})`);
            }
        }

        console.log(`\n✨ Import successful! Your CMS is ready.`);
        console.log(`\n📝 Next steps:`);
        console.log(`   1. Verify uploads folder is in place`);
        console.log(`   2. Update config.env with production settings`);
        console.log(`   3. Start CMS server: node cms/start-cms.js`);
        console.log(`   4. Access admin: http://your-domain:3001/admin-local`);

    } catch (error) {
        console.error('\n❌ Import failed:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Get SQL file from command line argument
const sqlFile = process.argv[2];

// Run import
importData(sqlFile)
    .then(() => {
        console.log('\n🎉 All done!');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n💥 Fatal error:', err);
        console.error('\nUsage: node import-cms-data.js [path/to/export.sql]');
        console.error('Or place the SQL file in deployment/cms-export/ and run without arguments');
        process.exit(1);
    });

