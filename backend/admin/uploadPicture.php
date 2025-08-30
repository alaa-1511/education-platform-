<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}
$userId = $_SESSION['user_id'];



if (isset($_FILES['profileImage'])) {
    $file = $_FILES['profileImage'];
    // Now you can use $file['tmp_name'], $file['name'], etc.
}
