// Ponte entre os dados e o HTML.
// Todo o HTML fica no index.html. O JavaScript só preenche os espaços marcados lá:
//
//   data-texto="campo"     recebe o texto do campo (ex.: data-texto="nome")
//   data-lista="campo"     o primeiro filho é o modelo, repetido para cada item da lista
//   data-se="campo"        só aparece se o produto tiver esse campo
//   data-imagem="pasta"    vira src="img/pasta/<imagem do produto>.webp"
//   data-link="campo"      recebe o endereço (href) do campo
//   data-detalhes          botão que abre a ficha do produto
//   data-ver-comodo        botão que leva ao cômodo do produto
//
// Para tirar uma parte da tela, apague o elemento no index.html: o que não existe não é preenchido.
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
  const cada = (seletor, fn) => {
    for (const el of [raiz, ...raiz.querySelectorAll(seletor)]) if (el.matches(seletor) && !deLista(el)) fn(el);
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
  cada('[data-imagem]', (el) => { if (d.imagem) el.src = `img/${el.dataset.imagem}/${d.imagem}.webp`; });
  cada('[data-link]', (el) => { if (d[el.dataset.link]) el.href = d[el.dataset.link]; });
  cada('[data-detalhes]', (el) => { if (d.id) el.dataset.detalhes = d.id; });
  cada('[data-ver-comodo]', (el) => { el.dataset.verComodo = d.comodoId || ''; el.hidden = !d.comodoId; });
  return raiz;
}
