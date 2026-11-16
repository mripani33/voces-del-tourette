# Voces del Tourette

Sitio de vocesdeltourette.com. Estático, sin dependencias, publicado con GitHub Pages desde `docs/`.

- `content/sitio.json`: menú, páginas, artículos y datos generales.
- `content/paginas/` y `content/articulos/`: el texto de cada página, en HTML simple.
- `assets/`: estilos e icono.
- `build.mjs`: genera el sitio en `docs/`. Uso: `node build.mjs`.

Mientras `vistaPrevia` sea `true` en `sitio.json`, el sitio lleva `noindex` y no crea el archivo `CNAME`.
Para pasar a producción: poner `vistaPrevia` en `false`, ejecutar `node build.mjs` y apuntar el dominio a GitHub Pages.

Las direcciones de las páginas son las mismas que tenía el WordPress anterior.
