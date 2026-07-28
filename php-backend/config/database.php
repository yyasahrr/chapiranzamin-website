<?php
require_once __DIR__ . '/config.php';

$host = env('DB_HOST', 'localhost');
$db   = env('DB_NAME', 'chapiran_php');
$user = env('DB_USER', 'root');
$pass = env('DB_PASS', '');

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$db};charset=utf8mb4",
        $user,
        $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}
