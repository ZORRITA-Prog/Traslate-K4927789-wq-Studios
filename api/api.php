<?php
// Trastale API (opcional): guarda cuentas, limites y actividad en api/data/db.json. No necesita base de datos.
// Para usarla: en js/config.js pon  const API_URL="api/api.php";
header('Content-Type: application/json; charset=utf-8');
const GOOGLE_CLIENT_ID = '';   // opcional: el mismo Client ID que pongas en js/config.js
const ADMIN_USER = 'k4927789-wq', ADMIN_EMAIL = 'k4927789@gmail.com';
// Contraseñas en hash bcrypt (PASSWORD_DEFAULT). No se guardan en texto plano en el código.
const ADMIN_PASS_HASH = '$2y$10$5LPjOeDlHHCi5XotMTPxmuWC1ql/7gKxLz32.CPbwgqIIF402dylC';
// Admins extra (se crean una sola vez). Solo el creador (ADMIN_USER) puede dar o quitar admin y ver la actividad de los admins.
// Formato: [usuario, email, hash_bcrypt]
const EXTRA_ADMINS = [
  ['Emmanuel', 'emmanuel@gmail.com', '$2y$10$ztr56qsy55h7P9UFfu8bAeQCmGJ58NJE77tclx45tNbDqFuOXbdP.'],
  ['Abraham Ruiz', 'abrahamruiz@gmail.com', '$2y$10$IuP.qOBclNwkhDXxeGvmy.n2sfl1D93ZazKSz7RMwLcbzGy5MDl7K']
];
const DEFPIC = 'https://inmiku.infinityfreeapp.com/u/ImMiku_541d421d.jpg';
const ADMIN_PIC = 'https://inmiku.infinityfreeapp.com/u/ImMiku_a8f73f64.jpg';
const ADMIN_BIO = 'Cuenta oficial del creador y administrador de Trastale-K4927789-wq-Studio. Gestiona la comunidad y mantiene la página segura.';
const DIR = __DIR__ . '/data', DB = DIR . '/db.json';

if (!is_dir(DIR)) mkdir(DIR, 0755, true);
if (!file_exists(DIR . '/.htaccess')) file_put_contents(DIR . '/.htaccess', "<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
$fp = fopen(DB, 'c+'); flock($fp, LOCK_EX);
$raw = stream_get_contents($fp);
$D = $raw ? json_decode($raw, true) : null;
if (!is_array($D)) $D = ['users' => [], 'ban' => [], 'logs' => [], 'sess' => []];

function now() { return (int)round(microtime(true) * 1000); }
function save() { global $fp, $D; ftruncate($fp, 0); rewind($fp); fwrite($fp, json_encode($D, JSON_UNESCAPED_UNICODE)); fflush($fp); }
function out($a) { save(); echo json_encode($a, JSON_UNESCAPED_UNICODE); exit; }
function pub($u) { unset($u['p']); $u['owner'] = (int)(($u['e'] ?? '') === ADMIN_EMAIL); return $u; }
// true si el log es de un admin y quien consulta NO es el creador
function hid($l) { global $D, $isOwner; if ($isOwner) return false; if (!empty($l['ad'])) return true; foreach ($D['users'] as $u) if ($u['e'] === $l['e'] && !empty($u['admin'])) return true; return false; }
function idx($f) { global $D; foreach ($D['users'] as $i => $u) if ($f($u)) return $i; return -1; }
function newUser($u, $e, $p, $g = 0) { return ['u' => $u, 'e' => $e, 'p' => $p, 'g' => $g, 'pic' => DEFPIC, 'bio' => '', 'date' => now(), 'used' => 0, 'total' => 0, 'limit' => null]; }
function start($i) {
  global $D; $t = bin2hex(random_bytes(24));
  $D['sess'][$t] = $D['users'][$i]['e']; $D['users'][$i]['last'] = now();
  if (count($D['sess']) > 800) array_shift($D['sess']);
  return ['ok' => 1, 'token' => $t, 'user' => pub($D['users'][$i])];
}
function cutstr($s,$a,$n){return function_exists('mb_substr')?mb_substr($s,$a,$n):substr($s,$a,$n);}
function okUser($u) { return (bool)preg_match('/^[\w.-]{3,20}$/', $u); }

// creador (siempre admin)
$oi = idx(function ($u) { return $u['e'] === ADMIN_EMAIL; });
if ($oi < 0) {
  $a = newUser(ADMIN_USER, ADMIN_EMAIL, ADMIN_PASS_HASH);
  $a['admin'] = 1; $a['pic'] = ADMIN_PIC; $a['bio'] = ADMIN_BIO; array_unshift($D['users'], $a);
} else $D['users'][$oi]['admin'] = 1;
// admins extra: se crean solo una vez (si luego el creador les quita admin, no se vuelven a poner)
if (!isset($D['seeded']) || !is_array($D['seeded'])) $D['seeded'] = [];
foreach (EXTRA_ADMINS as $x) {
  if (in_array($x[1], $D['seeded'])) continue;
  $D['seeded'][] = $x[1];
  if (idx(function ($u) use ($x) { return $u['e'] === $x[1] || strtolower($u['u']) === strtolower($x[0]); }) >= 0) continue;
  $n = newUser($x[0], $x[1], $x[2]); $n['admin'] = 1; $D['users'][] = $n;
}

$in = json_decode(file_get_contents('php://input'), true) ?: [];
$a = $in['a'] ?? '';
$em = $D['sess'][$in['t'] ?? ''] ?? '';
$mi = idx(function ($u) use ($em) { return $u['e'] === $em && $em !== ''; });
if ($mi >= 0 && in_array($D['users'][$mi]['e'], $D['ban'])) $mi = -1;
$isAdmin = $mi >= 0 && !empty($D['users'][$mi]['admin']);
$isOwner = $isAdmin && $D['users'][$mi]['e'] === ADMIN_EMAIL;

switch ($a) {
  case 'register':
    $u = trim($in['u'] ?? ''); $e = strtolower(trim($in['e'] ?? '')); $p = $in['p'] ?? '';
    if (!okUser($u)) out(['err' => 'user']);
    if (strpos($e, '@') === false) out(['err' => 'bad']);
    if (strlen($p) < 6) out(['err' => 'pass']);
    if (in_array($e, $D['ban'])) out(['err' => 'banned']);
    if (idx(function ($x) use ($u, $e) { return $x['e'] === $e || strtolower($x['u']) === strtolower($u); }) >= 0) out(['err' => 'exists']);
    $D['users'][] = newUser($u, $e, password_hash($p, PASSWORD_DEFAULT));
    out(start(count($D['users']) - 1));
  case 'login':
    $id = strtolower(trim($in['id'] ?? ''));
    $i = idx(function ($x) use ($id) { return strtolower($x['u']) === $id || $x['e'] === $id; });
    if ($i < 0 || !password_verify($in['p'] ?? '', $D['users'][$i]['p'])) out(['err' => 'bad']);
    if (in_array($D['users'][$i]['e'], $D['ban'])) out(['err' => 'banned']);
    out(start($i));
  case 'google':
    if (GOOGLE_CLIENT_ID === '' || empty($in['cred'])) out(['err' => 'bad']);
    $ch = curl_init('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($in['cred']));
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => 1, CURLOPT_TIMEOUT => 10]);
    $r = json_decode(curl_exec($ch), true);
    if (!$r || ($r['aud'] ?? '') !== GOOGLE_CLIENT_ID || ($r['email_verified'] ?? '') !== 'true') out(['err' => 'bad']);
    $e = strtolower($r['email']);
    if (in_array($e, $D['ban'])) out(['err' => 'banned']);
    $i = idx(function ($x) use ($e) { return $x['e'] === $e; });
    if ($i < 0) {
      $n = preg_replace('/[^\w.-]/', '_', substr(explode('@', $e)[0], 0, 20));
      $D['users'][] = newUser($n ?: 'user', $e, password_hash(bin2hex(random_bytes(12)), PASSWORD_DEFAULT), 1);
      $i = count($D['users']) - 1;
    }
    out(start($i));
  case 'me':
    out(['user' => $mi >= 0 ? pub($D['users'][$mi]) : null]);
  case 'logout':
    unset($D['sess'][$in['t'] ?? '']); out(['ok' => 1]);
  case 'profile':
    if ($mi < 0) out(['err' => 'auth']);
    $m = &$D['users'][$mi];
    if (!empty($in['u']) && $in['u'] !== $m['u']) {
      if (!okUser($in['u'])) out(['err' => 'user']);
      $me_ = $m['e'];
      if (idx(function ($x) use ($in, $me_) { return $x['e'] !== $me_ && strtolower($x['u']) === strtolower($in['u']); }) >= 0) out(['err' => 'exists']);
      $m['u'] = $in['u'];
    }
    if (isset($in['bio'])) $m['bio'] = cutstr((string)$in['bio'], 0, 200);
    if (!empty($in['pic']) && preg_match('#^(data:image/|https?:)#', $in['pic']) && strlen($in['pic']) < 80000) $m['pic'] = $in['pic'];
    if (!empty($in['np'])) {
      if (strlen($in['np']) < 6) out(['err' => 'pass']);
      if (!password_verify($in['op'] ?? '', $m['p'])) out(['err' => 'bad']);
      $m['p'] = password_hash($in['np'], PASSWORD_DEFAULT);
    }
    out(['ok' => 1, 'user' => pub($m)]);
  case 'dir':
    $L = [];
    foreach ($D['users'] as $u) if (!in_array($u['e'], $D['ban'])) $L[] = ['u' => $u['u'], 'pic' => $u['pic'], 'bio' => $u['bio'], 'admin' => $u['admin'] ?? 0];
    out(['users' => $L]);
  case 'use':
    if ($mi < 0) out(['err' => 'auth']);
    $m = &$D['users'][$mi];
    if ($m['limit'] !== null && $m['used'] >= $m['limit']) out(['err' => 'limit']);
    $m['used']++; $m['total']++; $m['last'] = now();
    $D['logs'][] = ['t' => now(), 'e' => $m['e'], 'u' => $m['u'], 'ad' => !empty($m['admin']) ? 1 : 0, 'k' => (string)($in['k'] ?? ''), 'f' => (string)($in['f'] ?? ''), 'to' => (string)($in['to'] ?? ''), 'x' => cutstr((string)($in['x'] ?? ''), 0, 500)];
    $D['logs'] = array_slice($D['logs'], -2000);
    out(['ok' => 1, 'used' => $m['used'], 'limit' => $m['limit']]);
}

// ---- solo administrador ----
if (!$isAdmin) out(['err' => 'auth']);
$ti = idx(function ($x) use ($in) { return $x['e'] === ($in['e'] ?? ''); });
switch ($a) {
  case 'users':
    out(['users' => array_map('pub', $D['users'])]);
  case 'banlist':
    out(['ban' => array_values($D['ban'])]);
  case 'del':
  case 'ban':
    if ($ti < 0 || !empty($D['users'][$ti]['admin'])) out(['err' => 'bad']);
    $e = $D['users'][$ti]['e'];
    array_splice($D['users'], $ti, 1);
    if ($a === 'ban' && !in_array($e, $D['ban'])) $D['ban'][] = $e;
    $D['sess'] = array_filter($D['sess'], function ($x) use ($e) { return $x !== $e; });
    out(['ok' => 1]);
  case 'unban':
    $D['ban'] = array_values(array_filter($D['ban'], function ($x) use ($in) { return $x !== ($in['e'] ?? ''); }));
    out(['ok' => 1]);
  case 'setadmin':
    if (!$isOwner) out(['err' => 'auth']);
    if ($ti < 0 || $D['users'][$ti]['e'] === ADMIN_EMAIL) out(['err' => 'bad']);
    if (!empty($in['v'])) { $D['users'][$ti]['admin'] = 1; $D['users'][$ti]['limit'] = null; $D['users'][$ti]['used'] = 0; }
    else unset($D['users'][$ti]['admin']);
    out(['ok' => 1]);
  case 'limit':
    if ($ti < 0 || (!empty($D['users'][$ti]['admin']) && !$isOwner)) out(['err' => 'bad']);
    $l = $in['limit'] ?? null;
    $D['users'][$ti]['limit'] = ($l === null || $l === '' || !is_numeric($l)) ? null : max(0, (int)$l);
    $D['users'][$ti]['used'] = 0;
    out(['ok' => 1]);
  case 'reset':
    if ($ti < 0 || (!empty($D['users'][$ti]['admin']) && !$isOwner)) out(['err' => 'bad']);
    $D['users'][$ti]['used'] = 0; out(['ok' => 1]);
  case 'logs':
    $L = array_values(array_filter($D['logs'], function ($l) use ($in) { return !hid($l) && (empty($in['e']) || $l['e'] === $in['e']); }));
    out(['logs' => array_reverse(array_slice($L, -300))]);
  case 'clearlogs':
    $D['logs'] = array_values(array_filter($D['logs'], function ($l) use ($in) { return hid($l) || (!empty($in['e']) && $l['e'] !== $in['e']); }));
    out(['ok' => 1]);
}
out(['err' => 'bad']);
