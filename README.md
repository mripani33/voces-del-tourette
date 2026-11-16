# Voces del Tourette

Sitio de vocesdeltourette.com. Estático, sin dependencias. Se genera en `docs/` y se sube por FTP al hosting de Donweb con el workflow `Publicar en el hosting`.

- `content/sitio.json`: menú, páginas, artículos y datos generales.
- `content/paginas/` y `content/articulos/`: el texto de cada página, en HTML simple.
- `assets/`: estilos e icono.
- `build.mjs`: genera el sitio en `docs/`. Uso: `node build.mjs`.

Mientras `vistaPrevia` sea `true` en `sitio.json`, el sitio lleva `noindex` y se publica en la carpeta de prueba (`/nuevo/`).
Para pasar a producción: poner `vistaPrevia` en `false` y cambiar la variable `FTP_DIR` a la carpeta pública del dominio.

El formulario de contacto usa `assets/enviar.php`, que necesita un hosting con PHP.

Las direcciones de las páginas son las mismas que tenía el WordPress anterior.
