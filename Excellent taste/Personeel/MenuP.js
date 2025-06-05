function fetchMenu() {
    fetch('MenuP.php')
        .then(res => res.json())
        .then(items => {
            const tbody = document.querySelector('#menuTable tbody');
            tbody.innerHTML = '';
            items.forEach(item => {
                tbody.innerHTML += `
                    <tr data-id="${item.id}">
                        <td><input type="text" value="${item.naam}" class="edit-name"></td>
                        <td><input type="text" value="${item.beschrijving}" class="edit-description"></td>
                        <td><input type="text" value="${item.prijs}" class="edit-price"></td>
                        <td>
                            <button onclick="updateItem(${item.id})">Update</button>
                            <button onclick="deleteItem(${item.id})">Verwijder</button>
                        </td>
                    </tr>`;
            });
        });
}

document.getElementById('addForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const naam = document.getElementById('name').value;
    const beschrijving = document.getElementById('description').value;
    const prijsInput = document.getElementById('price').value.replace(',', '.');
    const prijs = parseFloat(prijsInput);

    fetch('MenuP.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam, beschrijving, prijs })
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            document.getElementById('name').value = '';
            document.getElementById('description').value = '';
            document.getElementById('price').value = '';
            location.reload(); // of fetchMenu();
        } else {
            alert('Toevoegen mislukt!');
        }
    });
});

window.updateItem = function(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const prijsInput = row.querySelector('.edit-price').value.replace(',', '.');
    const prijs = parseFloat(prijsInput);

    fetch('MenuP.php', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            id,
            naam: row.querySelector('.edit-name').value,
            beschrijving: row.querySelector('.edit-description').value,
            prijs: prijs
        })
    }).then(fetchMenu);
};

       window.deleteItem = function(id) {
    fetch('MenuP.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    }).then(fetchMenu);
};

fetchMenu();