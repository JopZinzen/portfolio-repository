<?php
header('Content-Type: application/json; charset=UTF-8');
$data = json_decode(file_get_contents('php://input'), true);
$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');

if (isset($data['menu_id'], $data['aantal'])) {
    $stmt = $mysqli->prepare("INSERT INTO bestellingen (menu_id, aantal, besteld_op) VALUES (?, ?, NOW())");
    $stmt->bind_param("ii", $data['menu_id'], $data['aantal']);
    $stmt->execute();
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false]);
}
?>