// O arquivo da casa: baixar o Casa.glb, colocar na cena e completar o que
// o Blender não exportou (peças espelhadas, troncos das árvores, chão até o horizonte).
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { $ } from './util.js';

const MODELO_CASA = 'modelos/casa.glb';
const MODELO_CARRO = 'modelos/carro.glb'; // opcional: exporte o carro do Blender com este nome

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
loader.setDRACOLoader(new DRACOLoader().setDecoderPath('js/draco/'));

// Baixa, prepara e coloca a casa na cena. `aoProgresso(fracao)` move a barra de carregamento.
export async function carregarCasa({ scene, renderer, aoProgresso, redesenhar }) {
  const buf = await baixarModelo(MODELO_CASA, aoProgresso);
  aoProgresso(0.97);
  const gltf = await loader.parseAsync(buf, '');
  const casa = gltf.scene;
  const aniso = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  casa.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      // vidro com transmissão pesa no tablet: troca por transparência simples
      if (m.transmission > 0) {
        m.transmission = 0;
        m.transparent = true;
        m.opacity = Math.min(m.opacity, 0.38);
        m.depthWrite = false;
        o.castShadow = false;
      }
      // filtragem anisotrópica: chão e telhado ficam nítidos mesmo vistos de lado
      for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) if (m[k]) m[k].anisotropy = aniso;
    }
  });
  scene.add(casa);
  corrigirModelo(casa, scene);
  tentarCarro(scene, redesenhar);
}

async function baixarModelo(url, aoProgresso) {
  // Aberto direto do disco (file://), o navegador bloqueia fetch: usa a cópia em base64.
  if (location.protocol === 'file:') {
    aoProgresso(0.1);
    await new Promise((ok, erro) => {
      const s = document.createElement('script');
      s.src = url + '.js';
      s.onload = ok;
      s.onerror = () => erro(new Error('arquivo-local'));
      document.head.appendChild(s);
    });
    const bin = atob(window.CASA_GLB_BASE64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    delete window.CASA_GLB_BASE64;
    aoProgresso(0.9);
    return bytes.buffer;
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const total = +r.headers.get('Content-Length') || 0;
  if (!r.body || !total) return r.arrayBuffer();
  const leitor = r.body.getReader();
  const partes = [];
  let lidos = 0;
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    partes.push(value);
    lidos += value.length;
    aoProgresso(Math.min(0.95, lidos / total));
  }
  const buf = new Uint8Array(lidos);
  let o = 0;
  for (const p of partes) { buf.set(p, o); o += p.length; }
  return buf.buffer;
}

// O carro é opcional: se existir modelos/carro.glb, entra na cena e o crédito aparece no rodapé.
async function tentarCarro(scene, redesenhar) {
  if (location.protocol === 'file:') return;
  try {
    const r = await fetch(MODELO_CARRO, { method: 'HEAD' });
    if (!r.ok) return;
    const g = await loader.loadAsync(MODELO_CARRO);
    g.scene.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    scene.add(g.scene);
    redesenhar();
    const cred = $('[data-credito-carro]');
    if (cred) cred.hidden = false;
  } catch (e) { /* sem carro: tudo bem */ }
}

// ---------------------------------------------------------------- ajustes de exportação do Blender (ver LEIA-ME)
function corrigirModelo(casa, scene) {
  casa.updateMatrixWorld(true);
  // 1) Peças que no Blender usam modificador de espelho e vieram só pela metade no GLB.
  //    Só espelha quando a peça está de um lado só: se o Blender exportar com
  //    "Apply Modifiers", nada é duplicado.
  const ESPELHAR = {
    Telhado_Telhas: 'x', Testeira: 'xz', Calha_Borda: 'x',
    Varanda_Pilar: 'x', Varanda_CorrimaoLado: 'x', Varanda_GuardaCorpoLado: 'x',
    Varanda_Spots: 'x',
  };
  for (const [nome, eixos] of Object.entries(ESPELHAR)) {
    const obj = casa.getObjectByName(nome);
    if (!obj) continue;
    const caixa = new THREE.Box3().setFromObject(obj);
    const faltaX = eixos.includes('x') && (caixa.max.x < 0.5 || caixa.min.x > -0.5);
    const faltaZ = eixos.includes('z') && (caixa.max.z < 0.5 || caixa.min.z > -0.5);
    const escalas = [];
    if (faltaX) escalas.push([-1, 1]);
    if (faltaZ) escalas.push([1, -1]);
    if (faltaX && faltaZ) escalas.push([-1, -1]);
    for (const [sx, sz] of escalas) {
      const espelho = new THREE.Group();
      espelho.scale.set(sx, 1, sz);
      espelho.add(copiaNoMundo(obj));
      scene.add(espelho);
    }
  }
  // 1b) Peças com modificador de repetição (Array) que vieram com uma cópia só.
  //     Montantes do guarda-corpo: no Blender, um a cada 1 m, de x = -4 a x = 4.
  const REPETIR = { Varanda_Montantes: { de: -4, ate: 4, passo: 1 } };
  for (const [nome, r] of Object.entries(REPETIR)) {
    const obj = casa.getObjectByName(nome);
    if (!obj) continue;
    const caixa = new THREE.Box3().setFromObject(obj);
    if (caixa.max.x - caixa.min.x > r.passo) continue; // já veio com todas as cópias
    const x0 = (caixa.min.x + caixa.max.x) / 2;
    for (let x = r.de; x <= r.ate + 1e-6; x += r.passo) {
      if (Math.abs(x - x0) < 0.05) continue;
      const copia = copiaNoMundo(obj);
      copia.position.x += x - x0;
      scene.add(copia);
    }
  }
  // 2) Troncos das árvores (eram curvas no Blender e não foram exportados).
  const folhasPalmeira = casa.getObjectByName('leaves');
  if (folhasPalmeira) {
    const nasce = pontoDaCopa(folhasPalmeira);           // onde as folhas se encontram
    const canteiro = casa.getObjectByName('Palmeira_Canteiro_Terra');
    const base = canteiro ? new THREE.Box3().setFromObject(canteiro).getCenter(new THREE.Vector3()) : new THREE.Vector3(-9, 0, 7.5);
    base.y = -0.05;
    const topo = nasce.clone(); topo.y -= 0.12;              // termina dentro da copa, sem furar as folhas
    const mat = new THREE.MeshStandardMaterial({ map: texturaTronco('#857258', '#4d3f2f'), roughness: 0.95 });
    mat.map.repeat.set(2, 7);
    scene.add(troncoEntre(base, topo, 0.24, 0.17, new THREE.Vector3(0.32, 0, -0.08), mat));
  }
  const copa = casa.getObjectByName('Arvore_Copa');
  if (copa) {
    const cx = new THREE.Box3().setFromObject(copa);
    const centro = cx.getCenter(new THREE.Vector3());
    const tronco = casa.getObjectByName('Arvore_Tronco');
    const base = tronco ? tronco.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(2.2, 0, 10);
    base.y = -0.05;
    const mat = new THREE.MeshStandardMaterial({ map: texturaTronco('#6a5543', '#3c2e22'), roughness: 0.95 });
    mat.map.repeat.set(2, 5);
    const topo = new THREE.Vector3(centro.x, cx.min.y + (cx.max.y - cx.min.y) * 0.5, centro.z);
    scene.add(troncoEntre(base, topo, 0.18, 0.08, new THREE.Vector3(-0.12, 0, 0.08), mat));
  }
  // 3) Chão e rua continuam até o horizonte.
  //    Usa o mesmo material e a mesma escala de textura do original, para não aparecer emenda.
  estenderSuperficie(scene, casa.getObjectByName('Gramado'), () => new THREE.CircleGeometry(420, 64), -0.025);
  for (const nome of ['Rua', 'Calcada']) {
    estenderSuperficie(scene, casa.getObjectByName(nome), (b) => {
      const g = new THREE.PlaneGeometry(840, b.max.z - b.min.z);
      g.translate(0, -(b.min.z + b.max.z) / 2, 0);
      return g;
    }, -0.012);
  }
}

// Cópia de uma peça já na posição final (fora da hierarquia do GLB).
function copiaNoMundo(obj) {
  const copia = obj.clone(true);
  copia.matrix.copy(obj.matrixWorld);
  copia.matrix.decompose(copia.position, copia.quaternion, copia.scale);
  return copia;
}

// Textura de casca feita em canvas (o tronco não veio no GLB).
function texturaTronco(base, anel) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 128, 256);
  for (let y = 0; y < 256; y += 10 + Math.random() * 6) {
    g.fillStyle = anel; g.globalAlpha = 0.55 + Math.random() * 0.3;
    g.fillRect(0, y, 128, 2 + Math.random() * 2.5);
  }
  g.globalAlpha = 0.12;
  for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() > 0.5 ? '#000' : '#fff'; g.fillRect(Math.random() * 128, Math.random() * 256, 1, 2 + Math.random() * 5); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Tronco levemente curvo, mais grosso na base, da `base` até o `topo`.
function troncoEntre(base, topo, rBase, rTopo, curva, material) {
  const meio = base.clone().lerp(topo, 0.5).add(curva);
  const caminho = new THREE.CatmullRomCurve3([base, base.clone().lerp(meio, 0.5), meio, topo]);
  const n = 32, radial = 14;
  const geo = new THREE.TubeGeometry(caminho, n, 1, radial, false);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    const centro = caminho.getPointAt(i / n);
    const r = THREE.MathUtils.lerp(rBase, rTopo, i / n) * (i === 0 ? 1.35 : 1);
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      v.fromBufferAttribute(pos, k).sub(centro).normalize().multiplyScalar(r).add(centro);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, material);
  m.castShadow = m.receiveShadow = true;
  return m;
}

// Cria uma superfície maior com o material de `obj`, calculando UVs na mesma escala.
function estenderSuperficie(scene, obj, criarGeometria, dy) {
  if (!obj) return;
  let malha = null;
  obj.traverse((m) => { if (!malha && m.isMesh) malha = m; });
  if (!malha) return;
  const caixa = new THREE.Box3().setFromObject(malha);
  const geo = malha.geometry;
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  const idx = geo.index ? [geo.index.getX(0), geo.index.getX(1), geo.index.getX(2)] : [0, 1, 2];
  const P = idx.map((i) => new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(malha.matrixWorld));
  const U = idx.map((i) => (uv ? new THREE.Vector2().fromBufferAttribute(uv, i) : new THREE.Vector2()));
  const x1 = P[1].x - P[0].x, z1 = P[1].z - P[0].z, x2 = P[2].x - P[0].x, z2 = P[2].z - P[0].z;
  const det = x1 * z2 - z1 * x2;
  const nova = criarGeometria(caixa);
  nova.rotateX(-Math.PI / 2);
  if (uv && Math.abs(det) > 1e-9) {
    const coef = (a1, a2) => [(a1 * z2 - z1 * a2) / det, (x1 * a2 - a1 * x2) / det];
    const [ux, uz] = coef(U[1].x - U[0].x, U[2].x - U[0].x);
    const [vx, vz] = coef(U[1].y - U[0].y, U[2].y - U[0].y);
    const np = nova.attributes.position, nuv = nova.attributes.uv;
    for (let i = 0; i < np.count; i++) {
      const dx = np.getX(i) - P[0].x, dz = np.getZ(i) - P[0].z;
      nuv.setXY(i, U[0].x + ux * dx + uz * dz, U[0].y + vx * dx + vz * dz);
    }
  }
  const m = new THREE.Mesh(nova, malha.material.clone());
  m.position.y = caixa.max.y + dy;
  m.receiveShadow = true;
  scene.add(m);
}

// Ponto onde as folhas da palmeira se encontram: no meio da copa (vista de cima),
// na altura em que há mais folhas juntas.
function pontoDaCopa(obj) {
  obj.updateMatrixWorld(true);
  const pts = [];
  const v = new THREE.Vector3();
  obj.traverse((m) => {
    if (!m.isMesh) return;
    const pos = m.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) pts.push(v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).clone());
  });
  const mediana = (a) => { const o = [...a].sort((x, y) => x - y); return o[o.length >> 1]; };
  const mx = mediana(pts.map((p) => p.x)), mz = mediana(pts.map((p) => p.z));
  const perto = pts.filter((p) => Math.hypot(p.x - mx, p.z - mz) < 0.8);
  if (!perto.length) return new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
  const faixas = new Map();
  for (const p of perto) { const k = Math.floor(p.y / 0.25); faixas.set(k, (faixas.get(k) || 0) + 1); }
  let fk = 0, fn = 0;
  for (const [k, n] of faixas) if (n > fn) { fn = n; fk = k; }
  const yc = (fk + 0.5) * 0.25;
  const sel = perto.filter((p) => Math.abs(p.y - yc) < 0.4);
  const soma = sel.reduce((s, p) => s.add(p), new THREE.Vector3());
  return soma.divideScalar(sel.length);
}
