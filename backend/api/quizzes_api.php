<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

class Quiz {
    private $conn;
    private $table_name = "quizzes";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all quizzes for a lesson
    public function getQuizzes($lesson_id = null, $teacher_id = null) {
        try {
            if ($lesson_id) {
                $query = "SELECT q.*, l.LessonName, c.CourseName 
                         FROM " . $this->table_name . " q 
                         JOIN lessons l ON q.LessonID = l.LessonID 
                         JOIN courses c ON l.CourseID = c.CourseID 
                         WHERE q.LessonID = ? 
                         ORDER BY q.CreatedAt DESC";
                $params = [$lesson_id];
            } else if ($teacher_id) {
                $query = "SELECT q.*, l.LessonName, c.CourseName 
                         FROM " . $this->table_name . " q 
                         JOIN lessons l ON q.LessonID = l.LessonID 
                         JOIN courses c ON l.CourseID = c.CourseID 
                         WHERE c.TeacherID = ? 
                         ORDER BY q.CreatedAt DESC";
                $params = [$teacher_id];
            } else {
                return array("error" => "Either lesson_id or teacher_id must be provided");
            }
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Get single quiz with questions and answers
    public function getQuiz($quiz_id) {
        try {
            // Get quiz details
            $query = "SELECT q.*, l.LessonName, c.CourseName 
                     FROM " . $this->table_name . " q 
                     JOIN lessons l ON q.LessonID = l.LessonID 
                     JOIN courses c ON l.CourseID = c.CourseID 
                     WHERE q.QuizID = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$quiz_id]);
            $quiz = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$quiz) {
                return array("error" => "Quiz not found");
            }

            // Get questions
            $query = "SELECT qq.*, GROUP_CONCAT(qa.AnswerText) AS answers, 
                             GROUP_CONCAT(qa.IsCorrect) AS correct_answers
                     FROM quizquestions qq 
                     LEFT JOIN quizanswers qa ON qq.QuestionID = qa.QuestionID 
                     WHERE qq.QuizID = ? 
                     GROUP BY qq.QuestionID";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$quiz_id]);
            $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $quiz['questions'] = $questions;
            return $quiz;
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Create new quiz with questions and answers
    public function createQuiz($data) {
        try {
            // Validate required fields
            if (empty($data['lesson_id']) || empty($data['quiz_name']) || empty($data['questions']) || empty($data['teacher_id'])) {
                return array("error" => "All fields are required");
            }

            // Check if lesson exists and belongs to teacher
            $query = "SELECT l.LessonID 
                     FROM lessons l 
                     JOIN courses c ON l.CourseID = c.CourseID 
                     WHERE l.LessonID = ? AND c.TeacherID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$data['lesson_id'], $data['teacher_id']]);
            if (!$stmt->fetch()) {
                return array("error" => "Invalid lesson ID or unauthorized access");
            }

            // Start transaction
            $this->conn->beginTransaction();

            // Create quiz
            $query = "INSERT INTO quizzes (LessonID, QuizName, CreatedAt) VALUES (?, ?, NOW())";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$data['lesson_id'], $data['quiz_name']]);
            $quizId = $this->conn->lastInsertId();

            // Insert questions and answers
            foreach ($data['questions'] as $question) {
                // Insert question
                $query = "INSERT INTO quizquestions (QuizID, QuestionText) VALUES (?, ?)";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$quizId, $question['question_text']]);
                $questionId = $this->conn->lastInsertId();

                // Insert answers
                $query = "INSERT INTO quizanswers (QuestionID, AnswerText, IsCorrect) VALUES (?, ?, ?)";
                $stmt = $this->conn->prepare($query);
                
                foreach ($question['answers'] as $answer) {
                    $stmt->execute([
                        $questionId,
                        $answer['answer_text'],
                        $answer['is_correct']
                    ]);
                }
            }

            $this->conn->commit();
            
            return array(
                "success" => true,
                "quizId" => $quizId,
                "message" => "Quiz created successfully"
            );
        } catch(PDOException $e) {
            $this->conn->rollBack();
            return array("error" => $e->getMessage());
        }
    }

    // Update quiz
    public function updateQuiz($data) {
        try {
            $this->conn->beginTransaction();

            // Update quiz details
            $query = "UPDATE quizzes 
                     SET QuizName = ? 
                     WHERE QuizID = ? AND LessonID IN (
                         SELECT LessonID FROM lessons 
                         WHERE CourseID IN (SELECT CourseID FROM courses WHERE TeacherID = ?)
                     )";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$data['quiz_name'], $data['quiz_id'], $data['teacher_id']]);

            // Delete existing questions and answers
            $query = "DELETE qa FROM quizanswers qa 
                     JOIN quizquestions qq ON qa.QuestionID = qq.QuestionID 
                     WHERE qq.QuizID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$data['quiz_id']]);

            $query = "DELETE FROM quizquestions WHERE QuizID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$data['quiz_id']]);

            // Insert new questions and answers
            foreach ($data['questions'] as $question) {
                // Insert question
                $query = "INSERT INTO quizquestions (QuizID, QuestionText) VALUES (?, ?)";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$data['quiz_id'], $question['question_text']]);
                $questionId = $this->conn->lastInsertId();

                // Insert answers
                $query = "INSERT INTO quizanswers (QuestionID, AnswerText, IsCorrect) VALUES (?, ?, ?)";
                $stmt = $this->conn->prepare($query);
                
                foreach ($question['answers'] as $answer) {
                    $stmt->execute([
                        $questionId,
                        $answer['answer_text'],
                        $answer['is_correct']
                    ]);
                }
            }

            $this->conn->commit();
            return array("success" => true);
        } catch(PDOException $e) {
            $this->conn->rollBack();
            return array("error" => $e->getMessage());
        }
    }

    // Delete quiz
    public function deleteQuiz($quiz_id, $teacher_id) {
        try {
            if (empty($quiz_id) || empty($teacher_id)) {
                return array("error" => "Quiz ID and teacher ID are required");
            }

            $this->conn->beginTransaction();

            // Delete answers
            $query = "DELETE qa FROM quizanswers qa 
                     JOIN quizquestions qq ON qa.QuestionID = qq.QuestionID 
                     WHERE qq.QuizID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$quiz_id]);

            // Delete questions
            $query = "DELETE FROM quizquestions WHERE QuizID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$quiz_id]);

            // Delete quiz
            $query = "DELETE FROM quizzes 
                     WHERE QuizID = ? AND LessonID IN (
                         SELECT LessonID FROM lessons 
                         WHERE CourseID IN (SELECT CourseID FROM courses WHERE TeacherID = ?)
                     )";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$quiz_id, $teacher_id]);

            if ($stmt->rowCount() === 0) {
                $this->conn->rollBack();
                return array("error" => "Quiz not found or unauthorized access");
            }

            $this->conn->commit();
            return array("success" => true, "message" => "Quiz deleted successfully");
        } catch(PDOException $e) {
            $this->conn->rollBack();
            return array("error" => $e->getMessage());
        }
    }

    // Get quiz results
    public function getQuizResults($quiz_id) {
        try {
            $query = "SELECT u.UserID, u.Username, qr.Score, qr.TakenAt 
                     FROM quizresults qr 
                     JOIN users u ON qr.StudentID = u.UserID 
                     WHERE qr.QuizID = ? 
                     ORDER BY qr.TakenAt DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$quiz_id]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }
}

$database = new Database();
$db = $database->getConnection();

// Check if database connection was successful
if (!$db) {
    http_response_code(500);
    echo json_encode(array("error" => "Database connection failed"));
    exit();
}

$quiz = new Quiz($db);

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

// Initialize result
$result = array("error" => "Invalid request");

try {
    switch($method) {
        case 'GET':
            if(isset($_GET['quiz_id']) && isset($_GET['results'])) {
                $result = $quiz->getQuizResults($_GET['quiz_id']);
            } else if(isset($_GET['quiz_id'])) {
                $result = $quiz->getQuiz($_GET['quiz_id']);
            } else if(isset($_GET['lesson_id'])) {
                $result = $quiz->getQuizzes($_GET['lesson_id']);
            } else if(isset($_GET['teacher_id'])) {
                $result = $quiz->getQuizzes(null, $_GET['teacher_id']);
            } else {
                $result = array("error" => "Missing required parameters");
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                $result = array("error" => "Invalid JSON data");
            } else if (!isset($data['lesson_id']) || !isset($data['quiz_name']) || !isset($data['questions'])) {
                $result = array("error" => "Missing required fields");
            } else {
                $result = $quiz->createQuiz($data);
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                $result = array("error" => "Invalid JSON data");
            } else if (!isset($data['quiz_id']) || !isset($data['teacher_id']) || !isset($data['questions'])) {
                $result = array("error" => "Missing required fields");
            } else {
                $result = $quiz->updateQuiz($data);
            }
            break;
            
        case 'DELETE':
            if(isset($_GET['quiz_id']) && isset($_GET['teacher_id'])) {
                $result = $quiz->deleteQuiz($_GET['quiz_id'], $_GET['teacher_id']);
            } else {
                $result = array("error" => "Missing required parameters: quiz_id and teacher_id");
            }
            break;
            
        default:
            $result = array("error" => "Invalid request method");
            break;
    }
} catch (Exception $e) {
    $result = array("error" => "Server error: " . $e->getMessage());
}

// Ensure proper content type
header("Content-Type: application/json; charset=UTF-8");

// Send response
echo json_encode($result);
exit();
?> 