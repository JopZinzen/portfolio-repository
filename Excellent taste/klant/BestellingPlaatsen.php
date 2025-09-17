<?php
session_start();
error_reporting(E_ALL); ini_set('display_errors',1);

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$mysqli = new mysqli('localhost','root','','PersoneelLogin');
$mysqli->set_charset('utf8mb4');

// ---- Body lezen (JSON of form) ----
$data = $_POST;
if (empty($data)) {
  $raw = file_get_contents('php://input');
  $j = json_decode($raw, true);
  if (is_array($j)) $data = $j;
}

if (empty($_SESSION['klant_email'])) {
  http_response_code(401);
  echo json_encode(['success'=>false,'error'=>'Niet ingelogd']); exit;
}
$klant_email = $_SESSION['klant_email'];

// ---- Wachtwoord bepalen ----
// 1) uit tabel, als aanwezig
$codeRow = null;
try {
  $codeRow = $mysqli->query("SELECT code FROM bestel_wachtwoord WHERE id=1")->fetch_assoc();
} catch (\Throwable $e) { /* tabel kan ontbreken: val terug op default */ }
// 2) fallback: excellentYYYYMMDD
$expectedCode = $codeRow['code'] ?? ('excellent' . date('Dmy'));
date_default_timezone_set('Europe/Amsterdam'); // belangrijk voor date('Ymd')

$codeRow = null;
try { $codeRow = $mysqli->query("SELECT code FROM bestel_wachtwoord WHERE id=1")->fetch_assoc(); } catch (\Throwable $e) {}
$expectedCode = $codeRow['code'] ?? ('excellent' . date('Ymd'));

$wachtwoord = trim((string)($data['wachtwoord'] ?? ''));

// TEMP: laat zien wat de server verwacht, als het fout gaat
if ($wachtwoord === '' || !hash_equals($expectedCode, $wachtwoord)) {
  http_response_code(403);
  echo json_encode([
    'success' => false,
    'error'   => 'Wachtwoord ongeldig',
    'expected'=> $expectedCode,        // ← tijdelijk
    'received'=> $wachtwoord           // ← tijdelijk
  ]);
  exit;
}
$wachtwoord = trim($data['wachtwoord'] ?? '');
if ($wachtwoord === '' || !hash_equals($expectedCode, $wachtwoord)) {
  http_response_code(403);
  echo json_encode(['success'=>false,'error'=>'Wachtwoord ongeldig']); exit;
}

// ---- Items normaliseren (nieuw of oud formaat) ----
$items = $data['items'] ?? null;
if (!$items && isset($data['menu_id'], $data['aantal'])) {
  $items = [[ 'menu_id' => (int)$data['menu_id'], 'aantal' => (int)$data['aantal'] ]];
}
if (!$items || !is_array($items)) {
  http_response_code(400);
  echo json_encode(['success'=>false,'error'=>'Ongeldige invoer: geen items']); exit;
}

// ---- Tafel bepalen: meegestuurd, sessie, of uit reserveringen (vandaag) ----
$tafel = trim($data['tafel'] ?? ($_SESSION['tafel'] ?? ''));
if ($tafel === '') {
  // Probeer reservering van vandaag op te zoeken voor deze klant
  // verwacht kolommen: reserveringen(klant_email, datum, tijd, tafel)
  $stmt = $mysqli->prepare("
    SELECT tafel
    FROM reserveringen
    WHERE klant_email = ?
      AND datum = CURDATE()
    ORDER BY tijd ASC
    LIMIT 1
  ");
  $stmt->bind_param("s", $klant_email);
  $stmt->execute();
  $res = $stmt->get_result();
  if ($row = $res->fetch_assoc()) {
    $tafel = $row['tafel'];
    $_SESSION['tafel'] = $tafel; // zet hem meteen voor volgende bestellingen
  }
}
if ($tafel === '') {
  http_response_code(403);
  echo json_encode(['success'=>false,'error'=>'Er is geen (geldige) reservering voor vandaag gevonden']); exit;
}

// ---- Valideer en schrijf elk item weg in je bestaande `bestellingen` tabel ----
// Verwacht kolommen: bestellingen(menu_id INT, aantal INT, besteld_op DATETIME, klant_email VARCHAR, tafel VARCHAR)
$ins = $mysqli->prepare("
  INSERT INTO bestellingen (menu_id, aantal, besteld_op, klant_email, tafel)
  VALUES (?, ?, NOW(), ?, ?)
");

// Optioneel: menu valideren en prijs ophalen
$check = $mysqli->prepare("SELECT id FROM menu_items WHERE id=?");

$inserted = 0;
foreach ($items as $it) {
  $menu_id = (int)($it['menu_id'] ?? 0);
  $aantal  = (int)($it['aantal']  ?? 0);
  if ($menu_id <= 0 || $aantal <= 0) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'Ongeldige invoer: menu_id/aantal']); exit;
  }

  // menu check
  $check->bind_param("i", $menu_id);
  $check->execute();
  if (!$check->get_result()->fetch_assoc()) {
    http_response_code(404);
    echo json_encode(['success'=>false,'error'=>"Menu-item $menu_id niet gevonden"]); exit;
  }

  $ins->bind_param("iiss", $menu_id, $aantal, $klant_email, $tafel);
  $ins->execute();
  $inserted++;
}

echo json_encode(['success'=>true, 'count'=>$inserted, 'tafel'=>$tafel]);
