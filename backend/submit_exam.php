<?php
session_start();
header('Content-Type: application/json');

require_once 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User not authenticated']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $exam_id = $data['exam_id'] ?? null;
    $answers = $data['answers'] ?? [];
    $user_id = $_SESSION['user_id'];

    if (!$exam_id || empty($answers)) {
        throw new Exception('Missing required data');
    }

    $score = 0;
    $total_questions = 0;

    // استعلام الأسئلة الصحيحة
    $questionsStmt = $conn->prepare("
        SELECT 
            eq.QuestionID,
            ea.AnswerID as CorrectAnswerID
        FROM examquestions eq
        LEFT JOIN examanswers ea ON eq.QuestionID = ea.QuestionID AND ea.IsCorrect = 1
        WHERE eq.ExamID = ?
    ");
    $questionsStmt->execute([$exam_id]);
    $questions = $questionsStmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($answers as $question_id => $answer_id) {
        // التحقق من صحة السؤال
        $stmt = $conn->prepare("SELECT 1 FROM examquestions 
                              WHERE QuestionID = :question_id AND ExamID = :exam_id");
        $stmt->execute(['question_id' => $question_id, 'exam_id' => $exam_id]);
        
        if ($stmt->fetch()) {
            // حساب الإجابات الصحيحة
            $stmt = $conn->prepare("SELECT 1 FROM examanswers 
                                  WHERE QuestionID = :question_id 
                                  AND AnswerID = :answer_id 
                                  AND IsCorrect = 1");
            $stmt->execute(['question_id' => $question_id, 'answer_id' => $answer_id]);
            
            if ($stmt->fetch()) {
                $score += 1; // Each correct answer is worth 1 point
            }
            $total_questions++;
        }
    }

    // حساب النسبة المئوية
    $percentage = $total_questions > 0 ? round(($score / $total_questions) * 100) : 0;

    // حفظ النتيجة
    $stmt = $conn->prepare("INSERT INTO examresults (ExamID, StudentID, Score, TakenAt) 
                           VALUES (:exam_id, :user_id, :score, NOW())");
    $stmt->execute([
        'exam_id' => $exam_id,
        'user_id' => $user_id,
        'score' => $percentage
    ]);

    echo json_encode([
        'status' => 'success',
        'score' => $percentage,
        'total' => $total_questions,
        'percentage' => $percentage
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>