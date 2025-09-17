// === Config ===
const API_URL = '/ET/Personeel/MenuP.php'; // gebruik 1 centrale endpoint

// === Helpers ===
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { success:false, raw:text }; }
  if (!res.ok || json.success === false) {
    console.error('API error', { status: res.status, body: text, json });
    throw new Error(json.error || text || res.statusText);
  }
  return json;
}

function escapeHtml(s) {
  return (s ?? '').toString()
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'","&#39;");
}

const CATEGORIES = [
  { value: 'voorgerecht', label: 'Voorgerecht' },
  { value: 'hoofdgerecht', label: 'Hoofdgerecht' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'koudedrank', label: 'Koude dranken' },
  { value: 'warmedrank', label: 'Warme dranken' },
];

// === Tabel render ===
function rowTemplate(item) {
  const catOpts = CATEGORIES.map(c =>
    `<option value="${c.value}" ${item.categorie===c.value?'selected':''}>${c.label}</option>`
  ).join('');
  return `
    <tr data-id="${item.id}">
      <td><input data-field="naam" type="text" value="${escapeHtml(item.naam)}"></td>
      <td><input data-field="beschrijving" type="text" value="${escapeHtml(item.beschrijving || '')}"></td>
      <td><input data-field="prijs" type="text" value="${(item.prijs ?? '').toString().replace('.', ',')}"></td>
      <td>
        <select data-field="categorie">${catOpts}</select>
      </td>
      <td>
        <button type="button" class="save">Update</button>
        <button type="button" class="delete">Verwijderen</button>
      </td>
    </tr>
  `;
}

async function loadItems() {
  const tbody = document.querySelector('#menuTable tbody');
  tbody.innerHTML = '<tr><td colspan="5">Laden…</td></tr>';
  try {
    const items = await fetchJSON(API_URL, { method: 'GET', headers: { 'Cache-Control':'no-store' } });
    if (!Array.isArray(items) || items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Nog geen items.</td></tr>';
      return;
    }
    tbody.innerHTML = items.map(rowTemplate).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:red">Fout bij laden: ${escapeHtml(e.message)}</td></tr>`;
  }
}

// === Events: update/delete ===
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const tr = e.target.closest('tr');
  if (tr && btn.classList.contains('save')) {
    const id = parseInt(tr.dataset.id, 10);
    const prijsStr = tr.querySelector('[data-field="prijs"]').value.trim().replace(',', '.');
    const payload = {
      id,
      naam: tr.querySelector('[data-field="naam"]').value.trim(),
      beschrijving: tr.querySelector('[data-field="beschrijving"]').value.trim(),
      categorie: tr.querySelector('[data-field="categorie"]').value,
      prijs: parseFloat(prijsStr)
    };
    if (!payload.naam || !payload.categorie || !isFinite(payload.prijs) || payload.prijs < 0) {
      alert('Vul naam, categorie en geldige prijs in.'); return;
    }
    try {
      const res = await fetchJSON(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      // Optioneel feedback
      console.log('PUT response', res);
      await loadItems();
    } catch (err) {
      alert('Fout bij opslaan: ' + err.message);
    }
    return;
  }

  if (tr && btn.classList.contains('delete')) {
    const id = parseInt(tr.dataset.id, 10);
    if (!confirm('Weet je zeker dat je dit item wilt verwijderen?')) return;
    try {
      await fetchJSON(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ id })
      });
      await loadItems();
    } catch (err) {
      alert('Fout bij verwijderen: ' + err.message);
    }
  }
});

// === Toevoegen ===
document.getElementById('addForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const description = document.getElementById('description').value.trim();
  const priceStr = document.getElementById('price').value.trim().replace(',', '.');
  const categorie = document.getElementById('categorie').value;

  const payload = {
    naam: name,
    beschrijving: description,
    prijs: parseFloat(priceStr),
    categorie
  };
  if (!payload.naam || !payload.categorie || !isFinite(payload.prijs) || payload.prijs < 0) {
    alert('Vul naam, categorie en geldige prijs in.'); return;
  }

  try {
    const res = await fetchJSON(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });
    console.log('POST response', res);
    e.target.reset();
    await loadItems();
  } catch (err) {
    alert('Fout bij toevoegen: ' + err.message);
  }
});

// === Init ===
loadItems();
