<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Plattegrond Beheer</title>
    <style>
        .plattegrond-container {
            position: relative;
            width: 1200px;
            height: 600px;
            margin: 20px auto;
            background-color: #f68c4f;
            border: 2px solid #000;
        }

        .tafel {
            position: absolute;
            width: 50px;
            height: 50px;
            background-color: rgb(104, 6, 6);
            color: white;
            border: none;
            border-radius: 50%;
            font-weight: bold;
            cursor: move;
            transform: translate(-50%, -50%);
        }

        .tafel:hover {
            background-color: rgb(131, 8, 8);
        }

        button.add-button {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <button class="add-button" onclick="tafelToevoegen()">➕ Voeg tafel toe</button>
    <div class="plattegrond-container"></div>

    <script>
        function maakTafelDraggable(btn) {
            btn.onmousedown = function(e) {
                e.preventDefault();
                let shiftX = e.clientX - btn.getBoundingClientRect().left;
                let shiftY = e.clientY - btn.getBoundingClientRect().top;

                function moveAt(pageX, pageY) {
                    btn.style.left = pageX - shiftX + 'px';
                    btn.style.top = pageY - shiftY + 'px';
                }

                function onMouseMove(e) {
                    moveAt(e.pageX, e.pageY);
                }

                document.addEventListener('mousemove', onMouseMove);

                document.onmouseup = function() {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.onmouseup = null;

                    fetch('TafelOpslaan.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            actie: 'verplaatsen',
                            nummer: btn.textContent,
                            left: parseInt(btn.style.left),
                            top: parseInt(btn.style.top)
                        })
                    });
                };
            };

            btn.ondragstart = () => false;
        }

        function tafelToevoegen() {
            const container = document.querySelector('.plattegrond-container');
            const nieuwNummer = container.querySelectorAll('.tafel').length + 1;

            const btn = document.createElement('button');
            btn.className = 'tafel';
            btn.textContent = nieuwNummer;
            btn.style.left = '100px';
            btn.style.top = '100px';

            maakTafelDraggable(btn);
            voegContextMenuToe(btn);
            container.appendChild(btn);

            fetch('TafelOpslaan.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    actie: 'toevoegen',
                    nummer: nieuwNummer,
                    left: 100,
                    top: 100
                })
            });
        }

        function voegContextMenuToe(btn) {
            btn.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                if (confirm('Tafel verwijderen?')) {
                    fetch('TafelOpslaan.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            actie: 'verwijderen',
                            nummer: btn.textContent
                        })
                    });
                    btn.remove();
                }
            });
        }

        window.addEventListener('DOMContentLoaded', function() {
            fetch('TafelsOphalen.php')
                .then(res => res.json())
                .then(tafels => {
                    const container = document.querySelector('.plattegrond-container');
                    tafels.forEach(t => {
                        const btn = document.createElement('button');
                        btn.className = 'tafel';
                        btn.textContent = t.nummer;
                        btn.style.left = t.left_px + 'px';
                        btn.style.top = t.top_px + 'px';

                        maakTafelDraggable(btn);
                        voegContextMenuToe(btn);
                        container.appendChild(btn);
                    });
                });
        });
    </script>
</body>
</html>