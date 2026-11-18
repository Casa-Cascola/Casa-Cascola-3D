// Prepara as embalagens 3D das demonstrações a partir das fotos oficiais (Img/produtos/*.webp):
//   node ferramentas/gerar-rotulos.mjs
// Para cada produto grava, em modelos/rotulos.js, o contorno da embalagem (que vira um sólido
// de revolução no site) e o rótulo recortado. O arquivo é um .js para funcionar também
// com o site aberto direto do disco.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// tipo: 'revolucao' (cartucho, frasco, lata, bisnaga) ou 'caixa'
// (só os produtos que aparecem nas demonstrações; para uma demonstração nova, some o produto aqui)
const PRODUTOS = {
  'silicone-banheiro-cozinha': 'revolucao',
};
const saida = {};
for (const [id, tipo] of Object.entries(PRODUTOS)) {
  const arquivo = path.join(raiz, 'Img/produtos', id + '.webp');
  const { data, info } = await sharp(arquivo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, a = (x, y) => data[(y * W + x) * 4 + 3] > 60;
  if (tipo === 'caixa') {
    const img = await sharp(arquivo).resize({ width: 640 }).webp({ quality: 88 }).toBuffer();
    saida[id] = { tipo, aspecto: W / H, img: 'data:image/webp;base64,' + img.toString('base64') };
    continue;
  }
  // eixo da embalagem: o meio do trecho opaco mais largo, a 60 % da altura
  const y60 = Math.round(H * 0.6); let melhor = [0, 0], ini = -1;
  for (let x = 0; x <= W; x++) {
    if (x < W && a(x, y60)) { if (ini < 0) ini = x; } else if (ini >= 0) { if (x - ini > melhor[1] - melhor[0]) melhor = [ini, x]; ini = -1; }
  }
  const cx = Math.round((melhor[0] + melhor[1]) / 2);
  let topo = y60, base = y60;
  while (topo > 0 && a(cx, topo - 1)) topo--;
  while (base < H - 1 && a(cx, base + 1)) base++;
  // meia largura em cada linha: o trecho opaco que contém o eixo
  const meia = [];
  for (let y = topo; y <= base; y++) {
    let e = cx, d = cx;
    while (e > 0 && a(e - 1, y)) e--;
    while (d < W - 1 && a(d + 1, y)) d++;
    meia.push((d - e + 1) / 2);
  }
  // o bico fotografado ao lado do cartucho às vezes encosta no corpo: essas linhas são cortadas
  const ordenado = [...meia].sort((p, q) => p - q), p90 = ordenado[Math.floor(ordenado.length * 0.9)];
  for (let i = 0; i < meia.length; i++) if (meia[i] > p90 * 1.12) meia[i] = p90;
  const alt = base - topo + 1, rmax = Math.max(...meia);
  const N = 56, perfil = [];
  for (let i = 0; i <= N; i++) {            // de baixo (y = 0) para cima (y = 1)
    const f = i / N, k = Math.min(meia.length - 1, Math.round((1 - f) * (meia.length - 1)));
    let s = 0, c = 0;
    for (let j = Math.max(0, k - 3); j <= Math.min(meia.length - 1, k + 3); j++) { s += meia[j]; c++; }
    perfil.push([+(s / c / alt).toFixed(4), +f.toFixed(4)]);
  }
  // rótulo: recorte em volta do eixo; as bordas transparentes recebem a cor média, para não sujar a textura
  const esq = Math.max(0, Math.round(cx - rmax)), larg = Math.min(W - esq, Math.round(rmax * 2));
  const corte = sharp(arquivo).extract({ left: esq, top: topo, width: larg, height: alt });
  const { dominant } = await corte.clone().flatten({ background: '#808080' }).stats();
  const img = await corte.flatten({ background: dominant }).resize({ height: Math.min(640, alt) }).webp({ quality: 88 }).toBuffer();
  saida[id] = { tipo, raio: +(rmax / alt).toFixed(4), perfil, img: 'data:image/webp;base64,' + img.toString('base64') };
  console.log(id.padEnd(28), `eixo ${cx}  corpo ${larg}x${alt}px  rótulo ${(img.length / 1024).toFixed(0)} KB`);
}
const destino = path.join(raiz, 'modelos/rotulos.js');
fs.writeFileSync(destino, `// Gerado por ferramentas/gerar-rotulos.mjs a partir de Img/produtos. Não edite à mão.\nwindow.CASCOLA_ROTULOS=${JSON.stringify(saida)};\n`);
console.log('Pronto:', destino, (fs.statSync(destino).size / 1024).toFixed(0), 'KB');
