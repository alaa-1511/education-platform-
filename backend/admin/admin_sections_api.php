<?php
// Set headers for JSON response
header('Content-Type: application/json');
error_reporting(0); // Disable error reporting for production

require_once 'config.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'getAll':
            $stmt = $pdo->query("SELECT * FROM sections");
            $sections = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $sections]);
            break;

        case 'getByAcademicYear':
            $academicYear = $_GET['academicYear'] ?? '';
            if (empty($academicYear)) {
                throw new Exception('Academic year is required');
            }
            $stmt = $pdo->prepare("SELECT * FROM sections WHERE AcademicYear = ?");
            $stmt->execute([$academicYear]);
            $sections = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $sections]);
            break;

        case 'getById':
            $sectionId = $_GET['sectionId'] ?? 0;
            $stmt = $pdo->prepare("SELECT * FROM sections WHERE SectionID = ?");
            $stmt->execute([$sectionId]);
            $section = $stmt->fetch();
            echo json_encode(['success' => true, 'data' => $section]);
            break;

        case 'add':
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                throw new Exception('Invalid input data');
            }
            $stmt = $pdo->prepare("INSERT INTO sections (SectionName, GradeLevel, AcademicYear) VALUES (?, ?, ?)");
            $stmt->execute([$data['sectionName'], $data['gradeLevel'], $data['academicYear']]);
            echo json_encode(['success' => true, 'message' => 'Section added successfully']);
            break;

        case 'update':
            $sectionId = $_GET['sectionId'] ?? 0;
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                throw new Exception('Invalid input data');
            }
            $stmt = $pdo->prepare("UPDATE sections SET SectionName = ?, GradeLevel = ?, AcademicYear = ? WHERE SectionID = ?");
            $stmt->execute([$data['sectionName'], $data['gradeLevel'], $data['academicYear'], $sectionId]);
            echo json_encode(['success' => true, 'message' => 'Section updated successfully']);
            break;

        case 'delete':
            $sectionId = $_GET['sectionId'] ?? 0;
            $stmt = $pdo->prepare("DELETE FROM sections WHERE SectionID = ?");
            $stmt->execute([$sectionId]);
            echo json_encode(['success' => true, 'message' => 'Section deleted successfully']);
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>