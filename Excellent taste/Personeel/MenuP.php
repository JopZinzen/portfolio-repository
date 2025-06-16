<?php
header('Content-Type: application/json; charset=UTF-8');

$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');
$method = $_SERVER['REQUEST_METHOD'];

// ✅ 1. GET: menu ophalen
if ($method === 'GET') {
    $result = $mysqli->query("SELECT * FROM menu_items");
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = [
            'id' => $row['id'],
            'naam' => $row['naam'],
            'beschrijving' => $row['beschrijving'],
            'prijs' => $row['prijs'],
            'categorie' => $row['categorie']
        ];
    }
    echo json_encode($items);
    exit;
}

// ✅ 2. Invoer uitlezen (POST, PUT, DELETE)
$data = $_POST;
if (empty($data)) {
    $data = json_decode(file_get_contents('php://input'), true);
}

// ✅ 3. POST: item toevoegen
if ($method === 'POST') {
    $stmt = $mysqli->prepare("INSERT INTO menu_items (naam, beschrijving, prijs, categorie) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssds", $data['naam'], $data['beschrijving'], $data['prijs'], $data['categorie']);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}

// ✅ 4. PUT: item bijwerken
if ($method === 'PUT') {
    $stmt = $mysqli->prepare("UPDATE menu_items SET naam=?, beschrijving=?, prijs=?, categorie=? WHERE id=?");
    $stmt->bind_param("ssdsi", $data['naam'], $data['beschrijving'], $data['prijs'], $data['categorie'], $data['id']);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}

// ✅ 5. DELETE: item verwijderen
if ($method === 'DELETE') {
    $stmt = $mysqli->prepare("DELETE FROM menu_items WHERE id=?");
    $stmt->bind_param("i", $data['id']);
    $stmt->execute();
    echo json_encode(['success' => true]);
    exit;
}
?>