# Emma Resources CMS

A complete content management system built specifically for managing blogs, case studies, and use cases for the Emma AI website.

## 🚀 Features

### Content Management
- **Rich Text Editor**: Quill.js integration for beautiful content creation
- **Media Management**: Upload and organize images, documents, and galleries
- **Industry Categorization**: Organize content by industry for better filtering
- **SEO Optimization**: Built-in meta tags, descriptions, and keyword management
- **Author Management**: Multiple authors with profiles and avatars

### Content Types
- **Blog Posts**: Articles and insights
- **Case Studies**: Success stories and implementations
- **Use Cases**: Practical applications and examples

### User Experience
- **Responsive Design**: Beautiful interface on all devices
- **Real-time Preview**: See changes as you type
- **Drag & Drop Uploads**: Easy file management
- **Auto-save**: Never lose your work
- **Version Control**: Track changes and revisions

### SEO & Performance
- **SEO-friendly URLs**: Clean, readable URLs for each resource
- **Meta Tags**: Complete Open Graph and Twitter Card support
- **Reading Time**: Automatic calculation and display
- **Social Sharing**: Built-in sharing buttons
- **Related Content**: Automatic related resource suggestions

## 📋 Prerequisites

- Node.js 14+ 
- MySQL 5.7+ or MariaDB 10.3+
- npm or yarn

## 🛠️ Installation

### 1. Database Setup

First, create a MySQL database for the CMS:

```sql
CREATE DATABASE emma_resources_cms;
```

### 2. Environment Configuration

Create a `.env` file in your project root:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=emma_resources_cms

# CMS Server Configuration
CMS_PORT=3001
JWT_SECRET=your_jwt_secret_key

# Main Website Configuration
MAIN_SITE_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
# Install CMS dependencies
npm install express mysql2 bcryptjs jsonwebtoken cors multer helmet express-rate-limit slugify uuid dotenv

# Install development dependencies
npm install --save-dev nodemon
```

### 4. Initialize Database

```bash
# Run the setup script
node setup-cms.js
```

This will:
- Create the database schema
- Insert default data
- Create necessary directories
- Set up sample content

### 5. Start the CMS Server

```bash
# Start the CMS server
node cms-resources-server.js
```

The CMS will be available at `http://localhost:3001`

## 🎯 Usage

### Admin Panel

Access the admin panel at: `http://localhost:3001/cms-admin.html`

**Default Login:**
- Username: `admin`
- Password: `admin123`

### Creating Content

1. **Login** to the admin panel
2. **Navigate** to the desired content type (Blogs, Case Studies, Use Cases)
3. **Click** "New Resource" button
4. **Fill** in the required fields:
   - Title
   - Type
   - Content (using the rich text editor)
   - Industry
   - Tags
   - Featured image
   - SEO settings
5. **Save** as draft or publish immediately

### Managing Media

- **Upload** images and documents through the admin panel
- **Organize** files in the media library
- **Use** drag & drop for easy file management
- **Preview** images before uploading

### SEO Optimization

Each resource includes:
- **Meta Title**: Custom page title
- **Meta Description**: Search engine description
- **Keywords**: SEO keywords
- **Open Graph**: Social media sharing
- **Twitter Cards**: Twitter sharing optimization

## 🔌 Integration with Main Website

### 1. Include Integration Script

Add the integration script to your main website:

```html
<script src="/cms-integration.js"></script>
```

### 2. Update Resources Page

The integration script will automatically:
- Load resources from the CMS API
- Update the resources grid
- Handle filtering and pagination
- Maintain existing functionality

### 3. Resource Detail Pages

For individual resource pages, the system will:
- Redirect to the CMS resource reader
- Display beautiful, SEO-optimized content
- Show related resources
- Enable social sharing

## 📁 File Structure

```
cms/
├── cms-resources-server.js      # Main CMS server
├── cms-admin.html              # Admin interface
├── cms-admin.js                # Admin JavaScript
├── cms-resource-reader.html    # Resource reader page
├── cms-integration.js          # Website integration
├── cms-resources-schema.sql    # Database schema
├── setup-cms.js               # Setup script
├── cms-package.json           # CMS dependencies
└── cms-uploads/               # Upload directory
    ├── images/
    ├── documents/
    └── gallery/
```

## 🎨 Customization

### Styling

The CMS uses a modern, responsive design that can be customized:

- **Colors**: Update CSS variables in `cms-admin.html`
- **Fonts**: Change font families in the CSS
- **Layout**: Modify the grid system and spacing

### Content Types

To add new content types:

1. Update the database schema
2. Modify the admin interface
3. Update the API endpoints
4. Add new templates

### Industries and Tags

Manage industries and tags through the admin panel:

- **Industries**: Categorize content by industry
- **Tags**: Add flexible tagging system
- **Colors**: Customize industry and tag colors

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)

### Resources
- `GET /api/resources` - List resources with filtering
- `GET /api/resources/:slug` - Get single resource
- `POST /api/resources` - Create new resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

### Management
- `GET /api/industries` - List industries
- `GET /api/tags` - List tags
- `GET /api/stats` - Dashboard statistics
- `POST /api/upload` - File upload

## 🚀 Deployment

### Production Setup

1. **Environment Variables**: Set production database credentials
2. **Security**: Update JWT secret and enable HTTPS
3. **Database**: Use production MySQL instance
4. **File Storage**: Consider cloud storage for uploads
5. **Monitoring**: Set up logging and monitoring

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["node", "cms-resources-server.js"]
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Check MySQL credentials and connection
2. **File Uploads**: Ensure upload directories have write permissions
3. **CORS Issues**: Update CORS settings for your domain
4. **Authentication**: Verify JWT secret is set correctly

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
NODE_ENV=development
```

## 📊 Performance

### Optimization Tips

1. **Database Indexing**: Ensure proper indexes on frequently queried columns
2. **Image Optimization**: Compress images before upload
3. **Caching**: Implement Redis caching for frequently accessed data
4. **CDN**: Use CDN for static assets

### Monitoring

Monitor key metrics:
- Response times
- Database query performance
- File upload success rates
- User engagement

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Emma Resources CMS** - Built with ❤️ for the Emma AI team
