<?php
// profile_api.php

header("Content-Type: application/json");
require_once 'config.php'; // ملف يحتوي على اتصال قاعدة البيانات

session_start();

// التحقق من تسجيل الدخول
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$user_id = $_SESSION['user_id'];

// الحصول على بيانات الملف الشخصي
if ($method === 'GET') {
    try {
        // جلب بيانات المستخدم الأساسية
        $stmt = $conn->prepare("SELECT * FROM users WHERE UserID = :user_id");
        $stmt->execute(['user_id' => $user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }
        
        // جلب بيانات الملف الشخصي الإضافية
        $stmt = $conn->prepare("SELECT * FROM profiles WHERE UserID = :user_id");
        $stmt->execute(['user_id' => $user_id]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // تقسيم الاسم الكامل بشكل آمن
        $fullNameParts = $profile ? explode(' ', $profile['FullName'], 2) : [];
        $firstName = $fullNameParts[0] ?? '';
        $lastName = $fullNameParts[1] ?? '';
        $imageName = $profile ? $profile['ProfilePictureURL'] : '';
        $publicUrlBase = 'http://localhost/E-Learning/IMG/';
        $response = [
            'username' => $user['Username'],
            'email' => $user['Email'],
            'firstName' => $firstName,
            'lastName' => $lastName,
            'bio' => $profile ? $profile['Bio'] : '',
            'imageUrl' => $publicUrlBase.$imageName,
            'profilePicture' => $profile ? $profile['ProfilePictureURL'] : 'http://bootdey.com/img/Content/avatar/avatar1.png'
        ];
        
        echo json_encode($response);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

// تحديث بيانات الملف الشخصي
elseif ($method === 'POST') {
    // إذا كان الطلب يحتوي على بيانات FormData (لرفع الصورة)
    if (isset($_FILES['profilePicture'])) {
        $uploadDir = '../IMG/';
        
        $publicUrlBase = 'http://localhost/E-Learning/IMG/';

        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        // التحقق من نوع الملف
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $fileType = $_FILES['profilePicture']['type'];
        if (!in_array($fileType, $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, and GIF are allowed.']);
            exit;
        }
        
        // التحقق من حجم الملف (5MB كحد أقصى)
        $maxSize = 5 * 1024 * 1024;
        if ($_FILES['profilePicture']['size'] > $maxSize) {
            http_response_code(400);
            echo json_encode(['error' => 'File size exceeds maximum limit of 5MB']);
            exit;
        }
        
        $fileName = basename($_FILES['profilePicture']['name']);
        $targetPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['profilePicture']['tmp_name'], $targetPath)) {
            try {
                // تحديث مسار الصورة في قاعدة البيانات
                $stmt = $conn->prepare("UPDATE profiles SET ProfilePictureURL = :image_url WHERE UserID = :user_id");
                $stmt->execute([
                    'image_url' => $fileName,
                    'user_id' => $user_id
                ]);
                
                echo json_encode([
                    'success' => true, 
                    "imageUrl" => $publicUrlBase . $fileName,
                    'message' => 'Profile picture updated successfully'
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to upload image']);
        }
    } 
    // إذا كان الطلب لتحديث البيانات النصية
    else {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
            exit;
        }
        
        try {
            // تحديث بيانات المستخدم الأساسية
            $stmt = $conn->prepare("UPDATE users SET Username = :username, Email = :email WHERE UserID = :user_id");
            $stmt->execute([
                'username' => $data['username'],
                'email' => $data['email'],
                'user_id' => $user_id
            ]);
            
            // إنشاء الاسم الكامل
            $fullName = trim($data['firstName'] . ' ' . ($data['lastName'] ?? ''));
            
            // التحقق من وجود ملف شخصي
            $stmt = $conn->prepare("SELECT ProfileID FROM profiles WHERE UserID = :user_id");
            $stmt->execute(['user_id' => $user_id]);
            $profileExists = $stmt->fetch();
            
            if ($profileExists) {
                // تحديث الملف الشخصي الموجود
                $stmt = $conn->prepare("UPDATE profiles SET FullName = :full_name, Bio = :bio WHERE UserID = :user_id");
                $stmt->execute([
                    'full_name' => $fullName,
                    'bio' => $data['bio'],
                    'user_id' => $user_id
                ]);
            } else {
                // إنشاء ملف شخصي جديد
                $stmt = $conn->prepare("INSERT INTO profiles (UserID, FullName, Bio) VALUES (:user_id, :full_name, :bio)");
                $stmt->execute([
                    'user_id' => $user_id,
                    'full_name' => $fullName,
                    'bio' => $data['bio']
                ]);
            }
            
            echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
?>