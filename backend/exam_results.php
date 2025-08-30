<?php
// exam_results.php
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
    // استرجاع نتائج الامتحانات مع اسم الكورس
    $stmt = $conn->prepare("SELECT users.Username AS student_name, exams.ExamName AS exam_name, courses.CourseName AS course_name, examresults.Score AS score, 'exam' AS type
                            FROM examresults
                            INNER JOIN exams ON examresults.ExamID = exams.ExamID
                            INNER JOIN courses ON exams.CourseID = courses.CourseID
                            INNER JOIN users ON examresults.StudentID = users.UserID
                            WHERE examresults.StudentID = :user_id");
    $stmt->execute(['user_id' => $user_id]);
    $exam_results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // استرجاع نتائج الكويزات مع اسم الكورس
    $stmt = $conn->prepare("SELECT users.Username AS student_name, quizzes.QuizName AS quiz_name, courses.CourseName AS course_name, quizresults.Score AS score, 'quiz' AS type
                            FROM quizresults
                            INNER JOIN quizzes ON quizresults.QuizID = quizzes.QuizID
                            INNER JOIN lessons ON quizzes.LessonID = lessons.LessonID
                            INNER JOIN courses ON lessons.CourseID = courses.CourseID
                            INNER JOIN users ON quizresults.StudentID = users.UserID
                            WHERE quizresults.StudentID = :user_id");
    $stmt->execute(['user_id' => $user_id]);
    $quiz_results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // دمج نتائج الامتحانات والكويزات معًا
    $all_results = array_merge($exam_results, $quiz_results);

    // ترتيب النتائج حسب الاسم
    usort($all_results, function($a, $b) {
        return strcmp($a['course_name'], $b['course_name']);
    });

    echo json_encode(['status' => 'success', 'all_results' => $all_results]);
} catch (PDOException $e) {
    // Log the error but don't display it to the user
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Database error occurred']);
}
?>
