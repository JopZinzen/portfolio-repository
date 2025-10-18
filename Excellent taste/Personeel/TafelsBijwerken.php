<?php
// LET OP: geen BOM of whitespace vóór <?php, file opslaan als UTF-8 (zonder BOM)
header('Content-Type: application/json; charset=utf-8');

function respond($arr) {
  echo json_encode($arr, JSON_UNESCAPED_UNICODE);
  exit;
}

// Raw body lezen en wegschrijven naar log (tijdelijk voor debug)
$raw = file_get_contents('php://input');
@file_put_contents(__DIR__ . '/tafels_debug.log',
  "[".date('c')."] RAW: ". $raw . "\n" .
  "CT: ".($_SERVER['CONTENT_TYPE'] ?? '')."\n" .
  "POST: ".json_encode($_POST)."\n\n",
  FILE_APPEND
);

// Probeer JSON
$data = null;
if ($raw !== '' && $raw !== false) {
  $data = json_decode($raw, true);
}

// Als JSON faalt, probeer form-encoded (fetch zonder JSON of klassiek form)
if (!is_array($data)) {
  if (!empty($_POST)) {
    $data = $_POST;
  } else {
    $parsed = [];
    parse_str($raw ?? '', $parsed);
    if (!empty($parsed)) $data = $parsed;
  }
}

// Nog steeds niets bruikbaars?
if (!is_array($data)) {
  respond(['success' => false, 'error' => 'Ongeldige JSON ontvangen', 'debug_raw' => $raw]);
}

$action = $data['action'] ?? 'update';
$id     = (int)($data['id'] ?? 0);
$x      = isset($data['x']) ? (int)$data['x'] : null;
$y      = isset($data['y']) ? (int)$data['y'] : null;

try {
  // TODO: vervang door jouw DB-credentials
  $pdo = new PDO('mysql:host=localhost;dbname=Personeellogin;charset=utf8mb4', 'root', '');
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  if ($action === 'delete') {
    if ($id <= 0) respond(['success' => false, 'error' => 'Ongeldig id voor delete', 'debug_raw' => $raw]);
    $stmt = $pdo->prepare("DELETE FROM tafels WHERE id = ?");
    $stmt->execute([$id]);
    respond(['success' => true, 'action' => 'delete', 'id' => $id]);
  }

  // default: update
  if ($id <= 0) respond(['success' => false, 'error' => 'Ongeldig id voor update', 'debug_raw' => $raw]);
  if ($x === null || $y === null) respond(['success' => false, 'error' => 'x/y ontbreken', 'debug_raw' => $raw]);

  $stmt = $pdo->prepare("UPDATE tafels SET left_px = ?, top_px = ? WHERE id = ?");
  $ok = $stmt->execute([$x, $y, $id]);

  respond(['success' => (bool)$ok, 'action' => 'update', 'id' => $id, 'x' => $x, 'y' => $y]);
} catch (Throwable $e) {
  respond(['success' => false, 'error' => $e->getMessage(), 'debug_raw' => $raw]);
}
