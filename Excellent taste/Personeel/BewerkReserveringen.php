<?php
header('Content-Type: application/json');

// JSON of URL-encoded accepteren
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data) {
  // fallback voor x-www-form-urlencoded
  $data = $_POST ?? [];
}

$id       = isset($data['id']) ? (int)$data['id'] : 0;
$naam     = $data['naam']     ?? null;
$datum    = $data['datum']    ?? null;
$tijd     = $data['tijd']     ?? null;
$personen = isset($data['personen']) ? (int)$data['personen'] : null;

if ($id <= 0) {
  echo json_encode(['success' => false, 'error' => 'Geen data of ID']); exit;
}

$host = "localhost";
$db   = "personeellogin"; // <-- let op: exact zoals je DB heet
$user = "root";
$pass = "";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
  echo json_encode(['success' => false, 'error' => 'DB connectie mislukt']); exit;
}
$conn->set_charset('utf8mb4');

// Basisvalidatie (optioneel: stricter maken)
if ($naam !== null)     $naam = trim($naam);
if ($datum !== null)    $datum = trim($datum);
if ($tijd !== null)     $tijd = trim($tijd);

// Alleen velden updaten die meegestuurd zijn
$fields = [];
$params = [];
$types  = "";

if ($naam !== null)     { $fields[] = "naam=?";     $params[] = $naam;     $types .= "s"; }
if ($datum !== null)    { $fields[] = "datum=?";    $params[] = $datum;    $types .= "s"; }
if ($tijd !== null)     { $fields[] = "tijd=?";     $params[] = $tijd;     $types .= "s"; }
if ($personen !== null) { $fields[] = "personen=?"; $params[] = $personen; $types .= "i"; }

if (empty($fields)) {
  echo json_encode(['success'=>false,'error'=>'Geen velden om op te slaan']); exit;
}

$sql = "UPDATE reserveringen SET ".implode(", ", $fields)." WHERE id=?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
  echo json_encode(['success'=>false,'error'=>'Query voorbereiden mislukt']); exit;
}

$types .= "i";
$params[] = $id;

// variadisch binden
$stmt->bind_param($types, ...$params);
$ok = $stmt->execute();

echo json_encode(['success' => (bool)$ok, 'affected' => $stmt->affected_rows]);
$stmt->close();
$conn->close();
