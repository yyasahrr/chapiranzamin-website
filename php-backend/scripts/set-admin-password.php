<?php
/**
 * Admin account tool (CLI / wasm-runner).
 *
 * Creates the admin if missing, otherwise updates the name, role and
 * password of the existing user with the given phone number.
 *
 * Native PHP:    php scripts/set-admin-password.php <phone> <password> [name]
 * wasm-runner:   npm run backend:admin -- <phone> <password> [name]
 *                (values arrive through ADMIN_TOOL_* environment variables)
 *
 * Always prints one JSON line ({ok, action, phone} or {ok:false, message}).
 */
if (!in_array(PHP_SAPI, ['cli', 'wasm'], true)) {
    http_response_code(403);
    exit('CLI only');
}

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$cliArgs = $argv ?? [];
$phone = trim((string) (getenv('ADMIN_TOOL_PHONE') ?: ($cliArgs[1] ?? '')));
$password = (string) (getenv('ADMIN_TOOL_PASSWORD') ?: ($cliArgs[2] ?? ''));
$name = trim((string) (getenv('ADMIN_TOOL_NAME') ?: ($cliArgs[3] ?? '')));
if ($name === '') {
    $name = 'مدیر چاپخانه';
}

$fail = function (string $message) {
    echo json_encode(['ok' => false, 'message' => $message], JSON_UNESCAPED_UNICODE) . PHP_EOL;
    exit;
};

if (!preg_match('/^09\d{9}$/', $phone)) {
    $fail('شماره موبایل معتبر وارد کنید (مثال: 09123456789).');
}
if (strlen($password) < 6) {
    $fail('رمز عبور حداقل ۶ کاراکتر باشد.');
}

$hash = password_hash($password, PASSWORD_BCRYPT);

$stmt = $pdo->prepare('SELECT id FROM users WHERE phone = ?');
$stmt->execute([$phone]);
$user = $stmt->fetch();

if ($user) {
    $stmt = $pdo->prepare("UPDATE users SET role = 'admin', name = ?, password_hash = ? WHERE id = ?");
    $stmt->execute([$name, $hash, $user['id']]);
    $action = 'updated';
} else {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, role, password_hash) VALUES (?, NULL, ?, 'admin', ?)");
    $stmt->execute([$name, $phone, $hash]);
    $action = 'created';
}

echo json_encode(['ok' => true, 'action' => $action, 'phone' => $phone, 'name' => $name], JSON_UNESCAPED_UNICODE) . PHP_EOL;
