<?php
include('config.php');
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0); // تعطيل في البيئة الإنتاجية

if (session_status() === PHP_SESSION_NONE) session_start();

try {
    // التحقق الأساسي من المعرف
    if (!isset($_GET['course_id']) || !filter_var($_GET['course_id'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]])) {
        throw new Exception('معرف الدورة غير صالح', 400);
    }

    // التحقق من الهوية والصلاحيات
    if (empty($_SESSION['user_id']) || $_SESSION['role'] !== 'Student') {
        throw new Exception('يجب تسجيل الدخول كمستخدم طالب', 401);
    }

    $course_id = (int)$_GET['course_id'];
    $student_id = (int)$_SESSION['user_id'];

    // التحقق من تسجيل الطالب في الدورة
    $enrollmentCheck = $conn->prepare("
        SELECT 1 FROM enrollments 
        WHERE StudentID = ? AND CourseID = ?
        LIMIT 1
    ");
    $enrollmentCheck->execute([$student_id, $course_id]);
    
    if (!$enrollmentCheck->fetchColumn()) {
        throw new Exception('غير مصرح بالوصول للدورة', 403);
    }

    // استعلام بيانات الدورة الأساسية
    $courseStmt = $conn->prepare("
        SELECT 
            c.CourseID,
            c.CourseName,
            c.Description,
            u.Username AS TeacherName,
            s.SectionName,
            s.GradeLevel,
            c.AcademicYear
        FROM courses c
        INNER JOIN users u ON c.TeacherID = u.UserID
        LEFT JOIN sections s ON c.SectionID = s.SectionID
        WHERE c.CourseID = ?
    ");
    $courseStmt->execute([$course_id]);
    $course = $courseStmt->fetch(PDO::FETCH_ASSOC);

    if (!$course) {
        throw new Exception('الدورة غير موجودة', 404);
    }

    // Get lessons with progress
    $lessons = $conn->prepare("
        SELECT 
            l.LessonID,
            l.LessonName AS title,
            l.Content,
            l.VideoURL AS video_url,
            l.Duration,
            CASE WHEN lp.CompletedAt IS NOT NULL THEN 1 ELSE 0 END as is_completed
        FROM lessons l
        LEFT JOIN lesson_progress lp 
            ON l.LessonID = lp.LessonID 
            AND lp.StudentID = ?
        WHERE l.CourseID = ?
        ORDER BY l.LessonID
    ");
    $lessons->execute([$student_id, $course_id]);
    $lessonData = $lessons->fetchAll(PDO::FETCH_ASSOC);

    // Get quizzes for each lesson
    $quizzes = $conn->prepare("
        SELECT 
            q.QuizID,
            q.LessonID,
            q.QuizName,
            COALESCE(qr.Score, 0) AS score,
            CASE WHEN qr.QuizResultID IS NOT NULL THEN 1 ELSE 0 END as is_completed,
            qr.TakenAt,
            (SELECT COUNT(*) FROM quizquestions WHERE QuizID = q.QuizID) as QuestionCount
        FROM quizzes q
        LEFT JOIN quizresults qr 
            ON q.QuizID = qr.QuizID 
            AND qr.StudentID = ?
        WHERE q.LessonID IN (
            SELECT LessonID FROM lessons WHERE CourseID = ?
        )
        ORDER BY q.QuizID
    ");
    $quizzes->execute([$student_id, $course_id]);
    $quizData = $quizzes->fetchAll(PDO::FETCH_ASSOC);

    // Calculate total duration
    $totalDuration = 0;
    foreach ($lessonData as $lesson) {
        preg_match('/(\d+)\s*[mM]/', $lesson['Duration'], $matches);
        $minutes = $matches[1] ?? 0;
        $totalDuration += (int)$minutes;
    }

    // Calculate progress
    $totalLessons = count($lessonData);
    $completedLessons = count(array_filter($lessonData, fn($l) => $l['is_completed'] == 1));
    $totalQuizzes = count($quizData);
    $completedQuizzes = count(array_filter($quizData, fn($q) => $q['is_completed'] == 1));
    
    $progressPercentage = 0;
    if ($totalLessons > 0) {
        $progressPercentage = round(($completedLessons / $totalLessons) * 100);
    }

    // Associate quizzes with lessons
    $lessonsWithQuizzes = array_map(function($lesson) use ($quizData) {
        $lesson['quizzes'] = array_values(array_filter($quizData, function($quiz) use ($lesson) {
            return $quiz['LessonID'] == $lesson['LessonID'];
        }));
        return $lesson;
    }, $lessonData);

    $response = [
        'status' => 'success',
        'course' => [
            'id' => $course['CourseID'],
            'name' => $course['CourseName'],
            'description' => $course['Description'],
            'teacher' => $course['TeacherName'],
            'section' => $course['SectionName'],
            'grade_level' => $course['GradeLevel'],
            'academic_year' => $course['AcademicYear'],
            'stats' => [
                'total_lessons' => $totalLessons,
                'total_quizzes' => $totalQuizzes,
                'total_duration' => sprintf('%dh %02dm', floor($totalDuration/60), $totalDuration%60)
            ]
        ],
        'progress' => [
            'percentage' => $progressPercentage,
            'completed_lessons' => $completedLessons,
            'completed_quizzes' => $completedQuizzes
        ],
        'lessons' => array_map(function($lesson) {
            return [
                'id' => $lesson['LessonID'],
                'title' => $lesson['title'],
                'content' => $lesson['Content'],
                'video_url' => $lesson['video_url'],
                'duration' => $lesson['Duration'],
                'is_completed' => (bool)$lesson['is_completed'],
                'quizzes' => array_map(function($quiz) {
                    return [
                        'QuizID' => $quiz['QuizID'],
                        'QuizName' => $quiz['QuizName'],
                        'QuestionCount' => $quiz['QuestionCount'],
                        'score' => $quiz['score'],
                        'is_completed' => (bool)$quiz['is_completed'],
                        'taken_at' => $quiz['TakenAt']
                    ];
                }, $lesson['quizzes'])
            ];
        }, $lessonsWithQuizzes)
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    $statusCode = $e->getCode() ?: 500;
    http_response_code($statusCode);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} finally {
    $conn = null;
}