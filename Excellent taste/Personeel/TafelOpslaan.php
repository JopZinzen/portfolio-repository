<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$data = json_decode(file_get_contents('php://input'), true);
$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');

if (is_array($data) && isset($data['actie'])) {
    if ($data['actie'] === 'toevoegen') {
        $stmt = $mysqli->prepare("INSERT INTO plattegrond_tafels (nummer, left_px, top_px) VALUES (?, ?, ?)");
        $stmt->bind_param("iii", $data['nummer'], $data['left'], $data['top']);
        $stmt->execute();
    }
    if ($data['actie'] === 'verwijderen') {
        $stmt = $mysqli->prepare("DELETE FROM plattegrond_tafels WHERE nummer = ?");
        $stmt->bind_param("i", $data['nummer']);
        $stmt->execute();
    }
    if ($data['actie'] === 'verplaatsen') {
        $stmt = $mysqli->prepare("UPDATE plattegrond_tafels SET left_px = ?, top_px = ? WHERE nummer = ?");
        $stmt->bind_param("iii", $data['left'], $data['top'], $data['nummer']);
        $stmt->execute();
    }
}
echo json_encode(['success' => true]);
?>