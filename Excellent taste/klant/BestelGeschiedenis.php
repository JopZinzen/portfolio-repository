<?php
session_start();
header('Content-Type: application/json; charset=UTF-8');
$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');

$email = $_SESSION['klant_email'] ?? '';

if ($email) {
    $stmt = $mysqli->prepare(
        "SELECT b.id, b.menu_id, b.aantal, b.besteld_op, m.naam, m.beschrijving, m.prijs, m.categorie
         FROM bestellingen b
         JOIN menu_items m ON b.menu_id = m.id
         WHERE b.klant_email = ?
         ORDER BY b.besteld_op DESC"
    );
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $bestellingen = [];
    while ($row = $result->fetch_assoc()) $bestellingen[] = $row;
    echo json_encode($bestellingen);
} else {
    // Niet ingelogd: geef een lege lijst terug
    echo json_encode([]);
}
?>