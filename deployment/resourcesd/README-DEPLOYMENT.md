# Emma CMS - Deployment Package

## 📂 Files in This Folder

### Scripts
- **`export-cms-data.js`** - Exports MySQL database to SQL file
- **`import-cms-data.js`** - Imports SQL file to production database  
- **`prepare-deployment.sh`** - Automated deployment preparation (recommended)

### Guides
- **`QUICK-START-DEPLOYMENT.md`** - ⭐ START HERE - Simple 3-step guide
- **`DEPLOYMENT-INSTRUCTIONS.md`** - Complete detailed instructions
- **`deployment-checklist.md`** - Deployment checklist
- **`GODADDY-DEPLOYMENT-GUIDE.md`** - GoDaddy-specific guide (if applicable)

### Generated Folders
- **`cms-export/`** - Contains exported SQL files (created after running export)
- **`production-package/`** - Complete package ready for upload (created by prepare-deployment.sh)

---

## 🚀 Quick Start (Recommended)

### For beginners or quick deployment:

**1. Run on local machine:**
```bash
bash deployment/prepare-deployment.sh
```

**2. Upload the generated archive to your server**

**3. Follow instructions in `QUICK-START-DEPLOYMENT.md`**

---

## 📖 Manual Process (Advanced Users)

### Step 1: Export Database
```bash
node deployment/export-cms-data.js
```
Creates: `deployment/cms-export/cms-data-export-YYYY-MM-DD.sql`

### Step 2: Upload to Server
- Upload SQL file
- Upload entire `uploads/` folder
- Upload `import-cms-data.js`

### Step 3: Import on Server
```bash
node import-cms-data.js cms-data-export-YYYY-MM-DD.sql
```

---

## 📦 What Gets Deployed

### Database (MySQL)
- ✅ All blog posts with full content
- ✅ All case studies  
- ✅ All use cases
- ✅ Users and authentication
- ✅ Industries and tags
- ✅ CMS settings

### Files
- ✅ All images from `uploads/blogs/`
- ✅ All images from `uploads/casestudies/`
- ✅ All images from `uploads/usecases/`
- ✅ Logo files

**Total:** ~44 media files + complete database

---

## 🎯 Which Guide Should I Use?

| Your Situation | Recommended Guide |
|----------------|-------------------|
| First time deploying | `QUICK-START-DEPLOYMENT.md` |
| Need detailed steps | `DEPLOYMENT-INSTRUCTIONS.md` |
| Using GoDaddy hosting | `GODADDY-DEPLOYMENT-GUIDE.md` |
| Need checklist | `deployment-checklist.md` |

---

## ⚡ One-Command Deployment

If you want the fastest way:

```bash
# Local machine - prepare everything
bash deployment/prepare-deployment.sh

# Upload the generated .tar.gz file to server

# Server - extract and import
tar -xzf emma-cms-deployment-*.tar.gz && node import-cms-data.js
```

---

## 🔧 Environment Configuration

The deployment package includes `config.env.template`. 

**On production server, update these:**

```bash
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password  
DB_NAME=emma_resources_cms
JWT_SECRET=generate-a-random-secure-key-here
```

Generate JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🆘 Troubleshooting

### Export fails?
- Check if MySQL is running: `mysql -u root -p -e "SHOW DATABASES;"`
- Verify `config.env` has correct database credentials
- Check database name matches (default: `emma_resources_cms`)

### Import fails?
- Ensure database exists on production
- Check MySQL user has permissions
- Verify Node.js is installed: `node --version`

### Files missing?
- Check uploads folder exists: `ls -la uploads/`
- Verify SQL export file: `ls -la deployment/cms-export/`

---

## 📞 Support

For issues during deployment:

1. Check server logs: `tail -f server.log`
2. Check CMS logs: `tail -f cms/cms-sync-server.log`  
3. Review troubleshooting guide: `cms/docs/CMS-TROUBLESHOOTING.md`

---

## ✅ Deployment Checklist

After deployment, verify:

- [ ] Database imported successfully
- [ ] Uploads folder in place with correct permissions
- [ ] config.env configured with production values
- [ ] CMS server starts without errors
- [ ] Can access admin panel (port 3001)
- [ ] Can login with credentials
- [ ] Resources (blogs/cases/uses) are visible
- [ ] Images load correctly
- [ ] Main website works (port 3000)
- [ ] Default password changed
- [ ] JWT secret updated

---

**🎉 Ready to deploy? Start with `QUICK-START-DEPLOYMENT.md`**

