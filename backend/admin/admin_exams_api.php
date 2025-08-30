<?php
// Set headers for JSON response
header('Content-Type: application/json');
error_reporting(0); // Disable error reporting for production

require_once 'config.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'getAll':
            $stmt = $pdo->query("SELECT e.*, c.CourseName, u.Username as TeacherName 
                                FROM exams e 
                                LEFT JOIN courses c ON e.CourseID = c.CourseID 
                                LEFT JOIN users u ON c.TeacherID = u.UserID");
            $exams = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $exams]);
            break;

        case 'getById':
            $examId = $_GET['examId'] ?? 0;
            $stmt = $pdo->prepare("SELECT e.*, c.CourseName, u.Username as TeacherName 
                                  FROM exams e 
                                  LEFT JOIN courses c ON e.CourseID = c.CourseID 
                                  LEFT JOIN users u ON c.TeacherID = u.UserID 
                                  WHERE e.ExamID = ?");
            $stmt->execute([$examId]);
            $exam = $stmt->fetch();
            echo json_encode(['success' => true, 'data' => $exam]);
            break;

        case 'add':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                throw new Exception('Invalid input data');
            }
            
            $pdo->beginTransaction();
            
            // Insert exam
            $stmt = $pdo->prepare("INSERT INTO exams (CourseID, ExamName, Duration, PassingScore) 
                                  VALUES (?, ?, ?, ?)");
            $stmt->execute([$data['courseId'], $data['examName'], $data['duration'], $data['passingScore']]);
            $examId = $pdo->lastInsertId();
            
            // Insert questions if provided
            if (isset($data['questions']) && is_array($data['questions'])) {
                $stmt = $pdo->prepare("INSERT INTO exam_questions (ExamID, QuestionText, CorrectAnswer, Points) 
                                      VALUES (?, ?, ?, ?)");
                foreach ($data['questions'] as $question) {
                    $stmt->execute([$examId, $question['text'], $question['correctAnswer'], $question['points']]);
                }
            }
            
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Exam added successfully']);
            break;

        case 'update':
            $examId = $_GET['examId'] ?? 0;
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                throw new Exception('Invalid input data');
            }
            
            $pdo->beginTransaction();
            
            // Update exam
            $stmt = $pdo->prepare("UPDATE exams SET CourseID = ?, ExamName = ?, Duration = ?, PassingScore = ? 
                                  WHERE ExamID = ?");
            $stmt->execute([$data['courseId'], $data['examName'], $data['duration'], $data['passingScore'], $examId]);
            
            // Update questions if provided
            if (isset($data['questions']) && is_array($data['questions'])) {
                // Delete existing questions
                $stmt = $pdo->prepare("DELETE FROM exam_questions WHERE ExamID = ?");
                $stmt->execute([$examId]);
                
                // Insert new questions
                $stmt = $pdo->prepare("INSERT INTO exam_questions (ExamID, QuestionText, CorrectAnswer, Points) 
                                      VALUES (?, ?, ?, ?)");
                foreach ($data['questions'] as $question) {
                    $stmt->execute([$examId, $question['text'], $question['correctAnswer'], $question['points']]);
                }
            }
            
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Exam updated successfully']);
            break;

        case 'delete':
            $examId = $_GET['examId'] ?? 0;
            $stmt = $pdo->prepare("DELETE FROM exams WHERE ExamID = ?");
            $stmt->execute([$examId]);
            echo json_encode(['success' => true, 'message' => 'Exam deleted successfully']);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>