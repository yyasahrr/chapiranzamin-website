<?php
$token = $_COOKIE['ciz_session'] ?? '';
$stmt = $pdo->prepare("SELECT users.* FROM sessions INNER JOIN users ON sessions.user_id = users.id WHERE sessions.token = ? AND sessions.expires_at > NOW() AND users.role = 'admin'");
$stmt->execute([$token]);
if (!$stmt->fetch()) respond(403, ['message' => 'دسترسی غیرمجاز.']);

$id = (int)($_GET['id'] ?? 0);
$stmt = $pdo->prepare("SELECT sr.*, o.name as organization_name FROM service_requests sr LEFT JOIN organizations o ON sr.organization_id = o.id WHERE sr.id = ?");
$stmt->execute([$id]);
$request = $stmt->fetch();
if (!$request) respond(404, ['message' => 'درخواست یافت نشد.']);

$stmtItems = $pdo->prepare("SELECT * FROM service_request_items WHERE service_request_id = ?");
$stmtItems->execute([$id]);
$request['items'] = $stmtItems->fetchAll();

respond(200, ['request' => $request]);
