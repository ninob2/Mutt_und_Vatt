let alleTouren = [];
let map = null;
let markers = [];

// Kategorie-Konfiguration: Reihenfolge, Anzeige-Name, Sonderfall (externer Link)
const KATEGORIEN = [
  { key: "aus-dem-haus-spaziert", label: "Aus dem Haus spaziert" },
  { key: "aus-dem-haus-geradelt", label: "Aus dem Haus geradelt" },
  { key: "in-der-naehe-spazieren", label: "In der Nähe spazieren" },
  { key: "tagestouren", label: "Tagestouren" },
  {
    key: "berlin-erkunden",
    label: "Berlin erkunden",
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
    const anzahl = alleTouren.filter(t => t.kategorie === kat.key).length;

    const card = document.createElement('button');
    card.className = 'category-card';
    card.innerHTML = `
      <h2>${kat.label}</h2>
      <span class="count">${kat.externalUrl ? 'Auf Komoot' : anzahl + ' Touren'}</span>
    `;

    card.addEventListener('click', () => {
      if (kat.externalUrl) {
        window.open(kat.externalUrl, '_blank', 'noopener');
      } else {
        zeigeDetailAnsicht(kat);
      }
    });

    grid.appendChild(card);
  });
}

function zeigeDetailAnsicht(kat) {
  document.getElementById('home-view').classList.add('hidden');
  document.getElementById('detail-view').classList.remove('hidden');
  document.getElementById('detail-title').textContent = kat.label;

  const touren = alleTouren.filter(t => t.kategorie === kat.key);

  // Karte initialisieren (nur beim ersten Mal) oder zurücksetzen
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
      const marker = L.marker([tour.lat, tour.lng])
        .addTo(map)
        .bindPopup(`<b>${tour.titel}</b>`);
      markers.push(marker);
      bounds.push([tour.lat, tour.lng]);
    }
  });

  // Karte auf die vorhandenen Marker zoomen
  setTimeout(() => {
    map.invalidateSize();
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, 100);

  // Liste rendern
  const list = document.getElementById('tour-list');
  list.innerHTML = "";

  touren.forEach(tour => {
    const card = document.createElement('div');
    card.className = 'tour-card';
    const distanzText = tour.distanz_km ? `${tour.distanz_km} km` : '';
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
