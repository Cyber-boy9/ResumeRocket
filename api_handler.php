<?php
// Define API Key
define('GEMINI_API_KEY', 'AIzaSyC7h06DcW0p4sPYpeuJ7IRVGAgrX35NG2I');

header('Content-Type: application/json');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the input from the request body
    $input = json_decode(file_get_contents('php://input'), true);
    $prompt = $input['prompt'] ?? null;

    if (!$prompt) {
        echo json_encode(['success' => false, 'error' => 'No prompt provided.']);
        exit;
    }

    // Prepare data for Gemini API
    $geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . GEMINI_API_KEY;
    $geminiRequestData = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt]
                ]
            ]
        ]
    ];

    // Initialize cURL session
    $ch = curl_init($geminiApiUrl);

    // Set cURL options
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($geminiRequestData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);

    // Execute cURL request
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch); // Get cURL error message
    curl_close($ch);

    // Check for cURL errors or non-200 HTTP status
    if ($response === false || $httpcode != 200) {
        $error_message = 'Failed to call Gemini API.';
        if ($curlError) {
            $error_message .= ' cURL Error: ' . $curlError;
        }
        if ($httpcode != 200) {
            $error_message .= ' HTTP Status: ' . $httpcode;
            if ($response) {
                // Attempt to decode Gemini's error response if available
                $geminiError = json_decode($response, true);
                if (isset($geminiError['error']['message'])) {
                    $error_message .= ' Gemini Error: ' . $geminiError['error']['message'];
                } else {
                     $error_message .= ' Response Body: ' . $response;
                }
            }
        }
        echo json_encode(['success' => false, 'error' => $error_message]);
        exit;
    }

    // Decode Gemini API response
    $geminiData = json_decode($response, true);

    // Extract generated text
    // Updated path based on typical Gemini responses, check for existence of keys
    $generatedText = null;
    if (isset($geminiData['candidates'][0]['content']['parts'][0]['text'])) {
        $generatedText = $geminiData['candidates'][0]['content']['parts'][0]['text'];
    } else {
        // Log the actual response if the expected structure is not found
        error_log("Unexpected Gemini API response structure: " . $response);
    }


    if ($generatedText !== null) {
        echo json_encode(['success' => true, 'text' => $generatedText]);
    } else {
        // Provide more context about the error
        $error_detail = 'Could not extract text from Gemini response.';
        if (isset($geminiData['error'])) {
            $error_detail .= ' API Error: ' . $geminiData['error']['message'];
        } else if (isset($geminiData['candidates'][0]['finishReason']) && $geminiData['candidates'][0]['finishReason'] !== 'STOP') {
            $error_detail .= ' Finish Reason: ' . $geminiData['candidates'][0]['finishReason'];
             if (isset($geminiData['candidates'][0]['safetyRatings'])) {
                $error_detail .= ' Safety Ratings: ' . json_encode($geminiData['candidates'][0]['safetyRatings']);
            }
        }
        echo json_encode(['success' => false, 'error' => $error_detail, 'debug_response' => $geminiData ]);
    }

} else {
    // Handle non-POST requests
    echo json_encode(['success' => false, 'error' => 'Invalid request method. Only POST requests are allowed.']);
}
?>
