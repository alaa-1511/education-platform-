<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

class Dashboard {
    private $conn;
    private $teacher_id;

    public function __construct($db) {
        $this->conn = $db;
        $this->teacher_id = isset($_GET['teacher_id']) ? $_GET['teacher_id'] : die();
    }

    public function getStatistics() {
        try {
            // Get total courses
            $query = "SELECT COUNT(*) as total FROM courses WHERE TeacherID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$this->teacher_id]);
            $totalCourses = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Get total students
            $query = "SELECT COUNT(DISTINCT e.StudentID) as total 
                     FROM enrollments e 
                     JOIN courses c ON e.CourseID = c.CourseID 
                     WHERE c.TeacherID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$this->teacher_id]);
            $totalStudents = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Get total lessons
            $query = "SELECT COUNT(*) as total 
                     FROM lessons l 
                     JOIN courses c ON l.CourseID = c.CourseID 
                     WHERE c.TeacherID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$this->teacher_id]);
            $totalLessons = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Get total exams
            $query = "SELECT COUNT(*) as total 
                     FROM exams e 
                     JOIN courses c ON e.CourseID = c.CourseID 
                     WHERE c.TeacherID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$this->teacher_id]);
            $totalExams = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Get student progress data
            $query = "SELECT u.Username, 
                            COUNT(DISTINCT lp.LessonID) as completed_lessons,
                            COUNT(DISTINCT l.LessonID) as total_lessons,
                            ROUND((COUNT(DISTINCT lp.LessonID) / COUNT(DISTINCT l.LessonID)) * 100, 2) as progress_percentage
                     FROM users u
                     JOIN enrollments e ON u.UserID = e.StudentID
                     JOIN courses c ON e.CourseID = c.CourseID
                     JOIN lessons l ON c.CourseID = l.CourseID
                     LEFT JOIN lesson_progress lp ON l.LessonID = lp.LessonID AND u.UserID = lp.StudentID
                     WHERE c.TeacherID = ?
                     GROUP BY u.UserID
                     ORDER BY progress_percentage DESC
                     LIMIT 5";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$this->teacher_id]);
            $studentProgress = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get course statistics
            $query = "SELECT c.CourseName, 
                            COUNT(DISTINCT e.StudentID) as enrolled_students,
                            COUNT(DISTINCT l.LessonID) as total_lessons,
                            COUNT(DISTINCT q.QuizID) as total_quizzes,
                            COUNT(DISTINCT ex.ExamID) as total_exams
                     FROM courses c
                     LEFT JOIN enrollments e ON c.CourseID = e.CourseID
                     LEFT JOIN lessons l ON c.CourseID = l.CourseID
                     LEFT JOIN quizzes q ON l.LessonID = q.LessonID
                     LEFT JOIN exams ex ON c.CourseID = ex.CourseID
                     WHERE c.TeacherID = ?
                     GROUP BY c.CourseID";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$this->teacher_id]);
            $courseStats = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get recent activities
            $query = "SELECT 
                        CASE 
                            WHEN l.LessonName IS NOT NULL THEN CONCAT('New lesson added: ', l.LessonName)
                            WHEN q.QuizName IS NOT NULL THEN CONCAT('New quiz added: ', q.QuizName)
                            WHEN ex.ExamName IS NOT NULL THEN CONCAT('New exam added: ', ex.ExamName)
                        END as activity,
                        CASE 
                            WHEN l.CreatedAt IS NOT NULL THEN l.CreatedAt
                            WHEN q.CreatedAt IS NOT NULL THEN q.CreatedAt
                            WHEN ex.CreatedAt IS NOT NULL THEN ex.CreatedAt
                        END as created_at
                     FROM courses c
                     LEFT JOIN lessons l ON c.CourseID = l.CourseID
                     LEFT JOIN quizzes q ON l.LessonID = q.LessonID
                     LEFT JOIN exams ex ON c.CourseID = ex.CourseID
                     WHERE c.TeacherID = ?
                     ORDER BY created_at DESC
                     LIMIT 5";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$this->teacher_id]);
            $recentActivities = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get upcoming deadlines
            $query = "SELECT 
                        CASE 
                            WHEN q.QuizName IS NOT NULL THEN CONCAT('Quiz: ', q.QuizName)
                            WHEN ex.ExamName IS NOT NULL THEN CONCAT('Exam: ', ex.ExamName)
                        END as deadline,
                        CASE 
                            WHEN q.CreatedAt IS NOT NULL THEN q.CreatedAt
                            WHEN ex.CreatedAt IS NOT NULL THEN ex.CreatedAt
                        END as deadline_date
                     FROM courses c
                     LEFT JOIN lessons l ON c.CourseID = l.CourseID
                     LEFT JOIN quizzes q ON l.LessonID = q.LessonID
                     LEFT JOIN exams ex ON c.CourseID = ex.CourseID
                     WHERE c.TeacherID = ?
                     ORDER BY deadline_date ASC
                     LIMIT 5";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$this->teacher_id]);
            $upcomingDeadlines = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return array(
                "total_courses" => $totalCourses,
                "total_students" => $totalStudents,
                "total_lessons" => $totalLessons,
                "total_exams" => $totalExams,
                "student_progress" => $studentProgress,
                "course_statistics" => $courseStats,
                "recent_activities" => $recentActivities,
                "upcoming_deadlines" => $upcomingDeadlines
            );
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

// Check if teacher_id is provided
if (!isset($_GET['teacher_id'])) {
    http_response_code(400);
    echo json_encode(array("error" => "Teacher ID is required"));
    exit();
}

$dashboard = new Dashboard($db);

try {
    $result = $dashboard->getStatistics();
    
    // Check if the result contains an error
    if (isset($result['error'])) {
        http_response_code(500);
        echo json_encode(array("error" => $result['error']));
        exit();
    }
    
    // Ensure all required fields are present
    $requiredFields = array(
        "total_courses",
        "total_students",
        "total_lessons",
        "total_exams",
        "student_progress",
        "course_statistics",
        "recent_activities",
        "upcoming_deadlines"
    );
    
    foreach ($requiredFields as $field) {
        if (!isset($result[$field])) {
            $result[$field] = 0; // Set default value if missing
        }
    }
    
    // Ensure proper content type
    header("Content-Type: application/json; charset=UTF-8");
    
    // Send response
    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("error" => "Server error: " . $e->getMessage()));
}
exit();
?> 