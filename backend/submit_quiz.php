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
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        throw new Exception('Invalid request data');
    }
    
    $quiz_id = isset($data['quiz_id']) ? (int)$data['quiz_id'] : null;
    $answers = $data['answers'] ?? [];

    // Validate quiz data
    if (!$quiz_id || empty($answers)) {
        throw new Exception('Quiz data is incomplete');
    }

    // Verify student enrollment
    $stmt = $conn->prepare("
        SELECT 1 FROM enrollments e
        JOIN lessons l ON e.CourseID = l.CourseID
        JOIN quizzes q ON l.LessonID = q.LessonID
        WHERE e.StudentID = ? AND q.QuizID = ?
    ");
    $stmt->execute([$user_id, $quiz_id]);
    
    if (!$stmt->fetch()) {
        throw new Exception('You are not enrolled in this course');
    }

    // Calculate score
    $score = 0;
    $total_questions = 0;

    foreach ($answers as $question_id => $answer_id) {
        // Validate question
        $stmt = $conn->prepare("
            SELECT 1 FROM quizquestions 
            WHERE QuestionID = ? AND QuizID = ?
        ");
        $stmt->execute([$question_id, $quiz_id]);
        
        if ($stmt->fetch()) {
            // Count correct answers
            $stmt = $conn->prepare("
                SELECT COUNT(*) FROM quizanswers 
                WHERE QuestionID = ? AND AnswerID = ? AND IsCorrect = 1
            ");
            $stmt->execute([$question_id, $answer_id]);
            $score += $stmt->fetchColumn();
            $total_questions++;
        }
    }

    if ($total_questions === 0) {
        throw new Exception('No valid answers provided');
    }

    $final_score = round(($score / $total_questions) * 100);

    // Prevent duplicate submissions
    $stmt = $conn->prepare("
        SELECT 1 FROM quizresults 
        WHERE StudentID = ? AND QuizID = ?
    ");
    $stmt->execute([$user_id, $quiz_id]);
    
    if ($stmt->fetch()) {
        throw new Exception('You have already taken this quiz');
    }

    // Save result
    $stmt = $conn->prepare("
        INSERT INTO quizresults 
        (StudentID, QuizID, Score, TakenAt) 
        VALUES (?, ?, ?, NOW())
    ");
    $stmt->execute([$user_id, $quiz_id, $final_score]);

    // Update lesson progress
    $stmt = $conn->prepare("
        SELECT LessonID FROM quizzes WHERE QuizID = ?
    ");
    $stmt->execute([$quiz_id]);
    $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($lesson) {
        try {
            // Insert lesson progress record
            $progress_stmt = $conn->prepare("
                INSERT INTO lesson_progress (StudentID, LessonID, CompletedAt) 
                VALUES (?, ?, NOW())
                ON DUPLICATE KEY UPDATE 
                    CompletedAt = NOW()
            ");
            $progress_stmt->execute([$user_id, $lesson['LessonID']]);
        } catch (PDOException $e) {
            // Log error but don't fail the quiz submission
            error_log("Error updating lesson progress: " . $e->getMessage());
        }
    }

    echo json_encode([
        'status' => 'success',
        'score' => $final_score,
        'correct_answers' => $score,
        'total_questions' => $total_questions,
        'message' => 'Quiz submitted successfully'
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