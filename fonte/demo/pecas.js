// Embalagens e ferramentas das demonstrações, modeladas em código.
// As embalagens usam a foto oficial do produto (modelos/rotulos.js): o contorno da foto
// vira um sólido de revolução e a própria foto é projetada de volta, como rótulo.
// Convenção das ferramentas: a ponta que trabalha fica na origem e o cabo vai para +Y.
import * as THREE from 'three';
import { mistura, degrau } from './motor.js';

const mat = (cor, rug = 0.5, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: rug, metalness: metal, ...extra });
const ACO = () => mat('#b9bcc0', 0.32, 0.9);
const FERRO = () => mat('#2c3037', 0.5, 0.6);
const sombras = (o) => { o.traverse((x) => { if (x.isMesh) { x.castShadow = true; x.receiveShadow = true; } }); return o; };
function caixa(w, h, d, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); return o; }
function cilindro(rTopo, rBase, h, m, x = 0, y = 0, z = 0, lados = 24) { const o = new THREE.Mesh(new THREE.CylinderGeometry(rTopo, rBase, h, lados), m); o.position.set(x, y, z); return o; }

// ---------------------------------------------------------------- rótulos
let pedido;
export function carregarRotulos() {
  return (pedido ||= new Promise((ok, erro) => {
    if (window.CASCOLA_ROTULOS) return ok();
    const s = document.createElement('script');
    s.src = 'modelos/rotulos.js';
    s.onload = () => ok();
    s.onerror = () => erro(new Error('Falta o arquivo modelos/rotulos.js'));
    document.head.appendChild(s);
  }));
}
function texturaDoRotulo(r) {
  const t = new THREE.TextureLoader().load(r.img);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// Embalagem com `altura` metros, em pé, com a base na origem e a frente do rótulo para +Z.
// `achatar`: bisnaga (redonda no ombro, achatada no fundo).
export function embalagem(id, altura, { achatar = false } = {}) {
  const r = window.CASCOLA_ROTULOS?.[id];
  if (!r) return sombras(cilindro(altura * 0.11, altura * 0.11, altura, mat('#0e2b58', 0.4), 0, altura / 2, 0));
  const plastico = new THREE.MeshPhysicalMaterial({ map: texturaDoRotulo(r), roughness: 0.36, clearcoat: 0.35, clearcoatRoughness: 0.25 });
  if (r.tipo === 'caixa') {
    const larg = altura * r.aspecto * 0.915, prof = altura * 0.2;
    plastico.map.repeat.set(0.915, 1); plastico.map.offset.set(0.085, 0);
    const azul = mat('#0f2a5a', 0.45);
    const o = new THREE.Mesh(new THREE.BoxGeometry(larg, altura, prof), [azul, azul, azul, azul, plastico, azul]);
    o.position.y = altura / 2;
    const g = new THREE.Group(); g.add(o);
    return sombras(g);
  }
  const pts = [new THREE.Vector2(0, 0), ...r.perfil.map(([raio, y]) => new THREE.Vector2(Math.max(raio, 0.002) * altura, y * altura)), new THREE.Vector2(0, altura)];
  const g = new THREE.LatheGeometry(pts, 40);
  const p = g.attributes.position, uv = g.attributes.uv, rmax = r.raio * altura;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / altura;
    if (achatar) p.setZ(i, p.getZ(i) * mistura(0.07, 1, degrau(0.02, 0.62, y)));
    uv.setXY(i, 0.5 + (0.46 * p.getX(i)) / rmax, Math.max(y, 0.06));   // a foto é projetada de frente; o fundo usa a cor do corpo, e não a sombra da foto
  }
  g.computeVertexNormals();
  return sombras(new THREE.Mesh(g, plastico));
}

// ---------------------------------------------------------------- pistola aplicadora com cartucho
// A ponta do bico fica na origem; o corpo segue por +Y; o cabo fica do lado +Z.
// Pistola comum de silicone: berço em meia-cana de aço zincado, placa da frente com o encaixe
// do bico, cabo de empunhadura emborrachado, gatilho de aço e haste com argola atrás.
//   userData.apertar(k): k de 0 a 1, quanto do produto já saiu (a haste entra; o gatilho pulsa)
// ---------------------------------------------------------------- pistola do Blender
// A pistola aplicadora modelada no Blender (ferramentas_cascola.blend -> modelos/ferramentas/pistola.glb,
// pelo ferramentas/exportar_pistola.py), com o cartucho Banheiro e Cozinha. Mesma pose da pistola
// feita aqui embaixo: ponta do bico na origem, cartucho para +Y, cabo para +Z.
// Os cartuchos dos outros produtos vêm de modelos/ferramentas/cartuchos_cascola.glb (também do
// Blender): um nó Cartucho_<nome> por produto, com os filhos Cartucho_<nome>_Bico, _Corpo (plástico
// + rótulo) e _Embolo, na mesma posição local do cartucho que está dentro da pistola.
// Sem a pistola, ou para um produto sem cartucho, fica a pistola feita aqui.
const ARQUIVO_PISTOLA = 'modelos/ferramentas/pistola.glb';
const ARQUIVO_CARTUCHOS = 'modelos/ferramentas/cartuchos_cascola.glb';
const PRODUTO_DA_PISTOLA = 'silicone-banheiro-cozinha';
const PARTES_DO_CARTUCHO = ['Bico', 'Corpo', 'Embolo'];
// <nome> no arquivo de cartuchos -> id do produto em dados.js, quando os dois são diferentes
const ID_DO_CARTUCHO = { 'adesivo-montagem-pl500': 'pl500', 'adesivo-montagem-pl600': 'pl600', 'adesivo-montagem-pl700': 'pl700' };
const cartuchos = {};                            // id do produto -> nó Cartucho_<nome> do arquivo
let pistolaBlender = null, carregandoPistola = null;

// Indexa os cartuchos do arquivo pelo id do produto. Os nós ficam só na memória (não vão para a
// cena); as cópias usadas na pistola compartilham malhas, materiais e texturas com eles.
function indexarCartuchos(raiz) {
  for (const no of raiz.children) {
    const nome = no.name.replace(/^Cartucho_/, '');
    if (nome === no.name) continue;
    cartuchos[ID_DO_CARTUCHO[nome] || nome] = no;
  }
}

// Carrega a pistola e os cartuchos do Blender. Chamada uma vez; as chamadas seguintes devolvem a
// mesma promessa. Se a pistola falhar, as demonstrações usam a pistola feita em código; se só os
// cartuchos falharem, a pistola do Blender continua com o cartucho Banheiro e Cozinha.
export function carregarFerramentas(carregar) {
  carregandoPistola ||= Promise.all([
    carregar(ARQUIVO_PISTOLA),
    carregar(ARQUIVO_CARTUCHOS).then(indexarCartuchos, (e) => console.warn('Os cartuchos do Blender não carregaram.', e)),
  ]).then(([m]) => (pistolaBlender = m), (e) => {
    console.warn('A pistola do Blender não carregou; as demonstrações usam a pistola simples.', e);
    return null;
  });
  return carregandoPistola;
}

// Troca o cartucho de dentro da pistola `g` pelo cartucho do produto `id`: cada parte
// (Cartucho_Bico, _Corpo, _Embolo) é substituída por uma cópia da parte correspondente do arquivo
// de cartuchos, com o mesmo nome, o mesmo pai e a mesma posição local da parte original, para que
// apertar() e virarRotulo() continuem achando as peças pelo nome.
function trocarCartucho(g, id) {
  const fonte = cartuchos[id];
  if (!fonte) return;
  for (const parte of PARTES_DO_CARTUCHO) {
    const velha = g.getObjectByName('Cartucho_' + parte), modelo = fonte.getObjectByName(fonte.name + '_' + parte);
    if (!velha || !modelo) continue;
    const nova = modelo.clone(true);
    nova.name = velha.name;
    nova.position.copy(velha.position);
    nova.quaternion.copy(velha.quaternion);
    nova.scale.copy(velha.scale);
    const pai = velha.parent;
    pai.remove(velha);
    pai.add(nova);
  }
}

function pistolaDoBlender(id = PRODUTO_DA_PISTOLA) {
  const g = pistolaBlender.clone(true);          // malhas e materiais compartilhados entre as cópias
  const peca = (nome) => g.getObjectByName(nome);
  trocarCartucho(g, id);
  const haste = peca('Pistola_Haste'), embolo = peca('Cartucho_Embolo'), gatilho = peca('Pistola_Gatilho');
  const corpo = peca('Cartucho_Corpo');
  const yHaste = haste.position.y, yEmbolo = embolo.position.y;
  const apertar = gatilho.userData.cascola_apertar_rad ?? -0.314;
  // a haste empurra o êmbolo para o bico enquanto o cordão sai; o gatilho bombeia
  g.userData.apertar = (k) => {
    const curso = 0.06 * k;
    haste.position.y = yHaste - curso;
    embolo.position.y = yEmbolo - curso;
    gatilho.rotation.x = apertar * Math.abs(Math.sin(k * 40));
  };
  // O rótulo inteiro à vista: o berço é um meio tubo aberto do lado oposto ao cabo (-Z), e o
  // rótulo do arquivo olha para +X, na beirada da abertura. O cartucho gira no próprio eixo para o
  // rótulo ficar no meio da abertura e, dentro dela, virado para a câmera (até 43° para cada lado).
  // O cartucho é um cilindro: girar no eixo não muda o contorno, só o lado do rótulo que aparece.
  const ABERTURA = Math.PI / 2, FOLGA = 0.75, local = new THREE.Vector3();
  corpo.rotation.y = ABERTURA;
  g.userData.virarRotulo = (camera) => {
    local.setFromMatrixPosition(camera.matrixWorld);
    corpo.parent.worldToLocal(local);
    const para = Math.atan2(-local.z, local.x);                      // ângulo que leva +X até a câmera
    const d = THREE.MathUtils.euclideanModulo(para - ABERTURA + Math.PI, Math.PI * 2) - Math.PI;
    corpo.rotation.y = ABERTURA + THREE.MathUtils.clamp(d, -FOLGA, FOLGA);
  };
  g.userData.doBlender = true;
  g.traverse((o) => { o.userData.compartilhado = true; });
  return g;
}

// Pistola com o cartucho do produto `id`: a do Blender, quando ela carregou e existe cartucho do
// produto (o de dentro da pistola ou um do arquivo de cartuchos); senão, a pistola feita em código.
export function pistola(id, opcoes = {}) {
  if (pistolaBlender && (id === PRODUTO_DA_PISTOLA || cartuchos[id])) return pistolaDoBlender(id);
  return pistolaSimples(id, opcoes);
}

// Pistola feita em código (a de antes do modelo do Blender).
export function pistolaSimples(id, { corBico = '#f1f0ea' } = {}) {
  const g = new THREE.Group();
  const zinco = mat('#c4c7cb', 0.34, 0.85), borracha = mat('#1c1e22', 0.72, 0.05);
  // bico do cartucho (plástico branco leitoso) e a rosca dele
  const plasticoBico = new THREE.MeshPhysicalMaterial({ color: corBico, roughness: 0.38, transmission: 0, clearcoat: 0.3, clearcoatRoughness: 0.4 });
  const bico = cilindro(0.0086, 0.0022, 0.095, plasticoBico, 0, 0.0475, 0, 20);
  const rosca = cilindro(0.0118, 0.0118, 0.018, plasticoBico, 0, 0.103, 0, 24);
  for (let i = 0; i < 4; i++) { const f = cilindro(0.0123, 0.0123, 0.0016, plasticoBico, 0, 0.097 + i * 0.004, 0, 24); g.add(f); }   // filetes da rosca
  // cartucho de ponta-cabeça: o bico do cartucho aponta para a ponta
  const cart = embalagem(id, 0.225);
  cart.rotation.z = Math.PI; cart.position.y = 0.335;
  // berço em meia-cana (do lado do cabo), com a borda enrolada
  const berco = new THREE.Mesh(new THREE.CylinderGeometry(0.0298, 0.0298, 0.222, 30, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: '#c4c7cb', roughness: 0.34, metalness: 0.85, side: THREE.DoubleSide }));
  berco.position.y = 0.226;
  const bordaE = cilindro(0.0018, 0.0018, 0.222, zinco, -0.0298, 0.226, 0, 8), bordaD = cilindro(0.0018, 0.0018, 0.222, zinco, 0.0298, 0.226, 0, 8);
  // placa da frente: segura o cartucho e tem o encaixe em U do bico
  const frente = new THREE.Shape();
  frente.moveTo(-0.033, -0.02); frente.lineTo(-0.0125, -0.02); frente.lineTo(-0.0125, 0);
  frente.absarc(0, 0, 0.0125, Math.PI, 0, true);
  frente.lineTo(0.0125, -0.02); frente.lineTo(0.033, -0.02); frente.lineTo(0.033, 0.03);
  frente.absarc(0, 0.03, 0.033, 0, Math.PI, false); frente.lineTo(-0.033, -0.02);
  const placa = new THREE.Mesh(new THREE.ExtrudeGeometry(frente, { depth: 0.004, bevelEnabled: true, bevelSize: 0.0008, bevelThickness: 0.0008, bevelSegments: 1, curveSegments: 16 }), zinco);
  placa.rotation.x = Math.PI / 2; placa.position.y = 0.116;   // o desenho (x, y) vira (x, z): o U abre para o lado oposto ao cabo
  // corpo de trás: onde ficam o cabo, o gatilho e a trava da haste
  const corpoGeo = new THREE.BoxGeometry(0.06, 0.03, 0.062, 2, 2, 2);
  const corpo = new THREE.Mesh(corpoGeo, zinco); corpo.position.set(0, 0.35, 0.012);
  const tampa = cilindro(0.031, 0.031, 0.006, zinco, 0, 0.338, 0, 30);
  // cabo emborrachado, inclinado para trás, com frisos para os dedos
  const cabo = new THREE.Mesh(new THREE.CapsuleGeometry(0.0145, 0.085, 6, 16), borracha);
  cabo.scale.set(0.82, 1, 1); cabo.rotation.x = Math.PI / 2 + 0.3; cabo.position.set(0, 0.383, 0.088);
  // gatilho de aço: alavanca curva na frente do cabo
  const gat = new THREE.Group();
  const alavanca = new THREE.Mesh(new THREE.CapsuleGeometry(0.0075, 0.075, 4, 12), zinco);
  alavanca.scale.set(1.25, 1, 0.5); alavanca.rotation.x = Math.PI / 2 + 0.18; alavanca.position.set(0, -0.006, 0.05);
  gat.add(alavanca); gat.position.set(0, 0.33, 0.02);
  // haste com o êmbolo (dentro do cartucho) e a argola atrás
  const haste = new THREE.Group();
  haste.add(cilindro(0.0036, 0.0036, 0.24, ACO(), 0, 0.12, 0, 12));
  haste.add(cilindro(0.022, 0.022, 0.004, FERRO(), 0, -0.002, 0, 24));
  const argola = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.003, 8, 24), ACO()); argola.rotation.y = Math.PI / 2; argola.position.y = 0.254; haste.add(argola);
  haste.position.y = 0.335;
  // trava da haste (a plaquinha que solta o êmbolo), em cima do corpo
  const trava = caixa(0.026, 0.004, 0.022, zinco, 0, 0.367, -0.006); trava.rotation.x = -0.35;
  g.add(bico, rosca, cart, berco, bordaE, bordaD, placa, corpo, tampa, cabo, gat, haste, trava);
  g.userData.apertar = (k) => { haste.position.y = 0.335 - 0.14 * k; gat.rotation.x = -0.16 * Math.abs(Math.sin(k * 40)); };
  return sombras(g);
}

// ---------------------------------------------------------------- ferramentas de mão
// Espátula: lâmina com o fio na origem, cabo para +Y. Lâmina de aço (com bisel no fio e cantos
// arredondados) ou de plástico (corLamina), virola com rebites e cabo arredondado.
export function espatula(largura = 0.04, { corCabo = '#0e2b58', corLamina = null, comprimento = 0.07 } = {}) {
  const g = new THREE.Group();
  const plastico = !!corLamina, esp = plastico ? 0.0022 : 0.0007, raio = Math.min(largura * 0.12, 0.004);
  const topo = Math.min(largura, 0.026) / 2;
  const la = new THREE.Shape();
  la.moveTo(-largura / 2 + raio, 0); la.lineTo(largura / 2 - raio, 0); la.quadraticCurveTo(largura / 2, 0, largura / 2, raio);
  la.bezierCurveTo(largura / 2, comprimento * 0.55, topo * 1.1, comprimento * 0.75, topo, comprimento);
  la.lineTo(-topo, comprimento);
  la.bezierCurveTo(-topo * 1.1, comprimento * 0.75, -largura / 2, comprimento * 0.55, -largura / 2, raio);
  la.quadraticCurveTo(-largura / 2, 0, -largura / 2 + raio, 0);
  const lg = new THREE.ExtrudeGeometry(la, { depth: esp, bevelEnabled: true, bevelThickness: esp * 0.3, bevelSize: esp * 0.4, bevelSegments: 1, curveSegments: 8 });
  lg.translate(0, 0, -esp / 2);
  const pl = lg.attributes.position;
  for (let i = 0; i < pl.count; i++) { const y = pl.getY(i); if (y < 0.006) pl.setZ(i, pl.getZ(i) * (0.25 + 0.75 * y / 0.006)); }   // bisel: afina no fio
  lg.computeVertexNormals();
  const lamina = new THREE.Mesh(lg, plastico ? mat(corLamina, 0.45, 0, { side: THREE.DoubleSide }) : new THREE.MeshStandardMaterial({ color: '#c3c7cc', roughness: 0.26, metalness: 0.95 }));
  // virola (só nas de aço) e cabo arredondado, um pouco achatado
  if (!plastico) {
    const vir = new THREE.Mesh(new THREE.CylinderGeometry(topo * 0.95, topo * 0.95, 0.012, 20), ACO());
    vir.scale.z = 0.38; vir.position.y = comprimento + 0.005;
    const rebite = new THREE.SphereGeometry(0.0013, 8, 6);
    for (const sx of [-0.45, 0.45]) for (const sz of [-1, 1]) { const rb = new THREE.Mesh(rebite, ACO()); rb.position.set(sx * topo, comprimento + 0.005, sz * topo * 0.36); rb.scale.z = 0.5; g.add(rb); }
    g.add(vir);
  }
  const perfil = [[0, 0], [topo * 0.92, 0], [topo * 1.05, 0.015], [topo * 0.95, 0.04], [topo * 1.15, 0.075], [topo * 1.1, 0.095], [topo * 0.7, 0.108], [0, 0.11]].map(([r, y]) => new THREE.Vector2(r, y));
  const cg = new THREE.LatheGeometry(perfil, 24); cg.scale(1, 1, plastico ? 0.5 : 0.62);
  const cabo = new THREE.Mesh(cg, new THREE.MeshPhysicalMaterial({ color: corCabo, roughness: 0.45, clearcoat: 0.3 }));
  cabo.position.y = comprimento + (plastico ? 0 : 0.01);
  g.add(lamina, cabo);
  return sombras(g);
}
// pano amassado, com a base na origem
export function pano(cor = '#f3f0e6', tamanho = 0.05) {
  const geo = new THREE.IcosahedronGeometry(tamanho, 3), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + 0.16 * Math.sin(x * 190 + y * 70) * Math.cos(z * 160 + x * 40) + 0.08 * Math.sin(y * 300 + z * 90);
    p.setXYZ(i, x * k, Math.max(-tamanho * 0.4, y * 0.42 * k) + tamanho * 0.4, z * 0.8 * k);
  }
  geo.computeVertexNormals();
  return sombras(new THREE.Mesh(geo, mat(cor, 0.95)));
}
// ---------------------------------------------------------------- ferramenta que segue um caminho
// Trilhas usadas: `nome.s` (0 a 1 no caminho), `nome.recuo` (metros afastada, ao longo do próprio eixo)
// e `nome.livre` (1 = parada na posição de repouso, 0 = trabalhando no caminho).
//   repouso: onde a ferramenta espera antes de começar: { pos, eixo, lado }, ou { recua: metros }
//            (recuada ao longo do próprio eixo, a partir do começo do caminho: chega em linha reta, sem girar),
//            ou { desloca: [x, y, z] } (do começo do caminho, andando esse vetor, também sem girar)
//   saida:   para onde ela vai ao terminar (o mesmo formato; se faltar, volta para o repouso)
const _q = {}, _a = new THREE.Vector3(), _h = new THREE.Vector3(), _x = new THREE.Vector3(), _m = new THREE.Matrix4(), _qa = new THREE.Quaternion(), _qb = new THREE.Quaternion(), _p = new THREE.Vector3();
function quaternioDaBase(eixo, lado, sai) {
  _a.copy(eixo).normalize();
  _h.copy(lado).addScaledVector(_a, -lado.dot(_a)).normalize();
  _x.crossVectors(_a, _h);
  return sai.setFromRotationMatrix(_m.makeBasis(_x, _a, _h));
}
// liga a ferramenta ao roteiro; `pose(s, pos, quat)` diz onde ela fica no ponto s do caminho
function ligarFerramenta(r, nome, obj, pose, repouso, saida) {
  r.inicio(nome + '.s', 0); r.inicio(nome + '.recuo', 0); r.inicio(nome + '.livre', 1); r.inicio(nome + '.vis', 1);
  const descanso = (d, s) => {
    const pos = new THREE.Vector3(), quat = new THREE.Quaternion();
    if (d.recua != null || d.desloca) {
      pose(s, pos, quat);
      if (d.recua) pos.addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(quat), d.recua);
      if (d.desloca) pos.add(new THREE.Vector3(...d.desloca));
    } else {
      pos.set(...d.pos);
      quaternioDaBase(new THREE.Vector3(...d.eixo), new THREE.Vector3(...d.lado), quat);
    }
    return { pos, quat };
  };
  const ini = descanso(repouso, 0), fim = descanso(saida || repouso, saida ? 1 : 0);
  const p = new THREE.Vector3(), q = new THREE.Quaternion(), eixo = new THREE.Vector3();
  r.liga((v) => {
    pose(v(nome + '.s'), p, q);
    p.addScaledVector(eixo.set(0, 1, 0).applyQuaternion(q), v(nome + '.recuo'));
    const livre = v(nome + '.livre'), d = v(nome + '.s') > 0.5 ? fim : ini;
    obj.position.lerpVectors(p, d.pos, livre);
    obj.quaternion.copy(q).slerp(d.quat, livre);
    obj.visible = v(nome + '.vis') > 0.5;
  });
}

//   inclina: ângulo entre o eixo da ferramenta e a normal da superfície, tombando para trás (radianos);
//            negativo, ela tomba para a frente (empurra); pode ser uma função de s
//   tomba:   ângulo para o lado do perfil (útil em cantos); pode ser uma função de s
//   gira:    gira a ferramenta em volta do próprio eixo (radianos): põe o cabo da pistola para baixo, por exemplo
//   afasta:  metros que a ponta sai do canto, pela bissetriz entre a normal e o lado do perfil
//   fixo:    { eixo, lado } mantém a ferramenta sempre virada para o mesmo lado, em vez de acompanhar a curva
//            (ou uma função s => { eixo, lado }, para a ferramenta mudar de jeito ao longo do caminho)
//   cabo:    'baixo' deixa o cabo sempre do lado de baixo do corpo (pistola)
export function seguirCaminho(r, nome, obj, caminho, { inclina = 0.75, tomba = 0, gira = 0, afasta = 0, cabo = null, repouso, saida = null, inverte = false, fixo = null }) {
  const eixo = new THREE.Vector3(), lado = new THREE.Vector3(), q = {};
  const pose = (s, pos, quat) => {
    const sinal = inverte ? -1 : 1;
    caminho.em(s, q);
    if (fixo) { const f = typeof fixo === 'function' ? fixo(s) : fixo; eixo.set(...f.eixo); lado.set(...f.lado); } else {
      const i = typeof inclina === 'function' ? inclina(s) : inclina;
      eixo.copy(q.n).multiplyScalar(Math.cos(i)).addScaledVector(q.t, -sinal * Math.sin(i));
      const tb = typeof tomba === 'function' ? tomba(s) : tomba;
      if (tb) eixo.multiplyScalar(Math.cos(tb)).addScaledVector(q.b, Math.sin(tb));
      lado.copy(q.t).multiplyScalar(-sinal * Math.cos(i)).addScaledVector(q.n, -Math.sin(i));
    }
    if (cabo === 'baixo') {
      // o cabo fica embaixo do corpo, como quem segura a pistola em pé, do lado de fora
      eixo.normalize();
      const l = new THREE.Vector3(0, -1, 0).addScaledVector(eixo, eixo.y);
      if (l.lengthSq() > 1e-4) lado.copy(l);
    }
    if (gira) lado.applyAxisAngle(eixo.normalize(), gira);
    quaternioDaBase(eixo, lado, quat);
    pos.copy(q.p);
    if (afasta) pos.addScaledVector(q.n, afasta * Math.SQRT1_2).addScaledVector(q.b, afasta * Math.SQRT1_2);
  };
  ligarFerramenta(r, nome, obj, pose, repouso, saida);
}

// Espátula num canto (filete entre duas superfícies): o fio da lâmina fica atravessado no canto,
// a 45°, encostando nas duas superfícies, e a ferramenta se deita para trás no sentido em que anda.
// Assim a lâmina não entra no piso nem na parede (e é desse jeito que se alisa um filete).
//   largura: largura da lâmina (o fio encosta a largura/√2 de cada lado do canto)
//   inclina: quanto a ferramenta se deita para trás (radianos; ou uma função de s)
export function seguirCanto(r, nome, obj, caminho, { largura = 0.02, inclina = 0.7, repouso, saida = null }) {
  const bis = new THREE.Vector3(), fio = new THREE.Vector3(), eixo = new THREE.Vector3(), lado = new THREE.Vector3(), q = {};
  const pose = (s, pos, quat) => {
    caminho.em(s, q);
    bis.copy(q.n).add(q.b).normalize();                    // para fora do canto
    fio.copy(q.b).sub(q.n).normalize();                    // o fio, de uma superfície à outra
    const i = typeof inclina === 'function' ? inclina(s) : inclina;
    eixo.copy(bis).multiplyScalar(Math.cos(i)).addScaledVector(q.t, -Math.sin(i)).normalize();
    lado.crossVectors(fio, eixo).normalize();
    quaternioDaBase(eixo, lado, quat);
    pos.copy(q.p).addScaledVector(bis, largura / 2 + 0.0008);
  };
  ligarFerramenta(r, nome, obj, pose, repouso, saida);
}

// Rotação (Euler XYZ) de uma ferramenta com o eixo (ponta -> cabo) e o lado do cabo dados.
// Serve para as trilhas `nome.rot` do roteiro.
export function girar(eixo, lado) {
  const q = quaternioDaBase(new THREE.Vector3(...eixo), new THREE.Vector3(...lado), new THREE.Quaternion());
  const e = new THREE.Euler().setFromQuaternion(q, 'XYZ');
  return [e.x, e.y, e.z];
}

// Vira um objeto para que o eixo da ferramenta (ponta -> cabo) e o lado do cabo fiquem como pedido.
export function orientar(obj, eixo, lado) { quaternioDaBase(eixo, lado, obj.quaternion); }

// ---------------------------------------------------------------- fita crepe
// Papel crepe: bege, fosco, com o franzido fino do papel (riscos atravessados na fita).
let texturaCrepe = null;
function crepe() {
  if (texturaCrepe) return texturaCrepe;
  const W = 64, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'), img = x.createImageData(W, H);
  let s = 31; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const linha = Array.from({ length: H }, () => rnd());
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const k = 0.93 + 0.05 * linha[j] + 0.03 * Math.sin(j * 1.7 + i * 0.05) + 0.02 * (rnd() - 0.5);
    const p = (j * W + i) * 4;
    img.data[p] = 233 * k; img.data[p + 1] = 217 * k; img.data[p + 2] = 168 * k; img.data[p + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  texturaCrepe = new THREE.CanvasTexture(c);
  texturaCrepe.colorSpace = THREE.SRGBColorSpace;
  texturaCrepe.wrapS = texturaCrepe.wrapT = THREE.RepeatWrapping;
  return texturaCrepe;
}
// material da fita esticada na parede (u ao longo da fita: o crepe repete a cada 5 cm)
export const materialFita = () => new THREE.MeshStandardMaterial({ map: crepe(), roughness: 0.88, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });

// Rolo de fita crepe: o ponto em que a fita encosta na superfície fica na origem, o rolo fica
// em +Y e o eixo dele é X (a largura da fita). Para orientar: orientar(rolo, normal, sentido).
//   userData.girar(a): gira o rolo (radianos), conforme ele anda
export function rolinhoFita(largura = 0.025, raio = 0.033) {
  const g = new THREE.Group();
  const nucleo = 0.021;
  // a fita enrolada: anel com a borda do papel (perfil retangular girado em volta do eixo)
  const anel = new THREE.LatheGeometry([new THREE.Vector2(nucleo + 0.002, -largura / 2), new THREE.Vector2(raio, -largura / 2), new THREE.Vector2(raio, largura / 2), new THREE.Vector2(nucleo + 0.002, largura / 2)], 40);
  const papel = new THREE.MeshStandardMaterial({ map: crepe(), color: '#f2e6bf', roughness: 0.9, side: THREE.DoubleSide });
  const rolo = new THREE.Group();
  const fita = new THREE.Mesh(anel, papel);
  // tubete de papelão
  const tubo = new THREE.Mesh(new THREE.CylinderGeometry(nucleo + 0.002, nucleo + 0.002, largura * 1.02, 32, 1, true), new THREE.MeshStandardMaterial({ color: '#a77d4f', roughness: 0.95, side: THREE.DoubleSide }));
  rolo.add(fita, tubo);
  rolo.rotation.z = Math.PI / 2;                     // eixo do torno (Y) vira o eixo X
  const giro = new THREE.Group();
  giro.position.y = raio;
  giro.add(rolo);
  // o pedaço que sai do rolo e encosta na superfície
  const ponta = new THREE.Mesh(new THREE.PlaneGeometry(largura, raio * 0.9), papel);
  ponta.rotation.x = -Math.PI / 2; ponta.position.set(0, 0.0004, -raio * 0.45);
  g.add(giro, ponta);
  g.userData.girar = (a) => { giro.rotation.x = a; };
  return sombras(g);
}

// Pontinha da fita que está sendo puxada: um pedaço curvado, levantado da superfície.
// Mesma convenção do rolo: encosta na origem, sobe em +Y, largura em X.
export function pontaPuxada(largura = 0.025, raio = 0.009) {
  const geo = new THREE.CylinderGeometry(raio, raio, largura, 16, 1, true, 0, Math.PI * 1.25);
  geo.rotateZ(Math.PI / 2);
  geo.translate(0, raio, 0);
  const o = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: crepe(), color: '#f2e6bf', roughness: 0.9, side: THREE.DoubleSide }));
  return sombras(o);
}
