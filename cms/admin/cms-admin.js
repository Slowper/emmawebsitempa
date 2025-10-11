// Emma Resources CMS - Admin Interface JavaScript
class EmmaCMS {
    constructor() {
        // Use relative API URLs when served from the same server
        this.apiBase = 'http://localhost:3001/api';
        this.token = localStorage.getItem('cms_token');
        console.log('🔑 Token loaded:', this.token ? 'Present' : 'Missing');
        this.currentUser = null;
        this.tinyMCEEditor = null;
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

        // Don't initialize TinyMCE here - wait for modal to open
        
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
            const userNameElement = document.getElementById('user-name');
            const userAvatarElement = document.getElementById('user-avatar');
            
            if (userNameElement) {
                userNameElement.textContent = this.currentUser.firstName || this.currentUser.username;
            }
            if (userAvatarElement) {
                userAvatarElement.textContent = (this.currentUser.firstName || this.currentUser.username).charAt(0).toUpperCase();
            }
        }
    }

    initQuillEditor() {
        console.log('🔧 Initializing Quill editor...');
        console.log('Quill available:', typeof Quill !== 'undefined');
        console.log('Editor element exists:', !!document.getElementById('resource-editor'));
        console.log('Quill already initialized:', !!this.quillEditor);
        
        // Check if Quill is available and editor element exists
        if (typeof Quill !== 'undefined' && document.getElementById('resource-editor')) {
            // Always clean up any existing instance first
            const editorElement = document.getElementById('resource-editor');
            
            // If we have a previous Quill instance, disable it
            if (this.quillEditor) {
                console.log('🧹 Disabling existing Quill instance...');
                try {
                    this.quillEditor.disable();
                    this.quillEditor = null;
                } catch (e) {
                    console.log('Error disabling Quill:', e);
                }
            }
            
            // Clean up any existing Quill DOM elements
            if (editorElement.classList.contains('ql-container') || editorElement.querySelector('.ql-toolbar')) {
                console.log('🧹 Cleaning up existing Quill DOM elements...');
                const parent = editorElement.parentElement;
                const existingToolbar = parent.querySelector('.ql-toolbar');
                if (existingToolbar) existingToolbar.remove();
                
                // Reset the editor element
                editorElement.className = '';
                editorElement.innerHTML = '';
                editorElement.style.height = '300px';
            }
            // Define custom bullet styles
            const Parchment = Quill.import('parchment');
            const BlockEmbed = Quill.import('blots/block/embed');
            
            // Custom bullet blot
            class CustomBulletBlot extends BlockEmbed {
                static create(value) {
                    const node = super.create();
                    node.setAttribute('class', 'custom-bullet');
                    node.innerHTML = value;
                    return node;
                }
                
                static value(node) {
                    return node.innerHTML;
                }
            }
            CustomBulletBlot.blotName = 'customBullet';
            CustomBulletBlot.tagName = 'div';
            Quill.register(CustomBulletBlot);

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
                    ],
                    clipboard: {
                        // Enable paste functionality
                        matchVisual: false,
                        // Allow pasting of HTML content
                        allowed: {
                            tags: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                                   'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'div', 'span'],
                            attributes: ['href', 'src', 'alt', 'title', 'class', 'id', 'style']
                        }
                    },
                    keyboard: {
                        bindings: {
                            // Disable automatic list conversion
                            'list autofill': {
                                key: ' ',
                                shiftKey: null,
                                ctrlKey: null,
                                altKey: null,
                                handler: function(range, context) {
                                    return true; // Allow default behavior (no auto-conversion)
                                }
                            },
                            // Disable automatic ordered list conversion
                            'list tab': {
                                key: 'Tab',
                                shiftKey: null,
                                ctrlKey: null,
                                altKey: null,
                                handler: function(range, context) {
                                    return true; // Allow default behavior (no auto-conversion)
                                }
                            },
                            // Ensure paste works with keyboard shortcuts
                            paste: {
                                key: 'V',
                                shortKey: true,
                                handler: function(range, context) {
                                    console.log('⌨️ Quill paste handler triggered');
                                    // Let Quill handle the paste naturally
                                    return true;
                                }
                            },
                            // Add formatting shortcut
                            format: {
                                key: 'F',
                                shortKey: true,
                                handler: (range, context) => {
                                    console.log('⌨️ Format shortcut triggered');
                                    this.forceFormatContent();
                                    return true;
                                }
                            }
                        }
                    }
                },
                formats: ['header', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 
                         'list', 'indent', 'align', 'link', 'image', 'video', 'blockquote', 
                         'code-block']
            });

            // Add custom styles for the editor
            this.addCustomEditorStyles();
            
            // Add custom toolbar button for highlight boxes
            this.addCustomToolbarButton();
            
            // Wait for Quill to be fully ready before setting up paste handlers
            setTimeout(() => {
                this.setupPasteHandlers();
                // this.setupAutoFormatting(); // DISABLED: Let blog logic handle formatting on save
            }, 100);
            
            console.log('✅ Quill editor initialized successfully');
        } else {
            console.log('❌ Quill editor initialization failed');
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

    addCustomEditorStyles() {
        // Add custom CSS for the editor
        const style = document.createElement('style');
        style.textContent = `
            .ql-editor {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                color: #1f2937;
            }
            
            .ql-editor h1, .ql-editor h2 {
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                position: relative;
            }
            
            .ql-editor h1::after, .ql-editor h2::after {
                content: '';
                position: absolute;
                bottom: -0.5rem;
                left: 0;
                width: 3rem;
                height: 3px;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                border-radius: 2px;
            }
            
            .ql-editor h3 {
                color: #3b82f6;
                position: relative;
                padding-left: 1rem;
            }
            
            .ql-editor h3::before {
                content: '▶';
                position: absolute;
                left: 0;
                color: #3b82f6;
                font-size: 0.8rem;
            }
            
            .ql-editor h4, .ql-editor h5, .ql-editor h6 {
                color: #1d4ed8;
                position: relative;
                padding-left: 0.5rem;
            }
            
            .ql-editor h4::before {
                content: '•';
                position: absolute;
                left: 0;
                color: #3b82f6;
                font-weight: bold;
            }
            
            .ql-editor strong, .ql-editor b {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
                padding: 0.1rem 0.3rem;
                border-radius: 0.25rem;
            }
            
            .ql-editor em, .ql-editor i {
                background: rgba(59, 130, 246, 0.1);
                padding: 0.1rem 0.2rem;
                border-radius: 0.2rem;
            }
            
            .ql-editor ul {
                list-style: none;
            }
            
            .ql-editor ul li {
                position: relative;
                padding-left: 1.5rem;
            }
            
            .ql-editor ul li::before {
                content: '✦';
                position: absolute;
                left: 0;
                color: #3b82f6;
                font-weight: bold;
                font-size: 1.1rem;
            }
            
            .ql-editor ol {
                counter-reset: custom-counter;
            }
            
            .ql-editor ol li {
                counter-increment: custom-counter;
                position: relative;
                padding-left: 2rem;
            }
            
            .ql-editor ol li::before {
                content: counter(custom-counter);
                position: absolute;
                left: 0;
                top: 0;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                color: white;
                width: 1.5rem;
                height: 1.5rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: bold;
            }
            
            .ql-editor a {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
                padding: 0.2rem 0.4rem;
                border-radius: 0.25rem;
                text-decoration: none;
            }
            
            .ql-editor blockquote {
                border-left: 4px solid #3b82f6;
                padding: 1.5rem;
                background: rgba(59, 130, 246, 0.05);
                border-radius: 0.5rem;
                position: relative;
            }
            
            .ql-editor blockquote::before {
                content: '"';
                position: absolute;
                top: -0.5rem;
                left: 1rem;
                font-size: 3rem;
                color: #3b82f6;
                opacity: 0.3;
            }
            
            .ql-editor code {
                background: rgba(59, 130, 246, 0.15);
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                border: 1px solid rgba(59, 130, 246, 0.3);
            }
            
            .ql-editor pre {
                background: rgba(15, 23, 42, 0.9);
                padding: 1.5rem;
                border-radius: 0.5rem;
                border: 1px solid rgba(59, 130, 246, 0.2);
                position: relative;
            }
            
            .ql-editor pre::before {
                content: 'Code';
                position: absolute;
                top: 0.5rem;
                right: 1rem;
                background: #3b82f6;
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-size: 0.7rem;
                font-weight: bold;
            }
            
            .custom-bullet {
                margin: 1rem 0;
                padding: 1rem;
                background: rgba(59, 130, 246, 0.1);
                border-left: 4px solid #3b82f6;
                border-radius: 0.5rem;
                position: relative;
            }
            
            .custom-bullet::before {
                content: '💡';
                position: absolute;
                left: -2rem;
                top: 1rem;
                font-size: 1.2rem;
            }
            
            .highlight-box {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 0.5rem;
                padding: 1rem;
                margin: 1rem 0;
                position: relative;
            }
            
            .highlight-box::before {
                content: '⭐';
                position: absolute;
                top: -0.5rem;
                left: 1rem;
                background: white;
                padding: 0.25rem;
            }
        `;
        document.head.appendChild(style);
    }

    addCustomToolbarButton() {
        // Add a custom button to the toolbar for highlight boxes
        const toolbar = this.quillEditor.getModule('toolbar');
        const toolbarContainer = toolbar.container;
        
        // Create highlight box button
        const highlightButton = document.createElement('button');
        highlightButton.type = 'button';
        highlightButton.innerHTML = '⭐';
        highlightButton.title = 'Insert Highlight Box';
        highlightButton.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
            margin: 0 2px;
            border-radius: 3px;
            font-size: 16px;
        `;
        
        highlightButton.addEventListener('click', () => {
            const range = this.quillEditor.getSelection();
            if (range) {
                this.quillEditor.insertText(range.index, '\n');
                this.quillEditor.insertEmbed(range.index + 1, 'div', {
                    class: 'highlight-box',
                    content: 'Highlighted content goes here...'
                });
                this.quillEditor.insertText(range.index + 2, '\n');
                this.quillEditor.setSelection(range.index + 3);
            }
        });
        
        // Create custom bullet button
        const bulletButton = document.createElement('button');
        bulletButton.type = 'button';
        bulletButton.innerHTML = '💡';
        bulletButton.title = 'Insert Custom Bullet';
        bulletButton.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
            margin: 0 2px;
            border-radius: 3px;
            font-size: 16px;
        `;
        
        bulletButton.addEventListener('click', () => {
            const range = this.quillEditor.getSelection();
            if (range) {
                this.quillEditor.insertText(range.index, '\n');
                this.quillEditor.insertEmbed(range.index + 1, 'div', {
                    class: 'custom-bullet',
                    content: 'Custom bullet content goes here...'
                });
                this.quillEditor.insertText(range.index + 2, '\n');
                this.quillEditor.setSelection(range.index + 3);
            }
        });
        
        // Create format button
        const formatButton = document.createElement('button');
        formatButton.type = 'button';
        formatButton.innerHTML = '✨';
        formatButton.title = 'Auto-Format Content';
        formatButton.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
            margin: 0 2px;
            border-radius: 3px;
            font-size: 16px;
            background-color: #3b82f6;
            color: white;
        `;
        
        formatButton.addEventListener('click', () => {
            console.log('✨ Manual formatting triggered');
            this.forceFormatContent();
        });
        
        // Create a specific fix button for letter numbering
        const fixButton = document.createElement('button');
        fixButton.type = 'button';
        fixButton.innerHTML = '🔢';
        fixButton.title = 'Fix Letter Numbering (a,b,a,a) → (1,2,3,4)';
        fixButton.style.cssText = `
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
            margin: 0 2px;
            border-radius: 3px;
            font-size: 16px;
            background-color: #ef4444;
            color: white;
        `;
        
        fixButton.addEventListener('click', () => {
            console.log('🔢 Fixing letter numbering...');
            this.fixLetterNumberingDirectly();
        });
        
        // Create BULLETS button - NEW!
        const bulletsButton = document.createElement('button');
        bulletsButton.type = 'button';
        bulletsButton.innerHTML = '✦';
        bulletsButton.title = 'Convert to Bullets';
        bulletsButton.style.cssText = `
            background: #3b82f6;
            border: none;
            cursor: pointer;
            padding: 5px 8px;
            margin: 0 2px;
            border-radius: 3px;
            color: white;
            font-size: 16px;
            font-weight: bold;
        `;
        
        bulletsButton.addEventListener('click', () => {
            this.convertToBullets();
        });

        // Add the buttons to the toolbar
        toolbarContainer.appendChild(highlightButton);
        toolbarContainer.appendChild(bulletButton);
        toolbarContainer.appendChild(formatButton);
        toolbarContainer.appendChild(fixButton);
        toolbarContainer.appendChild(bulletsButton);
        
        // Make format function globally accessible for debugging
        window.forceFormat = () => {
            console.log('🔧 Manual format triggered from console');
            this.forceFormatContent();
        };
        
        // Make direct fix function globally accessible
        window.fixNumbers = () => {
            console.log('🔢 Manual number fix triggered from console');
            this.fixLetterNumberingDirectly();
        };

        // Make custom bullet fix function globally accessible
        window.fixBullets = () => {
            console.log('🔵 Manual bullet fix triggered from console');
            this.applyCustomBulletStyling();
        };
        
        // Add a simple, direct fix for the current content
        window.quickFix = () => {
            console.log('🚀 Quick fix triggered');
            this.quickFixContent();
        };
        
        // Add bullets conversion function
        window.convertToBullets = () => {
            console.log('✦ Manual bullets conversion triggered');
            this.convertToBullets();
        };
        
        // Add a simple fix for letter-based numbering
        window.fixLetterNumbering = () => {
            if (!this.quillEditor) {
                console.log('❌ Quill editor not available');
                return;
            }
            
            console.log('🔧 Fixing letter-based numbering...');
            let content = this.quillEditor.root.innerHTML;
            console.log('📝 Current content:', content);
            
            // Direct replacement of letter-based numbering
            content = content.replace(/(<p[^>]*>)\s*([a-zA-Z])\.\s*([^<]+)(<\/p>)/g, (match, openTag, letter, text, closeTag) => {
                return `${openTag}<li>${text}${closeTag}`;
            });
            
            // Wrap consecutive li elements in ol
            content = content.replace(/(<li[^>]*>.*?<\/li>)(\s*<li[^>]*>.*?<\/li>)+/g, (match) => {
                return `<ol>${match}</ol>`;
            });
            
            console.log('📝 Fixed content:', content);
            this.quillEditor.root.innerHTML = content;
            console.log('✅ Letter-based numbering fixed');
        };
    }

    fixLetterNumberingDirectly() {
        if (!this.quillEditor) {
            console.log('❌ Quill editor not available');
            return;
        }
        
        console.log('🔢 Starting direct letter numbering fix...');
        
        // Get all text content from the editor
        const editorElement = this.quillEditor.root;
        const allText = editorElement.textContent || editorElement.innerText || '';
        console.log('📝 All text content:', allText);
        
        // Split into lines and process
        const lines = allText.split(/\n/);
        const processedLines = [];
        let inList = false;
        let listItems = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            console.log(`📝 Processing line ${i}: "${line}"`);
            
            // Check if line starts with letter + period (a., b., etc.)
            if (line.match(/^[a-zA-Z]\.\s/)) {
                console.log(`✅ Found letter-based item: "${line}"`);
                
                // Extract the text after the letter and period
                const textAfterLetter = line.replace(/^[a-zA-Z]\.\s*/, '').trim();
                console.log(`📝 Text after letter: "${textAfterLetter}"`);
                
                if (textAfterLetter) {
                    listItems.push(textAfterLetter);
                    inList = true;
                }
            } else if (inList && line && !line.match(/^[a-zA-Z]\.\s/)) {
                // This might be a continuation of the previous list item
                console.log(`📝 Continuation line: "${line}"`);
                if (listItems.length > 0) {
                    listItems[listItems.length - 1] += ' ' + line;
                }
            } else {
                // End of list, add the list to processed lines
                if (inList && listItems.length > 0) {
                    console.log(`📝 Creating list with ${listItems.length} items:`, listItems);
                    const listHTML = '<ol>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ol>';
                    processedLines.push(listHTML);
                    listItems = [];
                    inList = false;
                }
                
                // Add regular line
                if (line) {
                    processedLines.push(`<p>${line}</p>`);
                }
            }
        }
        
        // Close any remaining list
        if (inList && listItems.length > 0) {
            console.log(`📝 Creating final list with ${listItems.length} items:`, listItems);
            const listHTML = '<ol>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ol>';
            processedLines.push(listHTML);
        }
        
        // Join all processed lines
        const newContent = processedLines.join('');
        console.log('📝 New content:', newContent);
        
        // Update the editor
        editorElement.innerHTML = newContent;
        console.log('✅ Direct letter numbering fix completed');
        
        // Trigger a change event to let Quill know content changed
        if (this.quillEditor.update) {
            this.quillEditor.update();
        }
    }

    quickFixContent() {
        if (!this.quillEditor) {
            console.log('❌ Quill editor not available');
            return;
        }
        
        console.log('🚀 Starting quick fix...');
        
        // Get the current HTML content
        let content = this.quillEditor.root.innerHTML;
        console.log('📝 Current content:', content);
        
        // If content is wrapped in a single paragraph, extract the text and process it
        if (content.match(/^<p[^>]*>.*<\/p>$/s)) {
            console.log('📝 Processing single paragraph content');
            
            // Extract text from paragraph
            const textContent = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
            console.log('📝 Extracted text:', textContent);
            
            // Split by actual line breaks in the text
            const lines = textContent.split(/\n/);
            const result = [];
            let currentList = [];
            let inList = false;
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                
                console.log(`📝 Processing line: "${trimmed}"`);
                
                // Check for headers
                if (trimmed.match(/^(For Business|For Patients|Our Solution|RESULTS & IMPACT|CONCLUSION):\s*$/i)) {
                    // Close any current list
                    if (inList && currentList.length > 0) {
                        result.push(`<ol>${currentList.join('')}</ol>`);
                        currentList = [];
                        inList = false;
                    }
                    result.push(`<h2>${trimmed.replace(/:\s*$/, '')}</h2>`);
                }
                // Check for numbered items
                else if (trimmed.match(/^\d+\.\s/)) {
                    const item = trimmed.replace(/^\d+\.\s*/, '');
                    currentList.push(`<li>${item}</li>`);
                    inList = true;
                }
                // Check for letter-based items
                else if (trimmed.match(/^[a-zA-Z]\.\s/)) {
                    const item = trimmed.replace(/^[a-zA-Z]\.\s*/, '');
                    currentList.push(`<li>${item}</li>`);
                    inList = true;
                }
                // Regular paragraph
                else {
                    // Close any current list
                    if (inList && currentList.length > 0) {
                        result.push(`<ol>${currentList.join('')}</ol>`);
                        currentList = [];
                        inList = false;
                    }
                    result.push(`<p>${trimmed}</p>`);
                }
            }
            
            // Close any remaining list
            if (inList && currentList.length > 0) {
                result.push(`<ol>${currentList.join('')}</ol>`);
            }
            
            const newContent = result.join('');
            console.log('📝 New content:', newContent);
            
            // Update the editor
            this.quillEditor.root.innerHTML = newContent;
            console.log('✅ Quick fix completed');
        } else {
            console.log('📝 Content is not in single paragraph format, skipping quick fix');
        }
    }

    processContentForSaving(content) {
        console.log('📝 Processing content for saving using blog logic...');
        console.log('📝 Input content:', content);
        
        // Handle content that's all in one paragraph (common issue)
        if (content.match(/^<p>.*<\/p>$/s) && !content.includes('<h2>') && !content.includes('<li>')) {
            console.log('📝 Detected single paragraph content - processing line by line');
            
            // Extract text from paragraph
            const textContent = content.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
            console.log('📝 Extracted text:', textContent);
            
            // Split by line breaks and process
            const lines = textContent.split('\n').filter(line => line.trim());
            const processedLines = [];
            
            for (const line of lines) {
                const trimmed = line.trim();
                
                // Check for section headers
                if (trimmed.match(/^(The Problem|The Solution|Results|Conclusion|Key Benefits|Challenges|Implementation|For Business|For Patients|RESULTS\s*&\s*IMPACT|Our Solution):\s*$/i)) {
                    processedLines.push(`<h2>${trimmed.replace(/:\s*$/, '')}</h2>`);
                }
                // Check for numbered list items
                else if (trimmed.match(/^[\d]+\.\s/) || trimmed.match(/^[a-zA-Z]+\.\s/)) {
                    // Remove numbers/letters and add as list item
                    let item = trimmed.replace(/^[\d]+\.\s*/, '').replace(/^[a-zA-Z]+\.\s*/, '');
                    item = item.replace(/^[\d]+\.\s*/, '').replace(/^[a-zA-Z]+\.\s*/, '');
                    processedLines.push(`<li>${item}</li>`);
                }
                // Regular paragraph
                else if (trimmed) {
                    processedLines.push(`<p>${trimmed}</p>`);
                }
            }
            
            // Join lines and wrap consecutive list items in ul
            let newContent = processedLines.join('\n');
            newContent = newContent.replace(/(<li>[^<]*<\/li>(?:\s*<li>[^<]*<\/li>)*)/g, (match) => {
                if (!match.includes('<ul>') && !match.includes('<ol>')) {
                    return `<ul>${match}</ul>`;
                }
                return match;
            });
            
            console.log('📝 Processed single paragraph content:', newContent);
            content = newContent;
        }
        
        // Convert plain text numbered lists to proper HTML lists
        content = content.replace(/(\d+\.\s[^\n\r]+(?:\n\r?|\r\n?)?[^\n\r]*)/g, (match) => {
            // Split by line breaks to handle multi-line items
            const lines = match.split(/\n\r?|\r\n?/).filter(line => line.trim());
            if (lines.length > 0) {
                // Find all numbered items in the match
                const numberedItems = [];
                let currentItem = '';
                
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed.match(/^[\d]+\./) || trimmed.match(/^[a-zA-Z]+\./)) {
                        // Start of new item
                        if (currentItem) {
                            numberedItems.push(currentItem.trim());
                        }
                        // Remove the number/letter and period from the beginning - more aggressive removal
                        let cleanItem = trimmed.replace(/^[\d]+\.\s*/, '').replace(/^[\d]+\s*/, '');
                        cleanItem = cleanItem.replace(/^[a-zA-Z]+\.\s*/, '').replace(/^[a-zA-Z]+\s*/, '');
                        // Handle cases like "1. 2. 4. Text" or "a. b. c. Text" - remove all leading numbers/letters
                        cleanItem = cleanItem.replace(/^[\d]+\.\s*[\d]+\.\s*[\d]+\.\s*/, '');
                        cleanItem = cleanItem.replace(/^[\d]+\.\s*[\d]+\.\s*/, '');
                        cleanItem = cleanItem.replace(/^[a-zA-Z]+\.\s*[a-zA-Z]+\.\s*[a-zA-Z]+\.\s*/, '');
                        cleanItem = cleanItem.replace(/^[a-zA-Z]+\.\s*[a-zA-Z]+\.\s*/, '');
                        currentItem = cleanItem;
                    } else if (trimmed && currentItem) {
                        // Continuation of current item
                        currentItem += ' ' + trimmed;
                    }
                });
                
                if (currentItem) {
                    numberedItems.push(currentItem.trim());
                }
                
                if (numberedItems.length > 0) {
                    const listItems = numberedItems.map(item => `<li>${item}</li>`).join('');
                    return `<ul>${listItems}</ul>`;
                }
            }
            return match;
        });
        
        // Convert plain text bullet points to proper HTML lists
        content = content.replace(/([-•*]\s[^\n\r]+(?:\n\r?|\r\n?)[^\n\r]*)/g, (match) => {
            const lines = match.split(/\n\r?|\r\n?/).filter(line => line.trim());
            if (lines.length > 0) {
                const listItems = lines.map(line => {
                    const trimmed = line.trim();
                    if (trimmed.match(/^[-•*]/)) {
                        const item = trimmed.replace(/^[-•*]\s*/, '');
                        return `<li>${item}</li>`;
                    }
                    return `<li>${trimmed}</li>`;
                }).join('');
                return `<ul>${listItems}</ul>`;
            }
            return match;
        });
        
        // Convert common section headers to proper HTML headers
        content = content.replace(/^(The Problem|The Solution|Results|Conclusion|Key Benefits|Challenges|Implementation|For Business|For Patients|RESULTS\s*&\s*IMPACT|Our Solution):\s*$/gm, '<h2>$1</h2>');
        
        // Convert **bold** to <strong>bold</strong>
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* to <em>italic</em>
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        console.log('📝 Content processing completed');
        return content;
    }

    setupPasteHandlers() {
        if (!this.quillEditor) return;
        
        console.log('🔧 Setting up paste handlers for Quill editor');
        
        // Handle text changes (including paste)
        this.quillEditor.on('text-change', (delta, oldDelta, source) => {
            if (source === 'user') {
                console.log('📝 Text changed by user');
            }
        });

        // Handle paste events with proper event handling
        this.quillEditor.root.addEventListener('paste', (e) => {
            console.log('📋 Paste event detected');
            
            // Ensure the editor is focused
            if (document.activeElement !== this.quillEditor.root) {
                this.quillEditor.focus();
            }
            
            // Let the default paste behavior occur
            // Quill's clipboard module will handle the content processing
            setTimeout(() => {
                console.log('✅ Paste processing completed');
            }, 50);
        });

        // Handle keyboard shortcuts for paste
        this.quillEditor.root.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                console.log('⌨️ Paste shortcut detected (Ctrl/Cmd+V)');
                
                // Ensure editor is focused
                if (document.activeElement !== this.quillEditor.root) {
                    this.quillEditor.focus();
                }
            }
        });

        // Ensure the editor is focusable and can receive paste events
        this.quillEditor.root.setAttribute('tabindex', '0');
        this.quillEditor.root.style.outline = 'none';
        
        // Add a focus handler to ensure the editor is ready for paste
        this.quillEditor.root.addEventListener('focus', () => {
            console.log('🎯 Editor focused - ready for paste');
        });

        // Add click handler to ensure editor gets focus
        this.quillEditor.root.addEventListener('click', () => {
            console.log('🖱️ Editor clicked - ensuring focus');
            this.quillEditor.focus();
        });

        // Test if clipboard API is available
        if (navigator.clipboard) {
            console.log('✅ Clipboard API available');
        } else {
            console.log('⚠️ Clipboard API not available - using fallback');
        }
    }

    setupAutoFormatting() {
        if (!this.quillEditor) return;
        
        console.log('🔧 Setting up auto-formatting for Quill editor');
        
        // Apply formatting immediately when editor is ready
        setTimeout(() => {
            console.log('🎯 Applying initial formatting to editor content');
            this.forceFormatContent();
        }, 1000);
        
        // Handle text changes to auto-format content
        this.quillEditor.on('text-change', (delta, oldDelta, source) => {
            if (source === 'user') {
                console.log('📝 Text changed by user - checking for auto-formatting');
                
                // Get current content
                const content = this.quillEditor.root.innerHTML;
                console.log('📝 Current content:', content);
                
                // Auto-format section headers
                const formattedContent = this.autoFormatContent(content);
                console.log('📝 Formatted content:', formattedContent);
                
                // If content was changed, update the editor
                if (formattedContent !== content) {
                    console.log('🔄 Content formatted, updating editor');
                    
                    // Temporarily disable the text-change event to prevent infinite loop
                    this.quillEditor.off('text-change');
                    
                    // Update content using Quill's method to maintain cursor position
                    const currentSelection = this.quillEditor.getSelection();
                    this.quillEditor.root.innerHTML = formattedContent;
                    
                    // Restore cursor position
                    if (currentSelection) {
                        setTimeout(() => {
                            this.quillEditor.setSelection(currentSelection);
                        }, 50);
                    }
                    
                    // Re-enable the text-change event
                    setTimeout(() => {
                        this.quillEditor.on('text-change', arguments.callee);
                    }, 200);
                } else {
                    console.log('📝 No formatting changes needed');
                }
            }
        });
        
        // Also handle on blur to format when user finishes editing
        this.quillEditor.on('selection-change', (range, oldRange, source) => {
            if (oldRange && !range) {
                // Selection lost (blur event)
                console.log('📝 Editor blurred - applying final formatting');
                setTimeout(() => {
                    this.forceFormatContent();
                }, 500);
            }
        });
    }

    autoFormatContent(content) {
        if (!content) return content;
        
        let formattedContent = content;
        
        // If content is wrapped in a single paragraph (like from paste), process it specially
        if (formattedContent.match(/^<p[^>]*>.*<\/p>$/s) && !formattedContent.includes('<h2>') && !formattedContent.includes('<li>')) {
            console.log('📝 Auto-formatting single paragraph content');
            
            // Extract text from paragraph
            const textContent = formattedContent.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
            
            // Split by line breaks and process
            const lines = textContent.split(/\n/);
            const result = [];
            let currentList = [];
            let inList = false;
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                
                // Check for headers
                if (trimmed.match(/^(For Business|For Patients|Our Solution|RESULTS & IMPACT|CONCLUSION|The Problem):\s*$/i)) {
                    // Close any current list
                    if (inList && currentList.length > 0) {
                        result.push(`<ol>${currentList.join('')}</ol>`);
                        currentList = [];
                        inList = false;
                    }
                    result.push(`<h2>${trimmed.replace(/:\s*$/, '')}</h2>`);
                }
                // Check for numbered items
                else if (trimmed.match(/^\d+\.\s/)) {
                    const item = trimmed.replace(/^\d+\.\s*/, '');
                    currentList.push(`<li>${item}</li>`);
                    inList = true;
                }
                // Check for letter-based items
                else if (trimmed.match(/^[a-zA-Z]\.\s/)) {
                    const item = trimmed.replace(/^[a-zA-Z]\.\s*/, '');
                    currentList.push(`<li>${item}</li>`);
                    inList = true;
                }
                // Regular paragraph
                else {
                    // Close any current list
                    if (inList && currentList.length > 0) {
                        result.push(`<ol>${currentList.join('')}</ol>`);
                        currentList = [];
                        inList = false;
                    }
                    result.push(`<p>${trimmed}</p>`);
                }
            }
            
            // Close any remaining list
            if (inList && currentList.length > 0) {
                result.push(`<ol>${currentList.join('')}</ol>`);
            }
            
            formattedContent = result.join('');
        } else {
            // Handle existing HTML content (individual paragraphs, etc.)
            // Convert section headers to proper HTML headers
            formattedContent = formattedContent.replace(/<p>\s*(RESULTS\s*&\s*IMPACT|CONCLUSION|The Problem|The Solution|Results|Conclusion|Key Benefits|Challenges|Implementation|For Business|For Patients):\s*<\/p>/gi, '<h2>$1</h2>');
            formattedContent = formattedContent.replace(/<p>\s*([A-Z][^:]+):\s*<\/p>/g, '<h2>$1</h2>');
            
            // Convert plain text numbered lists to proper HTML lists
            formattedContent = formattedContent.replace(/(<p>\s*(\d+\.\s[^<\n]+)<\/p>)/g, (match, fullMatch, content) => {
                const item = content.replace(/^\d+\.\s*/, '');
                return `<li>${item}</li>`;
            });
            
            // Wrap consecutive list items in ordered list
            formattedContent = formattedContent.replace(/(<li>[^<]*<\/li>(?:\s*<li>[^<]*<\/li>)*)/g, (match) => {
                if (!match.includes('<ol>') && !match.includes('<ul>')) {
                    return `<ol>${match}</ol>`;
                }
                return match;
            });
        }
        
        return formattedContent;
    }

    applyFinalFormatting() {
        if (!this.quillEditor) return;
        
        console.log('🔧 Applying final formatting to editor content');
        
        // Get current content
        const content = this.quillEditor.root.innerHTML;
        
        // Apply comprehensive formatting
        const formattedContent = this.comprehensiveFormatContent(content);
        
        // If content was changed, update the editor
        if (formattedContent !== content) {
            console.log('🔄 Final formatting applied');
            
            // Save cursor position
            const currentSelection = this.quillEditor.getSelection();
            
            // Update content
            this.quillEditor.root.innerHTML = formattedContent;
            
            // Restore cursor position
            if (currentSelection) {
                setTimeout(() => {
                    this.quillEditor.setSelection(currentSelection);
                }, 50);
            }
        }
    }

    comprehensiveFormatContent(content) {
        if (!content) return content;
        
        let formattedContent = content;
        console.log('🔧 Starting comprehensive formatting...');
        
        // Handle content that's wrapped in a single paragraph tag (like from Quill paste)
        if (formattedContent.match(/^<p>.*<\/p>$/s) && !formattedContent.includes('<h2>') && !formattedContent.includes('<li>')) {
            console.log('📝 Processing single paragraph content');
            
            // Extract text from paragraph tag
            const textContent = formattedContent.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '');
            
            // Split content into lines
            const lines = textContent.split('\n').filter(line => line.trim());
            const processedLines = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Check for section headers
                if (line.match(/^(The Problem|The Solution|Results|Conclusion|Key Benefits|Challenges|Implementation|For Business|For Patients|RESULTS\s*&\s*IMPACT|Our Solution):\s*$/i)) {
                    processedLines.push(`<h2>${line.replace(/:\s*$/, '')}</h2>`);
                }
                // Check for numbered list items (numbers and letters)
                else if (line.match(/^[\d]+\.\s/) || line.match(/^[a-zA-Z]+\.\s/)) {
                    // More aggressive removal of numbers/letters - handle various formats
                    let item = line.replace(/^[\d]+\.\s*/, '').replace(/^[\d]+\s*/, '');
                    item = item.replace(/^[a-zA-Z]+\.\s*/, '').replace(/^[a-zA-Z]+\s*/, '');
                    // Handle cases like "1. 2. 4. Text" or "a. b. c. Text" - remove all leading numbers/letters
                    item = item.replace(/^[\d]+\.\s*[\d]+\.\s*[\d]+\.\s*/, '');
                    item = item.replace(/^[\d]+\.\s*[\d]+\.\s*/, '');
                    item = item.replace(/^[a-zA-Z]+\.\s*[a-zA-Z]+\.\s*[a-zA-Z]+\.\s*/, '');
                    item = item.replace(/^[a-zA-Z]+\.\s*[a-zA-Z]+\.\s*/, '');
                    // Clean up any remaining numbers or letters at the start
                    item = item.replace(/^[\d]+\.\s*/, '').replace(/^[a-zA-Z]+\.\s*/, '');
                    item = item.trim();
                    if (item) {
                        processedLines.push(`<li>${item}</li>`);
                    }
                }
                // Regular paragraph
                else if (line) {
                    processedLines.push(`<p>${line}</p>`);
                }
            }
            
            formattedContent = processedLines.join('\n');
            
            // Wrap consecutive list items in custom bullet lists
            formattedContent = formattedContent.replace(/(<li>[^<]*<\/li>(?:\s*<li>[^<]*<\/li>)*)/g, (match) => {
                if (!match.includes('<ol>') && !match.includes('<ul>') && !match.includes('custom-bullet-list')) {
                    return `<ul class="custom-bullet-list">${match}</ul>`;
                }
                return match;
            });
        }
        // Handle content that's wrapped in div tags (like from Quill)
        else if (formattedContent.includes('<div>') && !formattedContent.includes('<p>') && !formattedContent.includes('<h2>')) {
            console.log('📝 Processing div-wrapped content');
            
            // Extract text from div tags
            const textContent = formattedContent.replace(/<div[^>]*>/g, '').replace(/<\/div>/g, '');
            
            // Split content into lines
            const lines = textContent.split('\n').filter(line => line.trim());
            const processedLines = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Check for section headers
                if (line.match(/^(The Problem|The Solution|Results|Conclusion|Key Benefits|Challenges|Implementation|For Business|For Patients|RESULTS\s*&\s*IMPACT|Our Solution):\s*$/i)) {
                    processedLines.push(`<h2>${line.replace(/:\s*$/, '')}</h2>`);
                }
                // Check for numbered list items (numbers and letters)
                else if (line.match(/^[\d]+\.\s/) || line.match(/^[a-zA-Z]+\.\s/)) {
                    // More aggressive removal of numbers/letters - handle various formats
                    let item = line.replace(/^[\d]+\.\s*/, '').replace(/^[\d]+\s*/, '');
                    item = item.replace(/^[a-zA-Z]+\.\s*/, '').replace(/^[a-zA-Z]+\s*/, '');
                    // Handle cases like "1. 2. 4. Text" or "a. b. c. Text" - remove all leading numbers/letters
                    item = item.replace(/^[\d]+\.\s*[\d]+\.\s*[\d]+\.\s*/, '');
                    item = item.replace(/^[\d]+\.\s*[\d]+\.\s*/, '');
                    item = item.replace(/^[a-zA-Z]+\.\s*[a-zA-Z]+\.\s*[a-zA-Z]+\.\s*/, '');
                    item = item.replace(/^[a-zA-Z]+\.\s*[a-zA-Z]+\.\s*/, '');
                    // Clean up any remaining numbers or letters at the start
                    item = item.replace(/^[\d]+\.\s*/, '').replace(/^[a-zA-Z]+\.\s*/, '');
                    item = item.trim();
                    if (item) {
                        processedLines.push(`<li>${item}</li>`);
                    }
                }
                // Regular paragraph
                else if (line) {
                    processedLines.push(`<p>${line}</p>`);
                }
            }
            
            formattedContent = processedLines.join('\n');
            
            // Wrap consecutive list items in custom bullet lists
            formattedContent = formattedContent.replace(/(<li>[^<]*<\/li>(?:\s*<li>[^<]*<\/li>)*)/g, (match) => {
                if (!match.includes('<ol>') && !match.includes('<ul>') && !match.includes('custom-bullet-list')) {
                    return `<ul class="custom-bullet-list">${match}</ul>`;
                }
                return match;
            });
        }
        // Handle plain text content (not wrapped in HTML)
        else if (!formattedContent.includes('<p>') && !formattedContent.includes('<div>')) {
            console.log('📝 Processing plain text content');
            
            // Split content into lines
            const lines = formattedContent.split('\n').filter(line => line.trim());
            const processedLines = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Check for section headers
                if (line.match(/^(The Problem|The Solution|Results|Conclusion|Key Benefits|Challenges|Implementation|For Business|For Patients|RESULTS\s*&\s*IMPACT|Our Solution):\s*$/i)) {
                    processedLines.push(`<h2>${line.replace(/:\s*$/, '')}</h2>`);
                }
                // Check for numbered list items (numbers and letters)
                else if (line.match(/^[\d]+\.\s/) || line.match(/^[a-zA-Z]+\.\s/)) {
                    // More aggressive removal of numbers/letters - handle various formats
                    let item = line.replace(/^[\d]+\.\s*/, '').replace(/^[\d]+\s*/, '');
                    item = item.replace(/^[a-zA-Z]+\.\s*/, '').replace(/^[a-zA-Z]+\s*/, '');
                    // Handle cases like "1. 2. 4. Text" or "a. b. c. Text" - remove all leading numbers/letters
                    item = item.replace(/^[\d]+\.\s*[\d]+\.\s*[\d]+\.\s*/, '');
                    item = item.replace(/^[\d]+\.\s*[\d]+\.\s*/, '');
                    item = item.replace(/^[a-zA-Z]+\.\s*[a-zA-Z]+\.\s*[a-zA-Z]+\.\s*/, '');
                    item = item.replace(/^[a-zA-Z]+\.\s*[a-zA-Z]+\.\s*/, '');
                    // Clean up any remaining numbers or letters at the start
                    item = item.replace(/^[\d]+\.\s*/, '').replace(/^[a-zA-Z]+\.\s*/, '');
                    item = item.trim();
                    if (item) {
                        processedLines.push(`<li>${item}</li>`);
                    }
                }
                // Regular paragraph
                else if (line) {
                    processedLines.push(`<p>${line}</p>`);
                }
            }
            
            formattedContent = processedLines.join('\n');
            
            // Wrap consecutive list items in custom bullet lists
            formattedContent = formattedContent.replace(/(<li>[^<]*<\/li>(?:\s*<li>[^<]*<\/li>)*)/g, (match) => {
                if (!match.includes('<ol>') && !match.includes('<ul>') && !match.includes('custom-bullet-list')) {
                    return `<ul class="custom-bullet-list">${match}</ul>`;
                }
                return match;
            });
        }
        
        // Convert section headers to proper HTML headers (comprehensive patterns)
        formattedContent = formattedContent.replace(/<p>\s*(RESULTS\s*&\s*IMPACT|CONCLUSION|The Problem|The Solution|Results|Conclusion|Key Benefits|Challenges|Implementation|For Business|For Patients):\s*<\/p>/gi, '<h2>$1</h2>');
        formattedContent = formattedContent.replace(/<p>\s*([A-Z][^:]+):\s*<\/p>/g, '<h2>$1</h2>');
        
        // Convert plain text numbered lists to proper HTML lists (comprehensive)
        formattedContent = formattedContent.replace(/(<p>\s*(\d+\.\s[^<\n]+)<\/p>)/g, (match, fullMatch, content) => {
            const item = content.replace(/^\d+\.\s*/, '');
            return `<li>${item}</li>`;
        });
        
        // Wrap consecutive list items in ordered list
        formattedContent = formattedContent.replace(/(<li>[^<]*<\/li>(?:\s*<li>[^<]*<\/li>)*)/g, (match) => {
            if (!match.includes('<ol>') && !match.includes('<ul>')) {
                return `<ol>${match}</ol>`;
            }
            return match;
        });
        
        // Convert bold text patterns
        formattedContent = formattedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        formattedContent = formattedContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Clean up any remaining malformed HTML
        formattedContent = formattedContent.replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '');
        formattedContent = formattedContent.replace(/<p>\s*<\/p>/g, '');
        
        console.log('📝 Final formatted content:', formattedContent);
        return formattedContent;
    }

    forceFormatContent() {
        if (!this.quillEditor) {
            console.log('❌ Quill editor not available');
            return;
        }
        
        console.log('🔧 Force formatting content...');
        
        // Get current content as plain text
        const plainText = this.quillEditor.getText();
        console.log('📝 Current plain text:', plainText);
        
        // Get current HTML content
        const currentHTML = this.quillEditor.root.innerHTML;
        console.log('📝 Current HTML:', currentHTML);
        
        // Apply comprehensive formatting
        const formattedContent = this.comprehensiveFormatContent(currentHTML);
        
        console.log('📝 Formatted content:', formattedContent);
        
        // Clear the editor and insert formatted content
        this.quillEditor.root.innerHTML = '';
        
        // Use Quill's clipboard to paste the formatted content
        setTimeout(() => {
            const delta = this.quillEditor.clipboard.convert(formattedContent);
            this.quillEditor.setContents(delta);
            console.log('✅ Content formatted and applied');
            
            // Force apply custom bullet styling after content is loaded
            setTimeout(() => {
                this.applyCustomBulletStyling();
            }, 200);
        }, 100);
    }

    applyCustomBulletStyling() {
        console.log('🎨 Applying custom bullet styling...');
        
        // Find all ul elements that don't have custom-bullet-list class
        const ulElements = this.quillEditor.root.querySelectorAll('ul:not(.custom-bullet-list)');
        ulElements.forEach(ul => {
            ul.classList.add('custom-bullet-list');
            console.log('✅ Applied custom bullet styling to ul element');
        });
        
        // Also handle any existing list items that might not be wrapped properly
        const liElements = this.quillEditor.root.querySelectorAll('li');
        if (liElements.length > 0) {
            // Check if they're in a ul without custom styling
            const parentUl = liElements[0].closest('ul');
            if (parentUl && !parentUl.classList.contains('custom-bullet-list')) {
                parentUl.classList.add('custom-bullet-list');
                console.log('✅ Applied custom bullet styling to parent ul');
            }
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
        
        // Industry form handler
        this.setupIndustryFormHandler();
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

    setupIndustryFormHandler() {
        // Handle industry form submission
        document.addEventListener('submit', async (e) => {
            if (e.target.id === 'industry-form') {
                e.preventDefault();
                await this.saveIndustry();
            }
        });
    }

    async saveIndustry() {
        try {
            const industryModal = document.getElementById('industry-modal');
            const industryId = industryModal.dataset.industryId;
            
            const formData = {
                name: document.getElementById('industry-name').value,
                description: document.getElementById('industry-description').value,
                color: document.getElementById('industry-color').value,
                icon: document.getElementById('industry-icon').value,
                sort_order: parseInt(document.getElementById('industry-sort-order').value) || 0
            };

            const url = industryId ? 
                `${this.apiBase}/industries/${industryId}` : 
                `${this.apiBase}/industries`;
            
            const method = industryId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.closeIndustryModal();
                this.showNotification('Industry saved successfully!', 'success');
                await this.loadIndustriesManagement();
                // Also reload industries for resource forms
                await this.loadIndustries();
            } else {
                this.showNotification(data.error || data.message || 'Error saving industry', 'error');
            }
        } catch (error) {
            console.error('Error saving industry:', error);
            this.showNotification('Error saving industry', 'error');
        }
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
        
        // Hide all sections - more aggressive hiding
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none'; // Also hide with CSS
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
            section.style.display = 'block'; // Make sure it's visible
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) {
                pageTitle.textContent = this.getSectionTitle(sectionName);
            }
            console.log('✅ Section activated');
        } else {
            console.error('❌ Section not found:', `${sectionName}-section`);
            
            // For industries section, create it dynamically if it doesn't exist
            if (sectionName === 'industries') {
                console.log('🔧 Creating industries section dynamically...');
                this.createIndustriesSection();
                const newSection = document.getElementById('industries-section');
                if (newSection) {
                    newSection.classList.add('active');
                    newSection.style.display = 'block'; // Make sure it's visible
                    const pageTitle = document.getElementById('page-title');
                    if (pageTitle) {
                        pageTitle.textContent = this.getSectionTitle(sectionName);
                    }
                    console.log('✅ Industries section created and activated');
                }
            } else {
                // Debug: Check what sections are available
                const allSections = document.querySelectorAll('.section');
                console.log('📋 Available sections:', Array.from(allSections).map(s => s.id));
                console.log('🔍 Available section IDs:', Array.from(document.querySelectorAll('[id$="-section"]')).map(el => el.id));
            }
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
            'industries': 'Industries Management',
            'privacy-policy': 'Privacy Policy Management',
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
            case 'industries':
                console.log('🏭 Loading industries...');
                await this.loadIndustriesManagement();
                break;
            case 'privacy-policy':
                console.log('🔒 Loading privacy policy...');
                // Privacy policy loading is handled by the global function
                if (typeof window.loadPrivacyPolicy === 'function') {
                    window.loadPrivacyPolicy();
                } else {
                    console.log('⚠️ Privacy policy function not available yet, will retry...');
                    setTimeout(() => {
                        if (typeof window.loadPrivacyPolicy === 'function') {
                            window.loadPrivacyPolicy();
                        }
                    }, 1000);
                }
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
        
        // Initialize Quill editor if not already done
        if (typeof Quill !== 'undefined') {
            // Wait a bit for the modal to be fully displayed
            setTimeout(() => {
                if (!this.quillEditor) {
                    console.log('🔧 Initializing Quill editor for new resource...');
                    this.initQuillEditor();
                }
            }, 200);
        }
        
        if (this.quillEditor && this.quillEditor.setContents) {
            this.quillEditor.setContents([]);
        }
        
        // Ensure editor is focused when modal opens
        setTimeout(() => {
            if (this.quillEditor && this.quillEditor.focus) {
                this.quillEditor.focus();
                console.log('🎯 Editor focused when modal opened');
            }
        }, 300);
        
        this.currentResourceId = null;
        
        // Clear image previews
        const featuredImagePreview = document.getElementById('featured-image-preview');
        const authorImagePreview = document.getElementById('author-image-preview');
        const galleryPreview = document.getElementById('gallery-preview');
        
        if (featuredImagePreview) featuredImagePreview.innerHTML = '';
        if (authorImagePreview) authorImagePreview.innerHTML = '';
        if (galleryPreview) galleryPreview.innerHTML = '';
        
        // Set type if provided, with proper default handling
        if (type) {
            document.getElementById('resource-type').value = type;
        } else {
            // Set default type based on current page context
            const currentPath = window.location.pathname;
            if (currentPath.includes('cms-blogs.html')) {
                document.getElementById('resource-type').value = 'blog';
            } else if (currentPath.includes('cms-case-studies.html')) {
                document.getElementById('resource-type').value = 'case-study';
            } else if (currentPath.includes('cms-use-cases.html')) {
                document.getElementById('resource-type').value = 'use-case';
            }
        }
        
        // Update modal title based on type
        let modalTitle = 'New Resource';
        if (type === 'blog') {
            modalTitle = 'New Blog Post';
        } else if (type === 'case-study') {
            modalTitle = 'New Case Study';
        } else if (type === 'use-case') {
            modalTitle = 'New Use Case';
        }
        document.getElementById('modal-title').textContent = this.currentResourceId ? 'Edit Resource' : modalTitle;
        
        modal.classList.add('active');
        modal.style.display = 'flex';
    }

    closeResourceModal() {
        console.log('🔒 Closing resource modal...');
        const modal = document.getElementById('resource-modal');
        if (modal) {
            // Try both methods to ensure modal closes
            modal.classList.remove('active');
            modal.style.display = 'none';
            console.log('✅ Modal closed successfully');
        } else {
            console.log('❌ Modal element not found');
        }
        
        // Clean up Quill editor
        if (this.quillEditor) {
            console.log('🧹 Cleaning up Quill editor...');
            const editorElement = document.getElementById('resource-editor');
            if (editorElement) {
                // Remove Quill toolbar and editor
                const toolbar = editorElement.querySelector('.ql-toolbar');
                const editor = editorElement.querySelector('.ql-editor');
                if (toolbar) toolbar.remove();
                if (editor) {
                    // Move content back to the original element
                    editorElement.innerHTML = editor.innerHTML;
                }
                // Reset the element
                editorElement.className = '';
                editorElement.style.height = '300px';
            }
            this.quillEditor = null;
        }
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
            // Get content from editor (Quill or TinyMCE)
            let content = '';
            
            // First, try TinyMCE editor
            if (typeof tinymce !== 'undefined') {
                const tinyMCEEditor = tinymce.get('resource-editor');
                if (tinyMCEEditor) {
                    content = tinyMCEEditor.getContent();
                    console.log('📝 Content from TinyMCE editor:', content ? 'Content found' : 'No content');
                }
            }
            
            // If no content from TinyMCE, try Quill editor
            if (!content && this.quillEditor) {
                // Try multiple methods to get content
                if (this.quillEditor.root && this.quillEditor.root.innerHTML) {
                    content = this.quillEditor.root.innerHTML;
                } else if (this.quillEditor.getContents) {
                    // For Quill editor, get the HTML content
                    const delta = this.quillEditor.getContents();
                    if (delta && delta.ops && delta.ops.length > 0) {
                        // Convert Delta to HTML using Quill's method
                        content = this.quillEditor.root.innerHTML;
                    } else {
                        content = this.quillEditor.root.innerHTML;
                    }
                }
                
                // Fallback: check if there's any text content
                if (!content || content.trim() === '' || content === '<p><br></p>') {
                    const textContent = this.quillEditor.getText();
                    if (textContent && textContent.trim() !== '') {
                        content = `<p>${textContent}</p>`;
                    }
                }
                
                // Clean up content: remove Quill wrapper div and ensure proper formatting
                if (content) {
                    // Remove Quill editor wrapper div and other Quill-specific elements
                    // Extract content from ql-editor if present
                    if (content.includes('class="ql-editor"')) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = content;
                        const qlEditor = tempDiv.querySelector('.ql-editor');
                        if (qlEditor) {
                            content = qlEditor.innerHTML;
                            console.log('📝 Extracted content from ql-editor wrapper');
                        }
                    }
                    
                    // Remove other Quill artifacts (clipboard, tooltip divs)
                    content = content.replace(/<div[^>]*class="ql-clipboard"[^>]*>.*?<\/div>/gs, '');
                    content = content.replace(/<div[^>]*class="ql-tooltip"[^>]*>.*?<\/div>/gs, '');
                    
                    // Apply the same content processing logic used for blogs
                    content = this.processContentForSaving(content);
                    
                    console.log('📝 Processed content for saving (first 200 chars):', content.substring(0, 200));
                }
            }
            
            // Additional fallback: check the editor element directly
            if (!content || content.trim() === '' || content === '<p><br></p>') {
                const editorElement = document.getElementById('resource-editor');
                if (editorElement) {
                    content = editorElement.innerHTML;
                }
            }
            
            console.log('📝 Content being sent:', content ? 'Content found' : 'No content');
            console.log('📝 Content length:', content.length);
            console.log('📝 Content preview:', content.substring(0, 200) + '...');
            
            // Validate content
            if (!content || content.trim() === '' || content === '<p><br></p>' || content === '<p></p>') {
                console.error('❌ Content is empty or invalid!');
                this.showNotification('Content is required. Please add some content to the editor.', 'error');
                this.isSaving = false;
                return;
            }
            
            formData.append('content', content);
            
            // Debug: Log all form data being sent
            console.log('📤 Form data being sent:');
            for (let [key, value] of formData.entries()) {
                if (typeof value === 'string') {
                    console.log(`${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
                } else {
                    console.log(`${key}: [File]`);
                }
            }
            formData.append('industry_id', document.getElementById('resource-industry').value);
            formData.append('status', document.getElementById('resource-status').value);
            
            // Meta fields (optional - only add if elements exist)
            const metaTitleEl = document.getElementById('resource-meta-title');
            const metaDescEl = document.getElementById('resource-meta-description');
            const metaKeywordsEl = document.getElementById('resource-meta-keywords');
            
            if (metaTitleEl) formData.append('meta_title', metaTitleEl.value);
            if (metaDescEl) formData.append('meta_description', metaDescEl.value);
            if (metaKeywordsEl) formData.append('meta_keywords', metaKeywordsEl.value);
            
            // Tags
            const tagsInput = document.getElementById('resource-tags').value;
            if (tagsInput) {
                const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
                formData.append('tags', JSON.stringify(tags));
            }
            
            // File uploads
            const featuredImageInput = document.getElementById('featured-image-input') || document.getElementById('featured-image');
            if (featuredImageInput && featuredImageInput.files[0]) {
                formData.append('featured_image', featuredImageInput.files[0]);
            }
            
            const authorImageInput = document.getElementById('author-image-input') || document.getElementById('author-image');
            if (authorImageInput && authorImageInput.files[0]) {
                formData.append('author_image', authorImageInput.files[0]);
            }
            
            const galleryInput = document.getElementById('gallery-input');
            if (galleryInput && galleryInput.files) {
                for (let file of galleryInput.files) {
                    formData.append('gallery', file);
                }
            }
            
            const url = this.currentResourceId ? 
                `${this.apiBase}/resources/${this.currentResourceId}` : 
                `${this.apiBase}/resources`;
            
            const method = this.currentResourceId ? 'PUT' : 'POST';
            
            console.log('🔑 Using token for request:', this.token ? 'Present' : 'Missing');
            console.log('🌐 Making request to:', url);
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });
            
            console.log('📡 Response status:', response.status);
            
            const data = await response.json();
            
            console.log('📊 Save response:', { ok: response.ok, data });
            
            if (response.ok && data.success) {
                console.log('✅ Resource saved successfully, closing modal and refreshing...');
                this.closeResourceModal();
                this.showNotification('Resource saved successfully!', 'success');
                
                // Refresh the current section data
                const currentSection = this.getCurrentSection();
                console.log('🔄 Current section:', currentSection);
                await this.loadSectionData(currentSection);
                
                // If we're in blogs section, also refresh the blog list specifically
                if (currentSection === 'blogs' || window.location.pathname.includes('cms-blogs')) {
                    console.log('📝 Refreshing blog posts...');
                    // Call the page-specific loadBlogPosts function if it exists
                    if (typeof window.loadBlogPosts === 'function') {
                        console.log('📝 Calling window.loadBlogPosts...');
                        await window.loadBlogPosts();
                    } else {
                        console.log('📝 Calling this.loadBlogPosts...');
                        await this.loadBlogPosts();
                    }
                }
                
                // Also refresh draft resources for dashboard
                await this.loadDraftResources();
            } else {
                console.log('❌ Save failed:', data);
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
            console.log('🔍 Attempting to edit resource with ID:', id);
            const response = await this.apiCall(`/resources/${id}`);
            console.log('📝 Resource data received:', response);
            console.log('📝 Content field value:', response.content);
            console.log('📝 Content length:', response.content ? response.content.length : 0);
            const resource = response;
            
            // Always reinitialize Quill editor to avoid double instances
            if (typeof Quill !== 'undefined') {
                console.log('🔧 Reinitializing Quill editor for edit...');
                this.initQuillEditor();
            } else {
                console.error('❌ Quill is not available');
            }
            
            // Populate form
            document.getElementById('resource-title').value = resource.title;
            document.getElementById('resource-type').value = resource.type;
            document.getElementById('resource-excerpt').value = resource.excerpt || '';
            document.getElementById('resource-author').value = resource.author || '';
            
            // Set content in editor with a delay to ensure it's ready
            setTimeout(() => {
                if (this.quillEditor && this.quillEditor.root) {
                    // Content is stored as HTML, so set it directly
                    console.log('📝 Loading content into editor:', resource.content);
                    
                    // Extract content from Quill wrapper if it exists
                    let cleanContent = resource.content || '';
                    if (cleanContent.includes('class="ql-editor"')) {
                        // Extract content from the ql-editor div
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = cleanContent;
                        const qlEditor = tempDiv.querySelector('.ql-editor');
                        if (qlEditor) {
                            cleanContent = qlEditor.innerHTML;
                            console.log('📝 Extracted clean content from ql-editor wrapper');
                        }
                    }
                    
                    this.quillEditor.root.innerHTML = cleanContent;
                    console.log('✅ Content loaded successfully');
                    console.log('✅ Editor innerHTML now:', this.quillEditor.root.innerHTML.substring(0, 200));
                } else {
                    console.error('❌ Quill editor or root not available after timeout');
                }
            }, 500);
            
            // Format the loaded content after a short delay to ensure editor is ready
            // DISABLED: Let blog logic handle formatting on save
            // setTimeout(() => {
            //     console.log('🎯 Formatting loaded content in edit mode');
            //     this.forceFormatContent();
            // }, 1000);
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
            
            // Show existing images in preview
            console.log('📸 Featured image URL:', resource.featured_image || resource.image_url);
            console.log('📸 Author image URL:', resource.author_image || resource.authorImage);
            
            if (resource.featured_image || resource.image_url) {
                const featuredImagePreview = document.getElementById('featured-image-preview');
                if (featuredImagePreview) {
                    let imageUrl = resource.featured_image || resource.image_url;
                    // Ensure URL starts with /
                    if (imageUrl && !imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
                        imageUrl = '/' + imageUrl;
                    }
                    console.log('📸 Corrected featured image URL:', imageUrl);
                    featuredImagePreview.innerHTML = `<img src="${imageUrl}" alt="Featured Image">`;
                }
            }
            
            if (resource.author_image || resource.authorImage) {
                const authorImagePreview = document.getElementById('author-image-preview');
                if (authorImagePreview) {
                    let authorImageUrl = resource.author_image || resource.authorImage;
                    // Ensure URL starts with /
                    if (authorImageUrl && !authorImageUrl.startsWith('/') && !authorImageUrl.startsWith('http')) {
                        authorImageUrl = '/' + authorImageUrl;
                    }
                    console.log('📸 Corrected author image URL:', authorImageUrl);
                    authorImagePreview.innerHTML = `<img src="${authorImageUrl}" alt="Author Image">`;
                }
            }
            
            this.currentResourceId = id;
            document.getElementById('modal-title').textContent = 'Edit Resource';
            const modal = document.getElementById('resource-modal');
            modal.style.display = 'flex';
            modal.classList.add('active');
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

    createIndustriesSection() {
        // Create the industries section HTML structure
        let industriesSection = document.getElementById('industries-section');
        if (!industriesSection) {
            industriesSection = document.createElement('div');
            industriesSection.id = 'industries-section';
            industriesSection.className = 'section';
            document.querySelector('.content-area').appendChild(industriesSection);
        }
        
        // Load the industries data
        this.loadIndustriesManagement();
    }

    async loadIndustriesManagement() {
        try {
            console.log('🏭 Loading industries management...');
            const response = await this.apiCall('/industries');
            const industries = response;
            
            console.log('🏭 Industries loaded:', industries.length);
            
            // Get resource counts for each industry
            const industryCounts = {};
            try {
                const resourcesResponse = await this.apiCall('/resources?status=published&limit=1000');
                const resources = resourcesResponse.resources || [];
                
                // Count resources per industry
                resources.forEach(resource => {
                    if (resource.industry_id) {
                        industryCounts[resource.industry_id] = (industryCounts[resource.industry_id] || 0) + 1;
                    }
                });
            } catch (error) {
                console.warn('Could not load resource counts:', error);
            }
            
            // Create or update the industries section
            let industriesSection = document.getElementById('industries-section');
            if (!industriesSection) {
                industriesSection = document.createElement('div');
                industriesSection.id = 'industries-section';
                industriesSection.className = 'section';
                document.querySelector('.content-area').appendChild(industriesSection);
            }
            
            industriesSection.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Industries Management</h3>
                        <button class="btn btn-primary" onclick="cms.openIndustryModal()">
                            <i class="fas fa-plus"></i>
                            New Industry
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="loading" id="industries-loading" style="display: none;">
                            <div class="spinner"></div>
                            Loading industries...
                        </div>
                        <div id="industries-content">
                            ${industries.length === 0 ? 
                                '<p style="text-align: center; color: #64748b;">No industries found</p>' :
                                `
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Color</th>
                                            <th>Icon</th>
                                            <th>Resources</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${industries.map(industry => {
                                            const resourceCount = industryCounts[industry.id] || 0;
                                            return `
                                            <tr>
                                                <td>
                                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                                        <div style="width: 24px; height: 24px; background: ${industry.color || '#3b82f6'}; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75rem;">
                                                            ${industry.icon || '🏭'}
                                                        </div>
                                                        <span style="font-weight: 500;">${industry.name}</span>
                                                    </div>
                                                </td>
                                                <td>${industry.description || '-'}</td>
                                                <td>
                                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                                        <div style="width: 20px; height: 20px; background: ${industry.color || '#3b82f6'}; border-radius: 50%; border: 1px solid #e2e8f0;"></div>
                                                        <span style="font-size: 0.875rem; color: #64748b;">${industry.color || '#3b82f6'}</span>
                                                    </div>
                                                </td>
                                                <td>${industry.icon || '-'}</td>
                                                <td>
                                                    <span class="badge ${resourceCount > 0 ? 'badge-success' : 'badge-secondary'}">${resourceCount} resources</span>
                                                </td>
                                                <td>${new Date(industry.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button class="btn btn-sm btn-secondary" onclick="cms.editIndustry(${industry.id})" title="Edit">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button class="btn btn-sm btn-danger" onclick="cms.deleteIndustry(${industry.id})" title="Delete">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                        }).join('')}
                                    </tbody>
                                </table>
                                `
                            }
                        </div>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading industries management:', error);
        }
    }

    openIndustryModal(industryId = null) {
        // Create industry modal if it doesn't exist
        let industryModal = document.getElementById('industry-modal');
        if (!industryModal) {
            industryModal = document.createElement('div');
            industryModal.id = 'industry-modal';
            industryModal.className = 'modal';
            industryModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title" id="industry-modal-title">New Industry</h3>
                        <button class="modal-close" onclick="cms.closeIndustryModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="industry-form">
                            <div class="form-group">
                                <label class="form-label">Name *</label>
                                <input type="text" class="form-input" id="industry-name" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Description</label>
                                <textarea class="form-input form-textarea" id="industry-description" placeholder="Brief description of the industry"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Color</label>
                                <input type="color" class="form-input" id="industry-color" value="#3b82f6">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Icon</label>
                                <input type="text" class="form-input" id="industry-icon" placeholder="🏭 (emoji or icon name)">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Sort Order</label>
                                <input type="number" class="form-input" id="industry-sort-order" value="0">
                            </div>
                            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                                <button type="button" class="btn btn-secondary" onclick="cms.closeIndustryModal()">Cancel</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i>
                                    Save Industry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(industryModal);
        }
        
        // Reset form
        document.getElementById('industry-form').reset();
        document.getElementById('industry-color').value = '#3b82f6';
        document.getElementById('industry-sort-order').value = '0';
        
        // Set title
        document.getElementById('industry-modal-title').textContent = industryId ? 'Edit Industry' : 'New Industry';
        
        // Store industry ID for editing
        industryModal.dataset.industryId = industryId || '';
        
        // Show modal
        industryModal.style.display = 'flex';
        industryModal.classList.add('active');
    }

    closeIndustryModal() {
        const modal = document.getElementById('industry-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    }

    async editIndustry(industryId) {
        try {
            const response = await this.apiCall(`/industries/${industryId}`);
            const industry = response;
            
            // Populate form
            document.getElementById('industry-name').value = industry.name;
            document.getElementById('industry-description').value = industry.description || '';
            document.getElementById('industry-color').value = industry.color || '#3b82f6';
            document.getElementById('industry-icon').value = industry.icon || '';
            document.getElementById('industry-sort-order').value = industry.sort_order || 0;
            
            this.openIndustryModal(industryId);
        } catch (error) {
            console.error('Error loading industry:', error);
            this.showNotification('Error loading industry', 'error');
        }
    }

    async deleteIndustry(industryId) {
        if (!confirm('Are you sure you want to delete this industry?')) {
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/industries/${industryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                this.showNotification('Industry deleted successfully!', 'success');
                this.loadIndustriesManagement();
                // Also reload industries for resource forms
                await this.loadIndustries();
            } else {
                const data = await response.json();
                this.showNotification(data.error || 'Error deleting industry', 'error');
            }
        } catch (error) {
            console.error('Error deleting industry:', error);
            this.showNotification('Error deleting industry', 'error');
        }
    }

    logout() {
        localStorage.removeItem('cms_token');
        localStorage.removeItem('cms_user');
        this.showLogin();
    }

    convertToBullets() {
        console.log('✦ Converting to bullets...');
        
        if (!this.quillEditor) {
            console.log('❌ Quill editor not available');
            return;
        }
        
        // Get all text content from the editor
        const editorElement = this.quillEditor.root;
        const allText = editorElement.innerText || editorElement.textContent || '';
        
        console.log('📝 Current text content:', allText);
        
        // Split into lines and process
        const lines = allText.split('\n').filter(line => line.trim());
        const processedLines = [];
        let currentList = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Check if it's a numbered item (digit or letter)
            if (trimmed.match(/^[\d]+\./) || trimmed.match(/^[a-zA-Z]+\./)) {
                // Extract text after number/letter and period
                let itemText = trimmed.replace(/^[\d]+\.\s*/, '').replace(/^[a-zA-Z]+\.\s*/, '');
                // Remove any remaining numbers/letters at the start
                itemText = itemText.replace(/^[\d]+\.\s*/, '').replace(/^[a-zA-Z]+\.\s*/, '');
                currentList.push(`<li>${itemText}</li>`);
            } else if (trimmed && currentList.length > 0) {
                // End of list, add the list and then the current line
                if (currentList.length > 0) {
                    processedLines.push(`<ul>${currentList.join('')}</ul>`);
                    currentList = [];
                }
                processedLines.push(`<p>${trimmed}</p>`);
            } else {
                // Regular line
                if (currentList.length > 0) {
                    processedLines.push(`<ul>${currentList.join('')}</ul>`);
                    currentList = [];
                }
                processedLines.push(`<p>${trimmed}</p>`);
            }
        }
        
        // Handle any remaining list items
        if (currentList.length > 0) {
            processedLines.push(`<ul>${currentList.join('')}</ul>`);
        }
        
        const newContent = processedLines.join('');
        console.log('📝 New content with bullets:', newContent);
        
        // Update the editor
        editorElement.innerHTML = newContent;
        
        console.log('✅ Converted to bullets');
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
