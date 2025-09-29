# Emma Resources CMS - Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. Content Security Policy (CSP) Errors

**Problem**: Quill.js CDN resources are blocked by CSP
```
Refused to load the stylesheet 'https://cdn.quilljs.com/1.3.6/quill.snow.css' because it violates the following Content Security Policy directive
```

**Solutions**:

#### Option A: Use Fixed Admin Interface (Recommended)
```bash
# Run the fix script
node fix-cms-csp.js

# Use the fixed admin interface
http://localhost:3001/cms-admin-fixed.html
```

#### Option B: Use Local Admin Interface
```bash
# Use the local version (no external dependencies)
http://localhost:3001/cms-admin-local.html
```

#### Option C: Update CSP in Server
Add to `cms-resources-server.js`:
```javascript
scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://unpkg.com", "https://cdn.quilljs.com"],
styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://cdn.quilljs.com"],
```

### 2. Database Connection Issues

**Problem**: Cannot connect to MySQL database

**Solutions**:

#### Check Database Configuration
```bash
# Verify your .env file
cat .env

# Should contain:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=emma_resources_cms
```

#### Create Database Manually
```sql
CREATE DATABASE emma_resources_cms;
```

#### Run Setup Script
```bash
node setup-cms.js
```

### 3. Port Already in Use

**Problem**: Port 3001 is already in use

**Solutions**:

#### Find and Kill Process
```bash
# Find process using port 3001
lsof -ti:3001

# Kill the process
kill -9 $(lsof -ti:3001)
```

#### Use Different Port
```bash
# Set environment variable
export CMS_PORT=3002

# Or update .env file
echo "CMS_PORT=3002" >> .env
```

### 4. File Upload Issues

**Problem**: Cannot upload files or images

**Solutions**:

#### Check Upload Directory
```bash
# Create upload directories
mkdir -p cms-uploads/images
mkdir -p cms-uploads/documents
mkdir -p cms-uploads/gallery

# Set permissions
chmod 755 cms-uploads
```

#### Check File Size Limits
Update `cms-resources-server.js`:
```javascript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

### 5. Authentication Issues

**Problem**: Cannot login to admin panel

**Solutions**:

#### Check Default Credentials
- Username: `admin`
- Password: `admin123`

#### Reset Admin Password
```sql
-- Connect to database
mysql -u root -p emma_resources_cms

-- Update password (password: admin123)
UPDATE users SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE username = 'admin';
```

### 6. CORS Issues

**Problem**: Cross-origin requests blocked

**Solutions**:

#### Update CORS Settings
In `cms-resources-server.js`:
```javascript
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8000', 'http://yourdomain.com'],
    credentials: true
}));
```

### 7. Rich Text Editor Not Working

**Problem**: Quill editor not loading or functioning

**Solutions**:

#### Use Local Editor
Access: `http://localhost:3001/cms-admin-local.html`

#### Download Quill Locally
```bash
node download-quill.js
```

#### Check Browser Console
Look for JavaScript errors and resolve them.

### 8. Resources Not Loading on Website

**Problem**: Resources not appearing on main website

**Solutions**:

#### Check Integration Script
Ensure `cms-integration.js` is included in your main website.

#### Check API Endpoints
Test API endpoints:
```bash
curl http://localhost:3001/api/resources
```

#### Check CORS Settings
Ensure main website domain is in CORS whitelist.

### 9. Performance Issues

**Problem**: Slow loading or timeouts

**Solutions**:

#### Database Optimization
```sql
-- Add indexes
CREATE INDEX idx_resources_type_status ON resources(type, status);
CREATE INDEX idx_resources_published ON resources(published_at);
```

#### Enable Caching
The integration script includes automatic caching.

#### Check File Sizes
Optimize images before upload.

### 10. SSL/HTTPS Issues

**Problem**: Mixed content errors with HTTPS

**Solutions**:

#### Use HTTPS for CMS
```javascript
// In cms-resources-server.js
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('path/to/private-key.pem'),
    cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(options, app).listen(3001);
```

## 🛠️ Quick Fixes

### Complete Reset
```bash
# Stop server
pkill -f cms-resources-server

# Reset database
mysql -u root -p -e "DROP DATABASE IF EXISTS emma_resources_cms; CREATE DATABASE emma_resources_cms;"

# Run setup
node setup-cms.js

# Start server
node start-cms.js
```

### Update Dependencies
```bash
npm install express mysql2 bcryptjs jsonwebtoken cors multer helmet express-rate-limit slugify uuid dotenv
```

### Check Logs
```bash
# Check server logs
tail -f server.log

# Check error logs
tail -f error.log
```

## 🔍 Debug Mode

Enable debug mode:
```bash
export DEBUG=true
export NODE_ENV=development
node cms-resources-server.js
```

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the logs** for specific error messages
2. **Verify all dependencies** are installed
3. **Test API endpoints** directly with curl or Postman
4. **Check browser console** for JavaScript errors
5. **Verify database connection** and permissions

## 🎯 Common Solutions Summary

| Issue | Quick Fix |
|-------|-----------|
| CSP Errors | Use `cms-admin-local.html` |
| Database Issues | Run `node setup-cms.js` |
| Port Conflicts | Use `export CMS_PORT=3002` |
| Upload Issues | Check directory permissions |
| Auth Issues | Use admin/admin123 |
| CORS Issues | Update CORS origins |
| Editor Issues | Use local version |
| Performance | Add database indexes |

---

**Remember**: The CMS is designed to work independently of your main website, so most issues can be resolved without affecting your existing site.
