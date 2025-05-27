<?php
session_start();
require_once 'db_config.php';

header('Content-Type: application/json');

// Authentication
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in'] || !isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'User not authenticated. Please log in.']);
    exit;
}

// Receive Data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'error' => 'Invalid input data.']);
    exit;
}

$userId = $_SESSION['user_id'];
$personalInfoJson = isset($input['personalInfo']) ? json_encode($input['personalInfo']) : null;
$educationJson = isset($input['education']) ? json_encode($input['education']) : null;
$experienceJson = isset($input['experience']) ? json_encode($input['experience']) : null;
$skillsJson = isset($input['skills']) ? json_encode($input['skills']) : null;
$profilePictureBase64 = $input['profilePictureBase64'] ?? null; // Already a string or null
$aiGeneratedContentText = $input['aiGeneratedContent'] ?? null; // Already a string or null

// Database Logic (Simulated)
$conn = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME); // Use @ to suppress default warning, we handle it

if ($conn->connect_error) {
    // In a real app, log this error more discreetly
    echo json_encode(['success' => false, 'error' => 'Database connection failed. Please try again later.']);
    // error_log("Database connection failed: " . $conn->connect_error); // Example logging
    exit;
}

// Check if resume exists for the user
$stmt_check = $conn->prepare("SELECT resume_id FROM resumes WHERE user_id = ?");
if (!$stmt_check) {
    echo json_encode(['success' => false, 'error' => 'Failed to prepare statement (check): ' . $conn->error]);
    $conn->close();
    exit;
}
$stmt_check->bind_param("i", $userId);
$stmt_check->execute();
$result_check = $stmt_check->get_result();
$existing_resume = $result_check->fetch_assoc();
$stmt_check->close();

if ($existing_resume) {
    // Update existing resume
    $stmt_update = $conn->prepare("UPDATE resumes SET personal_info_json = ?, education_json = ?, experience_json = ?, skills_json = ?, profile_picture_base64 = ?, ai_generated_content_text = ?, last_updated = NOW() WHERE user_id = ?");
    if (!$stmt_update) {
        echo json_encode(['success' => false, 'error' => 'Failed to prepare statement (update): ' . $conn->error]);
        $conn->close();
        exit;
    }
    $stmt_update->bind_param("ssssssi", $personalInfoJson, $educationJson, $experienceJson, $skillsJson, $profilePictureBase64, $aiGeneratedContentText, $userId);
    
    if ($stmt_update->execute()) {
        echo json_encode(['success' => true, 'message' => 'Resume updated successfully.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to update resume: ' . $stmt_update->error]);
    }
    $stmt_update->close();
} else {
    // Insert new resume
    $stmt_insert = $conn->prepare("INSERT INTO resumes (user_id, personal_info_json, education_json, experience_json, skills_json, profile_picture_base64, ai_generated_content_text, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
    if (!$stmt_insert) {
        echo json_encode(['success' => false, 'error' => 'Failed to prepare statement (insert): ' . $conn->error]);
        $conn->close();
        exit;
    }
    $stmt_insert->bind_param("issssss", $userId, $personalInfoJson, $educationJson, $experienceJson, $skillsJson, $profilePictureBase64, $aiGeneratedContentText);

    if ($stmt_insert->execute()) {
        echo json_encode(['success' => true, 'message' => 'Resume saved successfully.']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to save new resume: ' . $stmt_insert->error]);
    }
    $stmt_insert->close();
}

$conn->close();
?>
