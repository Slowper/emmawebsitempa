# Emma CMS - Content Management System

## 📁 Folder Structure

```
cms/
├── admin/                    # Admin interface files
│   ├── cms-admin.html       # Main admin dashboard
│   ├── cms-admin-local.html # Local admin interface
│   ├── cms-admin.js         # Admin JavaScript functionality
│   ├── cms-blogs.html       # Blog management page
│   ├── cms-case-studies.html # Case studies management
│   ├── cms-resources.html   # Resources management
│   └── cms-use-cases.html   # Use cases management
├── api/                      # API server files
│   ├── cms-resources-server.js # Main CMS API server
│   ├── cms-simple-server.js    # Simple CMS server
│   ├── cms-sync-server.js      # Sync server
│   ├── api-example.js          # API examples
│   └── cms-integration-example.js # Integration examples
├── database/                 # Database related files
│   ├── cms-resources-schema.sql # Database schema
│   ├── init-database.sql        # Database initialization
│   ├── add-slug-column.js       # Database migration
│   ├── clear-resources.js       # Database cleanup
│   └── migrate-to-mysql.js      # MySQL migration
├── docs/                     # Documentation
│   ├── CMS-README.md            # Main CMS documentation
│   ├── CMS-TROUBLESHOOTING.md   # Troubleshooting guide
│   ├── CMS-DYNAMIC-RESOURCES-UPDATE.md # Dynamic resources guide
│   ├── DYNAMIC-RESOURCES-GUIDE.md # Resources system guide
│   ├── INTEGRATION-GUIDE.md     # Integration guide
│   ├── MPA-SEO-GUIDE.md         # SEO guide
│   └── SEO-GUIDE.md             # SEO implementation guide
├── integration/              # Website integration files
│   ├── cms-integration.js    # Main integration script
│   ├── cms-resource-reader.html # Resource reader page
│   ├── dynamic-content.js    # Dynamic content system
│   └── script-cms.js         # CMS script utilities
├── uploads/                  # File uploads directory
│   ├── blogs/               # Blog images
│   ├── casestudies/         # Case study images
│   ├── usecases/            # Use case images
│   ├── resources/           # Resource images
│   └── logo/                # Logo files
├── utils/                    # Utility files
│   ├── setup-cms.js         # CMS setup script
│   ├── download-quill.js     # Quill editor download
│   ├── fix-cms-csp.js       # CSP fixes
│   └── cms-package.json     # CMS dependencies
├── quill/                    # Rich text editor
│   ├── quill.min.js         # Quill JavaScript
│   └── quill.snow.css       # Quill styles
├── start-cms.js             # CMS startup script
├── start-cms-simple.js      # Simple CMS startup
└── cms-sync-server.log      # Sync server log
```

## 🚀 Quick Start

### 1. Start the CMS Server
```bash
# From project root
node cms/start-cms.js
# or
node cms/start-cms-simple.js
```

### 2. Access Admin Interface
- Main Admin: `http://localhost:3001/cms/admin/cms-admin-local.html`
- Resources: `http://localhost:3001/cms/admin/cms-resources.html`
- Blogs: `http://localhost:3001/cms/admin/cms-blogs.html`
- Case Studies: `http://localhost:3001/cms/admin/cms-case-studies.html`
- Use Cases: `http://localhost:3001/cms/admin/cms-use-cases.html`

### 3. Default Login
- Username: `admin`
- Password: `admin123`

## 🔧 Integration with Main Website

The CMS is integrated with the main website through:
- Dynamic content loading on `/pages/resources.html`
- API endpoints for content management
- File upload handling
- SEO optimization

## 📝 Key Features

- **Rich Text Editor**: Quill.js integration
- **Media Management**: Upload and organize images
- **Content Types**: Blogs, Case Studies, Use Cases
- **SEO Optimization**: Meta tags and descriptions
- **Real-time Updates**: Dynamic content loading
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Development

### Adding New Content Types
1. Update database schema in `database/cms-resources-schema.sql`
2. Add admin interface in `admin/`
3. Update API endpoints in `api/`
4. Add integration in `integration/`

### Customizing Styles
- Admin styles are embedded in HTML files
- Main website styles are in root `styles.css`
- Quill editor styles in `quill/quill.snow.css`

## 📊 File Organization Benefits

- **Clear Separation**: CMS files are isolated from main website
- **Easy Maintenance**: Related files are grouped together
- **Scalable Structure**: Easy to add new features
- **Clean Root Directory**: Main website files remain uncluttered
- **Better Organization**: Logical folder structure for development

## 🔗 Related Files

- Main website server: `server.js` (root)
- Main website pages: `pages/` (root)
- Main website styles: `styles.css` (root)
- Package configuration: `package.json` (root)
