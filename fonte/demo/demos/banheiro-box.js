// Silicone Banheiro e Cozinha: vedação entre o perfil de alumínio do box e a parede.
// por que vedar e os diferenciais do produto. A aplicação segue a ficha técnica: limpar com álcool
// doméstico, fita crepe opcional (tirar antes da película), cordão contínuo com o bico em 45°, alisar
// com água e detergente neutro. (A versão com o silicone velho e mofado está em demos/com-problema/.)
import * as THREE from 'three';
import { Caminho, criarCordao, perfilRedondo, perfilCantoAlto, perfilFita, deslocar, faixaDaJunta } from '../cordao.js';
import { pistola, espatula, pano, seguirCaminho, seguirCanto, rolinhoFita, pontaPuxada, materialFita, orientar } from '../pecas.js';
import { reto, limita, mistura } from '../motor.js';

// A junta: canto entre a face do perfil (x = 3,898, olhando para o banheiro) e a parede (z = -3,85).
// Vai de cima (embaixo do trilho de cima) até embaixo (em cima do trilho de baixo).
const XJ = 3.898, ZJ = -3.85, Y0 = 3.184, Y1 = 5.096;
const FITA_PAREDE = 0.0225, FITA_PERFIL = 0.019;

export default {
  id: 'banheiro-box', produto: 'silicone-banheiro-cozinha', comodo: 'banheiro',
  titulo: 'Box',
  // os alvos ficam no ar, do lado de fora do box (a barreira não deixa a câmera passar pelo vidro nem pelo gabinete)
  // A câmera fica quase sempre no vão entre o gabinete e o box (x de 3,6 a 3,86), olhando a parede de frente:
  // assim a ferramenta, que se inclina para o lado da bancada, não tampa o bico.
  tomadas: {
    // de longe, da porta: o box inteiro e a junta de cima a baixo
    geral: { camera: [3.32, 4.32, -2.12], alvo: [3.88, 4.14, -3.84] },
    alto: { camera: [3.74, 5.00, -3.30], alvo: [3.875, 4.97, -3.82] },
    meio: { camera: [3.74, 4.40, -3.25], alvo: [3.875, 4.18, -3.82] },
    baixo: { camera: [3.74, 3.74, -3.22], alvo: [3.875, 3.37, -3.82] },
    cura: { camera: [3.79, 4.19, -3.68], alvo: [3.888, 4.12, -3.842] },
  },
  // luz de trabalho rasante, do lado da bancada: a parede quase não recebe, a face do perfil e o filete
  // recebem. Assim o silicone branco aparece contra a parede branca (com luz de frente, some).
  luz: { pos: [3.02, 4.62, -3.70], alvo: [3.89, 4.15, -3.845], forca: 9 },

  montar(ctx) {
    const { r, raiz } = ctx;
    ctx.esconde('Banheiro_Box_Cordao');       // o cordão pronto do .blend: aqui ele nasce na animação

    // de cima para baixo, com a normal da parede (+z): o lado do perfil (−x) fica para o banheiro
    const junta = new Caminho([[XJ, Y1, ZJ], [XJ, Y0, ZJ]], { normal: [0, 0, 1] });

    // ---- onde o cordão vai: faixa laranja na parede e na face do perfil (só na etapa "Por que usar")
    const faixa = faixaDaJunta(junta, { lado: 0.036, alto: 0.026 });
    raiz.add(faixa);

    // ---- fita crepe dos dois lados da junta (na parede e na face do perfil)
    const caminhoFitaParede = new Caminho([[XJ - 0.0076 - FITA_PAREDE / 2, Y1, ZJ + 0.0004], [XJ - 0.0076 - FITA_PAREDE / 2, Y0, ZJ + 0.0004]], { normal: [0, 0, 1] });
    const caminhoFitaPerfil = new Caminho([[XJ - 0.0004, Y1, ZJ + 0.0072 + FITA_PERFIL / 2], [XJ - 0.0004, Y0, ZJ + 0.0072 + FITA_PERFIL / 2]], { normal: [-1, 0, 0] });
    const matFita = materialFita();
    const fitaParede = criarCordao(caminhoFitaParede, perfilFita(FITA_PAREDE, 0.0002), matFita, { ladrilho: 0.05 });
    const fitaPerfil = criarCordao(caminhoFitaPerfil, perfilFita(FITA_PERFIL, 0.0002), matFita, { ladrilho: 0.05 });
    fitaParede.castShadow = fitaPerfil.castShadow = false;
    raiz.add(fitaParede, fitaPerfil);

    // ---- o silicone novo: como sai do bico, e depois de alisado (filete côncavo no canto)
    const sil = ctx.materia('silicone-banheiro-cozinha');
    const fresco = criarCordao(junta, deslocar(perfilRedondo(0.0078, 0.0056), 0.003), sil.mat, { pontas: 'cupula', variacao: 0.05, ondula: 0.05, semente: 6 });
    const alisado = criarCordao(junta, perfilCantoAlto(0.0072, 0.0068), sil.mat, { pontas: 'cupula' });
    raiz.add(fresco, alisado);

    // ---- ferramentas. O trilho de cima fica bem em cima da junta: perto dele elas trabalham deitadas
    // (passam por baixo do trilho); perto da bancada, quase de pé (não batem no gabinete).
    // As ferramentas andam de Y1F a Y0F; o cordão vai de Y1 a Y0 (s da ferramenta -> s do cordão)
    const Y1F = 5.084, Y0F = 3.19;
    const caminhoFerramenta = new Caminho([[XJ, Y1F, ZJ], [XJ, Y0F, ZJ]], { normal: [0, 0, 1] });
    const noCordao = (sf) => (Y1 - mistura(Y1F, Y0F, sf)) / (Y1 - Y0);
    const trapo = pano('#f2efe4', 0.026);
    const arma = pistola('silicone-banheiro-cozinha');
    const alisa = espatula(0.014, { corLamina: '#f1f1ee', corCabo: '#e6691d', comprimento: 0.05 });
    const rolo = rolinhoFita(FITA_PAREDE), ponta = pontaPuxada(FITA_PAREDE);
    arma.name = 'Pistola'; alisa.name = 'Alisa'; rolo.name = 'RoloFita'; trapo.name = 'Pano'; ponta.name = 'PontaFita';
    raiz.add(trapo, arma, alisa, rolo, ponta);
    const BIS = [-Math.SQRT1_2, 0, Math.SQRT1_2];                       // para fora do canto, na direção do banheiro
    const deitada = (sf, alto, normal) => {                               // inclinação das espátulas: pequena no alto
      const y = mistura(Y1F, Y0F, sf);
      return y > 4.98 ? mistura(alto, normal, limita((Y1F - y) / 0.1)) : normal;
    };
    seguirCanto(r, 'alisa', alisa, caminhoFerramenta, { largura: 0.014, inclina: (sf) => deitada(sf, 0.25, 0.7), repouso: { recua: 0.22 }, saida: { recua: 0.3 } });
    // pano: encostado no canto, pela bissetriz
    const caminhoPano = new Caminho([[XJ - 0.029, 5.05, ZJ + 0.029], [XJ - 0.029, 3.21, ZJ + 0.029]], { normal: [0, 0, 1] });
    seguirCaminho(r, 'pano', trapo, caminhoPano, { fixo: { eixo: BIS, lado: [0, 1, 0] }, repouso: { recua: 0.25 }, saida: { recua: 0.25 } });
    // pistola: inclinada 39° da vertical, na bissetriz do canto. O canto é apertado (parede atrás, vidro
    // de um lado, gabinete do outro), então ela gira um pouco no próprio eixo na descida (de 125° no alto
    // a 160° perto do piso), com o cabo para o lado da parede e a abertura do berço, onde aparece o
    // rótulo, virada para a câmera. (Ângulos achados por busca, contra a parede, o vidro, o gabinete,
    // a bancada, o piso e o forro; depois conferidos na varredura de colisão.)
    // perto do trilho de cima ela começa quase deitada (83°) e chega a 39° em 13 cm de descida
    const U1 = new THREE.Vector3(Math.SQRT1_2, 0, Math.SQRT1_2);
    const posePistola = (sf) => {
      const y = mistura(Y1F, Y0F, sf), alto = limita((y - 4.95) / 0.134);
      const a = 0.68 + (1.45 - 0.68) * alto * alto;
const g = THREE.MathUtils.degToRad(
  125 + 180 + 20 * alto + 35 * limita((4.3 - y) / 1.1)
);
      const eixo = new THREE.Vector3(BIS[0] * Math.sin(a), Math.cos(a), BIS[2] * Math.sin(a));
      const u2 = eixo.clone().cross(U1).normalize();
      return { eixo: eixo.toArray(), lado: U1.clone().multiplyScalar(Math.cos(g)).addScaledVector(u2, Math.sin(g)).toArray() };
    };
    // sai subindo e vindo para o banheiro (recuar pelo eixo, embaixo, entraria no gabinete)
    seguirCaminho(r, 'pistola', arma, caminhoFerramenta, { afasta: 0.006, repouso: { recua: 0.24 }, saida: { desloca: [0.03, 0.32, 0.3] }, fixo: posePistola });
    for (const n of ['pano', 'pistola', 'alisa']) r.inicio(n + '.vis', 0);
    for (const [k, v] of Object.entries({ cura: 0, fitaA: 0, fitaB: 0, tiraA: 0, tiraB: 0, rolo: 0, faixa: 0, 'faixa.frente': 0 })) r.inicio(k, v);

    const chegar = (nome) => r.mostra(nome).vai(nome + '.livre', 0, 1.1);
    // a pistola só desencosta 2 cm (sai pelo 'desloca'); as outras recuam 8 cm pelo próprio eixo
    const terminar = (nome) => r.vai(nome + '.recuo', nome === 'pistola' ? 0.02 : 0.08, 0.35).vai(nome + '.livre', 1, 0.9).mostra(nome, false).vai(nome + '.recuo', 0, 0.01);
    // a câmera desce junto com a ferramenta (de 'alto' até 'baixo')
    const descer = (nome, dur) => { chegar(nome); r.tomada('alto', 1.0).espera(0.2).tomada('baixo', dur, true).vai(nome + '.s', 1, dur, reto); terminar(nome); };

    // ---- roteiro
    // por que usar: a junta sem silicone; a faixa se desenha de cima para baixo, mostrando onde o cordão vai
    r.etapa('porque').tomada('geral', 0.01);
    r.legenda('Do lado de fora do box, a junta entre o perfil de alumínio e a parede leva silicone de cima a baixo: ela mantém a água do banho dentro do box.');
    r.anima('faixa', 1, 0.5).anima('faixa.frente', 1, 2.6).espera(3.2);
    r.tomada('meio', 2.4).espera(2.6);
    r.legenda('O Silicone Banheiro e Cozinha é 100% silicone e resistente à água. Adere no vidro, no alumínio e na porcelana.').destaca(/100%/, /água/).espera(4.8);
    r.legenda('Tem fungicida: resiste ao mofo e à limpeza diária.').destaca(/mofo/).espera(3.4);
    r.legenda('Não encolhe, não trinca e não amarela. E tem 10 anos de garantia.').destaca(/encolhe/, /garantia/).espera(3.8);

    r.etapa('aplicacao');
    r.anima('faixa', 0, 0.7);
    r.legenda('Limpe a junta com álcool doméstico: ela precisa estar limpa, seca e sem gordura.');
    descer('pano', 3.2);
    // fita crepe: o rolo desce colando a fita na parede e depois na face do perfil
    r.tomada('meio', 1.3).legenda('Para um acabamento reto, cole fita crepe dos dois lados da junta.');
    // rolo: 0→1 chega no alto da fita da parede; 1→2 vai pelo ar até o alto do perfil; 2→3 encosta; 3→4 sai
    r.vai('rolo', 1, 0.7).vai('fitaA', 1, 2.4, reto).vai('rolo', 2, 0.9).vai('rolo', 3, 0.4).vai('fitaB', 1, 2.4, reto).vai('rolo', 4, 0.6);
    r.legenda('Corte o bico em 45° e aplique um cordão contínuo, de cima a baixo, sem parar no meio.');
    descer('pistola', 7);
    r.legenda('Alise com a espátula umedecida em água com detergente neutro.');
    descer('alisa', 4.5);
    r.tomada('meio', 1.2).legenda('Tire a fita logo depois de alisar, antes de formar a película.');
    r.espera(0.3).vai('tiraA', 1, 2, reto).espera(0.3).vai('tiraB', 1, 2, reto).espera(0.3);
    r.tomada('cura').legenda('O silicone sai branco e brilhante. Em 5 a 10 minutos forma uma película e não gruda mais no dedo.');
    r.cura(0).vai('cura', 1, 3.5);
    r.legenda('Por dentro, cura de 2 a 3 mm por dia. Espere a cura total, de 24 a 72 horas, antes de usar o chuveiro.');
    r.cura(1).vai('cura', 1.6, 3);
    r.cura(2).vai('cura', 2, 2.5);

    r.etapa('resultado').tomada('meio', 1.6).legenda('Junta vedada, com acabamento reto: a água do banho fica dentro do box.').espera(3.6);
    r.legenda('Resiste ao mofo, não amarela e não encolhe. 10 anos de garantia.').destaca().espera(4.8);

    // ---- a cada quadro
    const q = {}, n = new THREE.Vector3(), t = new THREE.Vector3();
    // o rolo de fita (ou a ponta que é puxada) num ponto `s` de um caminho de fita
    const naFita = (obj, caminho, s, sobe = 0) => {
      caminho.em(s, q);
      obj.position.copy(q.p).addScaledVector(q.n, sobe);
      orientar(obj, n.copy(q.n), t.copy(q.t));
    };
    r.liga((v, tempo) => {
      faixa.userData.ajustar(v('faixa'), v('faixa.frente'), tempo);
      // fita: aparece atrás do rolo; sai de baixo para cima quando é puxada
      fitaParede.userData.mostrar(0, v('fitaA') * (1 - v('tiraA')));
      fitaPerfil.userData.mostrar(0, v('fitaB') * (1 - v('tiraB')));
      const fr = v('rolo');
      rolo.visible = fr > 0.01 && fr < 3.99;
      if (rolo.visible) {
        const lim = (k) => mistura(0.03, 0.97, k);   // o rolo não chega nos trilhos (a ponta da fita é colada à mão)
        if (fr <= 1) naFita(rolo, caminhoFitaParede, lim(v('fitaA')), 0.06 * (1 - fr));
        else if (fr < 2) {
          // pelo ar, do pé da fita da parede até o alto do perfil (de frente para o perfil na metade do caminho)
          const k = fr - 1;
          naFita(rolo, k < 0.5 ? caminhoFitaParede : caminhoFitaPerfil, k < 0.5 ? lim(1) : lim(0), 0.06);
          caminhoFitaParede.em(lim(1), q); const de = q.p.clone().addScaledVector(q.n, 0.06);
          caminhoFitaPerfil.em(lim(0), q); const para = q.p.clone().addScaledVector(q.n, 0.06);
          rolo.position.lerpVectors(de, para, k * k * (3 - 2 * k));
        } else if (fr <= 3) naFita(rolo, caminhoFitaPerfil, lim(v('fitaB')), 0.06 * (3 - fr));
        else naFita(rolo, caminhoFitaPerfil, lim(1), 0.06 * (fr - 3) * 2);
        rolo.userData.girar(-(v('fitaA') + v('fitaB')) * 60);
      }
      // a ponta da fita que está sendo puxada (de baixo para cima)
      const ta = v('tiraA'), tb = v('tiraB');
      ponta.visible = (ta > 0 && ta < 1) || (tb > 0 && tb < 1);
      if (ponta.visible) {
        if (ta < 1) naFita(ponta, caminhoFitaParede, 1 - ta);
        else naFita(ponta, caminhoFitaPerfil, 1 - tb);
      }
      // cordão novo atrás do bico (no alto, o primeiro trecho embaixo do trilho já sai junto) e alisado atrás da espátula
      const sg = v('pistola.s'), s = sg > 0 ? (sg >= 1 ? 1 : noCordao(sg)) : 0;
      const sa = v('alisa.s'), a = sa > 0 ? (sa >= 1 ? 1 : noCordao(sa)) : 0;
      fresco.userData.mostrar(a, s);
      alisado.userData.mostrar(0, a);
      sil.estado(v('cura'));
      arma.userData.apertar(sg);
    });
  },
};
