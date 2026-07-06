# Spinosaurus — guía rápida de la página

Este README resume todos los cambios nuevos y, sobre todo, **qué archivos tenés que subir y con qué nombre exacto** para que todo funcione.

## 🎵 Música (carpeta `audio/`)

El reproductor ahora tiene lista de canciones, nombre de la pista sonando, botones de anterior/siguiente y control de volumen. Necesita estos 3 archivos, **con estos nombres exactos, en minúsculas**:

| Archivo requerido        | Canción                                              |
|---------------------------|-------------------------------------------------------|
| `audio/musica-fondo.mp3`  | Deftones — I Think About You All The Time (pista principal) |
| `audio/stinkfist.mp3`     | Tool — Stinkfist                                       |
| `audio/rage.mp3`          | Rage Against The Machine — No Shelter                  |

⚠️ Vi que tenías un archivo `rage.MP3` (con mayúsculas). En Windows no importa, pero muchos servidores donde se aloja una página web (Linux) **sí distinguen mayúsculas de minúsculas**, así que renombralo a `rage.mp3` en minúsculas para evitar que se rompa al publicar la página.

Si querés agregar más canciones a futuro, abrí `script.js` y sumá una línea al arreglo `playlistData` al principio del archivo:

```js
const playlistData = [
  { title: 'Deftones — I Think About You All The Time', src: 'audio/musica-fondo.mp3' },
  { title: 'Tool — Stinkfist', src: 'audio/stinkfist.mp3' },
  { title: 'Rage Against The Machine — No Shelter', src: 'audio/rage.mp3' },
  // { title: 'Artista — Canción', src: 'audio/archivo.mp3' },
];
```

El volumen se guarda en el navegador de cada visitante (no es algo que vos configures), así que cada quien puede subirlo o bajarlo con el control deslizante y la próxima vez que entre a la página se recuerda su preferencia.

## 🖼️ Imágenes (carpeta `images/gallery/`)

Todo lo que ya tenías sigue igual (mismos nombres). Ahora, además, cada **especie** en la sección "Taxonomía" tiene su propio recuadro de imagen. Subí estos 3 archivos con estos nombres:

| Archivo requerido                              | Para qué especie        |
|--------------------------------------------------|--------------------------|
| `images/gallery/especie-aegyptiacus.jpg`        | S. aegyptiacus            |
| `images/gallery/especie-mirabilis.jpg`          | S. mirabilis               |
| `images/gallery/especie-maroccanus.jpg`         | S. maroccanus              |

Mientras no subas una imagen, se ve el marcador de posición con el nombre de archivo esperado, igual que antes.

## 🔍 Clic para ampliar imágenes

Ahora **cualquier imagen de la página** (galería, figuras de las secciones, y las nuevas de especies) se puede tocar/clickear para verla en una vista ampliada (lightbox), con el nombre/descripción debajo. Se cierra tocando la ✕, tocando afuera de la imagen, o con la tecla `Esc`.

## 📱 Responsive / móvil

Se revisaron y reforzaron los tamaños de texto, el reproductor (que en pantallas chicas se convierte en una barra angosta en la parte inferior, sin el control de volumen ya que en el celular el volumen se maneja con los botones físicos), las grillas de tarjetas (pasan a una sola columna), y el menú (☰) para que todo se vea bien de punta a punta en el teléfono.

## 🖼️➕ Tamaño de las casillas de imagen

Las casillas de galería y los recuadros de figura ahora son más grandes y se ajustan automáticamente (`minmax(280px, 1fr)`), para que visualmente pesen tanto como los bloques de texto de al lado, en vez de quedar chicas.

## 🙏 Agradecimientos (footer)

Al final de la página, en el pie (`footer`), agregué un pequeño bloque de "Agradecimientos" donde podés escribir los nombres que quieras. Está en `index.html`, buscá este bloque y editalo directamente:

```html
<div class="footer-thanks">
  <span class="thanks-label">Agradecimientos</span>
  <ul class="thanks-list">
    <li>Nombre 1</li>
    <li>Nombre 2</li>
    <li>Nombre 3</li>
  </ul>
</div>
```

Reemplazá "Nombre 1", "Nombre 2", etc. por las personas que quieras agradecer. Podés agregar o quitar líneas `<li>...</li>` libremente.

## 🗺️ Mapa animado (sección Descubrimiento)

Se agregó un mapa estilizado (no es un mapa satelital real, es un dibujo con los colores de la propia página) que marca los tres sitios de hallazgo: Marruecos, Egipto y Níger, con puntos que laten en los mismos colores del sitio (celeste y dorado para Níger/mirabilis, ya que fue el hallazgo de 2026), más un par de "ríos" animados que lo recorren, conectando con el tema acuático de la página.

## ✨ Página más animada / viva

Se sumaron animaciones sutiles y con buen gusto que no habían antes:
- Burbujas subiendo de fondo por toda la página (tema semiacuático), que respetan la configuración de "reducir movimiento" del sistema operativo si el usuario la tiene activada.
- El ícono del menú se mece levemente.
- Los puntos de la línea de tiempo laten.
- El botón de reproducción tiene un pulso mientras suena música.
- Tarjetas y estadísticas responden con un pequeño movimiento al pasar el mouse/dedo.
- Un lento respiro de color en el fondo general.

## Estructura de archivos esperada

```
spinosaurus-site/
├── audio/
│   ├── LEEME.txt
│   ├── musica-fondo.mp3       ← Deftones - I Think About You All The Time
│   ├── stinkfist.mp3          ← Tool - Stinkfist
│   └── rage.mp3               ← Rage Against The Machine - No Shelter
├── images/
│   ├── gallery/
│   │   ├── aegyptiacus.jpg
│   │   ├── comparacion-especies.jpg
│   │   ├── especie-aegyptiacus.jpg   ← nuevo
│   │   ├── especie-mirabilis.jpg     ← nuevo
│   │   ├── especie-maroccanus.jpg    ← nuevo
│   │   ├── fosil-original.jpg
│   │   ├── habitat-ripario.jpg
│   │   ├── LEEME.txt
│   │   ├── mirabilis-cresta.jpg
│   │   ├── spinosaurus-1.jpg
│   │   ├── spinosaurus-reconstruccion.jpg
│   │   └── vela-dorsal.jpg
│   └── hero/
│       ├── LEEME.txt
│       └── spinosaurus-hero.jpg
├── index.html
├── script.js
├── styles.css
└── README.md
```
