// Entrar e sair de um cômodo (por enquanto, só o banheiro).
// O cômodo é um .glb separado (modelos/comodos/), no mesmo sistema de coordenadas da casa.
// Ao entrar: a câmera chega até a janela, a tela escurece por um instante e a câmera
// aparece dentro do cômodo. Lá dentro ela não atravessa as paredes nem os móveis (barreira).
// As gotas dos pontos de aplicação (vaso, box) ficam presas nos objetos e abrem a demonstração.
import * as THREE from 'three';
import { $, estado, reduzMovimento } from './util.js';
import { clonar, preencher } from './html.js';
import { carregarGlb } from './modelo.js';
import { COMODOS3D } from './demo/comodos.js';

const palco = $('[data-palco]');
const cortina = $('[data-cortina]');
const camadaPontos = $('[data-pontos]');

let cena = null, tres = null;
const carregados = new Map();   // arquivo -> promessa { grupo, obstaculos }
const guardado = {};            // o que foi mudado ao entrar, para devolver ao sair
let fila = Promise.resolve();   // entradas e saídas acontecem uma de cada vez
let pontos = [];                // gotas dos pontos de aplicação: { el, p, comodo }

export const temInterior = (id) => !!COMODOS3D[id];
// a vista do cômodo para a tela atual (em pé ou deitada)
export const vistaDe = (id) => {
  const def = COMODOS3D[id], c = tres?.renderer.domElement;
  return c && c.clientWidth < c.clientHeight && def.vistaRetrato ? def.vistaRetrato : def.vista;
};
export const objetoDoComodo = (id) => carregados.get(COMODOS3D[id]?.arquivo);

// As luzes de dentro ficam sempre na cena, apagadas do lado de fora. Se fossem criadas ao entrar,
// o navegador teria de recompilar o material de tudo (a casa inteira) naquela hora: o tablet travaria.
const luzes = {};
export const luzDeTrabalho = () => luzes.trabalho;

export function iniciarInterior(comandosDaCena) {
  cena = comandosDaCena;
  tres = cena.tres;
  const grupo = new THREE.Group();
  grupo.name = 'LuzesDeDentro';
  // luminária do forro: ilumina de cima para baixo e faz a sombra macia dos móveis no piso
  luzes.teto = new THREE.SpotLight('#fff1df', 0, 0, 1.25, 1, 1.2);
  // luz de trabalho das demonstrações (o palco põe no lugar): sombra de contato das ferramentas
  luzes.trabalho = new THREE.SpotLight('#fff4e6', 0, 0, 0.8, 0.75, 1.6);
  for (const l of [luzes.teto, luzes.trabalho]) {
    l.castShadow = true;
    l.shadow.mapSize.set(1024, 1024);
    l.shadow.camera.near = 0.1; l.shadow.camera.far = 6;
    l.shadow.autoUpdate = false;
    grupo.add(l, l.target);
  }
  luzes.teto.shadow.bias = -0.0006; luzes.teto.shadow.normalBias = 0.02; luzes.teto.shadow.radius = 4;
  luzes.trabalho.shadow.bias = -0.0008; luzes.trabalho.shadow.normalBias = 0.004;
  luzes.hemi = new THREE.HemisphereLight('#fffaf3', '#9c917f', 0);
  grupo.add(luzes.hemi);
  tres.scene.add(grupo);
  montarPontos();
  cena.aoDesenhar(posicionarPontos);
}

// ---------------------------------------------------------------- carregar
export function carregarComodo(id) {
  const def = COMODOS3D[id];
  if (!carregados.has(def.arquivo)) {
    carregados.set(def.arquivo, carregarGlb(`modelos/comodos/${def.arquivo}.glb`, tres.renderer).then(async (grupo) => {
      grupo.name = 'Comodo_' + def.arquivo;
      grupo.visible = false;
      ajustarVidros(grupo);
      aliviar(grupo);
      tres.scene.add(grupo);
      // placa escura atrás da porta fechada
      if (def.fundoPorta) {
        const f = def.fundoPorta;
        const placa = new THREE.Mesh(new THREE.PlaneGeometry(f.x1 - f.x0, f.y1 - f.y0), new THREE.MeshBasicMaterial({ color: '#1d1a17' }));
        placa.position.set((f.x0 + f.x1) / 2, (f.y0 + f.y1) / 2, f.z);
        placa.rotation.y = f.z > (def.caixa[2] + def.caixa[5]) / 2 ? Math.PI : 0;   // de frente para dentro do cômodo
        placa.name = 'FundoDaPorta';
        grupo.add(placa);
      }
      grupo.updateMatrixWorld(true);
      // prepara os materiais do cômodo enquanto a câmera ainda voa até a janela (sem travar na entrada)
      try { await tres.renderer.compileAsync(grupo, tres.camera, tres.scene); } catch (e) { /* compila no primeiro desenho */ }
      return { grupo, obstaculos: obstaculosDe(grupo) };
    }).catch((e) => { carregados.delete(def.arquivo); throw e; }));
  }
  return carregados.get(def.arquivo);
}

// Os vidros do .blend são feitos para o Cycles (Glass BSDF misturado com Transparent BSDF) e o
// exportador de glTF não os entende: chegam como um material branco e opaco. Aqui viram vidro de verdade.
function ajustarVidros(grupo) {
  const vidros = {};
  grupo.traverse((o) => {
    if (!o.isMesh || !/Vidro/i.test([].concat(o.material)[0]?.name || '') && !/Vidro/.test(o.name)) return;
    const janela = /^Jan_/.test(o.name);
    const chave = janela ? 'janela' : 'box';
    vidros[chave] ||= new THREE.MeshPhysicalMaterial({
      name: janela ? 'Vidro_Janela' : 'Vidro_Box',
      color: janela ? '#cfe0ea' : '#d9ebe6',        // temperado incolor: um leve verde na espessura
      // o vidro é uma placa fechada: com a face da frente só, a GPU pinta uma camada em vez de duas
      // (opacidade de duas camadas de 0,13 = 0,24)
      transparent: true, opacity: janela ? 0.26 : 0.24, roughness: 0.04, metalness: 0,
      envMapIntensity: 1.3, depthWrite: false, side: THREE.FrontSide,
    });
    o.material = vidros[chave];
    o.castShadow = false;
    o.renderOrder = 2;
  });
}

// Deixa o cômodo mais leve sem mudar o que se vê:
// - as peças chapadas contra a parede ou o piso, e as miúdas, não fazem sombra (a sombra delas
//   não aparece, mas custava um desenho a mais por luz). Os cordões prontos do .blend também não:
//   a sombra do teto fica parada, e a de um cordão escondido pela demonstração ficaria lá;
// - madeira, granito e as folhas perdem o verniz (clearcoat): é uma segunda camada de reflexo,
//   calculada em cada pixel, que nelas quase não aparece. Louça, mármore e revestimentos ficam com ele.
const SEM_SOMBRA = /Guarnicao|Batente|Pino|Tomada|Seletor|Espelho|Ralo|Soleira|Tapete|FitaBorda|Placa|Flange|Dobradica|Roseta|Terra|Vaso002|_Agua|Cordao/;
const SEM_VERNIZ = /Freijo|PortaMadeira|Granito|FolhaEspada/;
function aliviar(grupo) {
  grupo.traverse((o) => {
    if (!o.isMesh) return;
    if (SEM_SOMBRA.test(o.name)) o.castShadow = false;
    for (const m of [].concat(o.material)) {
      if (m?.clearcoat > 0 && SEM_VERNIZ.test(m.name)) { m.clearcoat = 0; m.needsUpdate = true; }
    }
  });
}

// Os móveis e peças que a câmera não pode atravessar. Paredes, piso e forro ficam de fora:
// quem cuida deles é a caixa do cômodo. Também ficam de fora as peças miúdas e as folhas.
const FORA = /Parede|Piso|Teto|_Box(Dir|Esq|Fundo)|^Jan_|Espada|Samambaia|Terra|Pino|Tomada|Tapete|Frasco|Espelho|Saboneteira|Registro|Seletor|Cordao|FundoDaPorta|Alvo_|Cam_/;
function obstaculosDe(grupo) {
  const lista = [], caixa = new THREE.Box3(), tam = new THREE.Vector3();
  grupo.traverse((o) => {
    if (!o.isMesh || FORA.test(o.name) || FORA.test(o.parent?.name || '')) return;
    caixa.setFromObject(o).getSize(tam);
    if (Math.max(tam.x, tam.y, tam.z) < 0.06) return;
    lista.push(o);
  });
  return lista;
}

// ---------------------------------------------------------------- entrar e sair
const esperar = (s) => new Promise((ok) => setTimeout(ok, reduzMovimento ? 0 : s * 1000));
function escurecer(sim) {
  if (!cortina) return Promise.resolve();
  cortina.classList.toggle('is-fechada', sim);
  return esperar(0.34);
}

// Entra no cômodo `id`. Com `direto`, não passa pela janela (abrir uma demonstração pelo endereço).
// Cada pedido (entrar ou sair) ganha um número: se a pessoa pedir outra coisa no meio do caminho
// (tocar em Voltar enquanto a câmera ainda vai para a janela), a entrada para onde estiver.
let pedido = 0;
export function entrar(id, { direto = false } = {}) {
  const meu = ++pedido;
  fila = fila.then(async () => {
    const def = COMODOS3D[id];
    const valendo = () => meu === pedido;
    if (!def || !cena || !valendo()) return false;
    if (estado.dentro === id) { if (estado.modo !== 'demo') cena.voar(vistaDe(id), 1.2); return true; }
    if (estado.dentro) await trocarParaFora(null);
    const carga = carregarComodo(id);
    if (!direto) await cena.voar(def.fora, 1.5);
    let comodo;
    try {
      comodo = await carga;
    } catch (e) {
      console.error(e);
      avisar('Não foi possível abrir o cômodo por dentro. Confira se a pasta modelos/comodos foi enviada junto com o site.');
      return false;
    }
    if (!valendo()) return false;
    if (!direto) cena.voar(def.encosta, 0.55);
    await escurecer(true);
    if (!valendo()) { escurecer(false); return false; }
    ligarDentro(id, def, comodo);
    cena.enquadrar(def.chegada);
    await cena.depoisDoDesenho();          // a cortina só abre com o cômodo já desenhado (no tablet lento, sem piscar a casa)
    escurecer(false);
    await cena.voar(vistaDe(id), direto ? 0.01 : 1.5);
    return true;
  });
  return fila;
}

// Sai do cômodo e leva a câmera até `destino` (um enquadramento de dados.js).
// Se a câmera ainda não entrou (estava indo para a janela), ela vai direto para o destino.
export function sair(destino) {
  ++pedido;
  if (!estado.dentro) {
    if (destino) cena.voar(destino);
    return fila;
  }
  fila = fila.then(async () => {
    if (estado.dentro) await trocarParaFora(destino);
    else if (destino) await cena.voar(destino);
  });
  return fila;
}

async function trocarParaFora(destino) {
  const def = COMODOS3D[estado.dentro];
  await escurecer(true);
  desligarDentro();
  cena.enquadrar(def.encosta);
  await cena.depoisDoDesenho();
  escurecer(false);
  await cena.voar(destino || def.fora, destino ? 1.8 : 0.8);
}

// ---------------------------------------------------------------- lá dentro
function ligarDentro(id, def, { grupo, obstaculos }) {
  const { scene, camera, controles, renderer, sol } = tres;
  const casa = scene.getObjectByName('CasaInteira');
  grupo.visible = true;
  // a sombra do sol é desenhada uma última vez com a casa inteira (ela faz sombra no telhado
  // da garagem, que aparece pela janela) e depois fica parada: a casa some, a sombra não
  guardado.sombra = sol.shadow.autoUpdate;
  sol.shadow.autoUpdate = false;
  sol.shadow.needsUpdate = true;
  scene.updateMatrixWorld(true);
  renderer.render(scene, camera);
  // some da casa o que tampa o cômodo e o que não dá para ver pela janela
  guardado.escondidos = [];
  if (casa) {
    const caixa = new THREE.Box3(), lado = def.ladoVisivel;
    casa.traverse((o) => {
      if (!o.visible) return;
      let sai = def.esconder.includes(o.name);
      if (!sai && o.isMesh && lado) { caixa.setFromObject(o); sai = !caixa.isEmpty() && caixa.max[lado.eixo] < lado.de; }
      if (sai) { o.visible = false; guardado.escondidos.push(o); }
    });
  }
  // luz de dentro: reflexo liso (teto claro, piso escuro), luz do teto e um pouco de luz geral
  guardado.ambiente = { mapa: scene.environment, forca: scene.environmentIntensity };
  scene.environment = ambienteInterno(renderer);
  scene.environmentIntensity = 0.8;
  const c = def.caixa, meio = new THREE.Vector3((c[0] + c[3]) / 2, c[4] - 0.12, (c[2] + c[5]) / 2);
  luzes.teto.position.copy(meio);
  luzes.teto.target.position.set(meio.x, c[1], meio.z);
  luzes.teto.intensity = 9;
  // a sombra do teto é desenhada uma vez, no primeiro quadro lá dentro, e fica parada: nada do cômodo
  // se mexe (as ferramentas das demonstrações fazem sombra com a luz de trabalho)
  luzes.teto.shadow.autoUpdate = false;
  luzes.teto.shadow.needsUpdate = true;
  luzes.hemi.intensity = 0.55;
  // câmera: lente mais aberta, chega mais perto, não sai do cômodo nem atravessa os móveis
  guardado.camera = {
    near: camera.near, minD: controles.minDistance, maxD: controles.maxDistance,
    minP: controles.minPolarAngle, maxP: controles.maxPolarAngle, giro: controles.rotateSpeed,
  };
  camera.near = 0.03;
  Object.assign(controles, { minDistance: 0.35, maxDistance: 2.4, minPolarAngle: 0.35, maxPolarAngle: 1.75, rotateSpeed: 0.55 });
  cena.limitar({ caixa: def.caixa, obstaculos });
  // o que esconde as gotas: os móveis, menos o vidro (através dele a gota continua aparecendo)
  guardado.obstaculosVisiveis = obstaculos.filter((o) => ![].concat(o.material).some((m) => m.transparent));
  estado.dentro = id;
  palco.dataset.dentro = id;
  guardado.grupo = grupo;
  cena.redimensionar();
  cena.recomecarResolucao(true);
  cena.aoMudarModo();
}

function desligarDentro() {
  const { scene, camera, controles, sol } = tres;
  for (const o of guardado.escondidos || []) o.visible = true;
  guardado.escondidos = null;
  if (guardado.grupo) guardado.grupo.visible = false;
  for (const l of [luzes.teto, luzes.trabalho, luzes.hemi]) { l.intensity = 0; if (l.shadow) l.shadow.autoUpdate = false; }
  if (guardado.ambiente) { scene.environment = guardado.ambiente.mapa; scene.environmentIntensity = guardado.ambiente.forca; guardado.ambiente = null; }
  sol.shadow.autoUpdate = guardado.sombra ?? true;
  sol.shadow.needsUpdate = true;
  const c = guardado.camera;
  if (c) {
    camera.near = c.near;
    Object.assign(controles, { minDistance: c.minD, maxDistance: c.maxD, minPolarAngle: c.minP, maxPolarAngle: c.maxP, rotateSpeed: c.giro });
  }
  cena.limitar(null);
  guardado.obstaculosVisiveis = null;
  estado.dentro = null;
  delete palco.dataset.dentro;
  cena.redimensionar();
  cena.recomecarResolucao(false);
  cena.aoMudarModo();
}

// Reflexo dos cômodos: um ambiente liso (teto claro, paredes médias, piso escuro), sem as
// luminárias do ambiente de estúdio, que viravam manchas brancas nas pedras polidas.
let mapaInterno = null;
export function ambienteInterno(renderer) {
  if (mapaInterno) return mapaInterno;
  const cenario = new THREE.Scene();
  cenario.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying vec3 vP; void main(){ float h = vP.y; vec3 c = mix(vec3(0.62, 0.6, 0.57), vec3(1.25, 1.22, 1.16), smoothstep(0.0, 0.9, h)); c = mix(c, vec3(0.3, 0.27, 0.24), smoothstep(0.0, -0.7, h)); gl_FragColor = vec4(c, 1.0); }',
  })));
  const pm = new THREE.PMREMGenerator(renderer);
  mapaInterno = pm.fromScene(cenario, 0.03).texture;
  pm.dispose();
  return mapaInterno;
}

// ---------------------------------------------------------------- gotas dos pontos de aplicação
function montarPontos() {
  if (!camadaPontos) return;
  for (const [comodo, def] of Object.entries(COMODOS3D)) {
    for (const p of def.pontos || []) {
      const el = clonar('ponto');
      if (!el) return;
      el.dataset.ponto = p.demo;
      el.setAttribute('aria-label', `${p.nome}: ver aplicação`);
      camadaPontos.appendChild(preencher(el, p));
      pontos.push({ el, comodo, p: new THREE.Vector3(...p.pos) });
    }
  }
}
const tmp = new THREE.Vector3(), olho = new THREE.Vector3(), dir = new THREE.Vector3();
const vista = new THREE.Raycaster();
function posicionarPontos(camera, canvas) {
  if (!pontos.length) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const obst = guardado.obstaculosVisiveis;
  olho.setFromMatrixPosition(camera.matrixWorld);
  for (const pt of pontos) {
    let oculto = estado.dentro !== pt.comodo || estado.modo === 'demo';
    if (!oculto) {
      tmp.copy(pt.p).project(camera);
      oculto = tmp.z > 1 || Math.abs(tmp.x) > 1.05 || Math.abs(tmp.y) > 1.05;
    }
    // atrás de um móvel (ou do vidro do box): a gota some
    if (!oculto && obst) {
      dir.subVectors(pt.p, olho);
      const d = dir.length();
      vista.set(olho, dir.divideScalar(d));
      vista.far = d - 0.06;
      oculto = vista.intersectObjects(obst, false).length > 0;
    }
    pt.el.classList.toggle('is-oculto', oculto);
    if (!oculto) {
      const x = (tmp.x * 0.5 + 0.5) * w;
      pt.el.style.transform = `translate3d(${x.toFixed(1)}px, ${((-tmp.y * 0.5 + 0.5) * h).toFixed(1)}px, 0)`;
      pt.el.classList.toggle('is-esquerda', x > w - 190);   // perto da borda direita, o nome vai para a esquerda da gota
    }
  }
}

function avisar(texto) {
  const el = $('[data-aviso]');
  if (!el) return;
  el.textContent = texto;
  el.hidden = false;
  setTimeout(() => { el.hidden = true; }, 6000);
}
