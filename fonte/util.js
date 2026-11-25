// Ajudantes pequenos, usados por todos os outros arquivos.
import { PRODUTOS, CATEGORIAS, COMODOS, OBJETOS } from './dados.js';

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// troca os caracteres que o HTML trataria como código
export const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

export const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const toque = matchMedia('(pointer: coarse)').matches;
export const rolagem = () => (reduzMovimento ? 'auto' : 'smooth');

export const comodoPorId = Object.fromEntries(COMODOS.map((c) => [c.id, c]));
export const produtoPorId = Object.fromEntries(PRODUTOS.map((p) => [p.id, p]));
export const categoriaPorId = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c]));
export const produtosDoComodo = (id) => PRODUTOS.filter((p) => p.comodos.includes(id));
// Objetos (OBJETOS de dados.js) que recebem o produto `produto`; com `comodo`, só os daquele cômodo.
// Os objetos marcados com `pendente` (aplicação ainda não confirmada pelo técnico) ficam de fora.
export const objetosDoProduto = (produto, comodo = null) =>
  OBJETOS.filter((o) => !o.pendente && o.produto === produto && (!comodo || o.comodo === comodo));

// O que está na tela agora. Todos os arquivos leem daqui; só o main.js muda.
export const estado = {
  modo: 'abertura',   // 'abertura' (título na frente) ou 'explorar' (casa livre para girar)
  comodo: null,       // id do cômodo escolhido, ou null
  menuAberto: false,  // o menu lateral de produtos está aberto?
  dentro: null,       // id do cômodo em que a câmera entrou (o banheiro), ou null
  produto: null,      // id do produto da vista "Ver cômodos" (as gotas dos cômodos dele ficam em destaque), ou null
};
