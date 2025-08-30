<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'localhost'; // Host name
$dbname = 'educationalplatform'; // Database name
$username = 'root'; // Database username
$password = ''; // Database password (empty for XAMPP's default)

try {
    // Create a PDO connection to the database
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); // Set error mode to exception
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC); // Set default fetch mode to associative array
} catch (PDOException $e) {
    // Log the error but don't display it to the user
    error_log("Connection failed: " . $e->getMessage());
    // Return a JSON error response
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit();
}
?>
