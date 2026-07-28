<?php
$body = json_decode(file_get_contents('php://input'), true);
$trackingCode = trim($body['trackingCode'] ?? '');
$contactPhone = trim($body['contactPhone'] ?? '');

if (!$trackingCode || !$contactPhone) respond(422, ['message' => 'کد پیگیری و شماره موبایل الزامی است.']);

$stmt = $pdo->prepare("SELECT * FROM service_requests WHERE tracking_code = ? AND contact_phone = ?");
$stmt->execute([$trackingCode, $contactPhone]);
$request = $stmt->fetch();

if (!$request) respond(404, ['message' => 'درخواست یافت نشد یا شماره موبایل مطابقت ندارد.']);

$stmtItems = $pdo->prepare("SELECT title, category, quantity FROM service_request_items WHERE service_request_id = ?");
$stmtItems->execute([$request['id']]);
$items = $stmtItems->fetchAll();

respond(200, [
    'request' => [
        'trackingCode' => $request['tracking_code'],
        'status' => $request['status'],
        'requestType' => $request['request_type'],
        'createdAt' => $request['created_at'],
        'meetingScheduledAt' => $request['meeting_scheduled_at'],
        'contactName' => $request['contact_name'],
    ],
    'items' => $items
]);
