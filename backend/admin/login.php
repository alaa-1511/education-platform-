<?php
// Set headers first to ensure proper content type
header('Content-Type: application/json');

// Include config file with error handling
try {
    include('config.php');
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database configuration error"]);
    exit();
}

// Start the session
session_start();

// Read JSON data from the request body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
    exit();
}

// Get data from the decoded JSON
$email = $data['username'] ?? '';
$password = $data['password'] ?? ''; 

// Validate input
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email and password are required"]);
    exit();
}

try {
    // Check if the user exists in the database
    $stmt = $pdo->prepare("SELECT * FROM Users WHERE Email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // If the user doesn't exist
    if (!$user) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
        exit();
    }

    // Verify password
    if (!password_verify($password, $user['Password'])) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid email or password"]);
        exit();
    }

    // Successful login
    $_SESSION['user_id'] = $user['UserID'];
    $_SESSION['username'] = $user['Email'];
    $_SESSION['role'] = $user['Role'];
    $_SESSION['auth_token'] = bin2hex(random_bytes(32));

    echo json_encode([
        "status" => "success", 
        "message" => "Login successful",
        "user_id" => $user['UserID'],
        "role" => $user['Role'],
        "auth_token" => $_SESSION['auth_token']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>