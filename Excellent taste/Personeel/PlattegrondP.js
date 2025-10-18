function safeJson(text) {
  try { return JSON.parse(text); } catch { return { ok:false, error:text }; }
}
function logReq(label, info) {
  console.info(`[${label}]`, info);
}

let huidigeReserveringen = [];
const IS_BEHEER = true;

document.addEventListener('DOMContentLoaded', () => {
  initPlattegrond();
});

/** ================== INIT ================== */
function initPlattegrond() {
  const container = document.querySelector('.plattegrond-container');
  if (!container) return;

  // 1) Tafels laden/renderen
  laadTafels();

  // 2) Linkerklik = formulier openen (event delegation)
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.tafel');
    if (!btn) return;
    const tafelId = btn.dataset.id || btn.dataset.nummer || btn.textContent.trim();
    openReserveringsFormulier(tafelId);
  });

  // 3) Rechterklik = verwijderen
  container.addEventListener('contextmenu', async (e) => {
    const btn = e.target.closest('.tafel');
    if (!btn) return;
    e.preventDefault();

    const nummer = btn.dataset.nummer || btn.textContent.trim();
    const id = btn.dataset.id || null;
    if (!confirm(`Tafel ${nummer} verwijderen?`)) return;

    try {
      const fd = new FormData();
      fd.append('action', 'delete');
      if (id) fd.append('id', id);
      fd.append('nummer', nummer);

      const resp = await fetch('TafelsBijwerken.php', {
        method: 'POST',
        body: fd,
        headers: { 'Accept': 'application/json' }
      });
      const text = await resp.text();
      const data = safeJson(text);

      if (!resp.ok || data.ok === false) throw new Error(data.error || text || 'Serverfout');
      btn.remove();
    } catch (err) {
      console.error(err);
      alert('Verwijderen mislukt: ' + (err.message || 'Onbekende fout'));
    }
  });
}

/** ============ Tafels laden & renderen ============ */
async function laadTafels() {
  const container = document.querySelector('.plattegrond-container');
  if (!container) return;
  container.querySelectorAll('.tafel').forEach(el => el.remove());

  try {
    const r = await fetch('TafelsOphalen.php?nocache=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const tafels = await r.json();

    tafels.forEach(t => {
      // Verwacht: t.id, t.nummer, t.left_px, t.top_px, (optioneel) t.width_px, t.height_px, t.klasse
      const btn = document.createElement('button');
      btn.className = (t.klasse ? (t.klasse + ' ') : '') + 'tafel';
      btn.textContent = t.nummer;
      btn.dataset.id = t.id;
      btn.dataset.nummer = t.nummer;

      btn.style.position = 'absolute';
      btn.style.left = (parseInt(t.left_px, 10) || 0) + 'px';
      btn.style.top  = (parseInt(t.top_px, 10)  || 0) + 'px';
      if (t.width_px)  btn.style.width  = parseInt(t.width_px, 10)  + 'px';
      if (t.height_px) btn.style.height = parseInt(t.height_px, 10) + 'px';

      maakTafelDraggable(btn);
      container.appendChild(btn);
    });
  } catch (err) {
    console.error('Fout bij tafels laden:', err);
  }
}

/** ============ Reserveringsformulier/overzicht ============ */
async function openReserveringsFormulier(tafelKey) {
  // UI refs
  const formulier = document.getElementById('reserveringsformulier');
  const overzicht = document.getElementById('reserveringenOverzicht');
  const tafelInput = document.getElementById('tafel');
  const titel = document.getElementById('tafelnummer');

  // Vind de knop om id/nummer te hebben
  const btn = [...document.querySelectorAll('.tafel')].find(b =>
    (b.dataset.id && b.dataset.id == tafelKey) ||
    (b.dataset.nummer && b.dataset.nummer == tafelKey) ||
    (b.textContent.trim() == tafelKey)
  );
  const id = btn?.dataset.id || '';
  const nummer = btn?.dataset.nummer || btn?.textContent.trim() || String(tafelKey);

  titel.textContent = 'Tafel ' + (nummer || id || tafelKey);
  tafelInput.value = nummer || id || tafelKey;
  overzicht.innerHTML = '<p>Bezig met laden…</p>';
  formulier.style.display = 'block';

  // Probeer 1) ?tafel= & id & nummer, 2) ?table= & id & nummer
  const qs1 = new URLSearchParams();
  if (id) qs1.set('id', id);
  if (nummer) qs1.set('nummer', nummer);
  qs1.set('tafel', nummer || id);

  const qs2 = new URLSearchParams();
  if (id) qs2.set('id', id);
  if (nummer) qs2.set('nummer', nummer);
  qs2.set('table', nummer || id);

  const urls = [
    `TafelReserveringen.php?${qs1.toString()}`,
    `TafelReserveringen.php?${qs2.toString()}`
  ];

  let lastErr = null;
  for (const url of urls) {
    try {
      logReq('GET reserveringen', url);
      const resp = await fetch(url, { headers: { 'Accept':'application/json' } });
      const text = await resp.text();
      let data; try { data = JSON.parse(text); } catch { data = { ok:false, error:text }; }

      if (!resp.ok || data.ok === false) throw new Error(data.error || text || `HTTP ${resp.status}`);

      const lijst = Array.isArray(data) ? data : (data.reserveringen || []);
      huidigeReserveringen = lijst.slice();

      if (!lijst.length) {
        overzicht.innerHTML = `<h3>Reserveringen voor tafel ${nummer || id}</h3><p>Geen reserveringen gevonden.</p>`;
      } else {
        lijst.sort((a, b) => new Date(`${a.datum}T${a.tijd}`) - new Date(`${b.datum}T${b.tijd}`));
        overzicht.innerHTML = `
          <h3>Reserveringen voor tafel ${nummer || id}</h3>
          <ul>
            ${lijst.map(res => `
              <li>
                ${res.datum} ${res.tijd} - ${res.naam} (${Number(res.personen)||0} personen)
                <button onclick="bewerkReservering(${res.id})">Bewerk</button>
                <button onclick="verwijderReservering(${res.id}, '${nummer || id}')">Verwijder</button>
                <button onclick="noShowReservering(${res.id}, '${nummer || id}')">No Show</button>
              </li>
            `).join('')}
          </ul>
        `;
      }
      return; // klaar zodra één variant werkt
    } catch (e) {
      console.warn('Reserveringen poging faalde:', e.message);
      lastErr = e;
    }
  }

  overzicht.innerHTML = `<p style="color:#b00020;">Fout bij laden reserveringen: ${lastErr?.message || 'Onbekende fout'}</p>`;
}


// helper blijft hetzelfde
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/** ============ Tafel toevoegen ============ */
async function tafelToevoegen() {
  const container = document.querySelector('.plattegrond-container');
  if (!container) return;

  const nieuw = document.createElement('button');
  nieuw.className = 'tafel';
  nieuw.textContent = '...';
  nieuw.style.left = '20px';
  nieuw.style.top  = '20px';
  container.appendChild(nieuw);

  const payload = {
    nummer: '',      // of vraag dit aan de gebruiker
    type: 'rond',    // of 'negen'/'tien'/'elf' afhankelijk van je CSS
    x: 20,
    y: 20
  };

  try {
    const resp = await fetch('TafelOpslaan.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    const text = await resp.text();
    let data; try { data = JSON.parse(text); } catch { data = { parseError: true, raw: text }; }
    console.log('Opslaan nieuwe tafel → response:', data);

    if (!data || data.parseError || !data.success) {
      alert('Opslaan mislukt: ' + (data?.error || 'onbekende fout'));
      return;
    }

    nieuw.dataset.id = data.id;
    nieuw.textContent = data.nummer ? data.nummer : data.id;
    maakTafelDraggable(nieuw);

  } catch (err) {
    console.error('Fout bij opslaan nieuwe tafel:', err);
    alert('Er ging iets mis bij het opslaan. Zie console.');
  }
}



/** ============ Drag & drop + positie opslaan ============ */
function maakTafelDraggable(tafelEl) {
  let startX, startY, offsetX, offsetY, dragging = false;
  const container = document.querySelector('.plattegrond-container');

  tafelEl.addEventListener('mousedown', (e) => {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = tafelEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    offsetX = startX - rect.left;
    offsetY = startY - rect.top;

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  function onMove(e) {
    if (!dragging) return;
    const containerRect = container.getBoundingClientRect();
    let left = e.clientX - containerRect.left - offsetX;
    let top  = e.clientY - containerRect.top  - offsetY;

    // binnen container houden
    left = Math.max(0, Math.min(left, container.clientWidth  - tafelEl.offsetWidth));
    top  = Math.max(0, Math.min(top,  container.clientHeight - tafelEl.offsetHeight));

    tafelEl.style.left = left + 'px';
    tafelEl.style.top  = top  + 'px';
  }

  async function onUp() {
    if (!dragging) return;
    dragging = false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);

    const id = tafelEl.dataset.id;
    if (!id) {
      console.warn('Geen data-id op tafel element.');
      return;
    }

    const x = parseInt(tafelEl.style.left, 10) || 0;
    const y = parseInt(tafelEl.style.top, 10) || 0;

    try {
      const resp = await fetch('TafelsBijwerken.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ action: 'update', id, x, y })
      });
      const data = await resp.json();
      console.log('Tafel bijgewerkt:', data);
    } catch (err) {
      console.error('Fout bij bijwerken:', err);
    }
  }
}

async function verwijderTafel(id) {
  if (!confirm('Weet je zeker dat je deze tafel wilt verwijderen?')) return;

  try {
    const resp = await fetch('TafelsBijwerken.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ action: 'delete', id })
    });
    const data = await resp.json();
    console.log('Tafel verwijderd:', data);

    if (data.success) {
      const el = document.querySelector(`.tafel[data-id="${id}"]`);
      if (el) el.remove();
    } else {
      alert('Verwijderen mislukt: ' + data.error);
    }
  } catch (err) {
    console.error('Fout bij verwijderen:', err);
  }
}



/** ============ Helpers ============ */
function safeJson(text) {
  try { return JSON.parse(text); } catch { return { ok:false, error: text }; }
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/** ============ Expose voor knoppen in HTML ============ */
window.tafelToevoegen = tafelToevoegen;
window.openReserveringsFormulier = openReserveringsFormulier;

function bewerkReservering(id) {
  console.log("Bewerk reservering:", id);
  // Hier kun je je bewerkformulier tonen
  document.getElementById("bewerkFormulier").style.display = "flex";
  document.getElementById("editId").value = id;
}

function sluitBewerkFormulier() {
  document.getElementById("bewerkFormulier").style.display = "none";
}


function verwijderReservering(id) {
  if (!confirm("Weet je zeker dat je deze reservering wilt verwijderen?")) return;
  fetch(`VerwijderReservering.php?id=${encodeURIComponent(id)}`)
    .then(r => r.json())
    .then(data => {
      if (!data.success) {
        console.error("Verwijder-fout:", data.error || data);
        alert("Verwijderen mislukt: " + (data.error || "Onbekende fout"));
        return;
      }
      const tafelId = document.getElementById("tafel").value;
      if (tafelId) openFormulier(tafelId);
    })
    .catch(err => {
      console.error("Fout bij verwijderen:", err);
      alert("Netwerkfout bij verwijderen.");
    });
}

function noShowReservering(id) {
  fetch(`NoShowReservering.php?id=${encodeURIComponent(id)}`)
    .then(r => r.json())
    .then(data => {
      if (!data.success) {
        console.error("No Show fout:", data.error || data);
        alert("No Show mislukt: " + (data.error || "Onbekende fout"));
        return;
      }
      // herlaad het overzicht voor de geselecteerde tafel
      const tafelId = document.getElementById("tafel").value;
      if (tafelId) openFormulier(tafelId);
    })
    .catch(err => {
      console.error("Fout bij No Show:", err);
      alert("Netwerkfout bij No Show.");
    });
}

// ------------------
// Reserveringen laden
// ------------------
function laadReserveringen(tafelId) {
  if (!tafelId) {
    console.warn("Geen tafel opgegeven bij laadReserveringen()");
    return;
  }

  console.log("Reserveringen laden voor tafel:", tafelId);

  fetch("TafelReserveringen.php?tafel=" + encodeURIComponent(tafelId))
    .then(resp => resp.text())
    .then(data => {
      const overzicht = document.getElementById("reserveringenOverzicht");
      overzicht.innerHTML = data;

      // Koppel opnieuw knoppen voor bewerken/verwijderen/noshow
      overzicht.querySelectorAll(".bewerk-btn").forEach(btn => {
        btn.addEventListener("click", () => bewerkReservering(btn.dataset.id));
      });
      overzicht.querySelectorAll(".verwijder-btn").forEach(btn => {
        btn.addEventListener("click", () => verwijderReservering(btn.dataset.id));
      });
      overzicht.querySelectorAll(".noshow-btn").forEach(btn => {
        btn.addEventListener("click", () => noShowReservering(btn.dataset.id));
      });
    })
    .catch(err => {
      console.error("Fout bij laden reserveringen:", err);
      const overzicht = document.getElementById("reserveringenOverzicht");
      overzicht.innerHTML = "<p>Fout bij laden reserveringen.</p>";
    });
}
// ---------- FORMULIER OPENEN + LADEN ----------
function openFormulier(tafelId) {
  const form = document.getElementById('reserveringsformulier');
  const tafelInput = document.getElementById('tafel');
  const titel = document.getElementById('tafelnummer');

  if (!tafelId) {
    console.warn('openFormulier zonder tafelId aangeroepen');
    return;
  }
  tafelInput.value = tafelId;
  if (titel) titel.textContent = 'Tafel ' + tafelId;
  if (form) form.style.display = 'block';

  laadReserveringen(tafelId);
}

// ---------- RESERVERINGEN LADEN VOOR TAFEL ----------
function laadReserveringen(tafelId) {
  const overzicht = document.getElementById('reserveringenOverzicht');
  if (!tafelId) {
    console.warn('Geen tafel opgegeven bij laadReserveringen()');
    if (overzicht) overzicht.innerHTML = '<p>Geen tafel opgegeven.</p>';
    return;
  }

  fetch('TafelReserveringen.php?table=' + encodeURIComponent(tafelId))
    .then(r => r.json())
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        overzicht.innerHTML = '<p>Geen reserveringen voor deze tafel.</p>';
        return;
      }
      overzicht.innerHTML = `
        <table>
          <thead>
            <tr><th>Naam</th><th>Datum</th><th>Tijd</th><th>Personen</th><th>Acties</th></tr>
          </thead>
          <tbody>
            ${data.map(r => `
              <tr data-id="${r.id}">
                <td>${r.naam}</td>
                <td>${r.datum}</td>
                <td>${r.tijd}</td>
                <td>${r.personen}</td>
                <td>
                  <button class="bewerk-btn"   data-id="${r.id}">Bewerk</button>
                  <button class="verwijder-btn" data-id="${r.id}">Verwijder</button>
                  <button class="noshow-btn"    data-id="${r.id}">No Show</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

      // koppel events
      overzicht.querySelectorAll('.bewerk-btn').forEach(btn => {
        btn.addEventListener('click', () => bewerkReservering(btn.dataset.id));
      });
      overzicht.querySelectorAll('.verwijder-btn').forEach(btn => {
        btn.addEventListener('click', () => verwijderReservering(btn.dataset.id));
      });
      overzicht.querySelectorAll('.noshow-btn').forEach(btn => {
        btn.addEventListener('click', () => noShowReservering(btn.dataset.id));
      });
    })
    .catch(err => {
      console.error('Fout bij laden reserveringen:', err);
      overzicht.innerHTML = '<p>Fout bij laden reserveringen.</p>';
    });
}

// ---------- ACTIES ----------
function verwijderReservering(id) {
  if (!id) { alert('Geen ID in knop gevonden'); return; }
  if (!confirm('Weet je zeker dat je deze reservering wilt verwijderen?')) return;

  fetch(`VerwijderReservering.php?id=${encodeURIComponent(id)}`)
    .then(r => r.json())
    .then(data => {
      if (!data.success) {
        console.error('Verwijder-fout:', data);
        alert('Verwijderen mislukt: ' + (data.error || 'Onbekende fout'));
        return;
      }
      const tafelId = document.getElementById('tafel').value;
      if (tafelId) openFormulier(tafelId);  // herladen
    })
    .catch(err => {
      console.error('Fout bij verwijderen:', err);
      alert('Netwerkfout bij verwijderen.');
    });
}

function noShowReservering(id) {
  if (!id) { alert('Geen ID in knop gevonden'); return; }

  fetch(`NoShowReservering.php?id=${encodeURIComponent(id)}`)
    .then(r => r.json())
    .then(data => {
      if (!data.success) {
        console.error('No Show fout:', data.error || data);
        alert('No Show mislukt: ' + (data.error || 'Onbekende fout'));
        return;
      }
      const tafelId = document.getElementById('tafel').value;
      if (tafelId) openFormulier(tafelId);  // herladen
    })
    .catch(err => {
      console.error('Fout bij No Show:', err);
      alert('Netwerkfout bij No Show.');
    });
}

// ---- maak globaal beschikbaar (voorkomt "is not defined") ----
window.openFormulier = openFormulier;
window.laadReserveringen = laadReserveringen;
window.verwijderReservering = verwijderReservering;
window.noShowReservering = noShowReservering;
// (bewerkReservering/ sluitBewerkFormulier evt. ook)

document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    id: document.getElementById('editId').value,
    naam: document.getElementById('editNaam').value,
    datum: document.getElementById('editDatum').value,
    tijd: document.getElementById('editTijd').value,
    personen: document.getElementById('editPersonen').value
  };

  const response = await fetch('BewerkReserveringen.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  if (result.success) {
    alert('Reservering opgeslagen!');
    sluitBewerkFormulier();
    laadReserveringen(); // of welke functie de tabel herlaadt
  } else {
    alert('Fout: ' + (result.error || 'Opslaan mislukt'));
  }
});
