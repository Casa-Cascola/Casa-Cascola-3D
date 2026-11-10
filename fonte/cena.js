// A cena 3D: luz, céu, câmera, voos de câmera e o laço que desenha a casa.
// Não sabe nada de produtos nem de menu: só lê `estado` para saber como enquadrar.
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
  renderer.setPixelRatio(Math.min(devicePixelRatio, pequeno ? 1.75 : 2));
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
  let precisaDesenhar = true;
  const redesenhar = () => { precisaDesenhar = true; };

  // ---- enquadramento: no celular em pé, afasta a câmera para caber a casa
  let ajuste = 1;
  function redimensionar() {
    precisaDesenhar = true;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    const aspecto = w / h;
    camera.fov = aspecto < 1 ? 50 : 38;
    camera.aspect = aspecto;
    camera.updateProjectionMatrix();
    const ref = Math.tan(THREE.MathUtils.degToRad(38) / 2) * 1.6;
    const atual = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * aspecto;
    ajuste = Math.max(1, ref / atual) * (aspecto < 1 ? 0.92 : 1);
    aplicarDeslocamento(true);
  }

  // ---- deslocamento da imagem: a casa sai de trás do título e do menu aberto
  const desloc = { x: 0, y: 0 };
  function deslocamentoDesejado() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const largo = w / h > 1.15 && w > 900;
    if (estado.modo === 'abertura') return largo ? { x: -0.16, y: 0.02 } : { x: 0, y: -0.07 };
    if (largo) return estado.menuAberto ? { x: 0.15, y: 0 } : { x: 0, y: 0.02 };
    return { x: 0, y: 0.06 };
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
  function vista(v) {
    const alvo = new THREE.Vector3(...v.alvo);
    const off = new THREE.Vector3(...v.camera).sub(alvo).multiplyScalar(ajuste);
    return { pos: alvo.clone().add(off), alvo };
  }

  // ---- voo de câmera: interpola em volta do alvo (não atravessa a casa)
  let voo = null;
  const esf = new THREE.Spherical(), esfA = new THREE.Spherical(), esfB = new THREE.Spherical();
  function voar(v, dur = 1.6) {
    const destino = vista(v);
    esfA.setFromVector3(camera.position.clone().sub(controles.target));
    esfB.setFromVector3(destino.pos.clone().sub(destino.alvo));
    let dT = esfB.theta - esfA.theta;
    if (dT > Math.PI) dT -= Math.PI * 2;
    if (dT < -Math.PI) dT += Math.PI * 2;
    voo = {
      t0: performance.now(), dur: reduzMovimento ? 0.01 : dur * 1000,
      alvoA: controles.target.clone(), alvoB: destino.alvo,
      a: { r: esfA.radius, phi: esfA.phi, theta: esfA.theta }, b: { r: esfB.radius, phi: esfB.phi, theta: esfA.theta + dT },
    };
    controles.enabled = false;
  }
  const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // ---- passeio automático na abertura: balanço lento em volta da casa
  let ultimoToque = 0;
  controles.addEventListener('start', () => { ultimoToque = performance.now(); voo = null; controles.enabled = true; });
  let base = null;

  // Chamada quando o site troca entre 'abertura' e 'explorar'.
  function aoMudarModo() {
    precisaDesenhar = true;
    const explorar = estado.modo === 'explorar';
    controles.enabled = explorar || !toque;
    controles.enableZoom = explorar;
    base = null;
  }

  // ---- laço de desenho
  const tmp = new THREE.Vector3();
  const visivel = { palco: true, aba: true };
  let rodando = false;
  function quadro(agora) {
    if (!(visivel.palco && visivel.aba)) { rodando = false; return; }
    rodando = true;
    requestAnimationFrame(quadro);

    if (voo) {
      const t = Math.min(1, (agora - voo.t0) / voo.dur);
      const k = suave(t);
      controles.target.lerpVectors(voo.alvoA, voo.alvoB, k);
      esf.set(
        THREE.MathUtils.lerp(voo.a.r, voo.b.r, k),
        THREE.MathUtils.lerp(voo.a.phi, voo.b.phi, k),
        THREE.MathUtils.lerp(voo.a.theta, voo.b.theta, k),
      );
      camera.position.copy(controles.target).add(tmp.setFromSpherical(esf));
      camera.lookAt(controles.target);
      if (t >= 1) { voo = null; aoMudarModo(); }
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

    // só desenha quando algo mudou (economiza bateria no tablet)
    camera.updateMatrixWorld();
    if (precisaDesenhar || !camera.matrixWorld.equals(ultimaMatriz)) {
      renderer.render(scene, camera);
      posicionarPinos(camera, canvas);
      ultimaMatriz.copy(camera.matrixWorld);
      precisaDesenhar = false;
    }
  }
  function iniciarLoop() { if (!rodando) requestAnimationFrame(quadro); }

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
    if (Math.abs(antes - ajuste) > 0.01 && !voo) {
      const v = vista(estado.comodo ? comodoPorId[estado.comodo] : VISAO_GERAL);
      camera.position.copy(v.pos); controles.target.copy(v.alvo); controles.update();
    }
  }).observe(canvas);
  // para de desenhar quando a casa sai da tela ou a aba fica em segundo plano
  new IntersectionObserver(([en]) => { visivel.palco = en.isIntersecting; iniciarLoop(); }).observe(palco);
  document.addEventListener('visibilitychange', () => { visivel.aba = !document.hidden; iniciarLoop(); });

  if (location.search.includes('depurar')) window.__cena3d = { scene, camera, controles, redesenhar };

  return {
    carregar: () => carregarCasa({ scene, renderer, aoProgresso, redesenhar }),
    voar, aoMudarModo, iniciarLoop, redesenhar,
  };
}
