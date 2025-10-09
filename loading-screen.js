// Independent Loading Screen - Only shows during page load
(function() {
    'use strict';
    
    // Check if we're on home page
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '/home';
    
    // Create loading screen HTML
    const loadingScreenHTML = `
        <div class="loading-screen" id="loadingScreen" style="
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 99999 !important;
            background: 
                radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 30%, #16213e 70%, #0f172a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 1;
            transition: opacity 0.5s ease-out;
            overflow: hidden;
            cursor: default;
            pointer-events: auto;
        ">
            <div class="loading-content" style="
                text-align: center;
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                gap: 2rem;
                width: 100%;
                max-width: 800px;
                padding: 3rem;
                box-sizing: border-box;
            ">
                <!-- Animated Background Particles -->
                <div class="particles-container" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                ">
                    <div class="particle" style="
                        position: absolute;
                        width: 4px;
                        height: 4px;
                        background: rgba(139, 92, 246, 0.6);
                        border-radius: 50%;
                        animation: float 6s ease-in-out infinite;
                    " style="top: 20%; left: 10%; animation-delay: 0s;"></div>
                    <div class="particle" style="
                        position: absolute;
                        width: 4px;
                        height: 4px;
                        background: rgba(236, 72, 153, 0.6);
                        border-radius: 50%;
                        animation: float 6s ease-in-out infinite;
                    " style="top: 60%; left: 80%; animation-delay: 2s;"></div>
                    <div class="particle" style="
                        position: absolute;
                        width: 4px;
                        height: 4px;
                        background: rgba(59, 130, 246, 0.6);
                        border-radius: 50%;
                        animation: float 6s ease-in-out infinite;
                    " style="top: 40%; left: 70%; animation-delay: 4s;"></div>
                    <div class="particle" style="
                        position: absolute;
                        width: 4px;
                        height: 4px;
                        background: rgba(139, 92, 246, 0.4);
                        border-radius: 50%;
                        animation: float 6s ease-in-out infinite;
                    " style="top: 80%; left: 20%; animation-delay: 1s;"></div>
                    <div class="particle" style="
                        position: absolute;
                        width: 4px;
                        height: 4px;
                        background: rgba(236, 72, 153, 0.4);
                        border-radius: 50%;
                        animation: float 6s ease-in-out infinite;
                    " style="top: 30%; left: 50%; animation-delay: 3s;"></div>
                    <div class="particle" style="
                        position: absolute;
                        width: 4px;
                        height: 4px;
                        background: rgba(59, 130, 246, 0.4);
                        border-radius: 50%;
                        animation: float 6s ease-in-out infinite;
                    " style="top: 70%; left: 60%; animation-delay: 5s;"></div>
                </div>

                <!-- Floating Code Elements -->
                <div class="floating-code" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                ">
                    <div class="code-snippet" style="
                        position: absolute;
                        color: rgba(139, 92, 246, 0.3);
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                        transform: rotate(15deg);
                        animation: float 8s ease-in-out infinite;
                    " style="top: 20%; right: 10%; animation-delay: 0s;">&lt;AI&gt;</div>
                    <div class="code-snippet" style="
                        position: absolute;
                        color: rgba(236, 72, 153, 0.3);
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                        transform: rotate(-10deg);
                        animation: float 8s ease-in-out infinite;
                    " style="bottom: 30%; left: 10%; animation-delay: 2s;">neural_network()</div>
                    <div class="code-snippet" style="
                        position: absolute;
                        color: rgba(59, 130, 246, 0.3);
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                        transform: rotate(20deg);
                        animation: float 8s ease-in-out infinite;
                    " style="top: 50%; right: 20%; animation-delay: 4s;">autonomous_agent()</div>
                    <div class="code-snippet" style="
                        position: absolute;
                        color: rgba(139, 92, 246, 0.2);
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        transform: rotate(-15deg);
                        animation: float 8s ease-in-out infinite;
                    " style="bottom: 20%; right: 30%; animation-delay: 6s;">machine_learning()</div>
                </div>

                <!-- EMMA Logo -->
                <div class="logo-container" style="
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                ">
                    <img src="/Logo And Recording/cropped_circle_image.png" 
                         alt="EMMA Logo" 
                         class="loading-logo-image">
                </div>

                <!-- Glitch Text Effect -->
                <div class="glitch-text" style="
                    font-size: 4rem;
                    font-weight: bold;
                    background: linear-gradient(135deg, #8b5cf6, #ec4899, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-shadow: 
                        0.05em 0 0 rgba(139, 92, 246, 0.3),
                        -0.03em -0.04em 0 rgba(236, 72, 153, 0.3),
                        0.025em 0.04em 0 rgba(59, 130, 246, 0.3);
                    animation: glitch 2s linear infinite;
                    margin-bottom: 1rem;
                ">Hi Emma</div>

                <!-- Typewriter Effect -->
                <div class="typewriter" style="
                    font-size: 1.2rem;
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 2rem;
                    min-height: 1.5rem;
                ">Building the future of autonomous AI agents...</div>

                <!-- Loading Spinner -->
                <div class="loading-spinner" style="
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                ">
                    <div class="spinner-ring" style="
                        width: 20px;
                        height: 20px;
                        border: 2px solid rgba(139, 92, 246, 0.3);
                        border-top: 2px solid #8b5cf6;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    <div class="spinner-ring" style="
                        width: 20px;
                        height: 20px;
                        border: 2px solid rgba(236, 72, 153, 0.3);
                        border-top: 2px solid #ec4899;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        animation-delay: 0.2s;
                    "></div>
                    <div class="spinner-ring" style="
                        width: 20px;
                        height: 20px;
                        border: 2px solid rgba(59, 130, 246, 0.3);
                        border-top: 2px solid #3b82f6;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        animation-delay: 0.4s;
                    "></div>
                </div>

                <!-- Loading Text -->
                <div class="loading-text" style="
                    font-size: 1rem;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 2rem;
                ">Initializing Neural Networks...</div>
                
                <!-- Skip Loading Button (only for home page) -->
                ${isHomePage ? `
                <button id="skipLoading" style="
                    margin-top: 2rem;
                    padding: 0.5rem 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
                    Skip Loading
                </button>
                ` : ''}
            </div>
        </div>
        
        <style>
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(5deg); }
            }
            
            @keyframes logoAnimation {
                0% { 
                    transform: translateY(0px) rotate(0deg) scale(1);
                    filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5));
                }
                25% { 
                    transform: translateY(-8px) rotate(2deg) scale(1.05);
                    filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.7)) drop-shadow(0 0 40px rgba(236, 72, 153, 0.4));
                }
                50% { 
                    transform: translateY(-12px) rotate(-1deg) scale(1.1);
                    filter: drop-shadow(0 0 40px rgba(139, 92, 246, 0.8)) drop-shadow(0 0 60px rgba(236, 72, 153, 0.6)) drop-shadow(0 0 80px rgba(59, 130, 246, 0.4));
                }
                75% { 
                    transform: translateY(-6px) rotate(1deg) scale(1.03);
                    filter: drop-shadow(0 0 35px rgba(139, 92, 246, 0.6)) drop-shadow(0 0 50px rgba(236, 72, 153, 0.5));
                }
                100% { 
                    transform: translateY(0px) rotate(0deg) scale(1);
                    filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5));
                }
            }
            
            .loading-logo-image {
                width: 120px !important;
                height: 120px !important;
                object-fit: contain !important;
                animation: logoAnimation 3s ease-in-out infinite !important;
                filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.5)) !important;
            }
            
            @keyframes glitch {
                0%, 100% { transform: translate(0); }
                20% { transform: translate(-2px, 2px); }
                40% { transform: translate(-2px, -2px); }
                60% { transform: translate(2px, 2px); }
                80% { transform: translate(2px, -2px); }
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-screen.fade-out {
                opacity: 0;
                pointer-events: none;
            }
            
            /* Prevent body scroll when loading screen is active */
            body.loading-screen-active {
                overflow: hidden !important;
                height: 100vh !important;
            }
        </style>
    `;
    
    // Add loading screen to page immediately
    document.body.insertAdjacentHTML('afterbegin', loadingScreenHTML);
    
    // Add class to body to prevent scrolling
    document.body.classList.add('loading-screen-active');
    
    // Hide main content initially - be more specific about hero section
    const heroSection = document.querySelector('.hero-section');
    const mainContent = document.querySelector('main') || document.querySelector('body > section:first-of-type');
    
    if (heroSection) {
        heroSection.style.opacity = '0';
        heroSection.style.visibility = 'hidden';
        heroSection.style.transition = 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out';
        console.log('Hero section hidden during loading');
    }
    
    if (mainContent && mainContent !== heroSection) {
        mainContent.style.opacity = '0';
        mainContent.style.visibility = 'hidden';
        mainContent.style.transition = 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out';
    }
    
    // Loading messages
    const loadingMessages = isHomePage ? [
        'Initializing Neural Networks...',
        'Loading AI Models...',
        'Calibrating Sensors...',
        'Optimizing Performance...',
        'Almost Ready...'
    ] : [
        'Loading...',
        'Almost Ready...'
    ];
    
    const loadingDuration = isHomePage ? 4000 : 2000;
    
    // Start loading animation
    let messageIndex = 0;
    const loadingText = document.querySelector('.loading-text');
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
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.remove();
                // Remove body class to allow scrolling
                document.body.classList.remove('loading-screen-active');
                
                // Show hero section specifically
                if (heroSection) {
                    heroSection.style.opacity = '1';
                    heroSection.style.visibility = 'visible';
                    console.log('Hero section shown after loading');
                }
                
                // Show other main content
                if (mainContent && mainContent !== heroSection) {
                    mainContent.style.opacity = '1';
                    mainContent.style.visibility = 'visible';
                }
                
                // Force ensure all sections are visible
                const allSections = document.querySelectorAll('section, .hero-section, .capabilities, .industries');
                allSections.forEach(section => {
                    if (section.style.opacity === '0' || section.style.visibility === 'hidden') {
                        section.style.opacity = '1';
                        section.style.visibility = 'visible';
                        section.style.transition = 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out';
                    }
                });
            }, 500);
        }
    }, loadingDuration);
    
    // Skip button functionality
    if (isHomePage) {
        document.addEventListener('click', function(e) {
            if (e.target && e.target.id === 'skipLoading') {
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) {
                    loadingScreen.classList.add('fade-out');
                    setTimeout(() => {
                        loadingScreen.remove();
                        // Remove body class to allow scrolling
                        document.body.classList.remove('loading-screen-active');
                        
                        // Show hero section specifically
                        if (heroSection) {
                            heroSection.style.opacity = '1';
                            heroSection.style.visibility = 'visible';
                            console.log('Hero section shown after skip loading');
                        }
                        
                        // Show other main content
                        if (mainContent && mainContent !== heroSection) {
                            mainContent.style.opacity = '1';
                            mainContent.style.visibility = 'visible';
                            mainContent.style.transition = 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out';
                        }
                        
                        // Force ensure all sections are visible
                        const allSections = document.querySelectorAll('section, .hero-section, .capabilities, .industries');
                        allSections.forEach(section => {
                            if (section.style.opacity === '0' || section.style.visibility === 'hidden') {
                                section.style.opacity = '1';
                                section.style.visibility = 'visible';
                                section.style.transition = 'opacity 0.5s ease-in-out, visibility 0.5s ease-in-out';
                            }
                        });
                    }, 100);
                }
            }
        });
    }
})();
