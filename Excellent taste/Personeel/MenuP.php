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

// ✅ 4. PUT: item bijwerken (strikt + feedback)
if ($method === 'PUT') {
    $mysqli->set_charset('utf8mb4');

    // Lees JSON-body
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?: [];

    $naam = trim($data['naam'] ?? '');
    $beschrijving = trim($data['beschrijving'] ?? '');
    $categorie = trim($data['categorie'] ?? '');
    $prijs = isset($data['prijs']) ? (float)$data['prijs'] : null;
    $id = isset($data['id']) ? (int)$data['id'] : 0;

    if ($id <= 0 || $naam === '' || $categorie === '' || $prijs === null || $prijs < 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Ongeldige invoer',
            'received' => $data
        ]);
        exit;
    }

    $stmt = $mysqli->prepare("UPDATE menu_items SET naam=?, beschrijving=?, prijs=?, categorie=? WHERE id=?");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $mysqli->error]);
        exit;
    }
    $stmt->bind_param("ssdsi", $naam, $beschrijving, $prijs, $categorie, $id);
    $ok = $stmt->execute();

    if (!$ok) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $stmt->error]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'updated' => $stmt->affected_rows, // 0 = exact dezelfde data of id niet gevonden
        'received' => ['id'=>$id,'naam'=>$naam,'prijs'=>$prijs,'categorie'=>$categorie]
    ]);
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