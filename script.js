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
  initCharts();
  initUpload();
  initPerformanceBars();
  initGallery();
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
      ctx.fillStyle = `rgba(0,212,255,${p.alpha})`;
      ctx.fill();
    });
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - dist / 120)})`;
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
      navbar.style.background = 'rgba(2,11,24,0.97)';
    } else {
      navbar.style.background = 'rgba(2,11,24,0.85)';
    }
  });

  hamburger?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('open');
  });

  // Smooth scroll for all anchor links
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
    '.about-card, .arch-info-card, .ds-card, .gallery-item, .perf-card, .chart-card, .arch-step'
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
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => observer.observe(b));
}

/* ===== CHARTS ===== */
function initCharts() {
  drawAccuracyChart();
  drawLossChart();
}

function drawAccuracyChart() {
  const canvas = document.getElementById('accuracyChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const trainData = [61.2, 68.4, 74.8, 79.3, 83.5, 86.2, 88.7, 90.4, 92.1, 93.5, 94.2];
  const valData   = [59.8, 66.1, 72.4, 77.8, 82.1, 85.0, 87.6, 89.8, 91.4, 92.9, 93.8];
  drawLineChart(ctx, W, H, [trainData, valData], ['#00d4ff', '#00ff88'], ['Train', 'Val'], 55, 100);
}

function drawLossChart() {
  const canvas = document.getElementById('lossChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const trainLoss = [0.842, 0.712, 0.523, 0.401, 0.310, 0.241, 0.187, 0.148, 0.123, 0.103, 0.089];
  const valLoss   = [0.891, 0.754, 0.561, 0.432, 0.338, 0.268, 0.211, 0.169, 0.141, 0.118, 0.102];
  drawLineChart(ctx, W, H, [trainLoss, valLoss], ['#ff6b35', '#00d4ff'], ['Train', 'Val'], 0, 1);
}

function drawLineChart(ctx, W, H, datasets, colors, labels, yMin, yMax) {
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  ctx.clearRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = 'rgba(0,212,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (cH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke();
    const val = yMax - ((yMax - yMin) / 4) * i;
    ctx.fillStyle = 'rgba(139,163,184,0.6)';
    ctx.font = '9px Inter'; ctx.textAlign = 'right';
    ctx.fillText(val.toFixed(val < 2 ? 2 : 0), pad.left - 4, y + 3);
  }

  // Lines
  datasets.forEach((data, di) => {
    const pts = data.map((v, i) => ({
      x: pad.left + (cW / (data.length - 1)) * i,
      y: pad.top + cH - ((v - yMin) / (yMax - yMin)) * cH
    }));

    // Area fill
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pad.top + cH);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, pad.top + cH);
    ctx.closePath();
    ctx.fillStyle = colors[di].replace(')', ',0.08)').replace('rgb', 'rgba').replace('#', 'rgba(').replace('rgba(', 'rgba(');
    // Simple alpha fill
    const hex = colors[di];
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    ctx.fillStyle = `rgba(${r},${g},${b},0.08)`;
    ctx.fill();

    // Line
    ctx.beginPath();
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = colors[di];
    ctx.lineWidth = 2;
    ctx.shadowColor = colors[di];
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Dots
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = colors[di]; ctx.fill();
    });
  });

  // Legend
  labels.forEach((lbl, i) => {
    ctx.fillStyle = colors[i]; ctx.fillRect(pad.left + i * 70, H - 12, 12, 3);
    ctx.fillStyle = 'rgba(139,163,184,0.8)'; ctx.font = '9px Inter'; ctx.textAlign = 'left';
    ctx.fillText(lbl, pad.left + i * 70 + 16, H - 8);
  });
}

/* ===== UPLOAD & DETECTION ===== */
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
    if (file && file.type.startsWith('image/')) processFile(file);
  });
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const uploadArea = document.getElementById('uploadArea');
    const detectionResults = document.getElementById('detectionResults');
    const originalImg = document.getElementById('originalImg');
    if (uploadArea) uploadArea.style.display = 'none';
    if (detectionResults) detectionResults.style.display = 'flex';
    if (originalImg) originalImg.src = e.target.result;

    // Draw segmentation on 3 canvases with different overlay intensities
    const canvasIds = ['segCanvas1', 'segCanvas2', 'segCanvas3'];
    // Each model has slightly different overlay — simulating different results
    const overlays = [
      { cx: 0.40, cy: 0.55, r: 0.28, alpha: 0.55 }, // U-Net
      { cx: 0.42, cy: 0.53, r: 0.30, alpha: 0.62 }, // U-Net++
      { cx: 0.41, cy: 0.54, r: 0.31, alpha: 0.68 }, // DeepLabV3+
    ];

    canvasIds.forEach((id, i) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.getElementById(id);
        if (!canvas) return;
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        // Grayscale tint
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let j = 0; j < data.length; j += 4) {
          const avg = (data[j] + data[j+1] + data[j+2]) / 3;
          data[j] = avg * 0.5; data[j+1] = avg * 0.7; data[j+2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);
        // Oil spill overlay
        const ov = overlays[i];
        const cx = canvas.width * ov.cx, cy = canvas.height * ov.cy;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * ov.r);
        grad.addColorStop(0, `rgba(255,50,0,${ov.alpha})`);
        grad.addColorStop(0.5, `rgba(255,100,0,${ov.alpha * 0.55})`);
        grad.addColorStop(1, 'rgba(255,150,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };
      img.src = e.target.result;
    });
  };
  reader.readAsDataURL(file);
}

function runAnalysis() {
  const btn = document.getElementById('analyzeBtn');
  if (btn) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menganalisis 3 Model...';
    btn.disabled = true;
  }
  const ious = [
    { id: 'iou1', val: (0.821 + Math.random() * 0.02).toFixed(3) },
    { id: 'iou2', val: (0.848 + Math.random() * 0.02).toFixed(3) },
    { id: 'iou3', val: (0.864 + Math.random() * 0.02).toFixed(3) },
  ];
  setTimeout(() => {
    ious.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) el.textContent = item.val;
    });
    if (btn) {
      btn.innerHTML = '<i class="fas fa-check"></i> Analisis Selesai';
      btn.style.background = 'linear-gradient(135deg, #00aa55, #00ff88)';
    }
  }, 2200);
}

/* ===== GALLERY HOVER ===== */
function initGallery() {
  // Gallery items already use CSS hover for before/after toggle
  // Add tooltip on hover
  document.querySelectorAll('.gallery-item').forEach(item => {
    const label = item.dataset.label;
    item.title = label || '';
  });
}

/* ===== ACTIVE NAV LINK ===== */
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === '#' + current ? '#00d4ff' : '';
  });
});
