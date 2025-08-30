<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'config.php';
session_start();

// التحقق من أن المستخدم معلم
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'Teacher') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized access']);
    exit;
}

$teacherId = $_SESSION['user_id'];

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get_dashboard_stats':
            getDashboardStats($teacherId);
            break;
        case 'get_courses':
            getTeacherCourses($teacherId);
            break;
        case 'add_course':
            addCourse($teacherId);
            break;
        case 'get_lessons':
            $courseId = $_GET['course_id'] ?? 0;
            getCourseLessons($courseId, $teacherId);
            break;
        case 'add_lesson':
            addLesson($teacherId);
            break;
        case 'get_quizzes':
            $courseId = $_GET['course_id'] ?? 0;
            getCourseQuizzes($courseId, $teacherId);
            break;
        case 'add_quiz':
            addQuiz($teacherId);
            break;
        case 'get_exams':
            $courseId = $_GET['course_id'] ?? 0;
            getCourseExams($courseId, $teacherId);
            break;
        case 'add_exam':
            addExam($teacherId);
            break;
        case 'get_students':
            $courseId = $_GET['course_id'] ?? 0;
            getCourseStudents($courseId, $teacherId);
            break;
        case 'get_grades':
            $courseId = $_GET['course_id'] ?? 0;
            getCourseGrades($courseId, $teacherId);
            break;
        case 'get_attendance':
            $courseId = $_GET['course_id'] ?? 0;
            getCourseAttendance($courseId, $teacherId);
            break;
        case 'get_profile':
            getTeacherProfile($teacherId);
            break;
        case 'update_profile':
            updateTeacherProfile($teacherId);
            break;
        case 'get_sections':
            getSections();
            break;
          // ... أكواد موجودة مسبقا ...
        case 'get_teacher_students':
            getTeacherStudents($teacherId);
            break;
       
    // ... أكواد موجودة مسبقا ...
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// الدوال المساعدة للوظائف المختلفة
function getDashboardStats($teacherId) {
    global $pdo;
    
    $stats = [];
    
    // عدد الكورسات
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM Courses WHERE TeacherID = ?");
    $stmt->execute([$teacherId]);
    $stats['total_courses'] = $stmt->fetchColumn();
    
    // عدد الطلاب
    $stmt = $pdo->prepare("SELECT COUNT(DISTINCT e.StudentID) 
                          FROM Enrollments e
                          JOIN Courses c ON e.CourseID = c.CourseID
                          WHERE c.TeacherID = ?");
    $stmt->execute([$teacherId]);
    $stats['total_students'] = $stmt->fetchColumn();
    
    // عدد الدروس
    $stmt = $pdo->prepare("SELECT COUNT(*) 
                          FROM Lessons l
                          JOIN Courses c ON l.CourseID = c.CourseID
                          WHERE c.TeacherID = ?");
    $stmt->execute([$teacherId]);
    $stats['total_lessons'] = $stmt->fetchColumn();
    
    // عدد الاختبارات
    $stmt = $pdo->prepare("SELECT COUNT(*) 
                          FROM Exams e
                          JOIN Courses c ON e.CourseID = c.CourseID
                          WHERE c.TeacherID = ?");
    $stmt->execute([$teacherId]);
    $stats['total_exams'] = $stmt->fetchColumn();
    
    // الأنشطة الحديثة
    $stmt = $pdo->prepare("(
                          SELECT 'quiz' AS type, q.QuizName AS title, qr.TakenAt AS date, c.CourseName
                          FROM QuizResults qr
                          JOIN Quizzes q ON qr.QuizID = q.QuizID
                          JOIN Lessons l ON q.LessonID = l.LessonID
                          JOIN Courses c ON l.CourseID = c.CourseID
                          WHERE c.TeacherID = ?
                          ORDER BY qr.TakenAt DESC
                          LIMIT 5
                          ) UNION (
                          SELECT 'exam' AS type, e.ExamName AS title, er.TakenAt AS date, c.CourseName
                          FROM ExamResults er
                          JOIN Exams e ON er.ExamID = e.ExamID
                          JOIN Courses c ON e.CourseID = c.CourseID
                          WHERE c.TeacherID = ?
                          ORDER BY er.TakenAt DESC
                          LIMIT 5
                          ) ORDER BY date DESC LIMIT 5");
    $stmt->execute([$teacherId, $teacherId]);
    $stats['recent_activities'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // المواعيد النهائية القادمة (إزالة الجزء الخاص بـ Assignments)
    $stmt = $pdo->prepare("SELECT 'exam' AS type, e.ExamName AS title, DATE_ADD(NOW(), INTERVAL 7 DAY) AS deadline, c.CourseName
                          FROM Exams e
                          JOIN Courses c ON e.CourseID = c.CourseID
                          WHERE c.TeacherID = ?
                          ORDER BY deadline ASC
                          LIMIT 5");
    $stmt->execute([$teacherId]);
    $stats['upcoming_deadlines'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($stats);
}

function getTeacherCourses($teacherId) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT c.*, COUNT(e.StudentID) AS student_count 
                          FROM Courses c
                          LEFT JOIN Enrollments e ON c.CourseID = e.CourseID
                          WHERE c.TeacherID = ?
                          GROUP BY c.CourseID");
    $stmt->execute([$teacherId]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($courses);
}

function addCourse($teacherId) {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $courseName = $data['courseName'] ?? '';
    $description = $data['description'] ?? '';
    $sectionId = $data['sectionId'] ?? null;
    
    if (empty($courseName)) {
        throw new Exception("Course name is required");
    }
    
    $stmt = $pdo->prepare("INSERT INTO Courses (CourseName, Description, TeacherID, SectionID, AcademicYear) 
                          VALUES (?, ?, ?, ?, (SELECT AcademicYear FROM Sections WHERE SectionID = ?))");
    $stmt->execute([$courseName, $description, $teacherId, $sectionId, $sectionId]);
    
    $courseId = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'courseId' => $courseId,
        'message' => 'Course added successfully'
    ]);
}

function getCourseLessons($courseId, $teacherId) {
    global $pdo;
    
    // التحقق من أن الكورس يخص المعلم
    $stmt = $pdo->prepare("SELECT 1 FROM Courses WHERE CourseID = ? AND TeacherID = ?");
    $stmt->execute([$courseId, $teacherId]);
    if (!$stmt->fetch()) {
        throw new Exception("Unauthorized access to course");
    }
    
    $stmt = $pdo->prepare("SELECT * FROM Lessons WHERE CourseID = ? ORDER BY CreatedAt");
    $stmt->execute([$courseId]);
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($lessons);
}

function addLesson($teacherId) {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $courseId = $data['courseId'] ?? 0;
    $lessonName = $data['lessonName'] ?? '';
    $content = $data['content'] ?? '';
    $videoUrl = $data['videoUrl'] ?? '';
    
    // التحقق من أن الكورس يخص المعلم
    $stmt = $pdo->prepare("SELECT 1 FROM Courses WHERE CourseID = ? AND TeacherID = ?");
    $stmt->execute([$courseId, $teacherId]);
    if (!$stmt->fetch()) {
        throw new Exception("Unauthorized access to course");
    }
    
    if (empty($lessonName) || empty($content)) {
        throw new Exception("Lesson name and content are required");
    }
    
    $stmt = $pdo->prepare("INSERT INTO Lessons (CourseID, LessonName, Content, VideoURL) 
                          VALUES (?, ?, ?, ?)");
    $stmt->execute([$courseId, $lessonName, $content, $videoUrl]);
    
    $lessonId = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'lessonId' => $lessonId,
        'message' => 'Lesson added successfully'
    ]);
}

function getCourseQuizzes($courseId, $teacherId) {
    global $pdo;
    
    // التحقق من أن الكورس يخص المعلم
    $stmt = $pdo->prepare("SELECT 1 FROM Courses WHERE CourseID = ? AND TeacherID = ?");
    $stmt->execute([$courseId, $teacherId]);
    if (!$stmt->fetch()) {
        throw new Exception("Unauthorized access to course");
    }
    
    $stmt = $pdo->prepare("SELECT q.*, l.LessonName 
                          FROM Quizzes q
                          JOIN Lessons l ON q.LessonID = l.LessonID
                          WHERE l.CourseID = ?
                          ORDER BY q.CreatedAt");
    $stmt->execute([$courseId]);
    $quizzes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($quizzes);
}

function addQuiz($teacherId) {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $lessonId = $data['lessonId'] ?? 0;
    $quizTitle = $data['quizTitle'] ?? '';
    $questions = $data['questions'] ?? [];
    
    // التحقق من أن الدرس يخص المعلم
    $stmt = $pdo->prepare("SELECT 1 FROM Lessons l
                          JOIN Courses c ON l.CourseID = c.CourseID
                          WHERE l.LessonID = ? AND c.TeacherID = ?");
    $stmt->execute([$lessonId, $teacherId]);
    if (!$stmt->fetch()) {
        throw new Exception("Unauthorized access to lesson");
    }
    
    if (empty($quizTitle) || empty($questions)) {
        throw new Exception("Quiz title and questions are required");
    }
    
    // بدء المعاملة
    $pdo->beginTransaction();
    
    try {
        // إضافة الاختبار
        $stmt = $pdo->prepare("INSERT INTO Quizzes (LessonID, QuizName) VALUES (?, ?)");
        $stmt->execute([$lessonId, $quizTitle]);
        $quizId = $pdo->lastInsertId();
        
        // إضافة الأسئلة
        foreach ($questions as $question) {
            $stmt = $pdo->prepare("INSERT INTO QuizQuestions (QuizID, QuestionText) VALUES (?, ?)");
            $stmt->execute([$quizId, $question['text']]);
            $questionId = $pdo->lastInsertId();
            
            // إضافة الإجابات
            foreach ($question['options'] as $option) {
                $isCorrect = ($option === $question['correctAnswer']) ? 1 : 0;
                $stmt = $pdo->prepare("INSERT INTO QuizAnswers (QuestionID, AnswerText, IsCorrect) 
                                      VALUES (?, ?, ?)");
                $stmt->execute([$questionId, $option, $isCorrect]);
            }
        }
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'quizId' => $quizId,
            'message' => 'Quiz added successfully'
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function getCourseExams($courseId, $teacherId) {
    global $pdo;
    
    // التحقق من أن الكورس يخص المعلم
    $stmt = $pdo->prepare("SELECT 1 FROM Courses WHERE CourseID = ? AND TeacherID = ?");
    $stmt->execute([$courseId, $teacherId]);
    if (!$stmt->fetch()) {
        throw new Exception("Unauthorized access to course");
    }
    
    $stmt = $pdo->prepare("SELECT * FROM Exams WHERE CourseID = ? ORDER BY CreatedAt");
    $stmt->execute([$courseId]);
    $exams = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($exams);
}

function addExam($teacherId) {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $courseId = $data['courseId'] ?? 0;
    $examTitle = $data['examTitle'] ?? '';
    $timeLimit = $data['timeLimit'] ?? 60;
    $passingScore = $data['passingScore'] ?? 70;
    $questions = $data['questions'] ?? [];
    
    // التحقق من أن الكورس يخص المعلم
    $stmt = $pdo->prepare("SELECT 1 FROM Courses WHERE CourseID = ? AND TeacherID = ?");
    $stmt->execute([$courseId, $teacherId]);
    if (!$stmt->fetch()) {
        throw new Exception("Unauthorized access to course");
    }
    
    if (empty($examTitle) || empty($questions)) {
        throw new Exception("Exam title and questions are required");
    }
    
    // بدء المعاملة
    $pdo->beginTransaction();
    
    try {
        // إضافة الاختبار
        $stmt = $pdo->prepare("INSERT INTO Exams (CourseID, ExamName, Duration) 
                              VALUES (?, ?, CONCAT(?, ' minutes'))");
        $stmt->execute([$courseId, $examTitle, $timeLimit]);
        $examId = $pdo->lastInsertId();
        
        // إضافة الأسئلة
        foreach ($questions as $question) {
            $stmt = $pdo->prepare("INSERT INTO ExamQuestions (ExamID, QuestionText) VALUES (?, ?)");
            $stmt->execute([$examId, $question['text']]);
            $questionId = $pdo->lastInsertId();
            
            // إضافة الإجابات
            foreach ($question['options'] as $option) {
                $isCorrect = ($option === $question['correctAnswer']) ? 1 : 0;
                $stmt = $pdo->prepare("INSERT INTO ExamAnswers (QuestionID, AnswerText, IsCorrect) 
                                      VALUES (?, ?, ?)");
                $stmt->execute([$questionId, $option, $isCorrect]);
            }
        }
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'examId' => $examId,
            'message' => 'Exam added successfully'
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}
function getTeacherStudents($teacherId) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT DISTINCT
            u.UserID,
            u.Username,
            u.Email,
            p.FullName,
            p.ProfilePictureURL,
            s.SectionName,
            s.GradeLevel,
            GROUP_CONCAT(DISTINCT c.CourseName SEPARATOR ', ') AS EnrolledCourses,
            COUNT(DISTINCT c.CourseID) AS TotalEnrolledCourses,
            (
                SELECT COUNT(*) 
                FROM lesson_progress lp 
                JOIN Lessons l ON lp.LessonID = l.LessonID 
                JOIN Courses c2 ON l.CourseID = c2.CourseID
                WHERE c2.TeacherID = ? AND lp.StudentID = u.UserID
            ) AS TotalCompletedLessons,
            (
                SELECT COUNT(*) 
                FROM Lessons l 
                JOIN Courses c2 ON l.CourseID = c2.CourseID
                WHERE c2.TeacherID = ?
            ) AS TotalLessons,
            (
                SELECT AVG(Score) 
                FROM QuizResults qr 
                JOIN Quizzes q ON qr.QuizID = q.QuizID 
                JOIN Lessons l ON q.LessonID = l.LessonID 
                JOIN Courses c2 ON l.CourseID = c2.CourseID
                WHERE c2.TeacherID = ? AND qr.StudentID = u.UserID
            ) AS QuizAverage,
            (
                SELECT AVG(Score) 
                FROM ExamResults er 
                JOIN Exams e ON er.ExamID = e.ExamID 
                JOIN Courses c2 ON e.CourseID = c2.CourseID
                WHERE c2.TeacherID = ? AND er.StudentID = u.UserID
            ) AS ExamAverage
        FROM Users u
        JOIN Enrollments e ON u.UserID = e.StudentID
        JOIN Courses c ON e.CourseID = c.CourseID
        LEFT JOIN Profiles p ON u.UserID = p.UserID
        LEFT JOIN Sections s ON u.SectionID = s.SectionID
        WHERE c.TeacherID = ? AND u.Role = 'Student'
        GROUP BY u.UserID
        ORDER BY p.FullName");
        
        // Execute with multiple parameters for each placeholder
        $stmt->execute([$teacherId, $teacherId, $teacherId, $teacherId, $teacherId]);
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($students as &$student) {
            $student['ProgressPercentage'] = ($student['TotalLessons'] > 0) 
                ? round(($student['TotalCompletedLessons'] / $student['TotalLessons']) * 100, 2)
                : 0;
            
            $student['OverallGrade'] = calculateOverallGrade(
                $student['QuizAverage'],
                $student['ExamAverage']
            );
        }
        
        echo json_encode($students);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function calculateOverallGrade($quizAvg, $examAvg) {
    // Implement your grading logic here
    $quizAvg = $quizAvg ?: 0;
    $examAvg = $examAvg ?: 0;
    
    // Example: 40% quizzes, 60% exams
    $overall = ($quizAvg * 0.4) + ($examAvg * 0.6);
    return round($overall, 2);
}
function getCourseGrades($courseId, $teacherId) {
    global $pdo;
    
    // التحقق من أن الكورس يخص المعلم
    $stmt = $pdo->prepare("SELECT 1 FROM Courses WHERE CourseID = ? AND TeacherID = ?");
    $stmt->execute([$courseId, $teacherId]);
    if (!$stmt->fetch()) {
        throw new Exception("Unauthorized access to course");
    }
    
    $stmt = $pdo->prepare("SELECT u.UserID, p.FullName AS StudentName,
                          (SELECT AVG(Score) FROM QuizResults qr 
                           JOIN Quizzes q ON qr.QuizID = q.QuizID 
                           JOIN Lessons l ON q.LessonID = l.LessonID 
                           WHERE l.CourseID = ? AND qr.StudentID = u.UserID) AS quiz_avg,
                          (SELECT AVG(Score) FROM ExamResults er 
                           JOIN Exams e ON er.ExamID = e.ExamID 
                           WHERE e.CourseID = ? AND er.StudentID = u.UserID) AS exam_avg
                          FROM Enrollments e
                          JOIN Users u ON e.StudentID = u.UserID
                          LEFT JOIN Profiles p ON u.UserID = p.UserID
                          WHERE e.CourseID = ?
                          ORDER BY p.FullName");
    $stmt->execute([$courseId, $courseId, $courseId]);
    $grades = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($grades);
}

function getCourseAttendance($courseId, $teacherId) {
    global $pdo;
    
    // التحقق من أن الكورس يخص المعلم
    $stmt = $pdo->prepare("SELECT 1 FROM Courses WHERE CourseID = ? AND TeacherID = ?");
    $stmt->execute([$courseId, $teacherId]);
    if (!$stmt->fetch()) {
        throw new Exception("Unauthorized access to course");
    }
    
    $stmt = $pdo->prepare("SELECT a.Date, 
                          COUNT(CASE WHEN a.Status = 'Present' THEN 1 END) AS present_count,
                          COUNT(CASE WHEN a.Status = 'Absent' THEN 1 END) AS absent_count
                          FROM Attendance a
                          WHERE a.CourseID = ?
                          GROUP BY a.Date
                          ORDER BY a.Date DESC");
    $stmt->execute([$courseId]);
    $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($attendance);
}

function getTeacherProfile($teacherId) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT u.Username, u.Email, p.FullName, p.Bio, p.ProfilePictureURL
                          FROM Users u
                          LEFT JOIN Profiles p ON u.UserID = p.UserID
                          WHERE u.UserID = ?");
    $stmt->execute([$teacherId]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode($profile);
}

function updateTeacherProfile($teacherId) {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $username = $data['username'] ?? '';
    $firstName = $data['firstName'] ?? '';
    $lastName = $data['lastName'] ?? '';
    $email = $data['email'] ?? '';
    $bio = $data['bio'] ?? '';
    
    if (empty($username) || empty($email)) {
        throw new Exception("Username and email are required");
    }
    
    // تحديث بيانات المستخدم
    $stmt = $pdo->prepare("UPDATE Users SET Username = ?, Email = ? WHERE UserID = ?");
    $stmt->execute([$username, $email, $teacherId]);
    
    // التحقق من وجود ملف تعريف
    $stmt = $pdo->prepare("SELECT 1 FROM Profiles WHERE UserID = ?");
    $stmt->execute([$teacherId]);
    
    if ($stmt->fetch()) {
        // تحديث ملف التعريف الموجود
        $stmt = $pdo->prepare("UPDATE Profiles SET FullName = CONCAT(?, ' ', ?), Bio = ? WHERE UserID = ?");
        $stmt->execute([$firstName, $lastName, $bio, $teacherId]);
    } else {
        // إنشاء ملف تعريف جديد
        $stmt = $pdo->prepare("INSERT INTO Profiles (UserID, FullName, Bio) VALUES (?, CONCAT(?, ' ', ?), ?)");
        $stmt->execute([$teacherId, $firstName, $lastName, $bio]);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully'
    ]);
}

function getSections() {
    global $pdo;
    
    $stmt = $pdo->query("SELECT * FROM Sections ORDER BY GradeLevel, SectionName");
    $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($sections);
}
?>