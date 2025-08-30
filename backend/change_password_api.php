<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$user_id = $_SESSION['user_id'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['currentPassword']) || !isset($data['newPassword'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        exit;
    }
    
    try {
        // التحقق من كلمة المرور الحالية
        $stmt = $pdo->prepare("SELECT Password FROM users WHERE UserID = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();
        
        if (!password_verify($data['currentPassword'], $user['Password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Current password is incorrect']);
            exit;
        }
        
        // تحديث كلمة المرور
        $newPasswordHash = password_hash($data['newPassword'], PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET Password = ? WHERE UserID = ?");
        $stmt->execute([$newPasswordHash, $user_id]);
        
        echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>