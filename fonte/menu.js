// Menu lateral de produtos (o único menu da casa).
// O HTML do menu e do cartão de produto fica no index.html; aqui só entra o comportamento.
// Tem duas vistas, no mesmo lugar:
//   'todos'  : os 12 produtos, com os filtros de categoria;
//   'comodo' : só os produtos indicados para o cômodo escolhido na casa.
import { PRODUTOS } from './dados.js';
import { $, $$, estado, comodoPorId, produtosDoComodo, rolagem } from './util.js';
import { clonar, preencher } from './html.js';

const gaveta = $('[data-gaveta]');
const alca = $('[data-acao="menu"]');
const corpo = $('.gaveta__corpo');
const cabecaTodos = $('[data-menu-todos]');
const cabecaComodo = $('[data-menu-comodo]');
const lista = $('[data-vitrine]');
const itens = () => $$('[data-produto]', lista);

// Um cartão por produto, copiado do <template data-modelo="cartao"> do index.html.
export function montarMenu() {
  for (const p of PRODUTOS) {
    const li = clonar('cartao');
    if (!li) break;
    const onde = comodoPorId[p.comodos[0]];
    li.id = `produto-${p.id}`;
    li.dataset.produto = p.id;
    li.dataset.categoria = p.categoria;
    lista.appendChild(preencher(li, { ...p, comodo: onde?.nome, comodoId: onde?.id }));
  }
  mostrarTodos();
}

export function abrirMenu(sim) {
  estado.menuAberto = sim;
  gaveta.dataset.aberta = String(sim);
  alca.setAttribute('aria-expanded', String(sim));
}

function vista(nome) {
  gaveta.dataset.vista = nome;
  if (cabecaTodos) cabecaTodos.hidden = nome !== 'todos';
  if (cabecaComodo) cabecaComodo.hidden = nome !== 'comodo';
  corpo.scrollTop = 0;
}

// Vista 'todos': título, filtros e os 12 produtos.
export function mostrarTodos() {
  vista('todos');
  filtrar('todos');
}

// Vista 'comodo': o nome do cômodo e só os produtos indicados para ele.
export function mostrarComodo(id) {
  const ids = new Set(produtosDoComodo(id).map((p) => p.id));
  if (cabecaComodo) preencher(cabecaComodo, { comodo: comodoPorId[id].nome });
  itens().forEach((li) => { li.hidden = !ids.has(li.dataset.produto); });
  vista('comodo');
}

// Filtros de categoria (só existem na vista 'todos').
export function filtrar(id) {
  $$('[data-filtro]', gaveta).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === id)));
  itens().forEach((li) => { li.hidden = id !== 'todos' && li.dataset.categoria !== id; });
}

// Rola o menu até um produto e pisca a moldura dele.
export function destacarProduto(id) {
  const item = $(`#produto-${id}`);
  if (!item || item.hidden) return;
  requestAnimationFrame(() => {
    corpo.scrollTo({ top: item.offsetTop - 12, behavior: rolagem() });
    item.classList.remove('is-destaque'); void item.offsetWidth; item.classList.add('is-destaque');
  });
}
