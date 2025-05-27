<?php
$tafel = $_GET['table'] ?? null;

if (!$tafel) {
    echo "<p>Geen tafel opgegeven.</p>";
    exit;
}

$host = "localhost";
$db = "PersoneelLogin";	
$user = "root";
$pass = "";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Verbinding mislukt: " . $conn->connect_error);
}

$sql = "SELECT naam, datum, tijd, personen 
        FROM reserveringen 
        WHERE tafel = ? 
        ORDER BY datum ASC, tijd ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $tafel);
$stmt->execute();
$result = $stmt->get_result();

$reservations = [];
while ($row = $result->fetch_assoc()) {
    $reservations[] = $row;
}

header('Content-Type: application/json');
echo json_encode($reservations);

$conn->close();
?>