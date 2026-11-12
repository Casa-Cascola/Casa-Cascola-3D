// Gotas laranja dos cômodos: botões HTML que acompanham a casa 3D.
// A posição de cada gota (em metros) fica em fonte/dados.js, no campo `pino`.
import * as THREE from 'three';
import { COMODOS } from './dados.js';
import { $, estado } from './util.js';
import { clonar, preencher } from './html.js';

const palco = $('[data-palco]');
const blocoAbertura = $('[data-abertura]');
export const camadaPinos = $('[data-pinos]');

// Uma gota por cômodo, copiada do <template data-modelo="pino"> do index.html.
const pinos = COMODOS.flatMap((c) => {
  const b = clonar('pino');
  if (!b) return [];
  b.dataset.comodo = c.id;
  b.setAttribute('aria-label', c.nome);
  camadaPinos.appendChild(preencher(b, c));
  return [{ el: b, c, p: new THREE.Vector3(...c.pino), n: c.normal ? new THREE.Vector3(...c.normal) : null }];
});

// Marca a gota do cômodo escolhido e apaga as outras.
export function atualizarPinos() {
  for (const { el, c } of pinos) {
    el.classList.toggle('is-ativo', estado.comodo === c.id);
    el.classList.toggle('is-apagado', !!estado.comodo && estado.comodo !== c.id);
  }
}

// Chamada pela cena a cada quadro desenhado: leva cada gota para o ponto da tela
// onde o cômodo está, e esconde as que ficaram atrás da casa.
const tmp = new THREE.Vector3();
const olhar = new THREE.Vector3();
export function posicionarPinos(camera, canvas) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  // na abertura, a gota não fica por cima do título
  const rs = estado.modo === 'abertura' ? [...blocoAbertura.children].map((el) => el.getBoundingClientRect()) : [];
  const top = palco.getBoundingClientRect().top;
  for (const pin of pinos) {
    tmp.copy(pin.p).project(camera);
    let oculto = tmp.z > 1 || Math.abs(tmp.x) > 1.1 || Math.abs(tmp.y) > 1.1;
    if (!oculto && pin.n) oculto = olhar.copy(camera.position).sub(pin.p).normalize().dot(pin.n) < 0.12;
    const x = (tmp.x * 0.5 + 0.5) * w, y = (-tmp.y * 0.5 + 0.5) * h;
    if (!oculto) for (const r of rs) if (x > r.left - 20 && x < r.right + 140 && y + top > r.top - 30 && y + top < r.bottom + 10) oculto = true;
    pin.el.classList.toggle('is-oculto', oculto);
    if (!oculto) pin.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }
}
