// Menu lateral de produtos (o único menu da casa).
// O HTML do menu e do cartão de produto fica no index.html; aqui só entra o comportamento.
import { PRODUTOS } from './dados.js';
import { $, $$, estado, comodoPorId, produtoPorId, produtosDoComodo, objetosDoProduto, rolagem } from './util.js';
import { clonar, preencher } from './html.js';
import { DEMOS } from './demo/demos.js';

const gaveta = $('[data-gaveta]');
const alca = $('[data-acao="menu"]');
const corpo = $('.gaveta__corpo');
const cabecaTodos = $('[data-menu-todos]');
const cabecaComodo = $('[data-menu-comodo]');
const cabecaProduto = $('[data-menu-produto]');
const lista = $('[data-vitrine]');
const listaObjetos = $('[data-objetos]');
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

// Troca a vista do menu. `nome` é 'todos', 'comodo' ou 'produto'. O atributo data-vista da gaveta
// é lido pelo CSS; cada vista mostra o seu cabeçalho, e a vista 'produto' troca a vitrine de
// produtos pela lista de objetos.
function vista(nome) {
  gaveta.dataset.vista = nome;
  if (cabecaTodos) cabecaTodos.hidden = nome !== 'todos';
  if (cabecaComodo) cabecaComodo.hidden = nome !== 'comodo';
  if (cabecaProduto) cabecaProduto.hidden = nome !== 'produto';
  lista.hidden = nome === 'produto';
  if (listaObjetos) listaObjetos.hidden = nome !== 'produto';
  corpo.scrollTop = 0;
  botoesDeAplicacao(nome === 'comodo' ? estado.comodo : null);
}

// Ajusta um botão de aplicação para o objeto `o`: se o objeto tem demonstração cadastrada em
// DEMOS, o botão recebe data-demo (o clique abre a demonstração, no main.js); se não tem, o
// botão fica desativado e a classe is-breve faz o CSS mostrar o texto "em breve".
function ligarAplicacao(botao, o) {
  const temDemo = !!(o.demo && DEMOS[o.demo]);
  if (temDemo) botao.dataset.demo = o.demo;
  botao.disabled = !temDemo;
  botao.classList.toggle('is-breve', !temDemo);
  return botao;
}

// Vista 'comodo': em cada cartão, um botão por objeto daquele cômodo que recebe o produto.
// Nas outras vistas (`comodo` nulo) a caixa dos botões fica vazia e escondida.
function botoesDeAplicacao(comodo) {
  for (const li of itens()) {
    const caixa = $('[data-aplicacoes]', li);
    if (!caixa) continue;
    const objetos = comodo ? objetosDoProduto(li.dataset.produto, comodo) : [];
    caixa.replaceChildren(...objetos.flatMap((o) => {
      const b = clonar('ver-aplicacao');
      return b ? [ligarAplicacao(preencher(b, o), o)] : [];
    }));
    caixa.hidden = !objetos.length;
  }
}

// Vista 'produto' (botão "Ver cômodos"): título com o nome do produto e um cartão por objeto que
// recebe o produto, em qualquer cômodo, copiado do <template data-modelo="objeto">. Os cartões
// anteriores são apagados; o <template> continua dentro da lista.
export function mostrarProduto(id) {
  const p = produtoPorId[id];
  if (!p || !listaObjetos) return;
  if (cabecaProduto) preencher(cabecaProduto, { nome: p.nome });
  $$('.objeto', listaObjetos).forEach((li) => li.remove());
  for (const o of objetosDoProduto(id)) {
    const li = clonar('objeto');
    if (!li) break;
    li.dataset.objeto = o.id;
    preencher(li, { ...o, comodo: comodoPorId[o.comodo]?.nome });
    ligarAplicacao($('.objeto__aplicar', li), o);
    listaObjetos.appendChild(li);
  }
  vista('produto');
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
