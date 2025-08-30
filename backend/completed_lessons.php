<?php
// completed_lessons.php
include('config.php');
session_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to JSON
header('Content-Type: application/json');

$user_id = $_SESSION['user_id'] ?? null;
$role = $_SESSION['role'] ?? null;

if (!$user_id || $role !== 'Student') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

try {
    // استرجاع عدد الكورسات المسجل فيها الطالب
    // Since we don't have a lessonprogress table, we'll count enrolled courses instead
    $stmt = $conn->prepare("SELECT COUNT(*) AS completed_lessons 
                            FROM enrollments 
                            WHERE StudentID = :user_id");
    $stmt->execute(['user_id' => $user_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'completed_lessons' => $result['completed_lessons']]);
} catch (PDOException $e) {
    // Log the error but don't display it to the user
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Database error occurred']);
}
?>