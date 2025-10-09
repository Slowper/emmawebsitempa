# Emma CMS - GoDaddy Deployment Resources

This folder contains all the resources you need to deploy your Emma CMS Platform to GoDaddy hosting.

## 📁 Files in This Folder

### Documentation

1. **QUICK-START-GODADDY.md** ⭐ START HERE
   - Quick 5-minute setup guide
   - Essential commands
   - Best for getting started fast

2. **GODADDY-DEPLOYMENT-GUIDE.md** 📚 Complete Guide
   - Comprehensive deployment guide
   - Step-by-step instructions for VPS and cPanel
   - Troubleshooting section
   - Security and optimization tips

3. **deployment-checklist.md** ✅ Checklist
   - Complete deployment checklist
   - Track your progress
   - Ensure nothing is missed

### Configuration Files

4. **config.env.production** 🔧 Environment Config
   - Production environment configuration template
   - Copy to `config.env` and update with your values
   - Contains all necessary environment variables

5. **nginx-config-example.conf** 🌐 Nginx Config
   - Nginx reverse proxy configuration
   - SSL/HTTPS ready
   - Copy to `/etc/nginx/sites-available/` on your server

### Scripts

6. **deploy-godaddy.sh** 🚀 Deployment Script
   - Automated deployment script
   - Usage: `./deploy-godaddy.sh setup` (initial deployment)
   - Usage: `./deploy-godaddy.sh update` (update existing deployment)

7. **backup-script.sh** 💾 Backup Script
   - Automated backup for database and uploads
   - Run manually or schedule with cron
   - Saves backups to `/var/backups/emma-cms/`

8. **restore-backup.sh** 🔄 Restore Script
   - Restore from backup
   - Interactive restore process
   - Restores database and uploads

## 🚀 Quick Start

### Option 1: Quick Setup (5 Minutes)

```bash
# 1. Upload your project to GoDaddy server
# 2. SSH into your server
ssh username@your-server-ip

# 3. Navigate to project
cd /var/www/emmabykodefast

# 4. Run deployment script
./deployment/deploy-godaddy.sh setup

# 5. Follow the prompts
```

### Option 2: Manual Setup

Follow the **QUICK-START-GODADDY.md** guide for step-by-step manual setup.

### Option 3: Detailed Setup

Follow the **GODADDY-DEPLOYMENT-GUIDE.md** for comprehensive instructions.

## 📋 Deployment Workflow

### Initial Deployment

1. ✅ Read **QUICK-START-GODADDY.md**
2. ✅ Prepare your GoDaddy server (VPS/Dedicated)
3. ✅ Copy **config.env.production** to **config.env** and update values
4. ✅ Run **deploy-godaddy.sh setup** or follow manual steps
5. ✅ Configure Nginx using **nginx-config-example.conf**
6. ✅ Setup SSL with Certbot
7. ✅ Use **deployment-checklist.md** to verify everything

### Updates/Redeployment

```bash
# Pull latest changes (if using git)
git pull origin main

# Or upload new files via SCP/FTP

# Run update script
./deployment/deploy-godaddy.sh update
```

## 🔐 Security Setup

### 1. Generate Secrets

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate Session Secret
openssl rand -base64 32
```

Add these to your `config.env` file.

### 2. Database Security

- Use strong passwords
- Create dedicated database user (not root)
- Limit privileges to application database only

### 3. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22,80,443/tcp
sudo ufw enable
```

### 4. SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 💾 Backup & Restore

### Setup Automated Backups

```bash
# Make script executable
chmod +x deployment/backup-script.sh

# Test backup
./deployment/backup-script.sh

# Schedule daily backup at 2 AM
crontab -e
# Add: 0 2 * * * /var/www/emmabykodefast/deployment/backup-script.sh
```

### Restore from Backup

```bash
./deployment/restore-backup.sh
# Follow the prompts
```

## 📊 Monitoring & Maintenance

### Check Application Status

```bash
pm2 status
pm2 logs emma-cms
pm2 monit
```

### Check Server Resources

```bash
# Disk space
df -h

# Memory usage
free -h

# CPU usage
top
```

### View Logs

```bash
# Application logs
pm2 logs emma-cms --lines 100

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## 🛠️ Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   pm2 logs emma-cms --lines 50
   cat config.env  # Check configuration
   ```

2. **Database connection error**
   ```bash
   mysql -u emma_user -p emma_resources_cms -e "SELECT 1"
   ```

3. **502 Bad Gateway (Nginx)**
   ```bash
   pm2 restart emma-cms
   sudo systemctl restart nginx
   ```

4. **Upload errors**
   ```bash
   chmod -R 755 uploads
   sudo chown -R www-data:www-data uploads
   ```

See **GODADDY-DEPLOYMENT-GUIDE.md** for detailed troubleshooting.

## 📞 Support

### Documentation
- **Quick Start:** QUICK-START-GODADDY.md
- **Full Guide:** GODADDY-DEPLOYMENT-GUIDE.md
- **Checklist:** deployment-checklist.md
- **CMS Docs:** ../cms/docs/CMS-README.md

### GoDaddy Resources
- [GoDaddy VPS Documentation](https://www.godaddy.com/help/vps-hosting-27788)
- [Node.js on cPanel](https://www.godaddy.com/help/nodejs-hosting-41227)
- [GoDaddy Support](https://www.godaddy.com/help) - 24/7 Available

## ✅ Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GoDaddy VPS/Dedicated server or cPanel with Node.js
- [ ] SSH access credentials
- [ ] Domain name configured
- [ ] MySQL database credentials
- [ ] SMTP credentials (for email)
- [ ] SSL certificate plan (Let's Encrypt is free)

## 📝 File Usage Summary

| File | When to Use | Purpose |
|------|-------------|---------|
| QUICK-START-GODADDY.md | First time | Quick deployment guide |
| GODADDY-DEPLOYMENT-GUIDE.md | Reference | Complete documentation |
| deployment-checklist.md | During deployment | Track progress |
| config.env.production | Setup | Environment template |
| nginx-config-example.conf | Nginx setup | Web server config |
| deploy-godaddy.sh | Deployment | Automate deployment |
| backup-script.sh | Maintenance | Backup data |
| restore-backup.sh | Recovery | Restore data |

## 🎯 Next Steps After Deployment

1. **Security**
   - Change default admin password
   - Configure firewall
   - Setup SSL/HTTPS
   - Enable automated backups

2. **Content**
   - Login to CMS admin
   - Upload your content
   - Configure settings
   - Test all features

3. **Monitoring**
   - Setup PM2 monitoring
   - Configure log rotation
   - Test backup/restore
   - Monitor server resources

4. **Optimization**
   - Enable PM2 cluster mode
   - Configure caching
   - Optimize database
   - Enable compression

## 🚀 Quick Commands Reference

```bash
# Deployment
./deployment/deploy-godaddy.sh setup    # Initial deployment
./deployment/deploy-godaddy.sh update   # Update deployment

# Application Management
pm2 status                              # Check status
pm2 logs emma-cms                       # View logs
pm2 restart emma-cms                    # Restart app
pm2 monit                               # Monitor resources

# Backup & Restore
./deployment/backup-script.sh           # Create backup
./deployment/restore-backup.sh          # Restore backup

# Server Management
sudo systemctl status nginx             # Nginx status
sudo systemctl reload nginx             # Reload Nginx
sudo certbot renew                      # Renew SSL
```

## 📄 License

This deployment package is part of the Emma CMS Platform.

---

**Ready to deploy? Start with QUICK-START-GODADDY.md! 🚀**



