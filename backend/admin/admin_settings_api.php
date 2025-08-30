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

// Function to get all settings
function getAllSettings() {
    global $conn;
    try {
        $stmt = $conn->prepare("SELECT * FROM Settings");
        $stmt->execute();
        $settings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Convert settings array to associative array
        $settingsArray = [];
        foreach ($settings as $setting) {
            $settingsArray[$setting['SettingKey']] = $setting['SettingValue'];
        }
        
        return [
            'success' => true,
            'data' => $settingsArray
        ];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Error fetching settings: ' . $e->getMessage()
        ];
    }
}

// Function to update settings
function updateSettings($data) {
    global $conn;
    try {
        $conn->beginTransaction();
        
        $stmt = $conn->prepare("
            INSERT INTO Settings (SettingKey, SettingValue) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE SettingValue = VALUES(SettingValue)
        ");
        
        foreach ($data as $key => $value) {
            $stmt->execute([$key, $value]);
        }
        
        $conn->commit();
        
        return [
            'success' => true,
            'message' => 'Settings updated successfully'
        ];
    } catch (PDOException $e) {
        $conn->rollBack();
        return [
            'success' => false,
            'message' => 'Error updating settings: ' . $e->getMessage()
        ];
    }
}

// Function to get academic years
function getAcademicYears() {
    global $conn;
    try {
        $stmt = $conn->prepare("
            SELECT DISTINCT AcademicYear 
            FROM Sections 
            ORDER BY AcademicYear DESC
        ");
        $stmt->execute();
        $years = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        return [
            'success' => true,
            'data' => $years
        ];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Error fetching academic years: ' . $e->getMessage()
        ];
    }
}

// Function to get grade levels
function getGradeLevels() {
    global $conn;
    try {
        $stmt = $conn->prepare("
            SELECT DISTINCT GradeLevel 
            FROM Sections 
            ORDER BY GradeLevel
        ");
        $stmt->execute();
        $levels = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        return [
            'success' => true,
            'data' => $levels
        ];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Error fetching grade levels: ' . $e->getMessage()
        ];
    }
}

// Function to get section count
function getSectionCount() {
    global $conn;
    try {
        $stmt = $conn->prepare("
            SELECT COUNT(DISTINCT SectionID) as Count 
            FROM Sections
        ");
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'success' => true,
            'data' => $result['Count']
        ];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Error fetching section count: ' . $e->getMessage()
        ];
    }
}

// Handle API requests
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'getAll':
        echo json_encode(getAllSettings());
        break;
        
    case 'update':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode(updateSettings($data));
        break;
        
    case 'getAcademicYears':
        echo json_encode(getAcademicYears());
        break;
        
    case 'getGradeLevels':
        echo json_encode(getGradeLevels());
        break;
        
    case 'getSectionCount':
        echo json_encode(getSectionCount());
        break;
        
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Invalid action'
        ]);
} 