// Ficha do produto (área "Ver detalhes"): a seção logo abaixo da casa 3D, com os dados técnicos.
// O HTML da ficha fica no index.html (section data-ficha); aqui só entram os dados.
// Fica escondida até alguém tocar em "Ver detalhes" num produto do menu.
import { PRODUTOS } from './dados.js';
import { FICHAS, REVISAO, caminhoFicha } from './fichas.js';
import { $, $$, produtoPorId, categoriaPorId, comodoPorId, rolagem } from './util.js';
import { clonar, preencher } from './html.js';

const secao = $('[data-ficha]');
const conteudo = $('[data-ficha-conteudo]');
const outros = $('[data-ficha-outros]');
const caixaTabelas = $('[data-tabelas]');

// Modo de revisão técnica: com ?revisao no endereço, cada ficha mostra também a lista de pendências
// (o que o técnico precisa confirmar). Sem ele, a lista fica escondida para o público da feira.
const revisao = new URLSearchParams(location.search).has('revisao');
if (revisao) document.documentElement.dataset.revisao = '';

// Faixa "Outros produtos", no pé da ficha: troca de produto sem voltar ao menu.
export function montarDetalhes() {
  if (!outros) return;
  for (const p of PRODUTOS) {
    const b = clonar('mini');
    if (!b) break;
    outros.appendChild(preencher(b, p));
  }
}

// Monta as tabelas da ficha (as de prensagem dos adesivos PVA). Cada tabela vira um <table>
// dentro de uma caixa com rolagem lateral, para não estourar a largura do celular.
function montarTabelas(tabelas = []) {
  if (!caixaTabelas) return;
  caixaTabelas.replaceChildren(...tabelas.map((t) => {
    const bloco = document.createElement('div');
    bloco.className = 'ficha__tabela';
    const titulo = document.createElement('h4');
    titulo.textContent = t.titulo;
    const rolar = document.createElement('div');
    rolar.className = 'ficha__rolar';
    rolar.tabIndex = 0; // deixa rolar a tabela pelo teclado
    rolar.setAttribute('role', 'region');
    rolar.setAttribute('aria-label', t.titulo);
    const tabela = document.createElement('table');
    const cabeca = tabela.createTHead().insertRow();
    for (const c of t.colunas) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = c;
      cabeca.appendChild(th);
    }
    const corpo = tabela.createTBody();
    for (const linha of t.linhas) {
      const tr = corpo.insertRow();
      for (const celula of linha) tr.insertCell().textContent = celula;
    }
    rolar.appendChild(tabela);
    bloco.append(titulo, rolar);
    if (t.nota) {
      const nota = document.createElement('p');
      nota.className = 'ficha__nota';
      nota.textContent = t.nota;
      bloco.appendChild(nota);
    }
    return bloco;
  }));
}

export function mostrarDetalhes(id) {
  const p = produtoPorId[id];
  if (!p || !secao || !conteudo) return;
  const f = FICHAS[id] || {};
  const onde = comodoPorId[p.comodos[0]];
  preencher(conteudo, {
    ...p, ...f,
    // no topo da ficha aparece o tipo de produto da ficha técnica (ex.: "Diluente"); se faltar, a categoria do menu
    categoria: f.tipo || categoriaPorId[p.categoria].nome,
    resumo: f.resumo || p.indicacao || p.chamada,
    numeros: (f.numeros || []).map(([valor, unidade, rotulo]) => ({ valor, unidade, rotulo })),
    dados: (f.dados || []).map(([nome, valor]) => ({ nome, valor })),
    // link para o PDF oficial dentro da pasta FichaTecnica/ (vazio se o produto não tiver ficha)
    pdfUrl: caminhoFicha(f),
    revisao: f.pdf ? REVISAO : '',
    pendencias: revisao ? f.pendencias : [],
    tabelas: f.tabelas,
    // o bloco "Onde usar" aparece se houver etiquetas de materiais ou a frase de aplicações
    ondeUsar: f.materiais?.length || f.usos ? 'sim' : '',
    comodo: onde?.nome, comodoId: onde?.id,
  });
  montarTabelas(f.tabelas);
  $$('[data-detalhes]', secao).forEach((b) => {
    if (b.dataset.detalhes === id) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
  });
  secao.hidden = false;
  secao.scrollIntoView({ behavior: rolagem(), block: 'start' });
  $('h2', conteudo)?.focus({ preventScroll: true });
}
