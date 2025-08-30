<?php
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
    // استرجاع الامتحانات مع التحقق من تسجيل الطالب في الدورة
    $stmt = $conn->prepare("SELECT e.ExamID, e.ExamName AS ExamTitle, c.CourseName, 
                           e.CreatedAt AS ExamCreateDate, e.Duration,
                           IFNULL(er.Score, -1) AS Score
                           FROM exams e
                           INNER JOIN courses c ON e.CourseID = c.CourseID
                           INNER JOIN enrollments en ON c.CourseID = en.CourseID AND en.StudentID = :user_id
                           LEFT JOIN examresults er ON e.ExamID = er.ExamID AND er.StudentID = :user_id
                           WHERE en.StudentID = :user_id");
    $stmt->execute(['user_id' => $user_id]);
    $exams = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'exams' => $exams]);
} catch (PDOException $e) {
    // Log the error but don't display it to the user
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Database error occurred']);
}
?>