# Emma CMS - Complete Deployment Instructions

## 📋 Overview

This guide will help you deploy Emma CMS from your local development environment to a production server, including all database content and uploaded media files.

## 🎯 Prerequisites

### Local Machine (Development)
- MySQL database with existing CMS data
- Node.js installed
- Access to terminal/command line

### Production Server
- MySQL 5.7+ or 8.0+
- Node.js 14+ installed
- SSH/FTP access
- Web server (Nginx/Apache) - optional
- Domain/subdomain configured

## 🚀 Deployment Process

### Phase 1: Export from Local (Development)

#### Step 1: Export Database

```bash
# Navigate to your project
cd /path/to/emmabykodefast

# Run export script
node deployment/export-cms-data.js
```

**What this does:**
- Exports all resources (blogs, case studies, use cases)
- Exports users, industries, tags
- Exports CMS settings
- Creates SQL file in `deployment/cms-export/`

**Expected Output:**
```
✅ Export completed successfully!
📁 Export file: deployment/cms-export/cms-data-export-2024-10-09.sql
📦 File size: 125.45 KB
```

#### Step 2: Prepare Complete Package (Automated)

```bash
# Run the preparation script
bash deployment/prepare-deployment.sh

# Or on Windows:
sh deployment/prepare-deployment.sh
```

**What this does:**
- Exports database automatically
- Copies uploads folder
- Creates deployment package
- Generates deployment archive (.tar.gz)
- Creates configuration templates

**Expected Output:**
```
✨ Deployment Package Ready!
📦 Package Location: deployment/emma-cms-deployment-20241009-143022.tar.gz
📏 Package Size: 15.2M
```

#### Step 3: Manual Preparation (Alternative)

If automated script doesn't work, prepare manually:

```bash
# 1. Create package directory
mkdir -p deployment/production-package

# 2. Copy uploads folder
cp -r uploads deployment/production-package/

# 3. Copy SQL export
cp deployment/cms-export/cms-data-export-*.sql deployment/production-package/

# 4. Copy import script
cp deployment/import-cms-data.js deployment/production-package/

# 5. Copy config template
cp config.env deployment/production-package/config.env.template
```

---

### Phase 2: Upload to Production Server

#### Option A: Using SCP (Recommended for Linux/Mac)

```bash
# Upload the archive
scp deployment/emma-cms-deployment-*.tar.gz user@your-server.com:/var/www/emma/

# Or upload individual folders
scp -r uploads user@your-server.com:/var/www/emma/
scp deployment/cms-export/cms-data-export-*.sql user@your-server.com:/var/www/emma/
```

#### Option B: Using FTP/FileZilla

1. Connect to your server via FTP
2. Navigate to your web directory (e.g., `/var/www/emma/`)
3. Upload:
   - `uploads/` folder (entire directory)
   - `cms-data-export-*.sql` file
   - `import-cms-data.js` script
   - `config.env.template`

#### Option C: Using cPanel File Manager

1. Login to cPanel
2. Go to File Manager
3. Navigate to `public_html` or your web root
4. Upload the deployment archive
5. Extract using cPanel's extraction tool

---

### Phase 3: Setup on Production Server

#### Step 1: Connect to Server

```bash
# SSH into your server
ssh user@your-server.com

# Navigate to project directory
cd /var/www/emma
```

#### Step 2: Extract Files (if using archive)

```bash
# Extract deployment package
tar -xzf emma-cms-deployment-*.tar.gz

# Verify files
ls -la
# Should see: uploads/, cms-data-export-*.sql, import-cms-data.js, config.env.template
```

#### Step 3: Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE emma_resources_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user and grant permissions (optional, for security)
CREATE USER 'emma_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON emma_resources_cms.* TO 'emma_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 4: Initialize Database Schema

```bash
# Import schema (structure only - first time)
mysql -u root -p emma_resources_cms < cms/database/cms-resources-schema.sql
```

#### Step 5: Import Your Data

```bash
# Install dependencies first (if not done)
npm install

# Import your data using the script
node import-cms-data.js cms-data-export-*.sql

# Or manually via MySQL
mysql -u root -p emma_resources_cms < cms-data-export-*.sql
```

**Expected Output:**
```
✅ Import completed!
   Executed: 247 statements
   Errors: 0

🔍 Verifying import...
   ✓ users: 1 records
   ✓ industries: 8 records
   ✓ tags: 8 records
   ✓ resources: 25 records
```

#### Step 6: Configure Environment

```bash
# Copy template to actual config
cp config.env.template config.env

# Edit configuration
nano config.env  # or vim, vi, etc.
```

**Update these values in `config.env`:**

```bash
# Database Configuration (REQUIRED)
DB_HOST=localhost
DB_USER=emma_user              # Your MySQL user
DB_PASSWORD=strong_password_here  # Your MySQL password
DB_NAME=emma_resources_cms

# Server Configuration
PORT=3000                      # Main website port
CMS_PORT=3001                 # CMS admin port

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-random-secure-secret-key-min-32-chars

# Environment
NODE_ENV=production
```

**Generate a secure JWT secret:**
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Step 7: Set Folder Permissions

```bash
# Make uploads folder writable
chmod -R 755 uploads/

# Set ownership (adjust user as needed)
# For Apache:
chown -R www-data:www-data uploads/
# For Nginx:
chown -R nginx:nginx uploads/
# For your user:
chown -R $USER:$USER uploads/
```

#### Step 8: Install Dependencies

```bash
# Install Node.js packages
npm install --production

# Or if package-lock.json exists
npm ci --production
```

#### Step 9: Start the CMS Server

**For Testing:**
```bash
# Start directly
node cms/start-cms.js

# Or start main server
node server.js
```

**For Production (with PM2):**
```bash
# Install PM2 globally
npm install -g pm2

# Start CMS server
pm2 start cms/start-cms.js --name emma-cms

# Start main server
pm2 start server.js --name emma-main

# Save PM2 configuration
pm2 save

# Setup auto-restart on reboot
pm2 startup
# Follow the instructions shown
```

---

### Phase 4: Verification & Testing

#### Step 1: Test CMS Access

```bash
# Check if server is running
curl http://localhost:3001/api/health

# Or
netstat -tulpn | grep 3001
```

#### Step 2: Access Admin Panel

1. Open browser
2. Go to: `http://your-server-ip:3001/admin-local`
3. Login with:
   - Username: `admin`
   - Password: `admin123`

#### Step 3: Verify Content

- [ ] Check if blogs are visible
- [ ] Check if case studies are visible
- [ ] Check if use cases are visible
- [ ] Verify images load correctly
- [ ] Test creating new content
- [ ] Test image upload

#### Step 4: Verify Main Website

1. Go to: `http://your-server-ip:3000`
2. Navigate to Resources page
3. Check if content displays correctly
4. Verify all links work

---

### Phase 5: Production Configuration

#### Setup Nginx Reverse Proxy (Recommended)

```nginx
# /etc/nginx/sites-available/emma

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Main website
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # CMS Admin (restrict access)
    location /cms/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Optional: Restrict to certain IPs
        # allow 203.0.113.0/24;
        # deny all;
    }

    # Serve uploads directly
    location /uploads/ {
        alias /var/www/emma/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/emma /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (cron)
sudo certbot renew --dry-run
```

#### Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to Node.js ports (optional)
# This forces traffic through Nginx
sudo ufw deny 3000/tcp
sudo ufw deny 3001/tcp

# Enable firewall
sudo ufw enable
```

---

## 🔒 Post-Deployment Security

### 1. Change Default Password

```bash
# Use reset-admin script
node cms/utils/reset-admin.js
```

Or login and change in admin panel

### 2. Create New Admin User

1. Login to CMS admin
2. Go to Users section
3. Create new admin user
4. Logout and login with new user
5. Delete or deactivate default admin

### 3. Update JWT Secret

```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update in config.env
nano config.env
# Paste the new JWT_SECRET value

# Restart server
pm2 restart all
```

### 4. Database Security

```sql
-- Login to MySQL
mysql -u root -p

-- Change root password
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_strong_password';

-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Disable remote root login
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Flush privileges
FLUSH PRIVILEGES;
```

---

## 🔄 Backup Strategy

### Automated Daily Backups

Create backup script:
```bash
# /var/www/emma/backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/emma"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u emma_user -p'password' emma_resources_cms > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz uploads/

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -mtime +7 -delete
```

Setup cron job:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/emma/backup.sh
```

---

## 📊 Monitoring & Logs

### Check Server Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs emma-cms
pm2 logs emma-main

# System resources
pm2 monit
```

### Application Logs

```bash
# CMS logs
tail -f cms/cms-sync-server.log

# Server logs
tail -f server.log

# Node.js errors
tail -f ~/.pm2/logs/emma-cms-error.log
```

---

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u emma_user -p emma_resources_cms -e "SELECT 1"

# Check MySQL status
sudo systemctl status mysql

# View MySQL errors
sudo tail -f /var/log/mysql/error.log
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3001

# Kill process
sudo kill -9 PID

# Or change port in config.env
```

### Images Not Loading

```bash
# Check permissions
ls -la uploads/

# Fix permissions
chmod -R 755 uploads/
chown -R www-data:www-data uploads/

# Check if server serves static files
curl http://localhost:3001/uploads/blogs/image.jpg
```

### Cannot Login

```bash
# Reset admin password
node cms/utils/reset-admin.js

# Check JWT secret
cat config.env | grep JWT_SECRET

# Check database users
mysql -u root -p emma_resources_cms -e "SELECT * FROM users"
```

---

## 📞 Support & Resources

- **Documentation**: `/cms/docs/`
- **Troubleshooting**: `/cms/docs/CMS-TROUBLESHOOTING.md`
- **API Guide**: `/cms/docs/INTEGRATION-GUIDE.md`

## ✅ Deployment Checklist

- [ ] Database exported from local
- [ ] Uploads folder copied
- [ ] Files uploaded to production server
- [ ] MySQL database created
- [ ] Schema imported
- [ ] Data imported
- [ ] config.env configured
- [ ] Dependencies installed
- [ ] Permissions set correctly
- [ ] Server started (PM2)
- [ ] Admin panel accessible
- [ ] Content visible
- [ ] Images loading
- [ ] Default password changed
- [ ] JWT secret updated
- [ ] SSL configured (if applicable)
- [ ] Backups configured
- [ ] Firewall configured

---

**🎉 Congratulations! Your Emma CMS is now deployed!**

