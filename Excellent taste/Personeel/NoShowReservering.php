<?php
header('Content-Type: application/json');
$id = $_GET['id'] ?? null;
if (!$id) {
    echo json_encode(['success' => false, 'error' => 'Geen ID opgegeven']);
    exit;
}
$host = "localhost";
$db = "personeellogin";
$user = "root";
$pass = "";
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'DB fout']);
    exit;
}
// Haal reservering op
$res = $conn->query("SELECT * FROM reserveringen WHERE id = $id")->fetch_assoc();
if (!$res) {
    echo json_encode(['success' => false, 'error' => 'Niet gevonden']);
    exit;
}
// Voeg toe aan no_show tabel
$stmt = $conn->prepare("INSERT INTO no_show (naam, datum, tijd, personen, tafel) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssii", $res['naam'], $res['datum'], $res['tijd'], $res['personen'], $res['tafel']);
$success = $stmt->execute();

if ($success) {
    // Verwijder uit reserveringen
    $conn->query("DELETE FROM reserveringen WHERE id = $id");
}

echo json_encode(['success' => $success]);
$conn->close();
?>