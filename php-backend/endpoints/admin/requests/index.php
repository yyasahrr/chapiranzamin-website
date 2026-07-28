<?php
$token = $_COOKIE['ciz_session'] ?? '';
$stmt = $pdo->prepare("SELECT users.* FROM sessions INNER JOIN users ON sessions.user_id = users.id WHERE sessions.token = ? AND sessions.expires_at > NOW() AND users.role = 'admin'");
$stmt->execute([$token]);
$admin = $stmt->fetch();
if (!$admin) respond(403, ['message' => 'دسترسی غیرمجاز.']);

$status = $_GET['status'] ?? '';
$q = trim($_GET['q'] ?? '');

$sql = "SELECT sr.*, o.name as organization_name, COUNT(sri.id) as item_count FROM service_requests sr LEFT JOIN organizations o ON sr.organization_id = o.id LEFT JOIN service_request_items sri ON sr.id = sri.service_request_id";
$where = [];
$params = [];

if ($status && $status !== 'all') {
    $where[] = "sr.status = ?";
    $params[] = $status;
}
if ($q) {
    $where[] = "(sr.contact_name LIKE ? OR sr.contact_phone LIKE ? OR sr.tracking_code LIKE ?)";
    $like = "%{$q}%";
    $params[] = $like; $params[] = $like; $params[] = $like;
}

if ($where) $sql .= " WHERE " . implode(" AND ", $where);
$sql .= " GROUP BY sr.id ORDER BY sr.created_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

respond(200, ['requests' => $rows]);
