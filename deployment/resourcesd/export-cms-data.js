/**
 * Export CMS Data from MySQL Database
 * This script exports all resources, users, industries, and tags to SQL file
 * Run this on your LOCAL machine before deployment
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './config.env' });

async function exportData() {
    let connection;
    
    try {
        console.log('🔄 Connecting to MySQL database...');
        
        // Connect to database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'emma_resources_cms'
        });

        console.log('✅ Connected to database:', process.env.DB_NAME || 'emma_resources_cms');

        // Create export directory
        const exportDir = path.join(__dirname, 'cms-export');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const exportFile = path.join(exportDir, `cms-data-export-${timestamp}.sql`);
        
        let sqlContent = `-- Emma CMS Data Export
-- Generated: ${new Date().toISOString()}
-- Database: ${process.env.DB_NAME || 'emma_resources_cms'}
-- 
-- Instructions:
-- 1. Upload this file to your production server
-- 2. Run: mysql -u your_user -p your_database < cms-data-export-${timestamp}.sql
--
-- Or use the import-cms-data.js script

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;

`;

        // Export tables in order (respecting foreign keys)
        const tables = [
            { name: 'users', description: 'Users and authentication' },
            { name: 'industries', description: 'Industry categories' },
            { name: 'tags', description: 'Content tags' },
            { name: 'resources', description: 'Main content (blogs, case studies, use cases)' },
            { name: 'cms_settings', description: 'CMS configuration' },
            { name: 'file_uploads', description: 'File upload tracking' }
        ];

        for (const table of tables) {
            try {
                console.log(`\n📊 Exporting table: ${table.name} (${table.description})`);
                
                // Get table structure
                const [createTable] = await connection.query(`SHOW CREATE TABLE ${table.name}`);
                if (createTable.length > 0) {
                    sqlContent += `\n-- --------------------------------------------------------\n`;
                    sqlContent += `-- Table: ${table.name} - ${table.description}\n`;
                    sqlContent += `-- --------------------------------------------------------\n\n`;
                    sqlContent += `DROP TABLE IF EXISTS \`${table.name}\`;\n`;
                    sqlContent += createTable[0]['Create Table'] + ';\n\n';
                }

                // Get data
                const [rows] = await connection.query(`SELECT * FROM ${table.name}`);
                
                if (rows.length > 0) {
                    console.log(`   Found ${rows.length} records`);
                    
                    sqlContent += `-- Data for table: ${table.name}\n\n`;
                    
                    // Insert data in batches
                    for (const row of rows) {
                        const columns = Object.keys(row);
                        const values = columns.map(col => {
                            const val = row[col];
                            if (val === null) return 'NULL';
                            if (typeof val === 'number') return val;
                            if (typeof val === 'boolean') return val ? 1 : 0;
                            if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                            // Escape single quotes and wrap in quotes
                            return `'${String(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
                        });
                        
                        sqlContent += `INSERT INTO \`${table.name}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
                    }
                    
                    sqlContent += '\n';
                } else {
                    console.log(`   No records found`);
                }
            } catch (err) {
                if (err.code === 'ER_NO_SUCH_TABLE') {
                    console.log(`   ⚠️  Table does not exist, skipping...`);
                } else {
                    console.error(`   ❌ Error exporting ${table.name}:`, err.message);
                }
            }
        }

        sqlContent += `
SET FOREIGN_KEY_CHECKS=1;
COMMIT;

-- Export completed successfully!
`;

        // Write to file
        fs.writeFileSync(exportFile, sqlContent, 'utf8');
        
        console.log(`\n✅ Export completed successfully!`);
        console.log(`📁 Export file: ${exportFile}`);
        console.log(`📦 File size: ${(fs.statSync(exportFile).size / 1024).toFixed(2)} KB`);
        
        // Create summary
        const summaryFile = path.join(exportDir, `export-summary-${timestamp}.txt`);
        const summary = `
Emma CMS Data Export Summary
============================
Date: ${new Date().toISOString()}
Database: ${process.env.DB_NAME || 'emma_resources_cms'}
Export File: cms-data-export-${timestamp}.sql

Next Steps for Deployment:
==========================
1. Upload the SQL file to your production server
2. Upload the entire 'uploads' folder (${fs.readdirSync('uploads').length} subdirectories)
3. On production server, import the SQL file using import-cms-data.js
4. Update config.env with production database credentials
5. Start the CMS server

Files to Upload:
================
- deployment/cms-export/cms-data-export-${timestamp}.sql
- uploads/ (entire folder with all subdirectories)
- All server files (server.js, cms/, pages/, etc.)
`;
        
        fs.writeFileSync(summaryFile, summary, 'utf8');
        console.log(`\n📝 Summary saved to: ${summaryFile}`);
        
        console.log(`\n📤 Ready for deployment!`);
        console.log(`   1. SQL Export: ${exportFile}`);
        console.log(`   2. Uploads folder: ./uploads/ (44 files)`);
        console.log(`   3. Summary: ${summaryFile}`);

    } catch (error) {
        console.error('\n❌ Export failed:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run export
exportData()
    .then(() => {
        console.log('\n✨ All done! Check the deployment/cms-export/ folder');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n💥 Fatal error:', err);
        process.exit(1);
    });

