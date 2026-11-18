// Lista das demonstrações. Para criar uma nova, copie um arquivo da pasta demos/ e some aqui.
// A ordem da lista é a ordem dos botões "Ver aplicação" no cartão do produto.
import banheiroVaso from './demos/banheiro-vaso.js';
import banheiroBox from './demos/banheiro-box.js';

const lista = [banheiroVaso, banheiroBox];
export const DEMOS = Object.fromEntries(lista.map((d) => [d.id, d]));
