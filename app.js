let alleTouren = [];
let aktiverFilter = "alle";

// Karte initialisieren, Startansicht auf Norwegen/Haugesund
const map = L.map('map').setView([59.4, 5.3], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap Mitwirkende'
}).addTo(map);

let markers = [];

// Daten laden
fetch('data/touren.json')
  .then(res => res.json())
  .then(data => {
    alleTouren = data;
    baueFilterButtons(data);
    render();
  })
  .catch(err => {
    document.getElementById('tour-list').innerHTML =
      '<p>Fehler beim Laden der Touren-Daten.</p>';
    console.error(err);
  });

function baueFilterButtons(touren) {
  const kategorien = ["alle", ...new Set(touren.map(t => t.kategorie))];
  const container = document.getElementById('filters');
  container.innerHTML = "";

  kategorien.forEach(kat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (kat === aktiverFilter ? ' active' : '');
    btn.textContent = kat === "alle" ? "Alle" : kat;
    btn.addEventListener('click', () => {
      aktiverFilter = kat;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
    container.appendChild(btn);
  });
}

function render() {
  const gefiltert = aktiverFilter === "alle"
    ? alleTouren
    : alleTouren.filter(t => t.kategorie === aktiverFilter);

  // Liste rendern
  const list = document.getElementById('tour-list');
  list.innerHTML = "";

  gefiltert.forEach(tour => {
    const card = document.createElement('div');
    card.className = 'tour-card';
    card.innerHTML = `
      <h3>${tour.titel}</h3>
      <div class="meta">${tour.distanz_km} km &middot; ${tour.kategorie}</div>
      <a href="${tour.url}" target="_blank" rel="noopener">Auf Komoot ansehen &rarr;</a>
    `;
    list.appendChild(card);
  });

  // Karten-Marker aktualisieren
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  gefiltert.forEach(tour => {
    if (tour.lat && tour.lng) {
      const marker = L.marker([tour.lat, tour.lng])
        .addTo(map)
        .bindPopup(`<b>${tour.titel}</b><br>${tour.distanz_km} km`);
      markers.push(marker);
    }
  });
}
