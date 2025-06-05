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

window.addEventListener('DOMContentLoaded', function() {
    fetch('../Personeel/TafelsOphalen.php')
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
                btn.onclick = function() { openFormulier(t.nummer); };
                plattegrond.appendChild(btn);
            });
        });
});

document.addEventListener('mousedown', function(e) {
    const formulier = document.getElementById('reserveringsformulier');
    if (
        formulier.style.display !== 'none' &&
        !formulier.contains(e.target)
    ) {
        formulier.style.display = 'none';
    }
});

window.openFormulier = openFormulier;