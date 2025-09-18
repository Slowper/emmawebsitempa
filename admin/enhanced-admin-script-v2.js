// Enhanced Admin Dashboard Script
// Comprehensive CMS functionality for complete website control

class EnhancedCMS {
    constructor() {
        this.apiBase = '/api/content';
        this.currentUser = null;
        this.eventListenersAttached = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Prevent multiple event listener attachments
        if (this.eventListenersAttached) {
            return;
        }
        
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Media upload
        const mediaUpload = document.getElementById('mediaUpload');
        const fileInput = document.getElementById('fileInput');

        mediaUpload.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e.files));

        // Drag and drop
        mediaUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            mediaUpload.classList.add('dragover');
        });

        mediaUpload.addEventListener('dragleave', () => {
            mediaUpload.classList.remove('dragover');
        });

        mediaUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            mediaUpload.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });

        // Real-time preview updates
        this.setupPreviewUpdates();

        // Blog form submission
        document.getElementById('blogFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBlogSubmit();
        });

        // Use case form submission
        document.getElementById('useCaseFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUseCaseSubmit();
        });

        // Case study form submission
        document.getElementById('caseStudyFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCaseStudySubmit();
        });

        // File upload handlers
        this.setupFileUploadHandlers();
        
        // Rich text editor
        this.setupRichTextEditor();
        
        // Mark event listeners as attached
        this.eventListenersAttached = true;
    }

    async checkAuth() {
        const token = localStorage.getItem('cms_token');
        if (token) {
            try {
                const response = await fetch(`${this.apiBase}/auth/verify`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    this.showDashboard();
                    this.loadAllContent();
                } else {
                    this.showLogin();
                }
            } catch (error) {
                this.showLogin();
            }
        } else {
            this.showLogin();
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('errorMessage');

        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('cms_token', data.token);
                this.currentUser = data.user;
                this.showDashboard();
                this.loadAllContent();
            } else {
                errorDiv.textContent = data.error || 'Login failed';
            }
        } catch (error) {
            errorDiv.textContent = 'Connection error. Please try again.';
        }
    }

    showLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
    }

    logout() {
        localStorage.removeItem('cms_token');
        this.currentUser = null;
        this.showLogin();
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionName).classList.add('active');

        // Add active class to clicked nav item
        event.target.classList.add('active');

        // Update header title
        const titles = {
            'homepage': 'Homepage Management',
            'pages': 'Page Management',
            'blogs': 'Blog Management',
            'usecases': 'Use Cases Management',
            'casestudies': 'Case Studies Management',
            'pricing': 'Pricing Plans Management',
            'resources': 'Resources Management',
            'media': 'Media Library',
            'theme': 'Theme Settings',
            'navigation': 'Navigation Management',
            'widgets': 'Widget Management',
            'seo': 'SEO Settings',
            'analytics': 'Analytics Dashboard',
            'forms': 'Contact Forms',
            'users': 'User Management',
            'settings': 'System Settings',
            'backup': 'Backup & Restore'
        };

        // Load content for specific sections
        if (sectionName === 'blogs') {
            this.loadBlogsContent();
        } else if (sectionName === 'usecases') {
            this.loadUseCasesContent();
        } else if (sectionName === 'casestudies') {
            this.loadCaseStudiesContent();
        } else if (sectionName === 'pricing') {
            loadPricingPlans();
            loadPricingSectionContent();
        } else if (sectionName === 'resources') {
            this.loadResourcesContent();
        }

        document.getElementById('currentSectionTitle').textContent = titles[sectionName] || 'Dashboard';

        // Load section-specific content
        this.loadSectionContent(sectionName);
    }

    setupRichTextEditor() {
        const editor = document.getElementById('blogContent');
        if (!editor) return;

        // Toolbar button functionality
        const toolbarButtons = document.querySelectorAll('.toolbar-btn');
        toolbarButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const command = button.dataset.command;
                const value = button.dataset.value;
                
                if (command === 'createLink') {
                    this.createLink();
                } else if (command === 'insertImage') {
                    this.insertImage();
                } else {
                    document.execCommand(command, false, value);
                }
                
                this.updateToolbarState();
            });
        });

        // Update toolbar state on selection change
        editor.addEventListener('keyup', () => this.updateToolbarState());
        editor.addEventListener('mouseup', () => this.updateToolbarState());
        editor.addEventListener('selectionchange', () => this.updateToolbarState());
    }

    updateToolbarState() {
        const editor = document.getElementById('blogContent');
        if (!editor) return;

        const toolbarButtons = document.querySelectorAll('.toolbar-btn');
        toolbarButtons.forEach(button => {
            const command = button.dataset.command;
            const value = button.dataset.value;
            
            if (command === 'formatBlock') {
                const isActive = document.queryCommandValue('formatBlock') === value;
                button.classList.toggle('active', isActive);
            } else if (command && command !== 'createLink' && command !== 'insertImage') {
                const isActive = document.queryCommandState(command);
                button.classList.toggle('active', isActive);
            }
        });
    }

    createLink() {
        const url = prompt('Enter URL:');
        if (url) {
            document.execCommand('createLink', false, url);
        }
    }

    insertImage() {
        const url = prompt('Enter image URL:');
        if (url) {
            document.execCommand('insertImage', false, url);
        }
    }

    async loadSectionContent(sectionName) {
        switch (sectionName) {
            case 'homepage':
                await this.loadHomepageContent();
                break;
            case 'navigation':
                await this.loadNavigationContent();
                break;
            case 'media':
                await this.loadMediaContent();
                break;
            case 'seo':
                await this.loadSEOContent();
                break;
            case 'theme':
                await this.loadThemeContent();
                break;
            case 'users':
                await this.loadUsersContent();
                break;
            case 'settings':
                await this.loadSettingsContent();
                break;
        }
    }

    async loadAllContent() {
        try {
            await Promise.all([
                this.loadHomepageContent(),
                this.loadNavigationContent(),
                this.loadStats()
            ]);
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    async loadHomepageContent() {
        try {
            const response = await fetch(`${this.apiBase}/hero`);
            if (response.ok) {
                const heroData = await response.json();
                this.populateHeroForm(heroData);
            }
        } catch (error) {
            console.error('Error loading hero content:', error);
        }
    }

    populateHeroForm(heroData) {
        document.getElementById('heroTitle').value = heroData.title || '';
        document.getElementById('heroSubtitle').value = heroData.subtitle || '';
        document.getElementById('heroDescription').value = heroData.description || '';
        document.getElementById('heroPrimaryBtn').value = heroData.primaryButton?.text || '';
        document.getElementById('heroPrimaryLink').value = heroData.primaryButton?.href || '';
        document.getElementById('heroSecondaryBtn').value = heroData.secondaryButton?.text || '';

        // Update preview
        this.updateHeroPreview(heroData);
    }

    updateHeroPreview(heroData) {
        document.getElementById('previewTitle').textContent = heroData.title || 'Meet Emma';
        document.getElementById('previewSubtitle').textContent = heroData.subtitle || 'Your Intelligent AI Assistant';
        document.getElementById('previewDescription').textContent = heroData.description || 'Built to Power the Future of Operations';
        document.getElementById('previewPrimaryBtn').textContent = heroData.primaryButton?.text || 'See Emma in Action';
        document.getElementById('previewSecondaryBtn').textContent = heroData.secondaryButton?.text || 'Watch Demo';
    }

    setupPreviewUpdates() {
        // Real-time preview updates
        const heroFields = ['heroTitle', 'heroSubtitle', 'heroDescription', 'heroPrimaryBtn', 'heroSecondaryBtn'];
        heroFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.addEventListener('input', () => {
                    this.updateHeroPreviewFromForm();
                });
            }
        });

        // Resources section preview updates
        const resourcesFields = ['resourcesTitle', 'resourcesSubtitle'];
        resourcesFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.addEventListener('input', () => {
                    this.updateResourcesPreview();
                });
            }
        });
    }

    updateHeroPreviewFromForm() {
        const heroData = {
            title: document.getElementById('heroTitle').value,
            subtitle: document.getElementById('heroSubtitle').value,
            description: document.getElementById('heroDescription').value,
            primaryButton: {
                text: document.getElementById('heroPrimaryBtn').value,
                href: document.getElementById('heroPrimaryLink').value
            },
            secondaryButton: {
                text: document.getElementById('heroSecondaryBtn').value,
                href: '#video'
            }
        };
        this.updateHeroPreview(heroData);
    }

    async saveHeroSection() {
        const heroData = {
            title: document.getElementById('heroTitle').value,
            subtitle: document.getElementById('heroSubtitle').value,
            description: document.getElementById('heroDescription').value,
            primaryButton: {
                text: document.getElementById('heroPrimaryBtn').value,
                href: document.getElementById('heroPrimaryLink').value
            },
            secondaryButton: {
                text: document.getElementById('heroSecondaryBtn').value,
                href: '#video',
                show: document.getElementById('heroSecondaryBtn').value.length > 0
            }
        };

        try {
            const response = await fetch(`${this.apiBase}/hero`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(heroData)
            });

            if (response.ok) {
                this.showSuccess('Hero section updated successfully!');
                // Trigger live update on main website
                if (window.parent && window.parent.dynamicContent) {
                    window.parent.dynamicContent.refreshHero();
                }
            } else {
                this.showError('Failed to update hero section');
            }
        } catch (error) {
            this.showError('Error updating hero section');
        }
    }

    async loadNavigationContent() {
        try {
            const response = await fetch(`${this.apiBase}/navigation`);
            if (response.ok) {
                const navData = await response.json();
                document.getElementById('navLinksInput').value = JSON.stringify(navData.links, null, 2);
            }
        } catch (error) {
            console.error('Error loading navigation:', error);
        }
    }

    async saveNavigation() {
        try {
            const navData = JSON.parse(document.getElementById('navLinksInput').value);
            const response = await fetch(`${this.apiBase}/navigation`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ links: navData })
            });

            if (response.ok) {
                this.showSuccess('Navigation updated successfully!');
                // Trigger live update on main website
                if (window.parent && window.parent.dynamicContent) {
                    window.parent.dynamicContent.refresh();
                }
            } else {
                this.showError('Failed to update navigation');
            }
        } catch (error) {
            this.showError('Invalid JSON format');
        }
    }

    async loadMediaContent() {
        // Load existing media files
        try {
            const response = await fetch(`${this.apiBase}/media`);
            if (response.ok) {
                const mediaFiles = await response.json();
                this.displayMediaFiles(mediaFiles);
            }
        } catch (error) {
            console.error('Error loading media:', error);
        }
    }

    async handleFileUpload(files) {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch(`${this.apiBase}/media/upload`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                this.showSuccess('Files uploaded successfully!');
                this.loadMediaContent();
            } else {
                this.showError('Failed to upload files');
            }
        } catch (error) {
            this.showError('Error uploading files');
        }
    }

    displayMediaFiles(files) {
        const container = document.getElementById('uploadedFiles');
        container.innerHTML = '';

        files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.className = 'media-file';
            fileElement.innerHTML = `
                <img src="${file.url}" alt="${file.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                <div>
                    <h4>${file.name}</h4>
                    <p>${file.size} • ${file.type}</p>
                    <button onclick="copyUrl('${file.url}')" class="btn btn-secondary btn-sm">Copy URL</button>
                    <button onclick="deleteFile('${file.id}')" class="btn btn-danger btn-sm">Delete</button>
                </div>
            `;
            container.appendChild(fileElement);
        });
    }

    async loadSEOContent() {
        try {
            const response = await fetch(`${this.apiBase}/seo`);
            if (response.ok) {
                const seoData = await response.json();
                document.getElementById('metaTitle').value = seoData.title || '';
                document.getElementById('metaDescription').value = seoData.description || '';
                document.getElementById('metaKeywords').value = seoData.keywords || '';
            }
        } catch (error) {
            console.error('Error loading SEO content:', error);
        }
    }

    async saveSEOSettings() {
        const seoData = {
            title: document.getElementById('metaTitle').value,
            description: document.getElementById('metaDescription').value,
            keywords: document.getElementById('metaKeywords').value
        };

        try {
            const response = await fetch(`${this.apiBase}/seo`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(seoData)
            });

            if (response.ok) {
                this.showSuccess('SEO settings updated successfully!');
            } else {
                this.showError('Failed to update SEO settings');
            }
        } catch (error) {
            this.showError('Error updating SEO settings');
        }
    }

    async loadThemeContent() {
        try {
            const response = await fetch(`${this.apiBase}/theme`);
            if (response.ok) {
                const themeData = await response.json();
                document.getElementById('primaryColor').value = themeData.primaryColor || '#667eea';
                document.getElementById('secondaryColor').value = themeData.secondaryColor || '#764ba2';
                document.getElementById('accentColor').value = themeData.accentColor || '#48bb78';
            }
        } catch (error) {
            console.error('Error loading theme content:', error);
        }
    }

    async saveThemeSettings() {
        const themeData = {
            primaryColor: document.getElementById('primaryColor').value,
            secondaryColor: document.getElementById('secondaryColor').value,
            accentColor: document.getElementById('accentColor').value
        };

        try {
            const response = await fetch(`${this.apiBase}/theme`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(themeData)
            });

            if (response.ok) {
                this.showSuccess('Theme settings updated successfully!');
                // Apply theme changes immediately
                this.applyTheme(themeData);
            } else {
                this.showError('Failed to update theme settings');
            }
        } catch (error) {
            this.showError('Error updating theme settings');
        }
    }

    applyTheme(themeData) {
        // Apply theme changes to the main website
        if (window.parent && window.parent.document) {
            const style = window.parent.document.createElement('style');
            style.textContent = `
                :root {
                    --primary-color: ${themeData.primaryColor};
                    --secondary-color: ${themeData.secondaryColor};
                    --accent-color: ${themeData.accentColor};
                }
            `;
            window.parent.document.head.appendChild(style);
        }
    }

    async loadUsersContent() {
        try {
            const response = await fetch(`${this.apiBase}/users`);
            if (response.ok) {
                const users = await response.json();
                this.displayUsers(users);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    displayUsers(users) {
        const tbody = document.getElementById('usersTable');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="status-indicator ${user.role === 'admin' ? 'status-live' : 'status-draft'}">${user.role}</span></td>
                <td>${user.lastLogin || 'Never'}</td>
                <td>
                    <button onclick="editUser('${user.id}')" class="btn btn-secondary btn-sm">Edit</button>
                    <button onclick="deleteUser('${user.id}')" class="btn btn-danger btn-sm">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadSettingsContent() {
        try {
            const response = await fetch(`${this.apiBase}/settings`);
            if (response.ok) {
                const settings = await response.json();
                document.getElementById('siteName').value = settings.siteName || '';
                document.getElementById('siteDescription').value = settings.siteDescription || '';
                document.getElementById('siteUrl').value = settings.siteUrl || '';
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async saveGeneralSettings() {
        const settings = {
            siteName: document.getElementById('siteName').value,
            siteDescription: document.getElementById('siteDescription').value,
            siteUrl: document.getElementById('siteUrl').value
        };

        try {
            const response = await fetch(`${this.apiBase}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                this.showSuccess('Settings updated successfully!');
            } else {
                this.showError('Failed to update settings');
            }
        } catch (error) {
            this.showError('Error updating settings');
        }
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.apiBase}/stats`);
            if (response.ok) {
                const stats = await response.json();
                document.getElementById('totalSections').textContent = stats.totalSections || 8;
                document.getElementById('lastUpdated').textContent = stats.lastUpdated || '2 min ago';
                document.getElementById('pageViews').textContent = stats.pageViews || '1,234';
                document.getElementById('conversionRate').textContent = stats.conversionRate || '3.2%';
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    showSuccess(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'success-message';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'error-message';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f56565;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showLoading() {
        // Create loading overlay
        let loadingDiv = document.getElementById('loading');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading';
            loadingDiv.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;
            loadingDiv.innerHTML = `
                <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                    <div>Loading...</div>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            `;
            document.body.appendChild(loadingDiv);
        }
        loadingDiv.style.display = 'flex';
    }

    hideLoading() {
        const loadingDiv = document.getElementById('loading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }

    // Additional utility functions
    addFeature() {
        const featuresList = document.getElementById('featuresList');
        const featureDiv = document.createElement('div');
        featureDiv.className = 'feature-item';
        featureDiv.innerHTML = `
            <div class="form-grid">
                <div class="form-group">
                    <label>Feature Title</label>
                    <input type="text" class="feature-title" placeholder="Enter feature title">
                </div>
                <div class="form-group">
                    <label>Feature Description</label>
                    <textarea class="feature-description" placeholder="Enter feature description"></textarea>
                </div>
                <div class="form-group">
                    <label>Feature Icon</label>
                    <input type="text" class="feature-icon" placeholder="Enter icon class (e.g., fas fa-star)">
                </div>
            </div>
            <button onclick="removeFeature(this)" class="btn btn-danger btn-sm">Remove Feature</button>
        `;
        featuresList.appendChild(featureDiv);
    }

    removeFeature(button) {
        button.parentElement.remove();
    }

    async saveFeatures() {
        const features = [];
        document.querySelectorAll('.feature-item').forEach(item => {
            const title = item.querySelector('.feature-title').value;
            const description = item.querySelector('.feature-description').value;
            const icon = item.querySelector('.feature-icon').value;
            
            if (title && description) {
                features.push({ title, description, icon });
            }
        });

        try {
            const response = await fetch(`${this.apiBase}/features`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features })
            });

            if (response.ok) {
                this.showSuccess('Features updated successfully!');
            } else {
                this.showError('Failed to update features');
            }
        } catch (error) {
            this.showError('Error updating features');
        }
    }

    async saveAboutSection() {
        const aboutData = {
            title: document.getElementById('aboutTitle').value,
            description: document.getElementById('aboutDescription').value
        };

        try {
            const response = await fetch(`${this.apiBase}/about`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aboutData)
            });

            if (response.ok) {
                this.showSuccess('About section updated successfully!');
            } else {
                this.showError('Failed to update about section');
            }
        } catch (error) {
            this.showError('Error updating about section');
        }
    }

    copyUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            this.showSuccess('URL copied to clipboard!');
        });
    }

    async deleteFile(fileId) {
        if (confirm('Are you sure you want to delete this file?')) {
            try {
                const response = await fetch(`${this.apiBase}/media/${fileId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    this.showSuccess('File deleted successfully!');
                    this.loadMediaContent();
                } else {
                    this.showError('Failed to delete file');
                }
            } catch (error) {
                this.showError('Error deleting file');
            }
        }
    }

    addUser() {
        // Open add user modal or form
        const username = prompt('Enter username:');
        const email = prompt('Enter email:');
        const password = prompt('Enter password:');
        const role = prompt('Enter role (admin/editor):');

        if (username && email && password && role) {
            this.createUser({ username, email, password, role });
        }
    }

    async createUser(userData) {
        try {
            const response = await fetch(`${this.apiBase}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                this.showSuccess('User created successfully!');
                this.loadUsersContent();
            } else {
                this.showError('Failed to create user');
            }
        } catch (error) {
            this.showError('Error creating user');
        }
    }

    editUser(userId) {
        // Open edit user modal
        console.log('Edit user:', userId);
    }

    async deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`${this.apiBase}/users/${userId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    this.showSuccess('User deleted successfully!');
                    this.loadUsersContent();
                } else {
                    this.showError('Failed to delete user');
                }
            } catch (error) {
                this.showError('Error deleting user');
            }
        }
    }

    // Blog Management Methods
    async loadBlogsContent() {
        try {
            const response = await fetch(`${this.apiBase}/blogs`);
            if (response.ok) {
                const blogs = await response.json();
                this.displayBlogs(blogs);
            }
        } catch (error) {
            console.error('Error loading blogs:', error);
        }
    }

    displayBlogs(blogs) {
        const tbody = document.getElementById('blogsTableBody');
        if (!tbody) return;

        tbody.innerHTML = blogs.map(blog => `
            <tr>
                <td>${blog.title}</td>
                <td><span class="status-indicator status-live">${blog.category}</span></td>
                <td>${blog.author}</td>
                <td>${blog.date}</td>
                <td><span class="status-indicator status-live">Published</span></td>
                <td>
                    <button onclick="editBlog(${blog.id})" class="btn btn-secondary btn-sm">Edit</button>
                    <button onclick="deleteBlog(${blog.id})" class="btn btn-danger btn-sm">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    async editBlog(blogId) {
        try {
            const response = await fetch(`${this.apiBase}/blogs/${blogId}`);
            if (response.ok) {
                const blog = await response.json();
                this.populateBlogForm(blog);
                document.getElementById('blogForm').style.display = 'block';
                document.getElementById('blogFormTitle').textContent = 'Edit Blog Post';
                document.getElementById('blogFormElement').dataset.mode = 'edit';
                document.getElementById('blogFormElement').dataset.id = blogId;
            } else {
                this.showError('Failed to load blog');
            }
        } catch (error) {
            this.showError('Error loading blog');
        }
    }

    populateBlogForm(blog) {
        document.getElementById('blogTitle').value = blog.title || '';
        document.getElementById('blogCategory').value = blog.category || '';
        document.getElementById('blogAuthor').value = blog.author || '';
        document.getElementById('blogExcerpt').value = blog.excerpt || '';
        
        // Don't set file input values - they can only be set to empty string
        // Instead, show the current image URLs in a preview or placeholder
        const blogImageInput = document.getElementById('blogImage');
        const blogAuthorImageInput = document.getElementById('blogAuthorImage');
        
        // Clear file inputs
        if (blogImageInput) blogImageInput.value = '';
        if (blogAuthorImageInput) blogAuthorImageInput.value = '';
        
        // Set content and gallery (text areas)
        document.getElementById('blogContent').innerHTML = blog.content || '';
        document.getElementById('blogGallery').value = blog.gallery ? blog.gallery.join('\n') : '';
    }

    async deleteBlog(blogId) {
        try {
            const response = await fetch(`${this.apiBase}/blogs/${blogId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showSuccess('Blog deleted successfully!');
                this.loadBlogsContent();
            } else {
                this.showError('Failed to delete blog');
            }
        } catch (error) {
            this.showError('Error deleting blog');
        }
    }

    // Use Case Management Methods
    async loadUseCasesContent() {
        try {
            const response = await fetch(`${this.apiBase}/usecases`);
            if (response.ok) {
                const useCases = await response.json();
                this.displayUseCases(useCases);
            }
        } catch (error) {
            console.error('Error loading use cases:', error);
        }
    }

    displayUseCases(useCases) {
        const tbody = document.getElementById('useCasesTableBody');
        if (!tbody) return;

        tbody.innerHTML = useCases.map(useCase => `
            <tr>
                <td>${useCase.title}</td>
                <td><span class="status-indicator status-live">${useCase.industry}</span></td>
                <td>${useCase.tags.join(', ')}</td>
                <td><span class="status-indicator status-live">Published</span></td>
                <td>
                    <button onclick="editUseCase(${useCase.id})" class="btn btn-secondary btn-sm">Edit</button>
                    <button onclick="deleteUseCase(${useCase.id})" class="btn btn-danger btn-sm">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    async editUseCase(useCaseId) {
        try {
            const response = await fetch(`${this.apiBase}/usecases/${useCaseId}`);
            if (response.ok) {
                const useCase = await response.json();
                this.populateUseCaseForm(useCase);
                document.getElementById('useCaseForm').style.display = 'block';
                document.getElementById('useCaseFormTitle').textContent = 'Edit Use Case';
                document.getElementById('useCaseFormElement').dataset.mode = 'edit';
                document.getElementById('useCaseFormElement').dataset.id = useCaseId;
            } else {
                this.showError('Failed to load use case');
            }
        } catch (error) {
            this.showError('Error loading use case');
        }
    }

    populateUseCaseForm(useCase) {
        document.getElementById('useCaseTitle').value = useCase.title || '';
        document.getElementById('useCaseIndustry').value = useCase.industry || '';
        document.getElementById('useCaseIcon').value = useCase.icon || '';
        document.getElementById('useCaseDescription').value = useCase.description || '';
        document.getElementById('useCaseTags').value = useCase.tags ? useCase.tags.join(', ') : '';
        document.getElementById('useCaseStat1Number').value = useCase.stats && useCase.stats[0] ? useCase.stats[0].number : '';
        document.getElementById('useCaseStat1Label').value = useCase.stats && useCase.stats[0] ? useCase.stats[0].label : '';
        document.getElementById('useCaseStat2Number').value = useCase.stats && useCase.stats[1] ? useCase.stats[1].number : '';
        document.getElementById('useCaseStat2Label').value = useCase.stats && useCase.stats[1] ? useCase.stats[1].label : '';
        document.getElementById('useCaseContent').value = useCase.detailedContent || '';
        
        // Don't set file input values - they can only be set to empty string
        const useCaseGalleryInput = document.getElementById('useCaseGallery');
        if (useCaseGalleryInput) useCaseGalleryInput.value = '';
    }

    async deleteUseCase(useCaseId) {
        try {
            const response = await fetch(`${this.apiBase}/usecases/${useCaseId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showSuccess('Use case deleted successfully!');
                this.loadUseCasesContent();
            } else {
                this.showError('Failed to delete use case');
            }
        } catch (error) {
            this.showError('Error deleting use case');
        }
    }

    // Case Studies Management Methods
    async loadCaseStudiesContent() {
        try {
            const response = await fetch(`${this.apiBase}/casestudies`);
            if (response.ok) {
                const caseStudies = await response.json();
                this.displayCaseStudies(caseStudies);
            }
        } catch (error) {
            console.error('Error loading case studies:', error);
        }
    }

    // Resources Management Methods
    async loadResourcesContent() {
        try {
            // Load resources section content
            const [resourcesResponse, blogsResponse, useCasesResponse, caseStudiesResponse] = await Promise.all([
                fetch(`${this.apiBase}/section/resources_title`),
                fetch(`${this.apiBase}/blogs`),
                fetch(`${this.apiBase}/usecases`),
                fetch(`${this.apiBase}/casestudies`)
            ]);

            // Load section content
            if (resourcesResponse.ok) {
                const resourcesData = await resourcesResponse.json();
                document.getElementById('resourcesTitle').value = resourcesData.content || 'Resources';
            }

            // Load statistics and display resources
            let totalBlogs = 0, totalUseCases = 0, totalCaseStudies = 0;
            let allResources = [];
            
            if (blogsResponse.ok) {
                const blogs = await blogsResponse.json();
                totalBlogs = blogs.length;
                // Add blogs to resources list
                blogs.forEach(blog => {
                    allResources.push({
                        id: blog.id,
                        title: blog.title,
                        category: blog.category,
                        author: blog.author,
                        date: blog.date,
                        type: 'Blog',
                        status: 'Published'
                    });
                });
            }
            
            if (useCasesResponse.ok) {
                const useCases = await useCasesResponse.json();
                totalUseCases = useCases.length;
                // Add use cases to resources list
                useCases.forEach(useCase => {
                    allResources.push({
                        id: useCase.id,
                        title: useCase.title,
                        category: useCase.industry,
                        author: 'Admin',
                        date: useCase.date || new Date().toISOString().split('T')[0],
                        type: 'Use Case',
                        status: 'Published'
                    });
                });
            }
            
            if (caseStudiesResponse.ok) {
                const caseStudies = await caseStudiesResponse.json();
                totalCaseStudies = caseStudies.length;
                // Add case studies to resources list
                caseStudies.forEach(caseStudy => {
                    allResources.push({
                        id: caseStudy.id,
                        title: caseStudy.title,
                        category: caseStudy.industry,
                        author: 'Admin',
                        date: caseStudy.date || new Date().toISOString().split('T')[0],
                        type: 'Case Study',
                        status: caseStudy.published ? 'Published' : 'Draft'
                    });
                });
            }

            // Update statistics
            document.getElementById('totalBlogs').textContent = totalBlogs;
            document.getElementById('totalUseCases').textContent = totalUseCases;
            document.getElementById('totalCaseStudies').textContent = totalCaseStudies;
            document.getElementById('totalResources').textContent = allResources.length;

            // Display resources in table
            this.displayResources(allResources);
            this.updateResourcesPreview();

        } catch (error) {
            console.error('Error loading resources content:', error);
        }
    }

    displayResources(resources) {
        const resourcesTable = document.getElementById('resourcesTable');
        if (!resourcesTable) return;

        resourcesTable.innerHTML = resources.map(resource => `
            <tr>
                <td>${resource.title}</td>
                <td><span class="status-indicator status-live">${resource.category}</span></td>
                <td>${resource.author}</td>
                <td>${resource.date}</td>
                <td><span class="status-indicator ${resource.status === 'Published' ? 'status-live' : 'status-draft'}">${resource.status}</span></td>
                <td>
                    <button onclick="editResource('${resource.type}', ${resource.id})" class="btn btn-secondary btn-sm">Edit</button>
                    <button onclick="deleteResource('${resource.type}', ${resource.id})" class="btn btn-danger btn-sm">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    updateResourcesPreview() {
        const title = document.getElementById('resourcesTitle').value || 'Resources';
        const subtitle = document.getElementById('resourcesSubtitle').value || 'Discover insights, use cases, and best practices';
        
        document.getElementById('previewResourcesTitle').textContent = title;
        document.getElementById('previewResourcesSubtitle').textContent = subtitle;
    }

    async saveResourcesSection() {
        try {
            const title = document.getElementById('resourcesTitle').value;
            const subtitle = document.getElementById('resourcesSubtitle').value;

            const response = await fetch(`${this.apiBase}/section/resources_title`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: title })
            });

            if (response.ok) {
                showSuccess('Resources section updated successfully!');
                this.updateResourcesPreview();
            } else {
                showError('Failed to update resources section');
            }
        } catch (error) {
            console.error('Error saving resources section:', error);
            showError('Error saving resources section');
        }
    }

    displayCaseStudies(caseStudies) {
        const tbody = document.getElementById('caseStudiesTableBody');
        if (!tbody) return;

        tbody.innerHTML = caseStudies.map(caseStudy => `
            <tr>
                <td>${caseStudy.title}</td>
                <td>${caseStudy.client}</td>
                <td><span class="status-indicator status-live">${caseStudy.industry}</span></td>
                <td>${caseStudy.date}</td>
                <td><span class="status-indicator ${caseStudy.published ? 'status-live' : 'status-draft'}">${caseStudy.published ? 'Published' : 'Draft'}</span></td>
                <td>
                    <button onclick="editCaseStudy(${caseStudy.id})" class="btn btn-sm btn-primary">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteCaseStudy(${caseStudy.id})" class="btn btn-sm btn-danger">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async editCaseStudy(caseStudyId) {
        try {
            const response = await fetch(`${this.apiBase}/casestudies/${caseStudyId}`);
            if (response.ok) {
                const caseStudy = await response.json();
                this.populateCaseStudyForm(caseStudy);
                document.getElementById('caseStudyForm').style.display = 'block';
                document.getElementById('caseStudyFormTitle').textContent = 'Edit Case Study';
                document.getElementById('caseStudyFormElement').dataset.mode = 'edit';
                document.getElementById('caseStudyFormElement').dataset.id = caseStudyId;
            } else {
                this.showError('Failed to load case study');
            }
        } catch (error) {
            this.showError('Error loading case study');
        }
    }

    populateCaseStudyForm(caseStudy) {
        document.getElementById('caseStudyTitle').value = caseStudy.title || '';
        document.getElementById('caseStudyClient').value = caseStudy.client || '';
        document.getElementById('caseStudyIndustry').value = caseStudy.industry || '';
        document.getElementById('caseStudyDate').value = caseStudy.date || '';
        document.getElementById('caseStudySummary').value = caseStudy.summary || '';
        document.getElementById('caseStudyTags').value = caseStudy.tags ? caseStudy.tags.join(', ') : '';
        document.getElementById('caseStudyResult1Number').value = caseStudy.results && caseStudy.results[0] ? caseStudy.results[0].number : '';
        document.getElementById('caseStudyResult1Label').value = caseStudy.results && caseStudy.results[0] ? caseStudy.results[0].label : '';
        document.getElementById('caseStudyResult2Number').value = caseStudy.results && caseStudy.results[1] ? caseStudy.results[1].number : '';
        document.getElementById('caseStudyResult2Label').value = caseStudy.results && caseStudy.results[1] ? caseStudy.results[1].label : '';
        document.getElementById('caseStudyResult3Number').value = caseStudy.results && caseStudy.results[2] ? caseStudy.results[2].number : '';
        document.getElementById('caseStudyResult3Label').value = caseStudy.results && caseStudy.results[2] ? caseStudy.results[2].label : '';
        document.getElementById('caseStudyContent').value = caseStudy.content || '';
        
        // Don't set file input values - they can only be set to empty string
        const caseStudyImageInput = document.getElementById('caseStudyImage');
        const caseStudyGalleryInput = document.getElementById('caseStudyGallery');
        
        // Clear file inputs
        if (caseStudyImageInput) caseStudyImageInput.value = '';
        if (caseStudyGalleryInput) caseStudyGalleryInput.value = '';
    }

    async deleteCaseStudy(caseStudyId) {
        try {
            const response = await fetch(`${this.apiBase}/casestudies/${caseStudyId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showSuccess('Case study deleted successfully!');
                this.loadCaseStudiesContent();
            } else {
                this.showError('Failed to delete case study');
            }
        } catch (error) {
            this.showError('Error deleting case study');
        }
    }

    // Form Submission Handlers
    async handleBlogSubmit() {
        const form = document.getElementById('blogFormElement');
        const mode = form.dataset.mode;
        const blogId = form.dataset.id;

        const formData = new FormData();
        formData.append('title', document.getElementById('blogTitle').value);
        formData.append('category', document.getElementById('blogCategory').value);
        formData.append('author', document.getElementById('blogAuthor').value);
        formData.append('excerpt', document.getElementById('blogExcerpt').value);
        formData.append('content', document.getElementById('blogContent').innerHTML);
        formData.append('gallery', document.getElementById('blogGallery').value.split('\n').filter(url => url.trim()).join('\n'));

        // Add file uploads
        const blogImageInput = document.getElementById('blogImage');
        const blogAuthorImageInput = document.getElementById('blogAuthorImage');
        const blogGalleryInput = document.getElementById('blogGallery');

        if (blogImageInput && blogImageInput.files && blogImageInput.files[0]) {
            formData.append('blogImage', blogImageInput.files[0]);
        }
        if (blogAuthorImageInput && blogAuthorImageInput.files && blogAuthorImageInput.files[0]) {
            formData.append('blogAuthorImage', blogAuthorImageInput.files[0]);
        }
        if (blogGalleryInput && blogGalleryInput.files && blogGalleryInput.files.length > 0) {
            Array.from(blogGalleryInput.files).forEach(file => {
                formData.append('blogGallery', file);
            });
        }

        try {
            const url = mode === 'edit' ? `${this.apiBase}/blogs/${blogId}` : `${this.apiBase}/blogs`;
            const method = mode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: formData
            });

            if (response.ok) {
                this.showSuccess(`Blog ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
                this.loadBlogsContent();
                this.hideBlogForm();
            } else {
                this.showError(`Failed to ${mode === 'edit' ? 'update' : 'create'} blog`);
            }
        } catch (error) {
            this.showError(`Error ${mode === 'edit' ? 'updating' : 'creating'} blog`);
        }
    }

    async handleUseCaseSubmit() {
        const form = document.getElementById('useCaseFormElement');
        const mode = form.dataset.mode;
        const useCaseId = form.dataset.id;

        const formData = new FormData();
        formData.append('title', document.getElementById('useCaseTitle').value);
        formData.append('industry', document.getElementById('useCaseIndustry').value);
        formData.append('icon', document.getElementById('useCaseIcon').value);
        formData.append('description', document.getElementById('useCaseDescription').value);
        formData.append('tags', document.getElementById('useCaseTags').value.split(',').map(tag => tag.trim()).join(','));
        formData.append('stats', JSON.stringify([
            {
                number: document.getElementById('useCaseStat1Number').value,
                label: document.getElementById('useCaseStat1Label').value
            },
            {
                number: document.getElementById('useCaseStat2Number').value,
                label: document.getElementById('useCaseStat2Label').value
            }
        ].filter(stat => stat.number && stat.label)));
        formData.append('detailedContent', document.getElementById('useCaseContent').value);

        // Add file uploads
        const useCaseGalleryInput = document.getElementById('useCaseGallery');
        if (useCaseGalleryInput && useCaseGalleryInput.files && useCaseGalleryInput.files.length > 0) {
            Array.from(useCaseGalleryInput.files).forEach(file => {
                formData.append('useCaseGallery', file);
            });
        }

        try {
            const url = mode === 'edit' ? `${this.apiBase}/usecases/${useCaseId}` : `${this.apiBase}/usecases`;
            const method = mode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: formData
            });

            if (response.ok) {
                this.showSuccess(`Use case ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
                this.loadUseCasesContent();
                this.hideUseCaseForm();
            } else {
                this.showError(`Failed to ${mode === 'edit' ? 'update' : 'create'} use case`);
            }
        } catch (error) {
            this.showError(`Error ${mode === 'edit' ? 'updating' : 'creating'} use case`);
        }
    }

    async handleCaseStudySubmit() {
        const form = document.getElementById('caseStudyFormElement');
        const mode = form.dataset.mode;
        const caseStudyId = form.dataset.id;

        const formData = new FormData();
        formData.append('title', document.getElementById('caseStudyTitle').value);
        formData.append('client', document.getElementById('caseStudyClient').value);
        formData.append('industry', document.getElementById('caseStudyIndustry').value);
        formData.append('date', document.getElementById('caseStudyDate').value);
        formData.append('summary', document.getElementById('caseStudySummary').value);
        formData.append('tags', document.getElementById('caseStudyTags').value.split(',').map(tag => tag.trim()).join(','));
        formData.append('results', JSON.stringify([
            {
                number: document.getElementById('caseStudyResult1Number').value,
                label: document.getElementById('caseStudyResult1Label').value
            },
            {
                number: document.getElementById('caseStudyResult2Number').value,
                label: document.getElementById('caseStudyResult2Label').value
            },
            {
                number: document.getElementById('caseStudyResult3Number').value,
                label: document.getElementById('caseStudyResult3Label').value
            }
        ].filter(result => result.number && result.label)));
        formData.append('content', document.getElementById('caseStudyContent').value);

        // Add file uploads
        const caseStudyImageInput = document.getElementById('caseStudyImage');
        const caseStudyGalleryInput = document.getElementById('caseStudyGallery');

        if (caseStudyImageInput && caseStudyImageInput.files && caseStudyImageInput.files[0]) {
            formData.append('caseStudyImage', caseStudyImageInput.files[0]);
        }
        if (caseStudyGalleryInput && caseStudyGalleryInput.files && caseStudyGalleryInput.files.length > 0) {
            Array.from(caseStudyGalleryInput.files).forEach(file => {
                formData.append('caseStudyGallery', file);
            });
        }

        try {
            const url = mode === 'edit' ? `${this.apiBase}/casestudies/${caseStudyId}` : `${this.apiBase}/casestudies`;
            const method = mode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                body: formData
            });

            if (response.ok) {
                this.showSuccess(`Case study ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
                this.loadCaseStudiesContent();
                this.hideCaseStudyForm();
            } else {
                this.showError(`Failed to ${mode === 'edit' ? 'update' : 'create'} case study`);
            }
        } catch (error) {
            this.showError(`Error ${mode === 'edit' ? 'updating' : 'creating'} case study`);
        }
    }

    hideBlogForm() {
        document.getElementById('blogForm').style.display = 'none';
    }

    hideUseCaseForm() {
        document.getElementById('useCaseForm').style.display = 'none';
    }

    hideCaseStudyForm() {
        document.getElementById('caseStudyForm').style.display = 'none';
    }

    removeCaseStudyImage() {
        document.getElementById('caseStudyImage').value = '';
        document.getElementById('caseStudyImagePreview').style.display = 'none';
    }

    // File Upload Methods
    setupFileUploadHandlers() {
        // Blog image upload
        const blogImageInput = document.getElementById('blogImage');
        if (blogImageInput) {
            blogImageInput.addEventListener('change', (e) => this.handleImageUpload(e, 'blogImage'));
        }

        // Blog author image upload
        const blogAuthorImageInput = document.getElementById('blogAuthorImage');
        if (blogAuthorImageInput) {
            blogAuthorImageInput.addEventListener('change', (e) => this.handleImageUpload(e, 'blogAuthorImage'));
        }

        // Use case gallery upload
        const useCaseGalleryInput = document.getElementById('useCaseGallery');
        if (useCaseGalleryInput) {
            useCaseGalleryInput.addEventListener('change', (e) => this.handleGalleryUpload(e));
        }
    }

    handleImageUpload(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showError('Image size must be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewContainer = document.getElementById(`${type}Preview`);
            const previewImg = document.getElementById(`${type}PreviewImg`);
            
            if (previewContainer && previewImg) {
                previewImg.src = e.target.result;
                previewContainer.style.display = 'block';
                document.querySelector(`#${type}`).parentElement.querySelector('.file-upload-area').style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    }

    handleGalleryUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Validate files
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                this.showError(`${file.name} is not a valid image file`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                this.showError(`${file.name} is too large (max 5MB)`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Create previews
        const previewContainer = document.getElementById('useCaseGalleryPreview');
        if (!previewContainer) return;

        previewContainer.innerHTML = '';
        previewContainer.style.display = 'block';

        validFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.innerHTML = `
                    <img src="${e.target.result}" alt="Gallery image ${index + 1}">
                    <button type="button" class="remove-file-btn" onclick="removeGalleryImage(this)">×</button>
                `;
                previewContainer.appendChild(galleryItem);
            };
            reader.readAsDataURL(file);
        });

        // Hide upload area
        document.querySelector('#useCaseGallery').parentElement.querySelector('.file-upload-area').style.display = 'none';
    }

    // Helper methods for file management
    removeBlogImage() {
        const input = document.getElementById('blogImage');
        const preview = document.getElementById('blogImagePreview');
        const uploadArea = input.parentElement.querySelector('.file-upload-area');
        
        input.value = '';
        preview.style.display = 'none';
        uploadArea.style.display = 'block';
    }

    removeBlogAuthorImage() {
        const input = document.getElementById('blogAuthorImage');
        const preview = document.getElementById('blogAuthorImagePreview');
        const uploadArea = input.parentElement.querySelector('.file-upload-area');
        
        input.value = '';
        preview.style.display = 'none';
        uploadArea.style.display = 'block';
    }

    removeGalleryImage(button) {
        button.parentElement.remove();
        
        // Show upload area if no images left
        const previewContainer = document.getElementById('useCaseGalleryPreview');
        if (previewContainer.children.length === 0) {
            previewContainer.style.display = 'none';
            document.querySelector('#useCaseGallery').parentElement.querySelector('.file-upload-area').style.display = 'block';
        }
    }
}

// Global functions for HTML onclick handlers
let cms;

// Logo Management Functions
function updateLogoPreview() {
    const logoUrl = document.getElementById('logoUrl').value;
    const logoAlt = document.getElementById('logoAltText').value;
    const logoPreview = document.getElementById('logoPreview');
    const logoFallbackPreview = document.getElementById('logoFallbackPreview');
    
    if (logoUrl) {
        logoPreview.src = logoUrl;
        logoPreview.alt = logoAlt || 'Logo Preview';
        logoPreview.style.display = 'block';
        logoFallbackPreview.style.display = 'none';
    } else {
        logoPreview.style.display = 'none';
        logoFallbackPreview.style.display = 'flex';
    }
}

async function saveLogoSettings() {
    const logoUrl = document.getElementById('logoUrl').value;
    const logoAlt = document.getElementById('logoAltText').value;
    
    if (!logoUrl) {
        showError('Please enter a logo URL');
        return;
    }
    
    try {
        showLoading();
        
        // Save logo URL
        await fetch('/api/settings/logo_url', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('cms_token')}`
            },
            body: JSON.stringify({ value: logoUrl, type: 'text' })
        });
        
        // Save logo alt text
        await fetch('/api/settings/logo_alt_text', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('cms_token')}`
            },
            body: JSON.stringify({ value: logoAlt, type: 'text' })
        });
        
        showSuccess('Logo settings saved successfully!');
        
    } catch (error) {
        console.error('Error saving logo settings:', error);
        showError('Failed to save logo settings');
    } finally {
        hideLoading();
    }
}

async function uploadLogo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            showLoading();
            
            const formData = new FormData();
            formData.append('logo', file);
            
            const response = await fetch('/api/upload/logo', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cms_token')}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            const result = await response.json();
            
            // Update the logo URL field
            document.getElementById('logoUrl').value = result.url;
            updateLogoPreview();
            
            showSuccess('Logo uploaded successfully!');
            
        } catch (error) {
            console.error('Error uploading logo:', error);
            showError('Failed to upload logo');
        } finally {
            hideLoading();
        }
    };
    
    input.click();
}

async function loadLogoSettings() {
    try {
        const response = await fetch('/api/settings', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('cms_token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load settings');
        }
        
        const settings = await response.json();
        
        // Handle the API response format
        if (settings.logo_url) {
            document.getElementById('logoUrl').value = settings.logo_url.value || '';
        }
        
        if (settings.logo_alt_text) {
            document.getElementById('logoAltText').value = settings.logo_alt_text.value || '';
        }
        
        updateLogoPreview();
        
    } catch (error) {
        console.error('Error loading logo settings:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cms = new EnhancedCMS();
    
    // Load logo settings when settings section is shown
    const settingsLink = document.querySelector('a[onclick="showSection(\'settings\')"]');
    if (settingsLink) {
        settingsLink.addEventListener('click', () => {
            setTimeout(loadLogoSettings, 100);
            setTimeout(loadBlogStyles, 200);
        });
    }
});

// Blog Styling Functions
async function loadBlogStyles() {
    try {
        const response = await fetch('/api/settings', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('cms_token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load settings');
        }
        
        const settings = await response.json();
        
        // Load blog styling settings
        if (settings.blog_quote_style) {
            document.getElementById('blogQuoteStyle').value = settings.blog_quote_style.value || 'default';
        }
        
        if (settings.blog_author_style) {
            document.getElementById('blogAuthorStyle').value = settings.blog_author_style.value || 'default';
        }
        
        if (settings.blog_meta_style) {
            document.getElementById('blogMetaStyle').value = settings.blog_meta_style.value || 'default';
        }
        
        if (settings.blog_content_style) {
            document.getElementById('blogContentStyle').value = settings.blog_content_style.value || 'default';
        }
        
    } catch (error) {
        console.error('Error loading blog styles:', error);
    }
}

async function saveBlogStyles() {
    const quoteStyle = document.getElementById('blogQuoteStyle').value;
    const authorStyle = document.getElementById('blogAuthorStyle').value;
    const metaStyle = document.getElementById('blogMetaStyle').value;
    const contentStyle = document.getElementById('blogContentStyle').value;
    
    try {
        showLoading();
        
        // Save each blog style setting
        const styleSettings = [
            { key: 'blog_quote_style', value: quoteStyle },
            { key: 'blog_author_style', value: authorStyle },
            { key: 'blog_meta_style', value: metaStyle },
            { key: 'blog_content_style', value: contentStyle }
        ];
        
        for (const setting of styleSettings) {
            await fetch(`/api/settings/${setting.key}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('cms_token')}`
                },
                body: JSON.stringify({ value: setting.value, type: 'text' })
            });
        }
        
        showSuccess('Blog styles saved successfully!');
        
    } catch (error) {
        console.error('Error saving blog styles:', error);
        showError('Failed to save blog styles');
    } finally {
        hideLoading();
    }
}

function previewBlogStyles() {
    // Apply styles temporarily for preview
    const quoteStyle = document.getElementById('blogQuoteStyle').value;
    const authorStyle = document.getElementById('blogAuthorStyle').value;
    const metaStyle = document.getElementById('blogMetaStyle').value;
    const contentStyle = document.getElementById('blogContentStyle').value;
    
    // Open a new window with preview
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Blog Style Preview</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                .preview-container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
                ${getBlogStyleCSS(quoteStyle, authorStyle, metaStyle, contentStyle)}
            </style>
        </head>
        <body>
            <div class="preview-container">
                <h2>Blog Style Preview</h2>
                <div class="blog-detail-meta">
                    <span class="blog-category">AI Automation</span>
                    <span class="blog-date">December 15, 2024</span>
                    <div class="blog-author">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiAxMkMxNC4yMDkxIDEyIDE2IDEwLjIwOTEgMTYgOEMxNiA1Ljc5MDg2IDE0LjIwOTEgNCAxMiA0QzkuNzkwODYgNCA4IDUuNzkwODYgOCA4QzggMTAuMjA5MSA5Ljc5MDg2IDEyIDEyIDEyWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEyIDE0QzguNjkxIDE0IDYgMTYuNjkxIDYgMjBIMThDMTggMTYuNjkxIDE1LjMwOSAxNCAxMiAxNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K" alt="Author">
                        <span>John Doe</span>
                    </div>
                </div>
                <div class="blog-quote">
                    "AI-powered customer service isn't about replacing human agents—it's about augmenting their capabilities and creating better experiences for both customers and employees."
                </div>
                <div class="blog-content">
                    <p>This is a preview of how your blog content will look with the selected styles. The quote box, author information, and meta data will all be styled according to your preferences.</p>
                </div>
            </div>
        </body>
        </html>
    `);
}

function getBlogStyleCSS(quoteStyle, authorStyle, metaStyle, contentStyle) {
    let css = `
        .blog-detail-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
        .blog-category { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem; font-weight: 500; }
        .blog-date { color: #64748b; font-size: 0.875rem; font-weight: 500; background: rgba(100, 116, 139, 0.1); padding: 0.25rem 0.75rem; border-radius: 15px; }
        .blog-author { display: flex; align-items: center; gap: 0.75rem; }
        .blog-author img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
        .blog-author span { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
        .blog-quote { margin: 2rem 0; padding: 1.5rem; border-radius: 10px; font-style: italic; font-size: 1.1rem; line-height: 1.6; }
        .blog-content { line-height: 1.8; color: #374151; }
    `;
    
    // Quote styles
    switch(quoteStyle) {
        case 'purple':
            css += `.blog-quote { background: linear-gradient(135deg, #8b5cf6, #a855f7); color: white; border-left: 4px solid #7c3aed; }`;
            break;
        case 'green':
            css += `.blog-quote { background: linear-gradient(135deg, #10b981, #059669); color: white; border-left: 4px solid #047857; }`;
            break;
        case 'orange':
            css += `.blog-quote { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border-left: 4px solid #b45309; }`;
            break;
        case 'minimal':
            css += `.blog-quote { background: #f8fafc; color: #64748b; border-left: 4px solid #cbd5e1; }`;
            break;
        default:
            css += `.blog-quote { background: #f0f9ff; color: #1e40af; border-left: 4px solid #3b82f6; }`;
    }
    
    // Author styles
    switch(authorStyle) {
        case 'minimal':
            css += `.blog-author { background: none; padding: 0; border: none; } .blog-author span { color: #6b7280; }`;
            break;
        case 'highlighted':
            css += `.blog-author { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 0.5rem 1rem; border-radius: 25px; border: 1px solid #f59e0b; } .blog-author span { color: #92400e; }`;
            break;
        case 'bordered':
            css += `.blog-author { background: white; padding: 0.5rem 1rem; border-radius: 25px; border: 2px solid #e5e7eb; } .blog-author span { color: #374151; }`;
            break;
        default:
            css += `.blog-author { background: rgba(0, 0, 0, 0.1); padding: 0.5rem 1rem; border-radius: 25px; border: 1px solid rgba(0, 0, 0, 0.1); } .blog-author span { color: #1e293b; }`;
    }
    
    // Meta styles
    switch(metaStyle) {
        case 'dark':
            css += `.blog-detail-meta { background: #1f2937; color: white; } .blog-category { background: linear-gradient(135deg, #8b5cf6, #a855f7); } .blog-date { background: rgba(255, 255, 255, 0.1); color: #d1d5db; }`;
            break;
        case 'colorful':
            css += `.blog-category { background: linear-gradient(135deg, #ec4899, #be185d); } .blog-date { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; }`;
            break;
        case 'minimal':
            css += `.blog-detail-meta { background: none; border: none; } .blog-category { background: #f3f4f6; color: #374151; } .blog-date { background: #f3f4f6; color: #6b7280; }`;
            break;
        default:
            css += `.blog-detail-meta { background: rgba(248, 250, 252, 0.8); border: 1px solid rgba(226, 232, 240, 0.5); }`;
    }
    
    return css;
}

function showSection(sectionName) {
    if (window.cms) {
        window.cms.showSection(sectionName);
    } else {
        console.error('CMS not initialized yet');
    }
}

function logout() {
    if (window.cms) {
        window.cms.logout();
    }
}

function saveHeroSection() {
    if (window.cms) {
        window.cms.saveHeroSection();
    }
}

function saveNavigation() {
    if (window.cms) {
        window.cms.saveNavigation();
    }
}

function saveFeatures() {
    if (window.cms) {
        window.cms.saveFeatures();
    }
}

function saveAboutSection() {
    if (window.cms) {
        window.cms.saveAboutSection();
    }
}

function addFeature() {
    if (window.cms) {
        window.cms.addFeature();
    }
}

function removeFeature(button) {
    if (window.cms) {
        window.cms.removeFeature(button);
    }
}

function saveSEOSettings() {
    if (window.cms) {
        window.cms.saveSEOSettings();
    }
}

function saveThemeSettings() {
    if (window.cms) {
        window.cms.saveThemeSettings();
    }
}

function saveGeneralSettings() {
    if (window.cms) {
        window.cms.saveGeneralSettings();
    }
}

function addUser() {
    if (window.cms) {
        window.cms.addUser();
    }
}

function editUser(userId) {
    if (window.cms) {
        window.cms.editUser(userId);
    }
}

function deleteUser(userId) {
    if (window.cms) {
        window.cms.deleteUser(userId);
    }
}

function copyUrl(url) {
    if (window.cms) {
        window.cms.copyUrl(url);
    }
}

function deleteFile(fileId) {
    if (window.cms) {
        window.cms.deleteFile(fileId);
    }
}

// Blog Management Functions
function showBlogForm() {
    document.getElementById('blogForm').style.display = 'block';
    document.getElementById('blogFormTitle').textContent = 'Create New Blog Post';
    document.getElementById('blogFormElement').reset();
    document.getElementById('blogFormElement').dataset.mode = 'create';
}

function hideBlogForm() {
    document.getElementById('blogForm').style.display = 'none';
}

// Debounce function to prevent multiple rapid calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced editBlog function
const debouncedEditBlog = debounce((blogId) => {
    console.log('editBlog called with ID:', blogId);
    console.log('window.cms exists:', !!window.cms);
    if (window.cms) {
        window.cms.editBlog(blogId);
    } else {
        console.error('CMS not initialized');
    }
}, 300);

function editBlog(blogId) {
    debouncedEditBlog(blogId);
}

function deleteBlog(blogId) {
    if (confirm('Are you sure you want to delete this blog post?')) {
        if (window.cms) {
            window.cms.deleteBlog(blogId);
        }
    }
}

// Use Case Management Functions
function showUseCaseForm() {
    document.getElementById('useCaseForm').style.display = 'block';
    document.getElementById('useCaseFormTitle').textContent = 'Create New Use Case';
    document.getElementById('useCaseFormElement').reset();
    document.getElementById('useCaseFormElement').dataset.mode = 'create';
}

function hideUseCaseForm() {
    document.getElementById('useCaseForm').style.display = 'none';
}

function editUseCase(useCaseId) {
    if (window.cms) {
        window.cms.editUseCase(useCaseId);
    }
}

function deleteUseCase(useCaseId) {
    if (confirm('Are you sure you want to delete this use case?')) {
        if (window.cms) {
            window.cms.deleteUseCase(useCaseId);
        }
    }
}

// Case Study Management Functions
function showCaseStudyForm() {
    document.getElementById('caseStudyForm').style.display = 'block';
    document.getElementById('caseStudyFormTitle').textContent = 'Create New Case Study';
    document.getElementById('caseStudyFormElement').reset();
    document.getElementById('caseStudyFormElement').dataset.mode = 'create';
    document.getElementById('caseStudyFormElement').dataset.id = '';
}

function hideCaseStudyForm() {
    document.getElementById('caseStudyForm').style.display = 'none';
}

function editCaseStudy(caseStudyId) {
    if (window.cms) {
        window.cms.editCaseStudy(caseStudyId);
    }
}

function deleteCaseStudy(caseStudyId) {
    if (confirm('Are you sure you want to delete this case study?')) {
        if (window.cms) {
            window.cms.deleteCaseStudy(caseStudyId);
        }
    }
}

function removeCaseStudyImage() {
    if (window.cms) {
        window.cms.removeCaseStudyImage();
    }
}

// Rich Text Editor Functions
function setupRichTextEditor() {
    const editor = document.getElementById('blogContent');
    if (!editor) return;

    // Toolbar button functionality
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    toolbarButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const command = button.dataset.command;
            const value = button.dataset.value;
            
            if (command === 'createLink') {
                createLink();
            } else if (command === 'insertImage') {
                insertImage();
            } else {
                document.execCommand(command, false, value);
            }
            
            updateToolbarState();
        });
    });

    // Update toolbar state on selection change
    editor.addEventListener('keyup', () => updateToolbarState());
    editor.addEventListener('mouseup', () => updateToolbarState());
    editor.addEventListener('selectionchange', () => updateToolbarState());
}

function updateToolbarState() {
    const editor = document.getElementById('blogContent');
    if (!editor) return;

    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    toolbarButtons.forEach(button => {
        const command = button.dataset.command;
        const value = button.dataset.value;
        
        if (command === 'formatBlock') {
            const isActive = document.queryCommandValue('formatBlock') === value;
            button.classList.toggle('active', isActive);
        } else if (command && command !== 'createLink' && command !== 'insertImage') {
            const isActive = document.queryCommandState(command);
            button.classList.toggle('active', isActive);
        }
    });
}

function createLink() {
    const url = prompt('Enter URL:');
    if (url) {
        document.execCommand('createLink', false, url);
    }
}

function insertImage() {
    const url = prompt('Enter image URL:');
    if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        document.execCommand('insertHTML', false, img.outerHTML);
    }
}

// File management functions
function removeBlogImage() {
    if (window.cms) {
        window.cms.removeBlogImage();
    }
}

function removeBlogAuthorImage() {
    if (window.cms) {
        window.cms.removeBlogAuthorImage();
    }
}

function removeGalleryImage(button) {
    if (window.cms) {
        window.cms.removeGalleryImage(button);
    }
}

// Pricing Management Functions
let pricingContent = null;
let currentPricingPlan = null;

async function loadPricingPlans() {
    try {
        showLoading();
        const response = await fetch('/api/content/pricing');
        if (response.ok) {
            pricingContent = await response.json();
            updatePricingPlansTable();
        } else {
            showError('Failed to load pricing plans');
        }
    } catch (error) {
        showError('Error loading pricing plans');
    } finally {
        hideLoading();
    }
}

function updatePricingPlansTable() {
    const tbody = document.getElementById('pricingPlansTableBody');
    if (!tbody || !pricingContent) return;

    tbody.innerHTML = '';
    
    pricingContent.plans.forEach((plan, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${plan.name}</td>
            <td><span class="badge badge-${plan.id}">${plan.id}</span></td>
            <td>${plan.price}</td>
            <td>${plan.featured ? '<i class="fas fa-star text-warning"></i>' : ''}</td>
            <td>${index}</td>
            <td><span class="badge badge-success">Active</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editPricingPlan(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePricingPlan(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function addNewPricingPlan() {
    currentPricingPlan = null;
    document.getElementById('pricingPlanModalTitle').textContent = 'Add New Pricing Plan';
    document.getElementById('pricingPlanForm').reset();
    document.getElementById('isActive').checked = true;
    document.getElementById('pricingPlanModal').style.display = 'block';
}

function editPricingPlan(index) {
    if (!pricingContent || !pricingContent.plans[index]) return;
    
    const plan = pricingContent.plans[index];
    currentPricingPlan = { plan, index };
    document.getElementById('pricingPlanModalTitle').textContent = 'Edit Pricing Plan';
    
    // Populate form
    document.getElementById('planName').value = plan.name;
    document.getElementById('planType').value = plan.id;
    document.getElementById('planDescription').value = plan.description || '';
    document.getElementById('priceAmount').value = plan.price;
    document.getElementById('pricePeriod').value = plan.period;
    document.getElementById('buttonText').value = 'Contact Sales';
    document.getElementById('buttonAction').value = 'contact';
    document.getElementById('displayOrder').value = index;
    document.getElementById('isFeatured').checked = plan.featured;
    document.getElementById('isActive').checked = true;
    document.getElementById('features').value = plan.features ? plan.features.join('\n') : '';
    
    document.getElementById('pricingPlanModal').style.display = 'block';
}

async function savePricingPlan() {
    const form = document.getElementById('pricingPlanForm');
    const formData = new FormData(form);
    
    const planData = {
        id: formData.get('planType'),
        name: formData.get('planName'),
        description: formData.get('planDescription'),
        price: formData.get('priceAmount'),
        period: formData.get('pricePeriod'),
        features: formData.get('features').split('\n').filter(f => f.trim()),
        featured: formData.get('isFeatured') === 'on'
    };
    
    try {
        showLoading();
        
        if (currentPricingPlan) {
            // Update existing plan
            pricingContent.plans[currentPricingPlan.index] = planData;
        } else {
            // Add new plan
            pricingContent.plans.push(planData);
        }
        
        const response = await fetch('/api/content/pricing', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pricingContent)
        });
        
        if (response.ok) {
            showSuccess(currentPricingPlan ? 'Pricing plan updated successfully!' : 'Pricing plan created successfully!');
            closePricingPlanModal();
            loadPricingPlans();
        } else {
            const error = await response.json();
            showError(error.message || 'Failed to save pricing plan');
        }
    } catch (error) {
        showError('Error saving pricing plan');
    } finally {
        hideLoading();
    }
}

async function deletePricingPlan(index) {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;
    
    try {
        showLoading();
        
        // Remove plan from array
        pricingContent.plans.splice(index, 1);
        
        const response = await fetch('/api/content/pricing', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pricingContent)
        });
        
        if (response.ok) {
            showSuccess('Pricing plan deleted successfully!');
            loadPricingPlans();
        } else {
            showError('Failed to delete pricing plan');
        }
    } catch (error) {
        showError('Error deleting pricing plan');
    } finally {
        hideLoading();
    }
}

function closePricingPlanModal() {
    document.getElementById('pricingPlanModal').style.display = 'none';
    currentPricingPlan = null;
}

// Pricing Section Content Management
async function loadPricingSectionContent() {
    try {
        const response = await fetch('/api/content/pricing');
        if (response.ok) {
            const pricingData = await response.json();
            
            // Update form fields
            if (document.getElementById('pricingTitleInput')) {
                document.getElementById('pricingTitleInput').value = pricingData.title || '';
            }
            if (document.getElementById('pricingSubtitleInput')) {
                document.getElementById('pricingSubtitleInput').value = pricingData.subtitle || '';
            }
            if (document.getElementById('customSolutionsTitleInput')) {
                document.getElementById('customSolutionsTitleInput').value = pricingData.customSolutions?.title || '';
            }
            if (document.getElementById('customSolutionsDescriptionInput')) {
                document.getElementById('customSolutionsDescriptionInput').value = pricingData.customSolutions?.description || '';
            }
        }
    } catch (error) {
        console.error('Error loading pricing section content:', error);
    }
}

async function savePricingSection() {
    try {
        showLoading();
        
        // Get current pricing content
        const response = await fetch('/api/content/pricing');
        if (!response.ok) {
            throw new Error('Failed to load current pricing content');
        }
        
        const pricingData = await response.json();
        
        // Update the content
        pricingData.title = document.getElementById('pricingTitleInput').value;
        pricingData.subtitle = document.getElementById('pricingSubtitleInput').value;
        
        if (!pricingData.customSolutions) {
            pricingData.customSolutions = {};
        }
        pricingData.customSolutions.title = document.getElementById('customSolutionsTitleInput').value;
        pricingData.customSolutions.description = document.getElementById('customSolutionsDescriptionInput').value;
        
        // Save updated content
        const saveResponse = await fetch('/api/content/pricing', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pricingData)
        });
        
        if (saveResponse.ok) {
            showSuccess('Pricing section content updated successfully!');
            loadPricingSectionContent();
        } else {
            showError('Failed to update pricing section content');
        }
    } catch (error) {
        showError('Error updating pricing section content');
    } finally {
        hideLoading();
    }
}

function editPricingSection() {
    showSuccess('Pricing section editor opened!');
}

// Global loading functions
console.log('✅ LOADING ENHANCED-ADMIN-SCRIPT-V2.JS - ALL FUNCTIONS DEFINED ✅');
console.log('hideLoading function available:', typeof hideLoading);

function showLoading() {
    // Create loading overlay
    let loadingDiv = document.getElementById('loading');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        loadingDiv.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center;">
                <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <div>Loading...</div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.style.display = 'flex';
}

function hideLoading() {
    console.log('hideLoading function called');
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

function saveResourcesSection() {
    if (window.cms) {
        window.cms.saveResourcesSection();
    }
}

// Debounced edit functions for other resource types
const debouncedEditUseCase = debounce((id) => {
    if (window.cms) {
        window.cms.editUseCase(id);
    }
}, 300);

const debouncedEditCaseStudy = debounce((id) => {
    if (window.cms) {
        window.cms.editCaseStudy(id);
    }
}, 300);

function editResource(type, id) {
    console.log('editResource called with type:', type, 'id:', id);
    if (window.cms) {
        if (type === 'Blog') {
            debouncedEditBlog(id);
        } else if (type === 'Use Case') {
            debouncedEditUseCase(id);
        } else if (type === 'Case Study') {
            debouncedEditCaseStudy(id);
        }
    }
}

function deleteResource(type, id) {
    if (confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) {
        if (window.cms) {
            if (type === 'Blog') {
                window.cms.deleteBlog(id);
            } else if (type === 'Use Case') {
                window.cms.deleteUseCase(id);
            } else if (type === 'Case Study') {
                window.cms.deleteCaseStudy(id);
            }
        }
    }
}

console.log('✅ hideLoading function defined and ready to use');

// Global notification functions
function showSuccess(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-message';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'error-message';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f56565;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize CMS when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.cms = new EnhancedCMS();
    console.log('CMS initialized');
});
