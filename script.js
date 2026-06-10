/* ===== LOADER ===== */
const loaderMessages = [
  'Loading neural network...', 'Initializing ResNet34 encoder...',
  'Mounting U-Net decoder...', 'Calibrating SAR processor...',
  'System ready.'
];
let msgIdx = 0;
const loaderStatus = document.getElementById('loaderStatus');
const loaderInterval = setInterval(() => {
  msgIdx++;
  if (msgIdx < loaderMessages.length && loaderStatus) {
    loaderStatus.textContent = loaderMessages[msgIdx];
  }
}, 500);

window.addEventListener('load', () => {
  clearInterval(loaderInterval);
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.5s';
      setTimeout(() => loader.style.display = 'none', 500);
    }
    initAll();
  }, 100);
});

function initAll() {
  initParticles();
  initNavbar();
  initScrollAnimations();
  initCounters();
  initUpload();
  initPerformanceBars();
  // initGallery(); -> DIHAPUS karena elemen galeri sudah tidak ada di navbar & halaman
}

/* ===== PARTICLES ===== */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.5 + 0.1
  }));
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(10,74,82,${p.alpha})`;
      ctx.fill();
    });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(10,74,82,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ===== NAVBAR ===== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 2px 30px rgba(0,0,0,0.5)';
    } else {
      navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.35)';
    }
  });
  
  hamburger?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('open');
  });
  
  document.querySelectorAll('a[href^="#"], button[onclick*="scrollIntoView"]').forEach(el => {
    if (el.tagName === 'A') {
      el.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(el.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        mobileMenu?.classList.remove('open');
      });
    }
  });
}

/* ===== SCROLL ANIMATIONS ===== */
function initScrollAnimations() {
  const elements = document.querySelectorAll(
    '.about-card, .arch-info-card, .ds-card, .perf-card, .arch-step, .model-card'
  );
  elements.forEach(el => el.classList.add('fade-in'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(el => observer.observe(el));
}

/* ===== COUNTERS ===== */
function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target);
        const isDecimal = target % 1 !== 0;
        const duration = 1800;
        const start = performance.now();
        function update(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const val = target * eased;
          el.textContent = isDecimal ? val.toFixed(1) : Math.floor(val).toLocaleString();
          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
        }
        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

/* ===== PERFORMANCE BARS ===== */
function initPerformanceBars() {
  const bars = document.querySelectorAll('.perf-fill');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const width = el.style.width;
        el.style.width = '0%';
        setTimeout(() => { el.style.width = width; }, 200);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => observer.observe(b));
}

/* ===== UPLOAD AREA (DRAG & DROP FRONTEND PREVIEW) ===== */
function initUpload() {
  const uploadArea = document.getElementById('uploadArea');
  if (!uploadArea) return;
  uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });
  uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const input = document.getElementById("imageInput");
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      }
    }
  });
}

/* ===== ACTIVE NAV LINK SCOPE ===== */
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
});