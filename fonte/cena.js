// A cena 3D: luz, céu, câmera, voos de câmera e o laço que desenha a casa.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { VISAO_GERAL } from './dados.js';
import { $, estado, comodoPorId, reduzMovimento, toque } from './util.js';
import { carregarCasa } from './modelo.js';
import { posicionarPinos } from './pinos.js';

// Devolve os comandos da cena, ou null se o navegador não tiver WebGL.
export function iniciarCena(canvas, { aoProgresso }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  const palco = $('[data-palco]');
  const pequeno = Math.min(innerWidth, innerHeight) < 700;

  // ---- resolução: começa por um orçamento de pixels e depois se ajusta ao aparelho.
  // Dentro de um cômodo todo pixel da tela é parede, louça ou vidro (fora, boa parte é céu): o quadro
  // fica mais caro, e quem decide a fluidez é a resolução. O laço mede o tempo entre quadros seguidos;
  // se o aparelho não acompanha, a resolução baixa, e volta a subir devagar quando sobra folga.
  // ?resolucao=1.5 no endereço fixa a resolução (para testar num tablet da feira).
  const fixa = Number(new URLSearchParams(location.search).get('resolucao')) || 0;
  const res = {
    max: fixa || Math.min(devicePixelRatio, pequeno ? 1.75 : 2),
    min: fixa || Math.min(devicePixelRatio, 1) * 0.8,
    atual: 0, teto: Infinity, amostras: [], folga: 0, antes: null, travado: false, trocas: 0,
  };
  const ORCAMENTO = 2.6e6;   // pixels por quadro no começo: pouco mais que uma tela Full HD
  const resolucaoInicial = () => {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    return Math.max(res.min, Math.min(res.max, Math.sqrt(ORCAMENTO / (w * h))));
  };
  function usarResolucao(pr) {
    pr = Math.round(pr * 20) / 20;
    if (pr === res.atual) return;
    res.atual = pr;
    res.trocas++;
    renderer.setPixelRatio(pr);
    precisaDesenhar = true;
  }
  const mediana = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
  // recebe o tempo (ms) entre dois quadros desenhados um atrás do outro
  function medirQuadro(dt) {
    if (fixa || dt > 250) return;            // tranco (compilação, carga de arquivo): não conta
    res.amostras.push(dt);
    if (res.amostras.length < 30) return;
    const m = mediana(res.amostras);
    res.amostras.length = 0;
    if (res.antes) {
      // acabou de baixar: se não melhorou, quem segura não é a placa de vídeo (modo de economia de
      // bateria, que prende em 30 quadros): volta para onde estava e para de baixar
      const antes = res.antes;
      res.antes = null;
      if (m > antes.m * 0.88) { res.travado = true; res.teto = Infinity; usarResolucao(antes.pr); return; }
    }
    if (m > 25 && !res.travado && res.atual > res.min + 0.01) {
      res.antes = { pr: res.atual, m };
      res.teto = res.atual * 0.9;             // não volta tão cedo para a resolução que pesou
      res.folga = 0;
      usarResolucao(Math.max(res.min, res.atual * 0.8));
    } else if (m < 18) {
      if (++res.folga >= 4 && res.atual < Math.min(res.max, res.teto) - 0.01) {
        res.folga = 0;
        usarResolucao(Math.min(res.max, res.teto, res.atual * 1.15));
      }
    } else res.folga = 0;
  }
  // ao entrar ou sair de um cômodo o peso muda: recomeça a medir (dentro, parte do orçamento)
  function recomecarResolucao(dentro) {
    res.teto = Infinity; res.travado = false; res.amostras.length = 0; res.folga = 0; res.antes = null;
    if (dentro) usarResolucao(Math.min(res.atual, resolucaoInicial()));
  }
  let precisaDesenhar = true;
  usarResolucao(resolucaoInicial());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const HORIZONTE = new THREE.Color('#dbe6ef');
  scene.fog = new THREE.Fog(HORIZONTE, 45, 150);

  // céu: degradê do azul Cascola até o horizonte claro
  const ceu = new THREE.Mesh(
    new THREE.SphereGeometry(400, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { topo: { value: new THREE.Color('#163f72') }, meio: { value: new THREE.Color('#79a6d2') }, base: { value: HORIZONTE } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 topo; uniform vec3 meio; uniform vec3 base; varying vec3 vP; void main(){ float h = max(vP.y, 0.0); vec3 c = mix(base, meio, smoothstep(0.0, 0.18, h)); c = mix(c, topo, smoothstep(0.18, 0.75, h)); gl_FragColor = vec4(c, 1.0); }',
    }),
  );
  ceu.renderOrder = -1;
  scene.add(ceu);

  // ---- luz
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.3;
  scene.add(new THREE.HemisphereLight('#dcebff', '#5f6b3c', 0.55));
  const sol = new THREE.DirectionalLight('#fff0dc', 3.6);
  sol.position.set(-11, 16, 18);
  sol.castShadow = true;
  const sombraGrande = !pequeno && !toque && renderer.capabilities.maxTextureSize >= 8192;
  sol.shadow.mapSize.set(sombraGrande ? 4096 : 2048, sombraGrande ? 4096 : 2048);
  Object.assign(sol.shadow.camera, { left: -19, right: 19, top: 19, bottom: -19, near: 1, far: 70 });
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.03;
  scene.add(sol, sol.target);

  // ---- câmera
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 900);
  const controles = new OrbitControls(camera, canvas);
  Object.assign(controles, {
    enableDamping: true, dampingFactor: 0.08, enablePan: false, enableZoom: false,
    minDistance: 7, maxDistance: 46, minPolarAngle: 0.2, maxPolarAngle: 1.42, rotateSpeed: 0.7,
  });

  const ultimaMatriz = new THREE.Matrix4();
  const redesenhar = () => { precisaDesenhar = true; };

  // ---- enquadramento: no celular em pé, afasta a câmera para caber a casa
  let ajuste = 1;
  function redimensionar() {
    precisaDesenhar = true;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    const aspecto = w / h;
    // dentro de um cômodo a lente abre mais: o cômodo é pequeno e a parede está logo atrás da câmera
    camera.fov = estado.dentro ? (aspecto < 1 ? 72 : 50) : (aspecto < 1 ? 50 : 38);
    camera.aspect = aspecto;
    camera.updateProjectionMatrix();
    const ref = Math.tan(THREE.MathUtils.degToRad(38) / 2) * 1.6;
    const atual = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * aspecto;
    ajuste = Math.max(1, ref / atual) * (aspecto < 1 ? 0.92 : 1);
    aplicarDeslocamento(true);
  }

  // ---- deslocamento da imagem: a casa sai de trás do título e do menu aberto
  const desloc = { x: 0, y: 0 };
  const gaveta = document.querySelector('[data-gaveta]');
  function deslocamentoDesejado() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const largo = w / h > 1.15 && w > 900;
    if (estado.modo === 'abertura') return largo ? { x: -0.16, y: 0.02 } : { x: 0, y: -0.07 };
    // na demonstração, a imagem sai de trás do painel (à esquerda na tela larga, embaixo no celular)
    if (estado.modo === 'demo') return largo ? { x: -Math.min(0.24, 250 / w), y: 0.02 } : { x: 0, y: 0.16 };
    // menu aberto: a casa sai de trás dele, pelo tamanho que ele tem nesta tela (cada arquivo de
    // css/ põe o menu num lugar: do lado, ou embaixo no celular em pé)
    if (estado.menuAberto && gaveta) {
      const r = gaveta.getBoundingClientRect();
      if (r.width < w * 0.8) return { x: Math.min(0.3, r.width / w / 2), y: 0 };       // de lado
      if (r.height < h * 0.95) return { x: 0, y: Math.min(0.32, r.height / h / 2) };    // embaixo
    }
    if (largo) return { x: 0, y: 0.02 };
    // dentro de um cômodo a câmera já está perto: a imagem fica no meio
    return { x: 0, y: estado.dentro ? 0 : 0.06 };
  }
  function aplicarDeslocamento(instantaneo) {
    const alvo = deslocamentoDesejado();
    const k = instantaneo || reduzMovimento ? 1 : 0.08;
    const nx = desloc.x + (alvo.x - desloc.x) * k, ny = desloc.y + (alvo.y - desloc.y) * k;
    if (!instantaneo && Math.abs(nx - desloc.x) < 1e-5 && Math.abs(ny - desloc.y) < 1e-5) return;
    desloc.x = nx; desloc.y = ny;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.setViewOffset(w, h, desloc.x * w, desloc.y * h, w, h);
    precisaDesenhar = true;
  }

  // `v` é um enquadramento de fonte/dados.js: { camera: [x, y, z], alvo: [x, y, z] }
  // `exato`: enquadramento de dentro de um cômodo; não afasta no celular em pé (a parede está logo atrás)
  function vista(v) {
    const alvo = new THREE.Vector3(...v.alvo);
    const off = new THREE.Vector3(...v.camera).sub(alvo).multiplyScalar(v.exato ? 1 : ajuste);
    return { pos: alvo.clone().add(off), alvo };
  }

  // ---- voo de câmera: interpola em volta do alvo (não atravessa a casa)
  // `reto`: velocidade constante (a câmera acompanha uma ferramenta que anda em linha reta)
  // Devolve uma promessa: true quando chega, false se alguém mexeu na câmera no caminho.
  let voo = null;
  const esf = new THREE.Spherical(), esfA = new THREE.Spherical(), esfB = new THREE.Spherical();
  function voar(v, dur = 1.6, reto = false) {
    const destino = vista(v);
    esfA.setFromVector3(camera.position.clone().sub(controles.target));
    esfB.setFromVector3(destino.pos.clone().sub(destino.alvo));
    let dT = esfB.theta - esfA.theta;
    if (dT > Math.PI) dT -= Math.PI * 2;
    if (dT < -Math.PI) dT += Math.PI * 2;
    voo?.chegou(false);
    return new Promise((chegou) => {
      voo = {
        reto, chegou, t0: performance.now(), dur: reduzMovimento ? 0.01 : dur * 1000,
        alvoA: controles.target.clone(), alvoB: destino.alvo,
        a: { r: esfA.radius, phi: esfA.phi, theta: esfA.theta }, b: { r: esfB.radius, phi: esfB.phi, theta: esfA.theta + dT },
      };
      controles.enabled = false;
    });
  }
  const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  // põe a câmera direto num enquadramento, sem voo
  function enquadrar(v) {
    const d = vista(v);
    voo?.chegou(false);
    voo = null;
    camera.position.copy(d.pos); controles.target.copy(d.alvo); camera.lookAt(d.alvo);
    distSuave = null;
    aoMudarModo();
    precisaDesenhar = true;
  }

  // ---- passeio automático na abertura: balanço lento em volta da casa
  let ultimoToque = 0;
  controles.addEventListener('start', () => { ultimoToque = performance.now(); voo?.chegou(false); voo = null; controles.enabled = true; });
  let base = null;

  // Chamada quando o site troca entre 'abertura', 'explorar' e 'demo'.
  function aoMudarModo() {
    precisaDesenhar = true;
    const explorar = estado.modo !== 'abertura';
    controles.enabled = explorar || !toque;
    controles.enableZoom = explorar;
    base = null;
  }

  // ---- barreira: dentro de um cômodo a câmera não atravessa as paredes nem os móveis.
  // Como o braço de câmera de um jogo: se a parede ou um móvel fica entre o alvo e a câmera,
  // a câmera chega para a frente, no mesmo alinhamento (continua olhando para o mesmo ponto).
  // A posição "desejada" volta depois do desenho, para o giro e a pinça continuarem de onde estavam.
  let barreira = null;
  let distSuave = null;
  const desejada = new THREE.Vector3(), _o = new THREE.Vector3(), _d = new THREE.Vector3();
  const raio = new THREE.Raycaster();
  // caixa = [x0, y0, z0, x1, y1, z1] (o vão livre do cômodo, em metros);
  // obstaculos = malhas que a câmera não atravessa; folga = distância mínima até a parede
  function limitar(def) {
    barreira = def ? {
      caixa: new THREE.Box3(new THREE.Vector3(def.caixa[0], def.caixa[1], def.caixa[2]), new THREE.Vector3(def.caixa[3], def.caixa[4], def.caixa[5])).expandByScalar(-(def.folga ?? 0.1)),
      obstaculos: def.obstaculos || [], margem: def.margem ?? 0.07,
    } : null;
    distSuave = null;
    precisaDesenhar = true;
  }
  // Até onde a câmera pode ir, a partir do alvo, na direção `dir` (unitária)
  function distanciaLivre(origem, dir, dist) {
    const b = barreira.caixa;
    let t = dist;
    for (const k of ['x', 'y', 'z']) {
      if (dir[k] > 1e-9) t = Math.min(t, (b.max[k] - origem[k]) / dir[k]);
      else if (dir[k] < -1e-9) t = Math.min(t, (b.min[k] - origem[k]) / dir[k]);
    }
    let teto = Infinity;   // nunca passa do primeiro móvel, nem quando ele está colado no alvo
    if (barreira.obstaculos.length) {
      raio.set(origem, dir);
      raio.near = 0; raio.far = t + barreira.margem;
      const toques = raio.intersectObjects(barreira.obstaculos, false);
      if (toques.length) { t = Math.min(t, toques[0].distance - barreira.margem); teto = toques[0].distance - 0.01; }
    }
    return Math.max(0.005, Math.min(teto, Math.max(0.05, t)));
  }
  function prenderCamera(dt) {
    _o.copy(controles.target).clamp(barreira.caixa.min, barreira.caixa.max);   // o alvo pode estar encostado na parede
    _d.subVectors(camera.position, _o);
    const dist = _d.length();
    if (dist < 1e-6) return;
    _d.divideScalar(dist);
    const livre = Math.min(dist, distanciaLivre(_o, _d, dist));
    // encolhe na hora (não deixa ver através); volta a se afastar aos poucos (não dá tranco)
    distSuave = distSuave == null || livre < distSuave ? livre : Math.min(livre, distSuave + 2.2 * dt);
    if (distSuave < dist - 1e-4) {
      camera.position.copy(_o).addScaledVector(_d, distSuave);
      camera.lookAt(controles.target);
    }
  }

  // ---- laço de desenho
  const tmp = new THREE.Vector3();
  const visivel = { palco: true, aba: true };
  const ganchos = [];   // funções chamadas a cada quadro (demonstração, pontos do cômodo)
  let rodando = false, anterior = 0, desenhouAntes = false, ultimoDesenho = 0;
  function quadro(agora) {
    if (!(visivel.palco && visivel.aba)) { rodando = false; return; }
    rodando = true;
    requestAnimationFrame(quadro);
    const dt = anterior ? Math.min(0.1, (agora - anterior) / 1000) : 0.016;
    anterior = agora;
    for (const fn of ganchos) fn(agora);   // a demonstração anda aqui

    if (voo) {
      const t = Math.min(1, (agora - voo.t0) / voo.dur);
      const k = voo.reto ? t : suave(t);
      controles.target.lerpVectors(voo.alvoA, voo.alvoB, k);
      esf.set(
        THREE.MathUtils.lerp(voo.a.r, voo.b.r, k),
        THREE.MathUtils.lerp(voo.a.phi, voo.b.phi, k),
        THREE.MathUtils.lerp(voo.a.theta, voo.b.theta, k),
      );
      camera.position.copy(controles.target).add(tmp.setFromSpherical(esf));
      camera.lookAt(controles.target);
      if (t >= 1) { const fim = voo; voo = null; aoMudarModo(); fim.chegou(true); }
    } else {
      // balanço automático na abertura
      if (estado.modo === 'abertura' && !reduzMovimento && agora - ultimoToque > 5000) {
        esf.setFromVector3(tmp.copy(camera.position).sub(controles.target));
        if (!base) base = { theta: esf.theta, t: agora };
        esf.theta = base.theta + Math.sin((agora - base.t) / 1000 * 0.16) * 0.42;
        camera.position.copy(controles.target).add(tmp.setFromSpherical(esf));
      } else if (estado.modo === 'abertura') {
        base = null;
      }
      controles.update();
    }

    aplicarDeslocamento(false);

    const preso = !!barreira;
    if (preso) { desejada.copy(camera.position); prenderCamera(dt); }
    // só desenha quando algo mudou (economiza bateria no tablet)
    camera.updateMatrixWorld();
    let desenhou = false;
    if (precisaDesenhar || !camera.matrixWorld.equals(ultimaMatriz)) {
      if (desenhouAntes) medirQuadro(agora - ultimoDesenho);
      desenhou = true;
      ultimoDesenho = agora;
      renderer.render(scene, camera);
      posicionarPinos(camera, canvas);
      for (const fn of aoDesenhar) fn(camera, canvas);
      ultimaMatriz.copy(camera.matrixWorld);
      precisaDesenhar = false;
      if (esperandoDesenho.length) for (const ok of esperandoDesenho.splice(0)) ok();
    }
    if (preso) camera.position.copy(desejada);
    desenhouAntes = desenhou;
  }
  const aoDesenhar = [];   // funções chamadas depois de cada desenho (gotas que acompanham a cena)
  const esperandoDesenho = [];   // promessas que esperam o próximo desenho (a cortina só abre depois dele)
  function iniciarLoop() { if (!rodando) { anterior = 0; desenhouAntes = false; requestAnimationFrame(quadro); } }

  // ---- posição inicial
  redimensionar();
  const v0 = vista(VISAO_GERAL);
  camera.position.copy(v0.pos);
  controles.target.copy(v0.alvo);
  controles.update();
  aoMudarModo();

  new ResizeObserver(() => {
    const antes = ajuste;
    redimensionar();
    // dentro de um cômodo quem cuida do enquadramento é a barreira
    if (Math.abs(antes - ajuste) > 0.01 && !voo && estado.modo !== 'demo' && !estado.dentro) {
      const v = vista(estado.comodo ? comodoPorId[estado.comodo] : VISAO_GERAL);
      camera.position.copy(v.pos); controles.target.copy(v.alvo); controles.update();
    }
  }).observe(canvas);
  // para de desenhar quando a casa sai da tela ou a aba fica em segundo plano
  new IntersectionObserver(([en]) => { visivel.palco = en.isIntersecting; iniciarLoop(); }).observe(palco);
  document.addEventListener('visibilitychange', () => { visivel.aba = !document.hidden; iniciarLoop(); });

  if (location.search.includes('depurar')) {
    window.__cena3d = {
      THREE, scene, camera, controles, redesenhar, renderer,
      // posição em que a câmera foi desenhada no último quadro (já presa pela barreira)
      desenhada: () => new THREE.Vector3().setFromMatrixPosition(ultimaMatriz).toArray(),
      limite: () => barreira && { min: barreira.caixa.min.toArray(), max: barreira.caixa.max.toArray() },
      resolucao: () => ({ ...res, amostras: res.amostras.length, pixels: renderer.domElement.width * renderer.domElement.height }),
      medirQuadro,
    };
  }

  return {
    carregar: () => carregarCasa({ scene, renderer, aoProgresso, redesenhar }),
    voar, enquadrar, aoMudarModo, iniciarLoop, redesenhar, limitar, redimensionar, recomecarResolucao,
    // usados pelo interior dos cômodos e pelas demonstrações
    tres: { scene, camera, controles, renderer, sol },
    aoQuadro: (fn) => ganchos.push(fn),
    aoDesenhar: (fn) => aoDesenhar.push(fn),
    ultimoToque: () => ultimoToque,
    // promessa que se cumpre quando o próximo quadro tiver sido desenhado
    depoisDoDesenho: () => new Promise((ok) => { esperandoDesenho.push(ok); precisaDesenhar = true; iniciarLoop(); }),
    emVoo: () => !!voo,
  };
}
