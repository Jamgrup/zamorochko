/**
 * Navigation and slide management
 */

class PresentationNavigation {
  constructor() {
    this.presentation = document.getElementById('presentation');
    this.slides = document.querySelectorAll('.slide');
    this.currentSlide = 0;
    this.totalSlides = this.slides.length;

    // Navigation elements
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.counter = document.getElementById('counter');
    this.progressBar = document.getElementById('progressBar');

    this.init();
  }

  init() {
    // Navigation buttons
    this.prevBtn.addEventListener('click', () => this.goToPrevSlide());
    this.nextBtn.addEventListener('click', () => this.goToNextSlide());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Touch gestures for mobile
    this.initTouchGestures();

    // Scroll detection
    this.presentation.addEventListener('scroll', () => this.handleScroll());

    // Update UI
    this.updateUI();
  }

  goToSlide(index) {
    if (index < 0 || index >= this.totalSlides) return;

    this.currentSlide = index;
    const slideElement = this.slides[index];
    slideElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.updateUI();
  }

  goToNextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.goToSlide(this.currentSlide + 1);
    }
  }

  goToPrevSlide() {
    if (this.currentSlide > 0) {
      this.goToSlide(this.currentSlide - 1);
    }
  }

  handleKeyboard(e) {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        this.goToPrevSlide();
        break;
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ': // Spacebar
        e.preventDefault();
        this.goToNextSlide();
        break;
      case 'Home':
        e.preventDefault();
        this.goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        this.goToSlide(this.totalSlides - 1);
        break;
    }
  }

  initTouchGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    this.presentation.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    this.presentation.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
    }, { passive: true });
  }

  handleSwipe(startX, startY, endX, endY) {
    const swipeThreshold = 50;
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // Vertical swipe (primary for presentation)
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > swipeThreshold) {
      if (deltaY < 0) {
        // Swipe up - next slide
        this.goToNextSlide();
      } else {
        // Swipe down - previous slide
        this.goToPrevSlide();
      }
    }

    // Horizontal swipe (alternative)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
      if (deltaX < 0) {
        // Swipe left - next slide
        this.goToNextSlide();
      } else {
        // Swipe right - previous slide
        this.goToPrevSlide();
      }
    }
  }

  handleScroll() {
    // Detect which slide is currently in view
    const scrollPosition = this.presentation.scrollTop;
    const slideHeight = window.innerHeight;
    const newSlide = Math.round(scrollPosition / slideHeight);

    if (newSlide !== this.currentSlide && newSlide >= 0 && newSlide < this.totalSlides) {
      this.currentSlide = newSlide;
      this.updateUI();
    }
  }

  updateUI() {
    // Update counter
    this.counter.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;

    // Update progress bar
    const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
    this.progressBar.style.width = `${progress}%`;

    // Update button states
    this.prevBtn.disabled = this.currentSlide === 0;
    this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;

    // Update active slide (for analytics, etc.)
    this.slides.forEach((slide, index) => {
      if (index === this.currentSlide) {
        slide.setAttribute('data-active', 'true');
      } else {
        slide.removeAttribute('data-active');
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PresentationNavigation();
});
