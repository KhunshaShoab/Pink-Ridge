<?php
/**
 * Pink Ridge — quote request handler (Hostinger / PHP mail).
 * Returns JSON so the front end can show inline success or failure.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

const MAIL_TO   = 'info@pinkridges.com';
const MAIL_FROM = 'noreply@pinkridges.com';   // must be on your own domain
const SITE_NAME = 'Pink Ridge';

function fail(string $msg, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}
function clean(string $v, int $max = 2000): string {
    $v = trim($v);
    $v = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $v); // header-injection guard
    return mb_substr($v, 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail('Method not allowed', 405);
}

// Honeypot: silently accept, never send.
if (!empty($_POST['company_website'] ?? '')) {
    echo json_encode(['ok' => true]);
    exit;
}

$name     = clean($_POST['name']     ?? '', 120);
$email    = clean($_POST['email']    ?? '', 160);
$phone    = clean($_POST['phone']    ?? '', 60);
$company  = clean($_POST['company']  ?? '', 120);
$country  = clean($_POST['country']  ?? '', 80);
$interest = clean($_POST['interest'] ?? '', 80);
$quantity = clean($_POST['quantity'] ?? '', 200);
$message  = trim((string)($_POST['message'] ?? ''));
$message  = mb_substr($message, 0, 4000);

if ($name === '' || $email === '' || $phone === '' || $country === '') {
    fail('Please complete the required fields.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Please enter a valid email address.');
}

$lines = [
    "New quote request from the {$SITE_NAME} website",
    str_repeat('-', 48),
    "Name:      {$name}",
    "Email:     {$email}",
    "Phone:     {$phone}",
    "Company:   " . ($company !== '' ? $company : '—'),
    "Country:   {$country}",
    "Interest:  " . ($interest !== '' ? $interest : '—'),
    "Quantity:  " . ($quantity !== '' ? $quantity : '—'),
    '',
    'Message:',
    ($message !== '' ? $message : '—'),
    '',
    str_repeat('-', 48),
    'Received: ' . date('Y-m-d H:i:s') . ' (server time)',
    'IP:       ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
];
$body = implode("\n", $lines);

$subject = "Quote request — {$name}" . ($country !== '' ? " ({$country})" : '');

$headers   = [];
$headers[] = 'From: ' . SITE_NAME . ' <' . MAIL_FROM . '>';
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
$headers[] = 'Content-Type: text/plain; charset=utf-8';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$sent = @mail(MAIL_TO, $subject, $body, implode("\r\n", $headers), '-f' . MAIL_FROM);

if (!$sent) {
    // keep a local copy so no enquiry is ever lost if mail() fails
    @file_put_contents(__DIR__ . '/inquiries.log', $body . "\n\n", FILE_APPEND | LOCK_EX);
    fail('We could not send your message just now. Please WhatsApp us instead.', 500);
}

echo json_encode(['ok' => true]);
