<?php
$tafel = $_GET['tafel'] ?? null;

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

echo "<h3>Reserveringen voor tafel $tafel:</h3>";
if ($result->num_rows > 0) {
    echo "<table border='1' cellpadding='6'>
            <tr>
              <th>Naam</th>
              <th>Datum</th>
              <th>Tijd</th>
              <th>Personen</th>
            </tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>
                <td>{$row['naam']}</td>
                <td>{$row['datum']}</td>
                <td>{$row['tijd']}</td>
                <td>{$row['personen']}</td>
              </tr>";
    }
    echo "</table>";
} else {
    echo "<p>Geen reserveringen gevonden.</p>";
}

$stmt->close();
$conn->close();
?>