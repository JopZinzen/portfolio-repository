<?php

$host = "localhost";
$db = "PersoneelLogin";
$user = "root";
$pass = "";

$conn = new mysqli($host, $user, $pass, $db);
header('Content-Type: application/json');

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $result = $conn->query("SELECT * FROM menu_items");
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        echo json_encode($items);
        break;
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $conn->prepare("INSERT INTO menu_items (name, description, price) VALUES (?, ?, ?)");
        $stmt->bind_param("ssd", $data['name'], $data['description'], $data['price']);
        $stmt->execute();
        echo json_encode(["id" => $stmt->insert_id]);
        break;
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $conn->prepare("UPDATE menu_items SET name=?, description=?, price=? WHERE id=?");
        $stmt->bind_param("ssdi", $data['name'], $data['description'], $data['price'], $data['id']);
        $stmt->execute();
        echo json_encode(["success" => true]);
        break;
    case 'DELETE':
        parse_str(file_get_contents("php://input"), $data);
        $id = intval($data['id']);
        $conn->query("DELETE FROM menu_items WHERE id=$id");
        echo json_encode(["success" => true]);
        break;
}
$conn->close();
?>