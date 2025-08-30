<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'config.php';
require_once 'db.php';
require_once 'api_base.php';

// Check if user is a teacher
if (!checkTeacher()) {
    sendResponse(false, 'Unauthorized access', 403);
    exit;
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get_dashboard_stats':
            $stats = [
                'total_courses' => 0,
                'total_students' => 0,
                'total_lessons' => 0,
                'total_exams' => 0,
                'recent_activities' => [],
                'upcoming_deadlines' => []
            ];
            
            // Get total courses
            $stmt = $conn->prepare("SELECT COUNT(*) FROM Courses WHERE TeacherID = ?");
            $stmt->bind_param("i", $_SESSION['user_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $stats['total_courses'] = $result->fetch_row()[0];
            
            // Get total students
            $stmt = $conn->prepare("SELECT COUNT(DISTINCT e.StudentID) 
                                  FROM Enrollments e
                                  JOIN Courses c ON e.CourseID = c.CourseID
                                  WHERE c.TeacherID = ?");
            $stmt->bind_param("i", $_SESSION['user_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $stats['total_students'] = $result->fetch_row()[0];
            
            // Get total lessons
            $stmt = $conn->prepare("SELECT COUNT(*) 
                                  FROM Lessons l
                                  JOIN Courses c ON l.CourseID = c.CourseID
                                  WHERE c.TeacherID = ?");
            $stmt->bind_param("i", $_SESSION['user_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $stats['total_lessons'] = $result->fetch_row()[0];
            
            // Get total exams
            $stmt = $conn->prepare("SELECT COUNT(*) 
                                  FROM Exams e
                                  JOIN Courses c ON e.CourseID = c.CourseID
                                  WHERE c.TeacherID = ?");
            $stmt->bind_param("i", $_SESSION['user_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $stats['total_exams'] = $result->fetch_row()[0];
            
            sendResponse(true, $stats);
            break;
            
        case 'add_course':
            $data = getPostData();
            
            if (empty($data['courseName'])) {
                sendResponse(false, 'Course name is required');
                exit;
            }
            
            $stmt = $conn->prepare("INSERT INTO Courses (CourseName, Description, TeacherID, SectionID) 
                                  VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssii", 
                $data['courseName'],
                $data['description'],
                $_SESSION['user_id'],
                $data['sectionId']
            );
            
            if ($stmt->execute()) {
                sendResponse(true, [
                    'courseId' => $stmt->insert_id,
                    'message' => 'Course added successfully'
                ]);
            } else {
                handleDbError($conn);
            }
            break;
            
        case 'getCourseStats':
            $stmt = $conn->prepare("
                SELECT 
                    c.CourseName,
                    COUNT(DISTINCT l.LessonID) as total_lessons,
                    COUNT(DISTINCT CASE WHEN sl.Completed = 1 THEN sl.LessonID END) as completed_lessons,
                    ROUND((COUNT(DISTINCT CASE WHEN sl.Completed = 1 THEN sl.LessonID END) / 
                          COUNT(DISTINCT l.LessonID)) * 100, 2) as completion_rate
                FROM courses c
                LEFT JOIN lessons l ON c.CourseID = l.CourseID
                LEFT JOIN student_lessons sl ON l.LessonID = sl.LessonID
                WHERE c.TeacherID = ?
                GROUP BY c.CourseID, c.CourseName
            ");
            $stmt->bind_param("i", $_SESSION['user_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $stats = $result->fetch_all(MYSQLI_ASSOC);
            sendResponse(true, $stats);
            break;

        case 'getStudentPerformance':
            $stmt = $conn->prepare("
                SELECT 
                    a.AssessmentName,
                    ROUND(AVG(ar.Score), 2) as average_score,
                    COUNT(DISTINCT ar.StudentID) as total_students
                FROM assessments a
                JOIN assessment_results ar ON a.AssessmentID = ar.AssessmentID
                JOIN courses c ON a.CourseID = c.CourseID
                WHERE c.TeacherID = ?
                GROUP BY a.AssessmentID, a.AssessmentName
                ORDER BY a.DateCreated DESC
                LIMIT 10
            ");
            $stmt->bind_param("i", $_SESSION['user_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $performance = $result->fetch_all(MYSQLI_ASSOC);
            sendResponse(true, $performance);
            break;

        case 'getStudentEnrollment':
            $stmt = $conn->prepare("
                SELECT 
                    c.CourseID,
                    c.CourseName,
                    c.Description,
                    COUNT(DISTINCT e.StudentID) as EnrolledStudents
                FROM courses c
                LEFT JOIN enrollments e ON c.CourseID = e.CourseID
                WHERE c.TeacherID = ?
                GROUP BY c.CourseID, c.CourseName, c.Description
                ORDER BY c.CourseName
            ");
            $stmt->bind_param("i", $_SESSION['user_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $enrollment = $result->fetch_all(MYSQLI_ASSOC);
            sendResponse(true, $enrollment);
            break;
            
        default:
            sendResponse(false, 'Invalid action', 400);
    }
} catch (Exception $e) {
    sendResponse(false, $e->getMessage(), 500);
}
?> 