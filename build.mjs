// Generador del sitio Voces del Tourette. Sin dependencias: `node build.mjs`.
// Lee content/ (sitio.json + fragmentos HTML) y escribe el sitio completo en docs/,
// que es la carpeta que publica GitHub Pages.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = dirname(fileURLToPath(import.meta.url));
const SALIDA = join(RAIZ, 'docs');
const sitio = JSON.parse(readFileSync(join(RAIZ, 'content/sitio.json'), 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const fechaLarga = (iso) => { const [a, m, d] = iso.split('-').map(Number); return `${d} de ${MESES[m - 1]} de ${a}`; };
const leer = (ruta) => readFileSync(join(RAIZ, 'content', ruta), 'utf8');
const rellenar = (html, base) => html
  .replaceAll('{{base}}', base)
  .replaceAll('{{email}}', sitio.email)
  .replaceAll('{{instagram}}', sitio.instagram);

function escribir(ruta, html) {
  const destino = join(SALIDA, ruta);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, html);
}

// ---------- Plantilla común ----------
function documento({ ruta, base, titulo, descripcion, cuerpo, tipo = 'website', jsonld = [], actual = '' }) {
  const canonica = `${sitio.url}/${ruta}`;
  const tituloCompleto = ruta === '' ? `${sitio.nombre}: información sobre el síndrome de Tourette` : `${titulo} | ${sitio.nombre}`;
  const menu = sitio.menu.map((m) =>
    `<li><a href="${base}${m.slug}/"${m.slug === actual ? ' aria-current="page"' : ''}>${esc(m.texto)}</a></li>`).join('\n          ');
  const grafo = [
    { '@type': 'WebSite', '@id': `${sitio.url}/#web`, url: `${sitio.url}/`, name: sitio.nombre, inLanguage: 'es', description: sitio.descripcion, publisher: { '@id': `${sitio.url}/#proyecto` } },
    { '@type': 'Organization', '@id': `${sitio.url}/#proyecto`, name: sitio.nombre, url: `${sitio.url}/`, email: sitio.email, sameAs: [sitio.instagram], founder: { '@type': 'Person', name: sitio.autora.nombre, url: sitio.autora.url } },
    ...jsonld,
  ];
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(tituloCompleto)}</title>
  <meta name="description" content="${esc(descripcion)}">
  <link rel="canonical" href="${canonica}">${sitio.vistaPrevia ? '\n  <meta name="robots" content="noindex, nofollow">' : ''}
  <meta property="og:type" content="${tipo}">
  <meta property="og:locale" content="es_ES">
  <meta property="og:site_name" content="${esc(sitio.nombre)}">
  <meta property="og:url" content="${canonica}">
  <meta property="og:title" content="${esc(titulo)}">
  <meta property="og:description" content="${esc(descripcion)}">
  <meta name="twitter:card" content="summary">
  <meta name="theme-color" content="#14301F">
  <link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${base}estilos.css">
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo })}</script>
</head>
<body>
  <a class="saltar" href="#contenido">Saltar al contenido</a>
  <header class="cabecera">
    <div class="ancho cabecera-fila">
      <a class="marca" href="${base || './'}">Voces del Tourette</a>
      <button class="menu-boton" type="button" aria-expanded="false" aria-controls="menu">Menú</button>
      <nav id="menu" class="menu" aria-label="Principal">
        <ul>
          ${menu}
        </ul>
      </nav>
    </div>
  </header>
  <main id="contenido">
${cuerpo}
  </main>
  <footer class="pie">
    <div class="ancho pie-rejilla">
      <div>
        <p class="pie-marca">Voces del Tourette</p>
        <p>Un proyecto de <a href="${sitio.autora.url}">${esc(sitio.autora.nombre)}</a>, psicóloga y persona con síndrome de Tourette.</p>
      </div>
      <ul class="pie-lista">
        <li><a href="${base}sitios-de-referencia/">Sitios de referencia</a></li>
        <li><a href="${base}contacto/">Contacto</a></li>
        <li><a href="${sitio.instagram}" rel="noopener">Instagram</a></li>
        <li><a href="mailto:${sitio.email}">${sitio.email}</a></li>
      </ul>
    </div>
    <div class="ancho pie-nota">
      <p>La información de este sitio es educativa y no sustituye la consulta con un profesional de la salud.</p>
      <p>© <span data-anio>2026</span> Voces del Tourette</p>
    </div>
  </footer>
  <script>
    (function () {
      var b = document.querySelector('.menu-boton'), m = document.getElementById('menu');
      b.addEventListener('click', function () {
        var abierto = m.classList.toggle('abierto');
        b.setAttribute('aria-expanded', abierto);
      });
      document.querySelectorAll('[data-anio]').forEach(function (e) { e.textContent = new Date().getFullYear(); });
    })();
  </script>
</body>
</html>
`;
}

const migas = (base, pasos) =>
  `<nav class="migas" aria-label="Ruta de navegación"><a href="${base || './'}">Inicio</a>${pasos.map((p) => ` / ${p.href ? `<a href="${p.href}">${esc(p.texto)}</a>` : `<span>${esc(p.texto)}</span>`}`).join('')}</nav>`;

const migasLd = (pasos) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [{ nombre: 'Inicio', url: `${sitio.url}/` }, ...pasos].map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.nombre, item: p.url })),
});

// ---------- Inicio ----------
function inicio() {
  const base = '';
  const voz = ['Juntos', 'alcemos', 'la voz', 'por el', 'Tourette'];
  const guias = sitio.paginas.filter((p) => p.enInicio).map((p) => `
        <li><a href="${p.slug}/"><span class="guia-titulo">${esc(p.tituloCorto || p.titulo)}</span><span class="guia-resumen">${esc(p.resumen)}</span></a></li>`).join('');
  const articulos = sitio.articulos.slice(0, 3).map((a) => `
        <li><a href="${a.slug}/"><span class="guia-titulo">${esc(a.titulo)}</span><span class="guia-resumen">${fechaLarga(a.fecha)}</span></a></li>`).join('');
  const cuerpo = `    <section class="portada">
      <div class="ancho">
        <h1 class="voz" aria-label="Juntos alcemos la voz por el Tourette">${voz.map((p, i) => `<span class="voz-${i + 1}" aria-hidden="true">${p}</span>`).join(' ')}</h1>
        <p class="portada-texto">Llevamos psicoeducación a las personas con Tourette y a toda la comunidad, para que haya más comprensión y más respeto frente a las diferencias.</p>
        <p class="portada-acciones"><a class="boton" href="que-es-el-sindrome-de-tourette/">Qué es el síndrome de Tourette</a> <a class="enlace-claro" href="quiensoy/">Conoce a Belén</a></p>
      </div>
    </section>

    <section class="bloque">
      <div class="ancho">
        <h2 class="titulo-seccion">El síndrome de Tourette, en tres frases</h2>
        <ul class="frases">
          <li>Es una condición del neurodesarrollo.</li>
          <li>Se caracteriza por la presencia de tics.</li>
          <li>Afecta al 1,5 % de la población mundial.</li>
        </ul>
        <p class="afirmacion">No es un obstáculo para el desarrollo de la vida social, afectiva, escolar y profesional cuando se brindan las herramientas necesarias.</p>
      </div>
    </section>

    <section class="bloque bloque-borde">
      <div class="ancho">
        <h2 class="titulo-seccion">Guías para entender y acompañar</h2>
        <ul class="guias">${guias}
        </ul>
      </div>
    </section>

    <section class="historia">
      <div class="ancho historia-rejilla">
        <blockquote>
          <p>Un diagnóstico no es una sentencia. Que nadie te diga cuál es tu techo.</p>
        </blockquote>
        <div>
          <p>«Yo tengo síndrome de Tourette. Y si bien mis tics comenzaron en la infancia, no recibí mi diagnóstico hasta los diecinueve años. Poder ponerle un nombre a lo que me sucedía trajo tranquilidad a mi vida y marcó un mapa de ruta.»</p>
          <p>Belén es psicóloga, está certificada en la técnica CBIT y creó este sitio para acercar información con aval científico en lenguaje simple.</p>
          <p><a href="quiensoy/">Leer la historia de Belén</a></p>
        </div>
      </div>
    </section>

    <section class="bloque">
      <div class="ancho">
        <h2 class="titulo-seccion">Biblioteca</h2>
        <ul class="guias">${articulos}
        </ul>
        <p class="mas"><a href="blog/">Ver todos los artículos</a></p>
      </div>
    </section>`;
  escribir('index.html', documento({ ruta: '', base, titulo: sitio.nombre, descripcion: sitio.descripcion, cuerpo }));
}

// ---------- Páginas ----------
function paginas() {
  const guias = sitio.paginas.filter((p) => p.enInicio);
  for (const p of sitio.paginas) {
    const base = '../';
    const contenido = rellenar(leer(`paginas/${p.slug}.html`), base);
    const otras = guias.filter((g) => g.slug !== p.slug).map((g) => `
          <li><a href="${base}${g.slug}/"><span class="guia-titulo">${esc(g.tituloCorto || g.titulo)}</span><span class="guia-resumen">${esc(g.resumen)}</span></a></li>`).join('');
    const cuerpo = `    <article class="pagina">
      <header class="pagina-cabecera">
        <div class="ancho">
          ${migas(base, [{ texto: p.tituloCorto || p.titulo }])}
          <h1>${esc(p.titulo)}</h1>
          <p class="entradilla">${esc(p.resumen)}</p>
        </div>
      </header>
      <div class="ancho">
        <div class="prosa">
${contenido}
        </div>
      </div>
    </article>
    <section class="bloque bloque-borde">
      <div class="ancho">
        <h2 class="titulo-seccion">Seguir leyendo</h2>
        <ul class="guias">${otras}
        </ul>
      </div>
    </section>`;
    escribir(`${p.slug}/index.html`, documento({
      ruta: `${p.slug}/`, base, titulo: p.titulo, descripcion: p.descripcion, cuerpo, actual: p.slug,
      jsonld: [
        { '@type': 'WebPage', '@id': `${sitio.url}/${p.slug}/`, url: `${sitio.url}/${p.slug}/`, name: p.titulo, description: p.descripcion, inLanguage: 'es', isPartOf: { '@id': `${sitio.url}/#web` }, author: { '@type': 'Person', name: sitio.autora.nombre, url: sitio.autora.url } },
        migasLd([{ nombre: p.titulo, url: `${sitio.url}/${p.slug}/` }]),
      ],
    }));
  }
}

// ---------- Biblioteca (blog) ----------
function biblioteca() {
  const base = '../';
  const lista = sitio.articulos.map((a) => `
          <li><a href="${base}${a.slug}/"><span class="guia-titulo">${esc(a.titulo)}</span><span class="guia-resumen">${fechaLarga(a.fecha)}. ${esc(a.resumen)}</span></a></li>`).join('');
  const cuerpo = `    <article class="pagina">
      <header class="pagina-cabecera">
        <div class="ancho">
          ${migas(base, [{ texto: 'Biblioteca' }])}
          <h1>Biblioteca</h1>
          <p class="entradilla">Artículos y novedades sobre el síndrome de Tourette.</p>
        </div>
      </header>
      <div class="ancho">
        <ul class="guias">${lista}
        </ul>
      </div>
    </article>`;
  escribir('blog/index.html', documento({
    ruta: 'blog/', base, titulo: 'Biblioteca', descripcion: 'Artículos y novedades sobre el síndrome de Tourette, los tics y la vida con Tourette.', cuerpo, actual: 'blog',
    jsonld: [migasLd([{ nombre: 'Biblioteca', url: `${sitio.url}/blog/` }])],
  }));

  for (const a of sitio.articulos) {
    const contenido = rellenar(leer(`articulos/${a.slug}.html`), base);
    const cuerpoArticulo = `    <article class="pagina">
      <header class="pagina-cabecera">
        <div class="ancho">
          ${migas(base, [{ texto: 'Biblioteca', href: `${base}blog/` }])}
          <h1>${esc(a.titulo)}</h1>
          <p class="entradilla"><time datetime="${a.fecha}">${fechaLarga(a.fecha)}</time>. Por ${esc(a.autora)}.</p>
        </div>
      </header>
      <div class="ancho">
        <div class="prosa">
${contenido}
        </div>
        <p class="mas"><a href="${base}blog/">Ver todos los artículos</a></p>
      </div>
    </article>`;
    escribir(`${a.slug}/index.html`, documento({
      ruta: `${a.slug}/`, base, titulo: a.titulo, descripcion: a.resumen, cuerpo: cuerpoArticulo, tipo: 'article', actual: 'blog',
      jsonld: [
        { '@type': 'Article', headline: a.titulo, description: a.resumen, datePublished: a.fecha, inLanguage: 'es', mainEntityOfPage: `${sitio.url}/${a.slug}/`, author: { '@type': 'Person', name: a.autora }, publisher: { '@id': `${sitio.url}/#proyecto` } },
        migasLd([{ nombre: 'Biblioteca', url: `${sitio.url}/blog/` }, { nombre: a.titulo, url: `${sitio.url}/${a.slug}/` }]),
      ],
    }));
  }
}

// ---------- Archivos sueltos ----------
function extras() {
  // La página 404 se sirve desde cualquier ruta, así que usa rutas absolutas.
  const base = sitio.vistaPrevia ? sitio.basePrevia : '/';
  const cuerpo = `    <article class="pagina">
      <header class="pagina-cabecera">
        <div class="ancho">
          <h1>Esta página no existe</h1>
          <p class="entradilla">Puede que la dirección haya cambiado. Desde el <a href="${base}">inicio</a> llegas a todas las guías.</p>
        </div>
      </header>
    </article>`;
  escribir('404.html', documento({ ruta: '404.html', base, titulo: 'Página no encontrada', descripcion: 'Página no encontrada.', cuerpo }));

  const urls = [
    { loc: `${sitio.url}/`, mod: sitio.articulos[0]?.fecha },
    ...sitio.paginas.map((p) => ({ loc: `${sitio.url}/${p.slug}/`, mod: p.fecha })),
    { loc: `${sitio.url}/blog/`, mod: sitio.articulos[0]?.fecha },
    ...sitio.articulos.map((a) => ({ loc: `${sitio.url}/${a.slug}/`, mod: a.fecha })),
  ];
  escribir('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.mod ? `<lastmod>${u.mod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`);
  escribir('robots.txt', sitio.vistaPrevia
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${sitio.url}/sitemap.xml\n`);
  escribir('.nojekyll', '');
  if (!sitio.vistaPrevia) escribir('CNAME', new URL(sitio.url).hostname + '\n');
  cpSync(join(RAIZ, 'assets'), SALIDA, { recursive: true });
}

if (existsSync(SALIDA)) rmSync(SALIDA, { recursive: true });
inicio();
paginas();
biblioteca();
extras();
console.log(`Sitio generado en docs/ (${sitio.paginas.length} páginas, ${sitio.articulos.length} artículos${sitio.vistaPrevia ? ', modo vista previa' : ''}).`);
