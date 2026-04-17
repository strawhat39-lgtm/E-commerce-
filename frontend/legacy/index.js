/* ============================================================
   WASTE TO WEALTH — INTERACTIVE ENGINE
   Particle effects, counters, sliders, reveal animations
   ============================================================ */

// ---- DATA ----
const CREATORS = [
  { name: "Maria Chen", initials: "MC", specialty: "Furniture Artisan", rating: 4.9, transforms: 142, price: "$25", gradient: "linear-gradient(135deg, #39FF14, #BF5AF2)", category: "furniture" },
  { name: "Jake Ross", initials: "JR", specialty: "Textile Upcycler", rating: 4.8, transforms: 98, price: "$18", gradient: "linear-gradient(135deg, #BF5AF2, #00F0FF)", category: "textiles" },
  { name: "Aisha Lopez", initials: "AL", specialty: "E-Waste Sculptor", rating: 5.0, transforms: 67, price: "$40", gradient: "linear-gradient(135deg, #FFD700, #39FF14)", category: "art" },
  { name: "Tomás Rivera", initials: "TR", specialty: "Jewelry Maker", rating: 4.7, transforms: 210, price: "$30", gradient: "linear-gradient(135deg, #FFD700, #BF5AF2)", category: "jewelry" },
  { name: "Priya Patel", initials: "PP", specialty: "Home Decor Designer", rating: 4.9, transforms: 185, price: "$22", gradient: "linear-gradient(135deg, #39FF14, #00F0FF)", category: "furniture" },
  { name: "Leo Kim", initials: "LK", specialty: "Circuit Art Creator", rating: 4.6, transforms: 53, price: "$35", gradient: "linear-gradient(135deg, #00F0FF, #BF5AF2)", category: "electronics" },
];

// ---- PARTICLE SYSTEM ----
class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -1000, y: -1000 };
    this.resize();
    this.init();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    const count = Math.floor((this.canvas.width * this.canvas.height) / 18000);
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        color: Math.random() > 0.6 ? '#39FF14' : (Math.random() > 0.5 ? '#BF5AF2' : '#00F0FF'),
        alpha: Math.random() * 0.4 + 0.1,
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Mouse repel
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        p.x += (dx / dist) * force * 2;
        p.y += (dy / dist) * force * 2;
      }

      // Draw
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fill();
    }

    // Draw connections
    this.ctx.globalAlpha = 1;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = a.color;
          this.ctx.globalAlpha = (1 - dist / 100) * 0.08;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }

    this.ctx.globalAlpha = 1;
    requestAnimationFrame(() => this.animate());
  }
}

// ---- TRANSFORMATION PARTICLE BURST ----
function createParticleBurst(container) {
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 6 + 2;
    const angle = (Math.PI * 2 * i) / 20;
    const distance = Math.random() * 60 + 30;
    const color = Math.random() > 0.5 ? '#39FF14' : '#BF5AF2';

    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
      top: 50%;
      left: 50%;
      pointer-events: none;
      z-index: 100;
    `;

    container.appendChild(particle);

    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    particle.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
    ], {
      duration: 800 + Math.random() * 400,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'forwards',
    });

    setTimeout(() => particle.remove(), 1500);
  }
}

// ---- NAV SCROLL EFFECT ----
function initNavScroll() {
  const nav = document.getElementById('main-nav');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('nav--scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ---- COUNTER ANIMATION ----
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * eased);

    if (target >= 1000000) {
      element.textContent = '$' + (current / 1000000).toFixed(1) + 'M';
    } else if (target >= 1000) {
      element.textContent = current.toLocaleString();
    } else {
      element.textContent = current.toString();
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ---- SCROLL REVEAL ----
function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');

        // Trigger counters
        const counters = entry.target.querySelectorAll('[data-count]');
        counters.forEach((counter) => {
          const target = parseInt(counter.dataset.count);
          animateCounter(counter, target);
        });

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '-50px',
  });

  elements.forEach((el) => observer.observe(el));
}

// ---- BEFORE/AFTER SLIDER ----
function initSliders() {
  const sliders = document.querySelectorAll('[data-slider]');

  sliders.forEach((slider) => {
    const handle = slider.querySelector('.transform-card__handle');
    const beforeLayer = slider.querySelector('.transform-card__before');
    let isDragging = false;

    function updateSlider(x) {
      const rect = slider.getBoundingClientRect();
      let position = (x - rect.left) / rect.width;
      position = Math.max(0.05, Math.min(0.95, position));
      beforeLayer.style.clipPath = `inset(0 ${(1 - position) * 100}% 0 0)`;
      handle.style.left = `${position * 100}%`;
    }

    handle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    handle.addEventListener('touchstart', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) updateSlider(e.clientX);
    });

    window.addEventListener('touchmove', (e) => {
      if (isDragging) updateSlider(e.touches[0].clientX);
    });

    window.addEventListener('mouseup', () => { isDragging = false; });
    window.addEventListener('touchend', () => { isDragging = false; });

    // Hover auto-slide
    slider.addEventListener('mouseenter', () => {
      if (!isDragging) {
        beforeLayer.style.transition = 'clip-path 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        handle.style.transition = 'left 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        beforeLayer.style.clipPath = 'inset(0 30% 0 0)';
        handle.style.left = '70%';
      }
    });

    slider.addEventListener('mouseleave', () => {
      if (!isDragging) {
        beforeLayer.style.clipPath = 'inset(0 50% 0 0)';
        handle.style.left = '50%';
        setTimeout(() => {
          beforeLayer.style.transition = '';
          handle.style.transition = '';
        }, 600);
      }
    });
  });
}

// ---- CREATOR CARDS ----
function renderCreators(filter = 'all') {
  const grid = document.getElementById('creators-grid');
  if (!grid) return;

  const filtered = filter === 'all' ? CREATORS : CREATORS.filter(c => c.category === filter);
  grid.innerHTML = '';

  filtered.forEach((creator, idx) => {
    const card = document.createElement('div');
    card.className = 'creator-card';
    card.setAttribute('data-reveal', '');
    card.style.transitionDelay = `${idx * 0.1}s`;

    const stars = '★'.repeat(Math.floor(creator.rating)) + (creator.rating % 1 ? '☆' : '');

    card.innerHTML = `
      <div class="creator-card__header">
        <div class="creator-card__avatar" style="background: ${creator.gradient};">${creator.initials}</div>
        <div>
          <div class="creator-card__name">${creator.name}</div>
          <div class="creator-card__specialty">${creator.specialty}</div>
        </div>
      </div>
      <div class="creator-card__rating">
        <span class="creator-card__stars">${stars}</span>
        <span class="creator-card__rating-value">${creator.rating}</span>
      </div>
      <div class="creator-card__stats">
        <div>
          <span class="creator-card__stat-label">TRANSFORMS</span>
          <span class="creator-card__stat-value">${creator.transforms}</span>
        </div>
        <div>
          <span class="creator-card__stat-label">FROM</span>
          <span class="creator-card__stat-value" style="color: var(--green);">${creator.price}</span>
        </div>
      </div>
      <button class="creator-card__connect">CONNECT</button>
    `;

    grid.appendChild(card);

    // Trigger reveal after a tick
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.classList.add('revealed');
      });
    });
  });
}

// ---- FILTER CHIPS ----
function initFilters() {
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('filter-chip--active'));
      chip.classList.add('filter-chip--active');
      renderCreators(chip.dataset.filter);
    });
  });
}

// ---- VALUE GAUGE ANIMATION ----
function initGauge() {
  const gaugeFill = document.getElementById('gauge-fill');
  const gaugeMarker = document.getElementById('gauge-marker');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          gaugeFill.style.width = '100%';
          gaugeMarker.style.left = '100%';
        }, 500);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  if (gaugeFill) observer.observe(gaugeFill.closest('.estimation__gauge'));

  // Suggestion card clicks
  const suggestions = document.querySelectorAll('.suggestion-card');
  const gaugeValue = document.getElementById('gauge-value');
  const gaugeEndLabel = document.querySelector('.gauge__label--end');

  suggestions.forEach((card) => {
    card.addEventListener('click', () => {
      suggestions.forEach(c => c.classList.remove('suggestion-card--active'));
      card.classList.add('suggestion-card--active');

      const value = card.dataset.value;
      if (gaugeValue) gaugeValue.textContent = `$${value}`;
      if (gaugeEndLabel) gaugeEndLabel.textContent = `$${value} WEALTH`;

      // Burst particles
      const arrow = document.querySelector('.hero__morph-arrow');
      if (arrow) createParticleBurst(arrow);
    });
  });
}

// ---- UPLOAD MODAL LOGIC ----
function initUploadModal() {
  const zone = document.getElementById('upload-zone');
  const input = document.getElementById('upload-input');

  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.style.borderColor = '#39FF14';
    zone.style.background = 'rgba(57, 255, 20, 0.08)';
  });

  zone.addEventListener('dragleave', () => {
    zone.style.borderColor = '';
    zone.style.background = '';
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.style.borderColor = '';
    zone.style.background = '';
    handleFileUpload(e.dataTransfer.files[0]);
  });

  input.addEventListener('change', () => {
    if (input.files[0]) handleFileUpload(input.files[0]);
  });
}

function handleFileUpload(file) {
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('estimation-img');
    if (img) img.src = e.target.result;

    // Close modal & scroll to estimation
    document.getElementById('upload-modal')?.classList.remove('active');
    setTimeout(() => {
      document.getElementById('estimation')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };
  reader.readAsDataURL(file);
}

// ---- HERO PARTICLE BURST ON INTERVAL ----
function initHeroParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  setInterval(() => {
    createParticleBurst(container);
  }, 4000);

  // Initial burst
  setTimeout(() => createParticleBurst(container), 1500);
}

// ---- TRANSFORM BUTTON EFFECT ----
function initTransformButton() {
  const btn = document.getElementById('start-transform-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    btn.textContent = 'MATCHING WITH CREATOR...';
    btn.style.background = 'linear-gradient(90deg, #39FF14, #BF5AF2)';

    setTimeout(() => {
      btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        CREATOR MATCHED — MARIA CHEN
      `;
      btn.style.background = '#39FF14';
    }, 2000);
  });
}

// ---- SMOOTH SCROLL FOR NAV LINKS ----
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  // Particle background
  new ParticleSystem('particle-canvas');

  // Core features
  initNavScroll();
  initScrollReveal();
  initSliders();
  initFilters();
  initGauge();
  initUploadModal();
  initHeroParticles();
  initTransformButton();
  initSmoothScroll();

  // Render creator cards
  renderCreators();
});
