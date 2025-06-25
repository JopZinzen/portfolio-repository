<?php
// Database instellingen
$host = "localhost";
$db = "PersoneelLogin";
$user = "root";
$pass = "";

// Verbind met database
$conn = new mysqli($host, $user, $pass, $db);

// Foutmelding bij mislukte verbinding
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Controleer of het een POST-verzoek is
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Veilig ophalen van invoer
    $username = $conn->real_escape_string($_POST['username']);
    $password = $_POST['password'];

    // Zoek gebruiker in database
    $sql = "SELECT password FROM users WHERE username = '$username'";
    $result = $conn->query($sql);

    // Als gebruiker bestaat
    if ($result && $result->num_rows === 1) {
        $row = $result->fetch_assoc();

        // Controleer wachtwoord (hashed)
        if (password_verify($password, $row['password'])) {
            session_start();
            $_SESSION['username'] = $username;

            // Stuur 'success' terug aan JavaScript
            echo "success";
        } else {
            echo "Invalid username or password.";
        }
    } else {
        echo "Invalid username or password.";
    }
}

// Verbreek de verbinding
$conn->close();
?>