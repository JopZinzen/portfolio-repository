<?php
header('Content-Type: application/json; charset=UTF-8');
header('Content-Type: application/json');
$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $mysqli->query("SELECT * FROM menu_items");
    $items = [];
    while ($row = $result->fetch_assoc()) $items[] = $row;
    echo json_encode($items);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $stmt = $mysqli->prepare("INSERT INTO menu_items (naam, beschrijving, prijs) VALUES (?, ?, ?)");
    $stmt->bind_param("ssd", $data['naam'], $data['beschrijving'], $data['prijs']);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'PUT') {
    $stmt = $mysqli->prepare("UPDATE menu_items SET naam=?, beschrijving=?, prijs=? WHERE id=?");
    $stmt->bind_param("ssdi", $data['naam'], $data['beschrijving'], $data['prijs'], $data['id']);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}

if ($method === 'DELETE') {
    $id = $data['id'];
    $stmt = $mysqli->prepare("DELETE FROM menu_items WHERE id=?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}
?>