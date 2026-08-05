<?php
$token = $_COOKIE['ciz_session'] ?? '';
$stmt = $pdo->prepare("SELECT users.* FROM sessions INNER JOIN users ON sessions.user_id = users.id WHERE sessions.token = ? AND sessions.expires_at > CURRENT_TIMESTAMP AND users.role = 'admin'");
$stmt->execute([$token]);
if (!$stmt->fetch()) respond(403, ['message' => 'دسترسی غیرمجاز.']);

$id = (int)($_GET['id'] ?? 0);
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
if (isset($body['adminNotes'])) {
    $fields[] = "admin_notes = ?";
    $params[] = $body['adminNotes'];
}
if (isset($body['meetingScheduledAt'])) {
    $fields[] = "meeting_scheduled_at = ?";
    $params[] = $body['meetingScheduledAt'] ?: null;
}

if (!$fields) respond(400, ['message' => 'هیچ داده‌ای برای به‌روزرسانی وجود ندارد.']);

$params[] = $id;
$sql = "UPDATE service_requests SET " . implode(", ", $fields) . " WHERE id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);

respond(200, ['message' => 'درخواست به‌روزرسانی شد.', 'updated' => $stmt->rowCount()]);
