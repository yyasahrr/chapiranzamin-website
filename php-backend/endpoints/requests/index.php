<?php
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $token = $_COOKIE['ciz_session'] ?? '';
    $user = null;
    if ($token) {
        $stmt = $pdo->prepare("SELECT users.* FROM sessions INNER JOIN users ON sessions.user_id = users.id WHERE sessions.token = ? AND sessions.expires_at > NOW()");
        $stmt->execute([$token]);
        $user = $stmt->fetch();
    }

    if (!$user) respond(401, ['message' => 'ورود نکرده‌اید.']);

    if ($user['role'] === 'admin') {
        $stmt = $pdo->query("SELECT sr.*, COUNT(sri.id) as item_count FROM service_requests sr LEFT JOIN service_request_items sri ON sr.id = sri.service_request_id GROUP BY sr.id ORDER BY sr.created_at DESC");
        $rows = $stmt->fetchAll();
    } else {
        $stmt = $pdo->prepare("SELECT sr.*, COUNT(sri.id) as item_count FROM service_requests sr LEFT JOIN service_request_items sri ON sr.id = sri.service_request_id WHERE sr.user_id = ? GROUP BY sr.id ORDER BY sr.created_at DESC");
        $stmt->execute([$user['id']]);
        $rows = $stmt->fetchAll();
    }

    respond(200, ['requests' => $rows]);
}

// POST logic continues below
$body = json_decode(file_get_contents('php://input'), true);

// Get session user if logged in
$token = $_COOKIE['ciz_session'] ?? '';
$userId = null;
if ($token) {
    $stmt = $pdo->prepare("SELECT user_id FROM sessions WHERE token = ? AND expires_at > NOW()");
    $stmt->execute([$token]);
    $row = $stmt->fetch();
    $userId = $row ? (int)$row['user_id'] : null;
}

$contactName = trim($body['contactName'] ?? '');
$contactPhone = trim($body['contactPhone'] ?? '');
$contactEmail = $body['contactEmail'] ? trim($body['contactEmail']) : null;
$requestType = in_array($body['requestType'] ?? 'personal', ['personal', 'organization', 'municipal']) ? $body['requestType'] : 'personal';

if (strlen($contactName) < 2) respond(422, ['message' => 'نام تماس الزامی است.']);
if (!preg_match('/^09\d{9}$/', $contactPhone)) respond(422, ['message' => 'شماره موبایل معتبر وارد کنید.']);

$trackingCode = generateTrackingCode();

$stmt = $pdo->prepare("INSERT INTO service_requests (tracking_code, user_id, request_type, status, priority, contact_name, contact_phone, contact_email, needs_consultation, needs_design, needs_installation, needs_permit_followup, description) VALUES (?, ?, ?, 'new', 'normal', ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([
    $trackingCode,
    $userId,
    $requestType,
    $contactName,
    $contactPhone,
    $contactEmail,
    (int)($body['needsConsultation'] ?? true),
    (int)($body['needsDesign'] ?? false),
    (int)($body['needsInstallation'] ?? false),
    (int)($body['needsPermitFollowup'] ?? false),
    $body['description'] ?? null
]);
$requestId = $pdo->lastInsertId();

// Insert items
$rawItems = is_array($body['items'] ?? null) ? $body['items'] : [];
$categories = ['banner', 'billboard', 'urban_advertising', 'poster', 'brochure', 'catalog', 'sticker', 'signage', 'graphic_design', 'other'];

$stmtItem = $pdo->prepare("INSERT INTO service_request_items (service_request_id, category, title, quantity, width, height, dimension_unit, material, installation_location, installation_address, requires_permit, requires_installation_team, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

foreach ($rawItems as $raw) {
    $category = in_array($raw['category'] ?? '', $categories) ? $raw['category'] : null;
    $title = trim($raw['title'] ?? '');
    if (!$category || !$title) continue;

    $stmtItem->execute([
        $requestId,
        $category,
        $title,
        max(1, (int)($raw['quantity'] ?? 1)),
        $raw['width'] ? (float)$raw['width'] : null,
        $raw['height'] ? (float)$raw['height'] : null,
        ($raw['dimensionUnit'] ?? 'cm') === 'm' ? 'm' : 'cm',
        $raw['material'] ?? null,
        $raw['installationLocation'] ?? null,
        $raw['installationAddress'] ?? null,
        (int)($raw['requiresPermit'] ?? false),
        (int)($raw['requiresInstallationTeam'] ?? false),
        $raw['description'] ?? null
    ]);
}

respond(201, [
    'message' => 'درخواست با موفقیت ثبت شد.',
    'tracking_code' => $trackingCode,
    'request_id' => $requestId
]);
