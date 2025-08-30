<?php
// Set headers for JSON response
header('Content-Type: application/json');
error_reporting(0); // Disable error reporting for production

require_once 'config.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'getAll':
            $stmt = $pdo->query("SELECT * FROM users");
            $users = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $users]);
            break;

        case 'getById':
            $userId = $_GET['userId'] ?? 0;
            $stmt = $pdo->prepare("SELECT * FROM users WHERE UserID = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            echo json_encode(['success' => true, 'data' => $user]);
            break;

        case 'add':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                throw new Exception('Invalid input data');
            }
            $stmt = $pdo->prepare("INSERT INTO users (Username, Email, Password, Role) VALUES (?, ?, ?, ?)");
            $stmt->execute([$data['username'], $data['email'], password_hash($data['password'], PASSWORD_DEFAULT), $data['role']]);
            echo json_encode(['success' => true, 'message' => 'User added successfully']);
            break;

        case 'update':
            $userId = $_GET['userId'] ?? 0;
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                throw new Exception('Invalid input data');
            }
            $stmt = $pdo->prepare("UPDATE users SET Username = ?, Email = ?, Role = ? WHERE UserID = ?");
            $stmt->execute([$data['username'], $data['email'], $data['role'], $userId]);
            echo json_encode(['success' => true, 'message' => 'User updated successfully']);
            break;

        case 'delete':
            $userId = $_GET['userId'] ?? 0;
            $stmt = $pdo->prepare("DELETE FROM users WHERE UserID = ?");
            $stmt->execute([$userId]);
            echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>