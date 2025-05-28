   function fetchMenu() {
            fetch('MenuP.php')
                .then(res => res.json())
                .then(items => {
                    const tbody = document.querySelector('#menuTable tbody');
                    tbody.innerHTML = '';
                    items.forEach(item => {
                        tbody.innerHTML += `
                            <tr data-id="${item.id}">
                                <td><input type="text" value="${item.name}" class="edit-name"></td>
                                <td><input type="text" value="${item.description}" class="edit-description"></td>
                                <td><input type="number" value="${item.price}" class="edit-price" step="0.01"></td>
                                <td>
                                    <button onclick="updateItem(${item.id})">Update</button>
                                    <button onclick="deleteItem(${item.id})">Verwijder</button>
                                </td>
                            </tr>`;
                    });
                });
        }

        document.getElementById('addForm').onsubmit = function(e) {
            e.preventDefault();
            fetch('MenuP.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    description: document.getElementById('description').value,
                    price: parseFloat(document.getElementById('price').value)
                })
            }).then(() => {
                fetchMenu();
                this.reset();
            });
        };

        window.updateItem = function(id) {
            const row = document.querySelector(`tr[data-id="${id}"]`);
            fetch('MenuP.php', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    id,
                    name: row.querySelector('.edit-name').value,
                    description: row.querySelector('.edit-description').value,
                    price: parseFloat(row.querySelector('.edit-price').value)
                })
            }).then(fetchMenu);
        };

        window.deleteItem = function(id) {
            fetch('MenuP.php', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: `id=${id}`
            }).then(fetchMenu);
        };

        fetchMenu();