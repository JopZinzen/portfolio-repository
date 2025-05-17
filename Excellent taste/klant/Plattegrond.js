function openFormulier(tafelNummer) {
    document.getElementById('tafelnummer').textContent = "Tafel " + tafelNummer;
    document.getElementById('reserveringsformulier').style.display = 'block';
    document.getElementById("tafel").value = tafelNummer; 
}

function checktafel() {
    var tafel = document.getElementById("tafel").value;
    if (!tafel) {
        alert("Selecteer een tafel voordat je reserveert.");
        return false;
    }
    return true;
}