<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

// ✅ Lees input slechts één keer
$raw = file_get_contents("php://input");


$data = json_decode($raw, true);
if (!$data) {
    echo json_encode(['success' => false, 'error' => 'JSON decode mislukt']);
    exit;
}

$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');
if (!isset($data['nummer']) || !is_numeric($data['nummer'])) {
    echo json_encode(['success' => false, 'error' => 'Nummer is ongeldig']);
    exit;
}
$actie = $data['actie'] ?? '';

if ($actie === 'toevoegen') {
    $stmt = $mysqli->prepare("INSERT INTO tafels (nummer, left_px, top_px) VALUES (?, ?, ?)");
    $stmt->bind_param("iii", $data['nummer'], $data['left'], $data['top']);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}

if ($actie === 'verplaatsen') {
    $stmt = $mysqli->prepare("UPDATE tafels SET left_px = ?, top_px = ? WHERE nummer = ?");
    $stmt->bind_param("iii", $data['left'], $data['top'], $data['nummer']);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}

if ($actie === 'verwijderen') {
    $stmt = $mysqli->prepare("DELETE FROM tafels WHERE nummer = ?");
    $stmt->bind_param("i", $data['nummer']);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Ongeldige actie']);