<?php
header('Content-Type: application/json');

$id = $_GET['id'] ?? null;
if (!$id) {
    echo json_encode(['success' => false, 'error' => 'Geen ID opgegeven']);
    exit;
}

$host = "localhost";
$db = "PersoneelLogin";
$user = "root";
$pass = "";
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'DB fout']);
    exit;
}

$stmt = $conn->prepare("DELETE FROM reserveringen WHERE id = ?");
$stmt->bind_param("i", $id);
$success = $stmt->execute();
echo json_encode(['success' => $success]);
$conn->close();
?>