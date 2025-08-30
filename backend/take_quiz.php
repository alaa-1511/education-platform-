<?php
include('config.php');
session_start();

// Disable error display in production
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');

try {
    // Check authentication
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Student') {
        throw new Exception('Unauthorized access');
    }

    $user_id = (int)$_SESSION['user_id'];
    $quiz_id = isset($_GET['quiz_id']) ? (int)$_GET['quiz_id'] : null;

    if (!$quiz_id) {
        throw new Exception('Quiz ID is required');
    }

    // Verify student enrollment and quiz availability
    $stmt = $conn->prepare("
        SELECT q.*, l.CourseID 
        FROM quizzes q
        INNER JOIN lessons l ON q.LessonID = l.LessonID
        INNER JOIN enrollments e ON l.CourseID = e.CourseID
        WHERE q.QuizID = ? AND e.StudentID = ?
        AND NOT EXISTS (
            SELECT 1 FROM quizresults qr 
            WHERE qr.QuizID = q.QuizID AND qr.StudentID = ?
        )
    ");
    $stmt->execute([$quiz_id, $user_id, $user_id]);
    $quiz = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$quiz) {
        throw new Exception('Quiz not available or already completed');
    }

    // Get quiz questions
    $questions_stmt = $conn->prepare("
        SELECT 
            QuestionID,
            QuestionText
        FROM quizquestions 
        WHERE QuizID = ?
        ORDER BY QuestionID
    ");
    $questions_stmt->execute([$quiz_id]);
    $questions = $questions_stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($questions)) {
        throw new Exception('No questions found for this quiz');
    }

    // Get answers for each question
    foreach ($questions as &$question) {
        $answers_stmt = $conn->prepare("
            SELECT 
                AnswerID,
                AnswerText
            FROM quizanswers 
            WHERE QuestionID = ?
            ORDER BY AnswerID
        ");
        $answers_stmt->execute([$question['QuestionID']]);
        $question['answers'] = $answers_stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode([
        'status' => 'success',
        'quiz' => [
            'QuizID' => $quiz['QuizID'],
            'QuizName' => $quiz['QuizName'],
            'LessonID' => $quiz['LessonID'],
            'CourseID' => $quiz['CourseID']
        ],
        'questions' => array_map(function($q) {
            return [
                'QuestionID' => $q['QuestionID'],
                'QuestionText' => $q['QuestionText'],
                'answers' => array_map(function($a) {
                    return [
                        'AnswerID' => $a['AnswerID'],
                        'AnswerText' => $a['AnswerText']
                    ];
                }, $q['answers'])
            ];
        }, $questions)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>