<?php
/**
 * Backend bootstrap (CLI only).
 *
 * Usage: php scripts/bootstrap.php
 *
 * - When DB_DRIVER=sqlite, creates the database file and applies
 *   migrations/sqlite/schema.sql if the tables do not exist yet.
 * - Seeds the first admin from ADMIN_NAME / ADMIN_PHONE / ADMIN_PASSWORD
 *   whenever the database has no admin user.
 *
 * For MySQL, migrate with the SQL files in migrations/ as documented in
 * php-backend/README.md; this script only handles schema setup for SQLite.
 */
// scripts/ lives outside public/, so it is never routed by the web runner;
// this guard is only defense-in-depth for web SAPIs.
if (!in_array(PHP_SAPI, ['cli', 'wasm'], true)) {
    http_response_code(403);
    exit('CLI only');
}

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$summary = [
    'driver' => $driver,
    'schemaApplied' => false,
    'adminSeeded' => false,
];

if ($driver === 'sqlite') {
    $tables = $pdo
        ->query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        ->fetchAll();

    if (!$tables) {
        $schemaPath = __DIR__ . '/../migrations/sqlite/schema.sql';
        $schema = file_get_contents($schemaPath);
        if ($schema === false) {
            fwrite(STDERR, "schema.sql not readable at {$schemaPath}\n");
            exit(1);
        }
        $pdo->exec($schema);
        $summary['schemaApplied'] = true;
    }
}

$adminCount = (int) $pdo->query("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'")->fetch()['c'];

if ($adminCount === 0) {
    $adminName = trim((string) env('ADMIN_NAME', ''));
    $adminPhone = trim((string) env('ADMIN_PHONE', ''));
    $adminPassword = (string) env('ADMIN_PASSWORD', '');

    if ($adminName !== '' && $adminPhone !== '' && $adminPassword !== '') {
        $stmt = $pdo->prepare(
            "SELECT id FROM users WHERE phone = ?"
        );
        $stmt->execute([$adminPhone]);
        $existing = $stmt->fetch();

        $hash = password_hash($adminPassword, PASSWORD_BCRYPT);
        if ($existing) {
            $stmt = $pdo->prepare("UPDATE users SET role = 'admin', name = ?, password_hash = ? WHERE id = ?");
            $stmt->execute([$adminName, $hash, $existing['id']]);
        } else {
            $stmt = $pdo->prepare(
                "INSERT INTO users (name, email, phone, role, password_hash) VALUES (?, NULL, ?, 'admin', ?)"
            );
            $stmt->execute([$adminName, $adminPhone, $hash]);
        }
        $summary['adminSeeded'] = true;
    } else {
        $summary['adminNotice'] = 'ADMIN_NAME/ADMIN_PHONE/ADMIN_PASSWORD are not set; admin login unavailable until seeded.';
    }
}

echo json_encode($summary, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
