<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    // Get academic year from query parameter
    $academic_year = isset($_GET['academic_year']) ? $_GET['academic_year'] : null;

    if (!$academic_year) {
        throw new Exception('Academic year is required');
    }

    // Prepare and execute query to get sections for the specified academic year
    $stmt = $conn->prepare("SELECT SectionID, SectionName, GradeLevel FROM sections WHERE AcademicYear = ?");
    $stmt->execute([$academic_year]);
    $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);

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