<?php
$dagWachtwoord = 'excellent' . date('Ymd');
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bestelling Wachtwoord</title>
</head>
<body>
    <h2>wachtwoord voor vandaag</h2>
    <p style="font-size:1.5em; font-weight:bold; color:darkblue;">
        <?php echo htmlspecialchars($dagWachtwoord); ?>
    </p>
</body>
</html>