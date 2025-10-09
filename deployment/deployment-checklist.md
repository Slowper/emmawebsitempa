# GoDaddy Deployment Checklist for Emma CMS

Use this checklist to ensure a smooth deployment to GoDaddy.

## Pre-Deployment

### 1. GoDaddy Account & Hosting
- [ ] GoDaddy VPS/Dedicated server purchased and activated
- [ ] SSH credentials received and tested
- [ ] Domain name configured and pointed to server
- [ ] Server has minimum 1GB RAM and Node.js 16+ support

### 2. Local Preparation
- [ ] All code tested locally
- [ ] config.env.production file prepared with production values
- [ ] Database schema file ready (`cms/database/cms-resources-schema.sql`)
- [ ] Project compressed (excluding node_modules) for upload
- [ ] Git repository setup (if using git deployment)

### 3. Security Preparation
- [ ] Generate new JWT_SECRET: `openssl rand -base64 32`
- [ ] Generate new SESSION_SECRET: `openssl rand -base64 32`
- [ ] Strong MySQL password created
- [ ] Admin email configured
- [ ] SMTP credentials ready for email notifications

---

## Server Setup

### 4. Initial Server Configuration
- [ ] SSH into GoDaddy server successfully
- [ ] Update system: `sudo apt-get update && sudo apt-get upgrade -y`
- [ ] Install required packages: `sudo apt-get install -y git curl build-essential`

### 5. Node.js Installation
- [ ] Check if Node.js is installed: `node --version`
- [ ] If not, install Node.js 18 LTS:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- [ ] Verify installation: `node --version` (should be 16+)
- [ ] Verify npm: `npm --version`

### 6. PM2 Installation
- [ ] Install PM2 globally: `sudo npm install -g pm2`
- [ ] Verify PM2: `pm2 --version`

---

## Application Deployment

### 7. File Upload
- [ ] Create application directory: `sudo mkdir -p /var/www/emmabykodefast`
- [ ] Set proper ownership: `sudo chown -R $USER:$USER /var/www/emmabykodefast`
- [ ] Upload files using one of:
  - [ ] Git clone: `git clone <your-repo-url> /var/www/emmabykodefast`
  - [ ] SCP upload: `scp emma-cms.tar.gz user@server:/var/www/emmabykodefast/`
  - [ ] cPanel File Manager upload
- [ ] Verify files uploaded: `ls -la /var/www/emmabykodefast`

### 8. Dependencies Installation
- [ ] Navigate to app directory: `cd /var/www/emmabykodefast`
- [ ] Install dependencies: `npm install --production`
- [ ] Verify no errors during installation
- [ ] Check node_modules created: `ls node_modules`

### 9. Configuration
- [ ] Copy config.env.production to config.env
- [ ] Update config.env with production values:
  - [ ] PORT (default: 3001)
  - [ ] DB_HOST (usually localhost)
  - [ ] DB_USER (your MySQL username)
  - [ ] DB_PASSWORD (your MySQL password)
  - [ ] DB_NAME (emma_resources_cms)
  - [ ] JWT_SECRET (unique random string)
  - [ ] SESSION_SECRET (unique random string)
  - [ ] SMTP credentials
  - [ ] ALLOWED_ORIGINS (your domain)
- [ ] Verify config.env exists: `ls -la config.env`
- [ ] Check permissions: `chmod 600 config.env`

---

## Database Setup

### 10. MySQL Configuration
- [ ] Login to MySQL: `mysql -u root -p`
- [ ] Create database:
  ```sql
  CREATE DATABASE emma_resources_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- [ ] Create user:
  ```sql
  CREATE USER 'emma_user'@'localhost' IDENTIFIED BY 'strong_password';
  ```
- [ ] Grant privileges:
  ```sql
  GRANT ALL PRIVILEGES ON emma_resources_cms.* TO 'emma_user'@'localhost';
  FLUSH PRIVILEGES;
  ```
- [ ] Exit MySQL: `EXIT;`

### 11. Database Schema Import
- [ ] Import schema:
  ```bash
  mysql -u emma_user -p emma_resources_cms < cms/database/cms-resources-schema.sql
  ```
- [ ] Verify tables created:
  ```bash
  mysql -u emma_user -p -e "USE emma_resources_cms; SHOW TABLES;"
  ```
- [ ] Should see tables: users, blogs, resources, case_studies, use_cases, etc.

### 12. Admin User Setup
- [ ] Run admin reset script: `node cms/utils/reset-admin.js`
- [ ] Or create manually in MySQL
- [ ] Note down default admin credentials (CHANGE LATER!)

---

## Upload Directories

### 13. Create Upload Folders
- [ ] Create directories:
  ```bash
  mkdir -p uploads/blogs
  mkdir -p uploads/resources
  mkdir -p uploads/casestudies
  mkdir -p uploads/usecases
  mkdir -p uploads/logo
  ```
- [ ] Set permissions: `chmod -R 755 uploads`
- [ ] Set ownership: `sudo chown -R www-data:www-data uploads`
- [ ] Verify: `ls -la uploads/`

---

## Application Start

### 14. PM2 Configuration
- [ ] Start application: `pm2 start server.js --name emma-cms`
- [ ] Check status: `pm2 status`
- [ ] View logs: `pm2 logs emma-cms --lines 50`
- [ ] Verify no errors in logs
- [ ] Test locally: `curl http://localhost:3001`
- [ ] Save PM2 config: `pm2 save`

### 15. PM2 Startup Script
- [ ] Generate startup script: `pm2 startup systemd`
- [ ] Run the command that PM2 provides
- [ ] Verify: `sudo systemctl status pm2-$USER`
- [ ] Test reboot persistence (optional): `sudo reboot`

---

## Web Server Configuration

### 16. Nginx Installation (if needed)
- [ ] Check if installed: `nginx -v`
- [ ] If not, install: `sudo apt-get install -y nginx`
- [ ] Start Nginx: `sudo systemctl start nginx`
- [ ] Enable on boot: `sudo systemctl enable nginx`

### 17. Nginx Configuration
- [ ] Copy nginx-config-example.conf
- [ ] Create config file: `sudo nano /etc/nginx/sites-available/emmabykodefast`
- [ ] Update with your domain name
- [ ] Update application directory paths
- [ ] Save and exit
- [ ] Create symbolic link:
  ```bash
  sudo ln -s /etc/nginx/sites-available/emmabykodefast /etc/nginx/sites-enabled/
  ```
- [ ] Test configuration: `sudo nginx -t`
- [ ] If OK, reload: `sudo systemctl reload nginx`

### 18. Firewall Configuration
- [ ] Allow HTTP: `sudo ufw allow 80/tcp`
- [ ] Allow HTTPS: `sudo ufw allow 443/tcp`
- [ ] Allow SSH: `sudo ufw allow 22/tcp`
- [ ] Enable firewall: `sudo ufw enable`
- [ ] Check status: `sudo ufw status`

---

## SSL/HTTPS Setup

### 19. SSL Certificate with Let's Encrypt
- [ ] Install Certbot: `sudo apt-get install -y certbot python3-certbot-nginx`
- [ ] Get certificate:
  ```bash
  sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
  ```
- [ ] Follow prompts and agree to TOS
- [ ] Choose redirect option (option 2)
- [ ] Verify certificate: `sudo certbot certificates`
- [ ] Test auto-renewal: `sudo certbot renew --dry-run`

### 20. Update Application for HTTPS
- [ ] Update config.env:
  - [ ] SESSION_SECURE=true
  - [ ] ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
- [ ] Restart application: `pm2 restart emma-cms`
- [ ] Clear PM2 logs: `pm2 flush`

---

## Testing

### 21. Functionality Tests
- [ ] Access website: https://yourdomain.com
- [ ] Access CMS admin: https://yourdomain.com/cms/admin/cms-admin-local.html
- [ ] Login with admin credentials
- [ ] Create test blog post
- [ ] Upload test image
- [ ] View test content on website
- [ ] Test language switching (if applicable)
- [ ] Test all main pages:
  - [ ] Home
  - [ ] About
  - [ ] Resources
  - [ ] Blog
  - [ ] Contact
  - [ ] Pricing

### 22. Security Tests
- [ ] HTTPS working (green padlock)
- [ ] HTTP redirects to HTTPS
- [ ] Rate limiting working (try rapid requests)
- [ ] CORS configured correctly
- [ ] Admin login required for CMS
- [ ] File upload restrictions working
- [ ] Security headers present (check with: curl -I https://yourdomain.com)

### 23. Performance Tests
- [ ] Page load speed acceptable
- [ ] Images loading correctly
- [ ] Static assets cached
- [ ] Compression enabled (check response headers)
- [ ] Database queries fast
- [ ] No memory leaks (monitor: `pm2 monit`)

---

## Post-Deployment

### 24. Security Hardening
- [ ] Change default admin password immediately
- [ ] Remove or disable root SSH login
- [ ] Setup SSH key authentication
- [ ] Configure fail2ban (optional)
- [ ] Regular security updates: `sudo apt-get update && sudo apt-get upgrade`

### 25. Monitoring Setup
- [ ] Install PM2 log rotation: `pm2 install pm2-logrotate`
- [ ] Configure log rotation:
  ```bash
  pm2 set pm2-logrotate:max_size 10M
  pm2 set pm2-logrotate:retain 7
  ```
- [ ] Setup application monitoring (optional)
- [ ] Configure error alerting (optional)

### 26. Backup Configuration
- [ ] Create backup script (see GODADDY-DEPLOYMENT-GUIDE.md)
- [ ] Test backup script
- [ ] Setup cron job for automated backups:
  ```bash
  crontab -e
  # Add: 0 2 * * * /path/to/backup.sh
  ```
- [ ] Verify backup location: `/var/backups/emma-cms/`
- [ ] Test backup restoration

### 27. Documentation
- [ ] Document server credentials (store securely)
- [ ] Document database credentials (store securely)
- [ ] Document admin credentials (store securely)
- [ ] Document SSL renewal process
- [ ] Document backup/restore process
- [ ] Create runbook for common issues

---

## Maintenance

### 28. Regular Tasks
- [ ] Weekly: Check application logs: `pm2 logs emma-cms`
- [ ] Weekly: Check server resources: `pm2 monit`
- [ ] Weekly: Verify backups are running
- [ ] Monthly: Update dependencies: `npm update`
- [ ] Monthly: Review security patches
- [ ] Monthly: Test backup restoration
- [ ] Quarterly: Renew SSL (auto-renews, just verify)
- [ ] Quarterly: Review and rotate logs

### 29. Emergency Procedures
- [ ] Know how to restart app: `pm2 restart emma-cms`
- [ ] Know how to check logs: `pm2 logs emma-cms --lines 100`
- [ ] Know how to restore from backup
- [ ] Know how to rollback deployment
- [ ] Have GoDaddy support contact info ready
- [ ] Have database backup accessible

---

## Final Verification

### 30. Launch Checklist
- [ ] All above items completed
- [ ] Production config.env has no default/dummy values
- [ ] All passwords changed from defaults
- [ ] SSL certificate valid and auto-renewing
- [ ] Backups running and tested
- [ ] Monitoring configured
- [ ] Team trained on basic operations
- [ ] Emergency procedures documented
- [ ] DNS fully propagated (check: dig yourdomain.com)
- [ ] All stakeholders notified of go-live

---

## Quick Commands Reference

```bash
# Check application status
pm2 status

# View logs
pm2 logs emma-cms

# Restart application
pm2 restart emma-cms

# Check Nginx status
sudo systemctl status nginx

# Check MySQL status
sudo systemctl status mysql

# View server resources
pm2 monit

# Check disk space
df -h

# Check memory
free -h

# Test database connection
mysql -u emma_user -p emma_resources_cms -e "SELECT 1"

# Reload Nginx
sudo systemctl reload nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Support Resources

- **Deployment Guide:** `GODADDY-DEPLOYMENT-GUIDE.md`
- **CMS Documentation:** `cms/docs/CMS-README.md`
- **Integration Guide:** `cms/docs/INTEGRATION-GUIDE.md`
- **Troubleshooting:** `cms/docs/CMS-TROUBLESHOOTING.md`
- **GoDaddy Support:** https://www.godaddy.com/help

---

## Notes

- Date Deployed: _______________
- Deployed By: _______________
- Server IP: _______________
- Domain: _______________
- Admin Email: _______________

---

**Congratulations! Your Emma CMS Platform is now live on GoDaddy! 🎉**

