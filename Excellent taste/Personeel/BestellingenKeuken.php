<?php
// filepath: c:\xampp\htdocs\htdocs\Excellent taste\Personeel\BestellingenKeuken.php
header('Content-Type: application/json; charset=UTF-8');
$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');
$result = $mysqli->query(
    "SELECT b.id, b.menu_id, b.aantal, b.besteld_op, b.tafel, m.naam, m.beschrijving, m.prijs, m.categorie
     FROM bestellingen b
     JOIN menu_items m ON b.menu_id = m.id
     WHERE m.categorie = 'eten'
     ORDER BY b.besteld_op DESC"
);
$bestellingen = [];
while ($row = $result->fetch_assoc()) $bestellingen[] = $row;
echo json_encode($bestellingen);
?>