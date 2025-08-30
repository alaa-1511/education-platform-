<?php
header('Content-Type: application/json');
require_once 'config.php';

// Function to send JSON response
function sendResponse($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Check if database connection exists
if (!isset($conn)) {
    sendResponse(false, 'Database connection failed');
}

// Function to generate student performance report
function generateStudentPerformanceReport() {
    global $conn;
    try {
        $stmt = $conn->prepare("
            SELECT 
                u.UserID,
                u.Username,
                u.Email,
                s.SectionName,
                s.GradeLevel,
                s.AcademicYear,
                COUNT(DISTINCT e.ExamID) as TotalExams,
                AVG(er.Score) as AverageScore,
                MAX(er.Score) as HighestScore,
                MIN(er.Score) as LowestScore
            FROM Users u
            LEFT JOIN Sections s ON u.SectionID = s.SectionID
            LEFT JOIN ExamResults er ON u.UserID = er.StudentID
            LEFT JOIN Exams e ON er.ExamID = e.ExamID
            WHERE u.Role = 'Student'
            GROUP BY u.UserID, u.Username, u.Email, s.SectionName, s.GradeLevel, s.AcademicYear
            ORDER BY s.AcademicYear DESC, s.GradeLevel, s.SectionName, u.Username
        ");
        $stmt->execute();
        $report = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'data' => $report,
            'generatedAt' => date('Y-m-d H:i:s')
        ];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Error generating student performance report: ' . $e->getMessage()
        ];
    }
}

// Function to generate course enrollment report
function generateCourseEnrollmentReport() {
    global $conn;
    try {
        $stmt = $conn->prepare("
            SELECT 
                c.CourseID,
                c.CourseName,
                u.Username as TeacherName,
                s.SectionName,
                s.GradeLevel,
                s.AcademicYear,
                COUNT(DISTINCT e.StudentID) as TotalEnrollments,
                COUNT(DISTINCT CASE WHEN cl.CompletionDate IS NOT NULL THEN e.StudentID END) as CompletedStudents,
                COUNT(DISTINCT CASE WHEN cl.CompletionDate IS NULL THEN e.StudentID END) as InProgressStudents,
                AVG(CASE WHEN cl.CompletionDate IS NOT NULL THEN cl.Score END) as AverageCompletionScore
            FROM Courses c
            LEFT JOIN Users u ON c.TeacherID = u.UserID
            LEFT JOIN Sections s ON c.SectionID = s.SectionID
            LEFT JOIN Enrollments e ON c.CourseID = e.CourseID
            LEFT JOIN CompletedLessons cl ON e.EnrollmentID = cl.EnrollmentID
            GROUP BY c.CourseID, c.CourseName, u.Username, s.SectionName, s.GradeLevel, s.AcademicYear
            ORDER BY s.AcademicYear DESC, s.GradeLevel, s.SectionName, c.CourseName
        ");
        $stmt->execute();
        $report = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'data' => $report,
            'generatedAt' => date('Y-m-d H:i:s')
        ];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Error generating course enrollment report: ' . $e->getMessage()
        ];
    }
}

// Function to generate exam results report
function generateExamResultsReport() {
    global $conn;
    try {
        $stmt = $conn->prepare("
            SELECT 
                e.ExamID,
                e.Title as ExamTitle,
                c.CourseName,
                u.Username as TeacherName,
                s.SectionName,
                s.GradeLevel,
                s.AcademicYear,
                COUNT(DISTINCT er.StudentID) as TotalParticipants,
                AVG(er.Score) as AverageScore,
                MAX(er.Score) as HighestScore,
                MIN(er.Score) as LowestScore,
                COUNT(DISTINCT CASE WHEN er.Score >= 70 THEN er.StudentID END) as PassedStudents,
                COUNT(DISTINCT CASE WHEN er.Score < 70 THEN er.StudentID END) as FailedStudents
            FROM Exams e
            LEFT JOIN Courses c ON e.CourseID = c.CourseID
            LEFT JOIN Users u ON c.TeacherID = u.UserID
            LEFT JOIN Sections s ON c.SectionID = s.SectionID
            LEFT JOIN ExamResults er ON e.ExamID = er.ExamID
            GROUP BY e.ExamID, e.Title, c.CourseName, u.Username, s.SectionName, s.GradeLevel, s.AcademicYear
            ORDER BY s.AcademicYear DESC, s.GradeLevel, s.SectionName, e.ExamDate DESC
        ");
        $stmt->execute();
        $report = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'data' => $report,
            'generatedAt' => date('Y-m-d H:i:s')
        ];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Error generating exam results report: ' . $e->getMessage()
        ];
    }
}

// Function to save report to file
function saveReportToFile($report, $reportType) {
    $filename = "reports/{$reportType}_" . date('Y-m-d_H-i-s') . ".json";
    
    // Create reports directory if it doesn't exist
    if (!file_exists('reports')) {
        mkdir('reports', 0777, true);
    }
    
    // Save report to file
    file_put_contents($filename, json_encode($report, JSON_PRETTY_PRINT));
    
    return $filename;
}

// Handle API requests
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'studentPerformance':
        $report = generateStudentPerformanceReport();
        if ($report['success']) {
            $filename = saveReportToFile($report, 'student_performance');
            $report['filename'] = $filename;
        }
        echo json_encode($report);
        break;
        
    case 'courseEnrollment':
        $report = generateCourseEnrollmentReport();
        if ($report['success']) {
            $filename = saveReportToFile($report, 'course_enrollment');
            $report['filename'] = $filename;
        }
        echo json_encode($report);
        break;
        
    case 'examResults':
        $report = generateExamResultsReport();
        if ($report['success']) {
            $filename = saveReportToFile($report, 'exam_results');
            $report['filename'] = $filename;
        }
        echo json_encode($report);
        break;
        
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action'
        ]);
} 