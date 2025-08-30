<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

class Course
{
    private $conn;
    private $table_name = "courses";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // Get all courses for a teacher
    public function getCourses($teacher_id)
    {
        try {
            $query = "SELECT c.*, s.SectionName, s.GradeLevel,
                            (SELECT COUNT(*) FROM enrollments WHERE CourseID = c.CourseID) as total_students,
                            (SELECT COUNT(*) FROM lessons WHERE CourseID = c.CourseID) as total_lessons,
                            (SELECT COUNT(*) FROM quizzes q 
                             JOIN lessons l ON q.LessonID = l.LessonID 
                             WHERE l.CourseID = c.CourseID) as total_quizzes,
                            (SELECT COUNT(*) FROM exams WHERE CourseID = c.CourseID) as total_exams
                     FROM " . $this->table_name . " c 
                     LEFT JOIN sections s ON c.SectionID = s.SectionID 
                     WHERE c.TeacherID = ? 
                     ORDER BY c.CreatedAt DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([$teacher_id]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Get single course
    public function getCourse($course_id)
    {
        try {
            $query = "SELECT c.*, s.SectionName, s.GradeLevel 
                     FROM " . $this->table_name . " c 
                     LEFT JOIN sections s ON c.SectionID = s.SectionID 
                     WHERE c.CourseID = ?";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([$course_id]);

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Create new course
    public function createCourse($data)
    {
if (!$data) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON"]);
    exit;
}

// استخراج البيانات
$courseName = $data['courseName'] ?? '';
$description = $data['description'] ?? '';
$sectionId = $data['sectionId'] ?? '';
$teacherId = $data['teacherId'] ?? '';
$filename = $data['filename'] ?? '';
$mime_type = $data['mime_type'] ?? '';
$file_data = $data['file_data'] ?? '';

if (empty($courseName) || empty($description) || empty($sectionId) || empty($teacherId) || empty($file_data)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

// فك ترميز base64
if (preg_match('/^data:\w+\/\w+;base64,/', $file_data)) {
    $file_data = substr($file_data, strpos($file_data, ',') + 1);
    $file_data = base64_decode($file_data);

    if ($file_data === false) {
        echo json_encode(["status" => "error", "message" => "Failed to decode image"]);
        exit;
    }

    $uniqueFilename = time() . '_' . basename($filename);
    $filePath = '../../IMG' . $uniqueFilename;
    file_put_contents($filePath, $file_data);
 $filePath = './IMG' . $uniqueFilename;
}

// إدخال البيانات في قاعدة البيانات
 $query = "INSERT INTO courses (CourseName, Description, SectionID, TeacherID, urlIMG, CreatedAt) 
                     VALUES (?, ?, ?, ?, ? , NOW())";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['courseName'],
                $data['description'],
                $data['sectionId'],
                $data['teacherId'],
                $filePath
            ]);

if ($stmt) {
    echo json_encode(["status" => "success", "message" => "Course saved successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Insert failed"]);
}

            return array(
                "success" => true,
                "courseId" => $this->conn->lastInsertId(),
                "message" => "Course created successfully"
            );
        
    }


    // Update course
    public function updateCourse($data)
    {
        try {
            // Validate required fields
            if (empty($data['courseName']) || empty($data['description']) || empty($data['sectionId']) || empty($data['courseId']) || empty($data['teacherId'])) {
                return array("error" => "All required fields are missing");
            }

            // Check if course exists and belongs to teacher
            $query = "SELECT CourseID FROM " . $this->table_name . " WHERE CourseID = ? AND TeacherID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$data['courseId'], $data['teacherId']]);
            if (!$stmt->fetch()) {
                return array("error" => "Course not found or unauthorized");
            }

            // Handle image if provided
            $imagePath = null;
            if (isset($data['imageName'])) {
                $imagePath = './IMG/' . $data['imageName'];
            }

            // Update course
            $query = "UPDATE " . $this->table_name . " 
                     SET CourseName = ?, Description = ?, SectionID = ?, AcademicYear = ?";

            $params = [
                $data['courseName'],
                $data['description'],
                $data['sectionId'],
                $data['academicYear'] ?? null
            ];

            if ($imagePath) {
                $query .= ", urlIMG = ?";
                $params[] = $imagePath;
            }

            $query .= " WHERE CourseID = ? AND TeacherID = ?";
            $params[] = $data['courseId'];
            $params[] = $data['teacherId'];

            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);

            return array(
                "success" => true,
                "message" => "Course updated successfully"
            );
        } catch (PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }
    // Delete course
    public function deleteCourse($course_id, $teacher_id)
    {
        try {
            $query = "DELETE FROM " . $this->table_name . " 
                     WHERE CourseID = ? AND TeacherID = ?";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([$course_id, $teacher_id]);

            return array("success" => true);
        } catch (PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Get course students
    public function getCourseStudents($course_id)
    {
        try {
            $query = "SELECT u.UserID, u.Username, u.Email, 
                            COUNT(DISTINCT lp.LessonID) as completed_lessons,
                            COUNT(DISTINCT l.LessonID) as total_lessons,
                            AVG(qr.Score) as quiz_avg,
                            AVG(er.Score) as exam_avg
                     FROM enrollments e
                     JOIN users u ON e.StudentID = u.UserID
                     JOIN courses c ON e.CourseID = c.CourseID
                     JOIN lessons l ON c.CourseID = l.CourseID
                     LEFT JOIN lesson_progress lp ON l.LessonID = lp.LessonID AND u.UserID = lp.StudentID
                     LEFT JOIN quizzes q ON l.LessonID = q.LessonID
                     LEFT JOIN quizresults qr ON q.QuizID = qr.QuizID AND u.UserID = qr.StudentID
                     LEFT JOIN exams ex ON c.CourseID = ex.CourseID
                     LEFT JOIN examresults er ON ex.ExamID = er.ExamID AND u.UserID = er.StudentID
                     WHERE c.CourseID = ?
                     GROUP BY u.UserID";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([$course_id]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    /********************************************** */
    function uploadProfilePicture($teacher_id, $file)
    {
        try {
            $uploadDir = '../IMG/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            // التحقق من نوع الملف
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!in_array($file['type'], $allowedTypes)) {
                return array("error" => "Invalid file type. Only JPG, PNG, and GIF are allowed.");
            }

            // التحقق من حجم الملف (5MB كحد أقصى)
            $maxSize = 5 * 1024 * 1024;
            if ($file['size'] > $maxSize) {
                return array("error" => "File size exceeds maximum limit of 5MB");
            }

            // استخدام اسم الملف الأصلي
            $fileName = $file['name'];
            $targetPath = $uploadDir . $fileName;

            // محاولة نقل الملف
            if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                // تحديث مسار الصورة في قاعدة البيانات
                $query = "UPDATE profiles SET ProfilePictureURL = ? WHERE UserID = ?";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$fileName, $teacher_id]);

                return array(
                    "success" => true,
                    "imageUrl" => $fileName,
                    "message" => "Profile picture updated successfully"
                );
            } else {
                return array("error" => "Failed to upload image. Error: " . error_get_last()['message']);
            }
        } catch (PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    /********************************************** */
}

$database = new Database();
$db = $database->getConnection();

$course = new Course($db);

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['course_id'])) {
                $result = $course->getCourse($_GET['course_id']);
            } else if (isset($_GET['teacher_id'])) {
                $result = $course->getCourses($_GET['teacher_id']);
            } else if (isset($_GET['course_id']) && isset($_GET['students'])) {
                $result = $course->getCourseStudents($_GET['course_id']);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);
            $result = $course->createCourse($data);
            break;

        case 'PUT':
            // Read JSON data from request body
            $data = json_decode(file_get_contents("php://input"), true);

            // Log the request data
            error_log("PUT Request Data: " . print_r($data, true));

            if (!$data) {
                $result = array("error" => "Invalid JSON data");
                break;
            }

            $result = $course->updateCourse($data);
            break;

        case 'DELETE':
            if (isset($_GET['course_id']) && isset($_GET['teacher_id'])) {
                $result = $course->deleteCourse($_GET['course_id'], $_GET['teacher_id']);
            }
            break;
    }

    // Ensure we always return JSON
    if (!isset($result)) {
        $result = array("error" => "Invalid request");
    }

    echo json_encode($result);
} catch (Exception $e) {
    // Log the error
    error_log("API Error: " . $e->getMessage());
    error_log("Stack Trace: " . $e->getTraceAsString());

    // Return a JSON error response
    echo json_encode(array(
        "error" => "An error occurred",
        "message" => $e->getMessage()
    ));
}
