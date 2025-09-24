/**
 * HIPAA & SOC2 Badges Scroller - Enhanced JavaScript
 * Provides additional functionality for the badges scroller
 */

class BadgesScroller {
    constructor(containerSelector = '.badges-scroller-container') {
        this.container = document.querySelector(containerSelector);
        this.scroller = this.container?.querySelector('.badges-scroller');
        this.badges = this.container?.querySelectorAll('.badge-item');
        
        if (!this.container || !this.scroller) {
            console.warn('Badges scroller container not found');
            return;
        }
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupAccessibility();
    }
    
    setupEventListeners() {
        // Pause on hover
        this.scroller.addEventListener('mouseenter', () => {
            this.pauseAnimation();
        });
        
        this.scroller.addEventListener('mouseleave', () => {
            this.resumeAnimation();
        });
        
        // Pause on focus for accessibility
        this.scroller.addEventListener('focusin', () => {
            this.pauseAnimation();
        });
        
        this.scroller.addEventListener('focusout', () => {
            this.resumeAnimation();
        });
        
        // Touch events for mobile
        this.scroller.addEventListener('touchstart', () => {
            this.pauseAnimation();
        });
        
        this.scroller.addEventListener('touchend', () => {
            this.resumeAnimation();
        });
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.resumeAnimation();
                } else {
                    this.pauseAnimation();
                }
            });
        }, {
            threshold: 0.1
        });
        
        observer.observe(this.container);
    }
    
    setupAccessibility() {
        // Add ARIA labels
        this.container.setAttribute('aria-label', 'Security and compliance badges');
        this.scroller.setAttribute('role', 'marquee');
        this.scroller.setAttribute('aria-live', 'polite');
        
        // Add keyboard navigation
        this.scroller.setAttribute('tabindex', '0');
        
        this.scroller.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleAnimation();
            }
        });
    }
    
    pauseAnimation() {
        this.scroller.style.animationPlayState = 'paused';
        this.scroller.setAttribute('aria-label', 'Animation paused. Press Enter to resume.');
    }
    
    resumeAnimation() {
        this.scroller.style.animationPlayState = 'running';
        this.scroller.setAttribute('aria-label', 'Security badges scrolling');
    }
    
    toggleAnimation() {
        const isPaused = this.scroller.style.animationPlayState === 'paused';
        if (isPaused) {
            this.resumeAnimation();
        } else {
            this.pauseAnimation();
        }
    }
    
    // Method to add new badges dynamically
    addBadge(badgeData) {
        const badgeElement = this.createBadgeElement(badgeData);
        this.scroller.appendChild(badgeElement);
    }
    
    createBadgeElement(badgeData) {
        const badgeItem = document.createElement('div');
        badgeItem.className = `badge-item ${badgeData.type || ''}`;
        
        badgeItem.innerHTML = `
            <div class="badge-content">
                <div class="badge-icon">${badgeData.icon}</div>
                <div>
                    <div class="badge-text">${badgeData.text}</div>
                    <div class="badge-subtitle">${badgeData.subtitle}</div>
                </div>
            </div>
        `;
        
        return badgeItem;
    }
    
    // Method to change animation speed
    setAnimationSpeed(speed = 20) {
        this.scroller.style.animationDuration = `${speed}s`;
    }
    
    // Method to change animation direction
    setAnimationDirection(direction = 'normal') {
        this.scroller.style.animationDirection = direction;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the badges scroller
    const badgesScroller = new BadgesScroller();
    
    // Optional: Add custom badges
    // badgesScroller.addBadge({
    //     type: 'custom',
    //     icon: 'C',
    //     text: 'Custom Badge',
    //     subtitle: 'Your Text'
    // });
    
    // Optional: Adjust animation speed
    // badgesScroller.setAnimationSpeed(15); // 15 seconds for full cycle
    
    // Optional: Reverse animation direction
    // badgesScroller.setAnimationDirection('reverse');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BadgesScroller;
}
