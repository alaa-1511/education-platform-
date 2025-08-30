<?php
// Set headers at the very beginning
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Prevent any output before headers
ob_start();

include_once '../config/database.php';

class Exam {
    private $conn;
    private $table_name = "exams";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all exams for a course
    public function getExams($course_id = null, $teacher_id = null) {
        try {
            if ($course_id) {
                // Get exams for specific course
                $query = "SELECT e.*, c.CourseName 
                         FROM " . $this->table_name . " e 
                         JOIN courses c ON e.CourseID = c.CourseID 
                         WHERE e.CourseID = ? 
                         ORDER BY e.CreatedAt DESC";
                $params = [$course_id];
            } else if ($teacher_id) {
                // Get all exams for teacher
                $query = "SELECT e.*, c.CourseName 
                         FROM " . $this->table_name . " e 
                         JOIN courses c ON e.CourseID = c.CourseID 
                         WHERE c.TeacherID = ? 
                         ORDER BY e.CreatedAt DESC";
                $params = [$teacher_id];
            } else {
                return array("error" => "Either course_id or teacher_id must be provided");
            }
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
            $exams = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($exams)) {
                return array("success" => true, "data" => []);
            }

            // Get questions and answers for each exam
            foreach ($exams as &$exam) {
                // Get questions
                $query = "SELECT eq.*, GROUP_CONCAT(ea.AnswerText) AS answers, 
                                 GROUP_CONCAT(ea.IsCorrect) AS correct_answers
                         FROM examquestions eq 
                         LEFT JOIN examanswers ea ON eq.QuestionID = ea.QuestionID 
                         WHERE eq.ExamID = ? 
                         GROUP BY eq.QuestionID";
                
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$exam['ExamID']]);
                $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Process questions and answers
                foreach ($questions as &$question) {
                    $answers = explode(',', $question['answers']);
                    $correct_answers = explode(',', $question['correct_answers']);
                    
                    $question['options'] = [];
                    for ($i = 0; $i < count($answers); $i++) {
                        $question['options'][] = [
                            'text' => $answers[$i],
                            'is_correct' => (int)$correct_answers[$i]
                        ];
                    }
                    
                    // Find the index of the correct answer
                    $question['correctAnswer'] = array_search('1', $correct_answers);
                    
                    // Remove the raw data
                    unset($question['answers']);
                    unset($question['correct_answers']);
                }

                $exam['questions'] = $questions;
            }
            
            return array("success" => true, "data" => $exams);
        } catch(PDOException $e) {
            return array("error" => "Database error: " . $e->getMessage());
        }
    }

    // Get single exam with questions and answers
    public function getExam($exam_id) {
        try {
            // Get exam details
            $query = "SELECT e.*, c.CourseName 
                     FROM " . $this->table_name . " e 
                     JOIN courses c ON e.CourseID = c.CourseID 
                     WHERE e.ExamID = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$exam_id]);
            $exam = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$exam) {
                return array("error" => "Exam not found");
            }

            // Get questions
            $query = "SELECT eq.*, GROUP_CONCAT(ea.AnswerText) AS answers, 
                             GROUP_CONCAT(ea.IsCorrect) AS correct_answers
                     FROM examquestions eq 
                     LEFT JOIN examanswers ea ON eq.QuestionID = ea.QuestionID 
                     WHERE eq.ExamID = ? 
                     GROUP BY eq.QuestionID";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$exam_id]);
            $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Process questions and answers
            foreach ($questions as &$question) {
                $answers = explode(',', $question['answers']);
                $correct_answers = explode(',', $question['correct_answers']);
                
                $question['options'] = [];
                for ($i = 0; $i < count($answers); $i++) {
                    $question['options'][] = [
                        'text' => $answers[$i],
                        'is_correct' => (int)$correct_answers[$i]
                    ];
                }
                
                // Find the index of the correct answer
                $question['correctAnswer'] = array_search('1', $correct_answers);
                
                // Remove the raw data
                unset($question['answers']);
                unset($question['correct_answers']);
            }

            $exam['questions'] = $questions;
            return array("success" => true, "data" => $exam);
        } catch(PDOException $e) {
            return array("error" => "Database error: " . $e->getMessage());
        }
    }

    // Create new exam with questions and answers
    public function createExam($data) {
        try {
            // Validate required fields
            if (empty($data['course_id']) || empty($data['exam_name']) || empty($data['questions']) || empty($data['teacher_id'])) {
                return array("error" => "All fields are required");
            }

            // Validate questions data
            foreach ($data['questions'] as $question) {
                if (empty($question['text'])) {
                    return array("error" => "Question text cannot be empty");
                }
                if (empty($question['options']) || !is_array($question['options'])) {
                    return array("error" => "Question options cannot be empty");
                }
                if (!isset($question['correctAnswer']) || $question['correctAnswer'] === '') {
                    return array("error" => "Correct answer must be specified for each question");
                }
            }

            // Check if course exists and belongs to teacher
            $query = "SELECT CourseID FROM courses WHERE CourseID = ? AND TeacherID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$data['course_id'], $data['teacher_id']]);
            if (!$stmt->fetch()) {
                return array("error" => "Invalid course ID or unauthorized access");
            }

            // Start transaction
            $this->conn->beginTransaction();

            // Create exam
            $query = "INSERT INTO exams (CourseID, ExamName, Duration, CreatedAt) VALUES (?, ?, ?, NOW())";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$data['course_id'], $data['exam_name'], $data['time_limit']]);
            $examId = $this->conn->lastInsertId();

            // Insert questions and answers
            foreach ($data['questions'] as $question) {
                // Insert question
                $query = "INSERT INTO examquestions (ExamID, QuestionText ,correctAnswer) VALUES (?, ?,?)";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$examId, trim($question['text']),trim($question['correctAnswer'])]);
                $questionId = $this->conn->lastInsertId();

                // Insert answers
                $query = "INSERT INTO examanswers (QuestionID, AnswerText, IsCorrect) VALUES (?, ?, ?)";
                $stmt = $this->conn->prepare($query);
                
                foreach ($question['options'] as $index => $option) {
                    if (empty(trim($option))) {
                        $this->conn->rollBack();
                        return array("error" => "Answer text cannot be empty");
                    }
                    $is_correct = (trim($option) == $question['correctAnswer']) ? 1 : 0;
                    $stmt->execute([
                        $questionId,
                        trim($option),
                        $is_correct
                    ]);
                }
            }

            $this->conn->commit();
            
            return array(
                "success" => true,
                "examId" => $examId,
                "message" => "Exam created successfully"
            );
        } catch(PDOException $e) {
            $this->conn->rollBack();
            return array("error" => $e->getMessage());
        }
    }

    // Update exam
    public function updateExam($data) {
        try {
            // Validate required fields
            if (empty($data['exam_id']) || empty($data['exam_name']) || empty($data['questions']) || empty($data['teacher_id'])) {
                return array("error" => "All fields are required");
            }

            // Validate questions data
            foreach ($data['questions'] as $question) {
                if (empty($question['text'])) {
                    return array("error" => "Question text cannot be empty");
                }
                if (empty($question['options']) || !is_array($question['options'])) {
                    return array("error" => "Question options cannot be empty");
                }
                if (!isset($question['correctAnswer']) || $question['correctAnswer'] === '') {
                    return array("error" => "Correct answer must be specified for each question");
                }
            }

            $this->conn->beginTransaction();

            // Update exam details
            $query = "UPDATE exams 
                     SET ExamName = ?, Duration = ? 
                     WHERE ExamID = ? AND CourseID IN (SELECT CourseID FROM courses WHERE TeacherID = ?)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$data['exam_name'], $data['time_limit'], $data['exam_id'], $data['teacher_id']]);

            // Delete existing questions and answers
            $query = "DELETE ea FROM examanswers ea 
                     JOIN examquestions eq ON ea.QuestionID = eq.QuestionID 
                     WHERE eq.ExamID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$data['exam_id']]);

            $query = "DELETE FROM examquestions WHERE ExamID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$data['exam_id']]);

            // Insert new questions and answers
            foreach ($data['questions'] as $question) {
                // Insert question
                $query = "INSERT INTO examquestions (ExamID, QuestionText , correctAnswer) VALUES (?, ?,?)";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$data['exam_id'], trim($question['text']),trim($question['correctAnswer'])]);
                $questionId = $this->conn->lastInsertId();

                // Insert answers
                $query = "INSERT INTO examanswers (QuestionID, AnswerText, IsCorrect) VALUES (?, ?, ?)";
                $stmt = $this->conn->prepare($query);
                
                foreach ($question['options'] as $index => $option) {
                    if (empty(trim($option))) {
                        $this->conn->rollBack();
                        return array("error" => "Answer text cannot be empty");
                    }
                    $is_correct = ($index == $question['correctAnswer']) ? 1 : 0;
                    $stmt->execute([
                        $questionId,
                        trim($option),
                        $is_correct
                    ]);
                }
            }

            $this->conn->commit();
            return array("success" => true, "message" => "Exam updated successfully");
        } catch(PDOException $e) {
            $this->conn->rollBack();
            return array("error" => $e->getMessage());
        }
    }

    // Delete exam
    public function deleteExam($exam_id, $teacher_id) {
        try {
            if (empty($exam_id) || empty($teacher_id)) {
                return array("error" => "Exam ID and teacher ID are required");
            }

            $this->conn->beginTransaction();

            // Delete answers
            $query = "DELETE ea FROM examanswers ea 
                     JOIN examquestions eq ON ea.QuestionID = eq.QuestionID 
                     WHERE eq.ExamID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$exam_id]);

            // Delete questions
            $query = "DELETE FROM examquestions WHERE ExamID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$exam_id]);

            // Delete exam
            $query = "DELETE FROM exams 
                     WHERE ExamID = ? AND CourseID IN (SELECT CourseID FROM courses WHERE TeacherID = ?)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$exam_id, $teacher_id]);

            if ($stmt->rowCount() === 0) {
                $this->conn->rollBack();
                return array("error" => "Exam not found or unauthorized access");
            }

            $this->conn->commit();
            return array("success" => true, "message" => "Exam deleted successfully");
        } catch(PDOException $e) {
            $this->conn->rollBack();
            return array("error" => $e->getMessage());
        }
    }

    // Get exam results
    public function getExamResults($exam_id) {
        try {
            $query = "SELECT u.UserID, u.Username, er.Score, er.TakenAt 
                     FROM examresults er 
                     JOIN users u ON er.StudentID = u.UserID 
                     WHERE er.ExamID = ? 
                     ORDER BY er.TakenAt DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$exam_id]);
            
            return array("success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }
}

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Check if database connection was successful
if (!$db) {
    http_response_code(500);
    echo json_encode(array("error" => "Database connection failed"));
    exit();
}

$exam = new Exam($db);

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

// Initialize result
$result = array("error" => "Invalid request");

try {
    switch($method) {
        case 'GET':
            if(isset($_GET['exam_id']) && isset($_GET['results'])) {
                $result = $exam->getExamResults($_GET['exam_id']);
            } else if(isset($_GET['exam_id'])) {
                $result = $exam->getExam($_GET['exam_id']);
            } else if(isset($_GET['course_id'])) {
                $result = $exam->getExams($_GET['course_id']);
            } else if(isset($_GET['teacher_id'])) {
                $result = $exam->getExams(null, $_GET['teacher_id']);
            } else {
                $result = array("error" => "Missing required parameters");
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                $result = array("error" => "Invalid JSON data");
            } else if (!isset($data['course_id']) || !isset($data['exam_name']) || !isset($data['questions'])) {
                $result = array("error" => "Missing required fields");
            } else {
                $result = $exam->createExam($data);
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                $result = array("error" => "Invalid JSON data");
            } else if (!isset($data['exam_id']) || !isset($data['teacher_id']) || !isset($data['questions'])) {
                $result = array("error" => "Missing required fields");
            } else {
                $result = $exam->updateExam($data);
            }
            break;
            
        case 'DELETE':
            if(isset($_GET['exam_id']) && isset($_GET['teacher_id'])) {
                $result = $exam->deleteExam($_GET['exam_id'], $_GET['teacher_id']);
            } else {
                $result = array("error" => "Missing required parameters: exam_id and teacher_id");
            }
            break;
            
        default:
            $result = array("error" => "Invalid request method");
            break;
    }
} catch (Exception $e) {
    $result = array("error" => "Server error: " . $e->getMessage());
}

// Clear any output buffer
ob_clean();

// Ensure proper content type
header("Content-Type: application/json; charset=UTF-8");

// Send response
echo json_encode($result);
exit();
?> 