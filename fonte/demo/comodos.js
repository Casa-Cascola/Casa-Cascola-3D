// Os cômodos por dentro. Medidas em metros, no sistema da casa (Y para cima, rua em +Z).
//
//   arquivo   modelos/comodos/<arquivo>.glb (exportado do <arquivo>.blend)
//   caixa     o vão livre do cômodo, de parede a parede e do piso ao forro: [x0, y0, z0, x1, y1, z1].
//             É a barreira: a câmera não sai daqui de dentro.
//   vista     o enquadramento ao entrar (e ao voltar de uma demonstração); `alvo` é o centro do giro
//   vistaRetrato  o mesmo, para a tela em pé (celular): a imagem é estreita, a câmera mira entre os pontos
//   chegada   de onde a câmera parte, já dentro, para dar a sensação de entrar
//   fora      enquadramento do lado de fora, de frente para a janela do cômodo (entrada e saída)
//   encosta   a câmera quase encostando na janela, quando a tela escurece para entrar
//   esconder  peças da casa que tampam o cômodo por dentro (a caixa maciça das paredes, a janela fechada)
//   ladoVisivel  só o que fica deste lado aparece pela janela (o resto da casa some, para o tablet não pesar)
//   fundoPorta   placa escura atrás da porta fechada: pelas frestas aparece um corredor apagado, e não o céu
//   pontos    pontos de aplicação com demonstração: viram as gotas dentro do cômodo
export const COMODOS3D = {
  banheiro: {
    arquivo: 'banheiro',
    caixa: [2.15, 3.15, -3.85, 4.85, 5.85, -1.75],
    vista: { camera: [2.30, 5.12, -2.30], alvo: [3.20, 4.22, -2.72], exato: true },
    vistaRetrato: { camera: [2.28, 5.10, -2.25], alvo: [3.30, 4.20, -2.85], exato: true },
    chegada: { camera: [2.24, 5.12, -2.02], alvo: [3.05, 4.40, -2.50], exato: true },
    fora: { camera: [7.4, 5.25, -2.5], alvo: [5.0, 4.95, -2.5] },
    encosta: { camera: [5.45, 4.97, -2.5], alvo: [4.4, 4.9, -2.5] },
    esconder: ['Casa_Paredes', 'Jan_Banheiro'],
    ladoVisivel: { eixo: 'x', de: 4.85 },
    fundoPorta: { x0: 2.15, x1: 3.05, y0: 3.10, y1: 5.40, z: -1.66 },
    pontos: [
      { demo: 'banheiro-vaso', nome: 'Vaso sanitário', pos: [3.40, 3.30, -2.45] },
      { demo: 'banheiro-box', nome: 'Box', pos: [3.885, 3.85, -3.80] },
      { demo: 'banheiro-espelho', nome: 'Espelho', pos: [3.30, 4.42, -3.79] },
    ],
  },
};
