let huidigeReserveringen = [];
let isDragging = false;

// Formulier openen
function openFormulier(tafelNummer) {
    document.getElementById('tafelnummer').textContent = "Tafel " + tafelNummer;
    document.getElementById('reserveringsformulier').style.display = 'block';
    document.getElementById("tafel").value = tafelNummer;

    fetch(`TafelReserveringen.php?table=${tafelNummer}`)
        .then(response => response.json())
        .then(data => {
            huidigeReserveringen = data;
            data.sort((a, b) => new Date(`${a.datum}T${a.tijd}`) - new Date(`${b.datum}T${b.tijd}`));

            let overzicht = document.getElementById('reserveringenOverzicht');
            if (data.length === 0) {
                overzicht.innerHTML = `<h3>Reserveringen voor tafel ${tafelNummer}</h3><p>Geen reserveringen gevonden.</p>`;
            } else {
                let html = `<h3>Reserveringen voor tafel ${tafelNummer}</h3><ul>`;
                data.forEach((res) => {
                    html += `<li>
                        ${res.datum} ${res.tijd} - ${res.naam} (${res.personen} personen)
                        <button onclick="bewerkReservering(${res.id})">Bewerk</button>
                        <button onclick="verwijderReservering(${res.id}, ${tafelNummer})">Verwijder</button>
                        <button onclick="noShowReservering(${res.id}, ${tafelNummer})">No Show</button>
                    </li>`;
                });
                html += `</ul>`;
                overzicht.innerHTML = html;
            }
        });
}

// Tafel toevoegen
function tafelToevoegen() {
    const plattegrond = document.querySelector('.plattegrond-container');
    const nieuwNummer = document.querySelectorAll('.tafel').length + 1;
    const btn = document.createElement('button');
    btn.className = 'tafel';
    btn.textContent = nieuwNummer;
    btn.style.left = '100px';
    btn.style.top = '100px';
    plattegrond.appendChild(btn);

    maakTafelDraggable(btn);

    fetch('TafelOpslaan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            actie: 'toevoegen',
            nummer: nieuwNummer,
            left: 100,
            top: 100
        })
    });
}

// Maak een tafel versleepbaar
function maakTafelDraggable(btn) {
  const container = document.querySelector('.plattegrond-container');

  let startX = 0, startY = 0;
  let shiftX = 0, shiftY = 0;
  let moved = false;

  function onMouseDown(e) {
    if (e.button !== 0) return;

    moved = false;
    startX = e.clientX;
    startY = e.clientY;

    // detecteer of het een “drag” wordt
    document.addEventListener('mousemove', detectMove);
    // voor click zonder slepen
    document.addEventListener('mouseup', onMouseUpNoDrag, { once: true });

    e.preventDefault();
  }

  function detectMove(e) {
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);
    if (dx > 3 || dy > 3) {
      moved = true;
      document.removeEventListener('mousemove', detectMove);
      startDrag(e);
    }
  }

  function startDrag(e) {
    const rect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    shiftX = e.clientX - rect.left;
    shiftY = e.clientY - rect.top;

    // tijdens drag verplaatsen
    function onMouseMoveDrag(ev) {
      let x = ev.clientX - containerRect.left - shiftX;
      let y = ev.clientY - containerRect.top  - shiftY;

      // binnen container houden (optioneel)
      x = Math.max(0, Math.min(x, container.clientWidth  - btn.offsetWidth));
      y = Math.max(0, Math.min(y, container.clientHeight - btn.offsetHeight));

      btn.style.left = x + 'px';
      btn.style.top  = y + 'px';
    }

    // einde drag: opslaan
    function onMouseUpDrag() {
      document.removeEventListener('mousemove', onMouseMoveDrag);

      fetch('TafelOpslaan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actie: 'verplaatsen',
          nummer: btn.textContent,
          left: Math.round(parseFloat(btn.style.left) || 0),
          top:  Math.round(parseFloat(btn.style.top)  || 0)
        })
      }).catch(console.error);
    }

    document.addEventListener('mousemove', onMouseMoveDrag);
    document.addEventListener('mouseup', onMouseUpDrag, { once: true });
  }

  // muisklik loslaten zonder slepen ⇒ open formulier
  function onMouseUpNoDrag() {
    document.removeEventListener('mousemove', detectMove);
    if (!moved) openFormulier(btn.textContent);
  }

  btn.addEventListener('mousedown', onMouseDown);

  // rechterklik = verwijderen blijft ongewijzigd
  btn.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    if (confirm('Tafel verwijderen?')) {
      btn.remove();
      fetch('TafelOpslaan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actie: 'verwijderen', nummer: btn.textContent })
      });
    }
  });
}





    // Rechterklik = tafel verwijderen
    btn.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        if (confirm('Tafel verwijderen?')) {
            btn.remove();
            fetch('TafelOpslaan.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    actie: 'verwijderen',
                    nummer: btn.textContent
                })
            });
        }
    });


// Initialiseer bewerkformulier bij laden
fetch('bewerkFormulier.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('formulierContainer').innerHTML = html;
    });

// Functies voor reserveringsbeheer
function noShowReservering(id, tafelNummer) {
    if (confirm('No Show markeren?')) {
        fetch(`NoShowReservering.php?id=${id}`, { method: 'POST' })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    alert('Gemarkeerd als No Show');
                    openFormulier(tafelNummer);
                }
            });
    }
}

function bewerkReservering(id) {
    const res = huidigeReserveringen.find(r => r.id == id);
    if (!res) return alert("Niet gevonden");
    document.getElementById('editId').value = res.id;
    document.getElementById('editNaam').value = res.naam;
    document.getElementById('editDatum').value = res.datum;
    document.getElementById('editTijd').value = res.tijd;
    document.getElementById('editPersonen').value = res.personen;
    document.getElementById('bewerkFormulier').style.display = 'flex';
}

function sluitBewerkFormulier() {
    document.getElementById('bewerkFormulier').style.display = 'none';
}

function verwijderReservering(id, tafelNummer) {
    if (confirm('Weet je zeker dat je wilt verwijderen?')) {
        fetch(`VerwijderReservering.php?id=${id}`, { method: 'POST' })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    alert('Verwijderd!');
                    openFormulier(tafelNummer);
                }
            });
    }
}

// Bewerken opslaan
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('editForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const naam = document.getElementById('editNaam').value;
        const datum = document.getElementById('editDatum').value;
        const tijd = document.getElementById('editTijd').value;
        const personen = document.getElementById('editPersonen').value;

        fetch('BewerkReserveringen.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, naam, datum, tijd, personen })
        })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    alert('Bijgewerkt!');
                    sluitBewerkFormulier();
                    openFormulier(document.getElementById("tafel").value);
                }
            });
    });

    // Tafels ophalen
    fetch('TafelsOphalen.php')
        .then(res => res.json())
        .then(tafels => {
            const container = document.querySelector('.plattegrond-container');
            tafels.forEach(t => {
                const btn = document.createElement('button');
                btn.className = 'tafel';
                btn.textContent = t.nummer;
                btn.style.left = t.left_px + 'px';
                btn.style.top = t.top_px + 'px';
                container.appendChild(btn);
                maakTafelDraggable(btn);
            });
        })
        .catch(err => console.error("Fout bij laden tafels:", err));
});

// Exporteer functies
window.bewerkReservering = bewerkReservering;
window.sluitBewerkFormulier = sluitBewerkFormulier;
window.verwijderReservering = verwijderReservering;
window.noShowReservering = noShowReservering;
window.openFormulier = openFormulier;
window.tafelToevoegen = tafelToevoegen;
