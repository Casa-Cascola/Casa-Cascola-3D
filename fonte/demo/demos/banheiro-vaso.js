// Silicone Banheiro e Cozinha: vedação da base do vaso sanitário.
// Começa com o vaso limpo, sem silicone: a etapa "Por que usar" mostra onde o cordão vai e explica
// por que vedar e os diferenciais do produto. A aplicação segue a ficha técnica: limpar com álcool
// doméstico, cordão contínuo com o bico cortado em 45°, alisar com água e detergente neutro antes da
// película. (A versão que começava com o silicone velho e mofado está em demos/com-problema/.)
import * as THREE from 'three';
import { Caminho, arcoElipse, criarCordao, perfilRedondo, perfilCantoAlto, deslocar, faixaDaJunta } from '../cordao.js';
import { pistola, espatula, pano, seguirCaminho, seguirCanto } from '../pecas.js';
import { reto } from '../motor.js';

// Pé do vaso no piso (medido no banheiro.blend, depois do Subdivision): uma elipse.
// A frente do vaso olha para -z; atrás (+z) fica a parede da porta.
const CX = 3.40, CZ = -2.14, AX = 0.1296, AZ = 0.1685, PISO = 3.15;
// O cordão contorna a frente e as laterais e deixa um trecho aberto atrás (de 40° a 140°).
const A0 = THREE.MathUtils.degToRad(40), A1 = THREE.MathUtils.degToRad(140 - 360);

export default {
  id: 'banheiro-vaso', produto: 'silicone-banheiro-cozinha', comodo: 'banheiro',
  titulo: 'Vaso sanitário',
  // os alvos ficam sempre do lado de fora do vaso (dentro dele a barreira não deixaria a câmera ver)
  tomadas: {
    geral: { camera: [2.72, 4.40, -3.12], alvo: [3.40, 3.36, -2.42] },
    perto: { camera: [2.96, 3.92, -3.00], alvo: [3.40, 3.25, -2.38] },
    dir: { camera: [3.80, 3.80, -2.78], alvo: [3.58, 3.19, -2.20] },
    frente: { camera: [3.42, 3.84, -3.06], alvo: [3.40, 3.19, -2.37] },
    esq: { camera: [2.80, 3.80, -2.72], alvo: [3.22, 3.19, -2.20] },
    cura: { camera: [3.16, 3.52, -2.76], alvo: [3.41, 3.17, -2.35] },
  },
  luz: { pos: [3.95, 4.9, -2.75], alvo: [3.40, 3.15, -2.20], forca: 5 },

  montar(ctx) {
    const { r, raiz } = ctx;
    ctx.esconde('Banheiro_Vaso_Cordao');      // o cordão pronto do .blend: aqui ele nasce na animação

    // a junta: em volta do pé, rente ao piso
    const junta = new Caminho(arcoElipse(CX, CZ, AX + 0.0004, AZ + 0.0004, PISO + 0.0002, A0, A1, 120), { normal: [0, 1, 0] });

    // ---- onde o cordão vai: faixa laranja no piso e no pé do vaso (só na etapa "Por que usar")
    const faixa = faixaDaJunta(junta, { lado: 0.026, alto: 0.014 });
    raiz.add(faixa);

    // ---- o silicone: como sai do bico, e depois de alisado (um filete côncavo entre o pé e o piso)
    const sil = ctx.materia('silicone-banheiro-cozinha');
    const fresco = criarCordao(junta, deslocar(perfilRedondo(0.0088, 0.0062), 0.0034), sil.mat, { pontas: 'cupula', variacao: 0.05, ondula: 0.05, semente: 3 });
    const alisado = criarCordao(junta, perfilCantoAlto(0.0072, 0.0068), sil.mat, { pontas: 'cupula' });
    raiz.add(fresco, alisado);

    // ---- ferramentas: cada uma chega e sai em linha reta, ao longo do próprio cabo (sem girar perto do vaso)
    const trapo = pano('#f2efe4', 0.03);
    const arma = pistola('silicone-banheiro-cozinha');
    const alisa = espatula(0.014, { corLamina: '#f1f1ee', corCabo: '#e6691d', comprimento: 0.05 });
    trapo.name = 'Pano'; arma.name = 'Pistola'; alisa.name = 'Alisa';
    raiz.add(trapo, arma, alisa);
    // chegam pelo lado direito e saem pelo esquerdo, subindo e vindo para a frente (longe da parede de trás)
    const vemVai = (sobe = 0.2) => ({ repouso: { desloca: [0.1, sobe, -0.18] }, saida: { desloca: [-0.1, sobe, -0.18] } });
    // espátula com o fio atravessado no canto entre o pé e o piso, deitada para trás
    seguirCanto(r, 'alisa', alisa, junta, { largura: 0.014, inclina: 0.7, ...vemVai() });
    // o pano passa no piso, encostado no pé
    const volta = new Caminho(arcoElipse(CX, CZ, AX + 0.037, AZ + 0.037, PISO + 0.001, A0, A1, 120), { normal: [0, 1, 0] });
    seguirCaminho(r, 'pano', trapo, volta, { inclina: 0, ...vemVai(0.12) });
    // pistola: deitada para trás e tombada para fora do vaso; a ponta do bico fica rente ao canto
    // Atrás do vaso fica a parede: no começo a pistola empurra (o corpo vai na frente, longe da parede)
    // e no fim ela puxa (o corpo vem atrás, também longe da parede). Na frente do vaso ela fica de pé.
    const inclinaPistola = (s) => 0.42 * Math.max(-1, Math.min(1, (s - 0.5) / 0.3));
    seguirCaminho(r, 'pistola', arma, junta, { inclina: inclinaPistola, tomba: 0.72, afasta: 0.004, cabo: 'baixo', ...vemVai(0.22) });
    for (const n of ['pano', 'pistola', 'alisa']) r.inicio(n + '.vis', 0);
    for (const [k, v] of Object.entries({ cura: 0, faixa: 0, 'faixa.frente': 0 })) r.inicio(k, v);

    // usa uma ferramenta: aparece, desce até a junta, percorre e sai pelo outro lado
    const chegar = (nome) => r.mostra(nome).vai(nome + '.livre', 0, 1.1);
    const terminar = (nome) => r.vai(nome + '.recuo', 0.1, 0.4).vai(nome + '.livre', 1, 0.9).mostra(nome, false).vai(nome + '.recuo', 0, 0.01);
    const passar = (nome, dur) => { chegar(nome); r.vai(nome + '.s', 1, dur, reto); terminar(nome); };

    // ---- roteiro
    // por que usar: o vaso sem silicone, a faixa mostra onde o cordão vai
    r.etapa('porque').tomada('geral', 0.01);
    r.legenda('Em volta da base do vaso sanitário, um cordão de silicone veda o encontro da louça com o piso: a água da limpeza não entra por baixo.');
    r.anima('faixa', 1, 0.5).anima('faixa.frente', 1, 2.4).espera(2.2);
    r.tomada('perto', 2.2).espera(3.6);
    r.legenda('O Silicone Banheiro e Cozinha é 100% silicone e resistente à água. É próprio para louça sanitária.').destaca(/100%/, /água/).espera(4.8);
    r.legenda('Tem fungicida: resiste ao mofo e à limpeza diária.').destaca(/mofo/).espera(3.4);
    r.legenda('Não encolhe, não trinca e não amarela. E tem 10 anos de garantia.').destaca(/encolhe/, /garantia/).espera(3.8);

    r.etapa('aplicacao');
    r.anima('faixa', 0, 0.7);
    r.legenda('Limpe a base e o piso em volta com álcool doméstico: a superfície precisa estar limpa, seca e sem gordura.');
    passar('pano', 3.4);
    r.legenda('Corte o bico em 45° e aplique um cordão contínuo pela frente e pelos lados do vaso.');
    chegar('pistola');
    r.tomada('dir', 1.1).anima('pistola.s', 1, 9.5, reto);
    r.espera(2.6).tomada('frente', 3.2, true).espera(3.4).tomada('esq', 3.0, true).espera(3.5);
    terminar('pistola');
    r.tomada('perto', 1.4).legenda('Atrás do vaso, deixe um pequeno trecho sem silicone: ele fica como ponto de inspeção da base.').espera(3.6);
    r.legenda('Alise antes de formar a película. Água com detergente neutro ajuda a espátula a deslizar.');
    passar('alisa', 5.2);
    r.tomada('cura').legenda('O silicone sai branco e brilhante. Em 5 a 10 minutos forma uma película e não gruda mais no dedo.');
    r.cura(0).vai('cura', 1, 3.5);
    r.legenda('Por dentro, cura de 2 a 3 mm por dia. Espere a cura total, de 24 a 72 horas, antes de lavar o banheiro.');
    r.cura(1).vai('cura', 1.6, 3);
    r.cura(2).vai('cura', 2, 2.5);

    r.etapa('resultado').tomada('perto', 1.8);
    r.legenda('Base vedada, com acabamento limpo: a água da limpeza não entra por baixo do vaso.').espera(4);
    r.legenda('Resiste ao mofo, não amarela e não encolhe. 10 anos de garantia.').destaca().espera(4.5);

    // ---- a cada quadro
    r.liga((v, t) => {
      faixa.userData.ajustar(v('faixa'), v('faixa.frente'), t);
      const s = v('pistola.s'), a = v('alisa.s');
      fresco.userData.mostrar(a, s);                  // cordão novo atrás do bico
      alisado.userData.mostrar(0, a);                 // e alisado atrás da espátula
      sil.estado(v('cura'));
      arma.userData.apertar(s);
    });
  },
};
