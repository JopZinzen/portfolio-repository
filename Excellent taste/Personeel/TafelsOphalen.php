<?php
header('Content-Type: application/json');
$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');
$result = $mysqli->query("SELECT nummer, left_px, top_px FROM plattegrond_tafels");
$tafels = [];
while ($row = $result->fetch_assoc()) {
    $tafels[] = $row;
}
echo json_encode($tafels);
?>