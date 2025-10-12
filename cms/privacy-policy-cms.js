/**
 * Privacy Policy CMS Integration
 * This script enables CMS updates for the Privacy Policy page
 */

class PrivacyPolicyCMS {
    constructor() {
        this.apiEndpoint = '/api/cms/privacy-policy';
        this.updateInterval = 300000; // 5 minutes
        this.lastModified = null;
        this.init();
    }

    init() {
        this.loadPrivacyPolicy();
        this.setupAutoRefresh();
        this.setupEditMode();
    }

    /**
     * Load privacy policy content from CMS
     */
    async loadPrivacyPolicy() {
        try {
            const response = await fetch(this.apiEndpoint);
            if (!response.ok) {
                console.log('Using default privacy policy content');
                return;
            }

            const data = await response.json();
            this.updateContent(data);
            this.lastModified = data.lastModified;
        } catch (error) {
            console.log('Privacy Policy CMS not available, using static content');
        }
    }

    /**
     * Update page content with CMS data
     */
    updateContent(data) {
        // Update main content sections
        if (data.introduction) {
            this.updateSection('introduction', data.introduction);
        }

        if (data.coverage) {
            this.updateSection('coverage', data.coverage);
        }

        if (data.globalCompliance) {
            this.updateSection('globalCompliance', data.globalCompliance);
        }

        if (data.services) {
            this.updateSection('services', data.services);
        }

        if (data.contactInfo) {
            this.updateSection('contactInfo', data.contactInfo);
        }

        // Update dynamic fields
        if (data.minimumAge) {
            const ageElement = document.getElementById('minimumAge');
            if (ageElement) {
                ageElement.textContent = data.minimumAge;
            }
        }

        // Update last modified date
        if (data.lastModified) {
            const dateElement = document.getElementById('lastModifiedDate');
            if (dateElement) {
                const date = new Date(data.lastModified);
                dateElement.textContent = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        }
    }

    /**
     * Update a specific section with new content
     */
    updateSection(sectionId, content) {
        const section = document.querySelector(`[data-cms-section="${sectionId}"]`);
        if (section && content) {
            if (typeof content === 'string') {
                section.innerHTML = content;
            } else if (content.title && content.body) {
                const titleElement = section.querySelector('.section-title');
                const bodyElement = section.querySelector('.content-text');
                
                if (titleElement) titleElement.textContent = content.title;
                if (bodyElement) bodyElement.innerHTML = content.body;
            }
        }
    }

    /**
     * Setup auto-refresh for content updates
     */
    setupAutoRefresh() {
        setInterval(async () => {
            try {
                const response = await fetch(`${this.apiEndpoint}?lastModified=${this.lastModified}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.updated) {
                        this.updateContent(data);
                        this.showUpdateNotification();
                    }
                }
            } catch (error) {
                // Silently fail for auto-refresh
            }
        }, this.updateInterval);
    }

    /**
     * Setup edit mode for CMS administrators
     */
    setupEditMode() {
        // Check if user is CMS admin
        const isAdmin = this.checkAdminStatus();
        
        if (isAdmin) {
            this.enableEditMode();
        }
    }

    /**
     * Check if current user is CMS administrator
     */
    checkAdminStatus() {
        // This would typically check authentication tokens or cookies
        // For now, we'll use a simple check
        return localStorage.getItem('cms_admin') === 'true' || 
               sessionStorage.getItem('cms_admin') === 'true';
    }

    /**
     * Enable edit mode for CMS administrators
     */
    enableEditMode() {
        const cmsSections = document.querySelectorAll('[data-cms-editable="true"]');
        
        cmsSections.forEach(section => {
            // Add edit indicator
            const editIndicator = document.createElement('div');
            editIndicator.className = 'cms-edit-indicator';
            editIndicator.innerHTML = '✏️ Edit';
            editIndicator.style.cssText = `
                position: absolute;
                top: -0.5rem;
                right: -0.5rem;
                background: rgba(59, 130, 246, 0.9);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.7rem;
                cursor: pointer;
                z-index: 100;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            section.style.position = 'relative';
            section.appendChild(editIndicator);

            // Show edit indicator on hover
            section.addEventListener('mouseenter', () => {
                editIndicator.style.opacity = '1';
            });

            section.addEventListener('mouseleave', () => {
                editIndicator.style.opacity = '0';
            });

            // Handle edit click
            editIndicator.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openEditModal(section);
            });
        });

        // Add admin controls
        this.addAdminControls();
    }

    /**
     * Add admin control panel
     */
    addAdminControls() {
        const adminPanel = document.createElement('div');
        adminPanel.id = 'cms-admin-panel';
        adminPanel.innerHTML = `
            <div style="
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: rgba(30, 41, 59, 0.95);
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 0.75rem;
                padding: 1rem;
                z-index: 1000;
                backdrop-filter: blur(10px);
                min-width: 200px;
            ">
                <h4 style="color: #3b82f6; margin: 0 0 1rem 0; font-size: 0.9rem;">CMS Admin</h4>
                <button id="refresh-content" style="
                    background: rgba(59, 130, 246, 0.2);
                    color: #60a5fa;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 0.8rem;
                    margin-right: 0.5rem;
                ">Refresh</button>
                <button id="save-all-changes" style="
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 0.8rem;
                ">Save All</button>
            </div>
        `;

        document.body.appendChild(adminPanel);

        // Add event listeners
        document.getElementById('refresh-content').addEventListener('click', () => {
            this.loadPrivacyPolicy();
        });

        document.getElementById('save-all-changes').addEventListener('click', () => {
            this.saveAllChanges();
        });
    }

    /**
     * Open edit modal for a section
     */
    openEditModal(section) {
        const modal = document.createElement('div');
        modal.className = 'cms-edit-modal';
        modal.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            ">
                <div style="
                    background: #1e293b;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 0.75rem;
                    padding: 2rem;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                ">
                    <h3 style="color: #3b82f6; margin: 0 0 1rem 0;">Edit Section</h3>
                    <textarea id="cms-edit-content" style="
                        width: 100%;
                        height: 300px;
                        background: #0f172a;
                        color: #f8fafc;
                        border: 1px solid rgba(59, 130, 246, 0.3);
                        border-radius: 0.5rem;
                        padding: 1rem;
                        font-family: 'Inter', sans-serif;
                        font-size: 0.9rem;
                        line-height: 1.6;
                        resize: vertical;
                    ">${section.innerHTML}</textarea>
                    <div style="margin-top: 1rem; text-align: right;">
                        <button id="cms-cancel-edit" style="
                            background: rgba(239, 68, 68, 0.2);
                            color: #fca5a5;
                            border: 1px solid rgba(239, 68, 68, 0.3);
                            padding: 0.5rem 1rem;
                            border-radius: 0.5rem;
                            cursor: pointer;
                            margin-right: 0.5rem;
                        ">Cancel</button>
                        <button id="cms-save-edit" style="
                            background: rgba(34, 197, 94, 0.2);
                            color: #22c55e;
                            border: 1px solid rgba(34, 197, 94, 0.3);
                            padding: 0.5rem 1rem;
                            border-radius: 0.5rem;
                            cursor: pointer;
                        ">Save</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        document.getElementById('cms-cancel-edit').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.getElementById('cms-save-edit').addEventListener('click', () => {
            const newContent = document.getElementById('cms-edit-content').value;
            section.innerHTML = newContent;
            document.body.removeChild(modal);
            this.showSaveNotification();
        });
    }

    /**
     * Save all changes to CMS
     */
    async saveAllChanges() {
        const sections = document.querySelectorAll('[data-cms-editable="true"]');
        const changes = {};

        sections.forEach(section => {
            const sectionId = section.getAttribute('data-cms-section');
            if (sectionId) {
                changes[sectionId] = section.innerHTML;
            }
        });

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(changes)
            });

            if (response.ok) {
                this.showSaveNotification('All changes saved successfully!');
            } else {
                this.showSaveNotification('Error saving changes', 'error');
            }
        } catch (error) {
            this.showSaveNotification('Error saving changes', 'error');
        }
    }

    /**
     * Show update notification
     */
    showUpdateNotification(message = 'Content updated!') {
        this.showNotification(message, 'info');
    }

    /**
     * Show save notification
     */
    showSaveNotification(message = 'Changes saved!', type = 'success') {
        this.showNotification(message, type);
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 
                        type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                        'rgba(59, 130, 246, 0.9)'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize Privacy Policy CMS when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new PrivacyPolicyCMS();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrivacyPolicyCMS;
}

