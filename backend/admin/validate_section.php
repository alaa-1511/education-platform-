<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    // Get academic year from query parameter or POST data
    $academic_year = isset($_GET['academic_year']) ? $_GET['academic_year'] : null;
    if (!$academic_year) {
        $data = json_decode(file_get_contents('php://input'), true);
        $academic_year = $data['academic_year'] ?? null;
    }

    if (!$academic_year) {
        throw new Exception('Academic year is required');
    }

    // Define sections
    $sections = ['1', '2', '3', '4', '5', '6'];

    // Get existing sections for the specified academic year
    $stmt = $pdo->prepare("SELECT SectionID, SectionName FROM Sections WHERE AcademicYear = :academic_year");
    $stmt->execute(['academic_year' => $academic_year]);
    $existing_sections = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // If no sections exist, create default sections
    if (empty($existing_sections)) {
        $sections_data = [];
        foreach ($sections as $section_name) {
            $stmt = $pdo->prepare("INSERT INTO Sections (SectionName, AcademicYear) VALUES (:section_name, :academic_year)");
            $stmt->execute([
                'section_name' => $section_name,
                'academic_year' => $academic_year
            ]);
            
            $sections_data[] = [
                'SectionID' => $pdo->lastInsertId(),
                'SectionName' => $section_name
            ];
        }
        $sections = $sections_data;
    } else {
        $sections = $existing_sections;
    }

    echo json_encode([
        'status' => 'success',
        'sections' => $sections
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?> 