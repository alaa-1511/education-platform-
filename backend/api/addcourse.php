<?php

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
// header('Content-Type: application/json');

// استلام JSON
$input = json_decode(file_get_contents('php://input'), true);
include_once '../config/database.php';
if (!$input) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON"]);
    exit;
}

// استخراج البيانات
$courseName = $input['courseName'] ?? '';
$description = $input['description'] ?? '';
$sectionId = $input['sectionId'] ?? '';
$teacherId = $input['teacherId'] ?? '';
$filename = $input['filename'] ?? '';
$mime_type = $input['mime_type'] ?? '';
$file_data = $input['file_data'] ?? '';

if (empty($courseName) || empty($description) || empty($sectionId) || empty($teacherId) || empty($file_data)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

// فك ترميز base64
if (preg_match('/^data:\w+\/\w+;base64,/', $file_data)) {
    $file_data = substr($file_data, strpos($file_data, ',') + 1);
    $file_data = base64_decode($file_data);

    if ($file_data === false) {
        echo json_encode(["status" => "error", "message" => "Failed to decode image"]);
        exit;
    }

    $uniqueFilename = time() . '_' . basename($filename);
    $filePath = './IMG/' . $uniqueFilename;


}

// إدخال البيانات في قاعدة البيانات
 $query = "INSERT INTO courses (CourseName, Description, SectionID, TeacherID, urlIMG, CreatedAt) 
                     VALUES (?, ?, ?, ?, ? , NOW())";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['courseName'],
                $data['description'],
                $data['sectionId'],
                $data['teacherId'],
                $filePath
            ]);

if ($stmt) {
    echo json_encode(["status" => "success", "message" => "Course saved successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Insert failed"]);
}

$stmt->close();
// $conn->close();
?>
