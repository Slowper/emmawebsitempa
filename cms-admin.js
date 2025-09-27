// Emma Resources CMS - Admin Interface JavaScript
class EmmaCMS {
    constructor() {
        // Use relative API URLs when served from the same server
        this.apiBase = 'http://localhost:3001/api';
        this.token = localStorage.getItem('cms_token');
        this.currentUser = null;
        this.quillEditor = null;
        this.currentResourceId = null;
        this.industries = [];
        this.tags = [];
        this.isSaving = false; // Prevent duplicate submissions
        
        this.init();
    }

    async init() {
        // Check authentication
        if (!this.token) {
            this.showLogin();
            return;
        }

        // Initialize Quill editor
        this.initQuillEditor();
        
        // Hide all loading states initially
        this.hideAllLoadingStates();
        
        // Load initial data
        await this.loadUserData();
        await this.loadIndustries();
        await this.loadTags();
        await this.loadDashboardStats();
        await this.loadDraftResources();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show dashboard by default
        this.showSection('dashboard');
    }

    hideAllLoadingStates() {
        console.log('🔇 Hiding all loading states');
        const loadingElements = [
            'resources-loading',
            'blogs-loading', 
            'case-studies-loading',
            'use-cases-loading'
        ];
        
        loadingElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
                console.log('✅ Hidden:', id);
            }
        });
    }

    showLogin() {
        const loginHtml = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); width: 100%; max-width: 400px;">
                    <h2 style="text-align: center; margin-bottom: 2rem; color: #1e293b;">Emma CMS Login</h2>
                    <form id="login-form">
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Username or Email</label>
                            <input type="text" id="login-username" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px;" required>
                        </div>
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Password</label>
                            <input type="password" id="login-password" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 8px;" required>
                        </div>
                        <button type="submit" style="width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;">
                            Login
                        </button>
                    </form>
                    <div id="login-error" style="margin-top: 1rem; color: #ef4444; text-align: center; display: none;"></div>
                </div>
            </div>
        `;
        
        document.body.innerHTML = loginHtml;
        
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }

    async handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');

        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('cms_token', this.token);
                localStorage.setItem('cms_user', JSON.stringify(this.currentUser));
                location.reload();
            } else {
                errorDiv.textContent = data.error || 'Login failed';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            errorDiv.textContent = 'Network error. Please try again.';
            errorDiv.style.display = 'block';
        }
    }

    async loadUserData() {
        const userData = localStorage.getItem('cms_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            document.getElementById('user-name').textContent = this.currentUser.firstName || this.currentUser.username;
            document.getElementById('user-avatar').textContent = (this.currentUser.firstName || this.currentUser.username).charAt(0).toUpperCase();
        }
    }

    initQuillEditor() {
        // Check if Quill is available
        if (typeof Quill !== 'undefined') {
            this.quillEditor = new Quill('#resource-editor', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        [{ 'align': [] }],
                        ['link', 'image', 'video'],
                        ['blockquote', 'code-block'],
                        ['clean']
                    ]
                }
            });
        } else {
            console.log('Using simple rich text editor (Quill not available)');
            // Use the simple editor that's already in the HTML
            this.quillEditor = {
                root: document.getElementById('resource-editor'),
                setContents: (content) => {
                    if (this.quillEditor && this.quillEditor.root) {
                        this.quillEditor.root.innerHTML = content || '';
                    }
                },
                getContents: () => {
                    if (this.quillEditor && this.quillEditor.root) {
                        return this.quillEditor.root.innerHTML;
                    }
                    return '';
                }
            };
        }
    }

    setupEventListeners() {
        // Navigation - only handle items with data-section (dashboard)
        document.querySelectorAll('.nav-item[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                console.log('🖱️ Navigation clicked:', section);
                this.showSection(section);
            });
        });
        
        // Let regular links (without data-section) work normally

        // Resource form (if it exists)
        const resourceForm = document.getElementById('resource-form');
        if (resourceForm) {
            // Remove any existing event listeners first
            resourceForm.removeEventListener('submit', this.handleFormSubmit);
            
            // Create bound method for event listener
            this.handleFormSubmit = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📝 Form submit event triggered');
                
                // Double-check if already saving
                if (this.isSaving) {
                    console.log('⚠️ Form submission blocked - already saving');
                    return false;
                }
                
                // Additional check - prevent if form is already being processed
                if (window.formSubmitting) {
                    console.log('⚠️ Form submission blocked - global flag set');
                    return false;
                }
                
                window.formSubmitting = true;
                this.saveResource();
                return false;
            };
            
            resourceForm.addEventListener('submit', this.handleFormSubmit);
            console.log('✅ Form event listener attached');
        } else {
            console.log('⚠️ Resource form not found');
        }

        // File upload handlers
        this.setupFileUploadHandlers();
    }

    setupFileUploadHandlers() {
        // Drag and drop for file upload areas
        document.querySelectorAll('.file-upload-area').forEach(area => {
            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('dragover');
            });

            area.addEventListener('dragleave', () => {
                area.classList.remove('dragover');
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('dragover');
                const files = e.dataTransfer.files;
                this.handleFileUpload(files, area);
            });
        });
    }

    async loadIndustries() {
        try {
            const response = await this.apiCall('/industries');
            this.industries = response;
            
            const select = document.getElementById('resource-industry');
            select.innerHTML = '<option value="">Select industry</option>';
            this.industries.forEach(industry => {
                const option = document.createElement('option');
                option.value = industry.id;
                option.textContent = industry.name;
                select.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading industries:', error);
        }
    }

    async loadTags() {
        try {
            const response = await this.apiCall('/tags');
            this.tags = response;
        } catch (error) {
            console.error('Error loading tags:', error);
        }
    }

    async loadDashboardStats() {
        try {
            const stats = await this.apiCall('/stats');
            
            // Safely update dashboard stats with null checks
            const updateElement = (id, value) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value || 0;
                } else {
                    console.warn(`Dashboard element not found: ${id}`);
                }
            };
            
            updateElement('total-published', stats.total_published);
            updateElement('total-drafts', stats.total_drafts);
            updateElement('total-views', stats.views_last_30_days);
            updateElement('total-blogs', stats.total_blogs);
            updateElement('total-case-studies', stats.total_case_studies);
            updateElement('total-use-cases', stats.total_use_cases);
            
            // Load recent resources
            await this.loadRecentResources();
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }

    async loadRecentResources() {
        try {
            const response = await this.apiCall('/resources?limit=5&sort=created_at&order=DESC');
            const resources = response.resources || [];
            
            const container = document.getElementById('recent-resources');
            const loading = document.getElementById('recent-loading');
            
            // Check if elements exist before using them
            if (!container) {
                console.log('⚠️ Recent resources container not found, skipping...');
                return;
            }
            
            if (resources.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #64748b;">No resources found</p>';
            } else {
                container.innerHTML = `
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${resources.map(resource => `
                                <tr>
                                    <td>${resource.title}</td>
                                    <td>
                                        <span class="badge badge-${resource.type}">
                                            ${resource.type.replace('-', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="badge badge-${resource.status}">
                                            ${resource.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>${new Date(resource.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button class="btn btn-sm btn-secondary" onclick="cms.editResource(${resource.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="cms.deleteResource(${resource.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
            
            if (loading) {
                loading.style.display = 'none';
            }
            container.style.display = 'block';
        } catch (error) {
            console.error('Error loading recent resources:', error);
        }
    }

    async loadDraftResources() {
        try {
            const response = await this.apiCall('/resources?status=draft&limit=10');
            const resources = response.resources || [];
            
            const container = document.getElementById('drafts-content');
            const loading = document.getElementById('drafts-loading');
            
            // Check if elements exist before using them
            if (!container) {
                console.log('⚠️ Draft resources container not found, skipping...');
                return;
            }
            
            if (resources.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #64748b;">No draft resources found</p>';
            } else {
                container.innerHTML = `
                    <div class="draft-resources-grid">
                        ${resources.map(resource => `
                            <div class="draft-resource-card">
                                <div class="draft-resource-header">
                                    <h4 class="draft-resource-title">${resource.title}</h4>
                                    <span class="draft-resource-type">${resource.type.replace('-', ' ').toUpperCase()}</span>
                                </div>
                                <p class="draft-resource-excerpt">${resource.excerpt || 'No excerpt available'}</p>
                                <div class="draft-resource-meta">
                                    <span class="draft-resource-date">${new Date(resource.created_at).toLocaleDateString()}</span>
                                    <span class="draft-resource-author">${resource.author_name}</span>
                                </div>
                                <div class="draft-resource-actions">
                                    <button class="btn btn-sm btn-primary" onclick="cms.editResource(${resource.id})">
                                        <i class="fas fa-edit"></i>
                                        Edit
                                    </button>
                                    <button class="btn btn-sm btn-success" onclick="cms.publishResource(${resource.id})">
                                        <i class="fas fa-paper-plane"></i>
                                        Publish
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="cms.deleteResource(${resource.id})">
                                        <i class="fas fa-trash"></i>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            if (loading) {
                loading.style.display = 'none';
            }
            container.style.display = 'block';
            
        } catch (error) {
            console.error('Error loading draft resources:', error);
        }
    }

    async publishResource(resourceId) {
        try {
            const response = await this.apiCall(`/resources/${resourceId}`, 'PUT', {
                status: 'published',
                published_at: new Date().toISOString()
            });
            
            if (response.success) {
                console.log('✅ Resource published successfully');
                // Reload draft resources to update the list
                await this.loadDraftResources();
                // Reload dashboard stats
                await this.loadDashboardStats();
                alert('Resource published successfully!');
            } else {
                alert('Error publishing resource: ' + response.message);
            }
        } catch (error) {
            console.error('Error publishing resource:', error);
            alert('Error publishing resource: ' + error.message);
        }
    }

    async loadResources(type = null) {
        try {
            console.log('🔄 Loading resources, type:', type);
            
            // Show loading state for the current section
            const activeSection = document.querySelector('.section.active');
            let loading;
            
            if (activeSection?.id === 'blogs-section') {
                loading = document.getElementById('blogs-loading');
            } else if (activeSection?.id === 'case-studies-section') {
                loading = document.getElementById('case-studies-loading');
            } else if (activeSection?.id === 'use-cases-section') {
                loading = document.getElementById('use-cases-loading');
            } else {
                loading = document.getElementById('resources-loading');
            }
            
            if (loading) {
                console.log('⏳ Showing loading state');
                loading.style.display = 'block';
            }
            
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            params.append('limit', '50');
            
            console.log('📡 Making API call to:', `/resources?${params.toString()}`);
            const response = await this.apiCall(`/resources?${params.toString()}`);
            console.log('📊 API response:', response);
            const resources = response.resources || [];
            console.log('📋 Resources loaded:', resources.length);
            
            this.displayResources(resources);
        } catch (error) {
            console.error('❌ Error loading resources:', error);
        }
    }

    displayResources(resources) {
        console.log('🎨 Displaying resources:', resources.length);
        
        // Find the current active section
        const activeSection = document.querySelector('.section.active');
        console.log('🎯 Active section:', activeSection);
        
        // Determine which container and loading elements to use based on the active section
        let container, loading;
        
        // Check if we're on a specific page (cms-blogs.html, etc.)
        if (window.location.pathname.includes('cms-blogs.html')) {
            container = document.getElementById('blogs-content');
            loading = document.getElementById('blogs-loading');
        } else if (window.location.pathname.includes('cms-case-studies.html')) {
            container = document.getElementById('case-studies-content');
            loading = document.getElementById('case-studies-loading');
        } else if (window.location.pathname.includes('cms-use-cases.html')) {
            container = document.getElementById('use-cases-content');
            loading = document.getElementById('use-cases-loading');
        } else if (activeSection?.id === 'blogs-section') {
            container = document.getElementById('blogs-content');
            loading = document.getElementById('blogs-loading');
        } else if (activeSection?.id === 'case-studies-section') {
            container = document.getElementById('case-studies-content');
            loading = document.getElementById('case-studies-loading');
        } else if (activeSection?.id === 'use-cases-section') {
            container = document.getElementById('use-cases-content');
            loading = document.getElementById('use-cases-loading');
        } else {
            // Default to main resources section
            container = document.getElementById('resources-content');
            loading = document.getElementById('resources-loading');
        }
        
        console.log('📦 Container element:', container);
        console.log('⏳ Loading element:', loading);
        
        if (resources.length === 0) {
            console.log('⚠️ No resources to display');
            if (container) {
                container.innerHTML = '<p style="text-align: center; color: #64748b;">No resources found</p>';
            }
        } else {
            container.innerHTML = `
                <table class="table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Type</th>
                            <th>Industry</th>
                            <th>Status</th>
                            <th>Author</th>
                            <th>Created</th>
                            <th>Views</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${resources.map(resource => `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        ${resource.featured_image ? 
                                            `<img src="${resource.featured_image}" alt="${resource.title}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : 
                                            `<div style="width: 40px; height: 40px; background: #f1f5f9; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #64748b;">
                                                <i class="fas fa-file-alt"></i>
                                            </div>`
                                        }
                                        <div>
                                            <div style="font-weight: 500;">${resource.title}</div>
                                            <div style="font-size: 0.75rem; color: #64748b;">${resource.excerpt ? resource.excerpt.substring(0, 50) + '...' : ''}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge badge-${resource.type}">
                                        ${resource.type.replace('-', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td>${resource.industry_name || '-'}</td>
                                <td>
                                    <span class="badge badge-${resource.status}">
                                        ${resource.status.toUpperCase()}
                                    </span>
                                </td>
                                <td>${resource.author_name || 'Unknown'}</td>
                                <td>${new Date(resource.created_at).toLocaleDateString()}</td>
                                <td>${resource.view_count || 0}</td>
                                <td>
                                    <button class="btn btn-sm btn-secondary" onclick="cms.editResource(${resource.id})" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="cms.deleteResource(${resource.id})" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
        
        console.log('✅ Hiding loading, showing content');
        if (loading) {
            console.log('🔍 Hiding loading element:', loading);
            loading.style.display = 'none';
        } else {
            console.log('❌ Loading element not found!');
        }
        if (container) {
            console.log('🔍 Showing container element:', container);
            container.style.display = 'block';
        } else {
            console.log('❌ Container element not found!');
        }
        console.log('🎯 Display complete');
    }

    showSection(sectionName) {
        console.log('🎯 Showing section:', sectionName);
        
        if (!sectionName) {
            console.log('⚠️ No section name provided');
            return;
        }
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Remove active class from nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Show selected section
        const section = document.getElementById(`${sectionName}-section`);
        console.log('📦 Section element:', section);
        if (section) {
            section.classList.add('active');
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = this.getSectionTitle(sectionName);
            }
            console.log('✅ Section activated');
        } else {
            console.error('❌ Section not found:', `${sectionName}-section`);
            // Debug: Check what sections are available
            const allSections = document.querySelectorAll('.section');
            console.log('📋 Available sections:', Array.from(allSections).map(s => s.id));
            console.log('🔍 Available section IDs:', Array.from(document.querySelectorAll('[id$="-section"]')).map(el => el.id));
        }
        
        // Add active class to nav item
        const navItem = document.querySelector(`[data-section="${sectionName}"]`);
        console.log('🔗 Nav item:', navItem);
        if (navItem) {
            navItem.classList.add('active');
            console.log('✅ Nav item activated');
        } else {
            console.error('❌ Nav item not found for section:', sectionName);
        }
        
        console.log('🔄 Loading section data...');
        this.loadSectionData(sectionName);
    }

    getSectionTitle(sectionName) {
        const titles = {
            'dashboard': 'Dashboard',
            'resources': 'All Resources',
            'blogs': 'Blog Posts',
            'case-studies': 'Case Studies',
            'use-cases': 'Use Cases',
            'industries': 'Industries',
            'tags': 'Tags',
            'media': 'Media Library',
            'settings': 'Settings',
            'users': 'Users'
        };
        return titles[sectionName] || 'Dashboard';
    }

    async loadSectionData(sectionName) {
        console.log('📊 Loading section data for:', sectionName);
        switch (sectionName) {
            case 'dashboard':
                console.log('📈 Loading dashboard stats...');
                await this.loadDashboardStats();
                break;
            case 'resources':
                console.log('📋 Loading all resources...');
                await this.loadResources();
                break;
            case 'blogs':
                console.log('📝 Loading blog posts...');
                await this.loadResources('blog');
                break;
            case 'case-studies':
                console.log('📊 Loading case studies...');
                await this.loadResources('case-study');
                break;
            case 'use-cases':
                console.log('🔧 Loading use cases...');
                await this.loadResources('use-case');
                break;
            default:
                console.log('⚠️ Unknown section:', sectionName);
        }
    }

    openResourceModal(type = null) {
        const modal = document.getElementById('resource-modal');
        const form = document.getElementById('resource-form');
        
        // Reset form
        form.reset();
        if (this.quillEditor && this.quillEditor.setContents) {
            this.quillEditor.setContents([]);
        }
        this.currentResourceId = null;
        
        // Clear image previews
        const featuredImagePreview = document.getElementById('featured-image-preview');
        const authorImagePreview = document.getElementById('author-image-preview');
        const galleryPreview = document.getElementById('gallery-preview');
        
        if (featuredImagePreview) featuredImagePreview.innerHTML = '';
        if (authorImagePreview) authorImagePreview.innerHTML = '';
        if (galleryPreview) galleryPreview.innerHTML = '';
        
        // Set type if provided
        if (type) {
            document.getElementById('resource-type').value = type;
        }
        
        // Update modal title
        document.getElementById('modal-title').textContent = this.currentResourceId ? 'Edit Resource' : 'New Resource';
        
        modal.classList.add('active');
    }

    closeResourceModal() {
        document.getElementById('resource-modal').classList.remove('active');
    }

    async saveResource() {
        // Prevent multiple rapid submissions
        if (this.isSaving) {
            console.log('⚠️ Save already in progress, ignoring duplicate submission');
            return;
        }
        
        // Disable form submission button to prevent double clicks
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';
        }
        
        this.isSaving = true;
        console.log('🔒 Starting save operation, isSaving set to true');
        
        try {
            const formData = new FormData();
            
            // Basic fields
            const title = document.getElementById('resource-title').value;
            const type = document.getElementById('resource-type').value;
            const excerpt = document.getElementById('resource-excerpt').value;
            const author = document.getElementById('resource-author').value;
            
            console.log('📝 Form data being sent:', {
                title: title,
                type: type,
                excerpt: excerpt,
                author: author
            });
            
            // Debug: Check if title is empty
            if (!title || title.trim() === '') {
                console.error('❌ Title is empty! Form validation should have caught this.');
                this.showNotification('Title is required', 'error');
                this.isSaving = false;
                return;
            }
            
            formData.append('title', title);
            formData.append('type', type);
            formData.append('excerpt', excerpt);
            formData.append('author', author);
            const content = this.quillEditor && this.quillEditor.getContents ? 
                this.quillEditor.getContents() : 
                (this.quillEditor && this.quillEditor.root ? this.quillEditor.root.innerHTML : '');
            formData.append('content', content);
            formData.append('industry_id', document.getElementById('resource-industry').value);
            formData.append('status', document.getElementById('resource-status').value);
            formData.append('meta_title', document.getElementById('resource-meta-title').value);
            formData.append('meta_description', document.getElementById('resource-meta-description').value);
            formData.append('meta_keywords', document.getElementById('resource-meta-keywords').value);
            
            // Tags
            const tagsInput = document.getElementById('resource-tags').value;
            if (tagsInput) {
                const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
                formData.append('tags', JSON.stringify(tags));
            }
            
            // File uploads
            const featuredImage = document.getElementById('featured-image-input').files[0];
            if (featuredImage) {
                formData.append('featured_image', featuredImage);
            }
            
            const authorImage = document.getElementById('author-image-input').files[0];
            if (authorImage) {
                formData.append('author_image', authorImage);
            }
            
            const galleryFiles = document.getElementById('gallery-input').files;
            for (let file of galleryFiles) {
                formData.append('gallery', file);
            }
            
            const url = this.currentResourceId ? 
                `${this.apiBase}/resources/${this.currentResourceId}` : 
                `${this.apiBase}/resources`;
            
            const method = this.currentResourceId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.closeResourceModal();
                this.showNotification('Resource saved successfully!', 'success');
                
                // Refresh the current section data
                const currentSection = this.getCurrentSection();
                await this.loadSectionData(currentSection);
                
                // If we're in blogs section, also refresh the blog list specifically
                if (currentSection === 'blogs' || window.location.pathname.includes('cms-blogs')) {
                    await this.loadBlogPosts();
                }
                
                // Also refresh draft resources for dashboard
                await this.loadDraftResources();
            } else {
                this.showNotification(data.error || data.message || 'Error saving resource', 'error');
            }
        } catch (error) {
            console.error('Error saving resource:', error);
            this.showNotification('Error saving resource', 'error');
        } finally {
            this.isSaving = false;
            window.formSubmitting = false;
            console.log('🔓 Save operation completed, isSaving set to false');
            
            // Re-enable form submission button
            const submitButton = document.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Save Resource';
            }
        }
    }

    async editResource(id) {
        try {
            const response = await this.apiCall(`/resources/${id}`);
            const resource = response;
            
            // Populate form
            document.getElementById('resource-title').value = resource.title;
            document.getElementById('resource-type').value = resource.type;
            document.getElementById('resource-excerpt').value = resource.excerpt || '';
            document.getElementById('resource-author').value = resource.author || '';
            if (this.quillEditor && this.quillEditor.setContents) {
                this.quillEditor.setContents(resource.content);
            } else if (this.quillEditor && this.quillEditor.root) {
                this.quillEditor.root.innerHTML = resource.content;
            }
            document.getElementById('resource-industry').value = resource.industry_id || '';
            document.getElementById('resource-status').value = resource.status;
            document.getElementById('resource-meta-title').value = resource.meta_title || '';
            document.getElementById('resource-meta-description').value = resource.meta_description || '';
            document.getElementById('resource-meta-keywords').value = resource.meta_keywords || '';
            
            // Tags
            if (resource.tags) {
                const tags = typeof resource.tags === 'string' ? JSON.parse(resource.tags) : resource.tags;
                document.getElementById('resource-tags').value = tags.join(', ');
            }
            
            this.currentResourceId = id;
            document.getElementById('modal-title').textContent = 'Edit Resource';
            document.getElementById('resource-modal').classList.add('active');
        } catch (error) {
            console.error('Error loading resource:', error);
            this.showNotification('Error loading resource', 'error');
        }
    }

    async deleteResource(id) {
        if (!confirm('Are you sure you want to delete this resource?')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/resources/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                this.showNotification('Resource deleted successfully!', 'success');
                this.loadSectionData(this.getCurrentSection());
            } else {
                const data = await response.json();
                this.showNotification(data.error || 'Error deleting resource', 'error');
            }
        } catch (error) {
            console.error('Error deleting resource:', error);
            this.showNotification('Error deleting resource', 'error');
        }
    }

    handleImageUpload(input, previewId) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById(previewId);
                preview.innerHTML = `
                    <div class="image-preview-item">
                        <img src="${e.target.result}" alt="Preview">
                        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">&times;</button>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    }

    handleGalleryUpload(input) {
        const files = Array.from(input.files);
        const preview = document.getElementById('gallery-preview');
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const item = document.createElement('div');
                item.className = 'image-preview-item';
                item.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">&times;</button>
                `;
                preview.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
    }

    getCurrentSection() {
        const activeSection = document.querySelector('.section.active');
        return activeSection ? activeSection.id.replace('-section', '') : 'dashboard';
    }

    async refreshResources() {
        const loading = document.getElementById('resources-loading');
        const content = document.getElementById('resources-content');
        
        loading.style.display = 'block';
        content.style.display = 'none';
        
        await this.loadResources();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    async apiCall(endpoint, options = {}) {
        const url = `${this.apiBase}${endpoint}`;
        console.log('🌐 Making API call to:', url);
        const config = {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        const response = await fetch(url, config);
        console.log('📡 API response status:', response.status, 'for', url);
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('cms_token');
                localStorage.removeItem('cms_user');
                this.showLogin();
                throw new Error('Unauthorized');
            }
            throw new Error(`API call failed: ${response.status}`);
        }
        
        return await response.json();
    }

    async loadBlogPosts() {
        try {
            console.log('🔄 Loading blog posts...');
            const response = await this.apiCall('/resources?type=blog&status=published');
            const blogPosts = response;
            
            console.log('📝 Blog posts loaded:', blogPosts.length);
            
            // Update the blog posts container
            const blogContainer = document.getElementById('blog-posts-container');
            if (blogContainer) {
                if (blogPosts.length === 0) {
                    blogContainer.innerHTML = '<p class="text-center text-gray-500">No blog posts found</p>';
                } else {
                    blogContainer.innerHTML = blogPosts.map(blog => `
                        <div class="blog-post-card">
                            <div class="blog-post-header">
                                <h3>${blog.title}</h3>
                                <div class="blog-post-meta">
                                    <span class="author">${blog.author || 'Unknown Author'}</span>
                                    <span class="date">${new Date(blog.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div class="blog-post-content">
                                <p>${blog.excerpt || 'No excerpt available'}</p>
                            </div>
                            <div class="blog-post-actions">
                                <button onclick="cms.editResource(${blog.id})" class="btn-edit">Edit</button>
                                <button onclick="cms.deleteResource(${blog.id})" class="btn-delete">Delete</button>
                            </div>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading blog posts:', error);
        }
    }

    logout() {
        localStorage.removeItem('cms_token');
        localStorage.removeItem('cms_user');
        this.showLogin();
    }
}

// Global functions for HTML onclick handlers
function showSection(section) {
    cms.showSection(section);
}

function openResourceModal(type = null) {
    cms.openResourceModal(type);
}

function closeResourceModal() {
    cms.closeResourceModal();
}

function refreshResources() {
    cms.refreshResources();
}

function logout() {
    cms.logout();
}

// Initialize CMS when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cms = new EmmaCMS();
});
