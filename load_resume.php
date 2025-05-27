<?php
session_start();
require_once 'db_config.php';

header('Content-Type: application/json');

// Authentication
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in'] || !isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'User not authenticated. Please log in.']);
    exit;
}

$userId = $_SESSION['user_id'];

// Database Logic (Simulated)
$conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed. Please try again later.']);
    // error_log("Database connection failed: " . $conn->connect_error);
    exit;
}

$stmt = $conn->prepare("SELECT personal_info_json, education_json, experience_json, skills_json, profile_picture_base64, ai_generated_content_text FROM resumes WHERE user_id = ?");
if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Failed to prepare statement (select): ' . $conn->error]);
    $conn->close();
    exit;
}

$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    
    $resumeData = [
        'personalInfo' => $row['personal_info_json'] ? json_decode($row['personal_info_json'], true) : null,
        'education' => $row['education_json'] ? json_decode($row['education_json'], true) : [],
        'experience' => $row['experience_json'] ? json_decode($row['experience_json'], true) : [],
        'skills' => $row['skills_json'] ? json_decode($row['skills_json'], true) : [],
        'profilePictureBase64' => $row['profile_picture_base64'],
        'aiGeneratedContent' => $row['ai_generated_content_text']
    ];
    
    echo json_encode(['success' => true, 'data' => $resumeData]);
} else {
    echo json_encode(['success' => true, 'data' => null, 'message' => 'No saved resume found for this user.']);
}

$stmt->close();
$conn->close();
?>
