<?php
$host = "localhost";
$db = "PersoneelLogin";
$user = "root";
$pass = "";


$conn = new mysqli($host, $user, $pass, $db);


if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $conn->real_escape_string($_POST['username']);
    $password = $_POST['password'];

    
    $sql = "SELECT password FROM users WHERE username = '$username'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows == 1) {
        $row = $result->fetch_assoc();
        // If you store hashed passwords, use password_verify()
        if (password_verify($password, $row['password'])) {
            // Login success
            echo "Login successful!";
            // Redirect or start session here
            // session_start();
            // $_SESSION['username'] = $username;
            // header("Location: dashboard.php");
            // exit();
        } else {
            echo "Invalid username or password.";
        }
    } else {
        echo "Invalid username or password.";
    }
}
$conn->close();
?>