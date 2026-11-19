// O "antes" das demonstrações: silicone velho com mofo, manchas e água empoçada.
// Tudo é desenhado em canvas (sem arquivo de imagem).
import * as THREE from 'three';
import { relevo } from './materia.js';

// gerador de números repetível: a mesma semente dá sempre o mesmo desenho
const sorteio = (semente) => { let s = semente * 16807 % 2147483647 || 1; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

// Silicone velho: amarelado e encardido, com pontos pretos de mofo.
//   largura x altura em pixels; u vai ao longo do cordão.
//   `concentra` (0 a 1): quanto o mofo se junta no fim do cordão (u = 1), onde a água para
export function texturaMofo({ semente = 7, base = '#bfae7c', pontos = 180, concentra = 0, largura = 512, altura = 32, repete = 1 } = {}) {
  const c = document.createElement('canvas'); c.width = largura; c.height = altura;
  const x = c.getContext('2d');
  const rnd = sorteio(semente);
  x.fillStyle = base; x.fillRect(0, 0, largura, altura);
  // encardido: faixas mais escuras irregulares
  for (let i = 0; i < 60; i++) {
    const px = rnd() * largura, w = 10 + rnd() * 40;
    x.fillStyle = `rgba(95, 80, 45, ${0.08 + rnd() * 0.12})`;
    x.fillRect(px, 0, w, altura);
  }
  for (let i = 0; i < pontos; i++) {
    // com `concentra`, os pontos vão para o fim do cordão
    let u = rnd();
    if (concentra) u = 1 - Math.pow(1 - u, 1 + concentra * 3);
    const px = u * largura, py = rnd() * altura, r = 1.5 + rnd() * (4 + 5 * u * concentra);
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, `rgba(${18 + rnd() * 25},${20 + rnd() * 22},${14 + rnd() * 12},${0.55 + rnd() * 0.4})`);
    g.addColorStop(1, 'rgba(30, 32, 20, 0)');
    x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.set(repete, 1);
  return t;
}
export function materialVelho(opcoes) {
  return new THREE.MeshStandardMaterial({ map: texturaMofo(opcoes), roughness: 0.82 });
}

// Mancha (umidade e mofo que saem da junta), para deitar sobre o piso ou a parede.
// Fica um pouco acima da superfície e não briga com ela (polygonOffset).
export function mancha(largura, altura, { semente = 3, cor = [52, 46, 30], forca = 0.55, bordas = 9 } = {}) {
  const N = 256, c = document.createElement('canvas'); c.width = c.height = N;
  const x = c.getContext('2d');
  const rnd = sorteio(semente);
  // nuvens sobrepostas, mais fortes no meio
  for (let i = 0; i < 26; i++) {
    const px = N * (0.25 + rnd() * 0.5), py = N * (0.25 + rnd() * 0.5), r = N * (0.12 + rnd() * 0.22);
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, `rgba(${cor[0]},${cor[1]},${cor[2]},${forca * (0.25 + rnd() * 0.35)})`);
    g.addColorStop(1, `rgba(${cor[0]},${cor[1]},${cor[2]},0)`);
    x.fillStyle = g; x.fillRect(0, 0, N, N);
  }
  // pontinhos de mofo
  for (let i = 0; i < 140; i++) {
    const a = rnd() * Math.PI * 2, d = Math.pow(rnd(), 0.7) * N * 0.36, px = N / 2 + Math.cos(a) * d, py = N / 2 + Math.sin(a) * d, r = 0.8 + rnd() * 2.6;
    x.fillStyle = `rgba(20, 22, 16, ${0.3 + rnd() * 0.5})`;
    x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill();
  }
  void bordas;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const o = new THREE.Mesh(new THREE.PlaneGeometry(largura, altura), m);
  o.receiveShadow = true;
  o.renderOrder = 1;
  return o;
}

// Água empoçada: contorno irregular, brilhante e transparente. Deitada no plano XZ, centro na origem.
// userData.secar(k): k = 0 molhada, 1 seca (encolhe a partir das bordas e some)
export function poca(raioX, raioZ, { semente = 5 } = {}) {
  const rnd = sorteio(semente);
  const fases = [rnd(), rnd(), rnd(), rnd()].map((v) => v * Math.PI * 2);
  const forma = new THREE.Shape(), N = 48;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const k = 1 + 0.16 * Math.sin(a * 3 + fases[0]) + 0.1 * Math.sin(a * 5 + fases[1]) + 0.06 * Math.sin(a * 9 + fases[2]);
    const px = Math.cos(a) * raioX * k, pz = Math.sin(a) * raioZ * k;
    if (i === 0) forma.moveTo(px, pz); else forma.lineTo(px, pz);
  }
  const g = new THREE.ShapeGeometry(forma, 6);
  g.rotateX(Math.PI / 2);
  // piso molhado fica mais escuro e espelhado; as ondinhas pegam o brilho da luz
  const m = new THREE.MeshPhysicalMaterial({
    color: '#34464f', transparent: true, opacity: 0.5, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02,
    normalMap: relevo('liso'), normalScale: new THREE.Vector2(0.6, 0.6),
    envMapIntensity: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3, side: THREE.DoubleSide,
  });
  const o = new THREE.Mesh(g, m);
  o.renderOrder = 1;
  o.userData.secar = (k) => {
    const e = Math.max(0.001, 1 - k);
    o.scale.set(e, 1, e);
    m.opacity = 0.5 * Math.min(1, e * 1.6);
    o.visible = k < 0.999;
  };
  return o;
}
