<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, PUT, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

class Profile {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get teacher profile
    public function getProfile($teacher_id) {
        try {
            $query = "SELECT u.UserID, u.Username, u.Email, u.Role,
                             p.FullName, p.Bio, p.ProfilePictureURL,
                             s.SectionName, s.GradeLevel
                     FROM users u
                     LEFT JOIN profiles p ON u.UserID = p.UserID
                     LEFT JOIN sections s ON u.SectionID = s.SectionID
                     WHERE u.UserID = ? AND u.Role = 'Teacher'";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$teacher_id]);
            $profile = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$profile) {
                return array("error" => "Profile not found");
            }

            // Get teacher statistics
            $query = "SELECT 
                        COUNT(DISTINCT c.CourseID) as total_courses,
                        COUNT(DISTINCT l.LessonID) as total_lessons,
                        COUNT(DISTINCT q.QuizID) as total_quizzes,
                        COUNT(DISTINCT e.ExamID) as total_exams,
                        COUNT(DISTINCT en.StudentID) as total_students
                     FROM courses c
                     LEFT JOIN lessons l ON c.CourseID = l.CourseID
                     LEFT JOIN quizzes q ON l.LessonID = q.LessonID
                     LEFT JOIN exams e ON c.CourseID = e.CourseID
                     LEFT JOIN enrollments en ON c.CourseID = en.CourseID
                     WHERE c.TeacherID = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$teacher_id]);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);

            $profile['statistics'] = $stats;
            return $profile;
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Update teacher profile
    public function updateProfile($data) {
        try {
            $this->conn->beginTransaction();

            // Update user info
            $query = "UPDATE users 
                     SET Username = ?, Email = ? 
                     WHERE UserID = ? AND Role = 'Teacher'";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['username'],
                $data['email'],
                $data['teacherId']
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
                $data['teacherId'],
                $data['fullName'],
                $data['bio'],
                $data['profilePictureUrl']
            ]);

            $this->conn->commit();
            return array("success" => true, "message" => "Profile updated successfully");
        } catch(PDOException $e) {
            $this->conn->rollBack();
            return array("error" => $e->getMessage());
        }
    }

    // Change password
    public function changePassword($data) {
        try {
            // Verify current password
            $query = "SELECT Password FROM users WHERE UserID = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$data['teacherId']]);
            $current_password = $stmt->fetchColumn();

            if (!password_verify($data['currentPassword'], $current_password)) {
                return array("error" => "Current password is incorrect");
            }

            // Update password
            $query = "UPDATE users 
                     SET Password = ? 
                     WHERE UserID = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                password_hash($data['newPassword'], PASSWORD_DEFAULT),
                $data['teacherId']
            ]);

            return array("success" => true);
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Handle profile picture upload
    public function uploadProfilePicture($teacher_id, $file) {
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
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }
}

$database = new Database();
$db = $database->getConnection();

$profile = new Profile($db);

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

// Initialize result
$result = array("error" => "Invalid request");

try {
    switch($method) {
        case 'GET':
            if(isset($_GET['teacher_id'])) {
                $result = $profile->getProfile($_GET['teacher_id']);
            } else {
                $result = array("error" => "Teacher ID is required");
            }
            break;
        
        case 'POST':
            if(isset($_FILES['profilePicture']) && isset($_POST['teacher_id'])) {
                $result = $profile->uploadProfilePicture($_POST['teacher_id'], $_FILES['profilePicture']);
            } else {
                $result = array("error" => "Profile picture and teacher ID are required");
            }
            break;

        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            if(isset($data['teacherId'])) {
                if(isset($data['currentPassword'])) {
                    $result = $profile->changePassword($data);
                } else {
                    $result = $profile->updateProfile($data);
                }
            } else {
                $result = array("error" => "Teacher ID is required");
            }
            break;
        
        default:
            $result = array("error" => "Invalid request method");
            break;
    }
} catch(PDOException $e) {
    $result = array("error" => $e->getMessage());
}

echo json_encode($result);
?> 