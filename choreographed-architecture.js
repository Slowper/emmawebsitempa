/* ===============================================
   CHOREOGRAPHED DIGITAL NARRATIVE - ANIMATIONS
   The Performance: Scroll-Triggered Sequential Story
   =============================================== */

document.addEventListener('DOMContentLoaded', function() {
    const architecture = document.getElementById('choreographed-architecture');
    if (!architecture) return;
    
    // State Management
    const state = {
        currentStep: 0,
        isAnimating: false,
        pathDrawn: false,
        stepsCompleted: new Set()
    };
    
    // Elements
    const streamPath = document.getElementById('streamPath');
    const dataPulse = document.getElementById('dataPulse');
    const lightSource = document.getElementById('lightSource');
    const contentBlocks = document.querySelectorAll('.content-block');
    
    // Initialize particles
    initializeParticles();
    
    // Path Configuration
    const pathLength = streamPath?.getTotalLength() || 0;
    if (streamPath) {
        streamPath.style.strokeDasharray = pathLength;
        streamPath.style.strokeDashoffset = pathLength;
    }
    
    // The Unbreakable Sequence for Each Section
    class ChoreographedSequence {
        constructor(step, block, anchor) {
            this.step = step;
            this.block = block;
            this.anchor = anchor; // [x, y] coordinates on path
            this.duration = {
                drawPath: 1200,
                pulse: 1500,
                arrival: 800,
                details: 600
            };
        }
        
        async execute() {
            if (state.stepsCompleted.has(this.step)) return;
            state.isAnimating = true;
            
            console.log(`🎬 Starting sequence for step ${this.step}`);
            
            // 1. Draw the Path
            await this.drawPathToSection();
            
            // 2. Launch the Pulse
            await this.launchPulse();
            
            // 3. The Arrival
            await this.arrival();
            
            // 4. Reveal the Details
            await this.revealDetails();
            
            state.stepsCompleted.add(this.step);
            state.isAnimating = false;
            
            console.log(`✅ Completed sequence for step ${this.step}`);
        }
        
        drawPathToSection() {
            return new Promise((resolve) => {
                console.log(`📍 Drawing path to step ${this.step}`);
                
                // Calculate the percentage of path to this step
                const pathPercentage = (this.step / 5) * pathLength;
                const targetOffset = pathLength - pathPercentage;
                
                // Animate the stroke-dashoffset to "draw" the path
                streamPath.style.transition = `stroke-dashoffset ${this.duration.drawPath}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                streamPath.style.strokeDashoffset = targetOffset;
                
                setTimeout(resolve, this.duration.drawPath);
            });
        }
        
        launchPulse() {
            return new Promise((resolve) => {
                console.log(`🚀 Launching pulse for step ${this.step}`);
                
                // Get the path element's position
                const svg = document.getElementById('dataStreamSvg');
                const svgRect = svg.getBoundingClientRect();
                
                // Calculate start and end points
                const pathPercentage = ((this.step - 1) / 5);
                const targetPercentage = (this.step / 5);
                
                const startPoint = this.getPointOnPath(pathPercentage);
                const endPoint = this.getPointOnPath(targetPercentage);
                
                // Position pulse at start
                dataPulse.style.opacity = '1';
                dataPulse.style.left = (svgRect.left + startPoint.x) + 'px';
                dataPulse.style.top = (svgRect.top + startPoint.y) + 'px';
                
                // Animate pulse movement
                setTimeout(() => {
                    dataPulse.style.transition = `all ${this.duration.pulse}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                    dataPulse.style.left = (svgRect.left + endPoint.x) + 'px';
                    dataPulse.style.top = (svgRect.top + endPoint.y) + 'px';
                    
                    // Move light source with pulse
                    this.moveLightSource(svgRect, startPoint, endPoint);
                }, 50);
                
                setTimeout(resolve, this.duration.pulse);
            });
        }
        
        arrival() {
            return new Promise((resolve) => {
                console.log(`📦 Arrival at step ${this.step}`);
                
                // Fade out pulse
                dataPulse.style.opacity = '0';
                
                // Activate the content block
                this.block.classList.add('revealed');
                
                // Trigger living icon reaction
                const icon = this.block.querySelector('.living-icon');
                const iconType = icon?.getAttribute('data-type');
                
                if (iconType === 'pulse') {
                    icon.classList.add('pulse-active');
                } else if (iconType === 'typing') {
                    icon.classList.add('typing-active');
                } else {
                    icon?.classList.add('light-up');
                    setTimeout(() => icon?.classList.remove('light-up'), 1000);
                }
                
                setTimeout(resolve, this.duration.arrival);
            });
        }
        
        revealDetails() {
            return new Promise((resolve) => {
                console.log(`✨ Revealing details for step ${this.step}`);
                
                // Stagger detail animations
                const details = this.block.querySelectorAll('.detail-visual');
                details.forEach((detail, index) => {
                    setTimeout(() => {
                        detail.style.opacity = '1';
                        detail.style.transform = 'translateY(0)';
                    }, index * 150);
                });
                
                // Activate app icons individually (if present)
                const appIcons = this.block.querySelectorAll('.app-icon');
                appIcons.forEach((icon, index) => {
                    setTimeout(() => {
                        icon.classList.add('activated');
                    }, index * 200);
                });
                
                setTimeout(resolve, this.duration.details);
            });
        }
        
        getPointOnPath(percentage) {
            const path = streamPath;
            const length = path.getTotalLength();
            const point = path.getPointAtLength(length * percentage);
            return { x: point.x, y: point.y };
        }
        
        moveLightSource(svgRect, startPoint, endPoint) {
            lightSource.classList.add('active');
            
            const steps = 50; // Number of animation frames
            const deltaX = (endPoint.x - startPoint.x) / steps;
            const deltaY = (endPoint.y - startPoint.y) / steps;
            
            let currentStep = 0;
            const animate = () => {
                if (currentStep < steps) {
                    const x = startPoint.x + (deltaX * currentStep);
                    const y = startPoint.y + (deltaY * currentStep);
                    
                    lightSource.style.left = (svgRect.left + x - 100) + 'px';
                    lightSource.style.top = (svgRect.top + y - 100) + 'px';
                    
                    currentStep++;
                    requestAnimationFrame(animate);
                } else {
                    lightSource.classList.remove('active');
                }
            };
            
            requestAnimationFrame(animate);
        }
    }
    
    // Scroll Observer - The Master Trigger
    const observerOptions = {
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
        rootMargin: '-10% 0px -10% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !state.isAnimating) {
                const block = entry.target;
                const step = parseInt(block.getAttribute('data-step'));
                const anchor = block.getAttribute('data-anchor')?.split(',').map(Number);
                
                // Only trigger if this is the next step in sequence
                if (step === state.currentStep + 1 || step === 1 && state.currentStep === 0) {
                    const sequence = new ChoreographedSequence(step, block, anchor);
                    sequence.execute().then(() => {
                        state.currentStep = step;
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe all content blocks
    contentBlocks.forEach(block => observer.observe(block));
    
    // Initialize Particles - The Atmosphere
    function initializeParticles() {
        const particleLayer = document.getElementById('particleLayer');
        if (!particleLayer) return;
        
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random positioning
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            
            // Random size
            const size = 2 + Math.random() * 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Random color variation
            const hue = 260 + Math.random() * 40; // Purple to pink range
            particle.style.background = `hsla(${hue}, 80%, 60%, 0.6)`;
            particle.style.boxShadow = `0 0 10px hsla(${hue}, 80%, 60%, 0.8)`;
            
            particleLayer.appendChild(particle);
        }
    }
    
    // Parallax Effect - Multi-layered Background
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    function updateParallax() {
        if (!architecture) return;
        
        const rect = architecture.getBoundingClientRect();
        const scrollProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
        
        // Move nebula layer
        const nebula = architecture.querySelector('::after');
        if (architecture.style) {
            architecture.style.setProperty('--parallax-offset', `${scrollProgress * 100}px`);
        }
        
        // Slow drift for grid overlay
        const grid = architecture.querySelector('.grid-overlay');
        if (grid) {
            grid.style.transform = `translateY(${scrollProgress * 30}px)`;
        }
    }
    
    // Enhanced Hover Interactions
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Living Icon Hover Effects
    const icons = document.querySelectorAll('.living-icon');
    icons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            const svg = this.querySelector('svg');
            if (svg) {
                svg.style.transform = 'scale(1.2) rotate(10deg)';
                svg.style.color = '#ec4899';
            }
        });
        
        icon.addEventListener('mouseleave', function() {
            const svg = this.querySelector('svg');
            if (svg) {
                svg.style.transform = 'scale(1) rotate(0deg)';
                svg.style.color = '#8b5cf6';
            }
        });
    });
    
    // App Icon Interactive Light-Up
    const appIcons = document.querySelectorAll('.app-icon');
    appIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 0 30px rgba(139, 92, 246, 0.8)';
            this.style.borderColor = 'rgba(139, 92, 246, 0.8)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.6)';
            this.style.borderColor = 'rgba(139, 92, 246, 0.2)';
        });
    });
    
    // Responsive: Disable complex animations on mobile
    if (window.innerWidth < 768) {
        console.log('📱 Mobile detected - simplifying animations');
        
        // Show all blocks immediately on mobile
        contentBlocks.forEach((block, index) => {
            setTimeout(() => {
                block.classList.add('revealed');
            }, index * 300);
        });
        
        // Hide pulse and light source on mobile
        if (dataPulse) dataPulse.style.display = 'none';
        if (lightSource) lightSource.style.display = 'none';
    }
    
    // Performance optimization: Pause animations when section is not visible
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const particles = entry.target.querySelectorAll('.particle');
            if (entry.isIntersecting) {
                particles.forEach(p => p.style.animationPlayState = 'running');
            } else {
                particles.forEach(p => p.style.animationPlayState = 'paused');
            }
        });
    }, { threshold: 0.1 });
    
    sectionObserver.observe(architecture);
    
    console.log('🎭 Choreographed Architecture initialized - Ready for performance');
});

// Export for debugging
window.choreographedArchitecture = {
    version: '1.0.0',
    status: 'ready'
};

