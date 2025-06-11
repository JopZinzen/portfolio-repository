fetch('../klant/BestelGeschiedenis.php')
  .then(res => res.json())
  .then(bestellingen => {
    const tbody = document.getElementById('bestelTbody');
    tbody.innerHTML = '';
    if (bestellingen.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">Geen bestellingen gevonden.</td></tr>';
      return;
    }
    bestellingen.forEach(b => {
      tbody.innerHTML += `
        <tr>
          <td>${b.naam}</td>
          <td>${b.beschrijving}</td>
          <td>€${Number(b.prijs).toFixed(2)}</td>
          <td>${b.aantal}</td>
          <td>${b.besteld_op}</td>
          <td>
            <button onclick="herhaalBestelling(${b.menu_id}, ${b.aantal})">Bestel opnieuw</button>
          </td>
        </tr>`;
    });
  });

window.herhaalBestelling = function(menu_id, aantal) {
    fetch('BestellingPlaatsen.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu_id: menu_id, aantal: aantal })
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            alert('Bestelling opnieuw geplaatst!');
        } else {
            alert('Opnieuw bestellen mislukt!');
        }
    });
};