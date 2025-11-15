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
        this.detectCurrentSlideOnLoad();
        this.setupScrollDetection();
        this.updateProgress();
        this.updateCounter();
    }

    detectCurrentSlideOnLoad() {
        // Определяем текущий видимый слайд при загрузке страницы
        const presentation = document.getElementById('presentation');
        const viewportHeight = window.innerHeight;
        const scrollTop = presentation.scrollTop;

        // Находим слайд, который больше всего виден в viewport
        let mostVisibleSlide = 1;
        let maxVisibleArea = 0;

        this.slides.forEach(slide => {
            const slideTop = slide.offsetTop;
            const slideBottom = slideTop + slide.offsetHeight;

            // Вычисляем видимую область слайда
            const visibleTop = Math.max(slideTop, scrollTop);
            const visibleBottom = Math.min(slideBottom, scrollTop + viewportHeight);
            const visibleArea = Math.max(0, visibleBottom - visibleTop);

            if (visibleArea > maxVisibleArea) {
                maxVisibleArea = visibleArea;
                mostVisibleSlide = parseInt(slide.dataset.slide);
            }
        });

        this.currentSlide = mostVisibleSlide;
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
        let scrollTimeout;

        const updateCurrentSlide = () => {
            const viewportHeight = window.innerHeight;
            const scrollTop = presentation.scrollTop;
            const viewportCenter = scrollTop + (viewportHeight / 2);

            // Находим слайд, в котором находится центр viewport
            let currentSlideNumber = 1;

            for (let i = 0; i < this.slides.length; i++) {
                const slide = this.slides[i];
                const slideTop = slide.offsetTop;
                const slideBottom = slideTop + slide.offsetHeight;

                // Если центр viewport находится в пределах этого слайда
                if (viewportCenter >= slideTop && viewportCenter < slideBottom) {
                    currentSlideNumber = parseInt(slide.dataset.slide);
                    break;
                }
            }

            // Обновляем только если слайд изменился
            if (currentSlideNumber !== this.currentSlide) {
                this.currentSlide = currentSlideNumber;
                this.updateProgress();
                this.updateCounter();
            }
        };

        // Обработчик скролла с debounce для производительности
        presentation.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }

            // Немедленное обновление для отзывчивости
            updateCurrentSlide();

            // Дополнительная проверка после остановки скролла
            scrollTimeout = setTimeout(updateCurrentSlide, 100);
        }, { passive: true });
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
