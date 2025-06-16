<?php
session_start();
echo isset($_SESSION['klant_email']) ? 'true' : 'false';
?>