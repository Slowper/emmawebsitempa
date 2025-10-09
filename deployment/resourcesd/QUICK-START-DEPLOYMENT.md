# 🚀 Emma CMS - Quick Deployment Guide

**Simple 3-step process to deploy your CMS to production**

---

## 📦 STEP 1: Export Everything (Local Machine)

Run this ONE command:

```bash
bash deployment/prepare-deployment.sh
```

**What it does:**
- ✅ Exports your MySQL database
- ✅ Packages uploads folder  
- ✅ Creates deployment archive
- ✅ Generates instructions

**You'll get:**
- `deployment/emma-cms-deployment-XXXXXXXX.tar.gz` (complete package)

---

## 📤 STEP 2: Upload to Production Server

### Option A: Using SCP (Linux/Mac)
```bash
scp deployment/emma-cms-deployment-*.tar.gz user@your-server.com:/var/www/emma/
```

### Option B: Using FTP/FileZilla
1. Connect to your server
2. Upload the `.tar.gz` file
3. Done!

---

## 🔧 STEP 3: Import on Production Server

### SSH into your server:
```bash
ssh user@your-server.com
cd /var/www/emma
```

### Extract and setup:
```bash
# 1. Extract files
tar -xzf emma-cms-deployment-*.tar.gz

# 2. Create database
mysql -u root -p -e "CREATE DATABASE emma_resources_cms;"

# 3. Import schema (first time only)
mysql -u root -p emma_resources_cms < ../cms/database/cms-resources-schema.sql

# 4. Import your data
npm install  # if needed
node import-cms-data.js

# 5. Configure
cp config.env.template config.env
nano config.env  # Update DB credentials

# 6. Start server
npm install -g pm2
pm2 start ../cms/start-cms.js --name emma-cms
pm2 save
```

---

## ✅ Verify Deployment

1. **Access Admin Panel:**
   - URL: `http://your-server-ip:3001/admin-local`
   - Login: `admin` / `admin123`

2. **Check Resources:**
   - Verify blogs, case studies, use cases appear
   - Check images load correctly

3. **Test Main Website:**
   - URL: `http://your-server-ip:3000`
   - Navigate to Resources page

---

## 🔒 Important: Security (Do This!)

```bash
# 1. Change default password (via admin panel or):
node cms/utils/reset-admin.js

# 2. Update JWT secret in config.env:
# Generate new secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output to config.env JWT_SECRET
pm2 restart all
```

---

## 📁 What Gets Deployed

✅ **Database:**
- All blogs, case studies, use cases
- Users, industries, tags
- CMS settings

✅ **Media Files:**
- All images from uploads/blogs/
- All images from uploads/casestudies/
- All images from uploads/usecases/
- Logo files

✅ **Configuration:**
- Database structure
- Import scripts
- Environment template

---

## 🆘 Quick Troubleshooting

### Can't connect to database?
```bash
mysql -u root -p -e "SHOW DATABASES;"
# Check if emma_resources_cms exists
```

### Images not loading?
```bash
chmod -R 755 uploads/
chown -R www-data:www-data uploads/
```

### Can't login?
```bash
node cms/utils/reset-admin.js
```

### Server won't start?
```bash
# Check what's using the port
lsof -i :3001
# Change port in config.env if needed
```

---

## 📚 Need More Details?

See **DEPLOYMENT-INSTRUCTIONS.md** for complete documentation including:
- Nginx configuration
- SSL setup
- Backup strategies
- Advanced security
- Monitoring

---

## 🎯 That's It!

**3 commands total:**

1. Local: `bash deployment/prepare-deployment.sh`
2. Upload: `scp emma-cms-deployment-*.tar.gz user@server:/path/`
3. Server: `tar -xzf emma-cms-deployment-*.tar.gz && node import-cms-data.js`

**Your CMS is deployed! 🎉**

