<?php
// Set headers for JSON response
header('Content-Type: application/json');
error_reporting(0); // Disable error reporting for production

require_once 'config.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'getAll':
            $stmt = $pdo->query("SELECT c.*, u.Username as TeacherName, s.SectionName 
                                FROM courses c 
                                LEFT JOIN users u ON c.TeacherID = u.UserID 
                                LEFT JOIN sections s ON c.SectionID = s.SectionID");
            $courses = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $courses]);
            break;

        case 'getById':
            $courseId = $_GET['courseId'] ?? 0;
            $stmt = $pdo->prepare("SELECT c.*, u.Username as TeacherName, s.SectionName 
                                  FROM courses c 
                                  LEFT JOIN users u ON c.TeacherID = u.UserID 
                                  LEFT JOIN sections s ON c.SectionID = s.SectionID 
                                  WHERE c.CourseID = ?");
            $stmt->execute([$courseId]);
            $course = $stmt->fetch();
            echo json_encode(['success' => true, 'data' => $course]);
            break;

        case 'getTeachers':
            // New case to handle getTeachers action
            $stmt = $pdo->query("SELECT UserID, Username FROM users WHERE Role = 'Teacher'");
            $teachers = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $teachers]);
            break;

        case 'add':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                throw new Exception('Invalid input data');
            }
            $stmt = $pdo->prepare("INSERT INTO courses (CourseName, Description, TeacherID, SectionID) 
                                  VALUES (?, ?, ?, ?)");
            $stmt->execute([$data['courseName'], $data['description'], $data['teacherId'], $data['sectionId']]);
            echo json_encode(['success' => true, 'message' => 'Course added successfully']);
            break;

        case 'update':
            $courseId = $_GET['courseId'] ?? 0;
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                throw new Exception('Invalid input data');
            }
            $stmt = $pdo->prepare("UPDATE courses SET CourseName = ?, Description = ?, TeacherID = ?, SectionID = ? 
                                  WHERE CourseID = ?");
            $stmt->execute([$data['courseName'], $data['description'], $data['teacherId'], $data['sectionId'], $courseId]);
            echo json_encode(['success' => true, 'message' => 'Course updated successfully']);
            break;

        case 'delete':
            $courseId = $_GET['courseId'] ?? 0;
            $stmt = $pdo->prepare("DELETE FROM courses WHERE CourseID = ?");
            $stmt->execute([$courseId]);
            echo json_encode(['success' => true, 'message' => 'Course deleted successfully']);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>