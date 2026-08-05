<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$requestUri = trim($requestUri, '/');

$segments = explode('/', $requestUri);

// Remove 'index.php' from path if present (PATH_INFO style URLs); the API
// path itself always starts with 'api/' or 'health' and must stay intact.
if (($segments[0] ?? '') === 'index.php') {
    array_shift($segments);
}

// Routing
$path = implode('/', $segments);

// Helper functions
function respond(int $code, array $data) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function hashPassword(string $password): string {
    return password_hash($password, PASSWORD_BCRYPT);
}

function verifyPassword(string $password, string $hash): bool {
    return password_verify($password, $hash);
}

function generateTrackingCode(): string {
    return 'TRK-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 12));
}

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($method === 'OPTIONS') {
    exit;
}

// Health check
if ($path === '' || $path === 'health') {
    respond(200, ['status' => 'ok', 'service' => 'chapiran-php-backend', 'timestamp' => date('c')]);
}

// Auth endpoints
if ($path === 'api/auth/register' && $method === 'POST') {
    require __DIR__ . '/../endpoints/auth/register.php';
    exit;
}

if ($path === 'api/auth/login' && $method === 'POST') {
    require __DIR__ . '/../endpoints/auth/login.php';
    exit;
}

if ($path === 'api/auth/logout' && $method === 'POST') {
    require __DIR__ . '/../endpoints/auth/logout.php';
    exit;
}

if ($path === 'api/auth/me' && $method === 'GET') {
    require __DIR__ . '/../endpoints/auth/me.php';
    exit;
}

// Requests
if ($path === 'api/requests' && $method === 'POST') {
    require __DIR__ . '/../endpoints/requests/index.php';
    exit;
}

if ($path === 'api/requests' && $method === 'GET') {
    require __DIR__ . '/../endpoints/requests/index.php';
    exit;
}

if (preg_match('#^api/requests/([^/]+)/messages$#', $path, $m) && $method === 'POST') {
    $_GET['id'] = $m[1];
    require __DIR__ . '/../endpoints/requests/messages.php';
    exit;
}

if (preg_match('#^api/requests/([^/]+)$#', $path, $m)) {
    $_GET['id'] = $m[1];
    if ($method === 'GET') require __DIR__ . '/../endpoints/requests/show.php';
    elseif ($method === 'PUT') require __DIR__ . '/../endpoints/requests/update.php';
    else respond(405, ['message' => 'Method not allowed']);
    exit;
}

// Track
if ($path === 'api/track' && $method === 'POST') {
    require __DIR__ . '/../endpoints/track/index.php';
    exit;
}

// Admin
if ($path === 'api/admin/requests' && $method === 'GET') {
    require __DIR__ . '/../endpoints/admin/requests/index.php';
    exit;
}

if ($path === 'api/admin/requests' && $method === 'POST') {
    require __DIR__ . '/../endpoints/admin/requests/index.php';
    exit;
}

if (preg_match('#^api/admin/requests/([^/]+)$#', $path, $m)) {
    $_GET['id'] = $m[1];
    if ($method === 'GET') require __DIR__ . '/../endpoints/admin/requests/show.php';
    elseif ($method === 'PUT') require __DIR__ . '/../endpoints/admin/requests/update.php';
    else respond(405, ['message' => 'Method not allowed']);
    exit;
}

if ($path === 'api/admin/stats' && $method === 'GET') {
    require __DIR__ . '/../endpoints/admin/stats.php';
    exit;
}

respond(404, ['message' => 'Not found', 'path' => $path, 'method' => $method]);
