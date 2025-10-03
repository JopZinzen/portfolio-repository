<?php
session_start();
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Check login
if (!isset($_SESSION['klant_email'])) {
    header('Location: LoginKlant.html');
    exit;
}

$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');
if ($mysqli->connect_error) {
    die("Verbinding mislukt: " . $mysqli->connect_error);
}
$mysqli->set_charset('utf8mb4');

$success = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Input ophalen
    $naam      = trim($_POST['naam'] ?? '');
    $datum     = $_POST['datum'] ?? '';      // verwacht YYYY-MM-DD
    $tijd      = $_POST['tijd'] ?? '';       // verwacht HH:MM
    $personen  = (int)($_POST['personen'] ?? 0);
    $tafel     = trim($_POST['tafel'] ?? '');
    // LET OP: kolom heet bewust 'klant_emial' in jouw DB
    $klant_emial = $_SESSION['klant_email'] ?? '';

    // Basisvalidatie
    if ($naam && $datum && $tijd && $personen > 0 && $tafel && $klant_emial) {
        // Zorg dat tijd 'HH:MM:SS' wordt
        if (preg_match('/^\d{2}:\d{2}$/', $tijd)) {
            $tijd .= ':00';
        }

        // 1) Check op dubbele reservering: zelfde datum+tijd+tafel niet twee keer
        $chk = $mysqli->prepare("
            SELECT id FROM reserveringen
            WHERE datum = ? AND tijd = ? AND tafel = ? 
            LIMIT 1
        ");
        $chk->bind_param('sss', $datum, $tijd, $tafel);
        $chk->execute();
        $dup = $chk->get_result()->fetch_assoc();
        $chk->close();

        if ($dup) {
            $error = "❌ Deze tafel is al gereserveerd op $datum om $tijd.";
        } else {
            // 2) Insert reservering (let op kolomnaam klant_emial)
            $stmt = $mysqli->prepare("
                INSERT INTO reserveringen
                (naam, datum, tijd, personen, tafel, klant_email)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            // types: s s s i s s
            $stmt->bind_param("sssiss", $naam, $datum, $tijd, $personen, $tafel, $klant_emial);

            if ($stmt->execute()) {
                $success = true;
            } else {
                $error = "❌ Fout bij opslaan: " . $stmt->error;
            }
            $stmt->close();
        }
    } else {
        $error = "❌ Niet alle gegevens zijn ingevuld.";
    }
}
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <title>Reserveren</title>
    <link rel="stylesheet" href="Klant.css">    
</head>
<body>
<div class="background">
    <div class="navigatie">
        <a href="HomeET.html"><button>Home</button></a>
        <a href="MenukaartET.php"><button>Menukaart</button></a>
        <a href="OveronsET.html"><button>Over ons</button></a>
    </div>

    <div class="plattegrond-container"></div>

    <div id="reserveringsformulier">
        <h2>Reservering voor tafel <span id="tafelnummer-form"></span></h2>
        <form method="post" onsubmit="return checktafel()">
            <input type="hidden" id="tafel" name="tafel">
            <label>Naam:</label>
            <input type="text" name="naam" required>
            <label>Datum:</label>
            <input type="date" name="datum" required>
            <label>Tijd:</label>
            <input type="time" name="tijd" required>
            <label>Aantal personen:</label>
            <input type="number" name="personen" min="1" max="10" required>
            <button type="submit">Reserveer</button>
        </form>
    </div>

    <div class="bevestiging" style="text-align:center;">
        <?php if ($success): ?>
            <h2>✅ Reservering opgeslagen!</h2>
            <p>Bedankt voor je reservering.</p>
        <?php elseif ($error): ?>
            <p style="color: red;"><?= htmlspecialchars($error) ?></p>
        <?php endif; ?>
    </div>
</div>
<script>
// Tafels renderen vanaf personeel-endpoint (met left_px/top_px)
window.addEventListener('DOMContentLoaded', function () {
    fetch('../Personeel/TafelsOphalen.php') // pad aanpassen indien nodig
        .then(res => res.json())
        .then(tafels => {
            const container = document.querySelector('.plattegrond-container');
            tafels.forEach(t => {
                const btn = document.createElement('button');
                btn.className = 'tafel';
                btn.textContent = t.nummer;
                btn.style.left = (t.left_px || 0) + 'px';
                btn.style.top  = (t.top_px  || 0) + 'px';
                btn.onclick = function () { openFormulier(t.nummer); };
                container.appendChild(btn);
            });
        })
        .catch(err => console.error('Tafels ophalen mislukt:', err));
});

function openFormulier(tafelNummer) {
    document.getElementById('tafelnummer-form').textContent = tafelNummer;
    document.getElementById('reserveringsformulier').style.display = 'flex';
    document.getElementById("tafel").value = tafelNummer;
}

function checktafel() {
    var tafel = document.getElementById("tafel").value;
    if (!tafel) {
        alert("Selecteer een tafel voordat je reserveert.");
        return false;
    }
    return true;
}
</script>
</body>
</html>
