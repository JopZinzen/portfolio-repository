let dagWachtwoord = '';
let alleItems = [];

window.addEventListener('DOMContentLoaded', () => {
    fetch('../Personeel/MenuP.php')
        .then(res => res.json())
        .then(items => {
            alleItems = items;
            toonCategorie('voorgerecht');
        });
});

function toonCategorie(categorie) {
    document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab[onclick*="${categorie}"]`).classList.add('active');

    const container = document.getElementById('menuItems');
    container.innerHTML = '';

    const gefilterd = alleItems.filter(item => item.categorie === categorie);

    gefilterd.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <h3>${item.naam}</h3>
            <p>${item.beschrijving}</p>
            <strong>€${Number(item.prijs).toFixed(2)}</strong><br>
            <button onclick="bestelItem(${item.id}, '${item.naam.replace(/'/g, "\\'")}')">Bestel</button>
        `;
        container.appendChild(div);
    });
}

window.bestelItem = function(id, naam) {
    fetch('IsIngelogd.php')
      .then(res => res.text())
      .then(isIngelogd => {
        if (isIngelogd !== 'true') {
          window.location.href = 'loginklant.html';
          return;
        }
        const aantal = prompt(`Hoeveel van "${naam}" wilt u bestellen?`, 1);
        if (!aantal || isNaN(aantal) || aantal < 1) return;

        
        if (!dagWachtwoord) {
            dagWachtwoord = prompt("Voer het dag-wachtwoord in om te bestellen:");
            if (!dagWachtwoord) return;
        }

        fetch('BestellingPlaatsen.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menu_id: id, aantal: Number(aantal), wachtwoord: dagWachtwoord })
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                alert('Bestelling geplaatst!');
            } else {
                // Bij fout wachtwoord, reset zodat klant opnieuw kan proberen
                if (result.error && result.error.includes('Wachtwoord')) {
                    dagWachtwoord = '';
                }
                alert('Bestellen mislukt! ' + (result.error || ''));
            }
        });
      });
};