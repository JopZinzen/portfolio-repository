function openFormulier(tafelNummer) {
    document.getElementById('tafelnummer').textContent = "Tafel " + tafelNummer;
    document.getElementById('reserveringsformulier').style.display = 'block';
    document.getElementById("tafel").value = tafelNummer;

    fetch(`TafelReserveringen.php?table=${tafelNummer}`)
        .then(response => response.json())
 .then(data => {
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
        data.forEach(res => {
            html += `<li>${res.datum} ${res.tijd} - ${res.naam} (${res.personen} personen)</li>`;
        });
        html += `</ul>`;
        overzicht.innerHTML = html;
    }
})}
