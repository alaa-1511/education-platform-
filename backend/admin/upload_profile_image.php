<?php
header("Content-Type: application/json");

session_start();

// التحقق من أن المستخدم مسجل دخوله
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];

// التحقق من وجود ملف مرفوع
if (!isset($_FILES['profileImage']) || $_FILES['profileImage']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    exit;
}

$file = $_FILES['profileImage'];

// التحقق من نوع الملف
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => 'Only JPG, PNG, and GIF images are allowed']);
    exit;
}

// التحقق من حجم الملف (5MB كحد أقصى)
if ($file['size'] > 5 * 1024 * 1024) {
    echo json_encode(['success' => false, 'message' => 'File size exceeds 5MB limit']);
    exit;
}

// إنشاء مجلد التحميل إذا لم يكن موجودًا
$uploadDir = 'uploads/profiles/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// إنشاء اسم فريد للملف
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = $userId . '_' . time() . '.' . $extension;
$destination = $uploadDir . $filename;

// نقل الملف إلى المجلد المطلوب
if (move_uploaded_file($file['tmp_name'], $destination)) {
    // تحديث مسار الصورة في قاعدة البيانات
    require_once 'db_connection.php';
    
    try {
        // التحقق من وجود ملف تعريف
        $stmt = $pdo->prepare("SELECT 1 FROM Profiles WHERE UserID = ?");
        $stmt->execute([$userId]);
        
        if ($stmt->fetch()) {
            // تحديث ملف التعريف الموجود
            $stmt = $pdo->prepare("UPDATE Profiles SET ProfilePictureURL = ? WHERE UserID = ?");
            $stmt->execute([$destination, $userId]);
        } else {
            // إنشاء ملف تعريف جديد
            $stmt = $pdo->prepare("INSERT INTO Profiles (UserID, ProfilePictureURL) VALUES (?, ?)");
            $stmt->execute([$userId, $destination]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Profile image uploaded successfully',
            'imageUrl' => $destination
        ]);
    } catch (PDOException $e) {
        unlink($destination); // حذف الملف إذا فشلت عملية قاعدة البيانات
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
}
?>