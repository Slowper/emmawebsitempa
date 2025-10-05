// Loading Screen Component Functionality
function initializeLoadingScreen() {
    // Check if we're on home page
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '/home';
    
    // Add class to body to prevent scrolling during loading
    document.body.classList.add('loading-screen-active');
    
    // Hide main content initially when loading screen is present
    const mainContent = document.querySelector('.hero-section') || document.querySelector('.hero') || document.querySelector('main') || document.querySelector('body > section:first-of-type');
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.visibility = 'hidden';
    }
    
    // Show skip button only on home page
    if (isHomePage) {
        const skipButton = document.getElementById('skipLoading');
        if (skipButton) {
            skipButton.style.display = 'block';
        }
    }

    // Loading Screen Script
    window.addEventListener('load', function() {
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingText = document.querySelector('.loading-text');
        const mainContent = document.querySelector('.hero-section') || document.querySelector('.hero') || document.querySelector('main') || document.querySelector('body > section:first-of-type');
        
        if (!loadingScreen) return;

        // Different loading messages and timing based on page
        let loadingMessages, loadingDuration;
        
        if (isHomePage) {
            loadingMessages = [
                'Initializing Neural Networks...',
                'Loading AI Models...',
                'Calibrating Sensors...',
                'Optimizing Performance...',
                'Almost Ready...'
            ];
            loadingDuration = 4000; // 4 seconds for home page
        } else {
            loadingMessages = [
                'Loading...',
                'Almost Ready...'
            ];
            loadingDuration = 2000; // 2 seconds for other pages
        }
        
        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            if (messageIndex < loadingMessages.length - 1) {
                messageIndex++;
                if (loadingText) {
                    loadingText.textContent = loadingMessages[messageIndex];
                }
            } else {
                clearInterval(messageInterval);
            }
        }, 800);
        
        // Hide loading screen after specified duration
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    // Remove body class to allow scrolling
                    document.body.classList.remove('loading-screen-active');
                    // Show main content
                    if (mainContent) {
                        mainContent.style.opacity = '1';
                        mainContent.style.visibility = 'visible';
                        mainContent.style.transition = 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out';
                        
                        // Ensure all main content is visible after loading
                        setTimeout(() => {
                            ensureMainContentVisible();
                        }, 500);
                    }
                }, 500);
            }
        }, loadingDuration);
    });

    // Skip loading button functionality
    document.addEventListener('DOMContentLoaded', function() {
        const skipButton = document.getElementById('skipLoading');
        if (skipButton) {
            skipButton.addEventListener('click', function() {
                const loadingScreen = document.getElementById('loadingScreen');
                const mainContent = document.querySelector('.hero-section') || document.querySelector('.hero') || document.querySelector('main') || document.querySelector('body > section:first-of-type');
                
                if (loadingScreen) {
                    loadingScreen.classList.add('fade-out');
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        // Remove body class to allow scrolling
                        document.body.classList.remove('loading-screen-active');
                        // Show main content
                        if (mainContent) {
                            mainContent.style.opacity = '1';
                            mainContent.style.visibility = 'visible';
                            mainContent.style.transition = 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out';
                            
                            // Ensure all main content is visible after loading
                            setTimeout(() => {
                                ensureMainContentVisible();
                            }, 500);
                        }
                    }, 100);
                }
            });
        }
    });
}

// Function to ensure main content is visible (used across pages)
function ensureMainContentVisible() {
    // This function can be customized per page if needed
    const allElements = document.querySelectorAll('h1, h2, h3, .hero-content, .section-content, .pricing-card, .custom-solutions, .custom-feature, .plan-name');
    allElements.forEach(el => {
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.transform = 'translateY(0) translateX(0) scale(1)';
        el.style.transition = 'all 0.6s ease-out';
    });
}

// Initialize loading screen when component is loaded
document.addEventListener('DOMContentLoaded', initializeLoadingScreen);
