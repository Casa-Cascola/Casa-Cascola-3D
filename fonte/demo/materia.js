// A "matéria" de cada produto: como ele é ao sair da embalagem, como fica enquanto cura
// e o texto que explica a cura. É o que dá a cor, o brilho e a textura dos cordões e filmes.
// Os tempos e os textos vêm das fichas técnicas oficiais da pasta FichaTecnica/ (endereço em `fonte`).
import * as THREE from 'three';
import { mistura, limita } from './motor.js';
import { FICHAS, caminhoFicha } from '../fichas.js';

// Cor da amostra curada do Banheiro e Cozinha na placa Henkel em formato de casa, medida nas
// fotos de 17/11/2026 (com a cor da luz corrigida pelo branco da placa): #ebf0f4.

// estados: do produto fresco (0) ao curado (último). cor, rugosidade, verniz (brilho molhado), opacidade
//   borda:  quanto a luz "atravessa" a borda do cordão (dá o aspecto de pasta translúcida, e não de plástico)
//   filme:  como fica uma camada fina espalhada sobre uma superfície (veja criarMateria com `sobre`)
export const MATERIA = {
  'silicone-banheiro-cozinha': {
    estados: [
      { cor: '#f5f8fa', rug: 0.08, verniz: 1 },      // pasta branca, bem brilhante
      { cor: '#eff3f6', rug: 0.16, verniz: 0.7 },    // formou película
      { cor: '#e9eef1', rug: 0.24, verniz: 0.5 },    // borracha branca, acetinada (amostra da placa)
    ],
    relevo: { tipo: 'liso', forca: 0.08 },
    borda: 0.16,
    comoCura: 'Silicone de cura acética: durante a aplicação, tem odor característico de vinagre.',
    cura: [['5–10 min', 'forma a película'], ['2–3 mm a cada 24 h', 'tempo de cura'], ['24–72 h', 'cura total']],
    fonte: { nome: 'Ficha técnica Cascola Banheiro e Cozinha', url: caminhoFicha(FICHAS['silicone-banheiro-cozinha']) },
  },
  // PL700: pasta incolor; depois de curado, filme transparente e flexível (ficha técnica).
  // opac < 1 liga a transparência do material (criarMateria); a opacidade cai na cura.
    pl700: {
    // Gel incolor: opacidade baixa e verniz alto nos três estados, inclusive no curado.
    // A borda translúcida (fresnel) e o brilho marcam o contorno do cordão sobre o vidro e a parede.
    estados: [
      { cor: '#e8f1f4', rug: 0.03, verniz: 1, opac: 0.38 },   // gel úmido, bem brilhante
      { cor: '#e8f1f4', rug: 0.05, verniz: 1, opac: 0.34 },   // formou película
      { cor: '#e8f1f4', rug: 0.08, verniz: 0.9, opac: 0.30 },  // curado: continua transparente
    ],
    relevo: { tipo: 'liso', forca: 0.05 },
    borda: 0.6,   // contorno mais marcado, para o cordão não sumir
    comoCura: 'Polímero modificado por silano. Depois de curado, fica transparente e flexível.',
    cura: [['10 min', 'para ajustar a peça'], ['10–20 min', 'forma a película'], ['24–72 h', 'cura total']],
    fonte: { nome: 'Ficha técnica Cascola PL700', url: caminhoFicha(FICHAS.pl700) },
  },
};

// Material que anda entre os estados: estado(0) fresco ... estado(n - 1) curado; aceita valores quebrados.
// Com `sobre` (a cor da superfície), vira a camada fina espalhada sobre ela: molhada escurece e brilha,
// seca fica fosca. Usa o `filme` do produto.
export function criarMateria(id, { sobre = null, ...extra } = {}) {
  const m = MATERIA[id];
  let e = m.estados;
  if (sobre && m.filme) {
    const f = m.filme, base = new THREE.Color(sobre), cola = new THREE.Color(e[0].cor), seca = new THREE.Color(e[e.length - 1].cor);
    const camada = (esc, tinta, cor) => '#' + base.clone().multiplyScalar(esc).lerp(cor, tinta).getHexString();
    e = [
      { cor: camada(f.escurece, f.tinta, cola), rug: 0.05, verniz: 1, opac: f.opacMolhado },
      { cor: camada((f.escurece + 1) / 2, f.tinta, cola), rug: 0.4, verniz: 0.35, opac: (f.opacMolhado + f.opacSeco) / 2 },
      { cor: camada(0.97, f.tinta * 0.8, seca), rug: 0.62, verniz: 0.06, opac: f.opacSeco },
    ];
  }
  const temOpac = e.some((s) => s.opac != null && s.opac < 1);
  const mat = new THREE.MeshPhysicalMaterial({ transparent: temOpac, side: THREE.DoubleSide, ...extra });
  if (temOpac) mat.depthWrite = !sobre;      // filme fino não esconde o que está embaixo
  const rel = sobre ? { tipo: 'pincel', forca: m.filme?.relevo ?? 0.85 } : m.relevo;   // as marcas do pincel (ou da espátula) na camada
  if (rel) { mat.normalMap = relevo(rel.tipo); mat.normalScale.setScalar(rel.forca); }
  if (!sobre && m.borda) bordaTranslucida(mat, m.borda, temOpac);
  const a = new THREE.Color(), b = new THREE.Color();
  const estado = (k) => {
    k = limita(k, 0, e.length - 1);
    const i = Math.min(e.length - 2, Math.floor(k)), f = e.length > 1 ? k - i : 0;
    const de = e[Math.max(0, i)], para = e[Math.min(e.length - 1, i + 1)];
    mat.color.copy(a.set(de.cor)).lerp(b.set(para.cor), f);
    mat.roughness = mistura(de.rug, para.rug, f);
    mat.clearcoat = mistura(de.verniz, para.verniz, f);
    mat.clearcoatRoughness = 0.08 + 0.3 * (1 - mat.clearcoat);
    if (temOpac) mat.opacity = mistura(de.opac ?? 1, para.opac ?? 1, f);
  };
  estado(0);
  return { mat, estado };
}

// Na borda do cordão (onde a superfície fica de lado para quem olha) a pasta deixa passar um pouco
// de luz e fica mais clara; nos produtos translúcidos, a borda também fica mais opaca, como um gel.
function bordaTranslucida(mat, forca, gel) {
  const u = { value: forca };
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uBordaCola = u;
    sh.fragmentShader = 'uniform float uBordaCola;\n' + sh.fragmentShader.replace('#include <opaque_fragment>', `
      float fresnelCola = pow(1.0 - clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0), 3.0);
      outgoingLight += diffuseColor.rgb * fresnelCola * uBordaCola;
      ${gel ? 'diffuseColor.a = mix(diffuseColor.a, 1.0, fresnelCola * 0.8);' : ''}
      #include <opaque_fragment>`);
  };
  mat.customProgramCacheKey = () => 'borda-cola-' + (gel ? 'gel' : 'pasta');
}

// ---------------------------------------------------------------- textura de relevo
// Mapa de normais pequeno, feito em canvas (sem arquivo): 'grao' fino, 'pasta' (massa
// amassada) ou 'pincel' (riscos no sentido do comprimento).
const feitos = {};
export function relevo(tipo) {
  if (feitos[tipo]) return feitos[tipo];
  const N = 128, alt = new Float32Array(N * N);
  let semente = 12345 + tipo.length * 7919;
  const rnd = () => ((semente = (semente * 1664525 + 1013904223) >>> 0) / 4294967296);
  // ruído em grade, repetível nas bordas, somado em oitavas
  const camada = (celX, celY, peso) => {
    const gx = Math.max(1, Math.round(N / celX)), gy = Math.max(1, Math.round(N / celY));
    const g = Float32Array.from({ length: gx * gy }, rnd);
    const liso = (t) => t * t * (3 - 2 * t);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const fx = (x / N) * gx, fy = (y / N) * gy, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = liso(fx - x0), ty = liso(fy - y0);
      const v = (i, j) => g[((j + gy) % gy) * gx + ((i + gx) % gx)];
      alt[y * N + x] += peso * ((v(x0, y0) * (1 - tx) + v(x0 + 1, y0) * tx) * (1 - ty) + (v(x0, y0 + 1) * (1 - tx) + v(x0 + 1, y0 + 1) * tx) * ty);
    }
  };
  if (tipo === 'grao') { camada(3, 3, 1); camada(8, 8, 0.6); }
  else if (tipo === 'liso') { camada(40, 18, 1); camada(16, 7, 0.4); }                  // ondas largas e suaves, de pasta alisada
  else if (tipo === 'estria') { camada(128, 11, 1.4); camada(64, 5, 0.7); camada(9, 128, 0.35); }   // estrias do bico ao longo do cordão
  else if (tipo === 'pasta') { camada(22, 22, 1.6); camada(9, 9, 0.9); camada(3, 3, 0.35); }
  else { camada(64, 2.2, 1.4); camada(128, 5, 0.9); camada(20, 1.5, 0.5); }   // 'pincel': riscos ao longo de u
  const tela = document.createElement('canvas'); tela.width = tela.height = N;
  const cx = tela.getContext('2d'), img = cx.createImageData(N, N);
  const h = (x, y) => alt[((y + N) % N) * N + ((x + N) % N)];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = (h(x + 1, y) - h(x - 1, y)) * 2.2, dy = (h(x, y + 1) - h(x, y - 1)) * 2.2, l = Math.hypot(dx, dy, 1), k = (y * N + x) * 4;
    img.data[k] = (-dx / l * 0.5 + 0.5) * 255; img.data[k + 1] = (dy / l * 0.5 + 0.5) * 255; img.data[k + 2] = (1 / l * 0.5 + 0.5) * 255; img.data[k + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
  const tx = new THREE.CanvasTexture(tela);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
  return (feitos[tipo] = tx);
}
