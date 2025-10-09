// Load Header and Footer Components
async function loadComponents() {
    try {
        console.log('🔄 Loading components...');
        
        // Load header
        const headerResponse = await fetch('/components/header.html');
        const headerHTML = await headerResponse.text();
        const headerContainer = document.getElementById('header-container') || document.getElementById('header-placeholder');
        
        console.log('📦 Header container found:', !!headerContainer);
        console.log('📦 Header HTML length:', headerHTML.length);
        
        if (headerContainer) {
            headerContainer.innerHTML = headerHTML;
            console.log('✅ Header loaded successfully');
            console.log('📦 Header container content length:', headerContainer.innerHTML.length);
            console.log('📦 Header container visible:', headerContainer.offsetHeight > 0);
        } else {
            console.error('❌ Header container not found');
        }
        
        // Load footer
        const footerResponse = await fetch('/components/footer.html');
        const footerHTML = await footerResponse.text();
        const footerContainer = document.getElementById('footer-placeholder') || document.getElementById('footer-container');
        if (footerContainer) {
            footerContainer.innerHTML = footerHTML;
        }
        
        // Set active navigation based on current page
        setActiveNavigation();
        
        // Initialize mobile menu functionality
        initializeMobileMenu();
        
        // Initialize footer functionality
        initializeFooter();
        
    } catch (error) {
        console.error('❌ Error loading components:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Error stack:', error.stack);
    }
}

// Set active navigation based on current page
function setActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // Set active based on current path
        if (currentPath === '/' && link.getAttribute('href') === '/') {
            link.classList.add('active');
        } else if (currentPath.startsWith('/about') && link.getAttribute('href') === '/about') {
            link.classList.add('active');
        } else if (currentPath.startsWith('/pricing') && link.getAttribute('href') === '/pricing') {
            link.classList.add('active');
        } else if (currentPath.startsWith('/resources') && link.getAttribute('href') === '/resources') {
            link.classList.add('active');
        } else if (currentPath.startsWith('/contact') && link.getAttribute('href') === '/contact') {
            link.classList.add('active');
        }
    });
}

// Initialize mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const navLinks = document.getElementById('navLinks');
    const navbar = document.querySelector('.navbar');
    
    // Open mobile menu - use the dropdown style for fullscreen
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle mobile menu dropdown (fullscreen)
            navLinks.classList.toggle('mobile-open');
            mobileMenuToggle.classList.toggle('active');
            mobileMenuToggle.setAttribute('aria-expanded', navLinks.classList.contains('mobile-open'));
            
            // Move mobile menu to body to avoid parent container clipping
            if (navLinks.classList.contains('mobile-open')) {
                // Store original parent
                if (!navLinks.dataset.originalParent) {
                    navLinks.dataset.originalParent = navLinks.parentNode.tagName;
                }
                // Move to body
                document.body.appendChild(navLinks);
            } else {
                // Move back to original parent if it exists
                const originalParent = document.querySelector('.nav-container');
                if (originalParent) {
                    originalParent.appendChild(navLinks);
                }
            }
            
            // Mobile menu is now working correctly
            
            // Hide navbar when menu is open
            if (navbar) {
                navbar.classList.toggle('mobile-menu-open', navLinks.classList.contains('mobile-open'));
            }
            
            // Prevent body scroll
            document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
        });
    }
    
    // Close mobile menu
    function closeMobileMenu() {
        if (navLinks) {
            navLinks.classList.remove('mobile-open');
            mobileMenuToggle.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            
            // Move back to original parent
            const originalParent = document.querySelector('.nav-container');
            if (originalParent) {
                originalParent.appendChild(navLinks);
            }
            
            // Show navbar again
            if (navbar) {
                navbar.classList.remove('mobile-menu-open');
            }
            
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }
    
    // Close on nav link click
    const navLinkElements = document.querySelectorAll('#navLinks .nav-link');
    navLinkElements.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
            closeMobileMenu();
        }
    });
    
    // Close on window resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks.classList.contains('mobile-open')) {
            closeMobileMenu();
        }
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('mobile-open') && 
            !mobileMenuToggle.contains(e.target) && 
            !navLinks.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close on close button click (CSS pseudo-element)
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('mobile-open') && 
            e.target === navLinks) {
            // Check if click is on the close button area (top-right corner)
            const rect = navLinks.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Close button is positioned at top: 2rem, right: 2rem with 48px size
            const closeButtonArea = {
                left: rect.width - 2 * 16 - 48, // 2rem = 32px, button width = 48px
                right: rect.width - 2 * 16,
                top: 2 * 16, // 2rem = 32px
                bottom: 2 * 16 + 48 // 2rem + button height
            };
            
            if (clickX >= closeButtonArea.left && clickX <= closeButtonArea.right &&
                clickY >= closeButtonArea.top && clickY <= closeButtonArea.bottom) {
                closeMobileMenu();
            }
        }
    });
}

// Initialize footer functionality
function initializeFooter() {
    // Set current year
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // Initialize newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('.newsletter-input').value;
            if (email) {
                alert('Thank you for subscribing!');
                newsletterForm.querySelector('.newsletter-input').value = '';
            }
        });
    }
}

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', loadComponents);
