# Quick Start Guide - Deploy Emma CMS to GoDaddy

This is a condensed guide to get your Emma CMS Platform deployed on GoDaddy quickly.

## Prerequisites

- ✅ GoDaddy VPS or Dedicated server
- ✅ SSH access credentials
- ✅ Domain name configured

## 5-Minute Setup (Express Route)

### Step 1: Connect to Server

```bash
ssh username@your-server-ip
```

### Step 2: Run Auto-Deploy Script

```bash
# Upload your project files first, then run:
cd /var/www/emmabykodefast
chmod +x deploy-godaddy.sh
./deploy-godaddy.sh setup
```

### Step 3: Configure Database

```bash
# Login to MySQL
mysql -u root -p

# Run these commands:
CREATE DATABASE emma_resources_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'emma_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON emma_resources_cms.* TO 'emma_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u emma_user -p emma_resources_cms < cms/database/cms-resources-schema.sql
```

### Step 4: Setup Nginx

```bash
# Install Nginx
sudo apt-get install -y nginx

# Copy config
sudo cp nginx-config-example.conf /etc/nginx/sites-available/emmabykodefast

# Edit with your domain
sudo nano /etc/nginx/sites-available/emmabykodefast
# Replace 'yourdomain.com' with your actual domain

# Enable site
sudo ln -s /etc/nginx/sites-available/emmabykodefast /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Setup SSL

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 6: Access Your Site

- Website: `https://yourdomain.com`
- CMS Admin: `https://yourdomain.com/cms/admin/cms-admin-local.html`

**Default Login:** admin / admin123 (CHANGE IMMEDIATELY!)

---

## Manual Setup (Step-by-Step)

### 1. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install PM2

```bash
sudo npm install -g pm2
```

### 3. Upload Project

```bash
# Create directory
sudo mkdir -p /var/www/emmabykodefast
cd /var/www/emmabykodefast

# Upload your files here (via git, scp, or file manager)

# Install dependencies
npm install --production
```

### 4. Configure Environment

```bash
# Create config from template
cp config.env.production config.env

# Edit config
nano config.env
```

Update these critical values:
```env
DB_USER=emma_user
DB_PASSWORD=your_db_password
DB_NAME=emma_resources_cms
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
ALLOWED_ORIGINS=https://yourdomain.com
```

### 5. Create Upload Directories

```bash
mkdir -p uploads/{blogs,resources,casestudies,usecases,logo}
chmod -R 755 uploads
```

### 6. Setup Database

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE emma_resources_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create user
mysql -u root -p -e "CREATE USER 'emma_user'@'localhost' IDENTIFIED BY 'strong_password';"

# Grant privileges
mysql -u root -p -e "GRANT ALL PRIVILEGES ON emma_resources_cms.* TO 'emma_user'@'localhost'; FLUSH PRIVILEGES;"

# Import schema
mysql -u emma_user -p emma_resources_cms < cms/database/cms-resources-schema.sql
```

### 7. Start Application

```bash
pm2 start server.js --name emma-cms
pm2 save
pm2 startup systemd
```

### 8. Configure Nginx

```bash
# Install Nginx
sudo apt-get install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/emmabykodefast
```

Paste this minimal config:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/emmabykodefast /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Setup SSL

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Essential Commands

### Application Management
```bash
# Check status
pm2 status

# View logs
pm2 logs emma-cms

# Restart app
pm2 restart emma-cms

# Monitor resources
pm2 monit
```

### Database Management
```bash
# Login to MySQL
mysql -u emma_user -p emma_resources_cms

# Backup database
mysqldump -u emma_user -p emma_resources_cms > backup.sql

# Restore database
mysql -u emma_user -p emma_resources_cms < backup.sql
```

### Server Management
```bash
# Check Nginx status
sudo systemctl status nginx

# Reload Nginx
sudo systemctl reload nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory
free -h
```

---

## Automated Backups

### Setup Backup Cron Job

```bash
# Make backup script executable
chmod +x backup-script.sh

# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/emmabykodefast/backup-script.sh
```

### Manual Backup

```bash
# Run backup script
./backup-script.sh
```

### Restore from Backup

```bash
# Run restore script
./restore-backup.sh
```

---

## Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs emma-cms --lines 100

# Check config
cat config.env

# Verify database connection
mysql -u emma_user -p -e "SELECT 1"
```

### Database connection error
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u emma_user -p emma_resources_cms -e "SHOW TABLES;"
```

### Nginx 502 error
```bash
# Check if app is running
pm2 status

# Check if port 3001 is open
netstat -tulpn | grep 3001

# Restart everything
pm2 restart emma-cms
sudo systemctl restart nginx
```

### Upload errors
```bash
# Fix permissions
chmod -R 755 uploads
sudo chown -R www-data:www-data uploads
```

---

## Security Checklist

After deployment, ensure:

- [ ] Changed default admin password
- [ ] Updated JWT_SECRET and SESSION_SECRET
- [ ] Configured firewall:
  ```bash
  sudo ufw allow 22,80,443/tcp
  sudo ufw enable
  ```
- [ ] Enabled HTTPS (done via Certbot)
- [ ] Restricted database access
- [ ] Setup automated backups
- [ ] Configured monitoring

---

## Performance Tips

### Enable PM2 Cluster Mode
```bash
pm2 delete emma-cms
pm2 start server.js -i max --name emma-cms
pm2 save
```

### Optimize MySQL
```bash
mysql -u emma_user -p emma_resources_cms
```
```sql
CREATE INDEX idx_status ON blogs(status);
CREATE INDEX idx_created ON blogs(created_at);
CREATE INDEX idx_slug ON blogs(slug);
```

### Enable Compression in Nginx
Add to server block:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

---

## Next Steps

1. **Customize Your Site**
   - Update content via CMS
   - Upload logo and images
   - Configure SMTP for emails

2. **Setup Monitoring**
   - Configure PM2 monitoring
   - Setup error alerts
   - Monitor server resources

3. **Regular Maintenance**
   - Weekly: Check logs and backups
   - Monthly: Update dependencies
   - Quarterly: Review security

---

## Support

- **Full Guide:** See `GODADDY-DEPLOYMENT-GUIDE.md`
- **Checklist:** See `deployment-checklist.md`
- **CMS Docs:** See `cms/docs/CMS-README.md`
- **GoDaddy Support:** 24/7 available

---

## Quick Links

- **CMS Admin:** `https://yourdomain.com/cms/admin/cms-admin-local.html`
- **Website:** `https://yourdomain.com`
- **PM2 Logs:** `pm2 logs emma-cms`
- **Nginx Logs:** `/var/log/nginx/error.log`
- **Backups:** `/var/backups/emma-cms/`

---

**Your Emma CMS is now live! 🚀**

For detailed information, refer to the complete deployment guide.

