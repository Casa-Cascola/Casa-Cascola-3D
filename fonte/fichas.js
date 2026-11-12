// Dados técnicos de cada produto, mostrados na área "Ficha do produto", abaixo da casa.
//   resumo    o que é o produto, em uma ou duas frases
//   numeros   os 3 ou 4 números de destaque: [valor, unidade, o que é]
//   materiais onde adere (viram as etiquetas de "Onde usar")
//   usos      exemplos de uso (frase opcional abaixo das etiquetas)
//   passos    como aplicar, em ordem
//   atencao   limitações e cuidados
//   dados     tabela de dados técnicos: [nome, valor]

const FDT = 'https://datasheets.tdx.henkel.com/';
const ARMAZENAR = 'Local coberto e ventilado, entre 5 °C e 30 °C';
const NAO_ADERE = 'Não adere a polietileno, polipropileno, silicone e PTFE (antiaderente).';
const NAO_ADERE_SELANTE = 'Não adere a polietileno, polipropileno e PTFE (antiaderente).';
const CARTUCHO = 'Corte a ponta do cartucho, rosqueie o bico e corte o bico em diagonal (45°). Encaixe na pistola aplicadora.';

export const FICHAS = {
  'contato-tradicional': {
    resumo: 'Adesivo de contato à base de policloropreno, com alto rendimento e mais tempo de trabalho. Pode ser aplicado com espátula, pincel ou pistola.',
    numeros: [
      ['5–10', 'min', 'Secagem antes de unir as peças'],
      ['90', 'min', 'Tempo em aberto depois da secagem'],
      ['140–175', 'g/m²', 'Rendimento com pincel, nas duas superfícies'],
    ],
    materiais: ['Madeira', 'Compensado', 'Lâminas decorativas', 'Couro', 'Espuma', 'Vidro', 'Carpete'],
    usos: 'Também cola esses materiais sobre cimento, cerâmica e madeira.',
    passos: [
      'Deixe as superfícies firmes, limpas e secas, sem poeira, óleo ou graxa. Lixe se precisar.',
      'Mexa bem o produto, até o fundo da embalagem.',
      'Aplique nas duas partes com espátula e aguarde de 5 a 10 minutos.',
      'Alinhe as peças na posição exata e pressione do centro para as bordas, para não formar bolhas.',
      'Em materiais porosos, faça uma segunda aplicação de 20 a 30 minutos depois da primeira.',
      'Para pincel ou pistola, dilua com Cascola Reducola sem Toluol (de 10:1 a 10:5) e aguarde de 10 a 15 minutos antes de unir.',
    ],
    atencao: [
      'Produto inflamável: mantenha longe de calor, faíscas e chamas.',
      'Aplique em local arejado, com luvas e óculos de proteção.',
      'Não é indicado para colar espelhos.',
      NAO_ADERE,
      'Faça um teste antes: os solventes podem agredir alguns materiais.',
    ],
    dados: [
      ['Base química', 'Policloropreno e solventes orgânicos, sem toluol'],
      ['Aspecto', 'Líquido viscoso amarelado, sem grumos'],
      ['Teor de sólidos', '19 a 22 %'],
      ['Viscosidade Brookfield', '700 a 900 cPs'],
      ['Rendimento (superfície dupla)', 'Espátula: 200 a 250 g/m². Pincel: 140 a 175 g/m²'],
      ['Embalagens', '195 g, 400 g, 730 g, 2,8 kg e 14 kg'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR + ', com a embalagem bem fechada'],
    ],
    fonte: { nome: 'Cascola Tradicional sem Toluol', url: FDT + 'CASCOLA-TRADICIONAL-pt_BR.pdf' },
  },

  'contato-extraforte': {
    resumo: 'Adesivo de contato de alta performance, com maior poder de adesão. Indicado para colagens curvas e para vários materiais. Fica sem cheiro depois de 10 minutos.',
    numeros: [
      ['5–10', 'min', 'Secagem antes de unir as peças'],
      ['60', 'min', 'Tempo em aberto'],
      ['270–320', 'g/m²', 'Rendimento, nas duas superfícies'],
    ],
    materiais: ['Madeira', 'Compensado', 'Lâminas decorativas', 'Couro', 'Espuma', 'Vidro'],
    usos: 'Também cola esses materiais sobre cimento, cerâmica e madeira.',
    passos: [
      'Deixe as superfícies firmes, limpas e secas, sem poeira, óleo ou graxa. Lixe se precisar.',
      'Aplique nas duas partes e aguarde de 5 a 10 minutos.',
      'Alinhe as peças na posição exata e pressione do centro para as bordas, para não formar bolhas.',
      'Em materiais porosos, faça uma segunda aplicação de 20 a 30 minutos depois da primeira.',
      'Em borrachas sintéticas e plásticos, teste antes, lixe e, se precisar, aplique duas demãos.',
      'Feche a embalagem logo depois do uso.',
    ],
    atencao: [
      'Produto inflamável: mantenha longe de calor, faíscas e chamas.',
      'Aplique em local arejado, com luvas e óculos de proteção.',
      'Não é indicado para colar espelhos: pode atacar a camada protetora.',
      NAO_ADERE,
      'Faça um teste antes: os solventes podem agredir alguns materiais.',
    ],
    dados: [
      ['Base química', 'Policloropreno e solventes orgânicos, sem toluol'],
      ['Aspecto', 'Líquido viscoso amarelado, sem grumos'],
      ['Teor de sólidos', '21 a 24 %'],
      ['Viscosidade Brookfield', '2.200 a 3.000 cPs'],
      ['Embalagens', '30 g, 195 g, 730 g, 2,8 kg e 14 kg'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR + ', em lugar seco'],
    ],
    fonte: { nome: 'Cascola Extra sem Toluol', url: FDT + 'CASCOLA-Extra-Sem-Toluol-pt_BR.pdf' },
  },

  'cola-madeira': {
    resumo: 'Adesivo PVA em dispersão aquosa, com alta força de colagem, flexível e com pega inicial. Feito para reparos rápidos e consertos de móveis de madeira.',
    numeros: [
      ['D2', '', 'Classe de colagem, norma EN 204'],
      ['5', 'min', 'Tempo máximo entre aplicar e prensar'],
      ['24', 'h', 'Espera antes de a peça receber esforço'],
    ],
    materiais: ['Madeira', 'Aglomerado', 'Tacos e parquetes', 'Cavilhas e encaixes', 'Finger joints', 'Papel e papelão'],
    passos: [
      'Deixe as superfícies firmes, limpas e secas, sem poeira, óleo ou graxa. Lixe se precisar.',
      'Confira a umidade da madeira: o ideal é entre 8 % e 15 %.',
      'Aplique em uma das superfícies, em camada uniforme.',
      'Junte as partes logo em seguida, em até 5 minutos.',
      'Mantenha as peças prensadas até a secagem completa.',
      'Aguarde 24 horas antes de a peça receber esforço.',
    ],
    atencao: [
      'Evite o contato da cola ainda úmida com ferro: a linha de colagem escurece.',
      NAO_ADERE,
      'Aplique em local arejado.',
    ],
    dados: [
      ['Base química', 'Poliacetato de vinila (PVAc), em dispersão aquosa'],
      ['Classe de colagem', 'D2, conforme EN 204'],
      ['Teor de sólidos', '45 a 47 %'],
      ['pH', '4,0 a 5,0'],
      ['Embalagens', '100 g, 250 g, 1 kg e 5 kg'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR],
    ],
    fonte: { nome: 'Cascola Cascorez Cola Madeira', url: 'https://dm.henkel-dam.com/is/content/henkel/Rev.00-22_-Cascola-Cascorez-Cola-Madeira-' },
  },

  'pva-extraforte': {
    resumo: 'Adesivo PVA em dispersão aquosa, extraforte, flexível e de secagem transparente. Para montagem e laminação de madeiras de baixa, média e alta densidade.',
    numeros: [
      ['D1', '', 'Classe de colagem, norma EN 204'],
      ['3–4', 'h', 'Prensagem a frio na montagem de painéis'],
      ['24', 'h', 'Cura mínima na montagem a frio'],
      ['160–200', 'g/m²', 'Rendimento em montagem'],
    ],
    materiais: ['Madeiras de baixa, média e alta densidade', 'Laminados plásticos', 'Papel e papelão', 'Tecido', 'Cortiça', 'Couro', 'Gesso'],
    passos: [
      'Deixe as superfícies firmes, limpas e secas, sem poeira, óleo ou graxa. Lixe se precisar.',
      'Use madeira com umidade entre 8 % e 15 %, e peças com a mesma umidade entre si.',
      'Aplique em uma das superfícies, em camada uniforme, com trincha, rolo, espátula ou coladeira.',
      'Junte as partes logo em seguida, em até 5 minutos.',
      'Prense a frio por 3 a 4 horas, com pressão de 6 a 20 kg/cm², conforme a densidade da madeira.',
      'Aguarde 24 horas de cura antes de a peça receber esforço.',
    ],
    atencao: [
      'Evite o contato da cola ainda úmida com ferro: a linha de colagem escurece.',
      'Não devolva sobras para a embalagem.',
      'Não é aconselhável colar madeiras de alta densidade em prensas de alta frequência.',
      NAO_ADERE,
    ],
    dados: [
      ['Base química', 'Poliacetato de vinila (PVAc), em dispersão aquosa'],
      ['Aspecto', 'Líquido branco e viscoso. Depois de seco, filme transparente'],
      ['Classe de colagem', 'D1, conforme EN 204'],
      ['Teor de sólidos', '44 a 46 %'],
      ['pH', '4,0 a 5,0'],
      ['Rendimento', 'Montagem: 160 a 200 g/m². Laminação: 100 a 150 g/m²'],
      ['Temperatura de colagem', 'A frio: acima de 12 °C. A quente: de 60 a 90 °C'],
      ['Embalagens', '100 g, 250 g, 500 g, 1 kg, 5 kg, 10 kg e 20 kg'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR],
    ],
    fonte: { nome: 'Cascola Cascorez Extra', url: FDT + 'CASCOLA-Cascorez-Extra-pt_BR.pdf' },
  },

  'nao-mais-pregos': {
    resumo: 'Adesivo de montagem para uso interno, de alta resistência e pega imediata, que não escorre. Base água, sem solventes.',
    numeros: [
      ['700', 'kg/10 cm²', 'Resistência de até 700 kgf em 10 cm², após 24 h (madeira com madeira)'],
      ['10', 'min', 'Tempo para ajustar a peça'],
      ['24–72', 'h', 'Cura total'],
      ['−20 a 80', '°C', 'Temperatura de serviço'],
    ],
    materiais: ['Madeira', 'Metal', 'Cerâmica e porcelana', 'Concreto e tijolo', 'Gesso e drywall', 'Pedra', 'Vidro', 'Plásticos', 'Cortiça', 'Isopor'],
    usos: 'Rodapés, guarnições, molduras, florões, arandelas, azulejos, canaletas e cantoneiras.',
    passos: [
      'Deixe as superfícies firmes, limpas e secas, sem poeira, óleo ou graxa. Lixe pinturas em mau estado.',
      CARTUCHO,
      'Aplique em cordões verticais. Para peças leves, pode ser em pontos.',
      'Junte as partes e pressione com firmeza. Você tem até 10 minutos para ajustar.',
      'Em peças pesadas, use um apoio (fita ou calço) até a colagem firmar.',
      'Tire o excesso com pano úmido, antes de secar. Depois de seco, pode pintar.',
    ],
    atencao: [
      'Só para uso interno.',
      'Pelo menos uma das superfícies precisa ser porosa.',
      'Não é recomendado para colar espelhos.',
      'Não use em aplicações submersas.',
      NAO_ADERE,
    ],
    dados: [
      ['Base química', 'Resina acrílica em base aquosa'],
      ['Aspecto', 'Pasta branca e homogênea'],
      ['Teor de sólidos', 'Cerca de 66 %'],
      ['Resistência ao cisalhamento', '500 a 700 kgf/10 cm², após 24 h (madeira com madeira)'],
      ['Tempo em aberto', 'Até 10 minutos'],
      ['Rendimento', 'Cartucho de 360 g: cerca de 25 m com cordão de 4 mm. Bisnaga de 85 g: cerca de 1,5 m com cordão de 8 mm'],
      ['Embalagens', 'Cartucho de 360 g e bisnaga de 85 g'],
      ['Validade', '36 meses'],
      ['Armazenamento', ARMAZENAR],
    ],
    fonte: { nome: 'Cascola Não Mais Pregos', url: FDT + 'CASCOLA-No-Mais-Pregos-pt_BR.pdf' },
  },

  pl600: {
    resumo: 'Adesivo de montagem para uso interno e externo, com agarre imediato, que não escorre. Tem alta resistência à umidade e aceita pintura depois de seco.',
    numeros: [
      ['50–70', 'kgf/cm²', 'Resistência ao cisalhamento após 24 h (madeira com madeira)'],
      ['5', 'min', 'Tempo para ajustar a peça'],
      ['24–72', 'h', 'Cura total'],
      ['−20 a 80', '°C', 'Temperatura de serviço'],
    ],
    materiais: ['Metal', 'Madeira', 'Concreto', 'Cerâmica e porcelana', 'Vidro', 'Borracha', 'Plásticos'],
    usos: 'Rodapés, guarnições, molduras, arandelas, azulejos, ladrilhos, canaletas e cantoneiras, sem furos, pregos ou parafusos.',
    passos: [
      'Deixe as superfícies firmes, limpas e secas, sem poeira, óleo ou graxa. Lixe pinturas em mau estado.',
      CARTUCHO,
      'Aplique em cordões verticais. Para peças leves, pode ser em pontos.',
      'Junte as partes e pressione com firmeza. Você tem até 5 minutos para ajustar.',
      'Em peças pesadas, use um apoio (fita ou calço) até a colagem firmar.',
      'Tire o excesso com pano umedecido em álcool, antes de secar.',
    ],
    atencao: [
      'Produto inflamável: mantenha longe de calor e de fontes de ignição.',
      'Aplique em local arejado.',
      'Não é recomendado para espelhos, isopor e tecidos.',
      'Não use em aplicações submersas.',
      NAO_ADERE,
    ],
    dados: [
      ['Base química', 'Borrachas sintéticas e solventes orgânicos'],
      ['Aspecto', 'Pasta bege e homogênea'],
      ['Teor de sólidos', 'Cerca de 70 %'],
      ['Tempo em aberto', 'Até 5 minutos'],
      ['Rendimento', 'Cartucho de 375 g: cerca de 23 m com cordão de 4 mm, ou 3 m com cordão de 10 mm'],
      ['Embalagem', 'Cartucho de 375 g'],
      ['Validade', '18 meses'],
      ['Armazenamento', ARMAZENAR + ', longe de calor'],
    ],
    fonte: { nome: 'Cascola PL600', url: FDT + 'CASCOLA-PL600-pt_BR.pdf' },
  },

  pl700: {
    resumo: 'Adesivo e selante multifuncional, transparente e sem solventes. Une, fixa, veda e preenche, pode ser aplicado em superfície molhada e resiste aos raios UV.',
    numeros: [
      ['10', 'min', 'Tempo para ajustar a peça'],
      ['10–20', 'min', 'Formação de pele'],
      ['24–72', 'h', 'Cura total'],
      ['−30 a 80', '°C', 'Temperatura de serviço'],
    ],
    materiais: ['Espelhos', 'Vidro', 'Acrílico', 'Metal', 'Porcelana', 'Madeira', 'Concreto', 'PVC', 'Gesso acartonado', 'Isopor', 'Telhas'],
    usos: 'Tampos de vidro, painéis decorativos, blocos de vidro, placas de acrílico e espelhos, em áreas internas e externas.',
    passos: [
      'Limpe a superfície: sem poeira, óleo ou graxa. Lixe pinturas em mau estado.',
      CARTUCHO,
      'Para colar, aplique em cordões verticais. Para peças leves, pode ser em pontos.',
      'Pressione até o produto se espalhar por igual. Você tem até 10 minutos para ajustar.',
      'Em peças pesadas, use um apoio até a colagem firmar.',
      'Para vedar, aplique um cordão contínuo e alise com espátula. Se usar fita crepe, tire antes de formar película.',
    ],
    atencao: [
      'Não use em aplicações submersas nem em aquários.',
      'Não é recomendado para contato com alimentos ou água potável.',
      'Só pinte depois da cura total, e faça um teste antes.',
      NAO_ADERE_SELANTE,
    ],
    dados: [
      ['Base química', 'Polímero modificado por silano'],
      ['Aspecto', 'Pasta incolor. Depois de curado, filme transparente e flexível'],
      ['Dureza', '40 Shore A'],
      ['Rendimento', 'Cartucho de 290 g: cerca de 16 m com cordão de 4 mm'],
      ['Embalagem', 'Cartucho de 290 g'],
      ['Validade', '15 meses'],
      ['Armazenamento', ARMAZENAR],
    ],
    fonte: { nome: 'Cascola PL700', url: FDT + 'CASCOLA-PL700-pt_BR.pdf' },
  },

  'silicone-uso-geral': {
    resumo: 'Selante 100 % silicone, de cura acética, com fungicida. Incolor, não encolhe e tem 10 anos de garantia. Para uso interno e externo em materiais não porosos.',
    numeros: [
      ['5–10', 'min', 'Formação de pele'],
      ['2–3', 'mm/dia', 'Velocidade de cura'],
      ['−30 a 120', '°C', 'Temperatura de serviço'],
      ['10', 'anos', 'Garantia'],
    ],
    materiais: ['Vidro', 'Alumínio', 'Porcelana', 'PVC', 'Acrílico'],
    usos: 'Box de banheiro, cubas, pias e bancadas, encanamentos e ralos, vidros e vitrines.',
    passos: [
      'Limpe a superfície com álcool doméstico. Tire todo o resto de produto antigo.',
      CARTUCHO,
      'Se quiser, proteja as bordas com fita crepe.',
      'Aplique um cordão contínuo. Água com detergente neutro ajuda a alisar.',
      'Tire a fita crepe antes de formar película.',
      'Remova o excesso na hora, com álcool. Depois de curado, só sai raspando.',
    ],
    atencao: [
      'Não use em aquários: o produto tem fungicida.',
      'Não é indicado para pedras naturais, madeira e metais como latão, ferro e chumbo.',
      'Não é recomendado para colar espelhos.',
      'Não aceita pintura.',
      'Aplique em local arejado: tem cheiro de vinagre enquanto cura.',
      NAO_ADERE_SELANTE,
    ],
    dados: [
      ['Base química', 'Borracha de silicone, cura acética, com fungicida'],
      ['Aspecto', 'Pasta incolor. Depois de curado, borracha incolor'],
      ['Dureza', 'Cerca de 27 Shore A'],
      ['Cura total', '24 a 72 horas'],
      ['Rendimento', 'Cartucho de 252 g: cerca de 20 m com cordão de 4 mm. Bisnaga de 50 g: cerca de 3,5 m'],
      ['Embalagens', 'Cartucho de 252 g e bisnaga de 50 g'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR],
    ],
    fonte: { nome: 'Cascola Uso Geral', url: FDT + 'CASCOLA-Uso-Geral-pt_BR.pdf' },
  },

  'silicone-banheiro-cozinha': {
    resumo: 'Selante 100 % silicone, de cura acética, com fungicida. Não encolhe, não amarela e tem 10 anos de garantia. Para as áreas molhadas da casa.',
    numeros: [
      ['5–10', 'min', 'Formação de pele'],
      ['2–3', 'mm/dia', 'Velocidade de cura'],
      ['−30 a 120', '°C', 'Temperatura de serviço'],
      ['10', 'anos', 'Garantia'],
    ],
    materiais: ['Vidro', 'Alumínio', 'Porcelana', 'PVC', 'Acrílico'],
    usos: 'Box, cubas e bacias sanitárias, pias e bancadas, encanamentos e ralos.',
    passos: [
      'Limpe a superfície com álcool doméstico. Tire todo o resto de produto antigo.',
      CARTUCHO,
      'Se quiser, proteja as bordas com fita crepe.',
      'Aplique um cordão contínuo. Água com detergente neutro ajuda a alisar.',
      'Tire a fita crepe antes de formar película.',
      'Remova o excesso na hora, com álcool. Depois de curado, só sai raspando.',
    ],
    atencao: [
      'Não use em aquários: o produto tem fungicida.',
      'Não é indicado para pedras naturais, madeira e metais como latão, ferro e chumbo.',
      'Não é recomendado para colar espelhos.',
      'Não aceita pintura.',
      'Aplique em local arejado: tem cheiro de vinagre enquanto cura.',
      NAO_ADERE_SELANTE,
    ],
    dados: [
      ['Base química', 'Borracha de silicone, cura acética, com fungicida'],
      ['Aspecto', 'Pasta branca. Depois de curado, borracha branca e flexível'],
      ['Dureza', 'Cerca de 27 Shore A'],
      ['Cura total', '24 a 72 horas'],
      ['Rendimento', 'Cartucho de 280 g: cerca de 23 m com cordão de 4 mm. Bisnaga de 50 g: cerca de 4 m'],
      ['Embalagens', 'Cartucho de 280 g e bisnaga de 50 g'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR],
    ],
    fonte: { nome: 'Cascola Banheiro e Cozinha', url: FDT + 'CASCOLA-Banheiro-e-Cozinha-pt_BR.pdf' },
  },

  // Lançamento de 2025: a Henkel ainda não publicou a ficha técnica deste produto.
  // Os dados abaixo vêm da placa e do comunicado de lançamento. Complete quando a ficha sair.
  acabamentos: {
    resumo: 'Selante acrílico para vedar interiores e dar acabamento uniforme. Não trinca, aceita pintura e tem ação antimofo.',
    numeros: [
      ['10', 'anos', 'Vedação garantida'],
    ],
    materiais: ['Trincas e fissuras de parede', 'Rodapés', 'Guarnições de portas e janelas'],
    usos: 'Fecha frestas por onde entram poeira e insetos.',
    passos: [
      'Deixe a superfície firme, limpa e seca, sem poeira nem resto de produto antigo.',
      CARTUCHO,
      'Aplique um cordão contínuo sobre a trinca ou a junta.',
      'Alise com espátula e tire o excesso antes de secar.',
      'Espere secar bem antes de pintar.',
    ],
    atencao: [
      'Para uso em interiores.',
      'Antes de aplicar, leia as instruções da embalagem.',
    ],
    dados: [
      ['Base química', 'Acrílica'],
      ['Uso', 'Interno'],
      ['Pintura', 'Aceita pintura'],
      ['Proteção', 'Ação antimofo e antifúngica'],
      ['Odor', 'Suave'],
      ['Garantia', '10 anos de vedação'],
    ],
    fonte: {
      nome: 'Comunicado de lançamento (Feicon 2025)',
      url: 'https://www.henkel.com.br/imprensa-midia/press-releases-e-kits/2025-04-04-cascola-celebra-70-anos-no-brasil-2050634',
    },
  },

  pu40: {
    resumo: 'Selante e adesivo multifuncional para construção, de uso interno e externo. Resiste às intempéries, não encolhe nem resseca, aceita pintura e não tem solventes.',
    numeros: [
      ['250', '%', 'Alongamento até a ruptura'],
      ['20–60', 'min', 'Formação de pele'],
      ['2–3', 'mm/dia', 'Velocidade de cura'],
      ['−40 a 80', '°C', 'Temperatura de serviço'],
    ],
    materiais: ['Concreto', 'Pedra', 'Madeira', 'Metal', 'Vidro', 'Telhas', 'Acrílico'],
    usos: 'Juntas de dilatação de baixo tráfego em pisos, rodapés e paredes. Vedação de portas, janelas, tubulações, calhas, rufos e telhados.',
    passos: [
      'Deixe as superfícies firmes e limpas, sem óleo, graxa ou poeira. Não use querosene nem gasolina.',
      CARTUCHO,
      'Proteja com fita crepe as áreas que não devem receber produto.',
      'Para vedar, aplique um cordão contínuo. Um tubo de espuma de polietileno ajuda a dar a medida da junta.',
      'Alise com espátula e tire a fita crepe antes de formar película.',
      'Para colar, aplique em cordões verticais e pressione. Você tem até 15 minutos para ajustar.',
    ],
    atencao: [
      'Não use em aplicações estruturais.',
      'Não use em aplicações submersas nem em aquários.',
      'Não é recomendado para contato com alimentos ou água potável.',
      'Só pinte depois da cura total, e faça um teste antes.',
      NAO_ADERE_SELANTE,
    ],
    dados: [
      ['Base química', 'Poliuretano modificado'],
      ['Cores', 'Branco e cinza'],
      ['Dureza', '40 ± 3 Shore A'],
      ['Alongamento', 'Cerca de 250 % até a ruptura'],
      ['Cura total', '24 a 72 horas'],
      ['Rendimento', 'Cartucho de 380 g: cerca de 2,35 m em junta de 10 × 10 mm'],
      ['Embalagem', 'Cartucho de 380 g'],
      ['Validade', '15 meses'],
      ['Armazenamento', ARMAZENAR],
    ],
    fonte: { nome: 'Cascola PU 40', url: FDT + 'CASCOLA-PU-40-pt_BR.pdf' },
  },

  'pu-veda-calha': {
    resumo: 'Selante para calhas, rufos e pingadeiras, de uso interno e externo. Não agride metais, pode ser aplicado em superfície molhada, não tem solventes e resiste ao clima.',
    numeros: [
      ['10–30', 'min', 'Formação de pele'],
      ['24–72', 'h', 'Cura total'],
      ['15', 'm', 'Rendimento do cartucho, com cordão de 4 mm'],
    ],
    materiais: ['Aço galvanizado', 'Fibrocimento', 'Cerâmica', 'Madeira', 'Concreto', 'PVC'],
    usos: 'Emendas de calhas, rufos e pingadeiras, fixação de telhas e vedação de furos.',
    passos: [
      'Limpe a superfície com álcool doméstico: sem poeira, óleo ou graxa. Não use querosene nem gasolina.',
      CARTUCHO,
      'Aplique um cordão contínuo sobre a emenda.',
      'Alise com espátula e tire o excesso.',
      'Se usar fita crepe, tire antes de formar película.',
      'Remova o excesso na hora, com álcool. Depois de curado, só sai raspando.',
    ],
    atencao: [
      'Não use em aplicações submersas nem em aquários.',
      'Não é recomendado para contato com alimentos ou água potável.',
      'Só pinte depois da cura total, e faça um teste antes.',
      NAO_ADERE_SELANTE,
    ],
    dados: [
      ['Aspecto', 'Pasta cinza. Depois de curado, borracha cinza e flexível'],
      ['Dureza', '35 ± 5 Shore A'],
      ['Rendimento', 'Cartucho de 320 g: cerca de 15 m com cordão de 4 mm'],
      ['Embalagem', 'Cartucho de 320 g'],
      ['Validade', '15 meses'],
      ['Armazenamento', 'Local coberto e ventilado, entre 10 °C e 35 °C'],
    ],
    fonte: { nome: 'Cascola Veda Calha', url: FDT + 'CASCOLA-Veda-Calha-pt_BR.pdf' },
  },

  'cascorez-universal': {
    resumo: 'Adesivo PVA em dispersão aquosa, com elevado poder de adesão. Seca transparente e deixa uma película flexível. Para colagens em geral e montagem de painéis de madeira.',
    numeros: [
      ['D1', '', 'Classe de colagem, norma EN 204'],
      ['36–39', '%', 'Teor de sólidos'],
      ['24', 'meses', 'Validade'],
    ],
    materiais: ['Madeira', 'Laminados plásticos', 'Papel e papelão', 'Materiais porosos'],
    usos: 'Montagem de painéis de madeira, laminação e colagem de finger joint.',
    atencao: [NAO_ADERE, 'Não é inflamável.'],
    dados: [
      ['Base química', 'Poliacetato de vinila (PVAc), em dispersão aquosa'],
      ['Classe de colagem', 'D1, conforme EN 204'],
      ['Teor de sólidos', '36 a 39 %'],
      ['pH', '4,0 a 5,0'],
      ['Validade', '24 meses'],
    ],
    fonte: { nome: 'Cascola Cascorez Universal', url: FDT + 'CASCOLA-Cascorez-Universal-pt_BR.pdf' },
  },

  'cascorez-artesanato': {
    resumo: 'Adesivo PVA em dispersão aquosa para artesanato. Seca transparente, com brilho intenso e película flexível, e tem boa consistência e textura.',
    numeros: [
      ['38–40', '%', 'Teor de sólidos'],
      ['4–5', '', 'pH'],
      ['24', 'meses', 'Validade'],
    ],
    materiais: ['Papel e papelão', 'Tecido de algodão', 'Madeira e MDF', 'Cortiça', 'Couro', 'E.V.A. e isopor'],
    usos: 'Decoupage, scrapbook, patchwork, mosaico, cartonagem, biscuit e outras técnicas de artesanato.',
    atencao: [NAO_ADERE, 'Não é inflamável.'],
    dados: [
      ['Base química', 'Poliacetato de vinila (PVAc), em dispersão aquosa'],
      ['Teor de sólidos', '38 a 40 %'],
      ['pH', '4,0 a 5,0'],
      ['Validade', '24 meses'],
    ],
    fonte: { nome: 'Cascola Cascorez Artesanato', url: FDT + 'CASCOLA-Cascorez-Artesanato-pt_BR.pdf' },
  },

  'massa-calafetar': {
    resumo: 'Massa pronta para uso, à base de resinas sintéticas e cargas minerais. Tem plasticidade permanente: não seca nem endurece. Veda frestas e orifícios por dentro e por fora.',
    numeros: [
      ['120', '°C', 'Temperatura máxima de aplicação'],
      ['350', 'g', 'Embalagem'],
      ['24', 'meses', 'Validade'],
    ],
    materiais: ['Madeira', 'Granito', 'Alumínio', 'Vidro', 'Porcelana', 'Cimento', 'Telhas', 'Fibrocimento'],
    usos: 'Bloqueia água, umidade, ar, fumaça e ruído, inclusive em peças que vibram, como ar-condicionado e geladeira.',
    atencao: ['Não serve como adesivo para colar materiais.', NAO_ADERE, 'Não contém amianto.'],
    dados: [
      ['Base química', 'Resinas sintéticas e cargas minerais'],
      ['Aspecto', 'Massa compacta e homogênea, cinza claro'],
      ['Embalagem', '350 g'],
      ['Validade', '24 meses'],
    ],
    fonte: { nome: 'Cascola Massa para Calafetar', url: FDT + 'CASCOLA-Massa-para-Calafetar-pt_BR.pdf' },
  },

  reducola: {
    resumo: 'Diluente à base de solventes orgânicos, sem toluol. Dilui, prepara primers e limpa superfícies e ferramentas. Compatível com a Cola de Contato Tradicional e a Extra, sem toluol.',
    numeros: [
      ['0,9', 'L', 'Embalagem'],
      ['24', 'meses', 'Garantia'],
    ],
    atencao: ['A inalação frequente em concentrações elevadas é prejudicial à saúde. Use em local ventilado.'],
    dados: [
      ['Composição', 'Diluente à base de solventes orgânicos, sem toluol'],
      ['Evaporação', 'Rápida'],
      ['Odor', 'Médio'],
      ['Validade', '24 meses'],
    ],
    fonte: { nome: 'Cascola Reducola', url: 'https://www.telhanorte.com.br/reducola-sem-toluol-900ml-cascola-1195026/p' },
  },

  'portas-janelas': {
    resumo: 'Selante da linha Cascola para portas e janelas, de longa duração. É pintável, serve para vários materiais e tem proteção antimofo e fungos.',
    atencao: ['Dados técnicos completos: consulte a embalagem (280 g) e o QR code com dicas de uso.'],
    dados: [['Embalagem', 'Cartucho de 280 g, branco']],
  },

  'silicone-construcao': {
    resumo: 'Silicone transparente da linha Cascola para construção, de uso interno e externo e para vários materiais. Indicado para vidros e esquadrias.',
    atencao: ['Dados técnicos completos: consulte a embalagem (280 g) e o QR code com dicas de uso.'],
    dados: [['Embalagem', 'Cartucho de 280 g, transparente']],
  },
};
