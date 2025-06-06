window.addEventListener('DOMContentLoaded', function() {
    fetch('BestellingenOphalen.php')
        .then(res => res.json())
        .then(bestellingen => {
            console.log(bestellingen);
            const etenTbody = document.querySelector('#etenTbody');
            const drinkenTbody = document.querySelector('#drinkenTbody');
            etenTbody.innerHTML = '';
            drinkenTbody.innerHTML = '';
            bestellingen.forEach(b => {
                const row = `
                    <tr>
                        <td>${b.id}</td>
                        <td>${b.naam}</td>
                        <td>${b.beschrijving}</td>
                        <td>€${Number(b.prijs).toFixed(2)}</td>
                        <td>${b.aantal}</td>
                        <td>${b.besteld_op}</td>
                    </tr>`;
                if (b.categorie === 'drinken') {
                    drinkenTbody.innerHTML += row;
                } else {
                    etenTbody.innerHTML += row;
                }
            });
        });
});
window.updateItem = function(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    // ...bestaande code...
    const categorie = row.querySelector('.edit-categorie').value;

    fetch('MenuP.php', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            id,
            naam: row.querySelector('.edit-name').value,
            beschrijving: row.querySelector('.edit-description').value,
            prijs: prijs,
            categorie: categorie
        })
    }).then(fetchMenu);
};