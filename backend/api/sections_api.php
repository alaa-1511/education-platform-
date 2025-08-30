<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

class Section {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get all sections
    public function getSections() {
        try {
            $query = "SELECT SectionID, SectionName, GradeLevel, AcademicYear 
                     FROM sections 
                     ORDER BY GradeLevel, SectionName";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Get section by ID
    public function getSection($section_id) {
        try {
            $query = "SELECT SectionID, SectionName, GradeLevel, AcademicYear 
                     FROM sections 
                     WHERE SectionID = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$section_id]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Create new section
    public function createSection($data) {
        try {
            $query = "INSERT INTO sections (SectionName, GradeLevel, AcademicYear) 
                     VALUES (?, ?, ?)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['sectionName'],
                $data['gradeLevel'],
                $data['academicYear']
            ]);
            
            return array("success" => true, "sectionId" => $this->conn->lastInsertId());
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Update section
    public function updateSection($data) {
        try {
            $query = "UPDATE sections 
                     SET SectionName = ?, GradeLevel = ?, AcademicYear = ? 
                     WHERE SectionID = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['sectionName'],
                $data['gradeLevel'],
                $data['academicYear'],
                $data['sectionId']
            ]);
            
            return array("success" => true);
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }

    // Delete section
    public function deleteSection($section_id) {
        try {
            $query = "DELETE FROM sections WHERE SectionID = ?";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$section_id]);
            
            return array("success" => true);
        } catch(PDOException $e) {
            return array("error" => $e->getMessage());
        }
    }
}

$database = new Database();
$db = $database->getConnection();

$section = new Section($db);

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if(isset($_GET['section_id'])) {
            $result = $section->getSection($_GET['section_id']);
        } else {
            $result = $section->getSections();
        }
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $result = $section->createSection($data);
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        $result = $section->updateSection($data);
        break;
        
    case 'DELETE':
        if(isset($_GET['section_id'])) {
            $result = $section->deleteSection($_GET['section_id']);
        } else {
            $result = array("error" => "Section ID is required");
        }
        break;
}

echo json_encode($result);
?> 