# 📋 CODE SNIPPETS - READY TO COPY & PASTE

## 🎯 Use this file to quickly copy exact code for merging

---

## 📄 FILE 1: server.js

### Snippet 1A: Translation Endpoints (Insert after line 2116)

**Location**: After `app.get('/api/notifications/unsubscribe/:token', ...)` endpoint

**Copy everything between the lines**:

```javascript
// ============================================================================
// TRANSLATION API ENDPOINTS - Arabic Translation Support
// ============================================================================

app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLang = 'ar', sourceLang = 'en' } = req.body;
        
        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, error: 'Text is required for translation' });
        }
        
        console.log(`🌐 Translation request: ${sourceLang} → ${targetLang}, length: ${text.length}`);
        
        const translatedText = text; // TODO: Replace with actual Google Translate API
        
        res.json({
            success: true,
            translatedText: translatedText,
            sourceLang: sourceLang,
            targetLang: targetLang,
            fallback: true
        });
    } catch (error) {
        console.error('❌ Translation endpoint error:', error);
        res.status(500).json({ success: false, error: 'Translation request failed' });
    }
});

app.post('/api/translate/batch', async (req, res) => {
    try {
        const { texts, targetLang = 'ar', sourceLang = 'en' } = req.body;
        
        if (!texts || !Array.isArray(texts) || texts.length === 0) {
            return res.status(400).json({ success: false, error: 'Texts array is required' });
        }
        
        console.log(`📦 Batch translation: ${texts.length} texts`);
        
        const translations = texts; // TODO: Replace with actual Google Translate API
        
        res.json({
            success: true,
            translations: translations,
            fallback: true
        });
    } catch (error) {
        console.error('❌ Batch translation error:', error);
        res.status(500).json({ success: false, error: 'Batch translation failed' });
    }
});

app.post('/api/resources/:id/translate', async (req, res) => {
    try {
        const { id } = req.params;
        const { targetLang = 'ar' } = req.body;
        
        console.log(`🔄 Translating resource #${id} to ${targetLang}...`);
        
        const [rows] = await pool.execute(
            'SELECT id, title, excerpt, content, meta_title, meta_description, title_ar, excerpt_ar, content_ar FROM resources WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }
        
        const resource = rows[0];
        
        if (resource.title_ar && resource.excerpt_ar) {
            return res.json({
                success: true,
                cached: true,
                translation: {
                    title_ar: resource.title_ar,
                    excerpt_ar: resource.excerpt_ar,
                    content_ar: resource.content_ar,
                    meta_title_ar: resource.meta_title_ar,
                    meta_description_ar: resource.meta_description_ar
                }
            });
        }
        
        const title_ar = resource.title; // TODO: Replace with actual translation
        const excerpt_ar = resource.excerpt || '';
        const content_ar = resource.content || '';
        const meta_title_ar = resource.meta_title || resource.title;
        const meta_description_ar = resource.meta_description || resource.excerpt || '';
        
        await pool.execute(`
            UPDATE resources 
            SET title_ar = ?, excerpt_ar = ?, content_ar = ?, meta_title_ar = ?, meta_description_ar = ?, translation_cached_at = NOW()
            WHERE id = ?
        `, [title_ar, excerpt_ar, content_ar, meta_title_ar, meta_description_ar, id]);
        
        res.json({
            success: true,
            cached: false,
            translation: { title_ar, excerpt_ar, content_ar, meta_title_ar, meta_description_ar }
        });
    } catch (error) {
        console.error('❌ Resource translation error:', error);
        res.status(500).json({ success: false, error: 'Failed to translate resource' });
    }
});

app.get('/api/resources/:id/translation/:lang', async (req, res) => {
    try {
        const { id, lang } = req.params;
        
        if (lang !== 'ar') {
            return res.status(400).json({ success: false, error: 'Only Arabic translations supported' });
        }
        
        const [rows] = await pool.execute(
            'SELECT title_ar, excerpt_ar, content_ar, meta_title_ar, meta_description_ar, translation_cached_at FROM resources WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Resource not found' });
        }
        
        res.json({
            success: true,
            hasTranslation: !!rows[0].title_ar,
            translation: rows[0]
        });
    } catch (error) {
        console.error('❌ Get translation error:', error);
        res.status(500).json({ success: false, error: 'Failed to retrieve translation' });
    }
});

app.post('/api/admin/migrate-translation-columns', async (req, res) => {
    try {
        console.log('🚀 Starting database migration...');
        
        const [columns] = await pool.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'resources' 
            AND COLUMN_NAME IN ('title_ar', 'excerpt_ar', 'content_ar', 'meta_title_ar', 'meta_description_ar', 'translation_cached_at')
        `);
        
        if (columns.length === 6) {
            return res.json({ success: true, message: 'All columns already exist', columnsExist: true });
        }
        
        const columnsToAdd = [
            { name: 'title_ar', definition: 'TEXT NULL' },
            { name: 'excerpt_ar', definition: 'TEXT NULL' },
            { name: 'content_ar', definition: 'LONGTEXT NULL' },
            { name: 'meta_title_ar', definition: 'VARCHAR(200) NULL' },
            { name: 'meta_description_ar', definition: 'TEXT NULL' },
            { name: 'translation_cached_at', definition: 'TIMESTAMP NULL' }
        ];
        
        const results = [];
        
        for (const column of columnsToAdd) {
            const exists = columns.some(c => c.COLUMN_NAME === column.name);
            if (!exists) {
                try {
                    await pool.execute(`ALTER TABLE resources ADD COLUMN ${column.name} ${column.definition}`);
                    results.push({ column: column.name, status: 'added' });
                } catch (error) {
                    if (error.code === 'ER_DUP_FIELDNAME') {
                        results.push({ column: column.name, status: 'already_exists' });
                    } else {
                        throw error;
                    }
                }
            }
        }
        
        try {
            await pool.execute(`ALTER TABLE resources ADD INDEX idx_translation_cache (translation_cached_at)`);
            results.push({ index: 'idx_translation_cache', status: 'added' });
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                results.push({ index: 'idx_translation_cache', status: 'exists' });
            }
        }
        
        res.json({ success: true, message: 'Migration completed', results: results });
    } catch (error) {
        console.error('❌ Migration failed:', error);
        res.status(500).json({ success: false, error: 'Migration failed', details: error.message });
    }
});

// ============================================================================
// END OF TRANSLATION ENDPOINTS
// ============================================================================
```

---

### Snippet 1B: Update /api/resources Query (Around line 1114)

**Find this line in the SELECT query**:
```javascript
           r.read_time, r.slug, r.view_count, i.name as industry_name
```

**Add these two lines right after it**:
```javascript
           r.title_ar, r.excerpt_ar, r.content_ar, r.meta_title_ar, r.meta_description_ar,
           r.translation_cached_at
```

**Full context** (for verification):
```javascript
let query = `
    SELECT r.id, r.type, r.title, r.excerpt, r.content, r.author_name as author, r.tags, r.status,
           r.created_at, r.updated_at, r.featured_image as image_url, r.author_image as authorImage, 
           r.gallery, r.industry_id, r.meta_title, r.meta_description, r.meta_keywords, 
           r.read_time, r.slug, r.view_count, i.name as industry_name,
           r.title_ar, r.excerpt_ar, r.content_ar, r.meta_title_ar, r.meta_description_ar,
           r.translation_cached_at
    FROM resources r
    LEFT JOIN industries i ON r.industry_id = i.id
`;
```

---

## 📄 FILE 2: pages/resources.html

### Snippet 2A: Add Translation Scripts (Line ~1902)

**Find this block**:
```html
<!-- Translation Engine -->
<script src="/js/translations.js"></script>
<script src="/js/language-manager.js"></script>
```

**Replace with this**:
```html
<!-- Translation API and Managers -->
<script src="/js/translation-api.js"></script>
<script src="/js/resources-translation.js"></script>

<!-- Translation Engine -->
<script src="/js/translations.js"></script>
<script src="/js/language-manager.js"></script>
```

---

### Snippet 2B: Hero Section with data-translate (Line ~1757)

**Replace this**:
```html
<div class="hero-text">
    <h1>Resources</h1>
    <p>Explore insights, case studies, and best practices for AI automation across industries</p>
</div>
```

**With this**:
```html
<div class="hero-text">
    <h1 data-translate="resources.page_title">Resources</h1>
    <p data-translate="resources.page_description">Explore insights, case studies, and best practices for AI automation across industries</p>
</div>
```

---

### Snippet 2C: Stats Labels with data-translate (Line ~1763-1776)

**Replace this**:
```html
<div class="hero-stats">
    <div class="stat-item">
        <div class="stat-number" id="total-resources">7</div>
        <div class="stat-label">Total Resources</div>
    </div>
    <div class="stat-item">
        <div class="stat-number" id="blogs-count">5</div>
        <div class="stat-label">Blogs</div>
    </div>
    <div class="stat-item">
        <div class="stat-number" id="case-studies-count">1</div>
        <div class="stat-label">Case Studies</div>
    </div>
    <div class="stat-item">
        <div class="stat-number" id="use-cases-count">1</div>
        <div class="stat-label">Use Cases</div>
    </div>
</div>
```

**With this**:
```html
<div class="hero-stats">
    <div class="stat-item">
        <div class="stat-number" id="total-resources">7</div>
        <div class="stat-label" data-translate="resources.stats.total">Total Resources</div>
    </div>
    <div class="stat-item">
        <div class="stat-number" id="blogs-count">5</div>
        <div class="stat-label" data-translate="resources.categories.blogs">Blogs</div>
    </div>
    <div class="stat-item">
        <div class="stat-number" id="case-studies-count">1</div>
        <div class="stat-label" data-translate="resources.categories.case_studies">Case Studies</div>
    </div>
    <div class="stat-item">
        <div class="stat-number" id="use-cases-count">1</div>
        <div class="stat-label" data-translate="resources.categories.use_cases">Use Cases</div>
    </div>
</div>
```

---

### Snippet 2D: Filter Tabs with data-translate (Line ~1784-1791)

**Replace this**:
```html
<div class="resource-type-filter">
    <h3 class="filter-section-title">Filter by Resource Type</h3>
    <div class="filter-tabs">
        <button class="filter-tab active" onclick="filterByType('all')">All Resources</button>
        <button class="filter-tab" onclick="filterByType('blog')">Blog Posts</button>
        <button class="filter-tab" onclick="filterByType('case-study')">Case Studies</button>
        <button class="filter-tab" onclick="filterByType('use-case')">Use Cases</button>
    </div>
</div>
```

**With this**:
```html
<div class="resource-type-filter">
    <h3 class="filter-section-title" data-translate="resources.filters.filter_by_type">Filter by Resource Type</h3>
    <div class="filter-tabs">
        <button class="filter-tab active" data-translate="resources.filters.all_resources" onclick="filterByType('all')">All Resources</button>
        <button class="filter-tab" data-translate="resources.categories.blogs" onclick="filterByType('blog')">Blog Posts</button>
        <button class="filter-tab" data-translate="resources.categories.case_studies" onclick="filterByType('case-study')">Case Studies</button>
        <button class="filter-tab" data-translate="resources.categories.use_cases" onclick="filterByType('use-case')">Use Cases</button>
    </div>
</div>
```

---

### Snippet 2E: Industry Filter with data-translate (Line ~1795-1800)

**Replace this**:
```html
<div class="industry-filter">
    <h3 class="filter-section-title">Filter by Industry</h3>
    <div class="industry-tags" id="industry-filters-container">
        <span class="industry-tag active" onclick="filterByIndustry('all')">All Industries</span>
    </div>
</div>
```

**With this**:
```html
<div class="industry-filter">
    <h3 class="filter-section-title" data-translate="resources.filters.filter_by_industry">Filter by Industry</h3>
    <div class="industry-tags" id="industry-filters-container">
        <span class="industry-tag active" data-translate="resources.filters.all_industries" onclick="filterByIndustry('all')">All Industries</span>
    </div>
</div>
```

---

### Snippet 2F: Section Titles with data-translate

**For Blog Posts section** (Line ~1811):
```html
<h2 class="content-section-title" data-translate="resources.categories.blogs">Blog Posts</h2>
```

**For Case Studies section** (Line ~1831):
```html
<h2 class="content-section-title" data-translate="resources.categories.case_studies">Case Studies</h2>
```

**For Use Cases section** (Line ~1851):
```html
<h2 class="content-section-title" data-translate="resources.categories.use_cases">Use Cases</h2>
```

**For All Resources section** (Line ~1871):
```html
<h2 class="content-section-title" data-translate="resources.filters.all_resources">All Resources</h2>
```

---

### Snippet 2G: Loading & Empty States with data-translate (Line ~1875-1884)

**Replace this**:
```html
<!-- Loading state -->
<div class="loading-state" id="loading-state">
    <div class="loading-spinner"></div>
    <p>Loading resources...</p>
</div>

<!-- Empty state -->
<div class="empty-state" id="empty-state" style="display: none;">
    <h3>No resources found</h3>
    <p>Check back later for new content.</p>
</div>
```

**With this**:
```html
<!-- Loading state -->
<div class="loading-state" id="loading-state">
    <div class="loading-spinner"></div>
    <p data-translate="resources.loading_state.loading">Loading resources...</p>
</div>

<!-- Empty state -->
<div class="empty-state" id="empty-state" style="display: none;">
    <h3 data-translate="resources.empty_state.title">No resources found</h3>
    <p data-translate="resources.empty_state.description">Check back later for new content.</p>
</div>
```

---

### Snippet 2H: Update loadResources Function (Line ~2155)

**Find this code in the loadResources function**:
```javascript
allResources = uniqueResources;

// Initialize filtered resources with all resources by default
filteredResources = [...allResources];
console.log('✅ Initialized filteredResources with all resources:', filteredResources.length);
```

**Replace with this**:
```javascript
allResources = uniqueResources;

// Apply translations if in Arabic mode
const currentLang = window.languageManager?.getCurrentLanguage() || 'en';
if (currentLang === 'ar' && window.resourcesTranslationManager) {
    console.log('🌍 Arabic mode detected, translating resources...');
    try {
        allResources = await window.resourcesTranslationManager.translateResources(allResources);
    } catch (error) {
        console.error('Translation failed, using English:', error);
    }
}

// Initialize filtered resources with all resources by default
filteredResources = [...allResources];
console.log('✅ Initialized filteredResources with all resources:', filteredResources.length);
```

---

### Snippet 2I: Update createContentCard Function (Line ~2300)

**Find this in createContentCard function**:
```javascript
// Get author info
const author = resource.author || resource.author_name || 'Emma AI Team';

// Create link based on type
let linkUrl = '#';
```

**Add this BEFORE that section**:
```javascript
// Use translated content if available
const title = resource.displayTitle || resource.title || 'Untitled';
const excerpt = resource.displayExcerpt || resource.excerpt || resource.description || 'No description available.';

// Get author info
const author = resource.author || resource.author_name || 'Emma AI Team';
```

**Then find the cardHTML** (a few lines down):
```javascript
const cardHTML = `
    <div class="content-card-header">
        <h3 class="content-card-title">${resource.title || 'Untitled'}</h3>
```

**Replace with**:
```javascript
const cardHTML = `
    <div class="content-card-header">
        <h3 class="content-card-title resource-title">${title}</h3>
```

**And find**:
```javascript
        <p class="content-card-excerpt">${(resource.excerpt || resource.description || 'No description available.').substring(0, 100)}
```

**Replace with**:
```javascript
        <p class="content-card-excerpt resource-excerpt">${excerpt.substring(0, 100)}${excerpt.length > 100 ? '...' : ''}</p>
```

**And find**:
```javascript
            <span class="content-card-author">By ${author}</span>
            <a href="${linkUrl}" class="content-card-link">Read More →</a>
```

**Replace with**:
```javascript
            <span class="content-card-author"><span data-translate="resources.card.by">By</span> ${author}</span>
            <a href="${linkUrl}" class="content-card-link"><span data-translate="resources.actions.read_more">Read More</span> →</a>
```

---

### Snippet 2J: Add Language Change Listener (Add at end of script, line ~2800)

**Add this entire block at the end of the main script block** (before closing `</script>`):

```javascript
// ============================================================================
// TRANSLATION INTEGRATION - Language Change Listener
// ============================================================================
window.addEventListener('languageChanged', async function(event) {
    const newLang = event.detail.language;
    console.log('🌍 Language changed to:', newLang, 'on resources page');
    
    if (newLang === 'ar' && allResources.length > 0) {
        console.log('🔄 Translating resources to Arabic...');
        
        if (window.resourcesTranslationManager) {
            try {
                // Translate all resources
                const translatedResources = await window.resourcesTranslationManager.translateResources(allResources);
                
                // Update the global arrays
                allResources = translatedResources;
                filteredResources = [...allResources];
                
                // Re-display with translated content
                blogPosts = allResources.filter(r => r.type === 'blog');
                otherResources = allResources.filter(r => r.type !== 'blog');
                
                // Re-filter and display
                filterResources();
                displayContentByFilter();
                
                console.log('✅ Resources translated and displayed in Arabic');
            } catch (error) {
                console.error('❌ Translation failed, showing English:', error);
            }
        } else {
            console.warn('⚠️ Resources translation manager not loaded');
        }
    } else if (newLang === 'en') {
        console.log('🔄 Switching back to English, reloading...');
        await loadResources();
    }
});
```

---

## 🔧 Terminal Commands

### Run Database Migration:
```bash
curl -X POST http://localhost:3000/api/admin/migrate-translation-columns
```

### Test Translation Endpoint:
```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Resources","targetLang":"ar"}'
```

### Test Resource Translation:
```bash
curl -X POST http://localhost:3000/api/resources/1/translate \
  -H "Content-Type: application/json" \
  -d '{"targetLang":"ar"}'
```

### Check Cached Translation:
```bash
curl http://localhost:3000/api/resources/1/translation/ar
```

---

## 🧪 Browser Console Tests

### Check Setup:
```javascript
// Check managers loaded
console.log('Translation API:', !!window.translationAPI);
console.log('Resources Manager:', !!window.resourcesTranslationManager);
console.log('Language Manager:', !!window.languageManager);

// Check translations exist
console.log('Translations:', window.translations.ar.resources);
```

### Test Translation:
```javascript
// Switch to Arabic
window.languageManager.setLanguage('ar');

// Wait 2 seconds, then check
setTimeout(() => {
    console.log('Page title:', document.querySelector('h1').textContent);
    // Should show: "الموارد"
}, 2000);
```

### Test Dynamic Content:
```javascript
// Check if resources are translated
console.log('First resource:', allResources[0]);
// Should have displayTitle property if translated

// Manually trigger translation
if (window.resourcesTranslationManager && allResources[0]) {
    window.resourcesTranslationManager.translateResource(allResources[0])
        .then(r => console.log('Translated resource:', r));
}
```

---

## 🎯 Merge Checklist

Copy this checklist and check off as you go:

### server.js:
- [ ] Opened file in editor
- [ ] Found line 2116 (after email unsubscribe endpoint)
- [ ] Pasted Snippet 1A (translation endpoints)
- [ ] Found line 1114 (in /api/resources SELECT)
- [ ] Added Snippet 1B (Arabic columns to query)
- [ ] Saved file
- [ ] No syntax errors

### pages/resources.html:
- [ ] Opened file in editor
- [ ] Line ~1902: Added scripts (Snippet 2A)
- [ ] Line ~1757: Updated hero (Snippet 2B)
- [ ] Line ~1763: Updated stats (Snippet 2C)
- [ ] Line ~1784: Updated filter tabs (Snippet 2D)
- [ ] Line ~1795: Updated industry filter (Snippet 2E)
- [ ] Lines 1811,1831,1851,1871: Updated section titles (Snippet 2F)
- [ ] Line ~1875: Updated loading/empty (Snippet 2G)
- [ ] Line ~2155: Updated loadResources (Snippet 2H)
- [ ] Line ~2300: Updated createContentCard (Snippet 2I)
- [ ] Line ~2800: Added language listener (Snippet 2J)
- [ ] Saved file
- [ ] No syntax errors

### Database:
- [ ] Server running
- [ ] Ran migration command
- [ ] Got success response
- [ ] Verified columns exist

### Testing:
- [ ] Opened /resources in browser
- [ ] No console errors
- [ ] Switched to Arabic
- [ ] UI elements translated
- [ ] Verified English unchanged

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Merge server.js | 5 min |
| Update resources.html | 10 min |
| Run migration | 1 min |
| Test | 5 min |
| **TOTAL** | **~20 min** |

---

## 🆘 If You Get Stuck

1. **Syntax Error in server.js**:
   - Check all braces are closed: `{` `}`
   - Check all parentheses match: `(` `)`
   - Use editor's syntax checker

2. **Syntax Error in resources.html**:
   - Check all quotes are closed: `"` `"`
   - Check all HTML tags are closed: `<div>` `</div>`
   - Validate HTML

3. **Migration Fails**:
   - Check server is running
   - Check database connection in config.env
   - Try running script directly: `node database/add-arabic-translation-columns.js`

4. **Translation Not Working**:
   - Open browser console
   - Check for JavaScript errors
   - Verify scripts loaded: `console.log(window.translationAPI)`
   - Clear cache and reload

---

## 🎓 Understanding What Each Piece Does

| File | Purpose | When It Runs |
|------|---------|--------------|
| translation-api.js | Handles API calls and caching | When translation needed |
| resources-translation.js | Manages resource translations | When resources load or language changes |
| translations.js | Stores static UI translations | On page load |
| language-manager.js | Handles language switching | On language change |
| server-translation-endpoints.js | Provides translation API | When client requests translation |

---

**Use this file for quick copy-paste during implementation!**  
**For full context, see: MERGE-GUIDE-STEP-BY-STEP.md**

🚀 Happy merging!

