fetch('../klant/BestelGeschiedenis.php')
  .then(res => res.json())
  .then(bestellingen => {
    // Toon een melding als er geen bestellingen zijn, maar stuur NIET door
    const tbody = document.getElementById('bestelTbody');
    tbody.innerHTML = '';
    if (bestellingen.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Geen bestellingen gevonden.</td></tr>';
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
        </tr>`;
    });
  });
  console.log(bestellingen);

