<?php
$host = "localhost";
$db = "PersoneelLogin";
$user = "root";
$pass = "";
$conn = new mysqli($host, $user, $pass, $db);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_id'])) {
    $id = intval($_POST['delete_id']);
    $conn->query("DELETE FROM no_show WHERE id = $id");
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['restore_id'])) {
    $id = intval($_POST['restore_id']);
    $res = $conn->query("SELECT * FROM no_show WHERE id = $id")->fetch_assoc();
    if ($res) {
        $stmt = $conn->prepare("INSERT INTO reserveringen (naam, datum, tijd, personen, tafel) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssii", $res['naam'], $res['datum'], $res['tijd'], $res['personen'], $res['tafel']);
        $stmt->execute();
        $conn->query("DELETE FROM no_show WHERE id = $id");
    }
}

$result = $conn->query("SELECT * FROM no_show ORDER BY datum DESC, tijd DESC");
echo "<h2>No Show Lijst</h2><ul>";
while ($row = $result->fetch_assoc()) {
    echo "<li>
        {$row['datum']} {$row['tijd']} - {$row['naam']} ({$row['personen']} personen, tafel {$row['tafel']})
        <form method='post' style='display:inline'>
            <input type='hidden' name='delete_id' value='{$row['id']}'>
            <button type='submit'>Verwijder uit No Show</button>
        </form>
        <form method='post' style='display:inline'>
            <input type='hidden' name='restore_id' value='{$row['id']}'>
            <button type='submit'>Terug naar Reserveringen</button>
        </form>
    </li>";
}

echo "</ul>";
$conn->close();
?>

<Doctype html>

<head>
    <link rel="stylesheet" href="NoShow.css">
    <meta charset="UTF-8">
    <title>No-Show</title>
</head>

<a href="reserveringen.html">
    <button type="button">Terug naar Reserveringen</button>
</a>