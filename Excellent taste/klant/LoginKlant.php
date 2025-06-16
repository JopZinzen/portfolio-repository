<?php
session_start();
$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');

$email = $_POST['email'] ?? '';
$wachtwoord = $_POST['wachtwoord'] ?? '';

$stmt = $mysqli->prepare("SELECT id, wachtwoord FROM klanten WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if (password_verify($wachtwoord, $row['wachtwoord'])) {
        $_SESSION['klant_email'] = $email;
        header('Location: Reserveren.php'); // of waar je naartoe wilt
        exit;
    }
}

echo "Inloggen mislukt. <a href='loginklant.html'>Probeer opnieuw</a>";
?>