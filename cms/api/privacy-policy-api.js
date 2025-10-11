/**
 * Privacy Policy CMS API
 * Server-side endpoint for managing privacy policy content
 */

const fs = require('fs').promises;
const path = require('path');

class PrivacyPolicyAPI {
    constructor() {
        this.dataFile = path.join(__dirname, '../data/privacy-policy.json');
        this.ensureDataFile();
    }

    /**
     * Ensure data file exists with default content
     */
    async ensureDataFile() {
        try {
            await fs.access(this.dataFile);
        } catch (error) {
            // File doesn't exist, create it with default content
            const defaultContent = {
                lastModified: new Date().toISOString(),
                minimumAge: 18,
                introduction: {
                    title: "Introduction",
                    body: `For Emma ("Emma", "we", "our" or "us") it is vitally important that users (the "users") feel secure when using our AI-powered assistant platform.`
                },
                coverage: {
                    title: "What this Privacy Policy covers",
                    body: `This Privacy Policy (the "Privacy Policy"), together with our Terms & Conditions at <a href="/terms" style="color: #60a5fa;">emma.ai/terms</a> and Cookie Policy at <a href="/cookie-policy" style="color: #60a5fa;">emma.ai/cookie-policy</a>, explains:

<ul style="color: #cbd5e1; margin-left: 1.5rem;">
    <li>What personal data we collect from you or that you provide to us</li>
    <li>How we use your personal data</li>
    <li>When we may share your data with third parties</li>
    <li>Your rights concerning your personal data</li>
</ul>

Please read this carefully to understand how Emma secures your data.`
                },
                globalCompliance: {
                    title: "Global Compliance & Your Rights",
                    body: `Emma operates globally. Your rights concerning personal data may vary depending on local laws, including 
                    <span class="compliance-badge">GDPR</span>
                    <span class="compliance-badge">HIPAA</span>
                    <span class="compliance-badge">CCPA</span>
                    or other applicable privacy regulations. Where specific legal rights apply in your region, Emma will comply accordingly.`
                },
                services: {
                    title: "Emma's Services",
                    body: `Emma is an AI-powered assistant designed to help organizations automate communication, scheduling, follow-ups, and other workflows. Emma operates via voice, chat, or API integrations and may connect with partner systems to deliver your requested services ("Emma Services").

This Privacy Policy describes how your data is processed when using Emma Services, the platform, or any related product features. Where certain processing activities relate only to a specific product, this will be clearly indicated.

You are not required to provide personal information to Emma. However, certain features, especially those involving scheduling, reminders, or AI-driven communication, rely on user data to function. Without this information, functionality may be limited, and the accuracy of AI-driven responses may be impacted.`
                },
                contactInfo: {
                    title: "Contact Us",
                    body: `If you have any questions about this Privacy Policy or Emma's data practices, please contact us at:

<div style="background: rgba(30, 41, 59, 0.6); border-radius: 0.75rem; padding: 1.5rem; margin: 1rem 0;">
    <p style="margin: 0; color: #cbd5e1;">
        <strong>Email:</strong> <a href="mailto:privacy@kodefast.com" style="color: #60a5fa;">privacy@kodefast.com</a><br>
        <strong>Website:</strong> <a href="https://kodefast.com" style="color: #60a5fa;">kodefast.com</a><br>
        <strong>Address:</strong> 200 Motor Parkway, Suite D 26, Hauppauge, NY. 11788
    </p>
</div>`
                },
                footerNote: `This Privacy Policy is effective as of the last modified date and may be updated periodically. 
We will notify users of any material changes to this policy.`
            };

            await fs.writeFile(this.dataFile, JSON.stringify(defaultContent, null, 2));
        }
    }

    /**
     * Get privacy policy content
     */
    async getContent(lastModified = null) {
        try {
            const content = JSON.parse(await fs.readFile(this.dataFile, 'utf8'));
            
            if (lastModified && content.lastModified === lastModified) {
                return { updated: false };
            }

            return {
                updated: true,
                ...content
            };
        } catch (error) {
            console.error('Error reading privacy policy content:', error);
            throw new Error('Failed to load privacy policy content');
        }
    }

    /**
     * Update privacy policy content
     */
    async updateContent(updates) {
        try {
            const currentContent = JSON.parse(await fs.readFile(this.dataFile, 'utf8'));
            
            // Update content with new data
            Object.keys(updates).forEach(key => {
                if (currentContent[key] !== undefined) {
                    currentContent[key] = updates[key];
                }
            });

            // Update last modified timestamp
            currentContent.lastModified = new Date().toISOString();

            // Save updated content
            await fs.writeFile(this.dataFile, JSON.stringify(currentContent, null, 2));

            return {
                success: true,
                lastModified: currentContent.lastModified
            };
        } catch (error) {
            console.error('Error updating privacy policy content:', error);
            throw new Error('Failed to update privacy policy content');
        }
    }

    /**
     * Get specific section content
     */
    async getSection(sectionId) {
        try {
            const content = JSON.parse(await fs.readFile(this.dataFile, 'utf8'));
            return content[sectionId] || null;
        } catch (error) {
            console.error('Error reading section:', error);
            return null;
        }
    }

    /**
     * Update specific section
     */
    async updateSection(sectionId, sectionContent) {
        try {
            const content = JSON.parse(await fs.readFile(this.dataFile, 'utf8'));
            content[sectionId] = sectionContent;
            content.lastModified = new Date().toISOString();

            await fs.writeFile(this.dataFile, JSON.stringify(content, null, 2));

            return {
                success: true,
                lastModified: content.lastModified
            };
        } catch (error) {
            console.error('Error updating section:', error);
            throw new Error('Failed to update section');
        }
    }

    /**
     * Get content history (optional feature)
     */
    async getHistory() {
        try {
            const historyFile = path.join(__dirname, '../data/privacy-policy-history.json');
            const history = JSON.parse(await fs.readFile(historyFile, 'utf8'));
            return history;
        } catch (error) {
            // No history file exists yet
            return [];
        }
    }

    /**
     * Save content to history
     */
    async saveToHistory(content) {
        try {
            const historyFile = path.join(__dirname, '../data/privacy-policy-history.json');
            let history = [];

            try {
                history = JSON.parse(await fs.readFile(historyFile, 'utf8'));
            } catch (error) {
                // History file doesn't exist, start with empty array
            }

            history.push({
                timestamp: new Date().toISOString(),
                content: content
            });

            // Keep only last 50 versions
            if (history.length > 50) {
                history = history.slice(-50);
            }

            await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
        } catch (error) {
            console.error('Error saving to history:', error);
        }
    }
}

// Express.js middleware for API endpoints
function setupPrivacyPolicyAPI(app) {
    const api = new PrivacyPolicyAPI();

    // GET /api/cms/privacy-policy - Get privacy policy content
    app.get('/api/cms/privacy-policy', async (req, res) => {
        try {
            const lastModified = req.query.lastModified;
            const content = await api.getContent(lastModified);
            res.json(content);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // POST /api/cms/privacy-policy - Update privacy policy content
    app.post('/api/cms/privacy-policy', async (req, res) => {
        try {
            // TODO: Add authentication/authorization check here
            // const isAuthenticated = await checkAuthentication(req);
            // if (!isAuthenticated) {
            //     return res.status(401).json({ error: 'Unauthorized' });
            // }

            const updates = req.body;
            const result = await api.updateContent(updates);
            
            // Save to history
            await api.saveToHistory(updates);
            
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // GET /api/cms/privacy-policy/section/:id - Get specific section
    app.get('/api/cms/privacy-policy/section/:id', async (req, res) => {
        try {
            const sectionId = req.params.id;
            const content = await api.getSection(sectionId);
            
            if (content) {
                res.json(content);
            } else {
                res.status(404).json({ error: 'Section not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // PUT /api/cms/privacy-policy/section/:id - Update specific section
    app.put('/api/cms/privacy-policy/section/:id', async (req, res) => {
        try {
            // TODO: Add authentication/authorization check here
            
            const sectionId = req.params.id;
            const sectionContent = req.body;
            const result = await api.updateSection(sectionId, sectionContent);
            
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // GET /api/cms/privacy-policy/history - Get content history
    app.get('/api/cms/privacy-policy/history', async (req, res) => {
        try {
            // TODO: Add authentication/authorization check here
            
            const history = await api.getHistory();
            res.json(history);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}

module.exports = {
    PrivacyPolicyAPI,
    setupPrivacyPolicyAPI
};
