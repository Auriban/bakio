// ================================
// CARGAR REVIEWS DESDE JSON
// ================================
async function loadReviews() {
    try {
        const response = await fetch("data/reviews.json");
        const reviews = await response.json();

        const carousel = document.getElementById("reviewsCarousel");
        if (!carousel) return;

        carousel.innerHTML = "";

        reviews.forEach(r => {
            const stars = "★".repeat(r.puntuacion) + "☆".repeat(5 - r.puntuacion);

            const card = document.createElement("div");
            card.className = "review-card";
            card.innerHTML = `
                <span class="review-date">${r.fecha}</span>
                <p class ="review-nombre">${r.nombre}</p>
                <p>"${r.comentario}"</p>
                <div class="review-stars">${stars}</div>
            `;

            carousel.appendChild(card);
        });

        // Recalcular scrollbar después de cargar
        setTimeout(() => {
            recalcThumb();
        }, 200);

    } catch (error) {
        console.error("Error cargando reviews:", error);
    }
}

// ================================
// SCROLLBAR PERSONALIZADA
// ================================
let carousel, scrollbar, thumb;
let isDragging = false;
let startX, startScrollLeft;

function initScrollbar() {
    carousel = document.getElementById("reviewsCarousel");
    scrollbar = document.querySelector(".reviews-scrollbar");
    thumb = document.querySelector(".scrollbar-thumb");

    if (!carousel || !scrollbar || !thumb) {
        console.error("No se encuentran elementos del carrusel");
        return false;
    }

    setupEvents();
    recalcThumb();
    return true;
}

function recalcThumb() {
    if (!carousel || !scrollbar || !thumb) return;

    const visibleWidth = carousel.clientWidth;
    const totalWidth = carousel.scrollWidth;
    
    if (totalWidth <= visibleWidth) {
        thumb.style.display = "none";
        return;
    }
    
    thumb.style.display = "block";
    
    const trackWidth = scrollbar.clientWidth;
    const ratio = visibleWidth / totalWidth;
    const thumbWidth = Math.max(40, trackWidth * ratio);
    
    thumb.style.width = thumbWidth + "px";
    updateThumbPosition();
}

function updateThumbPosition() {
    if (!carousel || !scrollbar || !thumb) return;
    
    const trackWidth = scrollbar.clientWidth;
    const thumbWidth = thumb.clientWidth;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    
    if (maxScroll <= 0) {
        thumb.style.transform = "translateX(0px)";
        return;
    }
    
    const maxThumbTravel = trackWidth - thumbWidth;
    const scrollRatio = carousel.scrollLeft / maxScroll;
    const thumbX = maxThumbTravel * scrollRatio;
    
    thumb.style.transform = `translateX(${thumbX}px)`;
}

function setupEvents() {
    // Scroll del carrusel → mueve thumb
    carousel.addEventListener("scroll", updateThumbPosition);

    // Drag del thumb
    thumb.addEventListener("mousedown", startDrag);
    
    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", endDrag);

    // Click en barra
    scrollbar.addEventListener("click", handleTrackClick);

    // Resize ventana
    window.addEventListener("resize", recalcThumb);
}

function startDrag(e) {
    isDragging = true;
    startX = e.clientX;
    startScrollLeft = carousel.scrollLeft;
    document.body.style.userSelect = "none";
    e.preventDefault();
}

function doDrag(e) {
    if (!isDragging) return;
    
    const trackWidth = scrollbar.clientWidth;
    const thumbWidth = thumb.clientWidth;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const maxThumbTravel = trackWidth - thumbWidth;
    
    if (maxThumbTravel <= 0) return;
    
    const deltaX = e.clientX - startX;
    const scrollRatio = maxScroll / maxThumbTravel;
    carousel.scrollLeft = startScrollLeft + deltaX * scrollRatio;
}

function endDrag() {
    isDragging = false;
    document.body.style.userSelect = "";
}

function handleTrackClick(e) {
    if (e.target === thumb) return;
    
    const rect = scrollbar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const trackWidth = scrollbar.clientWidth;
    const thumbWidth = thumb.clientWidth;
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const maxThumbTravel = trackWidth - thumbWidth;
    
    if (maxThumbTravel <= 0) return;
    
    const thumbCenter = Math.min(Math.max(clickX - thumbWidth / 2, 0), maxThumbTravel);
    const scrollRatio = maxScroll / maxThumbTravel;
    carousel.scrollLeft = thumbCenter * scrollRatio;
}

// Exponer funciones para loadReviews
window.recalcThumb = recalcThumb;

// ================================
// INICIALIZAR TODO
// ================================
document.addEventListener("DOMContentLoaded", function() {
    loadReviews();
    initScrollbar();
});

document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".galeria-slider-mobile");
  if (!slider) return;

  const slides = slider.querySelectorAll(".slide");
  if (!slides.length) return;

  let current = 0;
  const total = slides.length;
  const intervalo = 4000; // 4s

  function showSlide(index) {
    // normalizamos el índice por si acaso
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

  // Iniciar siempre con la primera visible
  showSlide(0);

  // Auto-play
  setInterval(nextSlide, intervalo);
});


const trigger = document.querySelector('.video-trigger');
const modal = document.getElementById('videoModal');
const closeBtn = document.querySelector('.video-close');
const video = document.getElementById('videoPopup');

trigger.addEventListener('click', () => {
  modal.style.display = 'flex';   // muestra el modal
  video.currentTime = 0;          // empieza desde el inicio (opcional)
  video.play();                   // reproduce al abrir
});

closeBtn.addEventListener('click', () => {
  video.pause();                  // pausa al cerrar
  modal.style.display = 'none';
});

modal.addEventListener('click', (e) => {
  // cerrar si se hace clic fuera del contenido
  if (e.target === modal) {
    video.pause();
    modal.style.display = 'none';
  }
});




function openModal() {
      document.getElementById('modalOverlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(event) {
      if (!event || event.target === event.currentTarget) {
        document.getElementById('modalOverlay').classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeModal();
      }
    });