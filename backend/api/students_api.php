<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

class Student {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all students for a teacher
    public function getStudents($teacher_id) {
        try {
            $query = "SELECT DISTINCT u.UserID, u.Username, u.Email, s.SectionName, s.GradeLevel,
                             COUNT(DISTINCT e.CourseID) as enrolled_courses
                      FROM users u
                      JOIN enrollments e ON u.UserID = e.StudentID
                      JOIN courses c ON e.CourseID = c.CourseID
                      JOIN sections s ON c.SectionID = s.SectionID
                      WHERE c.TeacherID = ? AND u.Role = 'Student'
                      GROUP BY u.UserID, u.Username, u.Email, s.SectionName, s.GradeLevel";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([$teacher_id]);
            
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Log the result for debugging
            error_log("Students query result: " . print_r($result, true));
            
            return $result;
        } catch(PDOException $e) {
            error_log("Error in getStudents: " . $e->getMessage());
            return array("error" => $e->getMessage());
        }
    }

    // Get single student details
    public function getStudent($student_id, $teacher_id) {
        try {
            // Get student basic info
            $query = "SELECT u.*, s.SectionName, s.GradeLevel, p.FullName, p.Bio, p.ProfilePictureURL
                     FROM users u
                     JOIN sections s ON u.SectionID = s.SectionID
                     LEFT JOIN profiles p ON u.UserID = p.UserID
                     WHERE u.UserID = ? AND u.Role = 'Student'";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$student_id]);
            $student = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$student) {
                return array("error" => "Student not found");
            }

            // Get enrolled courses
            $query = "SELECT c.*, 
                            COUNT(DISTINCT lp.LessonID) as completed_lessons,
                            COUNT(DISTINCT l.LessonID) as total_lessons,
                            AVG(qr.Score) as quiz_avg,
                            AVG(er.Score) as exam_avg
                     FROM enrollments e
                     JOIN courses c ON e.CourseID = c.CourseID
                     JOIN lessons l ON c.CourseID = l.CourseID
                     LEFT JOIN lesson_progress lp ON l.LessonID = lp.LessonID AND e.StudentID = lp.StudentID
                     LEFT JOIN quizzes q ON l.LessonID = q.LessonID
                     LEFT JOIN quizresults qr ON q.QuizID = qr.QuizID AND e.StudentID = qr.StudentID
                     LEFT JOIN exams ex ON c.CourseID = ex.CourseID
                     LEFT JOIN examresults er ON ex.ExamID = er.ExamID AND e.StudentID = er.StudentID
                     WHERE e.StudentID = ? AND c.TeacherID = ?
                     GROUP BY c.CourseID";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$student_id, $teacher_id]);
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get recent activities
            $query = "SELECT 
                        CASE 
                            WHEN lp.ProgressID IS NOT NULL THEN CONCAT('Completed lesson: ', l.LessonName)
                            WHEN qr.QuizResultID IS NOT NULL THEN CONCAT('Took quiz: ', q.QuizName)
                            WHEN er.ExamResultID IS NOT NULL THEN CONCAT('Took exam: ', ex.ExamName)
                        END as activity,
                        CASE 
                            WHEN lp.CompletedAt IS NOT NULL THEN lp.CompletedAt
                            WHEN qr.TakenAt IS NOT NULL THEN qr.TakenAt
                            WHEN er.TakenAt IS NOT NULL THEN er.TakenAt
                        END as activity_date
                     FROM enrollments e
                     JOIN courses c ON e.CourseID = c.CourseID
                     JOIN lessons l ON c.CourseID = l.CourseID
                     LEFT JOIN lesson_progress lp ON l.LessonID = lp.LessonID AND e.StudentID = lp.StudentID
                     LEFT JOIN quizzes q ON l.LessonID = q.LessonID
                     LEFT JOIN quizresults qr ON q.QuizID = qr.QuizID AND e.StudentID = qr.StudentID
                     LEFT JOIN exams ex ON c.CourseID = ex.CourseID
                     LEFT JOIN examresults er ON ex.ExamID = er.ExamID AND e.StudentID = er.StudentID
                     WHERE e.StudentID = ? AND c.TeacherID = ?
                     ORDER BY activity_date DESC
                     LIMIT 10";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$student_id, $teacher_id]);
            $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $student['courses'] = $courses;
            $student['activities'] = $activities;
            return $student;
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Update student profile
    public function updateStudentProfile($data) {
        try {
            $this->conn->beginTransaction();

            // Update user info
            $query = "UPDATE users 
                     SET Username = ?, Email = ?, SectionID = ? 
                     WHERE UserID = ? AND Role = 'Student'";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['username'],
                $data['email'],
                $data['sectionId'],
                $data['studentId']
            ]);

            // Update or insert profile
            $query = "INSERT INTO profiles (UserID, FullName, Bio, ProfilePictureURL) 
                     VALUES (?, ?, ?, ?) 
                     ON DUPLICATE KEY UPDATE 
                     FullName = VALUES(FullName), 
                     Bio = VALUES(Bio), 
                     ProfilePictureURL = VALUES(ProfilePictureURL)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['studentId'],
                $data['fullName'],
                $data['bio'],
                $data['profilePictureUrl']
            ]);

            $this->conn->commit();
            return array("success" => true);
        } catch(PDOException $e) {
            $this->conn->rollBack();
            return array("error" => $e->getMessage());
        }
    }

    // Enroll student in a course
    public function enrollStudent($data) {
        try {
            $query = "INSERT INTO enrollments (StudentID, CourseID, SectionID, AcademicYear) 
                     VALUES (?, ?, ?, ?)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['studentId'],
                $data['courseId'],
                $data['sectionId'],
                $data['academicYear']
            ]);
            
            return array("success" => true);
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Unenroll student from a course
    public function unenrollStudent($student_id, $course_id) {
        try {
            $query = "DELETE FROM enrollments 
                     WHERE StudentID = ? AND CourseID = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$student_id, $course_id]);
            
            return array("success" => true);
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }
}

$database = new Database();
$db = $database->getConnection();

$student = new Student($db);

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['student_id']) && isset($_GET['teacher_id'])) {
            $result = $student->getStudent($_GET['student_id'], $_GET['teacher_id']);
        } else if(isset($_GET['teacher_id'])) {
            $result = $student->getStudents($_GET['teacher_id']);
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if(isset($data['studentId']) && isset($data['courseId'])) {
            $result = $student->enrollStudent($data);
        } else {
            $result = array("error" => "Invalid request");
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if(isset($data['studentId'])) {
            $result = $student->updateStudentProfile($data);
        } else {
            $result = array("error" => "Invalid request");
        }
        break;
        
    case 'DELETE':
        if(isset($_GET['student_id']) && isset($_GET['course_id'])) {
            $result = $student->unenrollStudent($_GET['student_id'], $_GET['course_id']);
        } else {
            $result = array("error" => "Invalid request");
        }
        break;
}

echo json_encode($result);
?> 