<?php
// Set the path to your video links file
$file_path = 'videos.txt';

// Read all lines from the file into an array on the server
// NOTE: The file is read on the server, NOT by the user's device.
$lines = file($file_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

// Check if the file loaded correctly
if ($lines === false || count($lines) === 0) {
    http_response_code(404);
    echo "No video links found.";
    exit;
}

// Pick a truly random index from the array
$randomIndex = array_rand($lines);
$randomLink = $lines[$randomIndex];

// Send ONLY the single, random link back to the client (plain text)
header('Content-Type: text/plain');
echo $randomLink;
?>
