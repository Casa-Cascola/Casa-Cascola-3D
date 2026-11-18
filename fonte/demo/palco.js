// Palco das demonstrações: monta a cena de uma demonstração dentro do cômodo, toca a linha
// do tempo e cuida do painel (etapas, legenda, cura e barra de tempo).
// O HTML do painel fica no index.html, em [data-demo-painel].
// Quem leva a câmera para dentro do cômodo é o fonte/interior.js; aqui a demonstração só começa
// quando a câmera já está lá dentro.
import * as THREE from 'three';
import { $, $$, estado, produtoPorId } from '../util.js';
import { preencher } from '../html.js';
import { entrar, objetoDoComodo, vistaDe, luzDeTrabalho } from '../interior.js';
import { Roteiro, mistura } from './motor.js';
import { MATERIA, criarMateria } from './materia.js';
import { carregarRotulos } from './pecas.js';
import { DEMOS } from './demos.js';
import { COMODOS3D } from './comodos.js';

const palco = $('[data-palco]');
const painel = $('[data-demo-painel]');
const elLegenda = $('[data-demo-legenda]');
const elTempo = $('[data-demo-tempo]');
const elTocar = $('[data-acao="demo-tocar"]');
const elDiferenciais = painel?.querySelector('[data-lista="diferenciais"]');

let cena = null;            // comandos da cena (fonte/cena.js)
let tres = null;            // { scene, camera, controles, renderer }
let atual = null;           // a demonstração aberta
let ultimoQuadro = 0;
const guardado = {};        // ajustes da câmera, para devolver ao fechar

// As demonstrações de um produto (no cômodo `comodo`, ou em todos se for null), na ordem da lista.
export const demosDe = (produto, comodo) => Object.values(DEMOS).filter((d) => d.produto === produto && (!comodo || d.comodo === comodo));
export const demoAberta = () => !!atual;

export function iniciarDemos(comandosDaCena) {
  cena = comandosDaCena;
  tres = cena.tres;
  cena.aoQuadro(quadro);
  elTempo?.addEventListener('input', () => { if (atual?.pronto) { atual.tocando = false; ir(+elTempo.value / 1000 * atual.r.dur, true); } });
}

// ---------------------------------------------------------------- abrir e fechar
// Abre a demonstração `id`. Se a câmera ainda não está no cômodo, entra nele antes.
export async function abrirDemo(id, { t = 0, pausado = false, direto = false } = {}) {
  const def = DEMOS[id];
  if (!def || !cena) return;
  if (atual) fecharDemo(true);
  const eu = (atual = { def, t, tocando: false, pronto: false, desfazer: [], marcas: {} });
  if (estado.dentro !== def.comodo) {
    const ok = await entrar(def.comodo, { direto });
    if (!ok || atual !== eu) { if (atual === eu) atual = null; return; }
  }
  const produto = produtoPorId[def.produto] || { nome: def.produto };
  const materia = MATERIA[def.produto];

  estado.modo = 'demo';
  palco.dataset.modo = 'demo';
  if (painel) {
    preencher(painel, {
      produto: produto.nome, titulo: def.titulo, comoCura: materia?.comoCura,
      cura: (materia?.cura || []).map(([tempo, texto]) => ({ tempo, texto })),
      fonteNome: materia?.fonte.nome, fonteUrl: materia?.fonte.url,
    });
    painel.hidden = false;
    painel.dataset.carregando = 'true';
  }
  if (elLegenda) elLegenda.textContent = 'Preparando a demonstração…';
  prepararCamera(def);
  cena.aoMudarModo();
  cena.voar({ ...def.tomadas.geral, exato: true }, 1.4);

  try {
    const [comodo] = await Promise.all([objetoDoComodo(def.comodo), carregarRotulos()]);
    if (atual !== eu) return;           // fecharam ou trocaram enquanto carregava
    montar(eu, comodo.grupo);
    montarDiferenciais(eu, produto.diferenciais || []);
    try { await tres.renderer.compileAsync(eu.raiz, tres.camera, tres.scene); } catch (e) { /* compila no primeiro desenho */ }
    if (atual !== eu) return;
  } catch (e) {
    console.error(e);
    if (atual === eu && elLegenda) elLegenda.textContent = 'Não foi possível abrir esta demonstração. Confira se a pasta modelos foi enviada junto com o site.';
    return;
  }
  if (painel) painel.dataset.carregando = 'false';
  eu.pronto = true;
  eu.tocando = !pausado;
  ultimoQuadro = 0;
  ir(t, true);
}

// Os diferenciais do produto no painel, na ordem em que a demonstração fala deles.
// Cada um guarda os instantes em que foi citado (r.destaca): acende no primeiro e pisca em cada um.
function montarDiferenciais(eu, lista) {
  eu.chips = null;
  if (!elDiferenciais) return;
  const marcas = eu.r.destaques;
  // ordem: primeira marca que cita o diferencial e, na mesma marca, a ordem dos padrões (a da legenda)
  const citado = lista.map((texto) => {
    const minhas = marcas.filter((m) => !m.padroes.length || m.padroes.some((p) => p.test(texto)));
    const primeira = minhas[0], k = primeira ? Math.max(0, primeira.padroes.findIndex((p) => p.test(texto))) : 0;
    return { texto, tempos: minhas.map((m) => m.t), chave: primeira ? primeira.t * 100 + k : Infinity };
  });
  const ordem = citado.filter((c) => c.tempos.length).sort((a, b) => a.chave - b.chave);
  preencher(elDiferenciais, { diferenciais: ordem.map((c) => c.texto) });
  eu.chips = [...elDiferenciais.children].map((el, i) => ({ el, tempos: ordem[i].tempos }));
}

function montar(eu, grupo) {
  const { scene } = tres, def = eu.def;
  const raiz = new THREE.Group();
  raiz.name = 'Demo';
  scene.add(raiz);
  eu.raiz = raiz; eu.grupo = grupo;

  // luz de trabalho: ilumina o ponto e faz a sombra de contato das ferramentas.
  // Fica do outro lado do ponto, em relação à câmera: o reflexo cai fora da peça, e não na cara de quem olha.
  const g = def.tomadas.geral, alvo = new THREE.Vector3(...g.alvo), cam = new THREE.Vector3(...g.camera);
  const lado = cam.clone().sub(alvo).setY(0).normalize();
  const foco = luzDeTrabalho();
  foco.position.copy(def.luz?.pos ? new THREE.Vector3(...def.luz.pos) : alvo.clone().addScaledVector(lado, -0.45).add(new THREE.Vector3(0.2, 1.35, 0)));
  foco.target.position.copy(def.luz?.alvo ? new THREE.Vector3(...def.luz.alvo) : alvo);
  foco.target.updateMatrixWorld();
  foco.intensity = def.luz?.forca ?? 6;
  // a sombra da luz de trabalho só é redesenhada quando a cena muda (ir), e não quando a pessoa
  // gira a câmera com a animação parada
  foco.shadow.autoUpdate = false;
  foco.shadow.needsUpdate = true;
  eu.desfazer.push(() => { foco.intensity = 0; foco.shadow.autoUpdate = false; });

  const achar = (nome) => grupo.getObjectByName(nome) || scene.getObjectByName(nome);
  const guardar = (o) => {
    if (o.userData.__demo) return;
    o.userData.__demo = true;
    const antes = { pai: o.parent, pos: o.position.clone(), quat: o.quaternion.clone(), esc: o.scale.clone(), vis: o.visible, mat: o.material };
    eu.desfazer.push(() => {
      delete o.userData.__demo;
      if (o.parent !== antes.pai && antes.pai) antes.pai.add(o);
      o.position.copy(antes.pos); o.quaternion.copy(antes.quat); o.scale.copy(antes.esc); o.visible = antes.vis;
      if (antes.mat) o.material = antes.mat;
    });
  };
  const ctx = {
    THREE, raiz, grupo, def, r: new Roteiro(),
    // objeto do cômodo, pelo nome; tudo o que a demonstração mexer volta ao lugar ao fechar
    pega(nome) {
      const o = achar(nome);
      if (!o) { console.warn('Demonstração', def.id, ': não achei o objeto', nome); return new THREE.Object3D(); }
      guardar(o);
      return o;
    },
    esconde(...nomes) { for (const n of nomes) ctx.pega(n).visible = false; },
    // caixa (em coordenadas do mundo) que envolve um objeto
    caixa(nome) { const o = achar(nome); return o ? new THREE.Box3().setFromObject(o) : new THREE.Box3(new THREE.Vector3(), new THREE.Vector3()); },
    materia: (idProduto, extra) => criarMateria(idProduto, extra),
  };
  scene.updateMatrixWorld(true);
  def.montar(ctx);
  eu.r = ctx.r.fecha();
}

export function fecharDemo(trocando = false) {
  if (!atual) return;
  const eu = atual;
  atual = null;
  for (const fn of eu.desfazer.reverse()) fn();
  if (eu.raiz) {
    eu.raiz.traverse((o) => {
      if (!o.isMesh) return;
      o.geometry?.dispose();
      for (const m of [].concat(o.material)) m?.dispose?.();
    });
    eu.raiz.removeFromParent();
  }
  devolverCamera();
  if (painel) painel.hidden = true;
  if (trocando) return;
  estado.modo = 'explorar';
  palco.dataset.modo = 'explorar';
  cena.aoMudarModo();
  cena.redesenhar();
  // de volta à vista do cômodo
  if (COMODOS3D[eu.def.comodo] && estado.dentro === eu.def.comodo) cena.voar(vistaDe(eu.def.comodo), 1.4);
}

// ---------------------------------------------------------------- câmera
// Durante a demonstração dá para chegar bem perto da junta.
function prepararCamera(def) {
  const { controles } = tres;
  if (guardado.camera) return;
  guardado.camera = { minD: controles.minDistance, maxD: controles.maxDistance };
  const g = def.tomadas.geral, d = new THREE.Vector3(...g.camera).distanceTo(new THREE.Vector3(...g.alvo));
  controles.minDistance = 0.15;
  controles.maxDistance = Math.max(controles.maxDistance, d * 1.4);
}
function devolverCamera() {
  const { controles } = tres, c = guardado.camera;
  if (!c) return;
  controles.minDistance = c.minD; controles.maxDistance = c.maxD;
  guardado.camera = null;
}

// ---------------------------------------------------------------- tocar
function quadro(agora) {
  if (!atual?.pronto) return;
  const dt = ultimoQuadro ? Math.min(0.1, (agora - ultimoQuadro) / 1000) : 0;
  ultimoQuadro = agora;
  if (!atual.tocando) return;
  const t = Math.min(atual.r.dur, atual.t + dt);
  if (t >= atual.r.dur) atual.tocando = false;
  ir(t, false);
}

// Mostra a demonstração no instante t. `pulo`: a câmera vai direto para a tomada daquele instante.
export function ir(t, pulo = false) {
  if (!atual?.r) return;
  const eu = atual, r = eu.r, m = eu.marcas;
  eu.t = Math.min(r.dur, Math.max(0, t));
  r.aplica(eu.t);
  luzDeTrabalho().shadow.needsUpdate = true;
  cena.redesenhar();

  const etapa = r.ultima(r.etapas, eu.t), legenda = r.ultima(r.legendas, eu.t), tomada = r.ultima(r.tomadas, eu.t), cura = r.ultima(r.curas, eu.t);
  if (etapa !== m.etapa) {
    m.etapa = etapa;
    $$('[data-etapa]', painel || document).forEach((b) => b.setAttribute('aria-current', String(b.dataset.etapa === etapa?.id)));
  }
  if (legenda !== m.legenda) { m.legenda = legenda; if (elLegenda) elLegenda.textContent = legenda ? legenda.texto : ''; }
  if (cura !== m.cura) {
    m.cura = cura;
    $$('[data-lista="cura"] > *', painel || document).forEach((li, i) => li.classList.toggle('is-ativo', !!cura && i <= cura.i));
    painel?.classList.toggle('is-curando', !!cura);
  }
  if (tomada && (tomada !== m.tomada || pulo)) {
    m.tomada = tomada;
    const destino = { ...eu.def.tomadas[tomada.nome], exato: true };
    const mexeu = performance.now() - cena.ultimoToque() < 6000;   // quem está girando a câmera não é interrompido
    if (pulo) {
      // chegou aqui de um salto: a câmera vai direto para onde estaria neste instante
      const i = r.tomadas.indexOf(tomada), f = tomada.reto && i > 0 ? Math.min(1, (eu.t - tomada.t) / tomada.dur) : 1;
      const de = i > 0 ? eu.def.tomadas[r.tomadas[i - 1].nome] : destino;
      cena.enquadrar({ camera: mistura(de.camera, destino.camera, f), alvo: mistura(de.alvo, destino.alvo, f), exato: true });
      if (f < 1 && eu.tocando) cena.voar(destino, tomada.dur * (1 - f), true);
    } else if (!mexeu) cena.voar(destino, tomada.dur, tomada.reto);
  }
  let primeiroNovo = null;
  for (const c of eu.chips || []) {
    c.el.classList.toggle('is-aceso', c.tempos[0] <= eu.t + 1e-6);
    const novo = c.tempos.some((tm) => eu.t >= tm - 1e-6 && eu.t - tm < 2.4);
    if (novo && !c.novo && !primeiroNovo) primeiroNovo = c.el;
    c.novo = novo;
    c.el.classList.toggle('is-novo', novo);
  }
  // no celular a linha rola de lado: o primeiro diferencial que acabou de ser dito vem para a vista
  if (primeiroNovo && elDiferenciais.scrollWidth > elDiferenciais.clientWidth + 1) {
    elDiferenciais.scrollTo({ left: primeiroNovo.offsetLeft - elDiferenciais.offsetLeft - 8, behavior: pulo ? 'auto' : 'smooth' });
  }
  if (elTempo && document.activeElement !== elTempo) elTempo.value = String(Math.round((eu.t / r.dur) * 1000));
  const fim = eu.t >= r.dur - 0.01;
  if (elTocar) { elTocar.dataset.estado = fim ? 'fim' : eu.tocando ? 'tocando' : 'pausado'; elTocar.setAttribute('aria-label', fim ? 'Repetir' : eu.tocando ? 'Pausar' : 'Continuar'); }
}

// botão tocar/pausar (no fim, recomeça)
export function tocarOuPausar() {
  if (!atual?.pronto) return;
  if (atual.t >= atual.r.dur - 0.01) { atual.tocando = true; ultimoQuadro = 0; return ir(0, true); }
  atual.tocando = !atual.tocando;
  ultimoQuadro = 0;
  ir(atual.t);
}
// botões Por que usar / Aplicação / Resultado
export function irParaEtapa(id) {
  const e = atual?.r?.etapas.find((x) => x.id === id);
  if (!e) return;
  atual.tocando = true;
  ultimoQuadro = 0;
  ir(e.t + 0.001, true);
}

// para testes e para abrir direto num instante: window.__demo.ir(12.5)
if (typeof window !== 'undefined') window.__demo = { ir: (t) => { if (atual) { atual.tocando = false; ir(t, true); } }, dur: () => atual?.r?.dur, pronto: () => !!atual?.pronto, abrir: abrirDemo, lista: () => Object.keys(DEMOS), t: () => atual?.t, def: () => atual?.def };
