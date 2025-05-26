function openFormulier(tafelNummer) {
    document.getElementById('tafelnummer').textContent = "Tafel " + tafelNummer;
    document.getElementById('reserveringsformulier').style.display = 'block';
    document.getElementById("tafel").value = tafelNummer;

    // Laad reserveringen overzicht
    fetch("reserveringen_tafel.php?tafel=" + tafelNummer)
        .then(response => response.text())
        .then(data => {
            document.getElementById("reserveringenOverzicht").innerHTML = data;
        });
}