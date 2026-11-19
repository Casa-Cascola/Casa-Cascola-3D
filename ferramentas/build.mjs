// Gera os arquivos que a página usa:
//   js/app.js           (fonte/main.js + three.js num arquivo só, roda até aberto do disco)
//   css/fontes.css      (fonte Outfit embutida, funciona sem internet)
//   modelos/casa.glb.js (cópia da casa em base64, usada só quando o site é aberto do disco)
//   modelos/comodos/*.glb.js (o mesmo para os cômodos por dentro)
//   modelos/comodos/*.webp.js (a luz assada dos cômodos) e modelos/ferramentas/*.glb.js (a pistola)
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (...a) => path.join(raiz, ...a);

await build({
  entryPoints: [p('fonte/main.js')], bundle: true, minify: true, format: 'iife',
  target: ['es2020', 'safari15'], outfile: p('js/app.js'), legalComments: 'none', logLevel: 'warning',
});



// Fonte: a Outfit (SIL Open Font License), no lugar da Brandon Grotesque do guia da marca, que é paga.
// Embutida em base64 para funcionar sem internet. Se a empresa tiver a licença da Brandon, é só
// acrescentar o @font-face dela no fim do css/fontes.css (o index.css já procura por ela primeiro).
const fonte = path.join(p('node_modules/@fontsource-variable/outfit'), 'files/outfit-latin-wght-normal.woff2');
const b64 = fs.readFileSync(fonte).toString('base64');
fs.writeFileSync(p('css/fontes.css'),
`/* Outfit (SIL Open Font License), embutida para funcionar sem internet. Gerado por ferramentas/build.mjs */
@font-face {
  font-family: 'Outfit Variable';
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url(data:font/woff2;base64,${b64}) format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`);

const glb = p('modelos/casa.glb');
if (fs.existsSync(glb)) {
  fs.writeFileSync(p('modelos/casa.glb.js'), `window.CASA_GLB_BASE64="${fs.readFileSync(glb).toString('base64')}";\n`);
}
// cópias dos cômodos (o banheiro por dentro), também para o site aberto do disco
const pastaComodos = p('modelos/comodos');
let comodos = 0;
if (fs.existsSync(pastaComodos)) for (const f of fs.readdirSync(pastaComodos).filter((n) => n.endsWith('.glb'))) {
  const url = `modelos/comodos/${f}`;
  fs.writeFileSync(p(url + '.js'), `(window.CASCOLA_GLB=window.CASCOLA_GLB||{})[${JSON.stringify(url)}]="${fs.readFileSync(p(url)).toString('base64')}";\n`);
  comodos += 1;
}
// as ferramentas das demonstrações (pistola com cartucho) e as imagens de luz assada dos cômodos,
// também para o site aberto do disco
for (const pasta of ['modelos/ferramentas', 'modelos/comodos']) {
  if (!fs.existsSync(p(pasta))) continue;
  for (const f of fs.readdirSync(p(pasta))) {
    const url = `${pasta}/${f}`;
    if (f.endsWith('.glb') && pasta === 'modelos/ferramentas') {
      fs.writeFileSync(p(url + '.js'), `(window.CASCOLA_GLB=window.CASCOLA_GLB||{})[${JSON.stringify(url)}]="${fs.readFileSync(p(url)).toString('base64')}";\n`);
    } else if (f.endsWith('.webp')) {
      fs.writeFileSync(p(url + '.js'), `(window.CASCOLA_IMG=window.CASCOLA_IMG||{})[${JSON.stringify(url)}]="data:image/webp;base64,${fs.readFileSync(p(url)).toString('base64')}";\n`);
    }
  }
}
const kb = (f) => (fs.statSync(p(f)).size / 1024).toFixed(0) + ' KB';
console.log('js/app.js', kb('js/app.js'), '| css/fontes.css', kb('css/fontes.css'), fs.existsSync(glb) ? '| modelos/casa.glb.js ' + kb('modelos/casa.glb.js') : '', comodos ? `| ${comodos} cômodo(s)` : '');
