
//   'todos'  : todos os produtos, com os filtros de categoria;
//   'comodo' : só os produtos indicados para o cômodo escolhido na casa.
import { PRODUTOS, CATEGORIAS } from './dados.js';
import { $, $$, esc, estado, comodoPorId, produtosDoComodo, rolagem } from './util.js';

const gaveta = $('[data-gaveta]');
const alca = $('[data-acao="menu"]');
const corpo = $('.gaveta__corpo');
const cabeca = $('[data-menu-cabeca]');
const lista = $('[data-vitrine]');

// O cartão do produto. O visual dele fica em css/index.css (classes .item).
function cartao(p) {
  const onde = comodoPorId[p.comodos[0]];
  return `
    <li class="item" id="produto-${p.id}" data-produto="${p.id}" data-categoria="${p.categoria}">
      <p class="item__problema">${esc(p.problema)}</p>
      <div class="item__casa">
        <img class="item__embalagem" src="Img/produtos/${p.imagem}.webp" alt="Embalagem ${esc(p.nome)}" loading="lazy">
        <img class="item__aplicacao" src="Img/aplicacao/${p.imagem}.webp" alt="" loading="lazy">
      </div>
      <h3 class="item__nome">${esc(p.nome)}</h3>
      <p class="item__chamada">${esc(p.chamada)}</p>
      <ul class="item__dif">${p.diferenciais.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
      <div class="item__acoes">
        <button class="item__mais" type="button" data-detalhes="${p.id}">
          Mais detalhes
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        ${onde ? `<button class="item__onde" type="button" data-ver-comodo="${onde.id}">Na casa: ${esc(onde.nome)}</button>` : ''}
      </div>
    </li>`;
}

export function montarMenu() {
  lista.innerHTML = PRODUTOS.map(cartao).join('');
  mostrarTodos();
}

export function abrirMenu(sim) {
  estado.menuAberto = sim;
  gaveta.dataset.aberta = String(sim);
  alca.setAttribute('aria-expanded', String(sim));
}

// Vista 'todos': título, filtros e todos os produtos.
export function mostrarTodos() {
  gaveta.dataset.vista = 'todos';
  cabeca.innerHTML = `
    <h2>Uma Cascola para cada canto da casa.</h2>
    <div class="filtros" role="group" aria-label="Categorias">
      ${[{ id: 'todos', nome: 'Todos' }, ...CATEGORIAS]
        .map((c) => `<button class="filtro" type="button" data-filtro="${c.id}" aria-pressed="${c.id === 'todos'}">${esc(c.nome)}</button>`).join('')}
    </div>`;
  $$('.item', lista).forEach((li) => { li.hidden = false; });
  corpo.scrollTop = 0;
}

// Vista 'comodo': o nome do cômodo e só os produtos indicados para ele.
export function mostrarComodo(id) {
  const c = comodoPorId[id];
  const ids = new Set(produtosDoComodo(id).map((p) => p.id));
  gaveta.dataset.vista = 'comodo';
  cabeca.innerHTML = `
    <button class="gaveta__todos" type="button" data-acao="todos">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Todos os produtos
    </button>
    <p class="gaveta__sobre">${ids.size === 1 ? 'Produto indicado para' : 'Produtos indicados para'}</p>
    <h2>${esc(c.nome)}</h2>`;
  $$('.item', lista).forEach((li) => { li.hidden = !ids.has(li.dataset.produto); });
  corpo.scrollTop = 0;
}

// Filtros de categoria (só existem na vista 'todos').
export function filtrar(id) {
  $$('[data-filtro]', cabeca).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === id)));
  $$('.item', lista).forEach((li) => { li.hidden = id !== 'todos' && li.dataset.categoria !== id; });
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
