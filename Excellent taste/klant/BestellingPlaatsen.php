<?php
session_start();
$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');

$data = json_decode(file_get_contents('php://input'), true);
$email = $_SESSION['klant_email'] ?? '';

file_put_contents('debug.txt', $email . PHP_EOL, FILE_APPEND);
if (isset($data['menu_id'], $data['aantal']) && $email) {
    $stmt = $mysqli->prepare("INSERT INTO bestellingen (menu_id, aantal, besteld_op, klant_email) VALUES (?, ?, NOW(), ?)");
    $stmt->bind_param("iis", $data['menu_id'], $data['aantal'], $email);
    $stmt->execute();
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
?>