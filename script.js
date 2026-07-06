// ============================================================
// NAVEGACIÓN — fondo al hacer scroll + menú móvil
// ============================================================
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ============================================================
// REVELADO AL HACER SCROLL (con pequeño escalonado por hijos)
// ============================================================
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

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
// CARGA DE IMÁGENES (galería, figuras y especies) CON RESPALDO
// Cualquier casilla .gallery-item[data-src] usa este mismo mecanismo,
// incluyendo las miniaturas de cada especie en "Taxonomía".
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

  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
}

function closeLightbox(){
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  lightboxImg.src = '';
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
// REPRODUCTOR DE MÚSICA — lista de canciones, título, volumen
// Archivos esperados (ver audio/LEEME.txt):
//   audio/musica-fondo.mp3  → Deftones - I Think About You All The Time
//   audio/stinkfist.mp3     → Tool - Stinkfist
//   audio/rage.mp3          → Rage Against The Machine - No Shelter
// ============================================================
const playlistData = [
  { title: 'Deftones — I Think About You All The Time', src: 'audio/musica-fondo.mp3' },
  { title: 'Tool — Stinkfist', src: 'audio/stinkfist.mp3' },
  { title: 'Rage Against The Machine — No Shelter', src: 'audio/rage.mp3' }
];

const bgAudio = document.getElementById('bgAudio');
const audioToggle = document.getElementById('audioToggle');
const playerTrack = document.getElementById('playerTrack');
const prevTrackBtn = document.getElementById('prevTrack');
const nextTrackBtn = document.getElementById('nextTrack');
const playlistToggle = document.getElementById('playlistToggle');
const playlistEl = document.getElementById('playlist');
const volumeSlider = document.getElementById('volumeSlider');

let currentTrack = 0;
let userPaused = false; // si el usuario pausó a propósito, no forzamos la reproducción

function buildPlaylistUI(){
  playlistEl.innerHTML = '';
  playlistData.forEach((track, i) => {
    const btn = document.createElement('button');
    btn.className = 'playlist-song';
    btn.type = 'button';
    btn.textContent = track.title;
    btn.addEventListener('click', () => {
      loadTrack(i, true);
      playlistEl.classList.remove('open');
      playlistToggle.setAttribute('aria-expanded', 'false');
    });
    playlistEl.appendChild(btn);
  });
  updatePlaylistUI();
}

function updatePlaylistUI(){
  playlistEl.querySelectorAll('.playlist-song').forEach((btn, i) => {
    btn.classList.toggle('active', i === currentTrack);
  });
}

function setPlayingUI(isPlaying){
  audioToggle.classList.toggle('playing', isPlaying);
  audioToggle.setAttribute('aria-pressed', String(isPlaying));
  audioToggle.setAttribute('aria-label', isPlaying ? 'Pausar música de fondo' : 'Reproducir música de fondo');
  document.getElementById('player').classList.toggle('is-playing', isPlaying);
}

function loadTrack(index, autoplay){
  currentTrack = ((index % playlistData.length) + playlistData.length) % playlistData.length;
  const track = playlistData[currentTrack];
  playerTrack.textContent = track.title;
  bgAudio.src = track.src;
  updatePlaylistUI();
  if (autoplay) {
    userPaused = false;
    bgAudio.play().then(() => setPlayingUI(true)).catch(() => setPlayingUI(false));
  }
}

// volumen — se recuerda entre visitas
const savedVolume = parseInt(localStorage.getItem('spino-volume'), 10);
const initialVolume = Number.isFinite(savedVolume) ? savedVolume : 50;
volumeSlider.value = initialVolume;
bgAudio.volume = initialVolume / 100;

volumeSlider.addEventListener('input', () => {
  bgAudio.volume = volumeSlider.value / 100;
  localStorage.setItem('spino-volume', volumeSlider.value);
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
      playerTrack.textContent = 'Falta el archivo de audio';
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

playlistToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = playlistEl.classList.toggle('open');
  playlistToggle.setAttribute('aria-expanded', String(isOpen));
});
document.addEventListener('click', (e) => {
  if (!playlistEl.contains(e.target) && e.target !== playlistToggle) {
    playlistEl.classList.remove('open');
    playlistToggle.setAttribute('aria-expanded', 'false');
  }
});

bgAudio.addEventListener('ended', () => loadTrack(currentTrack + 1, true));

buildPlaylistUI();
loadTrack(0, false);

// ============================================================
// TORMENTA DE FONDO — relámpagos y truenos, a tono con la foto
// de portada. De a ratos se dibuja un rayo (zigzag aleatorio) y
// la pantalla da un destello breve. Respeta prefers-reduced-motion.
// ============================================================
const stormFlash = document.getElementById('stormFlash');
const boltPath1 = document.getElementById('boltPath1');
const boltPath2 = document.getElementById('boltPath2');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
