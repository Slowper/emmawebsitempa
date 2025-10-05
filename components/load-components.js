// Load Header and Footer Components
async function loadComponents() {
    try {
        // Load header
        const headerResponse = await fetch('/components/header.html');
        const headerHTML = await headerResponse.text();
        document.getElementById('header-placeholder').innerHTML = headerHTML;
        
        // Load footer
        const footerResponse = await fetch('/components/footer.html');
        const footerHTML = await footerResponse.text();
        document.getElementById('footer-placeholder').innerHTML = footerHTML;
        
        // Set active navigation based on current page
        setActiveNavigation();
        
        // Initialize mobile menu functionality
        initializeMobileMenu();
        
        // Initialize footer functionality
        initializeFooter();
        
    } catch (error) {
        console.error('Error loading components:', error);
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
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
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
