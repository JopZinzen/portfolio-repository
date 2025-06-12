<!DOCTYPE html>

<head>
    <meta charset="UTF-8">
    <title>Reservering bevestigd</title>
    <link rel="stylesheet" href="Plattegrond.css">
</head>

<body>

<div class="navigatie">
    <a href="HomeET.php"><button>Home</button></a>
    <a href="MenukaartET.php"><button>Menukaart</button></a>
    <a href="OveronsET.html"><button>Over ons</button></a>
</div>

</html>

<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
if (!isset($_SESSION['klant_email'])) {
    // Niet ingelogd, stuur terug naar de loginpagina
    header('Location: LoginKlant.html');
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


$naam = $_POST['naam'] ?? '';
$datum = $_POST['datum'] ?? '';
$tijd = $_POST['tijd'] ?? '';
$personen = $_POST['personen'] ?? '';
$tafel = $_POST['tafel'] ?? '';

if ($naam && $datum && $tijd && $personen && $tafel) {
   $email = $_SESSION['klant_email'] ?? '';

$sql = "INSERT INTO reserveringen (naam, datum, tijd, personen, tafel, email) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssiss", $naam, $datum, $tijd, $personen, $tafel, $email);

    if ($stmt->execute()) {
        echo "<h2>✅ Reservering opgeslagen!</h2>";
        echo "<p>Naam: $naam<br>Datum: $datum<br>Tijd: $tijd<br>Personen: $personen<br>Tafel: $tafel</p>";
    } else {
        echo "Fout bij opslaan: " . $stmt->error;
    }

    $stmt->close();
} else {
    echo "<p>❌ Niet alle gegevens zijn ingevuld.</p>";
}

$conn->close();
?>