<?php
$token = $_COOKIE['ciz_session'] ?? '';
if (!$token) respond(401, ['message' => 'ورود نکرده‌اید.']);

$stmt = $pdo->prepare("SELECT users.* FROM sessions INNER JOIN users ON sessions.user_id = users.id WHERE sessions.token = ? AND sessions.expires_at > NOW()");
$stmt->execute([$token]);
$user = $stmt->fetch();

if (!$user) {
    setcookie('ciz_session', '', ['expires' => time() - 3600, 'path' => '/']);
    respond(401, ['message' => 'جلسه منقضی شده است.']);
}

respond(200, [
    'user' => [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'role' => $user['role'],
    ]
]);
