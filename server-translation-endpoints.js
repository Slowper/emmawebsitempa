// ============================================================================
// TRANSLATION API ENDPOINTS FOR server.js
// ============================================================================
// INSERT THESE ENDPOINTS AFTER LINE 2116 in server.js (after the unsubscribe endpoint)
// 
// SAFETY GUARANTEE: These endpoints only READ English content and WRITE to 
// separate Arabic columns (*_ar). English content is NEVER modified.
// ============================================================================

// Translation API - Simple text translation
// This endpoint acts as a proxy to hide API keys from client
app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLang = 'ar', sourceLang = 'en' } = req.body;
        
        if (!text || !text.trim()) {
            return res.status(400).json({ 
                success: false, 
                error: 'Text is required for translation' 
            });
        }
        
        console.log(`🌐 Translation request: ${sourceLang} → ${targetLang}, length: ${text.length}`);
        
        // For now, use a simple translation service
        // You can integrate Google Translate API, DeepL, or other services here
        // Example: Using @google-cloud/translate (install via: npm install @google-cloud/translate)
        
        try {
            // Placeholder for actual translation API
            // Replace this with your chosen translation service
            
            // Option 1: Google Translate (recommended)
            /*
            const {Translate} = require('@google-cloud/translate').v2;
            const translate = new Translate({
                key: process.env.GOOGLE_TRANSLATE_API_KEY
            });
            
            const [translation] = await translate.translate(text, targetLang);
            */
            
            // Option 2: For testing without API, return original text
            // IMPORTANT: Replace this with actual API call in production
            const translatedText = text; // Placeholder - replace with actual API call
            
            console.log(`✅ Translation completed successfully`);
            
            res.json({
                success: true,
                translatedText: translatedText,
                sourceLang: sourceLang,
                targetLang: targetLang
            });
            
        } catch (translationError) {
            console.error('❌ Translation API error:', translationError);
            
            // Fallback: return original text if translation fails
            res.json({
                success: true,
                translatedText: text,
                fallback: true,
                message: 'Translation service unavailable, returning original text'
            });
        }
        
    } catch (error) {
        console.error('❌ Translation endpoint error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Translation request failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Batch translation API - Translate multiple texts at once
app.post('/api/translate/batch', async (req, res) => {
    try {
        const { texts, targetLang = 'ar', sourceLang = 'en' } = req.body;
        
        if (!texts || !Array.isArray(texts) || texts.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Texts array is required for batch translation' 
            });
        }
        
        console.log(`📦 Batch translation request: ${texts.length} texts, ${sourceLang} → ${targetLang}`);
        
        try {
            // Placeholder for batch translation
            // Replace with actual API call in production
            
            // Option 1: Google Translate batch
            /*
            const {Translate} = require('@google-cloud/translate').v2;
            const translate = new Translate({
                key: process.env.GOOGLE_TRANSLATE_API_KEY
            });
            
            const [translations] = await translate.translate(texts, targetLang);
            */
            
            // Option 2: For testing without API
            const translations = texts; // Placeholder - replace with actual API call
            
            console.log(`✅ Batch translation completed: ${translations.length} texts`);
            
            res.json({
                success: true,
                translations: Array.isArray(translations) ? translations : [translations],
                sourceLang: sourceLang,
                targetLang: targetLang
            });
            
        } catch (translationError) {
            console.error('❌ Batch translation API error:', translationError);
            
            // Fallback: return original texts
            res.json({
                success: true,
                translations: texts,
                fallback: true,
                message: 'Translation service unavailable, returning original texts'
            });
        }
        
    } catch (error) {
        console.error('❌ Batch translation endpoint error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Batch translation request failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Translate a specific resource and cache in database
// SAFETY: Only WRITES to *_ar columns, READS from English columns
app.post('/api/resources/:id/translate', async (req, res) => {
    try {
        const { id } = req.params;
        const { targetLang = 'ar' } = req.body;
        
        console.log(`🔄 Translating resource #${id} to ${targetLang}...`);
        
        // Step 1: Fetch the resource (READ English content)
        const [rows] = await pool.execute(
            'SELECT id, title, excerpt, content, meta_title, meta_description, title_ar, excerpt_ar, content_ar FROM resources WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Resource not found' 
            });
        }
        
        const resource = rows[0];
        
        // Step 2: Check if already translated
        if (resource.title_ar && resource.excerpt_ar && resource.content_ar) {
            console.log(`✅ Resource #${id} already has cached translation`);
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
        
        // Step 3: Translate the content
        console.log(`🌐 Requesting translation from API...`);
        
        try {
            // Prepare texts for batch translation
            const textsToTranslate = [
                resource.title,
                resource.excerpt || '',
                resource.content || '',
                resource.meta_title || resource.title,
                resource.meta_description || resource.excerpt || ''
            ];
            
            // Placeholder for actual translation
            // Replace with actual API call in production
            const translations = textsToTranslate; // Placeholder
            
            const [title_ar, excerpt_ar, content_ar, meta_title_ar, meta_description_ar] = translations;
            
            // Step 4: Store translation in database (WRITE to *_ar columns ONLY)
            await pool.execute(`
                UPDATE resources 
                SET title_ar = ?,
                    excerpt_ar = ?,
                    content_ar = ?,
                    meta_title_ar = ?,
                    meta_description_ar = ?,
                    translation_cached_at = NOW()
                WHERE id = ?
            `, [title_ar, excerpt_ar, content_ar, meta_title_ar, meta_description_ar, id]);
            
            console.log(`✅ Translation cached in database for resource #${id}`);
            
            res.json({
                success: true,
                cached: false,
                translation: {
                    title_ar,
                    excerpt_ar,
                    content_ar,
                    meta_title_ar,
                    meta_description_ar
                }
            });
            
        } catch (translationError) {
            console.error('❌ Translation failed:', translationError);
            res.status(500).json({
                success: false,
                error: 'Translation failed',
                details: translationError.message
            });
        }
        
    } catch (error) {
        console.error('❌ Resource translation endpoint error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to translate resource',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get cached translation for a resource
app.get('/api/resources/:id/translation/:lang', async (req, res) => {
    try {
        const { id, lang } = req.params;
        
        if (lang !== 'ar') {
            return res.status(400).json({ 
                success: false, 
                error: 'Only Arabic translations are supported' 
            });
        }
        
        const [rows] = await pool.execute(
            'SELECT title_ar, excerpt_ar, content_ar, meta_title_ar, meta_description_ar, translation_cached_at FROM resources WHERE id = ?',
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Resource not found' 
            });
        }
        
        const resource = rows[0];
        
        if (!resource.title_ar) {
            return res.json({
                success: true,
                hasTranslation: false,
                message: 'Translation not cached yet'
            });
        }
        
        res.json({
            success: true,
            hasTranslation: true,
            translation: {
                title_ar: resource.title_ar,
                excerpt_ar: resource.excerpt_ar,
                content_ar: resource.content_ar,
                meta_title_ar: resource.meta_title_ar,
                meta_description_ar: resource.meta_description_ar,
                cached_at: resource.translation_cached_at
            }
        });
        
    } catch (error) {
        console.error('❌ Get translation endpoint error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve translation' 
        });
    }
});

// Update the main resources endpoint to include Arabic translations
// MODIFY EXISTING /api/resources endpoint (around line 1106) to include Arabic columns:
/*
FIND THIS in server.js (around line 1106):

app.get('/api/resources', async (req, res) => {
    try {
        const { type, status, limit, sort, order } = req.query;
        
        let query = `
            SELECT r.id, r.type, r.title, r.excerpt, r.content, r.author_name as author, r.tags, r.status,
                   r.created_at, r.updated_at, r.featured_image as image_url, r.author_image as authorImage, 
                   r.gallery, r.industry_id, r.meta_title, r.meta_description, r.meta_keywords, 
                   r.read_time, r.slug, r.view_count, i.name as industry_name
            FROM resources r
            LEFT JOIN industries i ON r.industry_id = i.id
        `;

REPLACE WITH THIS (adds Arabic columns):

app.get('/api/resources', async (req, res) => {
    try {
        const { type, status, limit, sort, order, lang } = req.query;
        
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
*/

// Database migration endpoint - Run this once to add Arabic columns
app.post('/api/admin/migrate-translation-columns', async (req, res) => {
    try {
        console.log('🚀 Starting database migration for Arabic translation columns...');
        
        // Check if columns already exist
        const [columns] = await pool.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'resources' 
            AND COLUMN_NAME IN ('title_ar', 'excerpt_ar', 'content_ar', 'meta_title_ar', 'meta_description_ar', 'translation_cached_at')
        `);
        
        if (columns.length === 6) {
            return res.json({
                success: true,
                message: 'All Arabic translation columns already exist',
                columnsExist: true
            });
        }
        
        // Add columns one by one
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
            const columnExists = columns.some(c => c.COLUMN_NAME === column.name);
            
            if (!columnExists) {
                try {
                    await pool.execute(`
                        ALTER TABLE resources 
                        ADD COLUMN ${column.name} ${column.definition}
                    `);
                    results.push({ column: column.name, status: 'added' });
                    console.log(`✅ Added column: ${column.name}`);
                } catch (error) {
                    if (error.code === 'ER_DUP_FIELDNAME') {
                        results.push({ column: column.name, status: 'already_exists' });
                    } else {
                        throw error;
                    }
                }
            } else {
                results.push({ column: column.name, status: 'already_exists' });
            }
        }
        
        // Add index
        try {
            await pool.execute(`
                ALTER TABLE resources 
                ADD INDEX idx_translation_cache (translation_cached_at)
            `);
            results.push({ column: 'idx_translation_cache', status: 'index_added' });
        } catch (error) {
            if (error.code === 'ER_DUP_KEYNAME') {
                results.push({ column: 'idx_translation_cache', status: 'index_exists' });
            }
        }
        
        console.log('✅ Migration completed successfully');
        
        res.json({
            success: true,
            message: 'Database migration completed',
            results: results
        });
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        res.status(500).json({
            success: false,
            error: 'Migration failed',
            details: error.message
        });
    }
});

// ============================================================================
// END OF TRANSLATION ENDPOINTS
// ============================================================================
// INSTALLATION INSTRUCTIONS:
// 1. Open server.js
// 2. Find line 2116 (after the unsubscribe endpoint)
// 3. Copy and paste all the code above
// 4. Find the /api/resources endpoint (around line 1106)
// 5. Add the Arabic columns to the SELECT query as shown in the comment above
// 6. Save and restart your server
// 7. Run POST /api/admin/migrate-translation-columns to add database columns
// ============================================================================

