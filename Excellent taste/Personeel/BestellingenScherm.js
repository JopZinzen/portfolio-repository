fetch('BestellingenKeuken.php')
  .then(res => res.json())
  .then(bestellingen => {
    const tbody = document.getElementById('etenTbody');
    tbody.innerHTML = '';
    bestellingen.forEach(b => {
      tbody.innerHTML += `
        <tr>
          <td>${b.id}</td>
          <td>${b.naam}</td>
          <td>${b.beschrijving}</td>
          <td>€${Number(b.prijs).toFixed(2)}</td>
          <td>${b.aantal}</td>
          <td>${b.besteld_op}</td>
        </tr>`;
    });
  });

fetch('BestellingenBar.php')
  .then(res => res.json())
  .then(bestellingen => {
    const tbody = document.getElementById('drinkenTbody');
    tbody.innerHTML = '';
    bestellingen.forEach(b => {
      tbody.innerHTML += `
        <tr>
          <td>${b.id}</td>
          <td>${b.naam}</td>
          <td>${b.beschrijving}</td>
          <td>€${Number(b.prijs).toFixed(2)}</td>
          <td>${b.aantal}</td>
          <td>${b.besteld_op}</td>
        </tr>`;
    });
  });