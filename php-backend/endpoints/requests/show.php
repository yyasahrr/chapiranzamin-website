<?php
$id = (int)($_GET['id'] ?? 0);
$stmt = $pdo->prepare("SELECT * FROM service_requests WHERE id = ?");
$stmt->execute([$id]);
$request = $stmt->fetch();

if (!$request) respond(404, ['message' => 'درخواست یافت نشد.']);

$stmtItems = $pdo->prepare("SELECT * FROM service_request_items WHERE service_request_id = ?");
$stmtItems->execute([$id]);
$request['items'] = $stmtItems->fetchAll();

respond(200, ['request' => $request]);
