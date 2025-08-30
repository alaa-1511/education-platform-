<?php
// Include the database connection
include('config.php');

try {
    // Hash the password
    $password = 'Admin@1234';
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Prepare the SQL statement
    $stmt = $conn->prepare("
        INSERT INTO users (Username, Password, Email, Role, CreatedAt, SectionID, AcademicYear)
        VALUES (?, ?, ?, ?, NOW(), NULL, NULL)
    ");

    // Execute the statement
    $result = $stmt->execute([
        'admin',
        $hashedPassword,
        'admin@example.com',
        'Admin'
    ]);

    if ($result) {
        echo "Admin user created successfully!\n";
        echo "Username: admin\n";
        echo "Password: Admin@1234\n";
        echo "Email: admin@example.com\n";
    } else {
        echo "Failed to create admin user.\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?> 