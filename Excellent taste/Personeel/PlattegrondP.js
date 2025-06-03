let huidigeReserveringen = [];

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
window.sluitBewerkFormulier = sluitBewerkFormulier;

window.bewerkReservering = bewerkReservering;
window.verwijderReservering = verwijderReservering;

