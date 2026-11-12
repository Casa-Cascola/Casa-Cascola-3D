// Cascola — site da marca com a casa 3D
// Ponto de partida: liga os cliques da página às outras partes do código.
// O arquivo usado pela página é js/app.js, gerado com `npm run build` a partir desta pasta:
//
//   dados.js     textos dos produtos e dos cômodos, posições das gotas e da câmera
//   fichas.js    dados técnicos de cada produto
//   util.js      ajudantes e o estado da tela
//   html.js      preenche os espaços marcados no index.html (data-texto, data-lista...)
//   menu.js      menu lateral de produtos
//   detalhes.js  ficha do produto, abaixo da casa
//   pinos.js     gotas laranja dos cômodos
//   cena.js      cena 3D: luz, câmera e desenho
//   modelo.js    carregamento do Casa.glb e ajustes de exportação

import { VISAO_GERAL } from './dados.js';
import { $, $$, estado, comodoPorId, reduzMovimento, rolagem } from './util.js';
import { montarMenu, abrirMenu, mostrarTodos, mostrarComodo, filtrar } from './menu.js';
import { montarDetalhes, mostrarDetalhes } from './detalhes.js';
import { camadaPinos, atualizarPinos } from './pinos.js';
import { iniciarCena } from './cena.js';

const palco = $('[data-palco]');
const botaoVoltar = $('[data-acao="voltar"]');
let cena = null;        // comandos da cena 3D (null se o navegador não abrir o 3D)
let esperaMenu = 0;     // no celular, o menu espera a câmera chegar ao cômodo

// ---------------------------------------------------------------- navegação
function menu(sim) {
  clearTimeout(esperaMenu);
  abrirMenu(sim);
  if (sim) entrarNaCasa();
  cena?.redesenhar();
}

// "Ver a casa 3D": tira o título da frente e libera girar e aproximar
function entrarNaCasa() {
  if (estado.modo === 'explorar') return;
  estado.modo = 'explorar';
  palco.dataset.modo = 'explorar';
  botaoVoltar.hidden = false;
  cena?.aoMudarModo();
}

// Gota de um cômodo: a câmera vai até ele e o menu mostra os produtos indicados
function selecionarComodo(id) {
  entrarNaCasa();
  estado.comodo = id;
  mostrarComodo(id);
  atualizarPinos();
  cena?.voar(comodoPorId[id]);
  // em tela estreita o menu cobre a casa: primeiro a câmera chega, depois ele abre
  const estreito = matchMedia('(max-width: 720px)').matches;
  if (estreito && cena && !estado.menuAberto && !reduzMovimento) {
    clearTimeout(esperaMenu);
    esperaMenu = setTimeout(() => menu(true), 1300);
  } else {
    menu(true);
  }
}

// "Todos os produtos": sai do cômodo e volta a mostrar a casa inteira
function sairDoComodo() {
  clearTimeout(esperaMenu);
  estado.comodo = null;
  mostrarTodos();
  atualizarPinos();
  cena?.voar(VISAO_GERAL);
}

// "Voltar": fecha tudo e traz o título de volta
function voltarParaAbertura() {
  menu(false);
  estado.modo = 'abertura';
  estado.comodo = null;
  palco.dataset.modo = 'abertura';
  botaoVoltar.hidden = true;
  mostrarTodos();
  atualizarPinos();
  cena?.aoMudarModo();
  cena?.voar(VISAO_GERAL);
}

const subir = () => window.scrollTo({ top: 0, behavior: rolagem() });

// ---------------------------------------------------------------- cliques e teclado
document.addEventListener('click', (e) => {
  const t = e.target.closest('button, a');
  if (!t) return;
  const { acao, filtro, detalhes, verComodo, comodo } = t.dataset;
  if (acao === 'menu') return menu(!estado.menuAberto);
  if (acao === 'produtos') { e.preventDefault(); subir(); return menu(true); }
  if (acao === 'todos') return sairDoComodo();
  if (acao === 'voltar') return voltarParaAbertura();
  if (acao === 'ver-casa') { entrarNaCasa(); cena?.voar(VISAO_GERAL); return; }
  if (acao === 'topo') return subir();
  if (filtro) return filtrar(filtro);
  if (detalhes) return mostrarDetalhes(detalhes);
  if (verComodo) { subir(); return selecionarComodo(verComodo); }
  if (comodo && t.closest('[data-pinos]')) return selecionarComodo(comodo);
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (estado.menuAberto) menu(false);
  else if (estado.comodo) sairDoComodo();
  else if (estado.modo === 'explorar') voltarParaAbertura();
});

// ---------------------------------------------------------------- linha do tempo
// cordão de cola: desenha uma vez, quando aparece na tela
(function cordao() {
  const svg = $('[data-cordao]');
  if (!svg || reduzMovimento || !('IntersectionObserver' in window)) return;
  const paths = $$('path', svg);
  paths.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  const io = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    svg.classList.add('is-desenhando');
    requestAnimationFrame(() => paths.forEach((p) => { p.style.strokeDashoffset = 0; }));
    io.disconnect();
  }, { threshold: 0.4 });
  io.observe(svg);
})();

// ---------------------------------------------------------------- partida
montarMenu();
montarDetalhes();

function aviso(texto) {
  const el = $('[data-aviso]');
  if (!el) return;
  el.textContent = texto;
  el.hidden = false;
}
// A barra de carregamento é opcional: se o HTML não tiver, nada acontece.
const progresso = (fracao) => { const barra = $('[data-carregando-barra]'); if (barra) barra.style.width = `${Math.round(fracao * 100)}%`; };
const esconderCarregando = () => { const el = $('[data-carregando]'); if (el) el.hidden = true; };

(async function () {
  cena = iniciarCena($('[data-cena]'), { aoProgresso: progresso });
  if (!cena) {
    esconderCarregando();
    camadaPinos.hidden = true;
    aviso('Este navegador não abriu o 3D. A imagem mostra a casa, e o menu Produtos funciona normalmente.');
    return;
  }
  try {
    await cena.carregar();
    progresso(1);
    palco.classList.add('is-pronto');
    cena.redesenhar();
    cena.iniciarLoop();
    setTimeout(esconderCarregando, 800);
    window.__casaPronta = true;
  } catch (e) {
    console.error(e);
    esconderCarregando();
    camadaPinos.hidden = true;
    aviso(e.message === 'arquivo-local'
      ? 'Falta o arquivo modelos/casa.glb.js para abrir a casa direto do disco. Veja o LEIA-ME.'
      : 'Não foi possível carregar a casa 3D. Confira se a pasta modelos foi enviada junto com o site.');
    window.__casaErro = String(e);
  }
})();
