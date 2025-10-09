# GoDaddy Deployment Guide for Emma CMS Platform

This guide covers deploying your Emma CMS Platform (website + CMS) on GoDaddy hosting.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [GoDaddy Hosting Requirements](#godaddy-hosting-requirements)
3. [Deployment Options](#deployment-options)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Post-Deployment Steps](#post-deployment-steps)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying to GoDaddy, ensure you have:

- ✅ GoDaddy hosting account (VPS, Dedicated, or cPanel with Node.js support)
- ✅ Domain name configured
- ✅ SSH access to your server (for VPS/Dedicated)
- ✅ MySQL database access
- ✅ Node.js 16+ support on the server
- ✅ SSL certificate (recommended for production)

---

## GoDaddy Hosting Requirements

### Recommended Hosting Plans

Your Emma CMS Platform requires:
- **Node.js 16.0.0 or higher**
- **MySQL 5.7+ or 8.0+**
- **Minimum 1GB RAM**
- **SSH access** (for deployment)
- **PM2 or similar process manager**

### Compatible GoDaddy Hosting Types:

1. **VPS Hosting** ⭐ (Recommended)
   - Full server control
   - Node.js support
   - SSH access
   - Custom configurations

2. **Dedicated Server**
   - Best performance
   - Full control
   - Higher cost

3. **cPanel Hosting with Node.js**
   - Limited but possible
   - Requires cPanel Node.js setup
   - Some restrictions apply

---

## Deployment Options

### Option 1: VPS/Dedicated Server Deployment (Recommended)

This is the recommended approach for full control and better performance.

### Option 2: cPanel Deployment

If you have cPanel with Node.js support, you can use the cPanel Node.js interface.

---

## Step-by-Step Deployment

### Option 1: VPS/Dedicated Server Deployment

#### Step 1: Connect to Your GoDaddy Server

```bash
# SSH into your GoDaddy server
ssh username@your-godaddy-server-ip

# Or if you have a domain configured
ssh username@yourdomain.com
```

#### Step 2: Install Node.js (if not installed)

```bash
# Check if Node.js is installed
node --version

# If not installed, install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Step 3: Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

#### Step 4: Create Application Directory

```bash
# Navigate to web directory (adjust path as needed)
cd /var/www  # or /home/username/public_html

# Create directory for your application
sudo mkdir -p emmabykodefast
cd emmabykodefast
```

#### Step 5: Upload Your Project Files

**Option A: Using Git (Recommended)**

```bash
# Clone your repository
git clone https://github.com/yourusername/emmabykodefast.git .

# Or if using private repo
git clone https://<personal-access-token>@github.com/yourusername/emmabykodefast.git .
```

**Option B: Using SCP/SFTP**

From your local machine:

```bash
# Compress your project (exclude node_modules)
tar -czf emma-cms.tar.gz --exclude='node_modules' --exclude='.git' .

# Upload to server
scp emma-cms.tar.gz username@your-server-ip:/var/www/emmabykodefast/

# On server, extract files
ssh username@your-server-ip
cd /var/www/emmabykodefast
tar -xzf emma-cms.tar.gz
rm emma-cms.tar.gz
```

**Option C: Using cPanel File Manager**

1. Zip your project locally (exclude node_modules)
2. Upload via cPanel File Manager
3. Extract the zip file

#### Step 6: Install Dependencies

```bash
# Navigate to project directory
cd /var/www/emmabykodefast

# Install dependencies
npm install --production

# If you encounter permission issues
sudo npm install --production --unsafe-perm
```

#### Step 7: Configure Environment Variables

```bash
# Create production config file
nano config.env
```

Add the following (adjust values for your server):

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=emma_resources_cms
DB_CONNECTION_LIMIT=10
DB_ACQUIRE_TIMEOUT=10000
DB_TIMEOUT=20000

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Security Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this
SESSION_SECRET=your_super_secret_session_key_change_this
BCRYPT_ROUNDS=10

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# CORS Origins (add your domain)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Important Security Notes:**
- Change all secret keys to unique, random strings
- Use strong database passwords
- Never commit config.env to version control

#### Step 8: Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE emma_resources_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'emma_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON emma_resources_cms.* TO 'emma_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import database schema
mysql -u emma_user -p emma_resources_cms < cms/database/cms-resources-schema.sql
```

#### Step 9: Create Upload Directories

```bash
# Create upload directories with correct permissions
mkdir -p uploads/blogs
mkdir -p uploads/resources
mkdir -p uploads/casestudies
mkdir -p uploads/usecases
mkdir -p uploads/logo

# Set proper permissions
chmod -R 755 uploads
sudo chown -R www-data:www-data uploads  # or your web server user
```

#### Step 10: Start Application with PM2

```bash
# Start the application
pm2 start server.js --name "emma-cms"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
# Copy and run the command that PM2 provides

# Check application status
pm2 status
pm2 logs emma-cms
```

#### Step 11: Configure Nginx Reverse Proxy

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/emmabykodefast
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;

    # Client upload size
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/emmabykodefast/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /cms/uploads {
        alias /var/www/emmabykodefast/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/emmabykodefast /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Step 12: Setup SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

### Option 2: cPanel Deployment

If you're using GoDaddy cPanel with Node.js support:

#### Step 1: Access cPanel

1. Login to your GoDaddy account
2. Navigate to "My Products"
3. Click "cPanel Admin"

#### Step 2: Setup Node.js Application

1. Go to **"Software" → "Setup Node.js App"**
2. Click **"Create Application"**
3. Configure:
   - **Node.js version:** 18.x (or latest)
   - **Application mode:** Production
   - **Application root:** emmabykodefast
   - **Application URL:** yourdomain.com
   - **Application startup file:** server.js
   - **Environment variables:** (Add from config.env)

#### Step 3: Upload Files

1. Use **File Manager** to upload your project
2. Extract files to the application root
3. Delete node_modules if uploaded (will reinstall)

#### Step 4: Install Dependencies

In cPanel terminal or SSH:

```bash
cd ~/emmabykodefast
npm install --production
```

#### Step 5: Setup MySQL Database

1. Go to **"Databases" → "MySQL Databases"**
2. Create new database: `emma_resources_cms`
3. Create database user with strong password
4. Grant all privileges
5. Import schema using **phpMyAdmin**:
   - Upload `cms/database/cms-resources-schema.sql`
   - Execute the SQL

#### Step 6: Configure Environment

Update environment variables in cPanel Node.js App interface with values from config.env

#### Step 7: Start Application

1. Return to "Setup Node.js App"
2. Click on your application
3. Click "Start App" or "Restart App"
4. Check status and logs

---

## Database Setup

### MySQL Configuration

```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE emma_resources_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (change password!)
CREATE USER 'emma_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON emma_resources_cms.* TO 'emma_user'@'localhost';
FLUSH PRIVILEGES;

-- Use database
USE emma_resources_cms;

-- Import schema
SOURCE /var/www/emmabykodefast/cms/database/cms-resources-schema.sql;

-- Verify tables
SHOW TABLES;
```

### Initial Admin User

Create default admin user:

```bash
# Run the reset admin script
node cms/utils/reset-admin.js
```

Or manually in MySQL:

```sql
-- Insert admin user (password: admin123 - CHANGE IMMEDIATELY!)
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@yourdomain.com', '$2a$10$YourBcryptHashHere', 'admin');
```

---

## Environment Configuration

### Production config.env Template

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database - Update with your GoDaddy MySQL credentials
DB_HOST=localhost
DB_USER=emma_user
DB_PASSWORD=your_secure_password
DB_NAME=emma_resources_cms
DB_CONNECTION_LIMIT=10

# Security - Generate new secrets!
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
BCRYPT_ROUNDS=12

# Email - Configure SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_app_password

# CORS - Your domain
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### Update server.js for Production

Edit CORS and CSP settings:

```javascript
// Update CORS in server.js
app.use(cors({
    origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
    credentials: true
}));

// Update session cookie
cookie: {
    secure: true,  // Enable for HTTPS
    httpOnly: true,
    maxAge: 30 * 60 * 1000
}
```

---

## Post-Deployment Steps

### 1. Test the Application

```bash
# Check if app is running
curl http://localhost:3001

# Check PM2 status
pm2 status

# View logs
pm2 logs emma-cms --lines 50
```

### 2. Access Your Website

- **Website:** https://yourdomain.com
- **CMS Admin:** https://yourdomain.com/cms/admin/cms-admin-local.html

### 3. Change Default Admin Password

1. Login to CMS admin
2. Navigate to settings
3. Change admin password immediately

### 4. Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Optionally close Node.js port to external access
sudo ufw deny 3001/tcp

# Enable firewall
sudo ufw enable
```

### 5. Setup Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 6. Backup Strategy

Create backup script:

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/emma-cms"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u emma_user -p emma_resources_cms > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/emmabykodefast/uploads

# Remove backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

Setup cron job:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## Troubleshooting

### Issue 1: Application Won't Start

**Check logs:**
```bash
pm2 logs emma-cms --lines 100
```

**Common solutions:**
- Verify config.env exists and has correct values
- Check database connection credentials
- Ensure port 3001 is not in use: `netstat -tulpn | grep 3001`
- Check Node.js version: `node --version`

### Issue 2: Database Connection Errors

**Solutions:**
```bash
# Test MySQL connection
mysql -u emma_user -p -h localhost emma_resources_cms

# Check MySQL is running
sudo systemctl status mysql

# Check firewall allows MySQL
sudo ufw status
```

### Issue 3: File Upload Errors

**Solutions:**
```bash
# Check upload directory permissions
ls -la uploads/

# Fix permissions
chmod -R 755 uploads
sudo chown -R www-data:www-data uploads

# Check disk space
df -h
```

### Issue 4: Nginx 502 Bad Gateway

**Solutions:**
```bash
# Check if Node.js app is running
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart emma-cms
sudo systemctl restart nginx
```

### Issue 5: CORS Errors

**Update allowed origins in server.js:**
```javascript
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'],
    credentials: true
}));
```

### Issue 6: SSL/HTTPS Issues

**Solutions:**
```bash
# Check SSL certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Force HTTPS in Nginx config
return 301 https://$server_name$request_uri;
```

---

## Performance Optimization

### 1. Enable Compression

Add to Nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
```

### 2. Setup Caching

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Optimize MySQL

```sql
-- Add indexes for better performance
USE emma_resources_cms;

CREATE INDEX idx_status ON blogs(status);
CREATE INDEX idx_created ON blogs(created_at);
CREATE INDEX idx_slug ON blogs(slug);
```

### 4. PM2 Cluster Mode

For better performance:
```bash
# Stop current instance
pm2 delete emma-cms

# Start in cluster mode
pm2 start server.js -i max --name "emma-cms"
pm2 save
```

---

## Maintenance Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs emma-cms

# Restart application
pm2 restart emma-cms

# Update application
cd /var/www/emmabykodefast
git pull origin main
npm install --production
pm2 restart emma-cms

# Monitor resources
pm2 monit

# Check disk usage
df -h

# Check memory usage
free -h
```

---

## Security Checklist

- [ ] Changed all default passwords
- [ ] Generated unique JWT and session secrets
- [ ] Enabled HTTPS/SSL
- [ ] Configured firewall (UFW)
- [ ] Set proper file permissions (755 for directories, 644 for files)
- [ ] Enabled rate limiting
- [ ] Configured CORS for your domain only
- [ ] Disabled directory listing
- [ ] Setup automated backups
- [ ] Updated all dependencies
- [ ] Enabled security headers (Helmet)
- [ ] Configured session security
- [ ] Setup log rotation

---

## Support and Resources

### GoDaddy Resources
- [GoDaddy VPS Documentation](https://www.godaddy.com/help/vps-hosting-27788)
- [Node.js on cPanel](https://www.godaddy.com/help/nodejs-hosting-41227)
- [MySQL Database Setup](https://www.godaddy.com/help/mysql-database-27715)

### Application Documentation
- See `cms/docs/CMS-README.md` for CMS details
- See `cms/docs/INTEGRATION-GUIDE.md` for integration help

### Getting Help
- Check application logs: `pm2 logs emma-cms`
- Check server logs: `/var/log/nginx/error.log`
- GoDaddy Support: Available 24/7

---

## Quick Start Checklist

1. ✅ Purchase GoDaddy VPS/Dedicated hosting
2. ✅ SSH into server
3. ✅ Install Node.js 16+
4. ✅ Install PM2
5. ✅ Upload project files
6. ✅ Run `npm install --production`
7. ✅ Create and configure `config.env`
8. ✅ Setup MySQL database
9. ✅ Import database schema
10. ✅ Create upload directories
11. ✅ Start app with PM2
12. ✅ Configure Nginx reverse proxy
13. ✅ Setup SSL certificate
14. ✅ Test website and CMS
15. ✅ Change admin password
16. ✅ Setup backups

---

## Conclusion

Your Emma CMS Platform is now deployed on GoDaddy! 

**Important Next Steps:**
1. Change all default passwords immediately
2. Configure email settings
3. Setup automated backups
4. Monitor application logs regularly
5. Keep dependencies updated

For issues or questions, refer to the troubleshooting section or check the logs.

**Happy Deploying! 🚀**

