<?php
$body = json_decode(file_get_contents('php://input'), true);
$phone = trim($body['phone'] ?? '');
$password = $body['password'] ?? '';

if (!preg_match('/^09\d{9}$/', $phone)) respond(422, ['message' => 'شماره موبایل معتبر وارد کنید.']);

$stmt = $pdo->prepare("SELECT * FROM users WHERE phone = ?");
$stmt->execute([$phone]);
$user = $stmt->fetch();

if (!$user || !verifyPassword($password, $user['password_hash'])) {
    respond(401, ['message' => 'شماره موبایل یا رمز عبور اشتباه است.']);
}

// Create session token
$token = bin2hex(random_bytes(32));
$expires = date('Y-m-d H:i:s', time() + 30 * 24 * 60 * 60); // 30 days
$stmt = $pdo->prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)");
$stmt->execute([$token, $user['id'], $expires]);

setcookie('ciz_session', $token, [
    'expires' => time() + 30 * 24 * 60 * 60,
    'httponly' => true,
    'samesite' => 'Lax',
    'path' => '/',
]);

respond(200, [
    'message' => 'ورود موفق',
    'user' => [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'role' => $user['role'],
    ],
    'token' => $token
]);
