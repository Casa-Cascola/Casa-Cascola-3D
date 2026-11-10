// Ficha do produto: a área logo abaixo da casa 3D, com os dados técnicos.
// Fica escondida até alguém tocar em "Mais detalhes" num produto do menu.
import { PRODUTOS } from './dados.js';
import { FICHAS } from './fichas.js';
import { $, $$, esc, produtoPorId, categoriaPorId, comodoPorId, rolagem } from './util.js';

const secao = $('[data-ficha]');
const conteudo = $('[data-ficha-conteudo]');
const outros = $('[data-ficha-outros]');

// texto pronto para a tela: o número não se separa da unidade no fim da linha ("4 mm", "30 °C")
const txt = (t) => esc(t).replace(/(\d) (?=(mm|cm|m|g|kg|h|min|%|°C|cPs|kgf|meses|anos|horas|minutos)\b|[%°×±])/g, '$1\u00A0');
const lista = (itens, classe) => `<ul class="${classe}">${itens.map((t) => `<li>${txt(t)}</li>`).join('')}</ul>`;

function fichaHtml(p) {
  const f = FICHAS[p.id] || {};
  const onde = comodoPorId[p.comodos[0]];
  return `
    <div class="ficha__topo">
      <p class="ficha__sobre">Ficha do produto</p>
      <button class="ficha__voltar" type="button" data-acao="topo">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Voltar para a casa 3D
      </button>
    </div>
    <div class="ficha__grade">
      <div class="ficha__vitrine">
        <div class="item__casa">
          <img class="item__embalagem" src="img/produtos/${p.imagem}.webp" alt="Embalagem ${esc(p.nome)}">
          <img class="item__aplicacao" src="img/aplicacao/${p.imagem}.webp" alt="">
        </div>
        ${lista(p.diferenciais, 'item__dif')}
        ${onde ? `<button class="item__onde" type="button" data-ver-comodo="${onde.id}">Ver na casa: ${esc(onde.nome)}</button>` : ''}
      </div>
      <div class="ficha__texto">
        <p class="ficha__categoria">${esc(categoriaPorId[p.categoria].nome)}</p>
        <h2 tabindex="-1">${esc(p.nome)}</h2>
        <p class="ficha__resumo">${txt(f.resumo || p.chamada)}</p>
        ${f.numeros?.length ? `
        <dl class="ficha__numeros" data-n="${f.numeros.length}">
          ${f.numeros.map(([valor, unidade, rotulo]) => `
          <div>
            <dt>${txt(rotulo)}</dt>
            <dd>${esc(valor)}${unidade ? ` <span>${esc(unidade)}</span>` : ''}</dd>
          </div>`).join('')}
        </dl>` : ''}
        ${f.materiais?.length ? `
        <h3>Onde usar</h3>
        ${lista(f.materiais, 'ficha__chips')}
        ${f.usos ? `<p class="ficha__usos">${txt(f.usos)}</p>` : ''}` : ''}
        ${f.passos?.length ? `
        <h3>Como aplicar</h3>
        <ol class="ficha__passos">${f.passos.map((t) => `<li>${txt(t)}</li>`).join('')}</ol>` : ''}
        ${f.atencao?.length ? `
        <h3>Atenção</h3>
        ${lista(f.atencao, 'ficha__atencao')}` : ''}
        ${f.dados?.length ? `
        <h3>Dados técnicos</h3>
        <dl class="ficha__dados">
          ${f.dados.map(([nome, valor]) => `<div><dt>${esc(nome)}</dt><dd>${txt(valor)}</dd></div>`).join('')}
        </dl>` : ''}
        ${f.fonte ? `<p class="ficha__fonte">Fonte: <a href="${esc(f.fonte.url)}" target="_blank" rel="noopener">${esc(f.fonte.nome)}</a>, Henkel. Antes de aplicar, leia as instruções da embalagem.</p>` : ''}
      </div>
    </div>`;
}

// Faixa "Outros produtos", no pé da ficha: troca de produto sem voltar ao menu.
export function montarDetalhes() {
  outros.innerHTML = `
    <h3>Outros produtos</h3>
    <div class="ficha__faixa">
      ${PRODUTOS.map((p) => `
        <button class="ficha__mini" type="button" data-detalhes="${p.id}">
          <img src="img/produtos/${p.imagem}.webp" alt="" loading="lazy">
          <span>${esc(p.nome)}</span>
        </button>`).join('')}
    </div>`;
}

export function mostrarDetalhes(id) {
  const p = produtoPorId[id];
  if (!p) return;
  conteudo.innerHTML = fichaHtml(p);
  $$('.ficha__mini', outros).forEach((b) => {
    if (b.dataset.detalhes === id) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
  });
  secao.hidden = false;
  secao.scrollIntoView({ behavior: rolagem(), block: 'start' });
  $('h2', conteudo).focus({ preventScroll: true });
}
