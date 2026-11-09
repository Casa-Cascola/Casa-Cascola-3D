// Gera os arquivos que a página usa:
//   js/app.js           (fonte/main.js + three.js num arquivo só, roda até aberto do disco)
//   modelos/casa.glb.js (cópia da casa em base64, usada só quando o site é aberto do disco)
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const p = (...a) => path.join(raiz, ...a);

await build({
  entryPoints: [p('fonte/main.js')], bundle: true, minify: true, format: 'iife',
  target: ['es2020', 'safari15'], outfile: p('js/app.js'), legalComments: 'none', logLevel: 'warning',
});

const draco = path.join(p('node_modules/three'), 'examples/jsm/libs/draco/gltf');
fs.mkdirSync(p('js/draco'), { recursive: true });
for (const f of ['draco_decoder.js', 'draco_decoder.wasm', 'draco_wasm_wrapper.js']) fs.copyFileSync(path.join(draco, f), p('js/draco', f));

const fonte = path.join(p('node_modules/@fontsource-variable/archivo'), 'files/archivo-latin-wdth-normal.woff2');
const b64 = fs.readFileSync(fonte).toString('base64');
fs.writeFileSync(p('css/fontes.css'),
`/* Archivo (SIL Open Font License) — embutida para funcionar sem internet. Gerado por ferramentas/build.mjs */
@font-face {
  font-family: 'Archivo Variable';
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  font-stretch: 62% 125%;
  src: url(data:font/woff2;base64,${b64}) format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`);

const glb = p('modelos/casa.glb');
if (fs.existsSync(glb)) {
  fs.writeFileSync(p('modelos/casa.glb.js'), `window.CASA_GLB_BASE64="${fs.readFileSync(glb).toString('base64')}";\n`);
}
const kb = (f) => (fs.statSync(p(f)).size / 1024).toFixed(0) + ' KB';
console.log('js/app.js', kb('js/app.js'), '| css/fontes.css', kb('css/fontes.css'), fs.existsSync(glb) ? '| modelos/casa.glb.js ' + kb('modelos/casa.glb.js') : '');
