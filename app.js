let alleTouren = [];
let map = null;
let markers = [];

const ICONS = {
  bike: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4-9h4l3 9M10 8h4M14.5 8L18 17"/></svg>',
  walk: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13" cy="4" r="1.5"/><path d="M10 7l2 3-1 4-4 3M12 10l3 2 1 5M9 14l-2 6M15 17l2 4"/></svg>',
  flag: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3v18M5 4h11l-2 3.5L16 11H5"/></svg>',
  star: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.6 5.6 6.2.6-4.6 4.2 1.3 6.1L12 16.6 6.5 19.5l1.3-6.1L3.2 9.2l6.2-.6z"/></svg>'
};

const KATEGORIEN = [
  { key: "aus-dem-haus-geradelt", label: "Aus dem Haus geradelt", icon: "bike", stripe: "var(--blaze)" },
  { key: "in-der-naehe-spazieren", label: "In der Nähe spazieren", icon: "walk", stripe: "var(--water)" },
  { key: "tagestouren", label: "Tagestouren", icon: "flag", stripe: "var(--forest)" },
  {
    key: "berlin-erkunden",
    label: "Berlin erkunden",
    icon: "star",
    stripe: "var(--sage)",
    externalUrl: "https://www.komoot.com/de-de/collection/1053975/-berlin-die-20-gruenen-hauptwege-berlins"
  }
];

fetch('data/touren.json')
  .then(res => res.json())
  .then(data => {
    alleTouren = data;
    baueKategorieKacheln();
  })
  .catch(err => {
    document.getElementById('category-grid').innerHTML =
      '<p>Fehler beim Laden der Touren-Daten.</p>';
    console.error(err);
  });

function baueKategorieKacheln() {
  const grid = document.getElementById('category-grid');
  grid.innerHTML = "";

  KATEGORIEN.forEach(kat => {
    const touren = alleTouren.filter(t => t.kategorie === kat.key);
    const distanzen = touren.map(t => t.distanz_km).filter(d => typeof d === 'number');
    let statText = kat.externalUrl ? 'Auf Komoot' : `${touren.length} Touren`;
    if (!kat.externalUrl && distanzen.length > 0) {
      const min = Math.min(...distanzen);
      const max = Math.max(...distanzen);
      statText += ` · <span class="mono">${min === max ? min : min + '–' + max} km</span>`;
    }

    const card = document.createElement('button');
    card.className = 'category-card';
    card.style.setProperty('--stripe', kat.stripe);
    card.innerHTML = `
      ${ICONS[kat.icon]}
      <h2>${kat.label}</h2>
      <span class="count">${statText}</span>
    `;

    card.addEventListener('click', () => {
      if (kat.externalUrl) {
        window.open(kat.externalUrl, '_blank', 'noopener');
      } else {
        zeigeDetailAnsicht(kat, touren);
      }
    });

    grid.appendChild(card);
  });
}

function zeigeDetailAnsicht(kat, touren) {
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('detail-view').classList.remove('hidden');
  document.getElementById('detail-title').textContent = kat.label;

  if (!map) {
    map = L.map('map').setView([52.55, 13.35], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap Mitwirkende'
    }).addTo(map);
  }

  markers.forEach(m => map.removeLayer(m));
  markers = [];
  const bounds = [];

  touren.forEach(tour => {
    if (tour.lat && tour.lng) {
      const marker = L.marker([tour.lat, tour.lng]).addTo(map).bindPopup(`<b>${tour.titel}</b>`);
      markers.push(marker);
      bounds.push([tour.lat, tour.lng]);
    }
  });

  setTimeout(() => {
    map.invalidateSize();
    if (bounds.length > 0) map.fitBounds(bounds, { padding: [40, 40] });
  }, 100);

  const list = document.getElementById('tour-list');
  list.innerHTML = "";

  touren.forEach(tour => {
    const card = document.createElement('div');
    card.className = 'tour-card';
    const distanzText = typeof tour.distanz_km === 'number' ? `<span class="mono">${tour.distanz_km} km</span>` : '';
    card.innerHTML = `
      <h3>${tour.titel}</h3>
      ${distanzText ? `<div class="meta">${distanzText}</div>` : ''}
      <a href="${tour.url}" target="_blank" rel="noopener">Auf Komoot ansehen &rarr;</a>
    `;
    list.appendChild(card);
  });
}

document.getElementById('back-btn').addEventListener('click', () => {
  document.getElementById('detail-view').classList.add('hidden');
  document.getElementById('home-view').classList.remove('hidden');
});
