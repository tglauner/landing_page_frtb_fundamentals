<?php
/**
 * MIRD Analytics Tracking Endpoint
 * 
 * This script receives analytics data from the client-side and appends it to a JSON file.
 * It implements basic security measures and ensures proper file handling.
 * 
 * Version: 1.0.0
 * Last Updated: May 28, 2025
 */

// Set headers to prevent caching and specify JSON response
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

// Basic configuration. Only stored on the server, not in the client and never checked into git.
$config = [
    'data_file' => 'analytics_data.json',  // File to store analytics data
    'log_file' => 'analytics_errors.log',  // File to log errors
    'max_file_size' => 10 * 1024 * 1024,   // 10MB max file size before rotation
    'allowed_origins' => [                 // Allowed domains for CORS
        'https://tglauner.com',
        'https://www.tglauner.com',
        // Add your domains here
    ],
    'require_token' => true,               // Whether to require a security token
    'security_token' => 'mird_analytics_token_2025', // Simple security token
    'session_dir' => 'sessions',          // Directory for temporary session data
    'notification_email' => getenv('MIRD_NOTIFICATION_EMAIL') ?: null
];

// Set up CORS headers if origin is allowed
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $config['allowed_origins'])) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Analytics-Token');
    header('Access-Control-Max-Age: 86400'); // 24 hours cache
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Function to log errors
function logError($message) {
    global $config;
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message" . PHP_EOL;
    file_put_contents($config['log_file'], $logMessage, FILE_APPEND);
}

// Function to rotate file if it exceeds max size
function rotateFileIfNeeded($filename, $maxSize) {
    if (file_exists($filename) && filesize($filename) > $maxSize) {
        $backupName = $filename . '.' . date('Y-m-d-H-i-s') . '.bak';
        rename($filename, $backupName);
        return true;
    }
    return false;
}

// Verify request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Verify security token if required
if ($config['require_token']) {
    $headers = getallheaders();
    $token = isset($headers['X-Analytics-Token']) ? $headers['X-Analytics-Token'] : '';
    
    if ($token !== $config['security_token']) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Invalid security token']);
        exit;
    }
}

// Get the raw POST data
$rawData = file_get_contents('php://input');

// Validate JSON data
$data = json_decode($rawData);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data']);
    logError('Invalid JSON received: ' . $rawData);
    exit;
}

// Ensure session directory exists
if (!is_dir($config['session_dir'])) {
    mkdir($config['session_dir'], 0755, true);
}

// Store event in session-specific file
$sessionId = isset($data->sessionId) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $data->sessionId) : null;
if ($sessionId) {
    $sessionFile = $config['session_dir'] . '/' . $sessionId . '.jsonl';
    file_put_contents($sessionFile, json_encode($data) . PHP_EOL, FILE_APPEND | LOCK_EX);
}

// Add server timestamp and IP (anonymized)
$data->server_timestamp = date('c');
$data->anonymized_ip = anonymizeIP($_SERVER['REMOTE_ADDR']);

// Function to anonymize IP address (GDPR compliant)
function anonymizeIP($ip) {
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        // For IPv4, remove the last octet
        return preg_replace('/\.\d+$/', '.0', $ip);
    } elseif (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
        // For IPv6, remove the last 80 bits (last 5 groups)
        return preg_replace('/:[0-9a-f]{1,4}(:[0-9a-f]{1,4}){4}$/i', ':0:0:0:0:0', $ip);
    }
    return 'unknown';
}

// Prepare data for storage
$dataToStore = json_encode($data) . PHP_EOL;

// Rotate file if needed
rotateFileIfNeeded($config['data_file'], $config['max_file_size']);

// Append data to file
$success = file_put_contents($config['data_file'], $dataToStore, FILE_APPEND | LOCK_EX);

if ($success === false) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to store data']);
    logError('Failed to write to data file');
    exit;
}

// If session ended, send summary email and clean up
if ($data->type === 'session_end' && $sessionId && !empty($config['notification_email'])) {
    $events = file($sessionFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (count($events) > 1) { // send email only if user interacted a bit
        $summary = "Session ID: $sessionId\n";
        foreach ($events as $line) {
            $event = json_decode($line);
            if (!$event) continue;
            $lineStr = $event->timestamp . ' - ' . $event->type;
            if (isset($event->category) && isset($event->action)) {
                $lineStr .= ' ' . $event->category . ':' . $event->action;
            }
            if (isset($event->page)) {
                $lineStr .= ' (' . $event->page . ')';
            }
            $summary .= $lineStr . "\n";
        }
        mail($config['notification_email'], 'MIRD Session Summary', $summary, 'From: no-reply@' . $_SERVER['SERVER_NAME']);
    }
    @unlink($sessionFile);
}

// Return success response
echo json_encode(['status' => 'success', 'message' => 'Data received']);
