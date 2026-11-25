// Ponte entre os dados e o HTML.
import { $ } from './util.js';

// Copia o conteúdo de um <template data-modelo="nome"> do index.html.
export function clonar(nome) {
  const modelo = $(`template[data-modelo="${nome}"]`);
  const el = modelo?.content.firstElementChild;
  if (!el) { console.warn(`Falta no index.html: <template data-modelo="${nome}">`); return null; }
  return el.cloneNode(true);
}

// o número não se separa da unidade no fim da linha ("4 mm", "30 °C")
const texto = (t) => String(t).replace(/(\d) (?=(mm|cm|m|g|kg|h|min|%|°C|cPs|kgf|meses|anos|horas|minutos)\b|[%°×±])/g, '$1 ');
const vazio = (v) => v == null || v === '' || (Array.isArray(v) && !v.length);
const modeloDaLista = new WeakMap();

// Preenche os espaços marcados dentro de `raiz` com os campos de `d`.
export function preencher(raiz, d) {
  // O que está dentro de uma lista é preenchido com o item da lista, não com `d`.
  const deLista = (el) => { const l = el.parentElement?.closest('[data-lista]'); return !!l && raiz.contains(l); };
  // Os alvos são escolhidos todos antes de qualquer mudança. Assim uma lista dentro de outra lista
  // (ex.: os itens de cada bloco de `extras`) não é confundida com uma lista solta depois que o
  // modelo da lista de fora sai da página.
  const cada = (seletor, fn) => {
    const alvos = [raiz, ...raiz.querySelectorAll(seletor)].filter((el) => el.matches(seletor) && !deLista(el));
    alvos.forEach(fn);
  };

  cada('[data-se]', (el) => { el.hidden = vazio(d[el.dataset.se]); });

  cada('[data-lista]', (el) => {
    if (!modeloDaLista.has(el)) modeloDaLista.set(el, el.firstElementChild);
    const modelo = modeloDaLista.get(el);
    const itens = (modelo && d[el.dataset.lista]) || [];
    el.dataset.n = itens.length; // o CSS pode usar: [data-n="3"]
    el.replaceChildren(...itens.map((item) => {
      const copia = modelo.cloneNode(true);
      if (typeof item === 'object') preencher(copia, item);
      else (copia.querySelector('[data-texto="item"]') || copia).textContent = texto(item);
      return copia;
    }));
  });

  cada('[data-texto]', (el) => { el.textContent = vazio(d[el.dataset.texto]) ? '' : texto(d[el.dataset.texto]); });
  // Imagem que não existe na pasta (ex.: Img/aplicacao/ de um produto sem foto) fica escondida,
  // em vez de aparecer o ícone de imagem quebrada.
  cada('[data-imagem]', (el) => {
    if (!d.imagem) return;
    // produto sem a foto de aplicação (fotoAplicacao: false em dados.js): a imagem nem é pedida
    if (el.dataset.imagem === 'aplicacao' && d.fotoAplicacao === false) { el.hidden = true; el.removeAttribute('src'); return; }
    el.hidden = false;
    el.onerror = () => { el.hidden = true; };
    el.src = `Img/${el.dataset.imagem}/${d.imagem}.webp`;
  });
  // sem endereço, o link perde o href (assim não fica apontando para o produto anterior)
  cada('[data-link]', (el) => { const url = d[el.dataset.link]; if (url) el.href = url; else el.removeAttribute('href'); });
  cada('[data-detalhes]', (el) => { if (d.id) el.dataset.detalhes = d.id; });
  cada('[data-ver-comodo]', (el) => { el.dataset.verComodo = d.comodoId || ''; el.hidden = !d.comodoId; });
  // botão "Ver cômodos" do cartão: guarda o id do produto (o clique é tratado no main.js)
  cada('[data-ver-comodos]', (el) => { if (d.id) el.dataset.verComodos = d.id; });
  return raiz;
}
