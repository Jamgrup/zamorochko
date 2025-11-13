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
    }

    setupNavigation() {
        // Кнопки навигации
        document.getElementById('prev-btn').addEventListener('click', () => this.prevSlide());
        document.getElementById('next-btn').addEventListener('click', () => this.nextSlide());

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
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const slideNumber = parseInt(entry.target.dataset.slide);
                    if (slideNumber !== this.currentSlide) {
                        this.currentSlide = slideNumber;
                        this.updateProgress();
                        this.updateCounter();
                    }
                }
            });
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
        const progressBar = document.getElementById('progress-bar');
        const progress = (this.currentSlide / this.totalSlides) * 100;
        progressBar.style.width = `${progress}%`;
    }

    updateCounter() {
        const counter = document.getElementById('counter');
        counter.textContent = `${this.currentSlide} / ${this.totalSlides}`;
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
