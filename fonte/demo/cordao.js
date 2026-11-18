// Cordões de selante, filetes de cola e fitas: um perfil 2D varrido ao longo de um caminho.
// O cordão aparece aos poucos (mostrar(de, ate)), acompanhando o bico que aplica.
import * as THREE from 'three';

// Caminho: pontos [x, y, z] ligados por retas, percorrido por comprimento (s de 0 a 1).
// `normal` é para onde a superfície olha; o lado do perfil é tangente × normal.
export class Caminho {
  constructor(pontos, { fechado = false, normal = [0, 1, 0] } = {}) {
    this.pts = pontos.map((p) => new THREE.Vector3(...p));
    if (fechado) this.pts.push(this.pts[0].clone());
    this.normal = new THREE.Vector3(...normal).normalize();
    this.acum = [0];
    for (let i = 1; i < this.pts.length; i++) this.acum.push(this.acum[i - 1] + this.pts[i].distanceTo(this.pts[i - 1]));
    this.comprimento = this.acum[this.acum.length - 1];
  }
  // posição, tangente, normal e lado no ponto s (0 a 1)
  em(s, sai = {}) {
    const d = Math.min(1, Math.max(0, s)) * this.comprimento;
    let i = 1;
    while (i < this.acum.length - 1 && this.acum[i] < d) i++;
    const a = this.pts[i - 1], b = this.pts[i], trecho = this.acum[i] - this.acum[i - 1] || 1;
    sai.p = (sai.p || new THREE.Vector3()).lerpVectors(a, b, (d - this.acum[i - 1]) / trecho);
    sai.t = (sai.t || new THREE.Vector3()).subVectors(b, a).normalize();
    sai.n = (sai.n || new THREE.Vector3()).copy(this.normal);
    sai.b = (sai.b || new THREE.Vector3()).crossVectors(sai.t, sai.n).normalize();
    return sai;
  }
}

// Arco de elipse deitado (plano XZ), na altura y, do ângulo a0 ao a1 (radianos; x = cos, z = sen).
// Indo de a0 para a1 no sentido em que o ângulo diminui, o lado do perfil (tangente × normal)
// aponta para fora da elipse: é o que o filete precisa para encostar no pé do vaso.
export function arcoElipse(cx, cz, ax, az, y, a0, a1, passos = 64) {
  return Array.from({ length: passos + 1 }, (_, i) => {
    const a = a0 + (a1 - a0) * (i / passos);
    return [cx + Math.cos(a) * ax, y, cz + Math.sin(a) * az];
  });
}

// ---- perfis: listas de [lado, altura] em metros, do lado negativo para o positivo, por cima
export const perfilRedondo = (larg, alt = larg / 2, n = 8) => Array.from({ length: n + 1 }, (_, i) => {
  const a = (Math.PI * i) / n;
  return [(-Math.cos(a) * larg) / 2, Math.sin(a) * alt];
});
// fita ou filme fino, quase encostado na superfície
export const perfilFita = (larg, alt = 0.0004) => [[-larg / 2, alt], [larg / 2, alt]];
// filete côncavo num canto (parede em lado = 0, piso em altura = 0), já alisado
export const perfilCanto = (l, n = 6) => Array.from({ length: n + 1 }, (_, i) => {
  const a = (Math.PI / 2) * (1 - i / n);
  return [l - l * Math.sin(a), l - l * Math.cos(a)];
});
// filete côncavo com pernas diferentes: `l` para o lado (no piso) e `a` para cima (na parede)
export const perfilCantoAlto = (l, a, n = 8) => Array.from({ length: n + 1 }, (_, i) => {
  const t = (Math.PI / 2) * (1 - i / n);
  return [l - l * Math.sin(t), a - a * Math.cos(t)];
});
// move um perfil (para encostar o cordão fresco no canto, e não no meio dele)
export const deslocar = (perfil, dl, da = 0) => perfil.map(([l, a]) => [l + dl, a + da]);

// Varre o perfil pelo caminho. Devolve a malha; malha.userData.mostrar(de, ate) escolhe o trecho visível.
//   pontas:   'cupula' (cordão meio-redondo) ou 'bola' (rolinho): fecha as duas pontas do trecho visível,
//             em vez de deixar o cordão "cortado" como um tubo aberto
//   variacao: quanto a largura e a altura variam ao longo do cordão (0,08 = 8 %), como na mão de quem aplica
//   ondula:   ondinhas que o bico deixa no cordão fresco (0,05 = 5 %)
export function criarCordao(caminho, perfil, material, { passo = 0.004, ladrilho = 0.05, pontas = null, variacao = 0, ondula = 0, semente = 1 } = {}) {
  const N = Math.min(1400, Math.max(2, Math.ceil(caminho.comprimento / passo))) + 1, M = perfil.length;
  const pos = new Float32Array(N * M * 3), uv = new Float32Array(N * M * 2), idx = [];
  const q = {};
  // fases sorteadas pela semente: cada cordão varia de um jeito
  let sem = semente * 9301 + 49297;
  const rnd = () => ((sem = (sem * 233280 + 49297) % 2147483647) / 2147483647) * Math.PI * 2;
  const f1 = rnd(), f2 = rnd(), f3 = rnd(), f4 = rnd();
  const L = caminho.comprimento;
  // fator de largura (x) e de altura (y) em cada ponto do cordão
  const fator = (s) => {
    const d = s * L, fim = Math.min(1, d / 0.006, (L - d) / 0.006);     // nas pontas o cordão não varia
    const n = 0.6 * Math.sin((2 * Math.PI * d) / 0.031 + f1) + 0.4 * Math.sin((2 * Math.PI * d) / 0.013 + f2);
    const m = 0.6 * Math.sin((2 * Math.PI * d) / 0.027 + f3) + 0.4 * Math.sin((2 * Math.PI * d) / 0.011 + f4);
    const o = Math.sin((2 * Math.PI * d) / 0.0045 + f1 * 3);
    return [1 + fim * (variacao * n + ondula * 0.4 * o), 1 + fim * (variacao * 0.8 * m + ondula * o)];
  };
  for (let i = 0; i < N; i++) {
    const s = i / (N - 1);
    caminho.em(s, q);
    const [fx, fy] = fator(s);
    for (let j = 0; j < M; j++) {
      const k = (i * M + j) * 3, lx = perfil[j][0] * fx, ly = perfil[j][1] * fy;
      pos[k] = q.p.x + q.b.x * lx + q.n.x * ly;
      pos[k + 1] = q.p.y + q.b.y * lx + q.n.y * ly;
      pos[k + 2] = q.p.z + q.b.z * lx + q.n.z * ly;
      uv[(i * M + j) * 2] = (s * L) / ladrilho;
      uv[(i * M + j) * 2 + 1] = j / (M - 1);
    }
    if (i < N - 1) for (let j = 0; j < M - 1; j++) {
      const a = i * M + j, b = a + 1, c = a + M, d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const malha = new THREE.Mesh(g, material);
  malha.castShadow = malha.receiveShadow = true;
  malha.frustumCulled = false;

  // pontas: um quarto de esfera (cúpula) ou meia esfera (bola), do tamanho do perfil naquele ponto
  let ponta = null;
  if (pontas) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const [x, y] of perfil) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const bola = pontas === 'bola';
    const geo = new THREE.SphereGeometry(1, 16, bola ? 12 : 7, 0, Math.PI, 0, bola ? Math.PI : Math.PI / 2);
    const cx = (x0 + x1) / 2, cy = bola ? (y0 + y1) / 2 : y0, hx = (x1 - x0) / 2, hy = bola ? (y1 - y0) / 2 : y1 - y0;
    const fazer = () => { const o = new THREE.Mesh(geo, material); o.castShadow = o.receiveShadow = true; o.frustumCulled = false; o.matrixAutoUpdate = false; malha.add(o); return o; };
    const tras = fazer(), frente = fazer(), m4 = new THREE.Matrix4(), c = new THREE.Vector3(), menos = new THREE.Vector3(), menosT = new THREE.Vector3(), esc = new THREE.Vector3();
    const por = (o, s, sentido) => {
      caminho.em(s, q);
      const [fx, fy] = fator(s);
      c.copy(q.p).addScaledVector(q.b, cx * fx).addScaledVector(q.n, cy * fy);
      // eixos da ponta: x = lado, y = para cima, z = para onde o cordão termina
      if (sentido > 0) m4.makeBasis(q.b, q.n, q.t); else m4.makeBasis(menos.copy(q.b).negate(), q.n, menosT.copy(q.t).negate());
      m4.scale(esc.set(hx * fx, hy * fy, hx * fx * 0.85)).setPosition(c);
      o.matrix.copy(m4);
    };
    ponta = { tras, frente, por };
  }

  const porTrecho = (M - 1) * 6;
  malha.userData.mostrar = (de, ate) => {
    de = Math.min(1, Math.max(0, de)); ate = Math.min(1, Math.max(0, ate));
    const i0 = Math.round(de * (N - 1)), i1 = Math.round(ate * (N - 1));
    g.setDrawRange(i0 * porTrecho, Math.max(0, i1 - i0) * porTrecho);
    malha.visible = i1 > i0;
    if (ponta && malha.visible) { ponta.por(ponta.tras, i0 / (N - 1), -1); ponta.por(ponta.frente, i1 / (N - 1), 1); }
  };
  malha.userData.mostrar(0, 0);
  return malha;
}

// Faixa que mostra onde o produto vai (etapa "Por que usar"): um L laranja e translúcido nas duas
// superfícies da junta, mais forte no canto, que se desenha ao longo do caminho e é percorrido por
// um brilho. Não é o produto: some quando a aplicação começa.
//   const f = faixaDaJunta(junta, { lado: 0.022, alto: 0.018 });
//   f.userData.ajustar(forca, frente, tempo)   forca 0 a 1; frente: até onde já se desenhou (0 a 1)
export function faixaDaJunta(caminho, { lado = 0.022, alto = 0.018, folga = 0.0006, cor = '#f47216' } = {}) {
  const perfil = [[lado, folga], [lado * 0.5, folga], [folga, folga], [folga, alto * 0.5], [folga, alto]];
  const L = caminho.comprimento;
  const mat = new THREE.ShaderMaterial({
    name: 'FaixaDaJunta',
    transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    uniforms: { cor: { value: new THREE.Color(cor) }, forca: { value: 0 }, frente: { value: 0 }, tempo: { value: 0 }, comprimento: { value: L } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `
      uniform vec3 cor; uniform float forca, frente, tempo, comprimento; varying vec2 vUv;
      void main() {
        float s = vUv.x / comprimento;                       // 0 a 1 ao longo da junta
        float canto = 1.0 - abs(vUv.y * 2.0 - 1.0);          // 1 no canto, 0 nas beiradas da faixa
        float a = 0.16 + 0.5 * canto * canto;
        a *= 0.86 + 0.14 * sin(tempo * 3.2);                 // respira devagar
        // brilho que corre pela junta a 0,6 m/s
        float p = fract(tempo * 0.6 / max(comprimento, 0.4));
        float brilho = exp(-pow((s - p) * comprimento / 0.09, 2.0));
        a += 0.32 * brilho * canto;
        a *= 1.0 - smoothstep(frente - 0.04, frente, s);     // ainda não chegou ali
        gl_FragColor = vec4(mix(cor, vec3(1.0, 0.9, 0.78), brilho * 0.55), a * forca);
        #include <colorspace_fragment>
      }`,
  });
  const malha = criarCordao(caminho, perfil, mat, { ladrilho: 1 });
  malha.castShadow = malha.receiveShadow = false;
  malha.renderOrder = 3;
  malha.userData.mostrar(0, 1);
  malha.userData.ajustar = (forca, frente, tempo) => {
    mat.uniforms.forca.value = forca;
    mat.uniforms.frente.value = frente * 1.05;
    mat.uniforms.tempo.value = tempo;
    malha.visible = forca > 0.002 && frente > 0;
  };
  malha.userData.ajustar(0, 0, 0);
  return malha;
}
