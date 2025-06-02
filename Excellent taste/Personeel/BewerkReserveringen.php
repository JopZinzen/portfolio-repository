<?php
ini_set('display_errors', 0);
error_reporting(0);

header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['id'])) {
    echo json_encode(['success' => false, 'error' => 'Geen data of ID']);
    exit;
}

$host = "localhost";
$db = "PersoneelLogin";
$user = "root";
$pass = "";
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(['success' => false]);
    exit;
}

$stmt = $conn->prepare("UPDATE reserveringen SET naam=?, datum=?, tijd=?, personen=? WHERE id=?");
$stmt->bind_param("sssii", $data['naam'], $data['datum'], $data['tijd'], $data['personen'], $data['id']);
$success = $stmt->execute();
echo json_encode(['success' => $success]);
$conn->close();
?>