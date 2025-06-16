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

$tafels = [];

// Verwerking reservering
$success = false;
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $naam = $_POST['naam'] ?? '';
    $datum = $_POST['datum'] ?? '';
    $tijd = $_POST['tijd'] ?? '';
    $personen = $_POST['personen'] ?? '';
    $tafel = $_POST['tafel'] ?? '';
    $email = $_SESSION['klant_email'] ?? '';

    if ($naam && $datum && $tijd && $personen && $tafel) {
        $stmt = $mysqli->prepare("INSERT INTO reserveringen (naam, datum, tijd, personen, tafel, email) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssiss", $naam, $datum, $tijd, $personen, $tafel, $email);
        if ($stmt->execute()) {
            $success = true;
        } else {
            $error = "❌ Fout bij opslaan: " . $stmt->error;
        }
        $stmt->close();
    } else {
        $error = "❌ Niet alle gegevens zijn ingevuld.";
    }
}

// Tafels ophalen
$result = $mysqli->query("SELECT id, nummer, left_px, top_px FROM tafels");
while ($row = $result->fetch_assoc()) {
    $tafels[] = $row;
}
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <title>Reserveren</title>
    <link rel="stylesheet" href="Klant.css">
    <style>
      
    </style>
</head>
<script>
window.addEventListener('DOMContentLoaded', function () {
    fetch('../Personeel/TafelsOphalen.php') // pad aanpassen indien nodig
        .then(res => res.json())
        .then(tafels => {
            const container = document.querySelector('.plattegrond-container');
            tafels.forEach(t => {
                const btn = document.createElement('button');
                btn.className = 'tafel';
                btn.textContent = t.nummer;
                btn.style.left = t.left_px + 'px';
                btn.style.top = t.top_px + 'px';
                btn.onclick = function () {
                    openFormulier(t.nummer);
                };
                container.appendChild(btn);
            });
        })
        .catch(err => console.error('Tafels ophalen mislukt:', err));
});
</script>
<body>

<div class="navigatie">
    <a href="HomeET.php"><button>Home</button></a>
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

<div class="bevestiging">
    <?php if ($success): ?>
        <h2>✅ Reservering opgeslagen!</h2>
        <p>Bedankt voor je reservering.</p>
    <?php elseif ($error): ?>
        <p style="color: red;"><?= $error ?></p>
    <?php endif; ?>
</div>

<script>
function openFormulier(tafelNummer) {
    document.getElementById('tafelnummer-form').textContent = tafelNummer;
    document.getElementById('reserveringsformulier').style.display = 'flex';
    document.getElementById("tafel").value = tafelNummer;
    btn.onclick = () => alert('Tafel ' + t.nummer + ' aangeklikt!');
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
<script src="Plattegrond.js"></script>
</body>
</html>