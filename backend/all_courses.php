<?php
include('config.php');
header('Content-Type: application/json; charset=utf-8');
error_reporting(E_ALL);
ini_set('display_errors', 0);

try {
    if (session_status() === PHP_SESSION_NONE) session_start();

    if (empty($_SESSION['user_id'])) {
        throw new Exception('يجب تسجيل الدخول أولاً', 401);
    }

    if ($_SESSION['role'] !== 'Student') {
        throw new Exception('الوصول مسموح للطلاب فقط', 403);
    }

    $student_id = (int)$_SESSION['user_id'];

    $query = "
        SELECT 
            c.CourseID,
            c.CourseName,
            COALESCE(c.Description, 'لا يوجد وصف') AS Description,
            c.urlIMG,
            c.CreatedAt,
            u.Username AS TeacherName,
            COALESCE(s.SectionName, 'غير محدد') AS SectionName,
            COALESCE(c.AcademicYear, 'غير محدد') AS AcademicYear
        FROM courses c
        LEFT JOIN users u ON c.TeacherID = u.UserID
        LEFT JOIN sections s ON c.SectionID = s.SectionID
        WHERE c.CourseID NOT IN (
            SELECT CourseID 
            FROM enrollments 
            WHERE StudentID = :student_id
        )
        ORDER BY c.CreatedAt DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':student_id', $student_id, PDO::PARAM_INT);
    $stmt->execute();

    $courses = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $courses[] = [
            'id' => (int)$row['CourseID'],
            'name' => htmlspecialchars($row['CourseName']),
            'description' => htmlspecialchars($row['Description']),
            'image' => filter_var($row['urlIMG'], FILTER_SANITIZE_URL),
            'teacher' => htmlspecialchars($row['TeacherName']),
            'section' => htmlspecialchars($row['SectionName']),
            'year' => htmlspecialchars($row['AcademicYear']),
            'created_at' => date('Y-m-d', strtotime($row['CreatedAt']))
        ];
    }

    echo json_encode([
        'success' => true,
        'count' => count($courses),
        'data' => $courses
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'خطأ في النظام'
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    $code = $e->getCode() ?: 400;
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}