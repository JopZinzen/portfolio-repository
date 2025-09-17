// MenuKlant.js
let dagWachtwoord = '';
let alleItems = [];

// Helper(s)
function esc(s) {
  return (s ?? '').toString()
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'","&#39;");
}
function euro(n) {
  const num = Number(n);
  return isFinite(num) ? '€' + num.toFixed(2) : '';
}

// ▼ Globaal maken voor onclick in HTML
window.toonCategorie = function (categorie) {
  // active tab styling
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  const current = Array.from(document.querySelectorAll('.tab'))
    .find(b => (b.getAttribute('onclick') || '').includes(categorie));
  if (current) current.classList.add('active');

  // items renderen
  const container = document.getElementById('menuItems');
  container.innerHTML = '';

  const gefilterd = alleItems.filter(it => it.categorie === categorie);
  if (gefilterd.length === 0) {
    container.innerHTML = '<p>Geen items in deze categorie.</p>';
    return;
  }

  gefilterd.forEach(item => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    const naamSafe = (item.naam || '').replace(/'/g, "\\'");
    div.innerHTML = `
      <h3>${esc(item.naam)}</h3>
      <p>${esc(item.beschrijving || '')}</p>
      <strong>${euro(item.prijs)}</strong><br>
      <button onclick="bestelItem(${Number(item.id)}, '${naamSafe}')">Bestel</button>
    `;
    container.appendChild(div);
  });
};

// ▼ Bestellen (jouw bestaande, met kleine defensieve tweaks)
window.bestelItem = function(id, naam) {
  fetch('/ET/Klant/IsIngelogd.php')
    .then(res => res.text())
    .then(isIngelogd => {
      if (isIngelogd !== 'true') {
        window.location.href = '/ET/Klant/LoginKlant.html';
        return;
      }

      const aantal = prompt(`Hoeveel van "${naam}" wilt u bestellen?`, 1);
      if (!aantal || isNaN(aantal) || Number(aantal) < 1) return;

      if (!dagWachtwoord) {
        dagWachtwoord = prompt("Voer het dag-wachtwoord in om te bestellen:");
        if (!dagWachtwoord) return;
      }

     fetch('/ET/Klant/BestellingPlaatsen.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
        tafel: document.getElementById('tafelNummer')?.value || (window.tafelNummer || ''),
        wachtwoord: dagWachtwoord,
        items: [{ menu_id: Number(id), aantal: Number(aantal) }]
        })
      })
      .then(async res => {
        const text = await res.text();
        let json; try { json = JSON.parse(text); } catch { json = {success:false, error:text}; }
        if (!res.ok || json.success === false) throw new Error(json.error || text || res.statusText);
        return json;
      })
      .then(() => alert('Bestelling geplaatst!'))
      .catch(err => {
        if (String(err.message).toLowerCase().includes('wachtwoord')) dagWachtwoord = '';
        alert('Bestellen mislukt: ' + err.message);
      });
    });
};

// ▼ Menu ophalen en pas daarna toonCategorie aanroepen
window.addEventListener('DOMContentLoaded', () => {
  // TIP: als jouw API echt /ET/Personeel/MenuP.php is, laat deze zo.
  // Beter is één centrale: /ET/api/MenuAPI.php (pas dan hieronder de URL aan).
  fetch('/ET/Personeel/MenuP.php', { headers: { 'Cache-Control': 'no-store' } })
    .then(async res => {
      const text = await res.text();
      try { return JSON.parse(text); }
      catch { throw new Error(text); } // laat echte serverfout zien
    })
    .then(items => {
      alleItems = Array.isArray(items) ? items : [];
      window.toonCategorie('voorgerecht'); // bestaat nu zeker
    })
    .catch(err => {
      alert('Menu laden mislukt: ' + err.message);
      console.error('MenuAPI response:', err.message);
    });
});
