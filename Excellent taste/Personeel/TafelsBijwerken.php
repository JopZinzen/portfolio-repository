<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');


$raw = file_get_contents('php://input');
$data = json_decode($raw, true);


if (!is_array($data)) {
    echo json_encode(['success' => false, 'error' => 'Ongeldige JSON ontvangen', 'debug_raw' => $raw]);
    exit;
}

$success = true;

foreach ($data as $tafel) {
    if (!isset($tafel['id'], $tafel['left_px'], $tafel['top_px'])) {
        echo json_encode(['success' => false, 'error' => 'Ongeldige tafelgegevens']);
        exit;
    }

    $stmt = $mysqli->prepare("UPDATE tafels SET left_px = ?, top_px = ? WHERE id = ?");
    $stmt->bind_param("iii", $tafel['left_px'], $tafel['top_px'], $tafel['id']);
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
        exit;
    }
    $stmt->close();
}

echo json_encode(['success' => true]);