// Global variables
let currentSection = 'homepage';
let authToken = null;
let banners = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        authToken = token;
        showDashboard();
        loadContent();
    } else {
        showLogin();
    }

    // Setup event listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
});

// Login functionality
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            showDashboard();
            loadContent();
        } else {
            showError(data.message || 'Login failed');
        }
    } catch (error) {
        showError('Connection error. Please try again.');
    }
}

// Show login screen
function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

// Logout functionality
function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    showLogin();
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success';
    alertDiv.textContent = message;
    document.getElementById('alertContainer').appendChild(alertDiv);
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Show loading
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

// Hide loading
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Navigation
function showSection(section) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });

    // Show selected section
    if (section === 'homepage') {
        document.getElementById('homepageSection').style.display = 'block';
    } else if (section === 'banners') {
        document.getElementById('bannersSection').style.display = 'block';
        loadBanners();
    } else if (section === 'pricing') {
        document.getElementById('pricingSection').style.display = 'block';
        loadPricingPlans();
        loadPricingSectionContent();
    } else {
        showOtherSection(section);
    }

    currentSection = section;
}

// Show other sections
function showOtherSection(section) {
    const sectionNames = {
        'platform': 'Platform',
        'usecases': 'Use Cases',
        'marketplace': 'Market Place',
        'resources': 'Resources',
        'documentation': 'Documentation',
        'company': 'Company',
        'partners': 'Partners',
        'social': 'Address & Social Links'
    };

    document.getElementById('sectionTitle').textContent = sectionNames[section] + ' Management';
    document.getElementById('sectionSubtitle').textContent = `Manage ${sectionNames[section].toLowerCase()} content`;
    document.getElementById('sectionCardTitle').textContent = sectionNames[section] + ' Content';
    
    document.getElementById('otherSections').style.display = 'block';
}

// Load content
async function loadContent() {
    try {
        // Load hero section
        const heroResponse = await fetch('/api/content/hero');
        if (heroResponse.ok) {
            const heroData = await heroResponse.json();
            updateContent({ hero: heroData });
        }

        // Load navigation
        await loadNavigation();

        // Load sections
        const response = await fetch('/api/content/sections');
        if (response.ok) {
            const data = await response.json();
            updateContent(data);
        }
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Update content display
function updateContent(data) {
    if (data.hero) {
        document.getElementById('heroTitle').textContent = data.hero.title;
        document.getElementById('heroSubtitle').textContent = data.hero.subtitle;
        document.getElementById('heroButton').textContent = data.hero.buttonText;
        
        document.getElementById('heroTitleInput').value = data.hero.title;
        document.getElementById('heroSubtitleInput').value = data.hero.subtitle;
        document.getElementById('heroButtonInput').value = data.hero.buttonText;
    }
}

// Save hero section
async function saveHeroSection() {
    const heroData = {
        title: document.getElementById('heroTitleInput').value,
        subtitle: document.getElementById('heroSubtitleInput').value,
        description: document.getElementById('heroDescriptionInput')?.value || '',
        primaryButton: {
            text: document.getElementById('heroButtonInput').value,
            href: '#demo'
        },
        secondaryButton: {
            text: 'Watch Demo',
            href: '#video',
            show: false
        }
    };

    try {
        const response = await fetch('/api/content/hero', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(heroData)
        });

        if (response.ok) {
            // Update preview
            document.getElementById('heroTitle').textContent = heroData.title;
            document.getElementById('heroSubtitle').textContent = heroData.subtitle;
            document.getElementById('heroButton').textContent = heroData.primaryButton.text;
            
            // Trigger refresh on the main website
            if (window.parent && window.parent.dynamicContent) {
                window.parent.dynamicContent.refreshHero();
            }
            
            showSuccess('Hero section updated successfully! Changes will appear on the website immediately.');
        } else {
            showError('Failed to update hero section');
        }
    } catch (error) {
        showError('Error updating hero section');
    }
}

// Load banners
async function loadBanners() {
    try {
        const response = await fetch('/api/content/banners', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            banners = await response.json();
            displayBanners();
        }
    } catch (error) {
        console.error('Error loading banners:', error);
    }
}

// Display banners in table
function displayBanners() {
    const tbody = document.getElementById('bannersTableBody');
    tbody.innerHTML = '';

    banners.forEach(banner => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${banner.id}</td>
            <td>${banner.title}</td>
            <td>
                <input type="number" value="${banner.ordering}" 
                       onchange="updateBannerOrder(${banner.id}, this.value)"
                       style="width: 60px; padding: 4px; border: 1px solid #d1d5db; border-radius: 4px;">
            </td>
            <td>
                <span class="status-badge ${banner.status === 'active' ? 'status-active' : 'status-inactive'}">
                    ${banner.status}
                </span>
            </td>
            <td>
                <button class="btn btn-primary" onclick="editBanner(${banner.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteBanner(${banner.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add new banner
function addNewBanner() {
    const modal = document.getElementById('editModal');
    document.getElementById('modalTitle').textContent = 'Add New Banner';
    
    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label>Title</label>
            <input type="text" id="bannerTitle" placeholder="Enter banner title">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="bannerDescription" placeholder="Enter banner description"></textarea>
        </div>
        <div class="form-group">
            <label>Ordering</label>
            <input type="number" id="bannerOrdering" value="1">
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="bannerStatus">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Edit banner
function editBanner(id) {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;

    const modal = document.getElementById('editModal');
    document.getElementById('modalTitle').textContent = 'Edit Banner';
    
    document.getElementById('modalBody').innerHTML = `
        <div class="form-group">
            <label>Title</label>
            <input type="text" id="bannerTitle" value="${banner.title}">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="bannerDescription">${banner.description || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Ordering</label>
            <input type="number" id="bannerOrdering" value="${banner.ordering}">
        </div>
        <div class="form-group">
            <label>Status</label>
            <select id="bannerStatus">
                <option value="active" ${banner.status === 'active' ? 'selected' : ''}>Active</option>
                <option value="inactive" ${banner.status === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Save modal content
async function saveModalContent() {
    const title = document.getElementById('bannerTitle').value;
    const description = document.getElementById('bannerDescription').value;
    const ordering = parseInt(document.getElementById('bannerOrdering').value);
    const status = document.getElementById('bannerStatus').value;

    if (!title) {
        showError('Title is required');
        return;
    }

    try {
        const response = await fetch('/api/content/banners', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title,
                description,
                ordering,
                status
            })
        });

        if (response.ok) {
            closeModal();
            loadBanners();
            showSuccess('Banner saved successfully!');
        } else {
            showError('Failed to save banner');
        }
    } catch (error) {
        showError('Error saving banner');
    }
}

// Close modal
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Update banner order
async function updateBannerOrder(id, ordering) {
    try {
        const response = await fetch(`/api/content/banners/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ ordering: parseInt(ordering) })
        });

        if (response.ok) {
            showSuccess('Banner order updated!');
        }
    } catch (error) {
        showError('Error updating banner order');
    }
}

// Delete banner
async function deleteBanner(id) {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
        const response = await fetch(`/api/content/banners/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            loadBanners();
            showSuccess('Banner deleted successfully!');
        } else {
            showError('Failed to delete banner');
        }
    } catch (error) {
        showError('Error deleting banner');
    }
}

// Edit hero section
function editHeroSection() {
    showSuccess('Hero section editor opened!');
}

// Edit section
function editSection() {
    showSuccess('Section editor opened!');
}

// Navigation Management
async function loadNavigation() {
    try {
        const response = await fetch('/api/content/navigation');
        if (response.ok) {
            const navData = await response.json();
            updateNavigationForm(navData);
        }
    } catch (error) {
        console.error('Error loading navigation:', error);
    }
}

function updateNavigationForm(navData) {
    const navLinksInput = document.getElementById('navLinksInput');
    if (navLinksInput && navData.links) {
        navLinksInput.value = navData.links.map(link => link.text).join('\n');
    }
}

async function saveNavigation() {
    const navLinksText = document.getElementById('navLinksInput').value;
    const links = navLinksText.split('\n').filter(link => link.trim()).map(link => ({
        text: link.trim(),
        href: `#${link.toLowerCase().replace(/\s+/g, '-')}`
    }));

    try {
        const response = await fetch('/api/content/navigation', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ links })
        });

        if (response.ok) {
            showSuccess('Navigation updated successfully! Changes will appear on the website immediately.');
        } else {
            showError('Failed to update navigation');
        }
    } catch (error) {
        showError('Error updating navigation');
    }
}

function editNavigation() {
    showSuccess('Navigation editor opened!');
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
            updatePricingPreview();
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

function updatePricingPreview() {
    const title = document.getElementById('pricingPreviewTitle');
    const subtitle = document.getElementById('pricingPreviewSubtitle');
    const cards = document.getElementById('pricingPreviewCards');
    
    if (title && pricingContent) title.textContent = pricingContent.title;
    if (subtitle && pricingContent) subtitle.textContent = pricingContent.subtitle;
    
    if (cards && pricingContent) {
        cards.innerHTML = '';
        pricingContent.plans.forEach(plan => {
            const card = document.createElement('div');
            card.className = 'pricing-preview-card';
            card.innerHTML = `
                <h4>${plan.name}</h4>
                <p>${plan.description}</p>
                <div class="price">${plan.price} ${plan.period}</div>
                <ul>
                    ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            `;
            cards.appendChild(card);
        });
    }
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
