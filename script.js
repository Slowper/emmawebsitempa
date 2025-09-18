// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Theme Management
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.detectAndSetTheme();
        this.watchSystemTheme();
    }

    detectAndSetTheme() {
        // Check if user has a saved preference
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Auto-detect system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = prefersDark ? 'dark' : 'light';
            this.setTheme(theme);
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Smooth theme transition
        gsap.to('body', {
            duration: 0.3,
            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
            color: theme === 'dark' ? '#f8fafc' : '#0f172a',
            ease: 'power2.out'
        });
    }

    watchSystemTheme() {
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.setTheme(newTheme);
            }
        });
    }
}

// Animation Manager
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.initHeroAnimations();
        this.initScrollAnimations();
        this.initParticleAnimations();
        this.initNeuralAnimations();
        this.initCardHoverEffects();
        this.initSmoothScrolling();
        this.initLanguageAudio();
    }

    initHeroAnimations() {
        // Hero title animation
        gsap.from('#hero-title', {
            duration: 1,
            y: 50,
            opacity: 0,
            stagger: 0.2,
            ease: 'power3.out'
        });

        // Hero subtitle animation
        gsap.from('#hero-subtitle', {
            duration: 1,
            y: 30,
            opacity: 0,
            delay: 0.4,
            ease: 'power3.out'
        });

        // Hero actions animation
        gsap.from('#hero-actions', {
            duration: 1,
            y: 30,
            opacity: 0,
            delay: 0.6,
            ease: 'power3.out'
        });

        // Hero visual animation
        gsap.from('.hero-visual', {
            duration: 1.2,
            scale: 0.8,
            opacity: 0,
            delay: 0.8,
            ease: 'back.out(1.7)'
        });
    }

    initScrollAnimations() {
        // Enhanced scroll-triggered animations with better timing and effects
        
        // Section headers with enhanced animation
        gsap.utils.toArray('.section-header').forEach((header, index) => {
            gsap.from(header, {
                scrollTrigger: {
                    trigger: header,
                    start: 'top 75%',
                    end: 'bottom 25%',
                    toggleActions: 'play none none reverse',
                    markers: false
                },
                duration: 1.2,
                y: 60,
                opacity: 0,
                scale: 0.9,
                ease: 'power3.out',
                delay: index * 0.1
            });
        });

        // Capability cards with staggered animation
        gsap.utils.toArray('.capability-card').forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                duration: 1,
                y: 80,
                opacity: 0,
                rotation: 5,
                scale: 0.8,
                ease: 'back.out(1.7)',
                delay: index * 0.15
            });
        });

        // Industry cards with enhanced effects
        gsap.utils.toArray('.industry-card').forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                duration: 1.2,
                y: 100,
                opacity: 0,
                scale: 0.85,
                rotation: -3,
                ease: 'power3.out',
                delay: index * 0.2
            });
        });

        // Feature cards with different animation
        gsap.utils.toArray('.feature-card').forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                duration: 1,
                x: index % 2 === 0 ? -100 : 100,
                opacity: 0,
                scale: 0.9,
                ease: 'power3.out',
                delay: index * 0.1
            });
        });

        // Lab cards with unique animation
        gsap.utils.toArray('.lab-card').forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                duration: 1.5,
                y: 120,
                opacity: 0,
                scale: 0.7,
                rotation: 10,
                ease: 'elastic.out(1, 0.3)',
                delay: index * 0.25
            });
        });

        // Hero stats with counter animation
        gsap.utils.toArray('.stat').forEach((stat, index) => {
            const statNumber = stat.querySelector('.stat-number');
            if (!statNumber) return; // Skip if element doesn't exist
            const finalValue = statNumber.textContent;
            
            gsap.from(stat, {
                scrollTrigger: {
                    trigger: stat,
                    start: 'top 85%',
                    end: 'bottom 15%',
                    toggleActions: 'play none none reverse'
                },
                duration: 1,
                y: 50,
                opacity: 0,
                scale: 0.8,
                ease: 'power3.out',
                delay: index * 0.1,
                onComplete: () => {
                    // Animate the number counting
                    gsap.from(statNumber, {
                        duration: 2,
                        textContent: 0,
                        ease: 'power2.out',
                        snap: { textContent: 1 },
                        onUpdate: function() {
                            statNumber.textContent = Math.round(this.targets()[0].textContent);
                        }
                    });
                }
            });
        });

        // CTA section with enhanced animation
        gsap.from('.cta, .labs-cta', {
            scrollTrigger: {
                trigger: '.cta, .labs-cta',
                start: 'top 75%',
                end: 'bottom 25%',
                toggleActions: 'play none none reverse'
            },
            duration: 1.5,
            y: 80,
            opacity: 0,
            scale: 0.9,
            ease: 'power3.out'
        });

        // Footer with slide up animation
        gsap.from('.footer', {
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 90%',
                end: 'bottom 10%',
                toggleActions: 'play none none reverse'
            },
            duration: 1.2,
            y: 100,
            opacity: 0,
            ease: 'power3.out'
        });

        // About Us Section Animations
        this.initAboutUsAnimations();

    }

    initAboutUsAnimations() {
        // Story timeline animations
        gsap.utils.toArray('.timeline-item').forEach((item, index) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                duration: 1,
                y: 50,
                opacity: 0,
                ease: 'power3.out',
                delay: index * 0.2
            });
        });

        // Story visual animation
        gsap.from('.story-image-container', {
            scrollTrigger: {
                trigger: '.story-visual',
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            duration: 1.2,
            scale: 0.8,
            opacity: 0,
            rotation: 5,
            ease: 'back.out(1.7)'
        });

        // Team cards animations
        gsap.utils.toArray('.team-card').forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 95%',
                    end: 'bottom 5%',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.8,
                y: 40,
                opacity: 0,
                scale: 0.9,
                ease: 'power3.out',
                delay: index * 0.1
            });
        });

        // Leadership cards with special animation - trigger immediately
        gsap.utils.toArray('.leadership-card').forEach((card, index) => {
            // Set initial state
            gsap.set(card, { opacity: 0, y: 20, scale: 0.95 });
            
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 100%',
                    end: 'bottom 0%',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.5,
                y: 0,
                opacity: 1,
                scale: 1,
                ease: 'power2.out',
                delay: index * 0.08
            });
        });

        // Subsection titles animation - trigger immediately
        gsap.utils.toArray('.subsection-title').forEach((title, index) => {
            // Set initial state
            gsap.set(title, { opacity: 0, y: 20 });
            
            gsap.to(title, {
                scrollTrigger: {
                    trigger: title,
                    start: 'top 100%',
                    end: 'bottom 0%',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.5,
                y: 0,
                opacity: 1,
                ease: 'power2.out',
                delay: index * 0.05
            });
        });

        // Story title special animation
        gsap.from('.story-title', {
            scrollTrigger: {
                trigger: '.story-title',
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            duration: 1.5,
            y: 60,
            opacity: 0,
            scale: 0.9,
            ease: 'power3.out'
        });
    }

    initParticleAnimations() {
        // Floating particles animation
        gsap.utils.toArray('.particle').forEach((particle, index) => {
            const speed = parseFloat(particle.dataset.speed) || 1;
            gsap.to(particle, {
                y: -100,
                rotation: 360,
                duration: 6 / speed,
                repeat: -1,
                ease: 'none',
                delay: index * 0.5
            });
        });
    }

    initNeuralAnimations() {
        // Neural connections animation
        gsap.utils.toArray('.connection').forEach((connection, index) => {
            const delay = parseFloat(connection.dataset.delay) || 0;
            gsap.to(connection, {
                opacity: 1,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'power2.inOut',
                delay: delay
            });
        });

        // Data flow animation
        gsap.utils.toArray('.data-point').forEach((point, index) => {
            const speed = parseFloat(point.dataset.speed) || 1;
            gsap.to(point, {
                x: 100,
                y: -100,
                duration: 4 / speed,
                repeat: -1,
                ease: 'none',
                delay: index * 0.5
            });
        });
    }

    initCardHoverEffects() {
        // Industry card hover effects
        gsap.utils.toArray('.industry-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.3,
                    y: -10,
                    scale: 1.02,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.3,
                    y: 0,
                    scale: 1,
                    ease: 'power2.out'
                });
            });
        });

        // Feature card hover effects
        gsap.utils.toArray('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.3,
                    y: -10,
                    scale: 1.02,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.3,
                    y: 0,
                    scale: 1,
                    ease: 'power2.out'
                });
            });
        });

        // Lab card hover effects
        gsap.utils.toArray('.lab-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.3,
                    y: -10,
                    scale: 1.02,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.3,
                    y: 0,
                    scale: 1,
                    ease: 'power2.out'
                });
            });
        });
    }

    initSmoothScrolling() {
        // Smooth scroll for navigation links
        gsap.utils.toArray('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: {
                            y: target,
                            offsetY: 80
                        },
                        ease: 'power3.inOut'
                    });
                }
            });
        });
    }

    initLanguageAudio() {
        // Audio file paths
        const audioFiles = {
            'en': '/Logo And Recording/Emma English Voice .opus',
            'ar': '/Logo And Recording/Emma Arabic Audio.opus',
            'hi': '/Logo And Recording/Emma Hindi Voice.opus'
        };

        // Current playing audio
        let currentAudio = null;
        let currentButton = null;

        // Add click event listeners to language buttons
        document.querySelectorAll('.lang-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // If clicking the same button that's currently playing, stop audio
                if (currentButton === button && currentAudio && !currentAudio.paused) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                    button.classList.remove('playing');
                    currentButton = null;
                    return;
                }
                
                // Stop any currently playing audio
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }

                // Remove active and playing classes from all buttons
                document.querySelectorAll('.lang-btn').forEach(btn => {
                    btn.classList.remove('active', 'playing', 'loading');
                });

                // Add active class to clicked button
                button.classList.add('active', 'loading');

                // Get language code
                const lang = button.getAttribute('data-lang');
                
                // Play audio for selected language
                if (audioFiles[lang]) {
                    console.log('Loading audio for language:', lang, 'File:', audioFiles[lang]);
                    currentAudio = new Audio(audioFiles[lang]);
                    currentButton = button;
                    
                    // Handle audio events
                    currentAudio.addEventListener('loadstart', () => {
                        console.log('Audio loading started for:', lang);
                        button.classList.add('loading');
                    });
                    
                    currentAudio.addEventListener('canplay', () => {
                        console.log('Audio can play for:', lang);
                        button.classList.remove('loading');
                    });
                    
                    currentAudio.addEventListener('play', () => {
                        console.log('Audio playing for:', lang);
                        button.classList.remove('loading');
                        button.classList.add('playing');
                    });
                    
                    currentAudio.addEventListener('ended', () => {
                        console.log('Audio ended for:', lang);
                        button.classList.remove('playing');
                        currentButton = null;
                    });
                    
                    currentAudio.addEventListener('error', (e) => {
                        console.error('Audio playback failed for language:', lang, 'Error:', e);
                        button.classList.remove('loading', 'playing');
                    });
                    
                    // Play the audio
                    currentAudio.play().catch(error => {
                        console.error('Audio play failed:', error);
                        button.classList.remove('loading', 'playing');
                    });
                } else {
                    console.log('No audio file found for language:', lang);
                }
            });
        });
    }
}

// Interactive Features Manager
class InteractiveManager {
    constructor() {
        this.init();
    }

    init() {
        this.initButtonEffects();
        this.initNavbarScroll();
        this.initParallaxEffects();
        this.initTypingEffect();
        this.initMobileMenu();
        this.initSearchButton();
        this.initGoalButtons();
        this.initScrollProgress();
        this.initCenteredReading();
        this.initScrollSnapping();
    }

    initButtonEffects() {
        // Button click effects
        gsap.utils.toArray('.btn').forEach(button => {
            button.addEventListener('click', () => {
                gsap.to(button, {
                    duration: 0.1,
                    scale: 0.95,
                    ease: 'power2.out',
                    onComplete: () => {
                        gsap.to(button, {
                            duration: 0.1,
                            scale: 1,
                            ease: 'power2.out'
                        });
                    }
                });
            });
        });
    }

    initNavbarScroll() {
        // Navbar scroll effect
        let lastScrollY = window.scrollY;
        const navbar = document.querySelector('.navbar');

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                gsap.to(navbar, {
                    duration: 0.3,
                    y: -100,
                    ease: 'power2.out'
                });
            } else {
                // Scrolling up
                gsap.to(navbar, {
                    duration: 0.3,
                    y: 0,
                    ease: 'power2.out'
                });
            }
            
            lastScrollY = currentScrollY;
        });
    }

    initParallaxEffects() {
        // Parallax effect for hero background
        gsap.to('.hero-background', {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            },
            y: 100,
            ease: 'none'
        });

        // Parallax effect for floating particles
        gsap.utils.toArray('.particle').forEach((particle, index) => {
            gsap.to(particle, {
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                },
                y: (index + 1) * 50,
                ease: 'none'
            });
        });
    }

    initTypingEffect() {
        // Typing effect for hero title (optional enhancement)
        const titleLines = document.querySelectorAll('.title-line');
        titleLines.forEach((line, index) => {
            const text = line.textContent;
            line.textContent = '';
            
            gsap.to(line, {
                duration: 0.05,
                repeat: text.length - 1,
                delay: 0.5 + (index * 0.3),
                onRepeat: function() {
                    const currentLength = Math.floor(this.progress() * text.length);
                    line.textContent = text.substring(0, currentLength + 1);
                },
                ease: 'none'
            });
        });
    }
}

// Performance Optimizer
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.initLazyLoading();
        this.initIntersectionObserver();
        this.initScrollThrottling();
    }

    initLazyLoading() {
        // Lazy load images and heavy elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('loaded');
                    observer.unobserve(entry.target);
                }
            });
        });

        gsap.utils.toArray('.loading').forEach(element => {
            observer.observe(element);
        });
    }

    initIntersectionObserver() {
        // Optimize animations with intersection observer
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        gsap.utils.toArray('.section-header, .industry-card, .feature-card, .lab-card').forEach(element => {
            animationObserver.observe(element);
        });
    }

    initScrollThrottling() {
        // Throttle scroll events for better performance
        let ticking = false;
        
        function updateScroll() {
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScroll);
                ticking = true;
            }
        });
    }
}

// Utility Functions
class Utils {
    static debounce(func, wait) {
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

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Main Application Class
class AgenticAIApp {
    constructor() {
        this.themeManager = null;
        this.animationManager = null;
        this.interactiveManager = null;
        this.performanceOptimizer = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        // Initialize all managers
        this.themeManager = new ThemeManager();
        this.animationManager = new AnimationManager();
        this.interactiveManager = new InteractiveManager();
        this.performanceOptimizer = new PerformanceOptimizer();

        // Add loading animation
        this.addLoadingAnimation();

        // Initialize additional features
        this.initAdditionalFeatures();
    }

    addLoadingAnimation() {
        // Add loading animation to body
        gsap.from('body', {
            duration: 1,
            opacity: 0,
            ease: 'power3.out'
        });
    }

    initAdditionalFeatures() {
        // Add ambient background animation
        this.initAmbientAnimation();
        
        // Add micro-interactions
        this.initMicroInteractions();
        
        // Add keyboard shortcuts
        this.initKeyboardShortcuts();
        
    }

    initAmbientAnimation() {
        // Create ambient background animation
        const ambientCanvas = document.createElement('canvas');
        ambientCanvas.style.position = 'fixed';
        ambientCanvas.style.top = '0';
        ambientCanvas.style.left = '0';
        ambientCanvas.style.width = '100%';
        ambientCanvas.style.height = '100%';
        ambientCanvas.style.pointerEvents = 'none';
        ambientCanvas.style.zIndex = '-1';
        ambientCanvas.style.opacity = '0.1';
        document.body.appendChild(ambientCanvas);

        const ctx = ambientCanvas.getContext('2d');
        let animationId;

        function resizeCanvas() {
            ambientCanvas.width = window.innerWidth;
            ambientCanvas.height = window.innerHeight;
        }

        function animate() {
            ctx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
            
            // Draw ambient particles
            for (let i = 0; i < 50; i++) {
                const x = Math.sin(Date.now() * 0.001 + i) * ambientCanvas.width / 2 + ambientCanvas.width / 2;
                const y = Math.cos(Date.now() * 0.001 + i) * ambientCanvas.height / 2 + ambientCanvas.height / 2;
                
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
                ctx.fill();
            }
            
            animationId = requestAnimationFrame(animate);
        }

        resizeCanvas();
        animate();

        window.addEventListener('resize', Utils.debounce(resizeCanvas, 250));
    }


    initMicroInteractions() {
        // Create custom neon cursor
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.position = 'fixed';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '9999';
        cursor.style.opacity = '0';
        document.body.appendChild(cursor);

        // Mouse move handler
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                duration: 0.1,
                x: e.clientX,
                y: e.clientY,
                opacity: 1
            });
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            gsap.to(cursor, {
                duration: 0.1,
                opacity: 0
            });
        });

        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, input, textarea, select, [data-cursor="pointer"]');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });

        // Text input cursor
        const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
        textInputs.forEach(input => {
            input.addEventListener('focus', () => {
                cursor.classList.add('text');
            });
            input.addEventListener('blur', () => {
                cursor.classList.remove('text');
            });
        });

        // Click effect
        document.addEventListener('click', () => {
            cursor.classList.add('click');
            setTimeout(() => {
                cursor.classList.remove('click');
            }, 300);
        });
    }

    initMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuToggle && navLinks) {
            mobileMenuToggle.addEventListener('click', () => {
                const isOpen = navLinks.classList.contains('mobile-open');
                
                if (isOpen) {
                    navLinks.classList.remove('mobile-open');
                    mobileMenuToggle.classList.remove('active');
                } else {
                    navLinks.classList.add('mobile-open');
                    mobileMenuToggle.classList.add('active');
                }
            });
        }
    }

    initSearchButton() {
        const searchBtn = document.querySelector('.search-btn');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                // Create search overlay
                const searchOverlay = document.createElement('div');
                searchOverlay.className = 'search-overlay';
                searchOverlay.innerHTML = `
                    <div class="search-content">
                        <input type="text" placeholder="Search..." class="search-input" autofocus>
                        <button class="search-close">&times;</button>
                    </div>
                `;
                
                document.body.appendChild(searchOverlay);
                
                // Animate in
                gsap.from(searchOverlay, {
                    duration: 0.3,
                    opacity: 0,
                    ease: 'power2.out'
                });
                
                gsap.from('.search-content', {
                    duration: 0.3,
                    scale: 0.9,
                    opacity: 0,
                    ease: 'back.out(1.7)'
                });
                
                // Close functionality
                const closeSearch = () => {
                    gsap.to(searchOverlay, {
                        duration: 0.3,
                        opacity: 0,
                        ease: 'power2.out',
                        onComplete: () => {
                            document.body.removeChild(searchOverlay);
                        }
                    });
                };
                
                searchOverlay.querySelector('.search-close').addEventListener('click', closeSearch);
                searchOverlay.addEventListener('click', (e) => {
                    if (e.target === searchOverlay) closeSearch();
                });
                
                // ESC key to close
                const handleEsc = (e) => {
                    if (e.key === 'Escape') {
                        closeSearch();
                        document.removeEventListener('keydown', handleEsc);
                    }
                };
                document.addEventListener('keydown', handleEsc);
            });
        }
    }

    initGoalButtons() {
        const goalButtons = document.querySelectorAll('.goal-btn');
        
        goalButtons.forEach((button, index) => {
            // Add staggered animation on load
            gsap.from(button, {
                duration: 0.6,
                y: 30,
                opacity: 0,
                delay: index * 0.1,
                ease: 'back.out(1.7)'
            });
            
            // Add click interaction
            button.addEventListener('click', () => {
                // Remove active state from all buttons
                goalButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active state to clicked button
                button.classList.add('active');
                
                // Animate the selection
                gsap.to(button, {
                    duration: 0.3,
                    scale: 1.05,
                    ease: 'power2.out',
                    onComplete: () => {
                        gsap.to(button, {
                            duration: 0.2,
                            scale: 1,
                            ease: 'power2.out'
                        });
                    }
                });
            });
        });
    }

    initKeyboardShortcuts() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Scroll to top with 'Home' key
            if (e.key === 'Home') {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: 0,
                    ease: 'power3.inOut'
                });
            }
        });
    }

    initScrollProgress() {
        // Create scroll progress indicator
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.innerHTML = `
            <div class="progress-fill"></div>
            <div class="progress-dots">
                <div class="dot" data-section="hero"></div>
                <div class="dot" data-section="capabilities"></div>
                <div class="dot" data-section="industries"></div>
                <div class="dot" data-section="labs"></div>
            </div>
        `;
        document.body.appendChild(progressBar);

        // Animate progress bar
        gsap.to('.progress-fill', {
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: true
            },
            width: '100%',
            ease: 'none'
        });

        // Add click handlers for progress dots
        document.querySelectorAll('.progress-dots .dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const section = dot.dataset.section;
                const target = document.getElementById(section) || document.querySelector(`.${section}`);
                if (target) {
                    gsap.to(window, {
                        duration: 1.5,
                        scrollTo: {
                            y: target,
                            offsetY: 100
                        },
                        ease: 'power3.inOut'
                    });
                }
            });
        });

        // Update active dot based on scroll position
        ScrollTrigger.batch('.progress-dots .dot', {
            onEnter: (elements) => {
                elements.forEach(dot => dot.classList.add('active'));
            },
            onLeave: (elements) => {
                elements.forEach(dot => dot.classList.remove('active'));
            },
            onEnterBack: (elements) => {
                elements.forEach(dot => dot.classList.add('active'));
            },
            onLeaveBack: (elements) => {
                elements.forEach(dot => dot.classList.remove('active'));
            }
        });
    }

    initCenteredReading() {
        // Create reading focus overlay
        const readingOverlay = document.createElement('div');
        readingOverlay.className = 'reading-overlay';
        document.body.appendChild(readingOverlay);

        // Add reading mode toggle
        const readingToggle = document.createElement('button');
        readingToggle.className = 'reading-toggle';
        readingToggle.innerHTML = '📖';
        readingToggle.title = 'Toggle Reading Mode';
        document.body.appendChild(readingToggle);

        let isReadingMode = false;

        readingToggle.addEventListener('click', () => {
            isReadingMode = !isReadingMode;
            document.body.classList.toggle('reading-mode', isReadingMode);
            readingToggle.classList.toggle('active', isReadingMode);
            
            if (isReadingMode) {
                readingToggle.innerHTML = '✕';
                this.enterReadingMode();
            } else {
                readingToggle.innerHTML = '📖';
                this.exitReadingMode();
            }
        });

        // Auto-enter reading mode when scrolling slowly
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (!isReadingMode && window.scrollY > 200) {
                    const scrollSpeed = Math.abs(this.lastScrollY - window.scrollY);
                    if (scrollSpeed < 10) { // Slow scrolling
                        this.suggestReadingMode();
                    }
                }
                this.lastScrollY = window.scrollY;
            }, 500);
        });
    }

    enterReadingMode() {
        // Highlight current section
        const sections = document.querySelectorAll('.section, .hero, .footer');
        let currentSection = null;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                currentSection = section;
            }
        });

        if (currentSection) {
            currentSection.classList.add('reading-focus');
            
            // Smooth scroll to center the section
            gsap.to(window, {
                duration: 1,
                scrollTo: {
                    y: currentSection,
                    offsetY: window.innerHeight / 2 - currentSection.offsetHeight / 2
                },
                ease: 'power3.inOut'
            });
        }
    }

    exitReadingMode() {
        document.querySelectorAll('.reading-focus').forEach(section => {
            section.classList.remove('reading-focus');
        });
    }

    suggestReadingMode() {
        const suggestion = document.createElement('div');
        suggestion.className = 'reading-suggestion';
        suggestion.innerHTML = `
            <div class="suggestion-content">
                <p>📖 Reading mode available</p>
                <button class="suggestion-btn">Enter Reading Mode</button>
                <button class="suggestion-close">✕</button>
            </div>
        `;
        document.body.appendChild(suggestion);

        // Animate in
        gsap.from(suggestion, {
            duration: 0.5,
            y: 100,
            opacity: 0,
            ease: 'back.out(1.7)'
        });

        // Add event listeners
        suggestion.querySelector('.suggestion-btn').addEventListener('click', () => {
            document.querySelector('.reading-toggle').click();
            suggestion.remove();
        });

        suggestion.querySelector('.suggestion-close').addEventListener('click', () => {
            gsap.to(suggestion, {
                duration: 0.3,
                y: 100,
                opacity: 0,
                ease: 'power2.in',
                onComplete: () => suggestion.remove()
            });
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (suggestion.parentNode) {
                gsap.to(suggestion, {
                    duration: 0.3,
                    y: 100,
                    opacity: 0,
                    ease: 'power2.in',
                    onComplete: () => suggestion.remove()
                });
            }
        }, 5000);
    }

    initScrollSnapping() {
        // Add smooth scroll snapping for better reading experience
        let isScrolling = false;
        let scrollTimeout;

        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                isScrolling = true;
                document.body.classList.add('scrolling');
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
                document.body.classList.remove('scrolling');
                this.snapToSection();
            }, 150);
        });
    }

    snapToSection() {
        const sections = document.querySelectorAll('.section, .hero');
        let closestSection = null;
        let closestDistance = Infinity;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const distance = Math.abs(rect.top - window.innerHeight / 2);
            
            if (distance < closestDistance && rect.bottom > 0 && rect.top < window.innerHeight) {
                closestDistance = distance;
                closestSection = section;
            }
        });

        if (closestSection && closestDistance < 100) {
            gsap.to(window, {
                duration: 0.8,
                scrollTo: {
                    y: closestSection,
                    offsetY: window.innerHeight / 2 - closestSection.offsetHeight / 2
                },
                ease: 'power2.out'
            });
        }
    }
}

// Emma Demo Functionality
class EmmaDemo {
    constructor() {
        this.init();
    }

    init() {
        this.initEmmaActionButton();
    }

    initEmmaActionButton() {
        const emmaActionBtn = document.querySelector('.cta-primary');
        if (emmaActionBtn) {
            emmaActionBtn.addEventListener('click', () => {
                this.showVideoModal(emmaActionBtn);
            });
        }
    }

    showVideoModal(button) {
        // Prevent multiple modals
        if (document.querySelector('.emma-demo-overlay')) {
            return;
        }
        
        // Update button state
        button.innerHTML = '<span>Loading Video...</span>';
        button.style.pointerEvents = 'none';
        
        // Disable main page interactions
        document.body.classList.add('demo-open');
        document.body.style.overflow = 'hidden';
        
        // Create video modal overlay
        const videoOverlay = document.createElement('div');
        videoOverlay.className = 'emma-demo-overlay';
        videoOverlay.innerHTML = `
            <div class="video-container">
                <div class="video-header">
                    <h2>🎥 Emma AI Assistant Demo</h2>
                    <button class="demo-close">&times;</button>
                </div>
                <div class="video-content">
                    <div class="video-wrapper">
                        <iframe 
                            src="https://www.youtube.com/embed/nihL_LnXLLc?autoplay=1&rel=0&modestbranding=1" 
                            title="Emma AI Assistant Demo"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                    <div class="video-info">
                        <p>Watch Emma in action! This video demonstrates Emma's AI capabilities and how she can help streamline your business processes.</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(videoOverlay);
        
        // Animate video modal in
        gsap.from(videoOverlay, {
            duration: 0.5,
            opacity: 0,
            scale: 0.9,
            ease: 'back.out(1.7)'
        });
        
        // Add event listeners
        this.addVideoEventListeners(videoOverlay, button);
        
        // Add ESC key handler
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                this.closeVideoModal(videoOverlay, button);
                document.removeEventListener('keydown', handleEscKey);
            }
        };
        document.addEventListener('keydown', handleEscKey);
    }

    addVideoEventListeners(overlay, button) {
        // Close video modal
        const closeBtn = overlay.querySelector('.demo-close');
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeVideoModal(overlay, button);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeVideoModal(overlay, button);
            }
        });
    }

    closeVideoModal(overlay, button) {
        gsap.to(overlay, {
            duration: 0.3,
            opacity: 0,
            scale: 0.9,
            ease: 'power2.in',
            onComplete: () => {
                document.body.removeChild(overlay);
                document.body.classList.remove('demo-open');
                document.body.style.overflow = '';
                button.innerHTML = '<span>See Emma in Action</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>';
                button.style.pointerEvents = 'auto';
            }
        });
    }
}

// Initialize the application when the script loads
const app = new AgenticAIApp();
const emmaDemo = new EmmaDemo();

// Resources Section Management
class ResourcesManager {
    constructor() {
        this.currentTab = 'blogs';
        this.blogCurrentSlide = 0;
        this.useCaseCurrentSlide = 0;
        this.caseStudyCurrentSlide = 0;
        this.blogSlidesPerView = 3;
        this.useCaseSlidesPerView = 3;
        this.caseStudySlidesPerView = 3;
        this.init();
    }

    init() {
        this.loadBlogs();
        this.loadUseCases();
        this.loadCaseStudies();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('resource-tab')) {
                const tabName = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.showTab(tabName);
            }
        });
    }

    showTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.resource-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.resource-content').forEach(content => {
            content.classList.remove('active');
        });

        // Add active class to selected tab and content
        event.target.classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
        
        // Load content if not already loaded
        if (tabName === 'casestudies' && !this.caseStudiesLoaded) {
            this.loadCaseStudies();
        }
    }

    async loadBlogs() {
        try {
            const response = await fetch('/api/blogs');
            if (response.ok) {
                const blogs = await response.json();
                // Sort blogs by date (newest first)
                const sortedBlogs = blogs.sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB - dateA; // Newest first
                });
                this.displayBlogs(sortedBlogs);
            } else {
                this.displayDefaultBlogs();
            }
        } catch (error) {
            console.error('Error loading blogs:', error);
            this.displayDefaultBlogs();
        }
    }

    displayDefaultBlogs() {
        const defaultBlogs = [
            {
                id: 1,
                title: 'The Future of AI-Powered Customer Service',
                excerpt: 'Explore how AI is revolutionizing customer service and what it means for your business.',
                category: 'AI Automation',
                date: 'Dec 15, 2024',
                author: 'Sarah Johnson',
                image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop',
                authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
            },
            {
                id: 2,
                title: '10 Ways AI Can Boost Your Team\'s Productivity',
                excerpt: 'Discover practical AI tools and strategies that can transform your team\'s workflow.',
                category: 'Productivity',
                date: 'Dec 12, 2024',
                author: 'Mike Chen',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
                authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
            },
            {
                id: 3,
                title: 'Understanding Natural Language Processing in Business',
                excerpt: 'A comprehensive guide to NLP and how it\'s being used in modern business applications.',
                category: 'Technology',
                date: 'Dec 10, 2024',
                author: 'Emily Davis',
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
                authorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
            }
        ];

        // Sort default blogs by date (newest first)
        const sortedBlogs = defaultBlogs.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // Newest first
        });

        this.displayBlogs(sortedBlogs);
    }

    displayBlogs(blogs) {
        const blogsSlider = document.getElementById('blogs-slider');
        const indicatorsContainer = document.getElementById('blog-indicators');
        if (!blogsSlider) return;

        blogsSlider.innerHTML = blogs.map(blog => `
            <div class="blog-card" data-blog-id="${blog.id}" onclick="openBlogModal(${blog.id})">
                <div class="blog-image">
                    <img src="${blog.image || '/uploads/blogs/default-blog.jpg'}" alt="${blog.title}">
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="blog-category">${blog.category}</span>
                        <span class="blog-date">${new Date(blog.date).toLocaleDateString()}</span>
                    </div>
                    <h4 class="blog-title">${blog.title}</h4>
                    <p class="blog-excerpt">${blog.excerpt}</p>
                    <div class="blog-author">
                        <img src="${blog.authorImage || '/uploads/blogs/default-author.jpg'}" alt="${blog.author}">
                        <span>${blog.author}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Generate indicators
        const totalSlides = Math.ceil(blogs.length / this.blogSlidesPerView);
        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = Array.from({ length: totalSlides }, (_, index) => 
                `<button class="slider-indicator ${index === 0 ? 'active' : ''}" onclick="goToBlogSlide(${index})"></button>`
            ).join('');
        }

        this.updateBlogSliderPosition();
    }

    async loadUseCases() {
        try {
            const response = await fetch('/api/content/usecases');
            if (response.ok) {
                const useCases = await response.json();
                // Sort use cases by date (newest first)
                const sortedUseCases = useCases.sort((a, b) => {
                    const dateA = new Date(a.date || a.createdAt);
                    const dateB = new Date(b.date || b.createdAt);
                    return dateB - dateA; // Newest first
                });
                this.displayUseCases(sortedUseCases);
            } else {
                this.displayDefaultUseCases();
            }
        } catch (error) {
            console.error('Error loading use cases:', error);
            this.displayDefaultUseCases();
        }
    }

    displayDefaultUseCases() {
        const defaultUseCases = [
            {
                id: 1,
                title: 'Healthcare Patient Management',
                description: 'Streamline patient scheduling, appointment reminders, and follow-up care coordination.',
                icon: 'fas fa-hospital',
                stats: [
                    { number: '85%', label: 'Reduction in no-shows' },
                    { number: '40%', label: 'Time saved' }
                ],
                tags: ['Healthcare', 'Scheduling', 'Patient Care'],
                date: 'Dec 20, 2024'
            },
            {
                id: 2,
                title: 'E-commerce Customer Support',
                description: 'Handle order inquiries, product recommendations, and returns processing automatically.',
                icon: 'fas fa-shopping-cart',
                stats: [
                    { number: '92%', label: 'Query resolution' },
                    { number: '60%', label: 'Faster response' }
                ],
                tags: ['E-commerce', 'Support', 'Automation'],
                date: 'Dec 18, 2024'
            },
            {
                id: 3,
                title: 'Educational Institution',
                description: 'Manage student inquiries, course information, and administrative tasks efficiently.',
                icon: 'fas fa-graduation-cap',
                stats: [
                    { number: '78%', label: 'Student satisfaction' },
                    { number: '50%', label: 'Admin workload' }
                ],
                tags: ['Education', 'Student Services', 'Administration'],
                date: 'Dec 15, 2024'
            },
            {
                id: 4,
                title: 'Corporate HR Management',
                description: 'Automate employee onboarding, benefits inquiries, and policy questions.',
                icon: 'fas fa-building',
                stats: [
                    { number: '90%', label: 'Query accuracy' },
                    { number: '70%', label: 'HR efficiency' }
                ],
                tags: ['HR', 'Employee Services', 'Onboarding'],
                date: 'Dec 12, 2024'
            }
        ];

        // Sort default use cases by date (newest first)
        const sortedUseCases = defaultUseCases.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // Newest first
        });

        this.displayUseCases(sortedUseCases);
    }

    displayUseCases(useCases) {
        const useCasesSlider = document.getElementById('usecases-slider');
        const indicatorsContainer = document.getElementById('usecase-indicators');
        if (!useCasesSlider) return;

        useCasesSlider.innerHTML = useCases.map(useCase => `
            <div class="usecase-card" data-usecase-id="${useCase.id}" onclick="openUseCaseModal(${useCase.id})">
                <div class="usecase-icon">
                    <i class="${useCase.icon}"></i>
                </div>
                <h4 class="usecase-title">${useCase.title}</h4>
                <p class="usecase-description">${useCase.description}</p>
                <div class="usecase-stats">
                    ${useCase.stats.map(stat => `
                        <div class="stat">
                            <span class="stat-number">${stat.number}</span>
                            <span class="stat-label">${stat.label}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="usecase-tags">
                    ${useCase.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');

        // Generate indicators
        const totalSlides = Math.ceil(useCases.length / this.useCaseSlidesPerView);
        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = Array.from({ length: totalSlides }, (_, index) => 
                `<button class="slider-indicator ${index === 0 ? 'active' : ''}" onclick="goToUseCaseSlide(${index})"></button>`
            ).join('');
        }

        this.updateUseCaseSliderPosition();
    }

    // Slider Control Methods
    updateBlogSliderPosition() {
        const slider = document.getElementById('blogs-slider');
        if (!slider) return;
        
        const slideWidth = 100 / this.blogSlidesPerView;
        const translateX = -this.blogCurrentSlide * slideWidth;
        slider.style.transform = `translateX(${translateX}%)`;
        
        // Update indicators
        const indicators = document.querySelectorAll('#blog-indicators .slider-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.blogCurrentSlide);
        });
    }

    updateUseCaseSliderPosition() {
        const slider = document.getElementById('usecases-slider');
        if (!slider) return;
        
        const slideWidth = 100 / this.useCaseSlidesPerView;
        const translateX = -this.useCaseCurrentSlide * slideWidth;
        slider.style.transform = `translateX(${translateX}%)`;
        
        // Update indicators
        const indicators = document.querySelectorAll('#usecase-indicators .slider-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.useCaseCurrentSlide);
        });
    }

    moveBlogSlider(direction) {
        const totalSlides = Math.ceil(document.querySelectorAll('.blog-card').length / this.blogSlidesPerView);
        this.blogCurrentSlide += direction;
        
        if (this.blogCurrentSlide < 0) {
            this.blogCurrentSlide = totalSlides - 1;
        } else if (this.blogCurrentSlide >= totalSlides) {
            this.blogCurrentSlide = 0;
        }
        
        this.updateBlogSliderPosition();
    }

    moveUseCaseSlider(direction) {
        const totalSlides = Math.ceil(document.querySelectorAll('.usecase-card').length / this.useCaseSlidesPerView);
        this.useCaseCurrentSlide += direction;
        
        if (this.useCaseCurrentSlide < 0) {
            this.useCaseCurrentSlide = totalSlides - 1;
        } else if (this.useCaseCurrentSlide >= totalSlides) {
            this.useCaseCurrentSlide = 0;
        }
        
        this.updateUseCaseSliderPosition();
    }

    goToBlogSlide(slideIndex) {
        this.blogCurrentSlide = slideIndex;
        this.updateBlogSliderPosition();
    }

    goToUseCaseSlide(slideIndex) {
        this.useCaseCurrentSlide = slideIndex;
        this.updateUseCaseSliderPosition();
    }

    // Case Studies Methods
    async loadCaseStudies() {
        try {
            const response = await fetch('/api/content/casestudies');
            if (response.ok) {
                const caseStudies = await response.json();
                // Sort case studies by date (newest first)
                const sortedCaseStudies = caseStudies.sort((a, b) => {
                    const dateA = new Date(a.date || a.createdAt);
                    const dateB = new Date(b.date || b.createdAt);
                    return dateB - dateA; // Newest first
                });
                this.displayCaseStudies(sortedCaseStudies);
            } else {
                this.displayDefaultCaseStudies();
            }
        } catch (error) {
            console.error('Error loading case studies:', error);
            this.displayDefaultCaseStudies();
        }
    }

    displayDefaultCaseStudies() {
        const defaultCaseStudies = [
            {
                id: 1,
                title: 'TechCorp Digital Transformation',
                client: 'TechCorp Inc.',
                industry: 'Technology',
                date: 'Dec 22, 2024',
                image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop',
                summary: 'How Emma helped TechCorp streamline their customer support operations and reduce response times by 70%.',
                results: [
                    { number: '70%', label: 'Faster Response' },
                    { number: '85%', label: 'Customer Satisfaction' },
                    { number: '50%', label: 'Cost Reduction' }
                ],
                tags: ['Digital Transformation', 'Customer Support', 'AI Automation'],
                content: `
                    <h2>Challenge</h2>
                    <p>TechCorp was struggling with high customer support volumes and long response times. Their traditional support system couldn't keep up with the growing demand.</p>
                    
                    <h2>Solution</h2>
                    <p>We implemented Emma as their primary customer support assistant, integrating with their existing CRM and ticketing systems.</p>
                    
                    <h2>Results</h2>
                    <p>The implementation resulted in significant improvements across all key metrics, transforming their customer support operations.</p>
                `,
                gallery: [
                    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
                ]
            },
            {
                id: 2,
                title: 'HealthPlus Patient Management',
                client: 'HealthPlus Medical',
                industry: 'Healthcare',
                date: 'Dec 20, 2024',
                image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
                summary: 'Emma revolutionized patient scheduling and follow-up care at HealthPlus, improving patient outcomes and operational efficiency.',
                results: [
                    { number: '60%', label: 'Scheduling Efficiency' },
                    { number: '90%', label: 'Patient Satisfaction' },
                    { number: '40%', label: 'Admin Time Saved' }
                ],
                tags: ['Healthcare', 'Patient Care', 'Scheduling'],
                content: `
                    <h2>Challenge</h2>
                    <p>HealthPlus needed a solution to manage complex patient scheduling and follow-up care coordination across multiple departments.</p>
                    
                    <h2>Solution</h2>
                    <p>Emma was integrated into their patient management system to handle appointment scheduling, reminders, and follow-up care coordination.</p>
                    
                    <h2>Results</h2>
                    <p>The solution dramatically improved patient care coordination and reduced administrative burden on medical staff.</p>
                `,
                gallery: [
                    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop'
                ]
            },
            {
                id: 3,
                title: 'EduTech Learning Platform',
                client: 'EduTech Solutions',
                industry: 'Education',
                date: 'Dec 18, 2024',
                image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
                summary: 'Emma transformed student support services at EduTech, providing 24/7 assistance and personalized learning recommendations.',
                results: [
                    { number: '95%', label: 'Query Resolution' },
                    { number: '80%', label: 'Student Engagement' },
                    { number: '65%', label: 'Support Efficiency' }
                ],
                tags: ['Education', 'Student Support', 'Learning Platform'],
                content: `
                    <h2>Challenge</h2>
                    <p>EduTech needed to provide comprehensive support to thousands of students while maintaining high service quality and reducing costs.</p>
                    
                    <h2>Solution</h2>
                    <p>Emma was deployed as the primary student support assistant, handling course inquiries, technical issues, and learning recommendations.</p>
                    
                    <h2>Results</h2>
                    <p>The implementation significantly improved student satisfaction and reduced the workload on human support staff.</p>
                `,
                gallery: [
                    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
                    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop'
                ]
            }
        ];
        this.displayCaseStudies(defaultCaseStudies);
    }

    displayCaseStudies(caseStudies) {
        const caseStudiesSlider = document.getElementById('casestudies-slider');
        const indicatorsContainer = document.getElementById('casestudy-indicators');
        if (!caseStudiesSlider) return;

        caseStudiesSlider.innerHTML = caseStudies.map(caseStudy => `
            <div class="casestudy-card" data-casestudy-id="${caseStudy.id}" onclick="openCaseStudyModal(${caseStudy.id})">
                <img src="${caseStudy.image}" alt="${caseStudy.title}" class="casestudy-image">
                <div class="casestudy-content">
                    <div class="casestudy-meta">
                        <span class="casestudy-client">${caseStudy.client}</span>
                        <span class="casestudy-date">${caseStudy.date}</span>
                    </div>
                    <div class="casestudy-industry">
                        <i class="fas fa-building"></i>
                        <span>${caseStudy.industry}</span>
                    </div>
                    <h4 class="casestudy-title">${caseStudy.title}</h4>
                    <p class="casestudy-summary">${caseStudy.summary}</p>
                    <div class="casestudy-results">
                        ${caseStudy.results.map(result => `
                            <div class="casestudy-result">
                                <span class="casestudy-result-number">${result.number}</span>
                                <span class="casestudy-result-label">${result.label}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="casestudy-tags">
                        ${caseStudy.tags.map(tag => `<span class="casestudy-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        // Generate indicators
        const totalSlides = Math.ceil(caseStudies.length / this.caseStudySlidesPerView);
        if (indicatorsContainer) {
            indicatorsContainer.innerHTML = Array.from({ length: totalSlides }, (_, index) => 
                `<button class="slider-indicator ${index === 0 ? 'active' : ''}" onclick="goToCaseStudySlide(${index})"></button>`
            ).join('');
        }

        this.updateCaseStudySliderPosition();
        this.caseStudiesLoaded = true;
    }

    updateCaseStudySliderPosition() {
        const slider = document.getElementById('casestudies-slider');
        if (!slider) return;
        
        const slideWidth = 100 / this.caseStudySlidesPerView;
        const translateX = -this.caseStudyCurrentSlide * slideWidth;
        slider.style.transform = `translateX(${translateX}%)`;
        
        // Update indicators
        const indicators = document.querySelectorAll('#casestudy-indicators .slider-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.caseStudyCurrentSlide);
        });
    }

    moveCaseStudySlider(direction) {
        const slider = document.getElementById('casestudies-slider');
        if (!slider) return;
        
        const totalSlides = Math.ceil(slider.children.length / this.caseStudySlidesPerView);
        this.caseStudyCurrentSlide += direction;
        
        if (this.caseStudyCurrentSlide < 0) {
            this.caseStudyCurrentSlide = totalSlides - 1;
        } else if (this.caseStudyCurrentSlide >= totalSlides) {
            this.caseStudyCurrentSlide = 0;
        }
        
        this.updateCaseStudySliderPosition();
    }

    goToCaseStudySlide(slideIndex) {
        this.caseStudyCurrentSlide = slideIndex;
        this.updateCaseStudySliderPosition();
    }
}

// Global function for tab switching
function showResourceTab(tabName) {
    // This will be handled by the ResourcesManager class
}

// Global slider control functions
function moveBlogSlider(direction) {
    if (window.resourcesManager) {
        window.resourcesManager.moveBlogSlider(direction);
    }
}

function moveUseCaseSlider(direction) {
    if (window.resourcesManager) {
        window.resourcesManager.moveUseCaseSlider(direction);
    }
}

function goToBlogSlide(slideIndex) {
    if (window.resourcesManager) {
        window.resourcesManager.goToBlogSlide(slideIndex);
    }
}

function goToUseCaseSlide(slideIndex) {
    if (window.resourcesManager) {
        window.resourcesManager.goToUseCaseSlide(slideIndex);
    }
}

function moveCaseStudySlider(direction) {
    if (window.resourcesManager) {
        window.resourcesManager.moveCaseStudySlider(direction);
    }
}

function goToCaseStudySlide(slideIndex) {
    if (window.resourcesManager) {
        window.resourcesManager.goToCaseStudySlide(slideIndex);
    }
}

// Modal Management
let currentBlogData = null;
let currentUseCaseData = null;
let currentCaseStudyData = null;

// Helper function to get default blog data
function getDefaultBlogData() {
    return [
        {
            id: 1,
            title: 'The Future of AI-Powered Customer Service',
            excerpt: 'Explore how AI is revolutionizing customer service and what it means for your business.',
            category: 'AI Automation',
            date: 'Dec 15, 2024',
            author: 'Sarah Johnson',
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop',
            authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
            content: `
                <h2>Introduction</h2>
                <p>Artificial Intelligence is transforming the way businesses interact with their customers. In this comprehensive guide, we explore the latest trends and technologies that are reshaping customer service.</p>
                
                <h2>The Current State of Customer Service</h2>
                <p>Traditional customer service models are struggling to keep up with increasing customer expectations and growing volumes of inquiries. Companies are turning to AI-powered solutions to bridge this gap.</p>
                
                <h2>Key Benefits of AI in Customer Service</h2>
                <ul>
                    <li>24/7 availability</li>
                    <li>Instant response times</li>
                    <li>Consistent service quality</li>
                    <li>Cost reduction</li>
                    <li>Scalability</li>
                </ul>
                
                <h2>Conclusion</h2>
                <p>The future of customer service lies in the seamless integration of AI technologies with human expertise, creating more efficient and satisfying customer experiences.</p>
            `
        },
        {
            id: 2,
            title: '10 Ways AI Can Boost Your Team\'s Productivity',
            excerpt: 'Discover practical AI tools and strategies that can transform your team\'s workflow.',
            category: 'Productivity',
            date: 'Dec 12, 2024',
            author: 'Mike Chen',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
            authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
            content: `
                <h2>Introduction</h2>
                <p>Productivity is the key to success in today's fast-paced business environment. AI tools are revolutionizing how teams work, making processes more efficient and outcomes more effective.</p>
                
                <h2>Top 10 AI Productivity Boosters</h2>
                <ol>
                    <li>Automated task scheduling and prioritization</li>
                    <li>Intelligent email management</li>
                    <li>Smart document generation</li>
                    <li>Predictive analytics for decision making</li>
                    <li>Automated data entry and processing</li>
                    <li>Intelligent meeting scheduling</li>
                    <li>Smart content creation</li>
                    <li>Automated quality assurance</li>
                    <li>Predictive maintenance</li>
                    <li>Intelligent resource allocation</li>
                </ol>
                
                <h2>Implementation Strategies</h2>
                <p>Successfully implementing AI tools requires careful planning, team training, and gradual adoption. Start with one tool and expand as your team becomes comfortable.</p>
            `
        },
        {
            id: 3,
            title: 'Understanding Natural Language Processing in Business',
            excerpt: 'A comprehensive guide to NLP and how it\'s being used in modern business applications.',
            category: 'Technology',
            date: 'Dec 10, 2024',
            author: 'Emily Davis',
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
            authorImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
            content: `
                <h2>What is Natural Language Processing?</h2>
                <p>Natural Language Processing (NLP) is a branch of artificial intelligence that helps computers understand, interpret, and manipulate human language. It's the technology behind many of the AI applications we use today.</p>
                
                <h2>Key NLP Technologies</h2>
                <ul>
                    <li>Text analysis and sentiment analysis</li>
                    <li>Language translation</li>
                    <li>Speech recognition and synthesis</li>
                    <li>Chatbots and virtual assistants</li>
                    <li>Content generation and summarization</li>
                </ul>
                
                <h2>Business Applications</h2>
                <p>NLP is being used across various industries to improve customer service, automate content creation, analyze customer feedback, and enhance decision-making processes.</p>
                
                <h2>Future Trends</h2>
                <p>As NLP technology continues to advance, we can expect more sophisticated language understanding, better context awareness, and more natural human-computer interactions.</p>
            `
        }
    ];
}

// Helper function to get default use case data
function getDefaultUseCaseData() {
    return [
        {
            id: 1,
            title: 'Healthcare Patient Management',
            description: 'Streamline patient scheduling, appointment reminders, and follow-up care coordination.',
            icon: 'fas fa-hospital',
            stats: [
                { number: '85%', label: 'Reduction in no-shows' },
                { number: '40%', label: 'Time saved' }
            ],
            tags: ['Healthcare', 'Scheduling', 'Patient Care'],
            date: 'Dec 20, 2024',
            content: `
                <h2>Overview</h2>
                <p>This use case demonstrates how Emma can transform healthcare operations by automating patient management tasks and improving care coordination.</p>
                
                <h2>Key Features</h2>
                <ul>
                    <li>Automated appointment scheduling</li>
                    <li>Smart reminder system</li>
                    <li>Patient follow-up coordination</li>
                    <li>Integration with existing healthcare systems</li>
                </ul>
                
                <h2>Implementation Benefits</h2>
                <p>Healthcare providers using this solution have seen significant improvements in patient satisfaction and operational efficiency.</p>
            `
        },
        {
            id: 2,
            title: 'E-commerce Customer Support',
            description: 'Handle order inquiries, product recommendations, and returns processing automatically.',
            icon: 'fas fa-shopping-cart',
            stats: [
                { number: '92%', label: 'Query resolution' },
                { number: '60%', label: 'Faster response' }
            ],
            tags: ['E-commerce', 'Support', 'Automation'],
            date: 'Dec 18, 2024',
            content: `
                <h2>Overview</h2>
                <p>E-commerce businesses can leverage Emma to provide instant, intelligent customer support that scales with their growth.</p>
                
                <h2>Key Features</h2>
                <ul>
                    <li>Order status tracking</li>
                    <li>Product recommendations</li>
                    <li>Returns and refunds processing</li>
                    <li>Inventory inquiries</li>
                </ul>
                
                <h2>Business Impact</h2>
                <p>E-commerce companies using this solution have experienced higher customer satisfaction and reduced support costs.</p>
            `
        },
        {
            id: 3,
            title: 'Educational Institution',
            description: 'Manage student inquiries, course information, and administrative tasks efficiently.',
            icon: 'fas fa-graduation-cap',
            stats: [
                { number: '75%', label: 'Query automation' },
                { number: '50%', label: 'Admin time saved' }
            ],
            tags: ['Education', 'Student Services', 'Administration'],
            date: 'Dec 16, 2024',
            content: `
                <h2>Overview</h2>
                <p>Educational institutions can use Emma to streamline student services and administrative processes, improving the overall educational experience.</p>
                
                <h2>Key Features</h2>
                <ul>
                    <li>Course information and scheduling</li>
                    <li>Student enrollment assistance</li>
                    <li>Administrative task automation</li>
                    <li>24/7 student support</li>
                </ul>
                
                <h2>Educational Benefits</h2>
                <p>Institutions using this solution have seen improved student satisfaction and more efficient administrative operations.</p>
            `
        }
    ];
}

// Helper function to get default case study data
function getDefaultCaseStudyData() {
    return [
        {
            id: 1,
            title: 'TechCorp Digital Transformation',
            client: 'TechCorp Inc.',
            industry: 'Technology',
            date: 'Dec 22, 2024',
            image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop',
            summary: 'How Emma helped TechCorp streamline their customer support operations and reduce response times by 70%.',
            results: [
                { number: '70%', label: 'Faster Response' },
                { number: '85%', label: 'Customer Satisfaction' },
                { number: '50%', label: 'Cost Reduction' }
            ],
            tags: ['Digital Transformation', 'Customer Support', 'AI Automation'],
            content: `
                <h2>Challenge</h2>
                <p>TechCorp was struggling with high customer support volumes and long response times. Their traditional support system couldn't keep up with the growing demand.</p>
                
                <h2>Solution</h2>
                <p>We implemented Emma as their primary customer support assistant, integrating with their existing CRM and ticketing systems.</p>
                
                <h2>Results</h2>
                <p>The implementation resulted in significant improvements across all key metrics, transforming their customer support operations.</p>
                
                <h2>Key Achievements</h2>
                <ul>
                    <li>70% reduction in average response time</li>
                    <li>85% improvement in customer satisfaction scores</li>
                    <li>50% reduction in support costs</li>
                    <li>24/7 availability for customer inquiries</li>
                </ul>
            `,
            gallery: [
                'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
            ]
        },
        {
            id: 2,
            title: 'HealthFirst Patient Care Revolution',
            client: 'HealthFirst Medical Group',
            industry: 'Healthcare',
            date: 'Dec 20, 2024',
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop',
            summary: 'Emma transformed patient care coordination at HealthFirst, reducing no-shows by 60% and improving patient satisfaction.',
            results: [
                { number: '60%', label: 'Reduced No-shows' },
                { number: '90%', label: 'Patient Satisfaction' },
                { number: '35%', label: 'Admin Time Saved' }
            ],
            tags: ['Healthcare', 'Patient Care', 'Scheduling'],
            content: `
                <h2>Challenge</h2>
                <p>HealthFirst was facing high no-show rates and administrative burden in managing patient appointments and follow-ups.</p>
                
                <h2>Solution</h2>
                <p>We deployed Emma to handle patient scheduling, reminders, and follow-up care coordination across their network.</p>
                
                <h2>Results</h2>
                <p>The implementation led to dramatic improvements in patient engagement and operational efficiency.</p>
                
                <h2>Key Achievements</h2>
                <ul>
                    <li>60% reduction in patient no-shows</li>
                    <li>90% improvement in patient satisfaction</li>
                    <li>35% reduction in administrative time</li>
                    <li>Improved care coordination across departments</li>
                </ul>
            `,
            gallery: [
                'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'
            ]
        },
        {
            id: 3,
            title: 'EduTech Learning Enhancement',
            client: 'EduTech University',
            industry: 'Education',
            date: 'Dec 18, 2024',
            image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
            summary: 'Emma revolutionized student services at EduTech, providing 24/7 support and improving student engagement by 80%.',
            results: [
                { number: '80%', label: 'Student Engagement' },
                { number: '65%', label: 'Query Resolution' },
                { number: '45%', label: 'Admin Efficiency' }
            ],
            tags: ['Education', 'Student Services', 'Engagement'],
            content: `
                <h2>Challenge</h2>
                <p>EduTech University needed to improve student services and reduce administrative workload while maintaining quality support.</p>
                
                <h2>Solution</h2>
                <p>We implemented Emma to handle student inquiries, course information, and administrative tasks around the clock.</p>
                
                <h2>Results</h2>
                <p>The solution transformed how students interact with university services and significantly improved operational efficiency.</p>
                
                <h2>Key Achievements</h2>
                <ul>
                    <li>80% improvement in student engagement</li>
                    <li>65% of queries resolved automatically</li>
                    <li>45% increase in administrative efficiency</li>
                    <li>24/7 student support availability</li>
                </ul>
            `,
            gallery: [
                'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop'
            ]
        }
    ];
}

// Blog Modal Functions
async function openBlogModal(blogId) {
    console.log('openBlogModal called with ID:', blogId);
    try {
        // First try to get from API
        const response = await fetch(`/api/blogs/${blogId}`);
        if (response.ok) {
            const blog = await response.json();
            currentBlogData = blog;
            displayBlogModal(blog);
            showModal('blogModal');
        } else {
            // Fallback to default data
            console.log('API failed, using default data');
            const defaultBlogs = getDefaultBlogData();
            const blog = defaultBlogs.find(b => b.id == blogId);
            if (blog) {
                currentBlogData = blog;
                displayBlogModal(blog);
                showModal('blogModal');
            } else {
                console.error('Blog not found');
            }
        }
    } catch (error) {
        console.error('Error loading blog:', error);
        // Fallback to default data
        console.log('Error occurred, using default data');
        const defaultBlogs = getDefaultBlogData();
        const blog = defaultBlogs.find(b => b.id == blogId);
        if (blog) {
            currentBlogData = blog;
            displayBlogModal(blog);
            showModal('blogModal');
        }
    }
}

function displayBlogModal(blog) {
    console.log('displayBlogModal called with:', blog);
    document.getElementById('blogModalTitle').textContent = blog.title;
    document.getElementById('blogModalCategory').textContent = blog.category;
    // Handle date parsing more safely
    try {
        const date = new Date(blog.date);
        if (isNaN(date.getTime())) {
            document.getElementById('blogModalDate').textContent = blog.date;
        } else {
            document.getElementById('blogModalDate').textContent = date.toLocaleDateString();
        }
    } catch (error) {
        document.getElementById('blogModalDate').textContent = blog.date;
    }
    document.getElementById('blogModalAuthor').textContent = blog.author;
    document.getElementById('blogModalAuthorImage').src = blog.authorImage || '/uploads/blogs/default-author.jpg';
    document.getElementById('blogModalAuthorImage').alt = blog.author;
    document.getElementById('blogModalImage').src = blog.image || '/uploads/blogs/default-blog.jpg';
    document.getElementById('blogModalImage').alt = blog.title;
    
    // Display full content
    const content = blog.content || `
        <h2>Introduction</h2>
        <p>${blog.excerpt}</p>
        
        <h2>Key Points</h2>
        <p>This comprehensive guide explores the latest trends and best practices in AI automation. We'll cover everything from basic concepts to advanced implementation strategies.</p>
        
        <h3>What You'll Learn</h3>
        <ul>
            <li>Understanding AI automation fundamentals</li>
            <li>Best practices for implementation</li>
            <li>Common challenges and solutions</li>
            <li>Future trends and opportunities</li>
        </ul>
        
        <blockquote>
            "The future of business lies in intelligent automation that adapts and learns from every interaction."
        </blockquote>
        
        <h2>Conclusion</h2>
        <p>As we move forward, AI automation will continue to transform how we work and interact with technology. The key is to start small, learn continuously, and always keep the human element in mind.</p>
    `;
    
    document.getElementById('blogModalContent').innerHTML = content;
    
    // Display additional images if available
    const gallery = document.getElementById('blogModalGallery');
    if (blog.gallery && Array.isArray(blog.gallery) && blog.gallery.length > 0) {
        gallery.innerHTML = blog.gallery.map(img => `
            <img src="${img}" alt="Gallery image" onclick="openImageModal('${img}')">
        `).join('');
    } else {
        gallery.innerHTML = '';
    }
}

// Use Case Modal Functions
async function openUseCaseModal(useCaseId) {
    try {
        // First try to get from API
        const response = await fetch(`/api/content/usecases/${useCaseId}`);
        if (response.ok) {
            const useCase = await response.json();
            currentUseCaseData = useCase;
            displayUseCaseModal(useCase);
            showModal('usecaseModal');
        } else {
            // Fallback to default data
            const defaultUseCases = getDefaultUseCaseData();
            const useCase = defaultUseCases.find(u => u.id == useCaseId);
            if (useCase) {
                currentUseCaseData = useCase;
                displayUseCaseModal(useCase);
                showModal('usecaseModal');
            } else {
                console.error('Use case not found');
            }
        }
    } catch (error) {
        console.error('Error loading use case:', error);
        // Fallback to default data
        const defaultUseCases = getDefaultUseCaseData();
        const useCase = defaultUseCases.find(u => u.id == useCaseId);
        if (useCase) {
            currentUseCaseData = useCase;
            displayUseCaseModal(useCase);
            showModal('usecaseModal');
        }
    }
}

function displayUseCaseModal(useCase) {
    document.getElementById('usecaseModalTitle').textContent = useCase.title;
    document.getElementById('usecaseModalIcon').className = useCase.icon;
    document.getElementById('usecaseModalDescription').textContent = useCase.description;
    
    // Display stats
    const statsContainer = document.getElementById('usecaseModalStats');
    statsContainer.innerHTML = useCase.stats.map(stat => `
        <div class="stat">
            <span class="stat-number">${stat.number}</span>
            <span class="stat-label">${stat.label}</span>
        </div>
    `).join('');
    
    // Display tags
    const tagsContainer = document.getElementById('usecaseModalTags');
    tagsContainer.innerHTML = useCase.tags.map(tag => `
        <span class="tag">${tag}</span>
    `).join('');
    
    // Display detailed content
    const content = useCase.content || `
        <h2>Overview</h2>
        <p>${useCase.description}</p>
        
        <h2>Implementation Process</h2>
        <p>Our implementation process is designed to be smooth and efficient, ensuring minimal disruption to your existing operations.</p>
        
        <h3>Phase 1: Discovery & Planning</h3>
        <ul>
            <li>Comprehensive analysis of current processes</li>
            <li>Identification of automation opportunities</li>
            <li>Custom solution design</li>
            <li>Timeline and resource planning</li>
        </ul>
        
        <h3>Phase 2: Development & Testing</h3>
        <ul>
            <li>Custom AI model training</li>
            <li>Integration with existing systems</li>
            <li>Comprehensive testing and validation</li>
            <li>Performance optimization</li>
        </ul>
        
        <h3>Phase 3: Deployment & Support</h3>
        <ul>
            <li>Gradual rollout and monitoring</li>
            <li>Staff training and documentation</li>
            <li>Ongoing support and maintenance</li>
            <li>Continuous improvement and updates</li>
        </ul>
        
        <h2>Results & Benefits</h2>
        <p>Organizations implementing this solution typically see significant improvements in efficiency, accuracy, and customer satisfaction. The metrics shown above represent real-world results from our clients.</p>
        
        <h2>Next Steps</h2>
        <p>Ready to transform your operations? Contact our team to discuss how this solution can be tailored to your specific needs and challenges.</p>
    `;
    
    document.getElementById('usecaseModalContent').innerHTML = content;
    
    // Display images if available
    const gallery = document.getElementById('usecaseModalGallery');
    if (useCase.gallery && useCase.gallery.length > 0) {
        gallery.innerHTML = useCase.gallery.map(img => `
            <img src="${img}" alt="Use case image" onclick="openImageModal('${img}')">
        `).join('');
    } else {
        gallery.innerHTML = '';
    }
}

// Case Study Modal Functions
async function openCaseStudyModal(caseStudyId) {
    try {
        // First try to get from API
        const response = await fetch(`/api/content/casestudies/${caseStudyId}`);
        if (response.ok) {
            const caseStudy = await response.json();
            currentCaseStudyData = caseStudy;
            displayCaseStudyModal(caseStudy);
            showModal('casestudyModal');
        } else {
            // Fallback to default data
            const defaultCaseStudies = getDefaultCaseStudyData();
            const caseStudy = defaultCaseStudies.find(c => c.id == caseStudyId);
            if (caseStudy) {
                currentCaseStudyData = caseStudy;
                displayCaseStudyModal(caseStudy);
                showModal('casestudyModal');
            } else {
                console.error('Case study not found');
            }
        }
    } catch (error) {
        console.error('Error loading case study:', error);
        // Fallback to default data
        const defaultCaseStudies = getDefaultCaseStudyData();
        const caseStudy = defaultCaseStudies.find(c => c.id == caseStudyId);
        if (caseStudy) {
            currentCaseStudyData = caseStudy;
            displayCaseStudyModal(caseStudy);
            showModal('casestudyModal');
        }
    }
}

function displayCaseStudyModal(caseStudy) {
    document.getElementById('casestudyModalTitle').textContent = caseStudy.title;
    document.getElementById('casestudyModalClient').textContent = caseStudy.client;
    document.getElementById('casestudyModalDate').textContent = caseStudy.date;
    document.getElementById('casestudyModalIndustry').textContent = caseStudy.industry;
    document.getElementById('casestudyModalImage').src = caseStudy.image;
    document.getElementById('casestudyModalImage').alt = caseStudy.title;
    document.getElementById('casestudyModalSummary').textContent = caseStudy.summary;
    
    // Display results
    const resultsContainer = document.getElementById('casestudyModalResults');
    resultsContainer.innerHTML = caseStudy.results.map(result => `
        <div class="casestudy-result">
            <span class="casestudy-result-number">${result.number}</span>
            <span class="casestudy-result-label">${result.label}</span>
        </div>
    `).join('');
    
    // Display tags
    const tagsContainer = document.getElementById('casestudyModalTags');
    tagsContainer.innerHTML = caseStudy.tags.map(tag => `
        <span class="casestudy-tag">${tag}</span>
    `).join('');
    
    // Display detailed content
    const content = caseStudy.content || `
        <h2>Challenge</h2>
        <p>${caseStudy.summary}</p>
        
        <h2>Solution</h2>
        <p>Our team worked closely with ${caseStudy.client} to develop a customized solution that addressed their specific needs and challenges.</p>
        
        <h2>Implementation</h2>
        <p>The implementation process was carefully planned and executed to ensure minimal disruption to their existing operations while maximizing the benefits of the new solution.</p>
        
        <h2>Results</h2>
        <p>The results speak for themselves, with significant improvements across all key metrics and a positive impact on their business operations.</p>
    `;
    
    document.getElementById('casestudyModalContent').innerHTML = content;
    
    // Display images if available
    const gallery = document.getElementById('casestudyModalGallery');
    if (caseStudy.gallery && caseStudy.gallery.length > 0) {
        gallery.innerHTML = caseStudy.gallery.map(img => `
            <img src="${img}" alt="Case study image" onclick="openImageModal('${img}')">
        `).join('');
    } else {
        gallery.innerHTML = '';
    }
}

// Modal Control Functions
function showModal(modalId) {
    console.log('showModal called with ID:', modalId);
    const modal = document.getElementById(modalId);
    console.log('Modal element found:', modal);
    if (modal) {
        // Move modal to body if it's not already there
        if (modal.parentElement !== document.body) {
            console.log('Moving modal to body element');
            document.body.appendChild(modal);
        }
        
        // Force the modal to be visible
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        modal.style.zIndex = '99999';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        console.log('Modal should now be visible');
        console.log('Modal computed styles:', {
            display: getComputedStyle(modal).display,
            opacity: getComputedStyle(modal).opacity,
            visibility: getComputedStyle(modal).visibility,
            zIndex: getComputedStyle(modal).zIndex,
            position: getComputedStyle(modal).position
        });
    } else {
        console.error('Modal element not found:', modalId);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            closeModal(openModal.id);
        }
    }
});

// Action Functions
function shareBlog() {
    if (currentBlogData) {
        const url = `${window.location.origin}${window.location.pathname}#blog-${currentBlogData.id}`;
        if (navigator.share) {
            navigator.share({
                title: currentBlogData.title,
                text: currentBlogData.excerpt,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            alert('Blog link copied to clipboard!');
        }
    }
}

function contactUs() {
    if (currentUseCaseData) {
        const subject = `Interest in ${currentUseCaseData.title} Use Case`;
        const body = `Hi, I'm interested in learning more about the ${currentUseCaseData.title} use case. Please provide more information.`;
        window.location.href = `mailto:info@emma.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
}

function downloadCaseStudy() {
    if (currentCaseStudyData) {
        // Create a simple text version of the case study for download
        const content = `
CASE STUDY: ${currentCaseStudyData.title}
Client: ${currentCaseStudyData.client}
Industry: ${currentCaseStudyData.industry}
Date: ${currentCaseStudyData.date}

SUMMARY:
${currentCaseStudyData.summary}

RESULTS:
${currentCaseStudyData.results.map(r => `${r.number} - ${r.label}`).join('\n')}

TAGS:
${currentCaseStudyData.tags.join(', ')}

DETAILED CONTENT:
${currentCaseStudyData.content || 'No detailed content available.'}
        `;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentCaseStudyData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_case_study.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

function openImageModal(imageSrc) {
    // Simple image modal for gallery images
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    
    modal.innerHTML = `
        <div style="max-width: 90%; max-height: 90%; position: relative;">
            <img src="${imageSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px;">
            <button onclick="this.parentElement.parentElement.remove()" style="
                position: absolute;
                top: -40px;
                right: 0;
                background: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                font-size: 20px;
                cursor: pointer;
                color: #333;
            ">&times;</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

// Initialize Resources Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('resources')) {
        window.resourcesManager = new ResourcesManager();
    }
    
    // Ensure all modals are properly positioned
    const modals = ['blogModal', 'usecaseModal', 'casestudyModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && modal.parentElement !== document.body) {
            console.log(`Moving ${modalId} to body element`);
            document.body.appendChild(modal);
        }
    });
});

// Test function to debug modal issues
function testModal() {
    console.log('Testing modal system...');
    
    // Check if modal exists
    const modal = document.getElementById('blogModal');
    console.log('Modal element:', modal);
    console.log('Modal parent:', modal?.parentElement);
    console.log('Modal in DOM:', document.body.contains(modal));
    
    const testBlog = {
        id: 999,
        title: 'Test Blog Post',
        category: 'Test',
        date: 'Dec 25, 2024',
        author: 'Test Author',
        authorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop',
        content: '<h2>Test Content</h2><p>This is a test blog post to verify the modal system is working.</p>'
    };
    
    currentBlogData = testBlog;
    displayBlogModal(testBlog);
    showModal('blogModal');
    
    // Additional debugging
    setTimeout(() => {
        const modalAfter = document.getElementById('blogModal');
        console.log('Modal after showModal:', modalAfter);
        console.log('Modal classes:', modalAfter?.className);
        console.log('Modal styles:', modalAfter ? {
            display: getComputedStyle(modalAfter).display,
            opacity: getComputedStyle(modalAfter).opacity,
            visibility: getComputedStyle(modalAfter).visibility,
            zIndex: getComputedStyle(modalAfter).zIndex,
            position: getComputedStyle(modalAfter).position
        } : 'Modal not found');
    }, 100);
}

// Make test function available globally
window.testModal = testModal;

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AgenticAIApp,
        ThemeManager,
        AnimationManager,
        InteractiveManager,
        PerformanceOptimizer,
        Utils,
        ResourcesManager
    };
}

// ========================================
// PRICING SECTION FUNCTIONALITY
// ========================================

class PricingManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeAnimations();
    }

    bindEvents() {
        // Contact Sales buttons
        const contactButtons = document.querySelectorAll('.plan-btn, .custom-cta');
        contactButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.openContactForm();
            });
        });

        // Form submission
        const salesForm = document.getElementById('sales-form');
        if (salesForm) {
            salesForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(e);
            });
        }

        // Form close button
        const formClose = document.querySelector('.form-close');
        if (formClose) {
            formClose.addEventListener('click', this.closeContactForm);
        }

        // Close form on backdrop click
        const contactForm = document.getElementById('contact-sales-form');
        if (contactForm) {
            contactForm.addEventListener('click', (e) => {
                if (e.target === contactForm) {
                    this.closeContactForm();
                }
            });
        }

        // Escape key to close form
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && contactForm && contactForm.style.display !== 'none') {
                this.closeContactForm();
            }
        });
    }

    initializeAnimations() {
        // Animate pricing cards on scroll
        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            gsap.fromTo('#pricing-cards .pricing-card', 
                { 
                    opacity: 0, 
                    y: 50,
                    scale: 0.9
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '#pricing-cards',
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Animate custom solutions section
            gsap.fromTo('.custom-solutions', 
                { 
                    opacity: 0, 
                    y: 30
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '.custom-solutions',
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );

            // Animate form appearance
            gsap.fromTo('#sales-form', 
                { 
                    opacity: 0,
                    scale: 0.9
                },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                }
            );
        }
    }

    openContactForm() {
        const form = document.getElementById('contact-sales-form');
        if (form) {
            form.style.display = 'flex';
            form.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Focus on first input
            const firstInput = form.querySelector('input[required]');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 300);
            }
        }
    }

    closeContactForm() {
        const form = document.getElementById('contact-sales-form');
        if (form) {
            form.classList.remove('show');
            form.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    async handleFormSubmission(e) {
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        try {
            // Simulate API call (replace with actual endpoint)
            const response = await this.submitContactForm(data);
            
            if (response.success) {
                this.showSuccessMessage();
                form.reset();
                this.closeContactForm();
            } else {
                throw new Error(response.message || 'Failed to submit form');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage(error.message);
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    async submitContactForm(data) {
        try {
            const response = await fetch('/api/contact-sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw new Error('Network error. Please check your connection and try again.');
        }
    }

    showSuccessMessage() {
        this.showNotification('Thank you! Our sales team will contact you within 24 hours.', 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message || 'Something went wrong. Please try again.', 'error');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
                </div>
                <div class="notification-message">${message}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;

        // Add animation keyframes if not exists
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .notification-icon {
                    font-weight: bold;
                    font-size: 1.2rem;
                }
                .notification-message {
                    flex: 1;
                    font-size: 0.95rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Global functions for HTML onclick handlers
function closeContactForm() {
    if (window.pricingManager) {
        window.pricingManager.closeContactForm();
    }
}

// Interactive Hero Section Manager
class InteractiveHeroManager {
    constructor() {
        this.currentAvatar = 'us';
        this.avatars = ['us', 'saudi', 'india', 'avatar1', 'avatar2', 'avatar3'];
        this.avatarIndex = 0;
        this.audioFiles = {
            us: '/Logo And Recording/Emma English Voice .opus',
            saudi: '/Logo And Recording/Emma Arabic Audio.opus',
            india: '/Logo And Recording/Emma Hindi Voice.opus',
            avatar1: '/Logo And Recording/Emma English Voice .opus',
            avatar2: '/Logo And Recording/Emma English Voice .opus',
            avatar3: '/Logo And Recording/Emma English Voice .opus'
        };
        this.languageNames = {
            us: 'English',
            saudi: 'العربية',
            india: 'हिन्दी',
            avatar1: 'English',
            avatar2: 'English',
            avatar3: 'English'
        };
        this.isPlaying = false;
        this.audio = null;
        
        // Auto-cycling settings
        this.autoCycleEnabled = true;
        this.avatarCycleInterval = null;
        this.avatarCycleDelay = 8000; // 8 seconds between avatar changes
        this.userInteracted = false; // Track if user manually changed avatar
        this.typingInterval = null; // Track typing animation interval
        
        // Dynamic content data
        this.speechMessages = {
            banking: [
                "I can process loan applications in seconds with 99.9% accuracy!",
                "Fraud detection and risk assessment are my specialties in banking.",
                "I help banks reduce operational costs by 40% through automation.",
                "Customer service queries? I handle thousands daily with precision."
            ],
            healthcare: [
                "I schedule patient appointments and reduce wait times by 60%!",
                "Medical record management and HIPAA compliance are my strengths.",
                "I help healthcare providers focus on patient care, not paperwork.",
                "Diagnostic assistance and treatment recommendations are my expertise."
            ],
            education: [
                "I create personalized learning paths for 2,341+ students daily!",
                "Course management and student support are my core capabilities.",
                "I boost student engagement by 85% through adaptive learning.",
                "24/7 academic support and instant feedback for better outcomes."
            ],
            general: [
                "I can assist with planning, research, creative work, and more!",
                "Ready to transform your business operations with AI intelligence.",
                "From data analysis to customer service, I excel in every domain.",
                "Experience the future of AI assistance with Emma by your side."
            ]
        };
        
        // Avatar-specific messages to showcase versatility
        this.avatarMessages = {
            us: [
                "Emma - Enterprise AI Solution",
                "Business transformation across all industries",
                "10,000+ transactions daily • 99.9% accuracy",
                "40% cost reduction through intelligent automation",
                "Healthcare • Banking • Education expertise",
                "Patient scheduling • Fraud detection • Learning management",
                "2,341+ students • 60% wait time reduction",
                "Your strategic AI partner for digital growth"
            ],
            saudi: [
                "أنا إيما، حل الذكاء الاصطناعي المتقدم لتحويل الأعمال.",
                "أؤتمت العمليات المعقدة عبر قطاعات الرعاية الصحية والبنوك والتعليم.",
                "أعالج أكثر من 10,000 معاملة يومياً بدقة 99.9% وامتثال كامل.",
                "أقلل التكاليف التشغيلية بنسبة 40% من خلال الأتمتة الذكية.",
                "أدير جدولة المرضى وأقلل أوقات الانتظار بنسبة 60% في الرعاية الصحية.",
                "أعالج طلبات القروض وأكتشف الاحتيال في الوقت الفعلي للبنوك.",
                "أنشئ تجارب تعليمية شخصية لأكثر من 2,341 طالب يومياً.",
                "شريكك الاستراتيجي في الذكاء الاصطناعي للتحول الرقمي والنمو."
            ],
            india: [
                "मैं एम्मा हूं, व्यावसायिक परिवर्तन के लिए उन्नत AI समाधान।",
                "मैं स्वास्थ्य सेवा, बैंकिंग और शिक्षा क्षेत्रों में जटिल प्रक्रियाओं को स्वचालित करती हूं।",
                "मैं प्रतिदिन 10,000+ लेनदेन को 99.9% सटीकता और अनुपालन के साथ संसाधित करती हूं।",
                "मैं बुद्धिमान प्रक्रिया स्वचालन के माध्यम से परिचालन लागत को 40% कम करती हूं।",
                "मैं स्वास्थ्य सेवा में रोगी अनुसूची का प्रबंधन करती हूं, प्रतीक्षा समय को 60% कम करती हूं।",
                "मैं बैंकिंग के लिए ऋण आवेदनों को संसाधित करती हूं और वास्तविक समय में धोखाधड़ी का पता लगाती हूं।",
                "मैं प्रतिदिन 2,341+ छात्रों के लिए व्यक्तिगत शिक्षण अनुभव बनाती हूं।",
                "डिजिटल परिवर्तन और विकास के लिए आपका रणनीतिक AI भागीदार।"
            ],
            avatar1: [
                "Healthcare AI Specialist",
                "Advanced patient scheduling & care management",
                "5,000+ appointments daily • 60% reduced wait times",
                "HIPAA-compliant automation & EHR integration",
                "Real-time monitoring & automated follow-ups",
                "Your trusted healthcare technology partner"
            ],
            avatar2: [
                "Banking AI Specialist",
                "Financial services automation & compliance",
                "15,000+ loan applications • 99.9% accuracy",
                "Advanced fraud detection & real-time monitoring",
                "Full regulatory compliance & cost reduction",
                "Your secure financial technology partner"
            ],
            avatar3: [
                "Education AI Specialist",
                "Personalized learning & academic management",
                "2,341+ students • 85% engagement boost",
                "AI-powered content delivery & assessment",
                "LMS integration & automated feedback systems",
                "Your strategic education technology partner"
            ]
        };
        
        this.currentIndustry = 'banking';
        this.speechIndex = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAutoPlay();
        this.updateAvatarDisplay();
        this.setupDynamicContent();
        this.startSpeechCycle();
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Avatar dots navigation with enhanced interactions
        const dots = document.querySelectorAll('.avatar-dots .dot');
        console.log('Found dots:', dots.length);
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToAvatar(index);
                this.createRippleEffect(dot);
            });
            
            // Add enhanced hover effects
            dot.addEventListener('mouseenter', () => {
                gsap.to(dot, { 
                    scale: 1.4, 
                    duration: 0.3, 
                    ease: 'back.out(1.7)',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)'
                });
            });
            
            dot.addEventListener('mouseleave', () => {
                gsap.to(dot, { 
                    scale: 1, 
                    duration: 0.3, 
                    ease: 'back.out(1.7)',
                    boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
                });
            });
        });

        // Avatar image click to cycle through with advanced animations
        const avatarImages = document.querySelectorAll('.avatar-image');
        console.log('Found avatar images:', avatarImages.length);
        avatarImages.forEach(img => {
            img.addEventListener('click', () => {
                this.nextAvatar();
                this.createClickEffect(img);
                this.createRippleEffect(img);
            });
            
            // Enhanced hover effects for avatar images
            img.addEventListener('mouseenter', () => {
                gsap.to(img, { 
                    scale: 1.05, 
                    duration: 0.4, 
                    ease: 'power2.out',
                    filter: 'brightness(1.1) contrast(1.1) saturate(1.2)'
                });
            });
            
            img.addEventListener('mouseleave', () => {
                gsap.to(img, { 
                    scale: 1, 
                    duration: 0.4, 
                    ease: 'power2.out',
                    filter: 'brightness(1) contrast(1.1) saturate(1)'
                });
            });
            
            // Add hover sound wave effect
            img.addEventListener('mouseenter', () => {
                this.createHoverEffect(img);
            });
        });
        
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.previousAvatar();
                this.createRippleEffect(document.querySelector('.avatar-container'));
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.nextAvatar();
                this.createRippleEffect(document.querySelector('.avatar-container'));
            } else if (e.key === ' ') {
                e.preventDefault();
                this.toggleAutoCycle();
            } else if (e.key >= '1' && e.key <= '6') {
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                if (index < this.avatars.length) {
                    this.goToAvatar(index);
                    this.createRippleEffect(document.querySelector('.avatar-container'));
                }
            }
        });
        
        // Add touch gestures for mobile
        this.setupTouchGestures();

        // Use case cards interaction
        const useCaseCards = document.querySelectorAll('.use-case-card');
        useCaseCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const industry = e.currentTarget.dataset.industry;
                this.switchIndustry(industry);
            });
        });

        // Audio controls
        const audioBtn = document.getElementById('audio-play-btn');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                this.toggleAudio();
                this.createRippleEffect(audioBtn);
            });
        }

        // Audio progress bar interaction
        const audioProgress = document.querySelector('.audio-progress');
        if (audioProgress) {
            audioProgress.addEventListener('click', (e) => {
                if (this.audio) {
                    const rect = audioProgress.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = clickX / rect.width;
                    this.audio.currentTime = percentage * this.audio.duration;
                }
            });
        }

        // Language selection buttons
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = button.dataset.lang;
                const avatar = button.dataset.avatar;
                
                // Update active language button
                langButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Switch to corresponding avatar
                this.switchToAvatar(avatar);
                
                // Create ripple effect
                this.createRippleEffect(button);
                
                // Update audio for new language
                this.updateAudioForLanguage(lang);
            });
        });
    }

    setupAutoPlay() {
        console.log('Setting up auto play, autoCycleEnabled:', this.autoCycleEnabled);
        // Enable automatic avatar cycling to showcase versatility
        if (this.autoCycleEnabled) {
            this.startAvatarCycle();
        }
    }
    
    startAvatarCycle() {
        this.avatarCycleInterval = setInterval(() => {
            if (!this.userInteracted) {
                this.nextAvatar();
                this.updateAvatarSpeech();
            }
        }, this.avatarCycleDelay);
    }
    
    stopAvatarCycle() {
        if (this.avatarCycleInterval) {
            clearInterval(this.avatarCycleInterval);
            this.avatarCycleInterval = null;
        }
    }
    
    stopTypingAnimation() {
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
        }
    }
    
    createClickEffect(element) {
        // Create enhanced ripple effect with particles
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Main ripple
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 70%);
            transform: scale(0);
            animation: ripple 0.8s ease-out;
            pointer-events: none;
            z-index: 1000;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        `;
        
        const size = Math.max(rect.width, rect.height) * 1.5;
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (centerX - size / 2) + 'px';
        ripple.style.top = (centerY - size / 2) + 'px';
        
        document.body.appendChild(ripple);
        
        // Create particle burst
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, rgba(139, 92, 246, 0.9) 0%, rgba(236, 72, 153, 0.7) 50%, transparent 100%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1001;
                box-shadow: 0 0 8px rgba(139, 92, 246, 0.8);
            `;
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            const endX = centerX + Math.cos(angle) * distance;
            const endY = centerY + Math.sin(angle) * distance;
            
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            
            document.body.appendChild(particle);
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`, opacity: 0 }
            ], {
                duration: 800,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
        
        // Add ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(3);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            ripple.remove();
            style.remove();
        }, 800);
    }

    createRippleEffect(element) {
        // Create a subtle ripple effect for dots
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
            transform: scale(0);
            animation: rippleDot 0.4s ease-out;
            pointer-events: none;
            z-index: 1000;
        `;
        
        const size = Math.max(rect.width, rect.height) * 2;
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.left + rect.width / 2 - size / 2) + 'px';
        ripple.style.top = (rect.top + rect.height / 2 - size / 2) + 'px';
        
        document.body.appendChild(ripple);
        
        // Add ripple animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rippleDot {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            ripple.remove();
            style.remove();
        }, 400);
    }
    
    createHoverEffect(element) {
        // Create sound wave rings
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const wave = document.createElement('div');
                wave.style.cssText = `
                    position: absolute;
                    border: 2px solid rgba(139, 92, 246, 0.6);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 999;
                `;
                
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                wave.style.left = centerX + 'px';
                wave.style.top = centerY + 'px';
                wave.style.width = '0px';
                wave.style.height = '0px';
                wave.style.marginLeft = '-0px';
                wave.style.marginTop = '-0px';
                
                document.body.appendChild(wave);
                
                gsap.to(wave, {
                    width: '200px',
                    height: '200px',
                    marginLeft: '-100px',
                    marginTop: '-100px',
                    opacity: 0,
                    duration: 1,
                    ease: 'power2.out',
                    onComplete: () => wave.remove()
                });
            }, i * 200);
        }
    }
    
    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        let isScrolling = false;
        
        const avatarContainer = document.querySelector('.avatar-container');
        if (!avatarContainer) return;
        
        avatarContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isScrolling = false;
        });
        
        avatarContainer.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = Math.abs(startX - currentX);
            const diffY = Math.abs(startY - currentY);
            
            if (diffX > diffY) {
                isScrolling = true;
            }
        });
        
        avatarContainer.addEventListener('touchend', (e) => {
            if (!startX || !startY || !isScrolling) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextAvatar();
                } else {
                    this.previousAvatar();
                }
            }
            
            startX = 0;
            startY = 0;
            isScrolling = false;
        });
    }
    
    resetUserInteraction() {
        // Reset user interaction flag after a delay
        setTimeout(() => {
            this.userInteracted = false;
        }, 10000); // 10 seconds after user interaction
    }

    switchToAvatar(avatar) {
        // Stop current audio if playing
        if (this.isPlaying) {
            this.stopAudio();
        }
        
        this.currentAvatar = avatar;
        this.avatarIndex = this.avatars.indexOf(avatar);
        this.updateAvatarDisplay();
        this.updateLanguageButtons();
        this.updateAudioInfo();
        
        // Reset audio controls for new avatar
        this.updatePlayButton();
        this.updateTimeDisplay();
        this.updateProgressBar();
    }

    nextAvatar() {
        this.avatarIndex = (this.avatarIndex + 1) % this.avatars.length;
        this.currentAvatar = this.avatars[this.avatarIndex];
        this.updateAvatarDisplay();
        this.updateLanguageButtons();
        this.updateAudioInfo();
        this.updateAvatarSpeech();
    }

    previousAvatar() {
        this.avatarIndex = this.avatarIndex === 0 ? this.avatars.length - 1 : this.avatarIndex - 1;
        this.currentAvatar = this.avatars[this.avatarIndex];
        this.updateAvatarDisplay();
        this.updateLanguageButtons();
        this.updateAudioInfo();
        this.updateAvatarSpeech();
    }

    goToAvatar(index) {
        this.avatarIndex = index;
        this.currentAvatar = this.avatars[index];
        this.userInteracted = true; // Mark user interaction
        this.updateAvatarDisplay();
        this.updateLanguageButtons();
        this.updateAudioInfo();
        this.updateAvatarSpeech();
        this.resetUserInteraction(); // Reset after delay
    }

    updateAvatarDisplay() {
        // Update avatar slides with enhanced transitions
        const slides = document.querySelectorAll('.avatar-slide');
        const currentSlide = document.querySelector(`.avatar-slide[data-avatar="${this.currentAvatar}"]`);
        
        // Fade out current active slide
        slides.forEach(slide => {
            if (slide.classList.contains('active')) {
                gsap.to(slide, {
                    scale: 0.8,
                    opacity: 0,
                    rotationY: -15,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        slide.classList.remove('active');
                    }
                });
            }
        });

        // Update dots with enhanced animation
        const dots = document.querySelectorAll('.avatar-dots .dot');
        dots.forEach((dot, index) => {
            const isActive = index === this.avatarIndex;
            dot.classList.toggle('active', isActive);
            
            if (isActive) {
                gsap.to(dot, {
                    scale: 1.2,
                    duration: 0.3,
                    ease: 'back.out(1.7)',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)'
                });
            } else {
                gsap.to(dot, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out',
                    boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
                });
            }
        });

        // Animate in new slide with enhanced effects
        if (currentSlide) {
            currentSlide.classList.add('active');
            gsap.fromTo(currentSlide, 
                { 
                    scale: 0.6, 
                    opacity: 0, 
                    rotationY: 15,
                    filter: 'blur(10px)'
                },
                { 
                    scale: 1, 
                    opacity: 1, 
                    rotationY: 0,
                    filter: 'blur(0px)',
                    duration: 0.6, 
                    ease: 'back.out(1.7)',
                    delay: 0.2
                }
            );

            // Add a subtle glow effect to the new avatar
            const avatarImage = currentSlide.querySelector('.avatar-image');
            if (avatarImage) {
                gsap.fromTo(avatarImage, 
                    { 
                        filter: 'brightness(1.2) contrast(1.1) saturate(1.3) drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))'
                    },
                    { 
                        filter: 'brightness(1) contrast(1.1) saturate(1) drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))',
                        duration: 1,
                        ease: 'power2.out'
                    }
                );
            }
        }
    }
    
    updateAvatarSpeech() {
        // Update speech bubble with avatar-specific message
        const speechText = document.getElementById('speech-text');
        if (speechText && this.avatarMessages[this.currentAvatar]) {
            const messages = this.avatarMessages[this.currentAvatar];
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            
            // Stop any existing typing animation
            this.stopTypingAnimation();
            
            // Add typing animation directly
            this.animateTyping(speechText, randomMessage);
        }
    }
    
    animateTyping(element, text) {
        // Clear any existing intervals
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }
        
        // Fallback: if text is empty or invalid, just set it directly
        if (!text || text.length === 0) {
            element.textContent = 'Emma - AI Assistant';
            return;
        }
        
        element.textContent = '';
        let i = 0;
        this.typingInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(this.typingInterval);
                this.typingInterval = null;
            }
        }, 50); // 50ms per character for smooth typing effect
    }

    updateLanguageButtons() {
        // Update language buttons based on current avatar
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.avatar === this.currentAvatar) {
                button.classList.add('active');
            }
        });
    }

    updateAudioInfo() {
        // No audio info display in new design
    }

    toggleAudio() {
        if (this.isPlaying) {
            this.stopAudio();
        } else {
            this.playAudio();
        }
    }

    playAudio() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }

        this.audio = new Audio(this.audioFiles[this.currentAvatar]);
        
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateDuration();
            this.updateProgressBar();
        });

        this.audio.addEventListener('timeupdate', () => {
            this.updateTimeDisplay();
            this.updateProgressBar();
        });

        this.audio.addEventListener('ended', () => {
            this.stopAudio();
        });

        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton();
            this.animateSpeakingIndicator();
            this.addAudioVisualEffects();
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
            this.stopSpeakingIndicator();
            this.removeAudioVisualEffects();
        });

        this.audio.play().then(() => {
            console.log('Audio started playing for avatar:', this.currentAvatar);
        }).catch(error => {
            console.log('Audio play failed:', error);
            this.stopAudio();
        });
    }

    stopAudio() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
        this.isPlaying = false;
        this.updatePlayButton();
        this.stopSpeakingIndicator();
    }

    updatePlayButton() {
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        
        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    updateDuration() {
        if (this.audio) {
            const duration = this.formatTime(this.audio.duration);
            const durationSpan = document.querySelector('.time-display');
            if (durationSpan) {
                durationSpan.textContent = duration;
            }
        }
    }

    updateTimeDisplay() {
        if (this.audio) {
            const currentTime = this.formatTime(this.audio.currentTime);
            const durationSpan = document.querySelector('.time-display');
            if (durationSpan) {
                durationSpan.textContent = currentTime;
            }
        }
    }

    updateProgressBar() {
        if (this.audio && this.audio.duration) {
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                const percentage = (this.audio.currentTime / this.audio.duration) * 100;
                progressFill.style.width = percentage + '%';
            }
        }
    }

    addAudioVisualEffects() {
        // Add visual effects when audio is playing
        const avatarCard = document.querySelector('.avatar-card');
        const avatarImage = document.querySelector('.avatar-image');
        const speakingIndicator = document.querySelector('.speaking-indicator');
        
        if (avatarCard) {
            avatarCard.classList.add('audio-playing');
            gsap.to(avatarCard, {
                boxShadow: '0 0 60px rgba(139, 92, 246, 0.4), 0 0 100px rgba(236, 72, 153, 0.2)',
                duration: 0.5,
                ease: 'power2.out'
            });
        }

        if (avatarImage) {
            gsap.to(avatarImage, {
                filter: 'brightness(1.1) contrast(1.1) saturate(1.2) drop-shadow(0 0 20px rgba(139, 92, 246, 0.6))',
                duration: 0.5,
                ease: 'power2.out'
            });
        }

        if (speakingIndicator) {
            speakingIndicator.classList.add('active');
        }
    }

    removeAudioVisualEffects() {
        // Remove visual effects when audio stops
        const avatarCard = document.querySelector('.avatar-card');
        const avatarImage = document.querySelector('.avatar-image');
        const speakingIndicator = document.querySelector('.speaking-indicator');
        
        if (avatarCard) {
            avatarCard.classList.remove('audio-playing');
            gsap.to(avatarCard, {
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
                duration: 0.5,
                ease: 'power2.out'
            });
        }

        if (avatarImage) {
            gsap.to(avatarImage, {
                filter: 'brightness(1) contrast(1.1) saturate(1) drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))',
                duration: 0.5,
                ease: 'power2.out'
            });
        }

        if (speakingIndicator) {
            speakingIndicator.classList.remove('active');
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    updateAudioForLanguage(lang) {
        // Map language codes to avatar names for audio files
        const langToAvatar = {
            'en': 'us',
            'ar': 'saudi', 
            'hi': 'india'
        };
        
        const targetAvatar = langToAvatar[lang];
        if (targetAvatar) {
            // Stop current audio if playing
            if (this.isPlaying) {
                this.stopAudio();
            }
            
            // Update current avatar and audio file
            this.currentAvatar = targetAvatar;
            this.avatarIndex = this.avatars.indexOf(targetAvatar);
            
            // Update the display
            this.updateAvatarDisplay();
            
            // Reset audio controls
            this.updatePlayButton();
            this.updateTimeDisplay();
            this.updateProgressBar();
            
            console.log(`Switched to ${lang} language with avatar: ${targetAvatar}`);
        }
    }

    animateSpeakingIndicator() {
        const waves = document.querySelectorAll('.wave');
        waves.forEach((wave, index) => {
            gsap.to(wave, {
                scaleY: 1.5,
                duration: 0.3,
                repeat: -1,
                yoyo: true,
                delay: index * 0.1,
                ease: 'power2.inOut'
            });
        });
    }

    stopSpeakingIndicator() {
        const waves = document.querySelectorAll('.wave');
        gsap.killTweensOf(waves);
        gsap.set(waves, { scaleY: 1 });
    }

    // Dynamic Content Methods
    setupDynamicContent() {
        this.updateSpeechBubble();
        this.updateNotifications();
    }

    switchIndustry(industry) {
        this.currentIndustry = industry;
        this.updateUseCaseCards();
        this.updateSpeechBubble();
        this.updateNotifications();
    }

    updateUseCaseCards() {
        const cards = document.querySelectorAll('.use-case-card');
        cards.forEach(card => {
            card.classList.toggle('active', card.dataset.industry === this.currentIndustry);
        });
    }

    updateSpeechBubble() {
        const speechText = document.getElementById('speech-text');
        if (speechText) {
            const messages = this.speechMessages[this.currentIndustry] || this.speechMessages.general;
            const message = messages[this.speechIndex % messages.length];
            
            // Animate speech bubble
            gsap.to('#speech-bubble', {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    speechText.textContent = message;
                    gsap.to('#speech-bubble', {
                        scale: 1,
                        opacity: 1,
                        duration: 0.3,
                        ease: 'back.out(1.7)'
                    });
                }
            });
        }
    }

    updateNotifications() {
        // Update notification system for dynamic content
        // This method can be used to show notifications about content updates
        const notificationContainer = document.getElementById('notification-container');
        if (notificationContainer) {
            // Add notification logic here if needed
            console.log('Notifications updated for industry:', this.currentIndustry);
        }
    }


    startSpeechCycle() {
        setInterval(() => {
            this.cycleSpeech();
        }, 6000);
    }

    cycleSpeech() {
        // Use avatar-specific messages to showcase versatility
        if (this.avatarMessages[this.currentAvatar]) {
            const messages = this.avatarMessages[this.currentAvatar];
            this.speechIndex = (this.speechIndex + 1) % messages.length;
            this.updateSpeechBubble();
        } else {
            // Fallback to industry-specific messages
            const messages = this.speechMessages[this.currentIndustry] || this.speechMessages.general;
            this.speechIndex = (this.speechIndex + 1) % messages.length;
            this.updateSpeechBubble();
        }
    }
}

// Initialize Pricing Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('pricing')) {
        window.pricingManager = new PricingManager();
    }
    
    // Initialize Interactive Hero Manager
    if (document.querySelector('.ai-assistant-section')) {
        window.heroManager = new InteractiveHeroManager();
        console.log('Hero manager initialized:', window.heroManager);
        
        // Add global test function
        window.testAvatarCycle = () => {
            if (window.heroManager) {
                console.log('Manually testing avatar cycle...');
                window.heroManager.nextAvatar();
            }
        };
    }
    
                // Initialize CMS and load logo
                if (typeof CMSService !== 'undefined') {
                    const cms = new CMSService();
                    cms.loadLogo();
                    cms.loadBlogStyles();
                }
                
                
});

// New Avatar Cycling System
class AvatarCycler {
    constructor() {
        this.avatars = [
            {
                image: '/Logo And Recording/US.jpeg',
                comment: 'Emma - Enterprise AI Solution'
            },
            {
                image: '/Logo And Recording/Saudi.jpeg',
                comment: 'أنا إيما، حل الذكاء الاصطناعي المتقدم لتحويل الأعمال.'
            },
            {
                image: '/Logo And Recording/India.jpeg',
                comment: 'मैं एम्मा हूं, व्यावसायिक परिवर्तन के लिए उन्नत AI समाधान।'
            },
            {
                image: '/Logo And Recording/image (3).jpeg',
                comment: 'Healthcare AI Specialist - I can process medical data with 99.9% accuracy!'
            },
            {
                image: '/Logo And Recording/image (4).jpeg',
                comment: 'Banking AI Specialist - I help banks reduce operational costs by 40%'
            },
            {
                image: '/Logo And Recording/image (5).jpeg',
                comment: 'Education AI Specialist - Personalized learning for every student'
            }
        ];
        
        this.currentIndex = 0;
        this.isPlaying = false;
        this.intervalId = null;
        
        this.init();
    }
    
    init() {
        this.avatarImage = document.getElementById('avatar-image');
        this.commentText = document.getElementById('avatar-comment-text');
        this.avatarBox = document.querySelector('.avatar-box');
        this.audioLanguages = document.querySelectorAll('.audio-language');
        this.currentAudio = null;
        
        if (!this.avatarImage || !this.commentText) {
            console.log('Avatar elements not found, retrying...');
            setTimeout(() => this.init(), 1000);
            return;
        }
        
        this.startCycling();
        this.addClickHandler();
        this.addAudioHandlers();
    }
    
    startCycling() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.intervalId = setInterval(() => {
            this.nextAvatar();
        }, 4000); // Change every 4 seconds
    }
    
    stopCycling() {
        this.isPlaying = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    nextAvatar() {
        this.currentIndex = (this.currentIndex + 1) % this.avatars.length;
        this.updateAvatar();
    }
    
    updateAvatar() {
        const avatar = this.avatars[this.currentIndex];
        
        // Add fade out effect
        this.avatarBox.style.opacity = '0.7';
        this.avatarBox.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            this.avatarImage.src = avatar.image;
            this.avatarImage.alt = `Emma Avatar ${this.currentIndex + 1}`;
            this.commentText.textContent = avatar.comment;
            
            // Add fade in effect
            this.avatarBox.style.opacity = '1';
            this.avatarBox.style.transform = 'scale(1)';
        }, 300);
    }
    
    addClickHandler() {
        if (this.avatarBox) {
            this.avatarBox.addEventListener('click', () => {
                this.nextAvatar();
            });
        }
    }
    
    addAudioHandlers() {
        this.audioLanguages.forEach(language => {
            language.addEventListener('click', () => {
                this.playAudio(language);
            });
        });
    }
    
    playAudio(languageElement) {
        // Stop current audio if playing
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
        
        // Remove active class from all languages
        this.audioLanguages.forEach(lang => lang.classList.remove('active'));
        
        // Add active class to clicked language
        languageElement.classList.add('active');
        
        // Get audio file path
        const audioPath = languageElement.getAttribute('data-audio');
        
        if (audioPath) {
            // Create and play audio
            this.currentAudio = new Audio(audioPath);
            this.currentAudio.play().catch(error => {
                console.log('Audio playback failed:', error);
                // Remove active class if audio fails
                languageElement.classList.remove('active');
            });
            
            // Remove active class when audio ends
            this.currentAudio.addEventListener('ended', () => {
                languageElement.classList.remove('active');
            });
        }
    }
}

// Initialize avatar cycler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AvatarCycler();
});

