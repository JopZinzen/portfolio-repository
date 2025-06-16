<?php
session_start();
if (!isset($_SESSION['klant_email'])) {
    header('Location: loginklant.html');
    exit;
}
?>


<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <title>Menu - Excellent Taste</title>
    <link rel="stylesheet" href="Klant.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>

<div class="background">
    <div class="navigatie">
        <a href="HomeET.html">Home</a>
        <a href="Reserveren.php">Reserveren</a>
        <a href="OveronsET.html">Over ons</a>
        <a href="BestelGeschiedenis.html">Bestelgeschiedenis</a>
    </div>

    <div class="menu-container">
        <div class="tabs">
            <button class="tab active" onclick="toonCategorie('voorgerecht')">Voorgerecht</button>
            <button class="tab" onclick="toonCategorie('hoofdgerecht')">Hoofdgerecht</button>
            <button class="tab" onclick="toonCategorie('dessert')">Dessert</button>
            <button class="tab" onclick="toonCategorie('koudedrank')">Koude dranken</button>
            <button class="tab" onclick="toonCategorie('warmedrank')">Warme dranken</button>
        </div>

        <div id="menuItems" class="menu-grid"></div>
    </div>
</div>

<script src="MenuKlant.js"></script>
</body>
</html>













