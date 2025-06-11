<?php
$mysqli = new mysqli('localhost', 'root', '', 'PersoneelLogin');

// Zoek reserveringen van morgen
$morgen = date('Y-m-d', strtotime('+1 day'));
$result = $mysqli->query("SELECT naam, email, datum, tijd FROM reserveringen WHERE datum = '$morgen'");

while ($row = $result->fetch_assoc()) {
    $to = $row['email'];
    $subject = "Herinnering: uw reservering bij Excellent Taste";
    $message = "Beste {$row['naam']},\n\nDit is een herinnering voor uw reservering op {$row['datum']} om {$row['tijd']} bij Excellent Taste.\n\nTot morgen!";
    $headers = "From: noreply@excellenttaste.nl\r\n";
    mail($to, $subject, $message, $headers);
}
?>