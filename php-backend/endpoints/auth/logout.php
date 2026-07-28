<?php
$token = $_COOKIE['ciz_session'] ?? '';
if ($token) {
    $stmt = $pdo->prepare("DELETE FROM sessions WHERE token = ?");
    $stmt->execute([$token]);
}
setcookie('ciz_session', '', ['expires' => time() - 3600, 'path' => '/']);
respond(200, ['message' => 'خروج با موفقیت انجام شد.']);
