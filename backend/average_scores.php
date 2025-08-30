<?php
// average_scores.php
include('config.php');
session_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

$user_id = $_SESSION['user_id'] ?? null;
$role = $_SESSION['role'] ?? null;

if (!$user_id || $role !== 'Student') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

// استرجاع أعلى درجة في الاختبارات والامتحانات
$stmt = $conn->prepare("
    SELECT MAX(Score) AS highest_score 
    FROM (
        SELECT Score FROM quizresults WHERE StudentID = :user_id
        UNION ALL
        SELECT Score FROM examresults WHERE StudentID = :user_id
    ) AS combined_scores");
$stmt->execute(['user_id' => $user_id]);
$highest_result = $stmt->fetch(PDO::FETCH_ASSOC);
$highest_score = $highest_result['highest_score'];

// حساب عدد التكرارات لأعلى درجة
$stmt = $conn->prepare("
    SELECT COUNT(*) AS count 
    FROM (
        SELECT Score FROM quizresults WHERE StudentID = :user_id AND Score = :highest_score
        UNION ALL
        SELECT Score FROM examresults WHERE StudentID = :user_id AND Score = :highest_score
    ) AS combined_scores");
$stmt->execute(['user_id' => $user_id, 'highest_score' => $highest_score]);
$highest_score_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

// العودة بالنتيجة
echo json_encode([
    'status' => 'success',
    'highest_score' => $highest_score,
    'highest_score_count' => $highest_score_count
]);
?>
