// ================================
// VARIABLES GLOBALES
// ================================

// Carrusel de reviews
let reviewsCarousel, reviewsScrollbar, reviewsThumb;
let isReviewsDragging = false;
let reviewsStartX, reviewsStartScrollLeft;
let reviewsCurrentIndex = 0;


// Slider principal (cards sabor y calma)
let mainSlider, mainScrollbar, mainThumb;
let currentIndex = 0;
let isMainDragging = false;
let mainStartX, mainStartLeft;

// ================================
// UTILIDADES
// ================================
function isDesktop() {
  return window.matchMedia('(min-width: 768px)').matches;
}

// ================================
// CARGAR REVIEWS DESDE JSON
// ================================
async function loadReviews() {
  try {
    const response = await fetch("data/reviews.json");
    if (!response.ok) {
      console.error("Archivo reviews.json no encontrado");
      return;
    }

    const reviews = await response.json();
    const carouselElement = document.getElementById("reviewsCarousel");
    if (!carouselElement) return;

    carouselElement.innerHTML = "";

    reviews.forEach(r => {
      const stars = "★".repeat(r.puntuacion) + "☆".repeat(5 - r.puntuacion);

      const card = document.createElement("div");
      card.className = "review-card";
      card.innerHTML = `
        <span class="review-date">${r.fecha}</span>
        <p class="review-nombre">${r.nombre}</p>
        <p>"${r.comentario}"</p>
        <div class="review-stars">${stars}</div>
      `;

      carouselElement.appendChild(card);
    });

    setTimeout(() => {
      recalcReviewsThumb();   // ajusta barra en desktop
      updateReviewsMobile();  // recoloca el carrusel en móvil cuando ya hay .review-card
    }, 200);
  } catch (error) {
    console.error("Error cargando reviews:", error);
  }
}

// ================================
// REVIEWS: SLIDER MÓVIL + SCROLLBAR DESKTOP
// ================================

function initReviews() {
  reviewsCarousel  = document.getElementById("reviewsCarousel");
  reviewsScrollbar = document.querySelector(".reviews-scrollbar");
  reviewsThumb     = document.querySelector(".reviews-scrollbar .scrollbar-thumb");

  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');

  if (!reviewsCarousel || !reviewsScrollbar || !reviewsThumb) {
    console.error("No se encuentran elementos del carrusel de reviews");
    return;
  }

  // Botones móvil
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      if (!isDesktop()) moveReviewsSlide(reviewsCurrentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
      if (!isDesktop()) moveReviewsSlide(reviewsCurrentIndex + 1);
    });
  }

  setupReviewsEvents();
  recalcReviewsThumb();
  updateReviewsMobile();
}

// mover en móvil (1 card visible)
function updateReviewsMobile() {
  if (!reviewsCarousel) return;

  if (isDesktop()) {
    reviewsCarousel.style.transform = 'translateX(0)';
    return;
  }

  const cards = reviewsCarousel.querySelectorAll('.review-card');
  const total = cards.length;
  if (!total) return;

  const cardWidth = cards[0].getBoundingClientRect().width;
  const offset = -reviewsCurrentIndex * cardWidth;

  reviewsCarousel.style.transform = `translateX(${offset}px)`;
}


function moveReviewsSlide(index) {
  const cards = reviewsCarousel.querySelectorAll('.review-card');
  const total = cards.length;
  if (!total) return;

  if (index < 0) index = total - 1;
  if (index >= total) index = 0;

  reviewsCurrentIndex = index;
  updateReviewsMobile();
}

function initReviewsScrollbar() {
  // mantenemos esta función por compatibilidad con tu init actual
  initReviews();
}

function recalcReviewsThumb() {
  if (!reviewsCarousel || !reviewsScrollbar || !reviewsThumb) return;
  if (!isDesktop()) {
    reviewsThumb.style.display = "none";
    return;
  }

  const visibleWidth = reviewsCarousel.clientWidth;
  const totalWidth   = reviewsCarousel.scrollWidth;

  if (totalWidth <= visibleWidth) {
    reviewsThumb.style.display = "none";
    return;
  }

  reviewsThumb.style.display = "block";

  const trackWidth = reviewsScrollbar.clientWidth;
  const ratio      = visibleWidth / totalWidth;
  const thumbWidth = Math.max(40, trackWidth * ratio);

  reviewsThumb.style.width = thumbWidth + "px";
  updateReviewsThumbPosition();
}

function updateReviewsThumbPosition() {
  if (!reviewsCarousel || !reviewsScrollbar || !reviewsThumb) return;
  if (!isDesktop()) return;

  const trackWidth = reviewsScrollbar.clientWidth;
  const thumbWidth = reviewsThumb.clientWidth;
  const maxScroll  = reviewsCarousel.scrollWidth - reviewsCarousel.clientWidth;

  if (maxScroll <= 0) {
    reviewsThumb.style.transform = "translateX(0px)";
    return;
  }

  const maxThumbTravel = trackWidth - thumbWidth;
  const scrollRatio    = reviewsCarousel.scrollLeft / maxScroll;
  const thumbX         = maxThumbTravel * scrollRatio;

  reviewsThumb.style.transform = `translateX(${thumbX}px)`;
}

function setupReviewsEvents() {
  // Scroll desktop → mueve thumb
  reviewsCarousel.addEventListener("scroll", updateReviewsThumbPosition);

  // Drag del thumb (solo desktop)
  reviewsThumb.addEventListener("mousedown", startReviewsDrag);
  document.addEventListener("mousemove", doReviewsDrag);
  document.addEventListener("mouseup", endReviewsDrag);

  // Click en barra
  reviewsScrollbar.addEventListener("click", handleReviewsTrackClick);

  // Resize ventana
  window.addEventListener("resize", () => {
    recalcReviewsThumb();
    updateReviewsMobile();
  });
}

function startReviewsDrag(e) {
  if (!reviewsCarousel || !reviewsThumb || !isDesktop()) return;

  isReviewsDragging      = true;
  reviewsStartX          = e.clientX;
  reviewsStartScrollLeft = reviewsCarousel.scrollLeft;
  document.body.style.userSelect = "none";
  e.preventDefault();
}

function doReviewsDrag(e) {
  if (!isReviewsDragging || !reviewsCarousel || !reviewsScrollbar || !reviewsThumb || !isDesktop()) return;

  const trackWidth     = reviewsScrollbar.clientWidth;
  const thumbWidth     = reviewsThumb.clientWidth;
  const maxScroll      = reviewsCarousel.scrollWidth - reviewsCarousel.clientWidth;
  const maxThumbTravel = trackWidth - thumbWidth;

  if (maxThumbTravel <= 0) return;

  const deltaX      = e.clientX - reviewsStartX;
  const scrollRatio = maxScroll / maxThumbTravel;
  reviewsCarousel.scrollLeft = reviewsStartScrollLeft + deltaX * scrollRatio;
}

function endReviewsDrag() {
  isReviewsDragging = false;
  document.body.style.userSelect = "";
}

function handleReviewsTrackClick(e) {
  if (e.target === reviewsThumb || !reviewsCarousel || !reviewsScrollbar || !reviewsThumb || !isDesktop()) return;

  const rect       = reviewsScrollbar.getBoundingClientRect();
  const clickX     = e.clientX - rect.left;
  const trackWidth = reviewsScrollbar.clientWidth;
  const thumbWidth = reviewsThumb.clientWidth;
  const maxScroll  = reviewsCarousel.scrollWidth - reviewsCarousel.clientWidth;
  const maxThumbTravel = trackWidth - thumbWidth;

  if (maxThumbTravel <= 0) return;

  const thumbCenter = Math.min(Math.max(clickX - thumbWidth / 2, 0), maxThumbTravel);
  const scrollRatio = maxScroll / maxThumbTravel;
  reviewsCarousel.scrollLeft = thumbCenter * scrollRatio;
}


// ================================
// SLIDERS PRINCIPALES (MULTIINSTANCIA)
// ================================
function initAllMainSliders() {
  const wrappers = document.querySelectorAll('.js-slider');
  wrappers.forEach(initSliderInstance);
}

function initSliderInstance(wrapper) {
  const track     = wrapper.querySelector('.js-track');
  const scrollbar = wrapper.querySelector('.js-scrollbar');
  const thumb     = wrapper.querySelector('.js-thumb');
  const prevBtn   = wrapper.querySelector('.js-prev');
  const nextBtn   = wrapper.querySelector('.js-next');
  const cards     = Array.from(track.querySelectorAll('.card, .card-restaurante'));

  if (!track || !prevBtn || !nextBtn || !cards.length) return;

  let currentIndex = 0;
  let dragging     = false;
  let startX, startLeft;

  // -------- MÓVIL: 1 card + bucle infinito --------
  function updateMobileSlide() {
    if (isDesktop()) {
      track.style.transform = 'translateX(0)';
      return;
    }
    const offset = -currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;
  }

  function goToSlide(i) {
    const last = cards.length - 1;
    if (i < 0) i = last;
    else if (i > last) i = 0;
    currentIndex = i;
    updateMobileSlide();
  }

  prevBtn.addEventListener('click', () => {
    if (!isDesktop()) goToSlide(currentIndex - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (!isDesktop()) goToSlide(currentIndex + 1);
  });

  // -------- DESKTOP: barra scroll personalizada --------
  function updateThumb() {
    if (!isDesktop() || !scrollbar || !thumb) return;

    const scrollWidth = track.scrollWidth;
    const clientWidth = track.clientWidth;
    const scrollLeft  = track.scrollLeft;

    if (scrollWidth <= clientWidth) {
      thumb.style.width = '100%';
      thumb.style.left  = '0';
      return;
    }

    const visibleRatio = clientWidth / scrollWidth;
    const thumbWidth   = Math.max(visibleRatio * scrollbar.clientWidth, 40);
    thumb.style.width = thumbWidth + 'px';

    const maxThumbX   = scrollbar.clientWidth - thumbWidth;
    const scrollRatio = scrollLeft / (scrollWidth - clientWidth);
    thumb.style.left = maxThumbX * scrollRatio + 'px';
  }

  if (scrollbar && thumb) {
    track.addEventListener('scroll', updateThumb);

    thumb.addEventListener('mousedown', (e) => {
      if (!isDesktop()) return;
      dragging = true;
      startX   = e.clientX;
      startLeft = parseFloat(getComputedStyle(thumb).left) || 0;
      document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDesktop() || !dragging) return;

      const delta   = e.clientX - startX;
      const barW    = scrollbar.clientWidth;
      const thumbW  = thumb.clientWidth;
      const maxX    = barW - thumbW;

      let newLeft = startLeft + delta;
      newLeft = Math.max(0, Math.min(maxX, newLeft));
      thumb.style.left = newLeft + 'px';

      const ratio     = newLeft / maxX;
      const maxScroll = track.scrollWidth - track.clientWidth;
      track.scrollLeft = maxScroll * ratio;
    });

    window.addEventListener('mouseup', () => {
      dragging = false;
      document.body.style.userSelect = '';
    });
  }

  window.addEventListener('resize', () => {
    updateMobileSlide();
    updateThumb();
  });

  updateMobileSlide();
  updateThumb();
}

// ================================
// SLIDER GALERÍA MÓVIL (AUTOPLAY)
// ================================
function initGaleriaSlider() {
  const slider = document.querySelector(".galeria-slider-mobile");
  if (!slider) return;

  const slides = slider.querySelectorAll(".slide");
  if (!slides.length) return;

  let current = 0;
  const total = slides.length;
  const intervalo = 4000;

  function showSlide(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    current = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === current);
    });
  }

  function nextSlide() {
    showSlide(current + 1);
  }

  showSlide(0);
  setInterval(nextSlide, intervalo);
}

// ================================
// VIDEO MODAL
// ================================
function initVideoModal() {
  const trigger = document.querySelector('.video-trigger');
  const modal   = document.getElementById('videoModal');
  const closeBtn = document.querySelector('.video-close');
  const video    = document.getElementById('videoPopup');

  if (!trigger || !modal || !closeBtn || !video) return;

  trigger.addEventListener('click', () => {
    modal.style.display = 'flex';
    video.currentTime = 0;
    video.play();
  });

  closeBtn.addEventListener('click', () => {
    video.pause();
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      video.pause();
      modal.style.display = 'none';
    }
  });
}

// ================================
// MODAL OVERLAY
// ================================
function initModalOverlay() {
  function openModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(event) {
    const modalOverlay = document.getElementById('modalOverlay');
    if (!event || event.target === event.currentTarget) {
      if (modalOverlay) {
        modalOverlay.classList.remove('active');
      }
      document.body.style.overflow = '';
    }
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  window.openModal  = openModal;
  window.closeModal = closeModal;
}

// ================================
// MENÚ HAMBURGUESA
// ================================
function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu      = document.getElementById('menu');
  const closeBtn1 = document.querySelector('.menu-close');

  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      menu.classList.toggle('active');
    });
  }

  if (closeBtn1 && hamburger && menu) {
    closeBtn1.addEventListener('click', () => {
      hamburger.classList.remove('active');
      menu.classList.remove('active');
    });
  }
}

// ================================
// INICIALIZAR TODO
// ================================
document.addEventListener("DOMContentLoaded", function() {
  loadReviews();
  initReviewsScrollbar();

  initAllMainSliders();  
  initGaleriaSlider();
  initVideoModal();
  initModalOverlay();
  initHamburgerMenu();
});
