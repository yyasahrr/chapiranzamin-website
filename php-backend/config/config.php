<?php
$env = [];
$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        [$key, $value] = explode('=', $line, 2);
        $env[trim($key)] = trim($value);
    }
}

function env(string $key, $default = null) {
    global $env;
    return $env[$key] ?? ($_ENV[$key] ?? getenv($key)) ?? $default;
}
