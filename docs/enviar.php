<?php
// Recibe el formulario de contacto y lo envía por correo a la casilla del sitio.
// No guarda nada en el servidor.
declare(strict_types=1);

const DESTINO = 'info@vocesdeltourette.com';
const REMITENTE = 'info@vocesdeltourette.com';

$quiereJson = strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false;

function responder(bool $ok, string $mensaje, int $codigo, bool $json): void {
    http_response_code($json ? $codigo : 303);
    if ($json) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'mensaje' => $mensaje], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: contacto/?' . ($ok ? 'enviado=1' : 'error=1'));
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    responder(false, 'Método no permitido.', 405, $quiereJson);
}

// Campo trampa: las personas no lo ven; si viene relleno es un robot. Se responde "ok" sin enviar nada.
if (trim((string)($_POST['web'] ?? '')) !== '') {
    responder(true, 'Mensaje enviado.', 200, $quiereJson);
}

$limpiar = static function (string $v): string {
    return trim(str_replace(["\r", "\n", "\0"], ' ', $v));
};
$nombre  = $limpiar((string)($_POST['nombre'] ?? ''));
$email   = $limpiar((string)($_POST['email'] ?? ''));
$mensaje = trim(str_replace("\0", '', (string)($_POST['mensaje'] ?? '')));
$acepto  = ($_POST['acepto'] ?? '') === '1';

if ($nombre === '' || $mensaje === '' || mb_strlen($nombre) > 100 || mb_strlen($mensaje) > 5000) {
    responder(false, 'Escribe tu nombre y tu mensaje.', 422, $quiereJson);
}
if (mb_strlen($email) > 150 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    responder(false, 'Escribe un correo electrónico válido para que podamos responderte.', 422, $quiereJson);
}
if (!$acepto) {
    responder(false, 'Para enviar el mensaje tienes que aceptar la política de privacidad.', 422, $quiereJson);
}

$asunto = '=?UTF-8?B?' . base64_encode('Mensaje desde la web de ' . $nombre) . '?=';
$cuerpo = "Nombre: $nombre\nCorreo: $email\n\n$mensaje\n\n--\nEnviado desde el formulario de vocesdeltourette.com. Aceptó la política de privacidad.\n";
$cabeceras = implode("\r\n", [
    'From: Voces del Tourette <' . REMITENTE . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

$enviado = @mail(DESTINO, $asunto, $cuerpo, $cabeceras, '-f' . REMITENTE);
if (!$enviado) {
    responder(false, 'No se pudo enviar el mensaje. Escríbenos a ' . DESTINO . '.', 500, $quiereJson);
}
responder(true, 'Mensaje enviado. Te responderemos por correo.', 200, $quiereJson);
