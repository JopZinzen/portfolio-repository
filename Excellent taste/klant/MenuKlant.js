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
                        </tr>`;
                });
            });
    });