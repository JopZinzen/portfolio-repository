<?php
session_start();
if (!isset($_SESSION['klant_email'])) {
    header('Location: loginklant.html');
    exit;
}
?>


<!doctype html>

<head>
    <title>Menu</title>
    <a href="HomeET.html"> <button> Home </button> </a>
    <a href="ReserverenET.html"> <button>Reserveren</button> </a> 
    <a href="OveronsET.html"> <button> Over ons </button> </a>
    <meta charset="UTF-8">
</head>

<body>
    <h2>Menu</h2>
    <table id="menuTable">
        <thead>
            <tr><th>Naam</th><th>Beschrijving</th><th>Prijs</th></tr>
        </thead>
        <tbody></tbody>
        <a href="BestelGeschiedenis.html">
    <button>Mijn Bestelgeschiedenis</button>
</a>
    </table>
    <script src="MenuKlant.js"></script>
</body>













</html>