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
    btn.onmousedown = function (e) {
        if (e.button !== 0) return;
        let startX = e.clientX;
        let startY = e.clientY;
        let verplaatst = false;

        function onMouseMove(e) {
            const dx = Math.abs(e.clientX - startX);
            const dy = Math.abs(e.clientY - startY);
            if (dx > 3 || dy > 3) {
                verplaatst = true;
                beginSlepen(e);
                document.removeEventListener('mousemove', onMouseMove);
            }
        }

        function beginSlepen(e) {
            const rect = btn.getBoundingClientRect();
const shiftX = e.clientX - rect.left;
const shiftY = e.clientY - rect.top;

            function moveAt(x, y) {
                btn.style.left = x - shiftX + 'px';
                btn.style.top = y - shiftY + 'px';
            }

            function onMouseMoveDrag(e) {
                moveAt(e.pageX, e.pageY);
            }

            document.addEventListener('mousemove', onMouseMoveDrag);

            document.onmouseup = function () {
                document.removeEventListener('mousemove', onMouseMoveDrag);
                document.onmouseup = null;

                // Positie opslaan
                fetch('TafelOpslaan.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        actie: 'verplaatsen',
                        nummer: btn.textContent,
                        left: parseInt(btn.style.left),
                        top: parseInt(btn.style.top)
                    })
                });
            };
        }

        document.addEventListener('mousemove', onMouseMove);

        document.onmouseup = function () {
            document.removeEventListener('mousemove', onMouseMove);
            document.onmouseup = null;
            if (!verplaatst) openFormulier(btn.textContent);
        };
    };

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
}

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
