# 📋 GoDaddy Deployment - Quick Action Checklist

**Print this and check off as you go!**

---

## 🎯 Before You Start

### Purchases & Access
- [ ] Purchase GoDaddy VPS (Deluxe Plan - 2GB RAM) ~$30/month
- [ ] Receive server IP address and root password via email
- [ ] Domain name ready (owned or purchased)
- [ ] Test SSH access: `ssh root@your-server-ip`

### Prepare Credentials
- [ ] Strong MySQL password created (16+ chars)
- [ ] Generate JWT secret: `openssl rand -base64 32`
- [ ] Generate Session secret: `openssl rand -base64 32`
- [ ] Brevo SMTP credentials ready (for emails)
- [ ] Write down admin email address

### Local Preparation
- [ ] All code tested and working locally
- [ ] Code committed to Git repository
- [ ] Create production config file with all values

---

## 🔧 Server Setup (SSH into server first)

### Initial Setup
```bash
ssh root@your-server-ip
```

- [ ] Update system: `sudo apt-get update && sudo apt-get upgrade -y`
- [ ] Install basic tools: `sudo apt-get install -y git curl build-essential`

### Install Node.js
- [ ] Run: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
- [ ] Run: `sudo apt-get install -y nodejs`
- [ ] Verify: `node --version` (should be v18.x)

### Install PM2
- [ ] Run: `sudo npm install -g pm2`
- [ ] Verify: `pm2 --version`

### Install MySQL
- [ ] Run: `sudo apt-get install -y mysql-server`
- [ ] Secure: `sudo mysql_secure_installation`
- [ ] Verify: `sudo systemctl status mysql`

### Install Nginx
- [ ] Run: `sudo apt-get install -y nginx`
- [ ] Verify: `sudo systemctl status nginx`

### Configure Firewall
- [ ] Allow SSH: `sudo ufw allow 22/tcp`
- [ ] Allow HTTP: `sudo ufw allow 80/tcp`
- [ ] Allow HTTPS: `sudo ufw allow 443/tcp`
- [ ] Enable: `sudo ufw enable`
- [ ] Check: `sudo ufw status`

---

## 📦 Deploy Application

### Upload Project
- [ ] Create directory: `sudo mkdir -p /var/www/emmabykodefast`
- [ ] Navigate: `cd /var/www/emmabykodefast`
- [ ] Clone repo: `git clone https://github.com/yourusername/emmabykodefast.git .`
- [ ] OR upload via SCP if not using Git

### Install Dependencies
- [ ] Run: `npm install --production`
- [ ] Verify no errors

### Configure Environment
- [ ] Copy config: `cp deployment/config.env.production config.env`
- [ ] Edit config: `nano config.env`
- [ ] Update all values (DB password, JWT secret, domain, etc.)
- [ ] Save and exit (Ctrl+X, Y, Enter)
- [ ] Secure file: `chmod 600 config.env`

---

## 🗄️ Setup Database

### Create Database
```bash
mysql -u root -p
```

In MySQL prompt:
- [ ] Create database: `CREATE DATABASE emma_resources_cms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
- [ ] Create user: `CREATE USER 'emma_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';`
- [ ] Grant privileges: `GRANT ALL PRIVILEGES ON emma_resources_cms.* TO 'emma_user'@'localhost';`
- [ ] Flush: `FLUSH PRIVILEGES;`
- [ ] Exit: `EXIT;`

### Import Schema
- [ ] Run: `mysql -u emma_user -p emma_resources_cms < cms/database/cms-resources-schema.sql`
- [ ] Verify: `mysql -u emma_user -p -e "USE emma_resources_cms; SHOW TABLES;"`

---

## 📁 Create Upload Directories

- [ ] `mkdir -p uploads/blogs`
- [ ] `mkdir -p uploads/resources`
- [ ] `mkdir -p uploads/casestudies`
- [ ] `mkdir -p uploads/usecases`
- [ ] `mkdir -p uploads/logo`
- [ ] `chmod -R 755 uploads`
- [ ] `sudo chown -R www-data:www-data uploads`

---

## 🚀 Start Application

### PM2 Setup
- [ ] Start app: `pm2 start server.js --name emma-cms`
- [ ] Check status: `pm2 status` (should show "online")
- [ ] View logs: `pm2 logs emma-cms --lines 20`
- [ ] Test locally: `curl http://localhost:3001`
- [ ] Save config: `pm2 save`
- [ ] Setup startup: `pm2 startup systemd` (run the command it gives you)

---

## 🌐 Configure Nginx

### Create Config
- [ ] Copy example: `sudo cp deployment/nginx-config-example.conf /etc/nginx/sites-available/emmabykodefast`
- [ ] Edit config: `sudo nano /etc/nginx/sites-available/emmabykodefast`
- [ ] Replace `yourdomain.com` with your actual domain
- [ ] Replace paths if different
- [ ] Save and exit

### Enable Site
- [ ] Create symlink: `sudo ln -s /etc/nginx/sites-available/emmabykodefast /etc/nginx/sites-enabled/`
- [ ] Test config: `sudo nginx -t` (should say "successful")
- [ ] Reload Nginx: `sudo systemctl reload nginx`

### Test Access
- [ ] Open browser: `http://your-server-ip`
- [ ] Should see your website!

---

## 🔒 Setup SSL/HTTPS

### Install Certbot
- [ ] Run: `sudo apt-get install -y certbot python3-certbot-nginx`

### Get Certificate
- [ ] Run: `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com`
- [ ] Enter email address
- [ ] Agree to terms (Y)
- [ ] Choose redirect to HTTPS (option 2)

### Verify SSL
- [ ] Test renewal: `sudo certbot renew --dry-run`
- [ ] Check certificate: `sudo certbot certificates`
- [ ] Visit: `https://yourdomain.com` (should see green padlock)

### Update App Config
- [ ] Edit: `nano config.env`
- [ ] Set: `ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`
- [ ] Save and restart: `pm2 restart emma-cms`

---

## 🔐 Security Hardening

### Change Passwords
- [ ] Login to CMS: `https://yourdomain.com/cms/admin/cms-admin-local.html`
- [ ] Change admin password immediately!

### SSH Security (Optional but Recommended)
- [ ] Disable root login: `sudo nano /etc/ssh/sshd_config`
- [ ] Set: `PermitRootLogin no`
- [ ] Restart SSH: `sudo systemctl restart sshd`

### Install Fail2Ban (Optional)
- [ ] Install: `sudo apt-get install -y fail2ban`
- [ ] Enable: `sudo systemctl enable fail2ban`

---

## 💾 Setup Backups

### Configure Backup Script
- [ ] Make executable: `chmod +x deployment/backup-script.sh`
- [ ] Test backup: `./deployment/backup-script.sh`
- [ ] Check backup created: `ls -la /var/backups/emma-cms/`

### Schedule Daily Backups
- [ ] Edit crontab: `crontab -e`
- [ ] Add line: `0 2 * * * /var/www/emmabykodefast/deployment/backup-script.sh`
- [ ] Save and exit

### Install PM2 Log Rotation
- [ ] Install: `pm2 install pm2-logrotate`
- [ ] Configure: `pm2 set pm2-logrotate:max_size 10M`
- [ ] Configure: `pm2 set pm2-logrotate:retain 7`

---

## ✅ Testing

### Functionality Tests
- [ ] Homepage loads: `https://yourdomain.com`
- [ ] CMS admin loads: `https://yourdomain.com/cms/admin/cms-admin-local.html`
- [ ] Login to CMS works
- [ ] Create test blog post
- [ ] Upload test image
- [ ] View test blog on website
- [ ] Test About page
- [ ] Test Resources page
- [ ] Test Contact form
- [ ] Test all navigation links

### Security Tests
- [ ] HTTPS working (green padlock in browser)
- [ ] HTTP redirects to HTTPS
- [ ] Check headers: `curl -I https://yourdomain.com`
- [ ] SSL test: https://www.ssllabs.com/ssltest/

### Performance Tests
- [ ] Page load speed acceptable
- [ ] Images loading properly
- [ ] No console errors (F12 in browser)
- [ ] Mobile responsive (test on phone)

### Monitoring
- [ ] PM2 status: `pm2 status` (should be "online")
- [ ] Check logs: `pm2 logs emma-cms --lines 50` (no errors)
- [ ] Nginx logs: `sudo tail -f /var/log/nginx/emmabykodefast-error.log`
- [ ] Disk space: `df -h`
- [ ] Memory: `free -h`

---

## 🚀 Go Live

### DNS Configuration
- [ ] Update DNS A record to point to server IP
- [ ] Update www CNAME to point to main domain
- [ ] Wait 24-48 hours for DNS propagation
- [ ] Check propagation: `dig yourdomain.com`

### Final Checks
- [ ] Website accessible via domain
- [ ] All features working
- [ ] HTTPS working
- [ ] Backups running
- [ ] No errors in logs
- [ ] Admin password changed
- [ ] All stakeholders notified

---

## 📊 Post-Launch Monitoring (First Week)

### Daily Checks
- [ ] Day 1: Check app status, logs, test website
- [ ] Day 2: Check backups created, monitor performance
- [ ] Day 3: Review logs for errors
- [ ] Day 4: Check disk space and memory
- [ ] Day 5: Test backup restore
- [ ] Day 6: Review security logs
- [ ] Day 7: Full system check

### Weekly Maintenance
- [ ] Review PM2 logs: `pm2 logs emma-cms`
- [ ] Check server resources: `pm2 monit`
- [ ] Verify backups: `ls -lah /var/backups/emma-cms/`
- [ ] Check for updates: `sudo apt-get update`
- [ ] Review Nginx logs for issues

---

## 🆘 Emergency Contacts & Commands

### Quick Fix Commands
```bash
# App not responding
pm2 restart emma-cms

# Check what's wrong
pm2 logs emma-cms --lines 100

# Restart everything
pm2 restart emma-cms
sudo systemctl restart nginx

# Check if services running
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql

# Restore from backup
cd /var/www/emmabykodefast
./deployment/restore-backup.sh
```

### Support Contacts
- **GoDaddy Support:** 24/7 (check your account for number)
- **Documentation:** `/deployment/GODADDY-DEPLOYMENT-GUIDE.md`
- **Checklist:** `/deployment/deployment-checklist.md`

---

## ✅ Completion Checklist

### You're Done When:
- [ ] ✅ Website live at https://yourdomain.com
- [ ] ✅ CMS admin accessible and working
- [ ] ✅ All pages tested and functional
- [ ] ✅ HTTPS enabled (green padlock)
- [ ] ✅ Backups configured and tested
- [ ] ✅ Security hardened
- [ ] ✅ Admin password changed
- [ ] ✅ Monitoring in place
- [ ] ✅ DNS propagated
- [ ] ✅ No critical errors

---

## 🎉 Congratulations!

**Your Emma CMS Platform is now live on GoDaddy! 🚀**

### What's Next?
1. Monitor for first 48 hours
2. Add content via CMS
3. Share with users
4. Regular maintenance (weekly checks)
5. Keep software updated

### Regular Maintenance Schedule
- **Daily:** Quick status check
- **Weekly:** Review logs, check backups
- **Monthly:** Update dependencies, security review
- **Quarterly:** Full system audit

---

**Need help? Refer to:**
- `/PLAN/GODADDY-DEPLOYMENT-PLAN.md` - Complete guide
- `/deployment/GODADDY-DEPLOYMENT-GUIDE.md` - Detailed instructions
- `/deployment/deployment-checklist.md` - Extended checklist

**Good luck! 🎯**

---

*Checklist Version: 1.0*  
*Last Updated: October 10, 2025*  
*Estimated Time: 11-17 hours over 2-3 days*

