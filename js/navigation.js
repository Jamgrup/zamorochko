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
    // Detect current slide on load (in case of page reload with preserved scroll)
    this.detectCurrentSlideOnLoad();

    // Navigation buttons
    this.prevBtn.addEventListener('click', () => this.goToPrevSlide());
    this.nextBtn.addEventListener('click', () => this.goToNextSlide());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Scroll detection
    this.presentation.addEventListener('scroll', () => this.handleScroll());

    // Update UI
    this.updateUI();
  }

  detectCurrentSlideOnLoad() {
    // Detect which slide is visible on page load
    const viewportHeight = window.innerHeight;
    const scrollTop = this.presentation.scrollTop;
    const viewportCenter = scrollTop + (viewportHeight / 2);

    for (let i = 0; i < this.slides.length; i++) {
      const slide = this.slides[i];
      const slideTop = slide.offsetTop;
      const slideBottom = slideTop + slide.offsetHeight;

      if (viewportCenter >= slideTop && viewportCenter < slideBottom) {
        this.currentSlide = i;
        break;
      }
    }
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

  handleScroll() {
    // Detect which slide is currently in view based on viewport center
    const viewportHeight = window.innerHeight;
    const scrollTop = this.presentation.scrollTop;
    const viewportCenter = scrollTop + (viewportHeight / 2);

    // Find the slide that contains the viewport center
    let newSlide = this.currentSlide;

    for (let i = 0; i < this.slides.length; i++) {
      const slide = this.slides[i];
      const slideTop = slide.offsetTop;
      const slideBottom = slideTop + slide.offsetHeight;

      // If viewport center is within this slide
      if (viewportCenter >= slideTop && viewportCenter < slideBottom) {
        newSlide = i;
        break;
      }
    }

    // Update only if slide changed
    if (newSlide !== this.currentSlide) {
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
