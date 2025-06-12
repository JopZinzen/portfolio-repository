  window.addEventListener('DOMContentLoaded', function() {
    fetch('../Personeel/MenuP.php')
        .then(res => res.json())
        .then(items => {
            const tbody = document.querySelector('#menuTable tbody');
            tbody.innerHTML = '';
            items.forEach(item => {
            tbody.innerHTML += `
             <tr>
                <td>${item.naam}</td>
                <td>${item.beschrijving}</td>
                <td>€${Number(item.prijs).toFixed(2)}</td>
                <td>
                <button onclick="bestelItem(${item.id}, '${item.naam.replace(/'/g, "\\'")}')">Bestel</button>
                </td>
             </tr>`;
            });
        });
});

window.bestelItem = function(id, naam) {
    const aantal = prompt(`Hoeveel van "${naam}" wilt u bestellen?`, 1);
    if (!aantal || isNaN(aantal) || aantal < 1) return;
    const wachtwoord = prompt("Voer het dag-wachtwoord in om te bestellen:");
    if (!wachtwoord) return;

    fetch('BestellingPlaatsen.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu_id: id, aantal: Number(aantal), wachtwoord: wachtwoord })
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            alert('Bestelling geplaatst!');
        } else {
            alert('Bestellen mislukt! ' + (result.error || ''));
        }
    });
};