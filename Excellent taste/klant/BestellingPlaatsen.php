<?php
session_start();
$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');

$data = json_decode(file_get_contents('php://input'), true);
$email = $_SESSION['klant_email'] ?? '';
$tafel = $_SESSION['tafel'] ?? ($data['tafel'] ?? null);

// Genereer het dag-wachtwoord
$dagWachtwoord = 'excellent' . date('Ymd');

if (
    isset($data['menu_id'], $data['aantal'], $data['wachtwoord']) &&
    $email &&
    $data['wachtwoord'] === $dagWachtwoord
) {
    $stmt = $mysqli->prepare("INSERT INTO bestellingen (menu_id, aantal, besteld_op, klant_email, tafel) VALUES (?, ?, NOW(), ?, ?)");
    $stmt->bind_param("siss", $data['menu_id'], $data['aantal'], $email, $tafel);
    $stmt->execute();
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Wachtwoord ongeldig of ontbreekt']);
}
?>