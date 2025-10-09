#!/bin/bash

# Emma CMS - Deployment Preparation Script
# This script prepares everything for deployment to production server

echo "🚀 Emma CMS - Deployment Preparation"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Export MySQL data
echo -e "${BLUE}Step 1: Exporting MySQL database...${NC}"
node deployment/export-cms-data.js

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Database export failed. Make sure MySQL is running.${NC}"
    exit 1
fi

# Step 2: Create deployment package directory
echo -e "\n${BLUE}Step 2: Creating deployment package...${NC}"
DEPLOY_DIR="deployment/production-package"
mkdir -p "$DEPLOY_DIR"

# Step 3: Copy necessary files
echo -e "\n${BLUE}Step 3: Copying files to deployment package...${NC}"

# Copy uploads folder
echo "  📁 Copying uploads folder..."
cp -r uploads "$DEPLOY_DIR/"
echo "     ✓ Uploads copied ($(find uploads -type f | wc -l | tr -d ' ') files)"

# Copy SQL export
echo "  📄 Copying SQL export..."
LATEST_SQL=$(ls -t deployment/cms-export/cms-data-export-*.sql 2>/dev/null | head -1)
if [ -f "$LATEST_SQL" ]; then
    cp "$LATEST_SQL" "$DEPLOY_DIR/"
    echo "     ✓ SQL export copied: $(basename $LATEST_SQL)"
else
    echo "     ⚠️  No SQL export found"
fi

# Copy deployment scripts
echo "  📜 Copying deployment scripts..."
cp deployment/import-cms-data.js "$DEPLOY_DIR/"
cp deployment/DEPLOYMENT-INSTRUCTIONS.md "$DEPLOY_DIR/" 2>/dev/null || echo "     ⚠️  Deployment instructions not found"
echo "     ✓ Scripts copied"

# Copy environment template
echo "  ⚙️  Creating environment template..."
cat > "$DEPLOY_DIR/config.env.template" << 'EOF'
# Emma CMS Production Configuration
# Copy this to config.env and fill in your production values

# Database Configuration (REQUIRED)
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=emma_resources_cms

# Server Configuration
PORT=3000
CMS_PORT=3001

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Environment
NODE_ENV=production

# Optional: Email Configuration
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EOF
echo "     ✓ Environment template created"

# Step 4: Create deployment archive
echo -e "\n${BLUE}Step 4: Creating deployment archive...${NC}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_NAME="emma-cms-deployment-$TIMESTAMP.tar.gz"

cd deployment/production-package
tar -czf "../$ARCHIVE_NAME" .
cd ../..

ARCHIVE_PATH="deployment/$ARCHIVE_NAME"
ARCHIVE_SIZE=$(du -h "$ARCHIVE_PATH" | cut -f1)

echo -e "     ✓ Archive created: ${GREEN}$ARCHIVE_NAME${NC} ($ARCHIVE_SIZE)"

# Step 5: Create deployment instructions
echo -e "\n${BLUE}Step 5: Creating deployment instructions...${NC}"

cat > "$DEPLOY_DIR/QUICK-DEPLOY.md" << 'EOF'
# Emma CMS - Quick Deployment Guide

## 📦 What's Included

1. `uploads/` - All media files (images, documents)
2. `cms-data-export-*.sql` - Database export with all content
3. `import-cms-data.js` - Database import script
4. `config.env.template` - Environment configuration template

## 🚀 Deployment Steps

### On Your Production Server:

#### 1. Upload Files
```bash
# Upload this entire package to your server
# Example using scp:
scp emma-cms-deployment-*.tar.gz user@your-server:/var/www/emma/

# Or upload via FTP/FileZilla to your web directory
```

#### 2. Extract Package
```bash
cd /var/www/emma/
tar -xzf emma-cms-deployment-*.tar.gz
```

#### 3. Setup Database
```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE emma_resources_cms;"

# Import the schema (first time only)
mysql -u root -p emma_resources_cms < cms/database/cms-resources-schema.sql

# Import your data
node import-cms-data.js cms-data-export-*.sql
```

#### 4. Configure Environment
```bash
# Copy template and edit with your values
cp config.env.template config.env
nano config.env  # or use vi, vim, etc.

# IMPORTANT: Update these values:
# - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# - JWT_SECRET (generate a random string)
# - Ports if needed
```

#### 5. Install Dependencies (if needed)
```bash
npm install
```

#### 6. Start CMS Server
```bash
# For testing:
node cms/start-cms.js

# For production (with PM2):
pm2 start cms/start-cms.js --name emma-cms
pm2 save
```

#### 7. Verify Deployment
- Access admin panel: `http://your-server:3001/admin-local`
- Login: username `admin`, password `admin123`
- Check if resources are visible
- Verify images load correctly

## 🔒 Security Notes

1. **Change default password** immediately after first login
2. **Update JWT_SECRET** to a random secure string
3. **Setup SSL/HTTPS** for production
4. **Configure firewall** to restrict database access
5. **Regular backups** of database and uploads folder

## 📁 Folder Permissions

```bash
# Ensure uploads folder is writable
chmod -R 755 uploads/
chown -R www-data:www-data uploads/  # Adjust user as needed
```

## 🆘 Troubleshooting

### Database Connection Error
- Verify MySQL is running: `systemctl status mysql`
- Check credentials in `config.env`
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Images Not Loading
- Check uploads folder permissions
- Verify server is serving static files
- Check network/firewall settings

### Cannot Login
- Reset admin password: `node cms/utils/reset-admin.js`
- Check JWT_SECRET is set in config.env

## 📞 Support

If you encounter issues, check:
- Server logs: `tail -f server.log`
- CMS logs: `tail -f cms/cms-sync-server.log`
- Node.js version (should be 14+): `node --version`
EOF

echo "     ✓ Quick deployment guide created"

# Step 6: Summary
echo -e "\n${GREEN}=================================${NC}"
echo -e "${GREEN}✨ Deployment Package Ready!${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""
echo -e "📦 Package Location: ${BLUE}$ARCHIVE_PATH${NC}"
echo -e "📏 Package Size: ${BLUE}$ARCHIVE_SIZE${NC}"
echo ""
echo -e "📋 What's included:"
echo "   ✓ Database export (SQL file)"
echo "   ✓ Uploads folder (all media files)"
echo "   ✓ Import script"
echo "   ✓ Configuration template"
echo "   ✓ Deployment instructions"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "   1. Upload $ARCHIVE_NAME to your production server"
echo "   2. Follow instructions in deployment/production-package/QUICK-DEPLOY.md"
echo "   3. Or extract and run: tar -xzf $ARCHIVE_NAME && node import-cms-data.js"
echo ""
echo -e "${GREEN}🎉 Ready for deployment!${NC}"

