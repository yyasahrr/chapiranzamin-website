<?php
$body = json_decode(file_get_contents('php://input'), true);
$name = trim($body['name'] ?? '');
$email = trim($body['email'] ?? '');
$phone = trim($body['phone'] ?? '');
$password = $body['password'] ?? '';

if (strlen($name) < 2) respond(422, ['message' => 'نام الزامی است (حداقل ۲ کاراکتر).']);
if (!preg_match('/^09\d{9}$/', $phone)) respond(422, ['message' => 'شماره موبایل معتبر وارد کنید (مثلاً 09123456789).']);
if (strlen($password) < 6) respond(422, ['message' => 'رمز عبور حداقل ۶ کاراکتر باشد.']);

$stmt = $pdo->prepare("SELECT id FROM users WHERE phone = ?");
$stmt->execute([$phone]);
if ($stmt->fetch()) respond(422, ['message' => 'این شماره موبایل قبلاً ثبت شده است.']);

$stmt = $pdo->prepare("INSERT INTO users (name, email, phone, role, password_hash) VALUES (?, ?, ?, 'customer', ?)");
$stmt->execute([$name, $email ?: null, $phone, hashPassword($password)]);

respond(201, ['message' => 'ثبت‌نام با موفقیت انجام شد.', 'user_id' => $pdo->lastInsertId()]);
