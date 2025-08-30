<?php
// enrollments.php
include('config.php');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to JSON
header('Content-Type: application/json');

// التأكد من وجود session
session_start();

// التحقق من وجود المستخدم في الـ session
$user_id = $_SESSION['user_id'] ?? null;
$role = $_SESSION['role'] ?? null;

if (!$user_id || $role !== 'Student') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

try {
    // استرجاع تفاصيل الكورسات المسجلة للطالب مع تضمين صورة الدورة والقسم والسنة الدراسية
    $stmt = $conn->prepare("SELECT 
                                courses.CourseID, 
                                courses.CourseName, 
                                courses.Description, 
                                courses.urlIMG,
                                courses.SectionID,
                                courses.AcademicYear,
                                sections.SectionName,
                                sections.GradeLevel,
                                users.Username AS TeacherName  
                            FROM enrollments 
                            INNER JOIN courses ON enrollments.CourseID = courses.CourseID 
                            INNER JOIN users ON courses.TeacherID = users.UserID  
                            LEFT JOIN sections ON courses.SectionID = sections.SectionID
                            WHERE enrollments.StudentID = :user_id AND users.role = 'teacher'"); 
    $stmt->execute(['user_id' => $user_id]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'courses' => $courses]);
} catch (PDOException $e) {
    // Log the error but don't display it to the user
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Database error occurred']);
}
?>
