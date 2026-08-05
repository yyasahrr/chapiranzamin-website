<?php
$requestId = (int)($_GET['id'] ?? 0);
$token = $_COOKIE['ciz_session'] ?? '';

$stmt = $pdo->prepare("SELECT user_id FROM sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP");
$stmt->execute([$token]);
$row = $stmt->fetch();
$senderId = $row ? (int)$row['user_id'] : null;

if (!$senderId) respond(401, ['message' => 'ورود نکرده‌اید.']);

$stmtUser = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmtUser->execute([$senderId]);
$user = $stmtUser->fetch();
$senderRole = $user ? $user['role'] : 'customer';

$body = json_decode(file_get_contents('php://input'), true);
$message = trim($body['message'] ?? '');

if (strlen($message) < 1) respond(422, ['message' => 'پیام نمی‌تواند خالی باشد.']);

$stmt = $pdo->prepare("INSERT INTO request_messages (service_request_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?)");
$stmt->execute([$requestId, $senderId, $senderRole, $message]);

respond(201, ['message' => 'پیام ثبت شد.', 'message_id' => $pdo->lastInsertId()]);
