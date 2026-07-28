<?php
$token = $_COOKIE['ciz_session'] ?? '';
$stmt = $pdo->prepare("SELECT users.* FROM sessions INNER JOIN users ON sessions.user_id = users.id WHERE sessions.token = ? AND sessions.expires_at > NOW() AND users.role = 'admin'");
$stmt->execute([$token]);
if (!$stmt->fetch()) respond(403, ['message' => 'دسترسی غیرمجاز.']);

$stmt = $pdo->query("SELECT status, COUNT(*) as count FROM service_requests GROUP BY status");
$byStatus = $stmt->fetchAll();

$stmt = $pdo->query("SELECT COUNT(*) as total FROM service_requests");
$totalRequests = (int)$stmt->fetch()['total'];

$stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
$customerCount = (int)$stmt->fetch()['count'];

$stmt = $pdo->query("SELECT COUNT(*) as count FROM organizations");
$organizationCount = (int)$stmt->fetch()['count'];

respond(200, [
    'byStatus' => $byStatus,
    'totalRequests' => $totalRequests,
    'customerCount' => $customerCount,
    'organizationCount' => $organizationCount,
]);
