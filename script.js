// ============================================================
// 0. DETECCIÓN DE CAPACIDADES
// Todo lo nuevo (GSAP, ScrollTrigger, SplitType) es progresivo:
// si un CDN no carga, el sitio sigue funcionando con las
// transiciones CSS que ya traía de fábrica. El scroll de la
// página es siempre el nativo del navegador: no se usa ninguna
// librería de scroll suave, así que la rueda del ratón responde
// exactamente igual que en cualquier otra página.
// ============================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined';
const hasScrollTrigger = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
const hasSplitType = typeof window.SplitType !== 'undefined';

document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

if (hasGSAP && hasScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0);
}

// ============================================================
// NAVEGACIÓN — fondo al hacer scroll + menú móvil
// Los enlaces del menú (href="#...") usan el salto nativo del
// navegador; "scroll-behavior: smooth" en <html> (styles.css) ya
// se encarga de que ese salto sea suave, y "scroll-margin-top"
// en cada <section> evita que el nav fijo tape el destino.
// ============================================================
const nav = document.getElementById('nav');
let navScrolled = false;
window.addEventListener('scroll', () => {
  const shouldBeScrolled = window.scrollY > 40;
  if (shouldBeScrolled !== navScrolled) {
    navScrolled = shouldBeScrolled;
    nav.classList.toggle('scrolled', navScrolled);
  }
}, { passive: true });

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// Resalta el enlace de la sección visible (microinteracción sutil,
// solo cuando hay soporte para ScrollTrigger; si no, se omite sin
// afectar el resto de la navegación).
if (hasScrollTrigger) {
  const navAnchors = Array.from(navLinks.querySelectorAll('a[href^="#"]'));
  navAnchors.forEach((a) => {
    const section = document.querySelector(a.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (self.isActive) {
          navAnchors.forEach(x => x.classList.remove('active-link'));
          a.classList.add('active-link');
        }
      }
    });
  });
}

// ============================================================
// REVELADO AL HACER SCROLL
// Con GSAP + ScrollTrigger disponibles, cada .reveal (y sus hijos
// más representativos) entra una sola vez con un fundido + leve
// desplazamiento, escalonado por elemento. Sin GSAP, se conserva
// el IntersectionObserver original como respaldo.
// ============================================================
const revealEls = document.querySelectorAll('.reveal');

if (hasScrollTrigger) {
  const DUR = prefersReducedMotion ? 0.01 : 0.8;
  const Y = prefersReducedMotion ? 0 : 28;

  revealEls.forEach((el) => {
    // Grupos con hijos "tarjeta" reciben un stagger propio;
    // el resto se anima como bloque único.
    const groupMap = [
      ['.trait-list', '.trait'],
      ['.species-grid', '.species-card'],
      ['.fact-grid', '.fact-card'],
      ['.gallery-grid', '.gallery-item'],
      ['.sources-list', '.source-item'],
      ['.timeline', '.tl-item']
    ];
    const match = groupMap.find(([parentSel]) => el.matches(parentSel));

    if (match) {
      const children = el.querySelectorAll(match[1]);
      gsap.set(children, { opacity: 0, y: Y });
      gsap.set(el, { opacity: 1, y: 0 }); // el contenedor no anima, solo sus hijos
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(children, {
            opacity: 1,
            y: 0,
            duration: DUR,
            ease: 'power2.out',
            stagger: prefersReducedMotion ? 0 : 0.08,
            clearProps: 'willChange'
          });
        }
      });
    } else {
      gsap.set(el, { opacity: 0, y: Y });
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(el, { opacity: 1, y: 0, duration: DUR, ease: 'power2.out', clearProps: 'willChange' });
        }
      });
    }
  });
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
}

// ============================================================
// TÍTULOS — SplitType + GSAP
// Cada <h2> se separa en líneas/palabras y se revela como una
// cortina que sube, una sola vez, al entrar en pantalla.
// ============================================================
if (hasSplitType && hasScrollTrigger && !prefersReducedMotion) {
  document.querySelectorAll('main h2').forEach((h2) => {
    const split = new SplitType(h2, { types: 'lines, words' });
    h2.classList.add('split-ready');
    gsap.set(split.words, { yPercent: 115, opacity: 0 });
    ScrollTrigger.create({
      trigger: h2,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(split.words, {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.04
        });
      }
    });
  });
}

// ============================================================
// HERO — secuencia de entrada orquestada
// SplitType parte el título en caracteres; GSAP encadena eyebrow,
// título, subtítulo, etiquetas y pista de scroll en una única
// timeline que corre una vez al cargar la página.
// ============================================================
if (hasGSAP && !prefersReducedMotion) {
  const heroTitle = document.querySelector('h1.hero-title');
  const eyebrow = document.querySelector('.eyebrow');
  const heroSub = document.querySelector('.hero-sub');
  const heroMeta = document.querySelector('.hero-meta');
  const scrollCue = document.querySelector('.scroll-cue');
  const tags = document.querySelectorAll('.hero-meta .tag');

  const tl = gsap.timeline({ delay: 0.15 });

  if (hasSplitType && heroTitle) {
    const titleSplit = new SplitType(heroTitle, { types: 'chars' });
    gsap.set(titleSplit.chars, { yPercent: 100, opacity: 0, rotate: 4 });
    tl.set(heroTitle, { opacity: 1 })
      .to(titleSplit.chars, {
        yPercent: 0, opacity: 1, rotate: 0,
        duration: 0.9, ease: 'power3.out', stagger: 0.022
      }, 0.35);
  } else if (heroTitle) {
    tl.to(heroTitle, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.35);
  }

  if (eyebrow) {
    gsap.set(eyebrow, { opacity: 0, y: 14 });
    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.1);
  }
  if (heroSub) {
    gsap.set(heroSub, { opacity: 0, y: 18 });
    tl.to(heroSub, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.75);
  }
  if (heroMeta) {
    gsap.set(heroMeta, { opacity: 1 });
    gsap.set(tags, { opacity: 0, y: 12 });
    tl.to(tags, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.08 }, 0.95);
  }
  if (scrollCue) {
    gsap.set(scrollCue, { opacity: 0 });
    tl.to(scrollCue, { opacity: 1, duration: 0.6, ease: 'power1.out' }, 1.3);
  }
}

// ============================================================
// CONTADORES ANIMADOS — estadísticas de la sección "Qué es"
// Lee el número dentro del texto (">15 m", "~95 Ma", "2") y lo
// cuenta desde 0 una sola vez al entrar en pantalla, conservando
// el prefijo/sufijo original.
// ============================================================
document.querySelectorAll('.stat b').forEach((el) => {
  const raw = el.textContent.trim();
  const parsed = raw.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!parsed) return;
  const [, prefix, numStr, suffix] = parsed;
  const target = parseFloat(numStr);
  const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;

  const render = (val) => `${prefix}${val.toFixed(decimals)}${suffix}`;

  if (prefersReducedMotion || !hasGSAP) {
    el.textContent = render(target);
    return;
  }

  if (hasScrollTrigger) {
    const counter = { val: 0 };
    el.textContent = render(0);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          val: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = render(counter.val); }
        });
      }
    });
  } else {
    el.textContent = render(target);
  }
});

// ============================================================
// LÍNEA DE TIEMPO — progreso dibujado a medida que se hace scroll
// Se añade un pequeño elemento decorativo (no cambia el contenido
// ni la estructura visible) que crece en sincronía con el avance
// por la sección "Descubrimiento".
// ============================================================
if (hasScrollTrigger && !prefersReducedMotion) {
  const timelineEl = document.querySelector('.timeline');
  if (timelineEl) {
    const progress = document.createElement('div');
    progress.className = 'tl-progress';
    progress.setAttribute('aria-hidden', 'true');
    timelineEl.appendChild(progress);
    gsap.set(progress, { scaleY: 0, height: '100%' });
    ScrollTrigger.create({
      trigger: timelineEl,
      start: 'top 75%',
      end: 'bottom 60%',
      scrub: 0.6,
      animation: gsap.to(progress, { scaleY: 1, ease: 'none' })
    });
  }
}

// ============================================================
// MICROINTERACCIONES — tarjetas con leve inclinación 3D al pasar
// el cursor. Sutil, rápido y desactivado con reduced-motion o en
// dispositivos táctiles (sin puntero fino). "will-change" se activa
// solo mientras el mouse está encima de la tarjeta y se libera al
// salir, para no obligar al navegador a mantener capas GPU de más
// (esto es lo que hacía sentir pesado el scroll).
// ============================================================
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (hasGSAP && !prefersReducedMotion && supportsHover) {
  const tiltTargets = document.querySelectorAll('.species-card, .fact-card, .trait');

  tiltTargets.forEach((card) => {
    const quickX = gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power3.out' });
    const quickY = gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power3.out' });
    card.style.transformPerspective = '700px';
    card.style.transformStyle = 'preserve-3d';

    card.addEventListener('mouseenter', () => { card.style.willChange = 'transform'; });
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      quickX(px * 6);
      quickY(py * -6);
    });
    card.addEventListener('mouseleave', () => {
      quickX(0);
      quickY(0);
      card.style.willChange = 'auto';
    });
  });

  // Botones "magnéticos": el reproductor y el cierre del lightbox
  // siguen levemente el cursor dentro de su propia área.
  const magneticTargets = document.querySelectorAll('.player-toggle, .lightbox-close');
  magneticTargets.forEach((btn) => {
    const moveX = gsap.quickTo(btn, 'x', { duration: 0.35, ease: 'power3.out' });
    const moveY = gsap.quickTo(btn, 'y', { duration: 0.35, ease: 'power3.out' });
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      moveX(relX * 0.25);
      moveY(relY * 0.25);
    });
    btn.addEventListener('mouseleave', () => {
      moveX(0);
      moveY(0);
    });
  });
}

// ============================================================
// IMAGEN DE FONDO DEL HERO (portada)
// Ruta esperada: images/hero/spinosaurus-hero.jpg
// Si no existe, se queda visible el marcador con la cresta animada.
// ============================================================
const heroSection = document.getElementById('heroSection');
const heroImg = document.getElementById('heroImg');
const heroFallback = document.getElementById('heroFallback');

heroImg.onload = () => {
  heroImg.classList.add('loaded');
  heroFallback.classList.add('hidden');
};
heroImg.onerror = () => {
  heroImg.classList.remove('loaded');
  heroFallback.classList.remove('hidden');
};
heroImg.src = heroSection.getAttribute('data-src');

// ============================================================
// CARGA DE IMÁGENES (galería, figuras, especies y comparación)
// CON RESPALDO. Cualquier casilla .gallery-item[data-src] usa este
// mismo mecanismo, incluyendo las miniaturas de cada especie y las
// imágenes de la comparación Spinosaurus / T-Rex.
// ============================================================
document.querySelectorAll('.gallery-item[data-src]').forEach(item => {
  const src = item.getAttribute('data-src');
  const img = item.querySelector('img');
  img.onload = () => {
    img.classList.add('loaded');
    item.classList.add('has-image');
  };
  img.onerror = () => {
    item.classList.remove('has-image');
  };
  img.src = src;
});

// ============================================================
// LIGHTBOX — clic en cualquier imagen para verla en grande
// Solo se activa si la imagen realmente cargó (has-image).
// ============================================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
let lastFocusedBeforeLightbox = null;

function openLightbox(item){
  const src = item.getAttribute('data-src');
  const img = item.querySelector('img');
  const captionEl = item.querySelector('.gallery-caption');
  const fig = item.closest('.figure-frame');
  const figCaption = fig ? fig.querySelector('.figure-caption') : null;
  const speciesName = item.closest('.species-card') ? item.closest('.species-card').querySelector('h3') : null;

  lightboxImg.src = src;
  lightboxImg.alt = img.alt || '';
  lightboxCaption.textContent =
    (captionEl && captionEl.textContent.trim()) ||
    (speciesName && speciesName.textContent.trim()) ||
    (figCaption && figCaption.textContent.trim()) ||
    img.alt || '';

  lastFocusedBeforeLightbox = document.activeElement;
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  lightboxClose.focus();
}

function closeLightbox(){
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  lightboxImg.src = '';
  if (lastFocusedBeforeLightbox && typeof lastFocusedBeforeLightbox.focus === 'function') {
    lastFocusedBeforeLightbox.focus();
  }
}

document.querySelectorAll('.lightbox-item').forEach(item => {
  item.addEventListener('click', () => {
    if (item.classList.contains('has-image')) openLightbox(item);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
});

// ============================================================
// COMPARACIÓN: SPINOSAURUS VS. T-REX
// Al elegir el T-Rex, todo el sitio cambia de tema (clase
// .theme-trex en <body>, remapea las variables de color en CSS,
// y la tormenta de fondo se reemplaza por brasas de lava).
// Al volver a Spinosaurus, el tema regresa al azul original.
// ============================================================
const btnSpino = document.getElementById('btnSpino');
const btnTrex = document.getElementById('btnTrex');
const dataSpino = document.getElementById('dataSpino');
const dataTrex = document.getElementById('dataTrex');

function setComparison(which){
  const isTrex = which === 'trex';

  btnSpino.classList.toggle('active', !isTrex);
  btnTrex.classList.toggle('active', isTrex);
  btnSpino.setAttribute('aria-selected', String(!isTrex));
  btnTrex.setAttribute('aria-selected', String(isTrex));

  dataSpino.classList.toggle('active', !isTrex);
  dataTrex.classList.toggle('active', isTrex);

  document.body.classList.toggle('theme-trex', isTrex);
}

if (btnSpino && btnTrex) {
  btnSpino.addEventListener('click', () => setComparison('spino'));
  btnTrex.addEventListener('click', () => setComparison('trex'));
}

// ============================================================
// REPRODUCTOR DE MÚSICA — versión minimalista: botón de play
// central, anterior/siguiente, barra de progreso delgada con
// tiempo transcurrido/duración en los extremos, y un botón para
// ocultar/mostrar el reproductor por completo.

const playlistData = [
  { title: 'I Think About You All The Time', artist: 'Deftones', src: 'audio/musica-fondo.mp3' },
  { title: 'Counterfeit', artist: 'Limp Bizkit', src: 'audio/counterfeit.mp3' },
  { title: 'Jambi', artist: 'Tool', src: 'audio/jambi.mp3' }
];

const bgAudio = document.getElementById('bgAudio');
const playerEl = document.getElementById('player');
const audioToggle = document.getElementById('audioToggle');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const prevTrackBtn = document.getElementById('prevTrack');
const nextTrackBtn = document.getElementById('nextTrack');
const playerHideBtn = document.getElementById('playerHide');
const playerReopenBtn = document.getElementById('playerReopen');
const progressEl = document.getElementById('playerProgress');
const progressFill = document.getElementById('playerProgressFill');
const progressHandle = document.getElementById('playerProgressHandle');
const currentTimeEl = document.getElementById('playerCurrentTime');
const durationEl = document.getElementById('playerDuration');

let currentTrack = 0;
let userPaused = false; // si el usuario pausó a propósito, no forzamos la reproducción

bgAudio.volume = 0.55;

function formatTime(sec){
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function setPlayingUI(isPlaying){
  audioToggle.classList.toggle('playing', isPlaying);
  audioToggle.setAttribute('aria-pressed', String(isPlaying));
  audioToggle.setAttribute('aria-label', isPlaying ? 'Pausar música de fondo' : 'Reproducir música de fondo');
  playerEl.classList.toggle('is-playing', isPlaying);
}

function resetProgressUI(){
  progressFill.style.width = '0%';
  progressHandle.style.left = '0%';
  currentTimeEl.textContent = '0:00';
  durationEl.textContent = '0:00';
  progressEl.setAttribute('aria-valuenow', '0');
}

function loadTrack(index, autoplay){
  currentTrack = ((index % playlistData.length) + playlistData.length) % playlistData.length;
  const track = playlistData[currentTrack];
  playerTitle.textContent = track.title;
  playerArtist.textContent = track.artist;
  bgAudio.src = track.src;
  resetProgressUI();
  if (autoplay) {
    userPaused = false;
    bgAudio.play().then(() => setPlayingUI(true)).catch(() => setPlayingUI(false));
  }
}

function updateProgressUI(){
  if (!isFinite(bgAudio.duration) || bgAudio.duration === 0) return;
  const pct = (bgAudio.currentTime / bgAudio.duration) * 100;
  progressFill.style.width = `${pct}%`;
  progressHandle.style.left = `${pct}%`;
  currentTimeEl.textContent = formatTime(bgAudio.currentTime);
  progressEl.setAttribute('aria-valuenow', String(Math.round(pct)));
}

bgAudio.addEventListener('timeupdate', updateProgressUI);
bgAudio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(bgAudio.duration);
});

function seekFromClientX(clientX){
  if (!isFinite(bgAudio.duration) || bgAudio.duration === 0) return;
  const rect = progressEl.getBoundingClientRect();
  const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  bgAudio.currentTime = pct * bgAudio.duration;
  progressFill.style.width = `${pct * 100}%`;
  progressHandle.style.left = `${pct * 100}%`;
  currentTimeEl.textContent = formatTime(bgAudio.currentTime);
}

progressEl.addEventListener('click', (e) => {
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  seekFromClientX(clientX);
});
progressEl.addEventListener('keydown', (e) => {
  if (!isFinite(bgAudio.duration) || bgAudio.duration === 0) return;
  const step = 5;
  if (e.key === 'ArrowRight'){ e.preventDefault(); bgAudio.currentTime = Math.min(bgAudio.duration, bgAudio.currentTime + step); }
  if (e.key === 'ArrowLeft'){ e.preventDefault(); bgAudio.currentTime = Math.max(0, bgAudio.currentTime - step); }
});

function tryStartMusic(){
  if (userPaused || !bgAudio.paused) return;
  bgAudio.play().then(() => setPlayingUI(true)).catch(() => {
    // el archivo de audio aún no existe o el navegador lo bloqueó
  });
}

// primer clic, scroll o tecla en cualquier parte de la página → arranca la música
['click', 'scroll', 'keydown', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, tryStartMusic, { once: true, passive: true });
});

audioToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  if (bgAudio.paused) {
    userPaused = false;
    bgAudio.play().then(() => setPlayingUI(true)).catch(() => {
      playerTitle.textContent = 'Falta el archivo de audio';
      playerArtist.textContent = '';
    });
  } else {
    bgAudio.pause();
    userPaused = true;
    setPlayingUI(false);
  }
});

prevTrackBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  loadTrack(currentTrack - 1, !bgAudio.paused || !userPaused);
});
nextTrackBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  loadTrack(currentTrack + 1, !bgAudio.paused || !userPaused);
});

bgAudio.addEventListener('ended', () => loadTrack(currentTrack + 1, true));

// Ocultar / reabrir el reproductor por completo
playerHideBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  playerEl.classList.add('player-hidden');
  playerReopenBtn.classList.add('visible');
  localStorage.setItem('spino-player-hidden', '1');
});
playerReopenBtn.addEventListener('click', () => {
  playerEl.classList.remove('player-hidden');
  playerReopenBtn.classList.remove('visible');
  localStorage.setItem('spino-player-hidden', '0');
});
if (localStorage.getItem('spino-player-hidden') === '1') {
  playerEl.classList.add('player-hidden');
  playerReopenBtn.classList.add('visible');
}

loadTrack(0, false);

// ============================================================
// TORMENTA DE FONDO (tema Spinosaurus) — relámpagos y truenos,
// a tono con la foto de portada. De a ratos se dibuja un rayo
// (zigzag aleatorio) y la pantalla da un destello breve. Se
// desactiva automáticamente en el tema T-Rex (ver lava más abajo)
// y respeta prefers-reduced-motion.
// ============================================================
const stormFlash = document.getElementById('stormFlash');
const boltPath1 = document.getElementById('boltPath1');
const boltPath2 = document.getElementById('boltPath2');

// genera un trazo tipo rayo en zigzag entre y0 y y1, dentro del viewBox 0-1000
function buildBoltPath(startX, y0, y1, segments){
  let x = startX;
  let d = `M${x} ${y0}`;
  const step = (y1 - y0) / segments;
  for (let i = 1; i <= segments; i++){
    const y = y0 + step * i;
    x += (Math.random() * 140 - 70);
    x = Math.max(40, Math.min(960, x));
    d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
  }
  return d;
}

function triggerLightning(){
  if (prefersReducedMotion) return;
  if (document.body.classList.contains('theme-trex')) return; // en tema T-Rex no hay tormenta

  const startX = 120 + Math.random() * 760;
  boltPath1.setAttribute('d', buildBoltPath(startX, 0, 320 + Math.random() * 260, 5));
  boltPath1.classList.remove('active');
  void boltPath1.offsetWidth; // reinicia la animación
  boltPath1.classList.add('active');

  // segundo rayo más tenue y corto, solo a veces (efecto de rayo bifurcado)
  if (Math.random() > 0.45){
    boltPath2.setAttribute('d', buildBoltPath(startX + (Math.random() * 160 - 80), 60, 260 + Math.random() * 200, 4));
    boltPath2.classList.remove('active');
    void boltPath2.offsetWidth;
    boltPath2.classList.add('active');
  } else {
    boltPath2.classList.remove('active');
  }

  stormFlash.classList.remove('active');
  void stormFlash.offsetWidth;
  stormFlash.classList.add('active');
}

function scheduleNextLightning(){
  const delay = 7000 + Math.random() * 14000; // entre 7 y 21 segundos
  setTimeout(() => {
    triggerLightning();
    scheduleNextLightning();
  }, delay);
}

if (!prefersReducedMotion) {
  setTimeout(triggerLightning, 2200); // un primer relámpago poco después de cargar
  scheduleNextLightning();
}

// ============================================================
// LAVA DE FONDO (tema T-Rex) — brasas que suben lentamente desde
// abajo, con un resplandor cálido de fondo. Se genera una sola
// vez al cargar (barato) y luego todo el movimiento corre por
// CSS puro; al estar oculta con display:none mientras el tema
// Spinosaurus está activo, no consume nada de rendimiento.
// ============================================================
const lavaEmbers = document.getElementById('lavaEmbers');

if (lavaEmbers && !prefersReducedMotion) {
  const EMBER_COUNT = 16;
  for (let i = 0; i < EMBER_COUNT; i++){
    const ember = document.createElement('span');
    ember.className = 'ember';
    const left = (Math.random() * 100).toFixed(1);
    const size = (3 + Math.random() * 4).toFixed(1);
    const duration = (7 + Math.random() * 7).toFixed(1);
    const delay = (Math.random() * 14).toFixed(1);
    const drift = (Math.random() * 80 - 40).toFixed(0);
    ember.style.setProperty('--left', `${left}%`);
    ember.style.setProperty('--size', `${size}px`);
    ember.style.setProperty('--duration', `${duration}s`);
    ember.style.setProperty('--delay', `${delay}s`);
    ember.style.setProperty('--drift', `${drift}px`);
    lavaEmbers.appendChild(ember);
  }
}

// ============================================================
// Recalcula posiciones de ScrollTrigger cuando todo terminó de
// cargar (fuentes, imágenes) para evitar desajustes de alineación.
// ============================================================
if (hasScrollTrigger) {
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
