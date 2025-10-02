# Archived Status Functionality Guide

## Overview
The "Archived" status is a content management feature that allows administrators to hide resources from public view while preserving them in the CMS for future reference or potential restoration.

## Purpose of Archived Status

### 1. Content Preservation
- **Historical Records**: Keep old content for reference without cluttering the public website
- **Audit Trail**: Maintain a complete history of all published content
- **Compliance**: Meet requirements for content retention policies

### 2. Content Management
- **Temporary Hiding**: Hide outdated content without permanently deleting it
- **Seasonal Content**: Archive holiday or seasonal content for reuse
- **Content Review**: Move content under review to archived status

### 3. SEO and Performance
- **Clean URLs**: Remove outdated content from search engine indexing
- **Site Performance**: Reduce the number of active pages for better site speed
- **User Experience**: Prevent users from accessing outdated or irrelevant content

## How Archived Status Works

### Status Hierarchy
1. **Draft**: Content being created/edited (not visible to public)
2. **Published**: Active content visible to public
3. **Archived**: Hidden content preserved for future use

### Behavior Differences

#### Published Content
- Visible on website
- Indexed by search engines
- Appears in content listings
- Accessible via direct URLs

#### Archived Content
- Hidden from public website
- Not indexed by search engines
- Excluded from content listings
- URLs return 404 or redirect
- Preserved in CMS for management

## Implementation Details

### Database Schema
```sql
-- Resources table includes status field
status ENUM('draft', 'published', 'archived') DEFAULT 'draft'
```

### API Behavior
- **Public APIs**: Filter out archived content
- **Admin APIs**: Include archived content for management
- **Search**: Exclude archived content from public search results

### Frontend Behavior
- **Content Lists**: Hide archived items from public listings
- **Individual Pages**: Return 404 for archived content URLs
- **Admin Interface**: Show archived content with clear status indicators

## Use Cases

### 1. Content Lifecycle Management
```
Published → Archived → (Potentially) Published Again
```

### 2. Seasonal Content
- Archive holiday promotions after the season
- Archive event announcements after the event
- Archive time-sensitive offers

### 3. Content Updates
- Archive old versions when publishing updates
- Archive outdated information
- Archive content under legal review

### 4. Performance Optimization
- Archive rarely accessed content
- Archive content that doesn't fit current strategy
- Archive duplicate or redundant content

## Admin Interface Features

### Status Indicators
- **Visual Badges**: Clear status indicators in content lists
- **Filtering**: Filter content by status (All, Published, Draft, Archived)
- **Bulk Actions**: Archive multiple items at once

### Management Actions
- **Restore**: Move archived content back to published
- **Delete**: Permanently remove archived content
- **Preview**: View archived content without publishing

## Best Practices

### When to Archive
- Content is outdated but may be useful later
- Content doesn't fit current brand strategy
- Content is under legal or compliance review
- Seasonal content that will be reused

### When NOT to Archive
- Content that should be permanently deleted
- Content with errors or incorrect information
- Content that violates policies (should be deleted)
- Content that will never be used again

### Archive Management
- Regular review of archived content
- Clean up truly obsolete archived content
- Document reasons for archiving
- Set up automated archiving rules where appropriate

## Technical Considerations

### SEO Impact
- Archived content should return proper 404 status
- Update internal links pointing to archived content
- Submit updated sitemaps to search engines

### Performance
- Archived content doesn't affect site performance
- Database queries should exclude archived content
- Consider moving old archived content to separate storage

### Backup and Recovery
- Archived content should be included in backups
- Have procedures for restoring archived content
- Consider long-term storage solutions for archived content

## Migration from Deletion
If you previously deleted content that should have been archived:

1. **Review Deletion Logs**: Check what content was permanently deleted
2. **Backup Recovery**: Restore from backups if possible
3. **Update Procedures**: Train team on archiving vs. deletion
4. **Implement Workflows**: Create clear guidelines for content lifecycle

## Monitoring and Analytics
- Track archived content volume
- Monitor content lifecycle patterns
- Analyze reasons for archiving
- Measure impact of archiving on site performance

## Conclusion
The archived status provides a flexible content management solution that balances content preservation with public site cleanliness. Proper use of this feature helps maintain a professional, up-to-date website while preserving valuable historical content.
