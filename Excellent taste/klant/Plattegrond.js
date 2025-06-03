function openFormulier(tafelNummer) {
     console.log("openFormulier aangeroepen met:", tafelNummer);
    document.getElementById('tafelnummer-form').textContent = tafelNummer;
    document.getElementById('reserveringsformulier').style.display = 'flex';
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

window.openFormulier = openFormulier;