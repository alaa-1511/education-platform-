<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$user_id = $_SESSION['user_id'];

if ($method === 'DELETE') {
    try {
        // بدء transaction
        $pdo->beginTransaction();
        
        // حذف البيانات المرتبطة بالمستخدم من جميع الجداول
        // (يجب تعديل هذا الجزء حسب هيكل قاعدة البيانات الخاص بك)
        $tables = ['profiles', 'enrollments', 'lesson_progress', 'quizresults', 'examresults', 'users'];
        
        foreach ($tables as $table) {
            $stmt = $pdo->prepare("DELETE FROM $table WHERE UserID = ?");
            $stmt->execute([$user_id]);
        }
        
        // تأكيد transaction
        $pdo->commit();
        
        // إنهاء الجلسة
        session_destroy();
        
        echo json_encode(['success' => true, 'message' => 'Account deleted successfully']);
    } catch (PDOException $e) {
        // التراجع عن transaction في حالة حدوث خطأ
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>