// Ficha do produto: a área logo abaixo da casa 3D, com os dados técnicos.
// O HTML da ficha fica no index.html (section data-ficha); aqui só entram os dados.
// Fica escondida até alguém tocar em "Mais detalhes" num produto do menu.
import { PRODUTOS } from './dados.js';
import { FICHAS } from './fichas.js';
import { $, $$, produtoPorId, categoriaPorId, comodoPorId, rolagem } from './util.js';
import { clonar, preencher } from './html.js';

const secao = $('[data-ficha]');
const conteudo = $('[data-ficha-conteudo]');
const outros = $('[data-ficha-outros]');

// Faixa "Outros produtos", no pé da ficha: troca de produto sem voltar ao menu.
export function montarDetalhes() {
  if (!outros) return;
  for (const p of PRODUTOS) {
    const b = clonar('mini');
    if (!b) break;
    outros.appendChild(preencher(b, p));
  }
}

export function mostrarDetalhes(id) {
  const p = produtoPorId[id];
  if (!p || !secao || !conteudo) return;
  const f = FICHAS[id] || {};
  const onde = comodoPorId[p.comodos[0]];
  preencher(conteudo, {
    ...p, ...f,
    categoria: categoriaPorId[p.categoria].nome,
    resumo: f.resumo || p.chamada,
    numeros: (f.numeros || []).map(([valor, unidade, rotulo]) => ({ valor, unidade, rotulo })),
    dados: (f.dados || []).map(([nome, valor]) => ({ nome, valor })),
    fonteNome: f.fonte?.nome, fonteUrl: f.fonte?.url,
    comodo: onde?.nome, comodoId: onde?.id,
  });
  $$('[data-detalhes]', secao).forEach((b) => {
    if (b.dataset.detalhes === id) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
  });
  secao.hidden = false;
  secao.scrollIntoView({ behavior: rolagem(), block: 'start' });
  $('h2', conteudo)?.focus({ preventScroll: true });
}
