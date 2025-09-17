<?php
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$mysqli = new mysqli('localhost','root','','PersoneelLogin');
$mysqli->set_charset('utf8mb4');

$sql = "
SELECT 
  b.menu_id,
  b.aantal,
  b.besteld_op,          -- << deze kolom heb jij
  b.tafel,
  m.naam,
  m.beschrijving,
  m.prijs,
  m.categorie
FROM bestellingen AS b
JOIN menu_items  AS m ON b.menu_id = m.id
WHERE m.categorie IN ('warmedrank','koudedrank')
ORDER BY b.besteld_op DESC
";

$res = $mysqli->query($sql);
$rows = $res->fetch_all(MYSQLI_ASSOC);

// nette types voor de frontend
foreach ($rows as &$r) {
  $r['aantal'] = (int)$r['aantal'];
  if (isset($r['prijs'])) $r['prijs'] = (float)$r['prijs'];
}

echo json_encode($rows);
