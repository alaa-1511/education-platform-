<?php
include('config.php');
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session
session_start();

// Check if user is logged in and is a student
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Student') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access']);
    exit();
}

try {
    // Get course ID from POST data
    $course_id = $_POST['course_id'] ?? null;
    if (!$course_id) {
        throw new Exception('Course ID is required');
    }

    // Get student ID from session
    $student_id = $_SESSION['user_id'];

    // Check if student is already enrolled
    $checkStmt = $conn->prepare("SELECT 1 FROM enrollments WHERE StudentID = ? AND CourseID = ?");
    $checkStmt->execute([$student_id, $course_id]);
    if ($checkStmt->fetch()) {
        throw new Exception('You are already enrolled in this course');
    }

    // Get course details to get section and academic year
    $courseStmt = $conn->prepare("SELECT SectionID, AcademicYear FROM courses WHERE CourseID = ?");
    $courseStmt->execute([$course_id]);
    $course = $courseStmt->fetch(PDO::FETCH_ASSOC);

    if (!$course) {
        throw new Exception('Course not found');
    }

    // Enroll student
    $enrollStmt = $conn->prepare("INSERT INTO enrollments (StudentID, CourseID, SectionID, AcademicYear) VALUES (?, ?, ?, ?)");
    $enrollStmt->execute([
        $student_id,
        $course_id,
        $course['SectionID'],
        $course['AcademicYear']
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Successfully enrolled in the course']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?> 