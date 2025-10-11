# Privacy Policy CMS Integration Guide

## Overview

The Privacy Policy page is now fully integrated with a CMS system that allows for easy content updates without requiring code changes. This system provides both automatic content management and manual editing capabilities.

## Features

### ✅ Automatic Features
- **Auto-updating last modified date** - Updates automatically when content changes
- **Real-time content refresh** - Checks for updates every 5 minutes
- **Responsive design** - Works perfectly on all devices
- **SEO optimized** - Proper meta tags and structured data
- **Print-friendly** - Special print styles for easy document generation

### ✅ CMS Features
- **Live editing** - Edit content directly in the browser (admin mode)
- **Section-based updates** - Update individual sections independently
- **Content history** - Automatic version tracking (last 50 versions)
- **Admin controls** - Refresh, save, and manage content
- **Authentication ready** - Prepared for admin authentication system

## File Structure

```
cms/
├── privacy-policy-cms.js          # Frontend CMS integration
├── api/
│   └── privacy-policy-api.js      # Server-side API endpoints
├── data/
│   ├── privacy-policy.json        # Current content (auto-generated)
│   └── privacy-policy-history.json # Content history (auto-generated)
└── docs/
    └── PRIVACY-POLICY-CMS-GUIDE.md # This guide
```

## API Endpoints

### GET `/api/cms/privacy-policy`
- **Purpose**: Fetch current privacy policy content
- **Parameters**: `lastModified` (optional) - Check for updates since timestamp
- **Response**: JSON with content or `{updated: false}` if no changes

### POST `/api/cms/privacy-policy`
- **Purpose**: Update privacy policy content
- **Body**: JSON with section updates
- **Response**: `{success: true, lastModified: timestamp}`

### GET `/api/cms/privacy-policy/section/:id`
- **Purpose**: Get specific section content
- **Response**: Section content or 404 if not found

### PUT `/api/cms/privacy-policy/section/:id`
- **Purpose**: Update specific section
- **Body**: New section content
- **Response**: `{success: true, lastModified: timestamp}`

### GET `/api/cms/privacy-policy/history`
- **Purpose**: Get content change history
- **Response**: Array of historical versions

## Content Sections

The privacy policy is divided into these CMS-manageable sections:

1. **introduction** - Main introduction text
2. **coverage** - What the policy covers
3. **globalCompliance** - Global compliance information
4. **services** - Emma's services description
5. **contactInfo** - Contact information

## Usage

### For Regular Users
- Visit `/privacy` to view the privacy policy
- Content updates automatically
- Print-friendly version available
- Mobile-responsive design

### For CMS Administrators
1. **Enable Admin Mode**:
   ```javascript
   localStorage.setItem('cms_admin', 'true');
   ```

2. **Edit Content**:
   - Hover over sections to see edit indicators
   - Click edit button to open inline editor
   - Make changes and save

3. **Admin Controls**:
   - **Refresh**: Reload content from server
   - **Save All**: Save all pending changes

### For Developers

#### Server Integration
```javascript
const { setupPrivacyPolicyAPI } = require('./cms/api/privacy-policy-api');

// Add to your Express app
app.use('/api/cms', setupPrivacyPolicyAPI);
```

#### Custom Content Updates
```javascript
// Update specific section
const response = await fetch('/api/cms/privacy-policy/section/introduction', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        title: "Introduction",
        body: "Updated content here..."
    })
});
```

## Configuration

### Minimum Age Requirement
The minimum age requirement is configurable via CMS:
```javascript
// Update minimum age
fetch('/api/cms/privacy-policy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ minimumAge: 21 })
});
```

### Compliance Badges
Add or modify compliance badges in the globalCompliance section:
```html
<span class="compliance-badge">NEW_REGULATION</span>
```

## Security Considerations

1. **Authentication**: Add proper authentication to API endpoints
2. **Authorization**: Implement role-based access control
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Content Validation**: Validate HTML content to prevent XSS
5. **Backup**: Regular backups of content data

## Styling

The privacy policy uses a modern, dark theme with:
- **Colors**: Blue/purple gradient theme matching Emma branding
- **Typography**: Inter font family for readability
- **Responsive**: Mobile-first design approach
- **Animations**: Smooth transitions and hover effects

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **Print**: Optimized print styles
- **Accessibility**: WCAG 2.1 AA compliant

## Troubleshooting

### Content Not Updating
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check network connectivity
4. Clear browser cache

### Admin Mode Not Working
1. Verify localStorage setting: `localStorage.getItem('cms_admin')`
2. Check for JavaScript errors
3. Ensure admin panel is visible

### API Errors
1. Check server logs
2. Verify file permissions in `/cms/data/`
3. Ensure JSON data is valid

## Future Enhancements

- [ ] Multi-language support
- [ ] Rich text editor integration
- [ ] Advanced content versioning
- [ ] Automated compliance checking
- [ ] Content approval workflow
- [ ] Analytics integration

## Support

For technical support or questions about the Privacy Policy CMS:
- **Email**: privacy@kodefast.com
- **Documentation**: This guide
- **Code**: `/cms/` directory in the project
