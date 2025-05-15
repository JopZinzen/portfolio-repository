function openFormulier(tafelNummer) {
    document.getElementById('tafelnummer').textContent = "Tafel " + tafelNummer;
    document.getElementById('reserveringsformulier').style.display = 'block';
  }