<?php
$token = $_COOKIE['ciz_session'] ?? '';
$stmt = $pdo->prepare("SELECT users.* FROM sessions INNER JOIN users ON sessions.user_id = users.id WHERE sessions.token = ? AND sessions.expires_at > CURRENT_TIMESTAMP");
$stmt->execute([$token]);
$user = $stmt->fetch();
if (!$user) respond(401, ['message' => 'ورود نکرده‌اید.']);

$id = (int)($_GET['id'] ?? 0);
$stmt = $pdo->prepare("SELECT * FROM service_requests WHERE id = ?");
$stmt->execute([$id]);
$request = $stmt->fetch();

if (!$request) respond(404, ['message' => 'درخواست یافت نشد.']);
if ($user['role'] !== 'admin' && $request['user_id'] != $user['id']) {
    respond(403, ['message' => 'دسترسی غیرمجاز به این درخواست.']);
}

$body = json_decode(file_get_contents('php://input'), true);
$fields = [];
$params = [];

if (isset($body['status'])) {
    $fields[] = "status = ?";
    $params[] = $body['status'];
}
if (isset($body['priority'])) {
    $fields[] = "priority = ?";
    $params[] = $body['priority'];
}

if (!$fields) respond(400, ['message' => 'هیچ داده‌ای برای به‌روزرسانی وجود ندارد.']);

$params[] = $id;
$sql = "UPDATE service_requests SET " . implode(", ", $fields) . " WHERE id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);

respond(200, ['message' => 'درخواست به‌روزرسانی شد.']);
