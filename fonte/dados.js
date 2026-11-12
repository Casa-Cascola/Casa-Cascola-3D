// Conteúdo do site. Para mudar um texto, mude aqui e rode `npm run build`.
// Produtos e diferenciais: placa "Henkel Casa Produtos" (v2). História: henkel.com.br.

export const CATEGORIAS = [
  { id: 'contato', nome: 'Colas de contato' },
  { id: 'pva', nome: 'Colas brancas (PVA)' },
  { id: 'montagem', nome: 'Adesivos de montagem' },
  { id: 'selantes', nome: 'Silicones e selantes' },
];

// `comodos`: onde o produto aparece na casa 3D; `problema`: a frase que aparece no cômodo.
export const PRODUTOS = [
  {
    id: 'contato-tradicional', categoria: 'contato', imagem: 'contato-tradicional',
    nome: 'Cola de Contato Tradicional',
    chamada: 'A clássica da Cascola, desde 1955.',
    diferenciais: ['Rende até 2x mais', 'Sem toluol', 'Sem cheiro após 10 min', 'Fácil aplicação', 'Sem grumos, fácil de espalhar'],
    comodos: ['cozinha'], problema: 'Laminado dos armários soltando',
  },
  {
    id: 'contato-extraforte', categoria: 'contato', imagem: 'contato-extraforte',
    nome: 'Cola de Contato Extraforte',
    chamada: 'Para o que dobra, curva e não pode soltar.',
    diferenciais: ['Resistência à umidade', 'Sem toluol', 'Sem cheiro após 10 min', 'Perfeita para colagens curvas ou maleáveis'],
    comodos: ['lavanderia'], problema: 'Sola de sapato e peças maleáveis descolando',
  },
  {
    id: 'cola-madeira', categoria: 'pva', imagem: 'cola-madeira',
    nome: 'Cola Branca PVA Cola Madeira',
    chamada: 'Móvel firme de novo, sem esperar o dia todo.',
    diferenciais: ['Resistência à umidade', 'Pega rápida', 'Menos tempo de prensagem', 'Ideal para reparos e montagem de móveis'],
    comodos: ['quarto'], problema: 'Móvel de madeira desmontando',
  },
  {
    id: 'pva-extraforte', categoria: 'pva', imagem: 'pva-extraforte',
    nome: 'Cola Branca PVA Extraforte',
    chamada: 'Força de colagem que acompanha a madeira.',
    diferenciais: ['Alta durabilidade', 'Alta força de colagem', 'Transparente, não empelota', 'Não solta com a movimentação da madeira'],
    comodos: ['escritorio'], problema: 'Escrivaninha e estante de madeira',
  },
  {
    id: 'nao-mais-pregos', categoria: 'montagem', imagem: 'nao-mais-pregos',
    nome: 'Não Mais Pregos',
    chamada: 'Fixa na hora, sem furadeira.',
    diferenciais: ['Agarre imediato', 'Instalação rápida, sem esforço', 'Suporta até 700 kg/10 cm²', 'Dispensa pregos e parafusos'],
    comodos: ['sala'], problema: 'Painel ripado e prateleira sem furar a parede',
  },
  {
    id: 'pl600', categoria: 'montagem', imagem: 'pl600',
    nome: 'Adesivo de Montagem PL600',
    chamada: 'Segura firme do lado de fora também.',
    diferenciais: ['Agarre imediato', 'Resiste à chuva e à umidade', 'Cola em metal, cerâmica e alvenaria'],
    comodos: ['garagem'], problema: 'Número da casa e placas na fachada',
  },
  {
    id: 'pl700', categoria: 'montagem', imagem: 'pl700',
    nome: 'Adesivo de Montagem PL700',
    chamada: 'Cuidado com o que é delicado.',
    diferenciais: ['Agarre imediato', 'Perfeito para materiais sensíveis, como espelho e acrílico', 'Veda e cola, transparente'],
    comodos: ['banheiro'], problema: 'Espelho e peças de acrílico',
  },
  {
    id: 'silicone-uso-geral', categoria: 'selantes', imagem: 'silicone-uso-geral',
    nome: 'Silicone Uso Geral',
    chamada: 'Vedação transparente para a casa toda.',
    diferenciais: ['Não encolhe', 'Não trinca nem amarela', 'Resiste à água e ao sol', '10 anos de garantia', '100% silicone, transparente'],
    comodos: ['lavanderia'], problema: 'Vedação do tanque e da pia',
  },
  {
    id: 'silicone-banheiro-cozinha', categoria: 'selantes', imagem: 'silicone-banheiro-cozinha',
    nome: 'Silicone Banheiro e Cozinha',
    chamada: 'Junta limpa, sem mofo, por anos.',
    diferenciais: ['Não encolhe, trinca ou amarela', 'Resiste ao mofo e à limpeza diária', 'Resistente à água', '10 anos de garantia', '100% silicone'],
    comodos: ['banheiro'], problema: 'Box e cuba com mofo e infiltração',
  },
  {
    id: 'acabamentos', categoria: 'selantes', imagem: 'acabamentos',
    nome: 'Selante Acrílico Acabamentos',
    chamada: 'A trinca some e não volta.',
    diferenciais: ['Pintável', 'Antimofo', '10 anos de vedação garantida', 'Flexível, não deixa a trinca voltar'],
    comodos: ['quarto'], problema: 'Trinca na parede e no rodapé',
  },
  {
    id: 'pu40', categoria: 'selantes', imagem: 'pu40',
    nome: 'Selante PU40',
    chamada: 'Veda e cola onde a casa se movimenta.',
    diferenciais: ['Veda e cola', 'Resiste ao sol e à água', '5 anos de garantia', 'Acompanha a movimentação sem trincar'],
    comodos: ['varanda', 'jardim'], problema: 'Juntas do piso externo abrindo',
  },
  {
    id: 'pu-veda-calha', categoria: 'selantes', imagem: 'pu-veda-calha',
    nome: 'Selante PU Veda Calha',
    chamada: 'Calha sem goteira, faça sol ou chuva.',
    diferenciais: ['Veda e cola', 'Resiste ao sol e à chuva', 'Seguro para metais e PVC', 'Não encolhe, trinca ou cria bolhas'],
    comodos: ['telhado'], problema: 'Calha e rufo vazando',
  },
];

// Posições em metros, no sistema do Casa.glb (Y para cima, rua em +Z).
// `pino`: onde a gota aparece; `normal`: para onde a fachada olha; `camera`/`alvo`: o enquadramento.
export const COMODOS = [
  { id: 'sala', nome: 'Sala', pino: [1.6, 1.7, 4.15], normal: [0, 0, 1], camera: [5.0, 3.2, 16.5], alvo: [1.2, 1.9, 3.5] },
  { id: 'cozinha', nome: 'Cozinha', pino: [-5.15, 1.7, -2.0], normal: [-1, 0, 0], camera: [-19, 5.0, 10.5], alvo: [-4.6, 2.2, -1.4] },
  { id: 'banheiro', nome: 'Banheiro', pino: [5.15, 4.6, -2.5], normal: [1, 0, 0], camera: [17, 8.5, -11], alvo: [4.8, 4.4, -2.0] },
  { id: 'quarto', nome: 'Quarto', pino: [-2.6, 4.6, 4.15], normal: [0, 0, 1], camera: [-7.5, 6.5, 16], alvo: [-2.4, 4.3, 3.6] },
  { id: 'escritorio', nome: 'Escritório', pino: [3.0, 4.6, 4.15], normal: [0, 0, 1], camera: [7.5, 6.5, 16], alvo: [2.6, 4.3, 3.6] },
  { id: 'varanda', nome: 'Varanda', pino: [-0.2, 3.85, 5.3], normal: [0, 0, 1], camera: [-6.5, 6.4, 15.5], alvo: [-0.8, 3.6, 4.8] },
  { id: 'lavanderia', nome: 'Lavanderia', pino: [3.4, 1.7, -4.15], normal: [0, 0, -1], camera: [9.0, 3.8, -17], alvo: [3.2, 1.8, -3.6] },
  { id: 'garagem', nome: 'Garagem', pino: [7.6, 3.35, 4.45], normal: [0, 0, 1], camera: [13, 3.8, 17.5], alvo: [7.5, 1.6, 4.2] },
  { id: 'jardim', nome: 'Área externa', pino: [-6.5, 1.0, 9.0], normal: [-0.5, 0, 0.85], camera: [-13, 5.0, 21], alvo: [-6.0, 0.8, 8.2] },
  { id: 'telhado', nome: 'Telhado', pino: [5.8, 6.1, 4.6], normal: [0.7, 0, 0.7], camera: [16.5, 10.5, 17], alvo: [3.6, 5.6, 2.4] },
];

export const VISAO_GERAL = { camera: [20.5, 9.2, 29.5], alvo: [1.4, 2.3, 2.2] };
