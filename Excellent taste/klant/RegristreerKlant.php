<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');

$naam = $_POST['naam'] ?? '';
$email = $_POST['email'] ?? '';
$wachtwoord = $_POST['wachtwoord'] ?? '';

if ($naam && $email && $wachtwoord) {
    // Controleer of het e-mailadres al bestaat
    $stmt = $mysqli->prepare("SELECT id FROM klanten WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        echo "Dit e-mailadres is al geregistreerd. <a href='LoginKlant.html'>Inloggen</a>";
    } else {
        // Hash het wachtwoord veilig
        $wachtwoord_hash = password_hash($wachtwoord, PASSWORD_DEFAULT);
        $stmt = $mysqli->prepare("INSERT INTO klanten (naam, email, wachtwoord) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $naam, $email, $wachtwoord_hash);
        if ($stmt->execute()) {
            echo "Registratie gelukt! <a href='LoginKlant.html'>Log nu in</a>";
        } else {
            echo "Registratie mislukt. Probeer opnieuw.";
        }
    }
} else {
    echo "Vul alle velden in.";
}
?>