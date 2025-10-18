<?php
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', '0');

function respond($arr) {
  echo json_encode($arr, JSON_UNESCAPED_UNICODE);
  exit;
}

// === Input uitlezen ===
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Fallbacks voor niet-JSON clients
if (!is_array($data)) {
  parse_str($raw ?? '', $data);
  if (!is_array($data) || !$data) $data = $_POST;
}
if (!is_array($data)) {
  respond(['success' => false, 'error' => 'Geen geldige JSON ontvangen', 'debug_raw' => $raw]);
}

// === Waarden ophalen ===
$type = isset($data['type']) ? trim((string)$data['type']) : 'rond';
$left = isset($data['x']) ? (int)$data['x'] : 20;
$top  = isset($data['y']) ? (int)$data['y'] : 20;
$nummer_in = isset($data['nummer']) && $data['nummer'] !== '' ? (int)$data['nummer'] : null;

try {
  // === Databaseverbinding ===
  $pdo = new PDO('mysql:host=localhost;dbname=personeellogin;charset=utf8mb4', 'root', '');
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  // === Automatisch tafelnummer bepalen (start bij 1) ===
  if ($nummer_in === null || $nummer_in < 1) {
    $mx = $pdo->query("SELECT COALESCE(MAX(CAST(nummer AS UNSIGNED)), 0) AS mx FROM tafels")->fetch(PDO::FETCH_ASSOC);
    $nummer = ((int)$mx['mx']) + 1;
  } else {
    $nummer = $nummer_in;
  }

  // === Insert uitvoeren ===
  $stmt = $pdo->prepare("INSERT INTO tafels (nummer, left_px, top_px) VALUES (?, ?, ?)");

  // Kleine retry bij duplicate key
  $tries = 0;
  while (true) {
    try {
      $stmt->execute([$nummer, $left, $top]);
      break;
    } catch (PDOException $e) {
      if ($e->errorInfo[1] == 1062 && $tries < 5) {
        $nummer++;
        $tries++;
        continue;
      }
      throw $e;
    }
  }

  $newId = (int)$pdo->lastInsertId();

  respond([
    'success' => true,
    'id'      => $newId,
    'nummer'  => $nummer,
    'left_px' => $left,
    'top_px'  => $top
  ]);

} catch (Throwable $e) {
  respond(['success' => false, 'error' => $e->getMessage()]);
}
