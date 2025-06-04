let huidigeReserveringen = [];
let isDragging = false;

function openFormulier(tafelNummer) {
    document.getElementById('tafelnummer').textContent = "Tafel " + tafelNummer;
    document.getElementById('reserveringsformulier').style.display = 'block';
    document.getElementById("tafel").value = tafelNummer;

    fetch(`TafelReserveringen.php?table=${tafelNummer}`)
        .then(response => response.json())
        .then(data => {
            huidigeReserveringen = data; 
            // Sort reservations by date
            data.sort((a, b) => {
                const dateA = new Date(`${a.datum}T${a.tijd}`);
                const dateB = new Date(`${b.datum}T${b.tijd}`);
                return dateA - dateB;
            });

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

function tafelToevoegen() {
    
    const plattegrond = document.querySelector('.plattegrond-container');
    const nieuwNummer = document.querySelectorAll('.tafel').length + 1;
    const btn = document.createElement('button');
    btn.className = 'tafel';
    btn.style.position = 'absolute';
    btn.style.left = '100px';
    btn.style.top = '100px';
    btn.textContent = nieuwNummer;
    btn.setAttribute('onclick', `openFormulier(${nieuwNummer})`);
    plattegrond.appendChild(btn);

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
    maakTafelDraggable(btn);

    btn.addEventListener('contextmenu', function(e) {
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
   
};


// Maak een tafel draggable


function maakTafelDraggable(btn) {
    btn.onmousedown = function(e) {
        e.preventDefault();
        if (e.button !== 0) return; // alleen slepen met linkermuisknop

        let shiftX = e.clientX - btn.getBoundingClientRect().left;
        let shiftY = e.clientY - btn.getBoundingClientRect().top;

        function moveAt(pageX, pageY) {
            btn.style.left = pageX - shiftX + 'px';
            btn.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(e) {
            isDragging = true;
            moveAt(e.pageX, e.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            btn.onmouseup = null;
            setTimeout(() => { isDragging = false; }, 0);
            // Sla nieuwe positie op:
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
        }

        document.addEventListener('mouseup', onMouseUp);
    };
    btn.ondragstart = () => false;
}




// Pas draggable en verwijderbaar toe op ALLE bestaande tafels (eenmalig)
document.querySelectorAll('.tafel').forEach(btn => {
    maakTafelDraggable(btn);
    btn.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        if (!isDragging && confirm('Tafel verwijderen?')) {
            btn.remove(fetch('TafelOpslaan.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        actie: 'verwijderen',
        nummer: btn.textContent
    })
            }));
            // Hier kun je evt. een AJAX-call doen om de wijziging op te slaan
        }
    });
});


fetch('bewerkFormulier.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('formulierContainer').innerHTML = html;
});

function noShowReservering(id, tafelNummer) {
    if (confirm('Wil je deze reservering als No Show markeren?')) {
        fetch(`NoShowReservering.php?id=${id}`, { method: 'POST' })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Reservering toegevoegd aan No Show lijst!');
                    openFormulier(tafelNummer);
                } else {
                    alert('Toevoegen aan No Show lijst mislukt.');
                }
            });
    }
}
window.noShowReservering = noShowReservering;


function bewerkReservering(id) {
    const res = huidigeReserveringen.find(r => r.id == id);
    if (!res) return alert("Reservering niet gevonden!");

    document.getElementById('editId').value = res.id;
    document.getElementById('editNaam').value = res.naam;
    document.getElementById('editDatum').value = res.datum;
    document.getElementById('editTijd').value = res.tijd;
    document.getElementById('editPersonen').value = res.personen;
    document.getElementById('bewerkFormulier').style.display = 'block';
}

function sluitBewerkFormulier() {
    document.getElementById('bewerkFormulier').style.display = 'none';
}
window.sluitBewerkFormulier = sluitBewerkFormulier;

function verwijderReservering(id, tafelNummer) {
    if (confirm('Weet je zeker dat je deze reservering wilt verwijderen?')) {
        fetch(`VerwijderReservering.php?id=${id}`, { method: 'POST' })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('Reservering verwijderd!');
                    openFormulier(tafelNummer); 
                } else {
                    alert('Verwijderen mislukt.');
                }
            });
    }
}

document.getElementById('editForm').addEventListener('submit', function(e) {
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
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Reservering bijgewerkt!');
            sluitBewerkFormulier();
            openFormulier(document.getElementById("tafel").value);
        } else {
            alert('Bijwerken mislukt.');
        }
    });
});

function bewerkReservering(id) {
    const res = huidigeReserveringen.find(r => r.id == id);
    if (!res) return alert("Reservering niet gevonden!");

    document.getElementById('editId').value = res.id;
    document.getElementById('editNaam').value = res.naam;
    document.getElementById('editDatum').value = res.datum;
    document.getElementById('editTijd').value = res.tijd;
    document.getElementById('editPersonen').value = res.personen;
    document.getElementById('bewerkFormulier').style.display = 'flex'; // Let op: 'flex'!
}

function sluitBewerkFormulier() {
    document.getElementById('bewerkFormulier').style.display = 'none';
}

window.addEventListener('DOMContentLoaded', function() {
    fetch('TafelsOphalen.php')
        .then(res => res.json())
        .then(tafels => {
            const plattegrond = document.querySelector('.plattegrond-container');
            tafels.forEach(t => {
                const btn = document.createElement('button');
                btn.className = 'tafel';
                btn.style.position = 'absolute';
                btn.style.left = t.left_px + 'px';
                btn.style.top = t.top_px + 'px';
                btn.textContent = t.nummer;
                btn.setAttribute('onclick', `openFormulier(${t.nummer})`);
                plattegrond.appendChild(btn);
                maakTafelDraggable(btn);
                btn.addEventListener('contextmenu', function(e) {
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
            });
        });
});

window.sluitBewerkFormulier = sluitBewerkFormulier;
window.bewerkReservering = bewerkReservering;
window.verwijderReservering = verwijderReservering;

