<?php
include('config.php');
session_start();

$user_id = $_SESSION['user_id'] ?? null;
$role = $_SESSION['role'] ?? null;
$exam_id = $_GET['exam_id'] ?? null;

if (!$user_id || $role !== 'Student' || !$exam_id) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

// التحقق من أن الطالب مسجل في الدورة ولم يكمل الامتحان بعد
$stmt = $conn->prepare("SELECT e.* FROM exams e
                      INNER JOIN enrollments en ON e.CourseID = en.CourseID
                      WHERE e.ExamID = :exam_id AND en.StudentID = :user_id
                      AND NOT EXISTS (
                          SELECT 1 FROM examresults er 
                          WHERE er.ExamID = e.ExamID AND er.StudentID = :user_id
                      )");
$stmt->execute(['exam_id' => $exam_id, 'user_id' => $user_id]);
$exam = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$exam) {
    echo json_encode(['status' => 'error', 'message' => 'Exam not available']);
    exit();
}

// استرجاع أسئلة الامتحان
$questions_stmt = $conn->prepare("SELECT * FROM examquestions WHERE ExamID = :exam_id");
$questions_stmt->execute(['exam_id' => $exam_id]);
$questions = $questions_stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($questions as &$question) {
    $answers_stmt = $conn->prepare("SELECT * FROM examanswers WHERE QuestionID = :question_id");
    $answers_stmt->execute(['question_id' => $question['QuestionID']]);
    $question['answers'] = $answers_stmt->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode([
    'status' => 'success',
    'exam' => $exam,
    'questions' => $questions
]);
?>