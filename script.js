// ========================================
// Navigation & Slides Management
// ========================================

class PresentationController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = document.querySelectorAll('[data-slide]').length;
        this.slides = document.querySelectorAll('[data-slide]');

        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupKeyboardControls();
        this.setupScrollDetection();
        this.updateProgress();
        this.updateCounter();
        this.setupShareButton();
    }

    setupNavigation() {
        // Кнопки навигации
        document.getElementById('prevBtn').addEventListener('click', () => this.prevSlide());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSlide());

        // Боковая навигация
        const sidebarLinks = document.querySelectorAll('.sidebar__link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = parseInt(link.dataset.section);
                this.goToSlide(section);
            });
        });

        // Тогл сайдбара
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');

        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('sidebar--open');
            });
        }
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                case 'PageDown':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
            }
        });
    }

    setupScrollDetection() {
        const presentation = document.getElementById('presentation');

        // Intersection Observer для определения текущего слайда
        const observerOptions = {
            root: presentation,
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
            rootMargin: '-20% 0px -20% 0px' // Trigger when slide is in middle 60% of viewport
        };

        const observer = new IntersectionObserver((entries) => {
            // Find the most visible slide
            let mostVisible = null;
            let maxRatio = 0;

            entries.forEach(entry => {
                if (entry.intersectionRatio > maxRatio) {
                    maxRatio = entry.intersectionRatio;
                    mostVisible = entry.target;
                }
            });

            if (mostVisible && maxRatio > 0.3) {
                const slideNumber = parseInt(mostVisible.dataset.slide);
                if (slideNumber !== this.currentSlide) {
                    this.currentSlide = slideNumber;
                    this.updateProgress();
                    this.updateCounter();
                }
            }
        }, observerOptions);

        this.slides.forEach(slide => observer.observe(slide));
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    prevSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > this.totalSlides) return;

        const targetSlide = document.querySelector(`[data-slide="${slideNumber}"]`);
        if (targetSlide) {
            targetSlide.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    updateProgress() {
        const progressBar = document.getElementById('progressBar');
        const progress = (this.currentSlide / this.totalSlides) * 100;
        progressBar.style.width = `${progress}%`;
    }

    updateCounter() {
        const counter = document.getElementById('counter');
        counter.textContent = `${this.currentSlide} / ${this.totalSlides}`;

        // Update navigation buttons state
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        prevBtn.disabled = this.currentSlide === 1;
        nextBtn.disabled = this.currentSlide === this.totalSlides;
    }

    setupShareButton() {
        const shareBtn = document.getElementById('shareBtn');

        if (!shareBtn) {
            console.warn('Share button not found');
            return;
        }

        shareBtn.addEventListener('click', async (event) => {
            // Prevent default and stop propagation
            event.preventDefault();
            event.stopPropagation();

            // Detect iOS devices
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

            // iOS-specific share data format
            // iOS Safari has issues with 'url' property, works better with text
            const shareData = isIOS ? {
                title: 'Здоровье тазового дна | BloomCare',
                text: `Важность укрепления мышц тазового дна для всех!\n\n${window.location.href}`
            } : {
                title: 'Здоровье тазового дна | BloomCare',
                text: 'Важность укрепления мышц тазового дна для всех!',
                url: window.location.href
            };

            const originalIcon = shareBtn.querySelector('.navigation__icon');
            const originalText = originalIcon.textContent;

            const showFeedback = (success = true) => {
                originalIcon.textContent = success ? 'check' : 'error';
                setTimeout(() => {
                    originalIcon.textContent = originalText;
                }, 2000);
            };

            try {
                // iOS/Safari requires user gesture for share/clipboard
                // Check Web Share API first (works best on mobile)
                if (navigator.share) {
                    try {
                        // iOS Safari sometimes needs a small delay
                        if (isIOS) {
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                        await navigator.share(shareData);
                        console.log('Shared successfully via Web Share API');
                        showFeedback(true);
                        return;
                    } catch (shareError) {
                        // User cancelled sharing or error occurred
                        if (shareError.name === 'AbortError') {
                            console.log('Share cancelled by user');
                            return;
                        }
                        console.warn('Share API failed, trying clipboard:', shareError);
                    }
                }

                // Fallback: Try Clipboard API
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    try {
                        await navigator.clipboard.writeText(window.location.href);
                        console.log('Link copied to clipboard');
                        showFeedback(true);
                        return;
                    } catch (clipboardError) {
                        console.warn('Clipboard API failed:', clipboardError);
                    }
                }

                // iOS Safari fallback: Create temporary input element
                // This works when Clipboard API is blocked
                const tempInput = document.createElement('input');
                tempInput.style.position = 'absolute';
                tempInput.style.left = '-9999px';
                tempInput.style.top = '0';
                tempInput.value = window.location.href;
                document.body.appendChild(tempInput);

                // Select and copy
                tempInput.select();
                tempInput.setSelectionRange(0, 99999); // For mobile devices

                const successful = document.execCommand('copy');
                document.body.removeChild(tempInput);

                if (successful) {
                    console.log('Link copied using execCommand fallback');
                    showFeedback(true);
                } else {
                    // Final fallback: show alert with URL
                    console.error('All copy methods failed');
                    const copyText = prompt('Скопируйте ссылку:', window.location.href);
                    if (copyText) {
                        showFeedback(true);
                    }
                }

            } catch (error) {
                console.error('Share failed:', error);
                showFeedback(false);
            }
        });
    }
}

// ========================================
// Инициализация
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    new PresentationController();

    // Плавное появление слайдов при загрузке
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
        slide.style.animationDelay = `${index * 0.1}s`;
    });
});

// ========================================
// Touch gestures для мобильных
// ========================================

let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe left - next slide
        const presentation = document.getElementById('presentation');
        const currentScroll = presentation.scrollTop;
        presentation.scrollTop = currentScroll + window.innerHeight;
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe right - prev slide
        const presentation = document.getElementById('presentation');
        const currentScroll = presentation.scrollTop;
        presentation.scrollTop = currentScroll - window.innerHeight;
    }
}
