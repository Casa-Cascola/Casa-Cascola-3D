// Conteúdo do site. Para mudar um texto, mude aqui e rode `npm run build`.

export const CATEGORIAS = [
  { id: 'contato', nome: 'Colas de contato' },
  { id: 'pva', nome: 'Colas brancas (PVA)' },
  { id: 'montagem', nome: 'Adesivos de montagem' },
  { id: 'selantes', nome: 'Silicones e selantes' },
];

// `comodos`: onde o produto aparece na casa 3D; `problema`: a frase do problema que o produto resolve
// (hoje fora da tela, comentada no index.html).
// `indicacao`: para que serve, em uma frase curta, mostrada no cartão do menu (nível 1, para o consumidor).
// `diferenciais`: os destaques da capa da ficha técnica do produto (pasta FichaTecnica/).
// `fotoAplicacao: false`: ainda não existe a foto redonda Img/aplicacao/<imagem>.webp; o cartão
// fica só com a embalagem (sem pedir ao servidor um arquivo que não existe).
// Os dados técnicos completos (nível 2, área "Ver detalhes") ficam em fichas.js.
export const PRODUTOS = [
  {
    id: 'contato-tradicional', categoria: 'contato', imagem: 'contato-tradicional',
    nome: 'Cola de Contato Tradicional',
    chamada: 'A clássica da Cascola, desde 1955.',
    indicacao: 'Cola madeira, couro, compensado, lâminas decorativas, espuma, vidro e carpete. Inflamável.',
    diferenciais: ['Rende 2x mais que a fórmula anterior', 'Sem toluol', 'Sem cheiro após 10 min', 'Fácil aplicação', 'Sem grumos, fácil de espalhar'],
    comodos: ['cozinha'], problema: 'Laminado dos armários e móveis soltando',
  },
  {
    id: 'contato-extraforte', categoria: 'contato', imagem: 'contato-extraforte',
    nome: 'Cola de Contato Extraforte',
    chamada: 'Para o que dobra, curva e não pode soltar.',
    indicacao: 'Para colagens curvas ou maleáveis de madeira, couro, lâminas, espuma e vidro. Inflamável.',
    diferenciais: ['Resistência à umidade', 'Sem toluol', 'Sem cheiro após 10 min', 'Perfeita para colagens curvas ou maleáveis'],
    comodos: ['banheiro', 'quarto'], problema: 'Fita de borda e sola de sapato descolando',
  },
  {
    id: 'cola-madeira', categoria: 'pva', imagem: 'cola-madeira',
    nome: 'Cola Branca PVA Cola Madeira',
    chamada: 'Móvel firme de novo, sem esperar o dia todo.',
    indicacao: 'Reparos e consertos de móveis de madeira, tacos e parquetes, cavilhas e encaixes.',
    diferenciais: ['Resistência à umidade', 'Pega rápida', 'Menos tempo de prensagem', 'Ideal para reparos e montagem de móveis'],
    comodos: ['quarto', 'banheiro','cozinha'], problema: 'Gavetas, armários e MDF desmontando',
  },
  {
    id: 'pva-extraforte', categoria: 'pva', imagem: 'pva-extraforte',
    nome: 'Cola Branca PVA Extraforte',
    chamada: 'Força de colagem que acompanha a madeira.',
    indicacao: 'Montagem e laminação de madeira, laminados plásticos, papel e materiais porosos.',
    diferenciais: ['Alta durabilidade', 'Alta força de colagem', 'Transparente, não empelota', 'Não solta com a movimentação da madeira'],
    comodos: ['escritorio', 'cozinha'], problema: 'Mesa, cadeira e estante de madeira soltando',
  },
  {
    id: 'nao-mais-pregos', categoria: 'montagem', imagem: 'nao-mais-pregos',
    nome: 'Não Mais Pregos',
    chamada: 'Fixa na hora, sem furadeira.',
    indicacao: 'Fixa rodapés, molduras e peças decorativas sem furar. Somente para uso interno.',
    diferenciais: ['Agarre imediato', 'Instalação rápida, sem esforço', 'Suporta até 700 kg/10 cm²', 'Dispensa pregos e parafusos'],
    comodos: ['sala'], problema: 'Painel ripado e prateleira sem furar a parede',
  },
  {
    id: 'pl600', categoria: 'montagem', imagem: 'pl600',
    nome: 'Adesivo de Montagem PL600',
    chamada: 'Segura firme do lado de fora também.',
    indicacao: 'Fixa peças sem furar, dentro e fora de casa, em metal, cerâmica e alvenaria. Inflamável.',
    diferenciais: ['Agarre imediato', 'Resistente à chuva e à umidade', 'Cola em metal, cerâmica e alvenaria'],
    comodos: ['banheiro','jardim'], problema: 'Número da casa, muro de pedras e porta-toalha soltando',
  },
  {
    id: 'pl700', categoria: 'montagem', imagem: 'pl700',
    nome: 'Adesivo de Montagem PL700',
    chamada: 'Cuidado com o que é delicado.',
    indicacao: 'Cola e veda espelhos, vidro, acrílico e outros materiais, dentro e fora de casa.',
    diferenciais: ['Agarre imediato', 'Perfeito para materiais sensíveis, como espelho e acrílico', 'Veda e cola, transparente'],
    comodos: ['banheiro'], problema: 'Espelho, bancada de mármore e peças de acrílico',
  },
  {
    id: 'silicone-uso-geral', categoria: 'selantes', imagem: 'silicone-uso-geral',
    nome: 'Silicone Uso Geral',
    chamada: 'Vedação transparente para a casa toda.',
    indicacao: 'Veda box, pias, cubas, vidros e ralos em materiais não porosos. Incolor.',
    diferenciais: ['Não encolhe', 'Não trinca nem amarela', 'Resiste à água e ao sol', '10 anos de garantia', '100% silicone'],
    comodos: ['lavanderia', 'jardim'], problema: 'Vedação do tanque, da pia e das janelas',
  },
  {
    id: 'silicone-banheiro-cozinha', categoria: 'selantes', imagem: 'silicone-banheiro-cozinha',
    nome: 'Silicone Banheiro e Cozinha',
    chamada: 'Junta limpa, sem mofo, por anos.',
    indicacao: 'Veda box, cubas, bacias sanitárias, pias e bancadas em materiais não porosos. Branco.',
    diferenciais: ['Não encolhe, trinca ou amarela', 'Resiste ao mofo e à limpeza diária', 'Resistente à água', '10 anos de garantia', '100% silicone'],
    comodos: ['banheiro', 'cozinha'], problema: 'Vaso, box e cuba com mofo e infiltração',
  },
  {
    id: 'acabamentos', categoria: 'selantes', imagem: 'acabamentos',
    nome: 'Selante Acrílico Acabamentos',
    chamada: 'A trinca some e não volta.',
    indicacao: 'Veda juntas, trincas e guarnições em ambientes internos. Aceita pintura.',
    diferenciais: ['Pintável', 'Antimofo', '10 anos de vedação garantida', 'Flexível, não deixa a trinca voltar'],
    // o produto é só para uso interno (ficha técnica): a frase não cita mais o muro
    comodos: ['sala', 'quarto'], problema: 'Trinca na parede e acabamento do rodapé',
  },
  {
    id: 'pu40', categoria: 'selantes', imagem: 'pu40',
    nome: 'Selante PU40',
    chamada: 'Veda e cola onde a casa se movimenta.',
    indicacao: 'Veda juntas de dilatação de baixo tráfego, calhas e telhados. Também cola.',
    diferenciais: ['Veda e cola', 'Resiste ao sol e à água', '5 anos de garantia', 'Acompanha a movimentação sem trincar'],
    comodos: [ 'jardim'], problema: 'Juntas do piso externo abrindo',
  },
  {
    id: 'pu-veda-calha', categoria: 'selantes', imagem: 'pu-veda-calha',
    nome: 'Selante PU Veda Calha',
    chamada: 'Calha sem goteira, faça sol ou chuva.',
    indicacao: 'Veda calhas, rufos e pingadeiras e fixa telhas, até em superfície molhada.',
    diferenciais: ['Veda e cola', 'Resiste ao sol e à chuva', 'Seguro para metais e PVC', 'Não encolhe, trinca ou cria bolhas'],
    comodos: ['telhado'], problema: 'Calha e rufo vazando',
  },
  {
    id: 'portas-janelas', categoria: 'selantes', imagem: 'portas-janelas', fotoAplicacao: false,
    nome: 'Selante Portas e Janelas',
    chamada: 'Vedação de longa duração em portas e janelas.',
    indicacao: 'Veda trincas superficiais e guarnições de portas e janelas. Somente uso interno.',
    diferenciais: ['Pintável', 'Antimofo', '10 anos de vedação garantida', 'Flexível, não deixa a trinca voltar'],
    // 'jardim' (área externa) saiu da lista: a ficha técnica indica uso interno. Ver o objeto
    // 'fachada-porta' em OBJETOS, que ficou como pendente até o técnico confirmar.
    comodos: ['sala'], problema: 'Fresta entre o batente da porta e a parede',
  },
  {
    id: 'silicone-construcao', categoria: 'selantes', imagem: 'silicone-construcao', fotoAplicacao: false,
    nome: 'Silicone Construção',
    chamada: 'Para vidros e esquadrias, dentro e fora de casa.',
    indicacao: 'Veda vidro, alumínio, porcelana, PVC e acrílico, dentro e fora de casa. Incolor.',
    diferenciais: ['5 anos de garantia', 'Multimaterial', 'Interior e exterior'],
    comodos: ['varanda'], problema: 'Vidros e esquadrias mal vedados',
  },
  {
    id: 'massa-calafetar', categoria: 'selantes', imagem: 'massa-calafetar', fotoAplicacao: false,
    nome: 'Massa para Calafetar',
    chamada: 'Fecha a fresta e não seca nunca.',
    indicacao: 'Veda frestas e orifícios contra água, ar, fumaça e ruído. Não seca nem endurece.',
    diferenciais: ['Plasticidade permanente', 'Resistente a agentes climáticos', 'Massa antirruído (vibração)', 'Veda odor e líquido'],
    comodos: ['garagem'], problema: 'Frestas no teto e no alçapão da garagem',
  },
  {
    id: 'cascorez-universal', categoria: 'pva', imagem: 'cascorez-universal', fotoAplicacao: false,
    nome: 'Cola Branca PVA Cascorez Universal',
    chamada: 'Uma cola branca para colar quase tudo.',
    indicacao: 'Colagem de madeira, laminados plásticos, papel, papelão e materiais porosos.',
    diferenciais: ['Mais cola, menos água', 'Alta durabilidade', 'Flexibilidade + força', 'Seca transparente'],
    comodos: ['quarto'], problema: 'Móveis e peças de madeira soltando',
  },
  {
    id: 'cascorez-artesanato', categoria: 'pva', imagem: 'cascorez-artesanato', fotoAplicacao: false,
    nome: 'Cola Branca PVA Cascorez Artesanato',
    chamada: 'Para criar, montar e dar acabamento.',
    indicacao: 'Para artesanato em papel, tecido, madeira, MDF, cortiça, couro e isopor.',
    diferenciais: ['Seca transparente, com alto brilho', 'Mais cola, menos água', 'Flexível depois de seco', 'Papel, tecido, madeira, MDF, isopor e mais'],
    comodos: ['sala'], problema: 'Quadro e peças de artesanato desmontando',
  },
  {
    id: 'reducola', categoria: 'contato', imagem: 'reducola', fotoAplicacao: false,
    nome: 'Reducola',
    chamada: 'O parceiro da cola de contato.',
    indicacao: 'Diluente: dilui cola de contato, prepara primer e limpa ferramentas. Inflamável.',
    diferenciais: ['Sem toluol', 'Compatível com as colas de contato Cascola', 'Sem cheiro após 10 min', 'Dilui, prepara primers e limpa ferramentas'],
    comodos: ['garagem'], problema: 'Cola de contato grossa e ferramentas sujas de cola',
  },
];

// Objetos da casa que recebem cada produto. São os pontos de aplicação dos arquivos .blend dos
// cômodos (coleção Pontos_Aplicacao). Cada entrada liga um objeto a um produto; um objeto que
// recebe dois produtos aparece duas vezes, uma para cada produto.
//   id       identificador único da entrada
//   produto  id do produto em PRODUTOS
//   comodo   id do cômodo em COMODOS (precisa estar no campo `comodos` do produto)
//   nome     nome do objeto, mostrado no menu
//   imagem   nome do arquivo em Img/objetos/, sem o .webp ('teste' = imagem provisória)
//   demo     id da demonstração 3D em fonte/demo/demos.js; sem ele, o botão fica como "Em breve"
//   pendente motivo pelo qual a aplicação ainda não pode aparecer no site (ex.: contradiz a ficha
//            técnica). Objetos com este campo ficam guardados aqui, mas o menu não mostra.
export const OBJETOS = [
  { id: 'cozinha-paneleiro', produto: 'contato-tradicional', comodo: 'cozinha', nome: 'Paneleiro laminado', imagem: 'teste' },
  { id: 'banheiro-fita-borda', produto: 'contato-extraforte', comodo: 'banheiro', nome: 'Fita de borda do gabinete', imagem: 'teste' },
  { id: 'quarto-sapato', produto: 'contato-extraforte', comodo: 'quarto', nome: 'Sola do tênis', imagem: 'teste' },
  { id: 'quarto-criado', produto: 'cola-madeira', comodo: 'quarto', nome: 'Gaveta do criado-mudo', imagem: 'teste' },
  { id: 'quarto-guarda-roupa', produto: 'cola-madeira', comodo: 'quarto', nome: 'Porta do guarda-roupa', imagem: 'teste' },
  { id: 'banheiro-gabinete', produto: 'cola-madeira', comodo: 'banheiro', nome: 'Lateral do gabinete', imagem: 'teste' },
  { id: 'cozinha-gaveta', produto: 'cola-madeira', comodo: 'cozinha', nome: 'Gaveta de MDF', imagem: 'teste' },
  { id: 'escritorio-estante', produto: 'pva-extraforte', comodo: 'escritorio', nome: 'Prateleira da estante', imagem: 'teste' },
  { id: 'cozinha-mesa', produto: 'pva-extraforte', comodo: 'cozinha', nome: 'Pé da mesa', imagem: 'teste' },
  { id: 'cozinha-cadeira', produto: 'pva-extraforte', comodo: 'cozinha', nome: 'Pé da cadeira', imagem: 'teste' },
  { id: 'sala-rodape-solto', produto: 'nao-mais-pregos', comodo: 'sala', nome: 'Rodapé', imagem: 'teste' },
  { id: 'sala-ripado', produto: 'nao-mais-pregos', comodo: 'sala', nome: 'Painel ripado', imagem: 'teste' },
  { id: 'sala-guarnicao', produto: 'nao-mais-pregos', comodo: 'sala', nome: 'Guarnição da porta', imagem: 'teste' },
  { id: 'banheiro-porta-toalha', produto: 'pl600', comodo: 'banheiro', nome: 'Porta-toalha', imagem: 'teste' },
  { id: 'banheiro-saboneteira', produto: 'pl600', comodo: 'banheiro', nome: 'Saboneteira', imagem: 'teste' },
  { id: 'fachada-pedra', produto: 'pl600', comodo: 'jardim', nome: 'Pedra do revestimento', imagem: 'teste' },
  { id: 'banheiro-espelho', produto: 'pl700', comodo: 'banheiro', nome: 'Espelho', imagem: 'espelho', demo: 'banheiro-espelho' },
  { id: 'banheiro-bancada', produto: 'pl700', comodo: 'banheiro', nome: 'Bancada de mármore', imagem: 'teste' },
  { id: 'lavanderia-tanque', produto: 'silicone-uso-geral', comodo: 'lavanderia', nome: 'Tanque', imagem: 'teste' },
  { id: 'fachada-janela', produto: 'silicone-uso-geral', comodo: 'jardim', nome: 'Janela da sala', imagem: 'teste' },
  { id: 'banheiro-vaso', produto: 'silicone-banheiro-cozinha', comodo: 'banheiro', nome: 'Vaso sanitário', imagem: 'vaso', demo: 'banheiro-vaso' },
  { id: 'banheiro-box', produto: 'silicone-banheiro-cozinha', comodo: 'banheiro', nome: 'Box', imagem: 'box', demo: 'banheiro-box' },
  { id: 'cozinha-cuba', produto: 'silicone-banheiro-cozinha', comodo: 'cozinha', nome: 'Cuba da cozinha', imagem: 'teste' },
  { id: 'sala-rodape-cordao', produto: 'acabamentos', comodo: 'sala', nome: 'Rodapé', imagem: 'teste' },
  { id: 'sala-batente-acabamentos', produto: 'acabamentos', comodo: 'sala', nome: 'Batente da porta', imagem: 'teste' },
  { id: 'quarto-trinca', produto: 'acabamentos', comodo: 'quarto', nome: 'Trinca na parede', imagem: 'teste' },
  { id: 'calcada-junta', produto: 'pu40', comodo: 'jardim', nome: 'Junta da calçada', imagem: 'teste' },
  { id: 'telhado-calha', produto: 'pu-veda-calha', comodo: 'telhado', nome: 'Emenda da calha', imagem: 'teste' },
  { id: 'sala-batente-portas', produto: 'portas-janelas', comodo: 'sala', nome: 'Batente da porta', imagem: 'teste' },
  { id: 'fachada-porta', produto: 'portas-janelas', comodo: 'jardim', nome: 'Batente da porta de entrada', imagem: 'teste',
    pendente: 'A ficha técnica do Portas & Janelas indica uso interno; este ponto fica na área externa. Confirmar com o técnico.' },
  { id: 'varanda-guarda-corpo', produto: 'silicone-construcao', comodo: 'varanda', nome: 'Guarda-corpo da varanda', imagem: 'teste' },
  { id: 'garagem-alcapao', produto: 'massa-calafetar', comodo: 'garagem', nome: 'Alçapão', imagem: 'teste' },
  { id: 'quarto-banco', produto: 'cascorez-universal', comodo: 'quarto', nome: 'Banco ripado', imagem: 'teste' },
  { id: 'sala-quadro', produto: 'cascorez-artesanato', comodo: 'sala', nome: 'Quadro de quebra-cabeça', imagem: 'teste' },
  { id: 'garagem-ferramentas', produto: 'reducola', comodo: 'garagem', nome: 'Pincel e espátula sujos de cola', imagem: 'teste' },
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
