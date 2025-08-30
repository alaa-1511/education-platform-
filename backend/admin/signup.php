<?php
// Set headers first to ensure proper content type
header('Content-Type: application/json');

// Include config file with error handling
try {
    include('config.php');
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Database configuration error"
    ]);
    exit();
}

// Get and validate JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => "Invalid JSON input"
    ]);
    exit();
}

// Extract data with null coalescing operator
$username = $data['username'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$role = $data['role'] ?? 'Student';
$section_id = $data['section_id'] ?? null;
$academic_year = $data['academic_year'] ?? null;

// Validate required fields
if (empty($username) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => "All fields are required"
    ]);
    exit();
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => "Invalid email format"
    ]);
    exit();
}

try {
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT UserID FROM Users WHERE Email = ? OR Username = ?");
    $stmt->execute([$email, $username]);
    
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            "status" => "error", 
            "message" => "Username or email already exists"
        ]);
        exit();
    }

    // Validate section if provided
    if ($section_id) {
        $stmt = $pdo->prepare("SELECT SectionID FROM Sections WHERE SectionID = ?");
        $stmt->execute([$section_id]);
        
        if (!$stmt->fetch()) {
            http_response_code(400);
            echo json_encode([
                "status" => "error", 
                "message" => "Invalid section ID"
            ]);
            exit();
        }
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $pdo->prepare("
        INSERT INTO Users 
        (Username, Password, Email, Role, SectionID, AcademicYear, CreatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $success = $stmt->execute([
        $username,
        $hashedPassword,
        $email,
        $role,
        $section_id,
        $academic_year
    ]);

    if ($success) {
        echo json_encode([
            "status" => "success", 
            "message" => "User registered successfully",
            "user" => [
                "username" => $username,
                "email" => $email,
                "role" => $role
            ]
        ]);
    } else {
        throw new Exception("Failed to register user");
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => $e->getMessage()
    ]);
}
?>