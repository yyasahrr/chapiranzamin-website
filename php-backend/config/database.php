<?php
require_once __DIR__ . '/config.php';

/**
 * DB_DRIVER=mysql (default, production) uses MySQL via PDO.
 * DB_DRIVER=sqlite stores data in a local SQLite file so the backend can run
 * in environments without a database server (local dev, previews, tests).
 */
$driver = strtolower((string) env('DB_DRIVER', 'mysql'));

$pdoOptions = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    if ($driver === 'sqlite') {
        $path = (string) env('SQLITE_PATH', __DIR__ . '/../.data/chapkhane.sqlite');
        $dir = dirname($path);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $pdo = new PDO('sqlite:' . $path, null, null, $pdoOptions);
        $pdo->exec('PRAGMA foreign_keys = ON');
        $pdo->exec('PRAGMA busy_timeout = 5000');
        $pdo->exec('PRAGMA journal_mode = WAL');
    } else {
        $host = env('DB_HOST', 'localhost');
        $db   = env('DB_NAME', 'chapiran_php');
        $user = env('DB_USER', 'root');
        $pass = env('DB_PASS', '');
        $charset = (string) env('DB_CHARSET', 'utf8mb4');

        $pdo = new PDO(
            "mysql:host={$host};dbname={$db};charset={$charset}",
            $user,
            $pass,
            $pdoOptions
        );
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}
