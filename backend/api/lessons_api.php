<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

class Lesson {
    private $conn;
    private $table_name = "lessons";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all lessons for a course
    public function getLessons($course_id = null, $teacher_id = null) {
        try {
            if ($course_id) {
                $query = "SELECT l.*, c.CourseName 
                         FROM " . $this->table_name . " l 
                         JOIN courses c ON l.CourseID = c.CourseID 
                         WHERE l.CourseID = ? 
                         ORDER BY l.CreatedAt ASC";
                $params = [$course_id];
            } else if ($teacher_id) {
                $query = "SELECT l.*, c.CourseName 
                         FROM " . $this->table_name . " l 
                         JOIN courses c ON l.CourseID = c.CourseID 
                         WHERE c.TeacherID = ? 
                         ORDER BY l.CreatedAt ASC";
                $params = [$teacher_id];
            } else {
                return array("error" => "Either course_id or teacher_id must be provided");
            }
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Get single lesson
    public function getLesson($lesson_id) {
        try {
            $query = "SELECT l.*, c.CourseName 
                     FROM " . $this->table_name . " l 
                     JOIN courses c ON l.CourseID = c.CourseID 
                     WHERE l.LessonID = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$lesson_id]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Create new lesson
    public function createLesson($data) {
        try {
            $query = "INSERT INTO " . $this->table_name . " 
                     (CourseID, LessonName, Content, VideoURL, Duration) 
                     VALUES (?, ?, ?, ?, ?)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['courseId'],
                $data['lessonName'],
                $data['content'],
                $data['videoUrl'],
                $data['duration']
            ]);
            
            return array("success" => true, "lessonId" => $this->conn->lastInsertId());
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Update lesson
    public function updateLesson($data) {
        try {
            $query = "UPDATE " . $this->table_name . " 
                     SET LessonName = ?, Content = ?, VideoURL = ?, Duration = ? 
                     WHERE LessonID = ? AND CourseID IN (SELECT CourseID FROM courses WHERE TeacherID = ?)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['lessonName'],
                $data['content'],
                $data['videoUrl'],
                $data['duration'],
                $data['lessonId'],
                $data['teacherId']
            ]);
            
            return array("success" => true);
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Delete lesson
    public function deleteLesson($lesson_id, $teacher_id) {
        try {
            $query = "DELETE FROM " . $this->table_name . " 
                     WHERE LessonID = ? AND CourseID IN (SELECT CourseID FROM courses WHERE TeacherID = ?)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$lesson_id, $teacher_id]);
            
            return array("success" => true);
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Get lesson progress
    public function getLessonProgress($lesson_id) {
        try {
            $query = "SELECT u.UserID, u.Username, 
                            CASE WHEN lp.ProgressID IS NOT NULL THEN 1 ELSE 0 END as completed,
                            lp.CompletedAt
                     FROM enrollments e
                     JOIN users u ON e.StudentID = u.UserID
                     JOIN courses c ON e.CourseID = c.CourseID
                     JOIN lessons l ON c.CourseID = l.CourseID
                     LEFT JOIN lesson_progress lp ON l.LessonID = lp.LessonID AND u.UserID = lp.StudentID
                     WHERE l.LessonID = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$lesson_id]);
            
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

$lesson = new Lesson($db);

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

// Initialize result
$result = array("error" => "Invalid request");

try {
    switch($method) {
        case 'GET':
            if(isset($_GET['lesson_id'])) {
                $result = $lesson->getLesson($_GET['lesson_id']);
            } else if(isset($_GET['course_id'])) {
                $result = $lesson->getLessons($_GET['course_id']);
            } else if(isset($_GET['teacher_id'])) {
                $result = $lesson->getLessons(null, $_GET['teacher_id']);
            } else if(isset($_GET['lesson_id']) && isset($_GET['progress'])) {
                $result = $lesson->getLessonProgress($_GET['lesson_id']);
            } else {
                $result = array("error" => "Missing required parameters");
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                $result = array("error" => "Invalid JSON data");
            } else {
                $result = $lesson->createLesson($data);
            }
            break;
            
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
                $result = array("error" => "Invalid JSON data");
            } else {
                $result = $lesson->updateLesson($data);
            }
            break;
            
        case 'DELETE':
            if(isset($_GET['lesson_id']) && isset($_GET['teacher_id'])) {
                $result = $lesson->deleteLesson($_GET['lesson_id'], $_GET['teacher_id']);
            } else {
                $result = array("error" => "Missing required parameters");
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