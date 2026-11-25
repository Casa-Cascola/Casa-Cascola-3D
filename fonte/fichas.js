// Conteúdo da área "Ver detalhes" (section data-ficha, abaixo da casa): um resumo técnico do produto.
// Fonte: as Folhas de Dados Técnicos oficiais (Henkel, Rev.00/26) da pasta FichaTecnica/.
// O resumo traz só o que o consumidor usa numa consulta rápida e o que evita erro de aplicação.
// Tabelas, combinações de parâmetros e procedimentos especiais ficam na ficha oficial (botão do PDF).
// Nada aqui pode ser preenchido "por semelhança" com outro produto: cada valor vem da ficha do próprio
// produto. O que a ficha não traz fica de fora e entra em `pendencias`.
//
//   tipo        o tipo de produto, como está no topo da ficha técnica (ex.: "Adesivo de contato")
//   nomeFicha   o nome do produto na ficha técnica (pode ser diferente do nome usado no site)
//   pdf         nome do arquivo da ficha técnica oficial dentro de FichaTecnica/
//   resumo      o que é o produto, em uma ou duas frases (sem repetir as listas abaixo)
//   numeros     os números de destaque: [valor, unidade, o que é]
//   condicoes   em que condições os tempos foram medidos (nota abaixo dos números)
//   materiais   onde o produto adere/é indicado (viram as etiquetas de "Onde usar")
//   usos        principais aplicações (frase abaixo das etiquetas)
//   passos      modo de aplicação resumido, em ordem
//   extras      outras formas de aplicação, só citadas, com remissão à ficha: [{ titulo, itens: [...] }]
//   tabelas     tabelas da ficha (não usadas no resumo; o detalhes.js ainda sabe montá-las)
//   atencao     restrições e cuidados específicos do produto
//   dados       dados técnicos resumidos: [nome, valor]
//   pendencias  o que precisa de confirmação do técnico. Só aparece na tela com ?revisao no endereço.

const REVISAO = 'Rev.00/26';

// Frases que aparecem iguais em várias fichas (o texto foi conferido em cada uma delas)
const NAO_ADERE = 'Não adere a polietileno, polipropileno, silicone e PTFE (resina antiaderente).';
const NAO_ADERE_PLASTICOS = 'Não adere a plásticos à base de polietileno, polipropileno, silicone e PTFE (resina antiaderente).';
const NAO_ADERE_SELANTE = 'Não adere a polietileno, polipropileno e PTFE (resina antiaderente).';
const ARMAZENAR_5_30 = 'Local coberto e ventilado, protegido de intempéries, entre 5 °C e 30 °C';
const COND_23 = 'Tempos medidos a 23 ± 2 °C e 45 ± 5 % de umidade relativa do ar. Podem variar com a quantidade aplicada, o tipo de superfície, a temperatura e a umidade.';

// Para os PVA de montagem: as tabelas de prensagem ficam só na ficha (pedido do cliente)
const CONDICOES_PRENSAGEM = {
  titulo: 'Condições de aplicação',
  itens: ['Consulte a ficha técnica para verificar os parâmetros de pressão, temperatura, prensagem e cura adequados a cada tipo de madeira e processo (montagem de painéis, laminação e finger joint).'],
};
// Fita de borda: as duas colas de contato têm um procedimento próprio na ficha, com a mesma espera de 24 h
const FITA_DE_BORDA = {
  titulo: 'Fita de borda',
  itens: ['A ficha técnica traz um procedimento específico para fita de borda. Recomenda-se aguardar 24 horas antes de dar acabamento ou de submeter a peça a esforço.'],
};

export const FICHAS = {
  'contato-tradicional': {
    tipo: 'Adesivo de contato',
    nomeFicha: 'Cascola Tradicional Sem Toluol',
    pdf: 'Rev.00-26 - Cascola Tradicional Sem Toluol.pdf',
    resumo: 'Adesivo de contato à base de policloropreno e solventes orgânicos, sem toluol.',
    numeros: [
      ['5 a 10', 'min', 'Tempo de secagem: espera entre aplicar o adesivo e unir as peças'],
      ['90', 'min', 'Tempo em aberto após a secagem: período em que ainda é possível unir as peças'],
      ['200 a 250', 'g/m²', 'Rendimento aplicado com espátula (superfície dupla)'],
      ['140 a 175', 'g/m²', 'Rendimento aplicado com pincel (superfície dupla)'],
    ],
    condicoes: 'Os tempos podem variar com a quantidade de adesivo aplicada, o tipo de superfície, a temperatura e a umidade relativa do ar.',
    materiais: ['Madeira', 'Couro', 'Compensado', 'Lâminas decorativas', 'Espuma', 'Vidro', 'Carpete'],
    usos: 'Também adere a diversos materiais sobre superfícies de cimento, cerâmica e madeira.',
    passos: [
      'Deixe as superfícies firmes, limpas e secas, sem poeira, óleo ou graxa. Lixe quando necessário; pintura em más condições deve ser removida.',
      'Misture bem o produto, alcançando o fundo da embalagem.',
      'Aplique nas duas superfícies, com espátula ou pincel, e aguarde de 5 a 10 minutos antes de unir.',
      'Una as peças na posição exata, pressionando do centro para as bordas para evitar bolhas.',
      'Em materiais porosos, recomenda-se uma segunda aplicação 20 a 30 minutos após a primeira.',
      'Limpe as ferramentas antes de o produto secar, com Cascola Reducola sem Toluol.',
    ],
    extras: [
      {
        titulo: 'Aplicação com pistola (spray)',
        itens: ['Pode ser aplicado com pistola (spray), seguindo as orientações de diluição e aplicação indicadas pelo fabricante. Para os parâmetros completos, consulte a ficha técnica.'],
      },
      FITA_DE_BORDA,
    ],
    atencao: [
      'Produto inflamável: mantenha longe de calor, faíscas e chamas.',
      'Contém solventes: aplique em local arejado, com luvas e óculos de proteção.',
      'Os solventes podem agredir alguns materiais: faça um teste antes.',
      'Não indicado para colar espelhos.',
      NAO_ADERE,
    ],
    dados: [
      ['Base', 'Policloropreno e solventes orgânicos, sem toluol'],
      ['Embalagens', '195 g, 400 g, 730 g, 2,8 kg e 14 kg'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR_5_30 + ', com a embalagem bem fechada'],
    ],
    pendencias: [
      'Diluição para pistola: a ficha diz "proporção mínima de 10:1 até 10:5", sem dizer qual número é o adesivo e qual é o diluente. A ficha do Reducola fala em "até 10 % em volume do total de adesivo" (para primer). Confirmar a proporção e como explicá-la ao consumidor.',
      'O site dizia que a diluição era para "pincel ou pistola". Na ficha, a diluição aparece só no "Modo de Aplicação Spray". Corrigido para pistola.',
      'Diferencial "Rende 2x mais": a ficha compara com a fórmula anterior. A ressalva foi acrescentada no cartão.',
    ],
  },

  'contato-extraforte': {
    tipo: 'Adesivo de contato',
    nomeFicha: 'Cascola Extra Sem Toluol',
    pdf: 'Rev.00-26_Cascola Extra Sem Toluol.pdf',
    resumo: 'Adesivo de contato de alta performance, à base de policloropreno e solventes orgânicos, sem toluol. Resiste à umidade e é indicado para colagens curvas ou maleáveis.',
    numeros: [
      ['5 a 10', 'min', 'Tempo de secagem: espera entre aplicar o adesivo e unir as peças'],
      ['60', 'min', 'Tempo em aberto: período em que ainda é possível unir as peças'],
      ['270 a 320', 'g/m²', 'Consumo aproximado (superfície dupla), conforme o material'],
    ],
    condicoes: COND_23,
    materiais: ['Madeira', 'Couro', 'Compensado', 'Lâminas decorativas', 'Espuma', 'Vidro'],
    usos: 'Também adere a diversos materiais sobre superfícies de cimento, cerâmica e madeira.',
    passos: [
      'Deixe as superfícies firmes, limpas e secas, sem poeira, óleo ou graxa. Lixe quando necessário; pintura em más condições deve ser removida.',
      'Aplique nas duas superfícies e aguarde de 5 a 10 minutos antes de unir.',
      'Una as peças na posição exata, pressionando do centro para as bordas para evitar bolhas.',
      'Em materiais porosos, recomenda-se uma segunda aplicação 20 a 30 minutos após a primeira.',
      'Limpe as ferramentas antes de o produto secar, com Cascola Reducola sem Toluol, e feche bem a embalagem logo após o uso.',
    ],
    extras: [FITA_DE_BORDA],
    atencao: [
      'Produto inflamável: mantenha longe de calor, faíscas e chamas.',
      'Contém solventes: aplique em local arejado, com luvas e óculos de proteção.',
      'Os solventes podem agredir alguns materiais. Em borrachas sintéticas e plásticos, faça um teste antes e lixe o material.',
      'Não indicado para colar espelhos: pode atacar a camada protetora.',
      NAO_ADERE,
    ],
    dados: [
      ['Base', 'Policloropreno e solventes orgânicos, sem toluol'],
      ['Embalagens', '30 g, 195 g, 730 g, 2,8 kg e 14 kg'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR_5_30],
    ],
    pendencias: [
      'Fita de borda: esta ficha cita só uma demão na fita de borda, sem aplicação na madeira. A ficha do Tradicional pede duas demãos na fita e uma na madeira. Confirmar se falta a demão na madeira.',
      'Nome: o site usa "Cola de Contato Extraforte" (como na embalagem); a ficha se chama "Cascola Extra Sem Toluol".',
    ],
  },

  'cola-madeira': {
    tipo: 'Adesivo PVA (cola branca)',
    nomeFicha: 'Cascola Cascorez Cola Madeira',
    pdf: 'Rev.00-26_ Cascola Cascorez Cola Madeira.pdf',
    resumo: 'Adesivo de alto desempenho à base de PVAc (poliacetato de vinila) em dispersão aquosa, feito para reparos rápidos e consertos de móveis de madeira.',
    numeros: [
      ['D2', '', 'Classe de colagem, conforme a norma EN 204'],
      ['5', 'min', 'Tempo máximo, aproximado, entre a montagem e a prensagem'],
      ['24', 'h', 'Espera antes de submeter a peça a esforço mecânico'],
    ],
    materiais: ['Madeira', 'Tacos e parquetes', 'Finger joints', 'Cavilhas e encaixes', 'Aglomerado', 'Papel e papelão', 'Cartuchos e sacos de papel'],
    usos: 'Reparos e consertos de móveis de madeira e de tacos e parquetes soltos.',
    passos: [
      'Deixe as superfícies firmes, limpas e secas, sem poeira, óleo ou graxa. A madeira deve ter umidade entre 8 % e 15 %.',
      'Aplique em uma das superfícies, em camada uniforme.',
      'Junte as partes imediatamente: não passe de cerca de 5 minutos entre a montagem e a prensagem.',
      'Mantenha as peças prensadas até a secagem completa.',
      'Aguarde 24 horas antes de submeter a peça a esforço.',
    ],
    atencao: [
      'Evite o contato do adesivo úmido com ferro: a linha de colagem escurece.',
      NAO_ADERE,
    ],
    dados: [
      ['Base', 'PVAc (poliacetato de vinila) em dispersão aquosa'],
      ['Embalagens', '100 g, 250 g, 1 kg e 5 kg'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR_5_30],
    ],
    pendencias: [
      'A ficha não informa o tempo de prensagem (o diferencial "Menos tempo de prensagem" não tem número). Nenhum tempo foi incluído.',
      'Viscosidade: a ficha traz "5000 – 7000 (25 °C)" sem unidade. O valor não foi exibido.',
      'Objeto "Gaveta de MDF" (cozinha): MDF não aparece nesta ficha (ela cita madeira e aglomerado). Confirmar.',
    ],
  },

  'pva-extraforte': {
    tipo: 'Adesivo PVA (cola branca)',
    nomeFicha: 'Cascola Cascorez Extra',
    pdf: 'Rev.00_26_ Cascola Cascorez Extra.pdf',
    resumo: 'Adesivo à base de PVAc (poliacetato de vinila) em dispersão aquosa, que seca transparente. Indicado para madeiras de alta, média e baixa densidade e para materiais porosos em geral. Classe de colagem D1 (norma EN 204).',
    numeros: [
      ['D1', '', 'Classe de colagem, conforme a norma EN 204'],
      ['160 a 200', 'g/m²', 'Consumo aproximado na montagem'],
      ['100 a 150', 'g/m²', 'Consumo aproximado na laminação'],
      ['5', 'min', 'Tempo máximo, aproximado, entre a montagem dos painéis e a prensagem'],
    ],
    materiais: ['Madeiras de alta, média e baixa densidade', 'Artefatos de madeira', 'Laminados plásticos', 'Papel e papelão', 'Cartuchos e sacos de papel', 'Materiais porosos em geral'],
    usos: 'Montagem de painéis, laminação de madeira e finger joint. No artesanato, cola tecido, algodão, cortiça, isopor, couro, tela e gesso, entre outros.',
    passos: [
      'Deixe as superfícies firmes, limpas e secas, sem poeira, óleo ou graxa. A madeira deve ter umidade entre 8 % e 15 %, igual entre as peças.',
      'Aplique em uma das superfícies, em camada uniforme (trincha, rolo, espátula ou coladeira).',
      'Junte as partes imediatamente: não passe de cerca de 5 minutos entre a montagem e a prensagem.',
      'Mantenha as peças sob pressão até a secagem completa.',
    ],
    extras: [CONDICOES_PRENSAGEM],
    atencao: [
      'Evite o contato do adesivo úmido com ferro: a linha de colagem escurece.',
      NAO_ADERE,
    ],
    dados: [
      ['Base', 'PVAc (poliacetato de vinila) em dispersão aquosa'],
      ['Embalagens', '500 g, 1 kg, 5 kg, 10 kg e 20 kg'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR_5_30],
    ],
    pendencias: [
      'Teor de sólidos: o site trazia 44 a 46 %; a ficha Rev.00/26 traz 36,0 a 39,0 %, o mesmo valor da ficha do Cascorez Universal (viscosidade, consumo e tabelas de prensagem também são idênticos). Confirmar se a ficha do Cascorez Extra está correta.',
      'Embalagens: o site trazia 100 g, 250 g, 500 g, 1 kg, 5 kg, 10 kg e 20 kg; a ficha traz 500 g, 1 kg, 5 kg, 10 kg e 20 kg. Atualizado conforme a ficha.',
      'Viscosidade: a ficha traz "6000-8000 (25 °C)" sem unidade. O valor não foi exibido.',
      'Nome: o site usa "Cola Branca PVA Extraforte" (como na embalagem); a ficha se chama "Cascola Cascorez Extra".',
    ],
  },

  'nao-mais-pregos': {
    tipo: 'Adesivo de montagem',
    nomeFicha: 'Não Mais Pregos',
    pdf: 'Rev.00_26_Não Mais Pregos 1.pdf',
    resumo: 'Adesivo de montagem à base de resina acrílica e água, para uso interno. Fixa peças sem furar, parafusar ou pregar, desde que pelo menos uma das superfícies seja porosa.',
    numeros: [
      ['50 a 70', 'kgf/cm²', 'Resistência ao cisalhamento após 24 horas (madeira com madeira)'],
      ['10', 'min', 'Tempo máximo para ajustar a peça (tempo em aberto)'],
      ['24 a 72', 'h', 'Cura total, conforme os materiais, a área, a quantidade e o clima'],
      ['−20 a 80', '°C', 'Resistência à temperatura'],
    ],
    condicoes: COND_23,
    materiais: ['Metal', 'Porcelana', 'Plásticos', 'Madeira', 'Concreto', 'Vidro', 'Poliestireno expandido (isopor)', 'Drywall'],
    usos: 'Rodapés, guarnições, florões, arandelas, molduras, azulejos, ladrilhos, canaletas, cantoneiras, conduítes, mosaicos e peças decorativas.',
    passos: [
      'Deixe as superfícies firmes, limpas e secas, sem poeira, óleo ou graxa. Lixe pinturas em mau estado.',
      'No cartucho, use pistola aplicadora e corte o bico na diagonal (45°).',
      'Aplique em cordões verticais ou, em peças leves, em pontos.',
      'Junte as partes e pressione com firmeza: o ajuste pode ser feito em até 10 minutos. Em peças pesadas, use um suporte (fita adesiva ou calço) até firmar.',
      'Retire o excesso com pano umedecido com água ou álcool doméstico, antes de secar.',
      'A cura total leva de 24 a 72 horas. Depois de seco, aceita pintura (faça um teste antes).',
    ],
    atencao: [
      'Somente para uso interno.',
      'Pelo menos uma das superfícies deve ser porosa.',
      'Não recomendado para colar espelhos nem para aplicações submersas.',
      NAO_ADERE_PLASTICOS,
    ],
    dados: [
      ['Base', 'Resina acrílica e água'],
      ['Rendimento', 'Cartucho 360 g: aprox. 25 m com cordão de 4 mm. Bisnaga 85 g: aprox. 1,5 m com cordão de 8 mm'],
      ['Embalagens', 'Cartucho de 360 g e bisnaga de 85 g'],
      ['Validade', '36 meses'],
      ['Armazenamento', ARMAZENAR_5_30],
    ],
    pendencias: [
      'O diferencial "Suporta até 700 kg/10 cm²" (capa da ficha) equivale ao limite superior da tabela técnica (50 a 70 kgf/cm²). Mantido como na ficha.',
      'Retirados por não constarem na ficha: "não escorre", "sem solventes" e os materiais pedra, cortiça, tijolo e gesso (a ficha cita drywall).',
      'Objeto "Painel ripado" (sala): a ficha não cita painéis ripados (cita rodapés, guarnições, molduras, peças decorativas etc.). Confirmar.',
    ],
  },

  pl600: {
    tipo: 'Adesivo de montagem',
    nomeFicha: 'Cascola PL600',
    pdf: 'Rev.00_26_Cascola PL600.pdf',
    resumo: 'Adesivo de montagem à base de borrachas sintéticas e solventes orgânicos, para uso interno e externo. Tem agarre imediato, resiste à chuva e à umidade e fixa peças sem furar, parafusar ou pregar.',
    numeros: [
      ['50 a 70', 'kgf/cm²', 'Resistência ao cisalhamento após 24 horas (madeira com madeira)'],
      ['5', 'min', 'Tempo máximo para ajustar a peça (tempo em aberto)'],
      ['24 a 72', 'h', 'Cura total, conforme os materiais, a área, a quantidade e o clima'],
      ['−20 a 80', '°C', 'Resistência à temperatura'],
    ],
    condicoes: COND_23,
    materiais: ['Metal', 'Borracha', 'Porcelana', 'Cerâmica', 'Alvenaria', 'Plásticos', 'Madeira', 'Concreto', 'Vidro'],
    usos: 'Rodapés, guarnições, florões, arandelas, molduras, azulejos, ladrilhos, canaletas, cantoneiras, conduítes, mosaicos e peças decorativas.',
    passos: [
      'Deixe as superfícies firmes, limpas e secas, sem poeira, óleo ou graxa. Lixe pinturas em mau estado.',
      'Use pistola aplicadora e corte o bico na diagonal (45°).',
      'Aplique em cordões verticais ou, em peças leves, em pontos.',
      'Junte as partes e pressione com firmeza: o ajuste pode ser feito em até 5 minutos. Em peças pesadas, use um suporte (fita adesiva ou calço) até firmar.',
      'Retire o excesso com pano umedecido com álcool doméstico, antes de secar.',
      'A cura total leva de 24 a 72 horas. Depois de seco, aceita pintura (faça um teste antes).',
    ],
    atencao: [
      'Produto inflamável: mantenha longe de calor, faíscas e chamas.',
      'Contém solventes: aplique em local arejado.',
      'Não recomendado para colar espelhos, isopor (poliestireno expandido) e tecidos, nem para aplicações submersas.',
      NAO_ADERE_PLASTICOS,
    ],
    dados: [
      ['Base', 'Borrachas sintéticas e solventes orgânicos'],
      ['Rendimento', 'Cartucho 375 g: aprox. 23 m com cordão de 4 mm'],
      ['Embalagem', 'Cartucho de 375 g'],
      ['Validade', '18 meses'],
      ['Armazenamento', ARMAZENAR_5_30],
    ],
    pendencias: [
      'Objeto "Pedra do revestimento" (área externa): a ficha não cita pedra (cita metal, borracha, porcelana, plásticos, madeira, concreto, vidro, cerâmica e alvenaria). Confirmar com o técnico.',
      'Retirado por não constar na ficha: "não escorre".',
    ],
  },

  pl700: {
    tipo: 'Adesivo multifuncional (adesivo e selante)',
    nomeFicha: 'Cascola PL700',
    pdf: 'Rev.00_26_Cascola PL700.pdf',
    resumo: 'Adesivo multifuncional à base de polímero modificado por silano, que também pode ser usado como selante. Para uso interno e externo.',
    numeros: [
      ['10', 'min', 'Tempo recomendado para ajustar a peça (uso como adesivo)'],
      ['10 a 20', 'min', 'Formação de pele: tempo para criar uma película na superfície'],
      ['2,5 a 3,0', 'mm/24 h', 'Tempo de cura: espessura que cura a cada 24 horas'],
      ['−30 a +80', '°C', 'Resistência à temperatura após a cura'],
    ],
    condicoes: COND_23,
    materiais: ['Metal', 'Acrílico', 'Porcelana', 'Plásticos', 'Madeira', 'Concreto', 'Vidro', 'Espelhos', 'Poliestireno expandido (isopor)', 'Gesso acartonado', 'PVC', 'Telhas'],
    usos: 'Fixação de tampos de vidro, painéis decorativos, blocos de vidro, placas de acrílico e espelhos, além de aplicações em construção civil, decoração e reparos.',
    passos: [
      'Deixe as superfícies firmes, limpas e sem poeira, óleo ou graxa. Lixe pinturas em mau estado.',
      'Use pistola aplicadora e corte o bico na diagonal (45°).',
      'Para colar: aplique em cordões verticais (em pontos, só em peças leves), junte e pressione até o produto se espalhar. O ajuste pode ser feito em até 10 minutos; em peças pesadas, use um suporte até firmar.',
      'Para vedar: aplique um cordão contínuo e alise com espátula (água com detergente neutro ajuda). Se usar fita crepe, retire-a antes de formar película.',
      'Retire o excesso com álcool doméstico, antes de curar. A cura total leva de 24 a 72 horas.',
    ],
    atencao: [
      'Não recomendado para aplicações submersas, aquários ou contato com alimentos e água potável.',
      'Pinte só depois da cura total, com teste antes.',
      NAO_ADERE_SELANTE,
    ],
    dados: [
      ['Base', 'Polímero modificado por silano'],
      ['Rendimento', 'Cartucho 290 g: aprox. 16 m com cordão de 4 mm'],
      ['Embalagem', 'Cartucho de 290 g'],
      ['Validade', '15 meses'],
      ['Armazenamento', ARMAZENAR_5_30],
    ],
    pendencias: [
      'O site dizia que o PL700 "pode ser aplicado em superfície molhada", "resiste aos raios UV" e "não tem solventes". Nada disso está na ficha Rev.00/26 (que pede superfície limpa, sem poeira, óleo ou graxa). Retirado também da legenda da animação do espelho. Só reincluir com documento.',
      'Objeto "Bancada de mármore" (banheiro): mármore/pedra não aparece na lista de materiais da ficha. Confirmar.',
    ],
  },

  'silicone-uso-geral': {
    tipo: 'Selante de silicone',
    nomeFicha: 'Cascola Uso Geral',
    pdf: 'Rev.00_26_Cascola Uso Geral.pdf',
    resumo: '100% silicone, incolor e com fungicida, para vedações internas e externas em materiais não porosos.',
      numeros: [
      ['5 a 10', 'min', 'Formação de pele: tempo para criar uma película na superfície'],
      ['2 a 3', 'mm/24 h', 'Tempo de cura: espessura que cura a cada 24 horas'],
      ['24 a 72', 'h', 'Cura total, conforme a quantidade de produto e o clima'],
      ['−30 a +120', '°C', 'Resistência à temperatura após a cura'],
    ],
    condicoes: COND_23,
    materiais: ['Alumínio', 'Vidro', 'Porcelana', 'PVC', 'Acrílico'],
    usos: 'Box de banheiro, cubas e bacias sanitárias, pias e bancadas de cozinha, encanamentos e ralos, vidros, rejuntes e vitrines.',
    passos: [
      'Limpe a superfície com álcool doméstico (não use gasolina nem querosene) e remova todo o produto antigo. Ela deve estar seca, sem poeira, óleo ou graxa.',
      'No cartucho, use pistola e corte o bico na diagonal (45°). Na bisnaga, corte o bico no tamanho desejado.',
      'Se quiser um acabamento reto, proteja as bordas com fita crepe.',
      'Aplique um cordão contínuo e alise (água com detergente neutro ajuda). Retire a fita crepe antes de formar película.',
      'Remova o excesso na hora, com álcool etílico. A cura total leva de 24 a 72 horas.',
    ],
    atencao: [
      'Não aceita pintura.',
      'Não indicado para pedras naturais, madeira e metais como latão, ferro e chumbo.',
      'Não indicado para aquários (tem fungicida) nem para colar espelhos e utensílios.',
      NAO_ADERE_SELANTE,
      'Aplique em local arejado: tem odor acético (de vinagre) durante a aplicação.',
    ],
    dados: [
      ['Base', 'Borracha de silicone, de cura acética, com fungicida'],
      ['Rendimento', 'Cartucho 252 g: aprox. 20 m com cordão de 4 mm. Bisnaga 50 g: aprox. 3,5 m com cordão de 4 mm'],
      ['Embalagens', 'Cartucho de 252 g e bisnaga de 50 g'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR_5_30],
    ],
    pendencias: [
      'Objeto "Tanque" (lavanderia): a ficha não indica o produto para pedras naturais. Confirmar o material do tanque.',
      'Objeto "Janela da sala" (área externa): a ficha não indica o produto para madeira. Confirmar se o caixilho é de alumínio/PVC.',
    ],
  },

  'silicone-banheiro-cozinha': {
    tipo: 'Selante de silicone',
    nomeFicha: 'Cascola Banheiro e Cozinha',
    pdf: 'Rev.00_26_Cascola Banheiro e Cozinha.pdf',
    resumo: '100% silicone, branco e com fungicida, para vedações internas e externas em materiais não porosos. Resiste ao mofo e à limpeza diária.',
   numeros: [
      ['5 a 10', 'min', 'Formação de pele: tempo para criar uma película na superfície'],
      ['2 a 3', 'mm/24 h', 'Tempo de cura: espessura que cura a cada 24 horas'],
      ['24 a 72', 'h', 'Cura total, conforme a quantidade de produto e o clima'],
      ['−30 a +120', '°C', 'Resistência à temperatura após a cura'],
    ],
    condicoes: COND_23,
    materiais: ['Alumínio', 'Vidro', 'Porcelana', 'PVC', 'Acrílico'],
    usos: 'Box de banheiro, cubas e bacias sanitárias, pias e bancadas de cozinha, encanamentos e ralos, vidros, rejuntes e vitrines.',
    passos: [
      'Limpe a superfície com álcool doméstico (não use gasolina nem querosene) e remova todo o produto antigo. Ela deve estar seca, sem poeira, óleo ou graxa.',
      'No cartucho, use pistola e corte o bico na diagonal (45°). Na bisnaga, corte o bico no tamanho desejado.',
      'Se quiser um acabamento reto, proteja as bordas com fita crepe.',
      'Aplique um cordão contínuo e alise (água com detergente neutro ajuda). Retire a fita crepe antes de formar película.',
      'Remova o excesso na hora, com álcool etílico. A cura total leva de 24 a 72 horas.',
    ],
    atencao: [
      'Não aceita pintura.',
      'Não indicado para pedras naturais, madeira e metais como latão, ferro e chumbo.',
      'Não indicado para aquários (tem fungicida) nem para colar espelhos e utensílios.',
      NAO_ADERE_SELANTE,
      'Aplique em local arejado: tem odor acético (de vinagre) durante a aplicação.',
    ],
    dados: [
      ['Base', 'Borracha de silicone, de cura acética, com fungicida'],
      ['Rendimento', 'Cartucho 280 g: aprox. 23 m com cordão de 4 mm. Bisnaga 50 g: aprox. 4 m com cordão de 4 mm'],
      ['Embalagens', 'Cartucho de 280 g e bisnaga de 50 g'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR_5_30],
    ],
    pendencias: [
      'Objeto "Cuba da cozinha": se a bancada for de pedra natural (granito, mármore), a ficha diz que o produto não é indicado para pedras naturais. Confirmar o material.',
      'Legendas das animações do vaso e do box (hoje ocultas na tela): "deixe um trecho sem silicone atrás do vaso como ponto de inspeção" e "espere a cura total antes de usar o chuveiro / lavar o banheiro" não estão na ficha. Validar antes de exibir.',
    ],
  },

  acabamentos: {
    tipo: 'Selante acrílico',
    nomeFicha: 'Cascola Acabamentos',
    pdf: 'Rev.00-26_Cascola Acabamentos.pdf',
    resumo: 'Selante acrílico à base d’água, pronto para uso, para vedar em diversas superfícies porosas e não porosas e dar acabamento em ambientes internos. É pintável, antimofo e flexível.',
    numeros: [
      ['20 a 25', 'min', 'Formação de pele: tempo para criar uma película na superfície'],
      ['5', 'mm', 'Preenchimento máximo de juntas'],
      ['24 a 72', 'h', 'Cura total, conforme a quantidade de produto e o clima'],
      ['−10 a +80', '°C', 'Resistência à temperatura após a cura'],
    ],
    condicoes: COND_23,
    materiais: ['Madeira', 'Granito', 'Alumínio', 'Vidro', 'Porcelana', 'Cimento'],
    usos: 'Juntas e acabamentos em móveis, guarnições de portas e janelas e reparos em paredes de alvenaria e em superfícies porosas.',
    passos: [
      'Deixe a superfície firme, limpa e seca, sem poeira, óleo, graxa ou produto antigo. Abra as trincas e fissuras para o selante penetrar melhor.',
      'Limpe com álcool isopropílico ou acetona. Evite thinner, aguarrás e soluções com sabão.',
      'Use pistola aplicadora e corte o bico na diagonal (45°). Se quiser, proteja os contornos com fita crepe.',
      'Aplique um cordão contínuo e faça o acabamento com espátula de ponta arredondada em até 12 minutos. Retire a fita crepe antes de formar película.',
      'Remova o excesso na hora, com água e sabão ou álcool etílico. A cura total leva de 24 a 72 horas.',
    ],
    atencao: [
      'Somente para uso interno.',
      'Preenchimento de juntas de no máximo 5 mm.',
      'Não pinte com o selante ainda úmido.',
      'Não recomendado para imersão contínua em água, aquários, espelhos ou contato direto com alimentos.',
      NAO_ADERE_SELANTE,
    ],
    dados: [
      ['Base', 'Resinas acrílicas, à base d’água'],
      ['Rendimento', 'Cartucho 450 g: aprox. 30 m com cordão de 3 mm ou 18 m com cordão de 5 mm'],
      ['Embalagem', 'Cartucho de 450 g'],
      ['Validade', '18 meses'],
      ['Armazenamento', 'Local coberto e ventilado, protegido de intempéries, entre 5 °C e 25 °C'],
    ],
    pendencias: [
      'O site não tinha ficha deste produto (usava o comunicado de lançamento). Todos os dados foram trocados pelos da ficha Rev.00/26. Retirados por não constarem na ficha: "ação antifúngica", "odor suave" e "fecha frestas por onde entram poeira e insetos".',
      'As fichas do Acabamentos e do Portas & Janelas têm exatamente os mesmos dados técnicos (dureza, tempos, rendimento, embalagem de 450 g). Confirmar se é a mesma formulação.',
      'Objeto "Rodapé" (sala): rodapé não aparece na ficha (ela cita juntas e acabamentos em móveis, guarnições de portas e janelas e paredes de alvenaria). Confirmar.',
    ],
  },

  pu40: {
    tipo: 'Selante multifuncional (selante e adesivo)',
    nomeFicha: 'Cascola PU 40',
    pdf: 'Rev.00-26_Cascola PU 40.pdf',
    resumo: 'Selante à base de poliuretano modificado, que também pode ser usado como adesivo. Para uso interno e externo, acompanha a movimentação das juntas sem trincar e resiste ao sol e à água.',
    numeros: [
      ['20 a 60', 'min', 'Formação de pele: tempo para criar uma película na superfície'],
      ['2 a 3', 'mm/24 h', 'Tempo de cura: espessura que cura a cada 24 horas'],
      ['250', '%', 'Alongamento à ruptura, aproximado: quanto o selante estica antes de romper'],
      ['−40 a +80', '°C', 'Resistência à temperatura após a cura total'],
    ],
    condicoes: COND_23,
    materiais: ['Pedras', 'Concreto', 'Madeira', 'Superfícies metálicas', 'Vidro', 'Telhas', 'Acrílicos'],
    usos: 'Juntas de dilatação e de movimentação de baixo tráfego em pisos, rodapés e paredes; vedação de tubulações, portas, janelas, calhas, rufos, dutos, toldos e telhados.',
    passos: [
      'Deixe as superfícies firmes, limpas e sem óleo, graxa ou poeira. Não use querosene ou gasolina na limpeza.',
      'Use pistola aplicadora, corte o bico na diagonal (45°) e proteja com fita crepe as áreas próximas.',
      'Para vedar: aplique um cordão contínuo e alise com espátula (água com detergente neutro ajuda). Um tubo de espuma de polietileno (Tarucel) ajuda a preencher e dimensionar a junta.',
      'Para colar: aplique em cordões verticais (em pontos, só em peças leves) e pressione. O ajuste pode ser feito em até 15 minutos.',
      'Retire a fita crepe antes de formar película e o excesso com álcool doméstico, antes de curar. A cura total leva de 24 a 72 horas.',
    ],
    atencao: [
      'Não use em aplicações estruturais.',
      'Indicado para juntas de baixo tráfego. O dimensionamento da junta é responsabilidade de quem aplica.',
      'Não recomendado para aplicações submersas, aquários ou contato com alimentos e água potável.',
      'Pinte só depois da cura total, com teste antes.',
      NAO_ADERE_SELANTE,
    ],
    dados: [
      ['Base', 'Poliuretano modificado'],
      ['Rendimento', 'Cartucho 380 g: aprox. 2,35 m em junta de 10 × 10 mm'],
      ['Embalagem', 'Cartucho de 380 g, branco ou cinza'],
      ['Validade', '15 meses'],
      ['Armazenamento', ARMAZENAR_5_30],
    ],
    pendencias: [
      'Objeto "Junta da calçada" (área externa, piso de concreto da entrada de carros): a ficha indica juntas de dilatação de BAIXO TRÁFEGO. Confirmar se a passagem de carros se enquadra antes de apresentar essa aplicação.',
      'Retirados por não constarem na ficha: "não encolhe nem resseca" e "não tem solventes".',
    ],
  },

  'pu-veda-calha': {
    tipo: 'Selante multifuncional',
    nomeFicha: 'Cascola Veda Calha',
    pdf: 'Rev.00-26_Cascola Veda Calha.pdf',
    resumo: 'Selante à base de polímero modificado por silano, feito para instalar, vedar e dar acabamento em calhas, rufos e pingadeiras. Para uso interno e externo, pode ser aplicado também em superfícies molhadas e resiste aos agentes climáticos.',
    numeros: [
      ['10 a 30', 'min', 'Formação de pele: tempo para criar uma película na superfície'],
      ['2 a 3', 'mm/24 h', 'Tempo de cura: espessura que cura a cada 24 horas'],
      ['24 a 72', 'h', 'Cura total, conforme os materiais, a área, a quantidade e o clima'],
      ['15', 'm', 'Rendimento aproximado do cartucho de 320 g, com cordão de 4 mm'],
    ],
    condicoes: 'Tempos medidos a 25 ± 2 °C e 50 ± 5 % de umidade relativa do ar. Podem variar com a quantidade aplicada, o tipo de superfície, a temperatura e a umidade.',
    materiais: ['Aço galvanizado', 'Fibrocimento', 'Cerâmica', 'Madeira', 'Concreto', 'PVC'],
    usos: 'Conexões de calhas, rufos e pingadeiras, fixação de telhas e vedação de furos.',
    passos: [
      'Limpe a superfície com álcool doméstico: sem poeira, óleo ou graxa. Não use querosene ou gasolina.',
      'Use pistola aplicadora e corte o bico na diagonal (45°).',
      'Aplique um cordão contínuo e retire o excesso com espátula. Se usar fita crepe, retire-a antes de formar película.',
      'Remova o excesso não curado com álcool doméstico. A cura total leva de 24 a 72 horas.',
    ],
    atencao: [
      'Não recomendado para aplicações submersas, aquários ou contato com alimentos e água potável.',
      'Pinte só depois da cura total, com teste antes.',
      NAO_ADERE_SELANTE,
    ],
    dados: [
      ['Base', 'Polímero modificado por silano'],
      ['Embalagem', 'Cartucho de 320 g'],
      ['Validade', '15 meses'],
      ['Armazenamento', 'Local coberto e ventilado, protegido de intempéries, entre 10 °C e 35 °C'],
    ],
    pendencias: [
      'Nome × composição: a embalagem e o site dizem "Selante PU Veda Calha", mas a ficha se chama "Cascola Veda Calha" e indica base de polímero modificado por silano (não poliuretano). Confirmar com a Henkel qual está certo.',
      'A ficha não informa a faixa de resistência à temperatura. Nenhum valor foi incluído.',
      'Retirado por não constar na ficha: "não tem solventes".',
    ],
  },

  'cascorez-universal': {
    tipo: 'Adesivo PVA (cola branca)',
    nomeFicha: 'Cascola Cascorez Universal',
    pdf: 'Rev.00-26_Cascola Cascorez Universal.pdf',
    resumo: 'Adesivo à base de PVAc (poliacetato de vinila) em dispersão aquosa, que seca transparente. Indicado para madeiras de alta, média e baixa densidade e para materiais porosos em geral.',
    numeros: [
      ['D1', '', 'Classe de colagem, conforme a norma EN 204'],
      ['160 a 200', 'g/m²', 'Consumo aproximado na montagem'],
      ['100 a 150', 'g/m²', 'Consumo aproximado na laminação'],
      ['5', 'min', 'Tempo máximo, aproximado, entre a montagem dos painéis e a prensagem'],
    ],
    materiais: ['Madeiras de alta, média e baixa densidade', 'Artefatos de madeira', 'Laminados plásticos', 'Papel e papelão', 'Cartuchos e sacos de papel', 'Materiais porosos em geral'],
    usos: 'Montagem de painéis, laminação de madeira e finger joint.',
    passos: [
      'Deixe as superfícies firmes, limpas e secas, sem poeira, óleo ou graxa. A madeira deve ter umidade entre 8 % e 15 %, igual entre as peças.',
      'Aplique em uma das superfícies, em camada uniforme (trincha, rolo, espátula ou coladeira).',
      'Junte as partes imediatamente: não passe de cerca de 5 minutos entre a montagem e a prensagem.',
      'Mantenha as peças sob pressão até a secagem completa.',
    ],
    extras: [CONDICOES_PRENSAGEM],
    atencao: [
      'Evite o contato do adesivo úmido com ferro: a linha de colagem escurece.',
      NAO_ADERE,
    ],
    dados: [
      ['Base', 'PVAc (poliacetato de vinila) em dispersão aquosa'],
      ['Embalagens', '500 g e 1 kg'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR_5_30],
    ],
    pendencias: [
      'Viscosidade: a ficha traz "6000-8000 (25 °C)" sem unidade. O valor não foi exibido.',
      'Dados técnicos e tabelas de prensagem idênticos aos da ficha do Cascorez Extra. Confirmar (ver pendência do Cascorez Extra).',
      'Retirados do cartão por não constarem na ficha: "Elevado poder de adesão" e "Película flexível". Entraram os destaques da ficha: "Mais cola, menos água", "Alta durabilidade" e "Flexibilidade + força".',
    ],
  },

  'cascorez-artesanato': {
    tipo: 'Adesivo PVA (cola branca)',
    nomeFicha: 'Cascola Cascorez Artesanato',
    pdf: 'Rev.00-26_Cascola Cascorez Artesanato_.pdf',
    resumo: 'Adesivo à base de PVAc (poliacetato de vinila) em dispersão aquosa, para artesanato. Seca transparente, com alto brilho e flexibilidade.',
    numeros: [
      ['5', 'min', 'Tempo máximo, aproximado, entre a montagem e a prensagem'],
      ['38,0 a 40,0', '%', 'Teor de sólidos'],
      ['24', 'meses', 'Validade'],
    ],
    materiais: ['Tecido de algodão', 'Madeira', 'MDF', 'Cortiça', 'Tela', 'Isopor', 'Papel', 'Couro', 'Papelão', 'Materiais porosos em geral'],
    usos: 'Fuxico, carton mousse, E.V.A., arte francesa, cartonagem, patchwork, patch-décor, mosaico, decoupage, scrapbook, origami, papercraft e biscuit, entre outros.',
    passos: [
      'Deixe as superfícies limpas, secas e sem poeira, óleo ou graxa.',
      'Agite o frasco antes de usar.',
      'Aplique uma camada fina em uma das superfícies e junte as partes imediatamente, sem passar de cerca de 5 minutos até prensar.',
      'Mantenha as partes pressionadas até a secagem completa.',
    ],
    atencao: [
      'Evite aplicar sobre superfícies molhadas ou úmidas.',
      'Evite o contato do adesivo úmido com ferro: o local escurece.',
      NAO_ADERE,
    ],
    dados: [
      ['Base', 'PVAc (poliacetato de vinila) em dispersão aquosa'],
      ['Embalagens', '100 g, 250 g, 500 g e 1 kg'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR_5_30],
    ],
    pendencias: [
      'Viscosidade: a ficha traz "5000 - 7000 (25 °C)" sem unidade. O valor não foi exibido.',
      'Retirado do cartão por não constar na ficha: "Boa consistência e textura".',
    ],
  },

  'massa-calafetar': {
    tipo: 'Selante (massa de calafetar)',
    nomeFicha: 'Cascola Massa de Calafetar',
    pdf: 'Rev.00_26_ Cascola Massa Calafetar.pdf',
    resumo: 'Massa pronta para uso, à base de resinas sintéticas e cargas minerais, que não seca nem endurece. Para uso interno e externo, veda frestas e orifícios e também serve como massa antirruído em peças que vibram.',
    numeros: [
      ['120', '°C', 'Temperatura máxima de aplicação'],
      ['350', 'g', 'Embalagem'],
      ['24', 'meses', 'Validade'],
    ],
    materiais: ['Madeira', 'Granito', 'Alumínio', 'Vidro', 'Porcelana', 'Cimento', 'Telhas', 'Folhas de zinco', 'Fibrocimento'],
    usos: 'Vedação contra água, umidade, ar quente ou frio, vapores e fumaça; massa antirruído em aparelhos de ar-condicionado e geladeiras.',
    passos: [
      'Deixe a superfície firme, limpa e seca, sem poeira, óleo, graxa ou desmoldante. Limpe com álcool doméstico (não use gasolina nem querosene).',
      'Em superfícies não porosas, lixe antes para melhorar a ancoragem.',
      'Destaque uma quantidade, molde e aplique pressionando com a mão ou com um rolete.',
      'Retire o excesso com a mão e guarde a embalagem para uma próxima utilização.',
    ],
    atencao: [
      'Não é indicada como adesivo para colar materiais.',
      NAO_ADERE,
    ],
    dados: [
      ['Base', 'Resinas sintéticas e cargas minerais'],
      ['Cor', 'Cinza claro'],
      ['Validade', '24 meses'],
      ['Armazenamento', ARMAZENAR_5_30],
    ],
    pendencias: [
      '"Temperatura máxima de aplicação: 120 °C" foi mantido como está na ficha. Confirmar se é a temperatura da superfície ou de serviço.',
      'Retirados por não constarem na ficha: "Não contém amianto" e "Alta durabilidade e boa aderência".',
    ],
  },

  reducola: {
    tipo: 'Diluente',
    nomeFicha: 'Cascola Reducola Sem Toluol',
    pdf: 'Rev.00_26_Cascola Reducola Sem Toluol.pdf',
    resumo: 'Diluente à base de solventes orgânicos, sem toluol, 100% compatível com as colas de contato Cascola Tradicional e Extra sem Toluol. Serve para diluir a cola, preparar primer e limpar superfícies e ferramentas, como espátulas, pincéis e pistolas.',
    numeros: [
      ['até 10', '%', 'Proporção em volume, sobre o total de adesivo, no preparo de primer'],
      ['3 a 5', 'min', 'Tempo de ação, aproximado, do diluente sobre adesivo seco'],
      ['18', 'meses', 'Validade'],
    ],
    passos: [
      'Primer: acrescente o Reducola à cola de contato, até 10 % em volume do total de adesivo (ex.: para 3 litros de cola, no máximo 0,30 litro de diluente), e misture devagar.',
      'Cola seca: aplique o Reducola sobre o resíduo ou mergulhe a ferramenta, deixe agir cerca de 3 a 5 minutos e retire com espátula.',
      'Cola ainda úmida: aplique o Reducola e retire com pano ou estopa.',
    ],
    atencao: [
      'Produto inflamável: mantenha longe de calor, faíscas e chamas.',
      'Contém solventes: use em local arejado e evite inalar por tempo prolongado.',
      'Pode agredir alguns materiais: faça um teste antes. Para limpar plásticos, consulte o SAC.',
      'Compatibilidade não garantida com colas de contato que não sejam da linha Cascola.',
    ],
    dados: [
      ['Base', 'Solventes orgânicos, sem toluol'],
      ['Embalagens', '900 ml e 4,6 L'],
      ['Validade', '18 meses'],
      ['Armazenamento', ARMAZENAR_5_30],
    ],
    pendencias: [
      'Proporção de diluição: esta ficha diz "até 10 % em volume do total de adesivo" (primer); a ficha do Tradicional diz "10:1 até 10:5" (pistola). Confirmar.',
      'Validade: o site dizia 24 meses ("garantia"); a ficha diz 18 meses. Corrigido. Retirados por não constarem na ficha: "evaporação rápida", "odor médio" e "pronto para uso" (vinham de uma loja on-line).',
      'A ficha diz "sem cheiro após 10 minutos" para um diluente à base de solventes. Mantido como na ficha; confirmar.',
    ],
  },

  'portas-janelas': {
    tipo: 'Selante acrílico',
    nomeFicha: 'Cascola Portas & Janelas',
    pdf: "Rev.00-26_Portas & Janelas'.pdf",
    resumo: 'Selante acrílico à base d’água, pronto para uso, para vedar trincas superficiais e dar acabamento em portas e janelas em ambientes internos. É pintável, antimofo e flexível.',
    numeros: [
      ['20 a 25', 'min', 'Formação de pele: tempo para criar uma película na superfície'],
      ['5', 'mm', 'Preenchimento máximo de juntas'],
      ['24 a 72', 'h', 'Cura total, conforme a quantidade de produto e o clima'],
      ['−10 a +80', '°C', 'Resistência à temperatura após a cura'],
    ],
    condicoes: COND_23,
    materiais: ['Madeira', 'Granito', 'Alumínio', 'Vidro', 'Porcelana', 'Cimento'],
    usos: 'Trincas superficiais e fissuras, reparos em paredes de alvenaria e em superfícies porosas, e acabamento em guarnições de portas e janelas.',
    passos: [
      'Deixe a superfície firme, limpa e seca, sem poeira, óleo, graxa ou produto antigo. Abra as trincas e fissuras para o selante penetrar melhor.',
      'Limpe com álcool isopropílico ou acetona. Evite thinner, aguarrás e soluções com sabão.',
      'Use pistola aplicadora e corte o bico na diagonal (45°). Se quiser, proteja os contornos com fita crepe.',
      'Aplique um cordão contínuo e faça o acabamento com espátula de ponta arredondada em até 12 minutos. Retire a fita crepe antes de formar película.',
      'Remova o excesso na hora, com água e sabão ou álcool etílico. A cura total leva de 24 a 72 horas.',
    ],
    atencao: [
      'Somente para uso interno.',
      'Preenchimento de juntas de no máximo 5 mm.',
      'Não pinte com o selante ainda úmido.',
      'Não recomendado para imersão contínua em água, aquários, espelhos ou contato direto com alimentos.',
      NAO_ADERE_SELANTE,
    ],
    dados: [
      ['Base', 'Resinas acrílicas, à base d’água'],
      ['Rendimento', 'Cartucho 450 g: aprox. 30 m com cordão de 3 mm ou 18 m com cordão de 5 mm'],
      ['Embalagem', 'Cartucho de 450 g'],
      ['Validade', '18 meses'],
      ['Armazenamento', 'Local coberto e ventilado, protegido de intempéries, entre 5 °C e 25 °C'],
    ],
    pendencias: [
      'USO INTERNO: a ficha indica uso interno, mas o projeto ligava o produto ao "Batente da porta de entrada" na área externa. Esse ponto foi tirado do site (continua registrado em dados.js, campo `pendente`) até o técnico confirmar.',
      'Embalagem: o site dizia cartucho de 280 g; a ficha diz 450 g. Corrigido conforme a ficha (conferir com a embalagem real).',
      'As fichas do Portas & Janelas e do Acabamentos têm exatamente os mesmos dados técnicos. Confirmar.',
      'O nome do arquivo da ficha termina com um apóstrofo ("Janelas\'.pdf"). Funciona, mas vale renomear na pasta e aqui.',
    ],
  },

  'silicone-construcao': {
    tipo: 'Selante de silicone',
    nomeFicha: 'Cascola Silicone Construção',
    pdf: 'Rev.00-26_Cascola-Silicone-Construção.pdf',
    resumo: 'Selante de silicone estendido, incolor e com fungicida, para vedações internas e externas em materiais não porosos.',
    numeros: [
      ['5 a 15', 'min', 'Formação de pele: tempo para criar uma película na superfície'],
      ['2 a 5', 'mm/24 h', 'Tempo de cura: espessura que cura a cada 24 horas'],
      ['24 a 72', 'h', 'Cura total, conforme a quantidade de produto e o clima'],
      ['−40 a +180', '°C', 'Resistência à temperatura após a cura'],
    ],
    condicoes: COND_23,
    materiais: ['Alumínio', 'Vidro', 'Porcelana', 'PVC', 'Acrílico'],
    usos: 'Box de banheiro, cubas e bacias sanitárias, pias e bancadas de cozinha, encanamentos e ralos, vidros, rejuntes e vitrines.',
    passos: [
      'Limpe a superfície com álcool doméstico (não use gasolina nem querosene) e remova todo o produto antigo. Ela deve estar seca, sem poeira, óleo ou graxa.',
      'Use pistola aplicadora e corte o bico na diagonal (45°).',
      'Se quiser um acabamento reto, proteja as bordas com fita crepe.',
      'Aplique um cordão contínuo e alise (água com detergente neutro ajuda). Retire a fita crepe antes de formar película.',
      'Remova o excesso na hora, com álcool etílico. A cura total leva de 24 a 72 horas.',
    ],
    atencao: [
      'Silicone estendido: pode haver uma leve retração após a cura.',
      'Não aceita pintura.',
      'Não indicado para pedras naturais, madeira e metais como latão, ferro e chumbo.',
      'Não indicado para aquários (tem fungicida) nem para colar espelhos e utensílios.',
      NAO_ADERE_SELANTE,
      'Aplique em local arejado: tem odor acético (de vinagre) durante a aplicação.',
    ],
    dados: [
      ['Base', 'Silicone estendido (borracha de silicone), de cura acética, com fungicida'],
      ['Rendimento', 'Cartucho 280 g: aprox. 23 m com cordão de 4 mm'],
      ['Embalagem', 'Cartucho de 280 g'],
      ['Validade', '18 meses'],
      ['Armazenamento', 'Local coberto e ventilado, protegido de intempéries, abaixo de 28 °C'],
    ],
    pendencias: [
      'Retirado por não constar na ficha: "indicado para esquadrias". O objeto "Guarda-corpo da varanda" deve ser de vidro/alumínio para estar coberto pela ficha. Confirmar o material.',
    ],
  },
};

// Caminho do PDF oficial de um produto, pronto para usar num href (espaços, acentos e "&" codificados).
export const PASTA_FICHAS = 'FichaTecnica/';
export const caminhoFicha = (f) => (f?.pdf ? PASTA_FICHAS + encodeURIComponent(f.pdf) : '');
export { REVISAO };
