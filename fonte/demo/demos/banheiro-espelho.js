// Adesivo de Montagem PL700: colagem do espelho redondo do banheiro na parede.
// Roteiro baseado na ficha técnica do PL700 (fonte/fichas.js):
//   1. "Por que usar": o espelho na parede e os diferenciais do produto (dados.js);
//   2. "Aplicação": o espelho sai da parede e gira 180°, mostrando o verso; o pano limpa o verso;
//      a pistola aplica três cordões verticais; o espelho volta e é pressionado na parede (os
//      cordões achatam e se espalham); duas tiras de fita crepe servem de apoio enquanto a colagem
//      firma e são retiradas no fim;
//   3. "Resultado": o espelho fixo na parede.
//
// Sistema de coordenadas: o da casa (metros, Y para cima). O espelho fica na parede do fundo do
// banheiro (plano z = -3,85), com a face espelhada voltada para +z. Medidas tiradas do banheiro.glb:
//   Banheiro_Espelho     vidro, raio 0,35, de z = -3,831 a -3,819
//   Banheiro_EspelhoLed  placa do LED atrás do vidro, raio 0,36, de z = -3,843 a -3,833
import * as THREE from "three";
import { Caminho, criarCordao, perfilRedondo, perfilFita } from "../cordao.js";
import {
  pistola,
  pano,
  seguirCaminho,
  rolinhoFita,
  pontaPuxada,
  materialFita,
  orientar,
} from "../pecas.js";
import { reto, limita } from "../motor.js";

const CX = 3.05,
  CY = 4.75; // centro do espelho
const ZPAREDE = -3.85,
  ZTRAS = -3.843; // plano da parede e plano de trás do LED
const ZLED = -3.833,
  ZVIDRO = -3.819; // frente da placa do LED e frente do vidro
const RAIO_VIDRO = 0.35,
  RAIO_LED = 0.36;
const VERSO = -0.0008; // z do disco do verso, nas coordenadas do pivô
// Distância que o espelho sai da parede antes de girar. Precisa ser maior que o raio: no meio do
// giro o espelho fica de lado, e a borda chega a RAIO_LED do eixo de giro.
const AFASTA = 0.4;
// Cordões (coordenadas do espelho: x para o lado, y para cima, origem no centro). Três cordões
// verticais; cada um termina 6 cm antes da borda.
const CORDOES = [-0.15, 0, 0.15].map((x) => ({
  x,
  meio: Math.sqrt(RAIO_VIDRO ** 2 - x * x) - 0.06,
}));
const LARGURA_CORDAO = 0.008,
  ALTURA_CORDAO = 0.009;
// Tiras de fita crepe: x de cada tira, largura e quanto ela cobre na parede e no vidro.
const TIRAS = [CX - 0.11, CX + 0.11],
  LARGURA_FITA = 0.025,
  NA_PAREDE = 0.12,
  NO_VIDRO = 0.07;

export default {
  id: "banheiro-espelho",
  produto: "pl700",
  comodo: "banheiro",
  titulo: "Espelho",
  // Câmeras: `camera` é a posição e `alvo` o ponto para onde ela olha (centro do giro da órbita).
  // Na tela larga, cena.js desloca a imagem da demonstração para a direita (setViewOffset); os
  // alvos ficam à direita (+x) do centro do espelho para compensar esse deslocamento. `retrato`:
  // variante usada com a tela em pé (tomadaDe, em palco.js), com o alvo no centro do espelho e a
  // câmera mais afastada. Com o espelho fora da parede (frente do vidro em z = -3,419), os alvos
  // têm z maior que esse, ficando na frente da peça.
  tomadas: {
    geral: { camera: [3.25, 4.75, -2.42], alvo: [3.05, 4.72, -3.8] },
    perto: {
      camera: [3.3, 4.8, -2.72],
      alvo: [3.2, 4.76, -3.8],
      retrato: { camera: [3.2, 4.8, -2.62], alvo: [3.05, 4.7, -3.8] },
    },
    fora: {
      camera: [3.55, 4.98, -2.3],
      alvo: [3.2, 4.76, -3.35],
      retrato: { camera: [3.4, 4.98, -2.2], alvo: [3.05, 4.7, -3.35] },
    },
    verso: {
      camera: [3.7, 5.1, -2.3],
      alvo: [3.16, 4.9, -3.38],
      retrato: { camera: [3.4, 4.95, -2.25], alvo: [3.05, 4.8, -3.38] },
    },
    volta: {
      camera: [3.32, 4.82, -2.55],
      alvo: [3.18, 4.77, -3.38],
      retrato: { camera: [3.2, 4.82, -2.45], alvo: [3.05, 4.72, -3.38] },
    },
    fita: {
      camera: [3.36, 5.05, -2.85],
      alvo: [3.17, 5.0, -3.8],
      retrato: { camera: [3.18, 5.05, -2.75], alvo: [3.05, 4.95, -3.8] },
    },
  },
  // luz de trabalho (sombra das ferramentas e do espelho fora da parede): acima e à direita
  luz: { pos: [3.75, 5.45, -2.85], alvo: [3.05, 4.72, -3.5], forca: 6 },

  montar(ctx) {
    const { r, raiz } = ctx;

    // ---- espelho: o vidro e o LED passam a ser filhos de um pivô no centro do plano de trás.
    // Object3D.attach() troca o pai mantendo a posição no mundo; ctx.pega() registra a posição
    // original de cada peça, que é restaurada quando a demonstração fecha.
    const pivo = new THREE.Group();
    pivo.position.set(CX, CY, ZTRAS);
    raiz.add(pivo);
    pivo.updateMatrixWorld(true);
    for (const nome of ["Banheiro_Espelho", "Banheiro_EspelhoLed"])
      pivo.attach(ctx.pega(nome));
    // Verso do espelho: disco cinza (a tinta de proteção do espelho) com a face voltada para -z do
    // pivô. É ele que projeta a sombra do espelho (as peças do .blend não projetam sombra).
    const verso = new THREE.Mesh(
      new THREE.CircleGeometry(RAIO_LED + 0.002, 72),
      new THREE.MeshStandardMaterial({
        color: "#7f868b",
        roughness: 0.75,
        metalness: 0.1,
        side: THREE.DoubleSide,
      }),
    );
    verso.rotation.y = Math.PI;
    verso.position.z = VERSO;
    verso.castShadow = verso.receiveShadow = true;
    pivo.add(verso);
    // Trilhas espelho.pos / espelho.rot: na parede (rotação 0) e fora dela, girado 180° em torno do
    // eixo vertical, com o verso voltado para a câmera.
    const naParede = [CX, CY, ZTRAS],
      fora = [CX, CY, ZTRAS + AFASTA];
    r.objeto("espelho", pivo, { pos: naParede, rot: [0, 0, 0] });

    // Ponto do verso (x, y nas coordenadas do espelho; `sobe` metros para fora do verso) em
    // coordenadas do mundo, com o espelho fora da parede e girado 180°: o giro troca o sinal de x
    // e de z; o verso, que olhava para -z, passa a olhar para +z.
    const noVersoFora = (x, y, sobe = 0) => [
      CX - x,
      CY + y,
      ZTRAS + AFASTA - VERSO + sobe,
    ];

    // ---- cordões de PL700, filhos do pivô (acompanham o espelho). Cada cordão fica num grupo
    // posicionado no verso; a malha é varrida de cima para baixo ao longo do y do grupo, com a
    // normal -z (para fora do verso). A escala da malha achata o cordão quando o espelho é
    // pressionado: z = altura (direção da normal), x = largura.
    const pl = ctx.materia("pl700");
    const cordoes = CORDOES.map(({ x, meio }, i) => {
      const grupo = new THREE.Group();
      grupo.position.set(x, 0, VERSO);
      const c = new Caminho(
        [
          [0, meio, 0],
          [0, -meio, 0],
        ],
        { normal: [0, 0, -1] },
      );
      const m = criarCordao(
        c,
        perfilRedondo(LARGURA_CORDAO, ALTURA_CORDAO),
        pl.mat,
        { pontas: "cupula", variacao: 0.05, ondula: 0.05, semente: 11 + i },
      );
      grupo.add(m);
      pivo.add(grupo);
      return m;
    });

    // ---- caminho da ponta do bico (no mundo, com o espelho fora da parede): desce um cordão,
    // afasta 6 cm do verso, vai pelo ar até o alto do cordão seguinte e encosta de novo.
    // A ponta corre na altura do topo do cordão (o bico deposita o cordão logo abaixo dele).
    const pontos = [],
      inicios = [];
    CORDOES.forEach(({ x, meio }, i) => {
      const alto = noVersoFora(x, meio, ALTURA_CORDAO),
        baixo = noVersoFora(x, -meio, ALTURA_CORDAO);
      if (i > 0) {
        const ant = pontos[pontos.length - 1];
        pontos.push(
          [ant[0], ant[1], ant[2] + 0.06],
          [alto[0], alto[1], alto[2] + 0.06],
        );
      }
      inicios.push(pontos.length);
      pontos.push(alto, baixo);
    });
    const caminhoPistola = new Caminho(pontos, { normal: [0, 0, 1] });
    // Intervalo [s0, s1] do caminho (s de 0 a 1, proporcional ao comprimento) de cada cordão,
    // e a fração (0 a 1) do cordão já aplicada quando a ponta está em s.
    const sCordao = inicios.map((k) =>
      [k, k + 1].map(
        (j) => caminhoPistola.acum[j] / caminhoPistola.comprimento,
      ),
    );
    const fracao = (s, [s0, s1]) => limita((s - s0) / (s1 - s0));

    // ---- ferramentas
    const arma = pistola("pl700");
    const trapo = pano("#f2efe4", 0.03);
    const rolo = rolinhoFita(LARGURA_FITA),
      ponta = pontaPuxada(LARGURA_FITA);
    arma.name = "Pistola";
    trapo.name = "Pano";
    rolo.name = "RoloFita";
    ponta.name = "PontaFita";
    raiz.add(arma, trapo, rolo, ponta);
    // Pistola com pose fixa (`fixo`): eixo (do bico para o cabo) a 45° da normal do verso, inclinado
    // para cima, no plano vertical do cordão. Como a ponta desce, o bico vai na frente, empurrando o
    // cordão. `lado` é a direção do cabo (-x, para longe da câmera); a abertura do berço, onde
    // aparece o rótulo, fica do lado oposto (+x), virada para a câmera.
    const POSE = { eixo: [0, Math.SQRT1_2, Math.SQRT1_2], lado: [-1, -30, 0] };
    seguirCaminho(r, "pistola", arma, caminhoPistola, {
      fixo: POSE,
      repouso: { desloca: [0.1, 0.22, 0.28] },
      saida: { desloca: [0.12, -0.05, 0.32] },
    });
    // Pano: zigue-zague no verso; inclina 0 deixa o eixo do pano na normal (a base encostada).
    const zigue = [0.22, 0.11, 0, -0.11, -0.22].flatMap((y, i) =>
      i % 2
        ? [
            [-0.22, y],
            [0.22, y],
          ]
        : [
            [0.22, y],
            [-0.22, y],
          ],
    );
    const caminhoPano = new Caminho(
      zigue.map(([x, y]) => noVersoFora(x, y)),
      { normal: [0, 0, 1] },
    );
    seguirCaminho(r, "pano", trapo, caminhoPano, {
      inclina: 0,
      repouso: { desloca: [0.15, 0.2, 0.25] },
      saida: { desloca: [0.15, -0.1, 0.25] },
    });

    // ---- fita crepe. Cada tira segue o perfil da borda do espelho no plano vertical x = x da tira:
    // desce pela parede, passa por cima da placa do LED, desce o degrau até o vidro e desce pelo
    // vidro. Como um Caminho tem uma normal só, cada reta vira um pedaço com a sua normal,
    // perpendicular ao pedaço e para fora (para +y/+z).
    const matFita = materialFita();
    const R_ROLO = 0.033;
    // Altura da borda de um círculo de raio `raio` (centro em CX, CY) na posição x do mundo.
    const borda = (raio, x) => CY + Math.sqrt(raio * raio - (x - CX) ** 2);
    const tiras = TIRAS.map((x) => {
      const folga = 0.0004;
      // A borda é curva: na largura da fita, o lado mais perto do centro (dentro) fica mais alto.
      // Os pedaços da parede e do vidro param na altura desse lado, para a fita não entrar no espelho.
      const dentro = x - (Math.sign(x - CX) * LARGURA_FITA) / 2;
      const yLed = borda(RAIO_LED, dentro) + folga,
        yVidro = borda(RAIO_VIDRO, dentro) + folga;
      const perfil = [
        [yLed + NA_PAREDE, ZPAREDE + folga],
        [yLed, ZPAREDE + folga],
        [yLed, ZLED + folga],
        [yVidro, ZVIDRO + folga],
        [yVidro - NO_VIDRO, ZVIDRO + folga],
      ];
      const caminhos = [];
      for (let i = 1; i < perfil.length; i++) {
        const [y0, z0] = perfil[i - 1],
          [y1, z1] = perfil[i];
        const dy = y1 - y0,
          dz = z1 - z0,
          d = Math.hypot(dy, dz);
        caminhos.push(
          new Caminho(
            [
              [x, y0, z0],
              [x, y1, z1],
            ],
            { normal: [0, dz / d, -dy / d] },
          ),
        );
      }
      // cada pedaço ocupa o intervalo [de, ate] da fração do comprimento total da tira
      const total = caminhos.reduce((soma, c) => soma + c.comprimento, 0);
      let acumulado = 0;
      // Nos pedaços sobre a borda (1 e 2) a fita acompanha a curva na largura: o perfil é uma reta
      // inclinada, com a altura de cada lado igual à da borda do LED naquele x. O lado do perfil
      // (tangente × normal) aponta para -x nesses pedaços, então o lado l fica em x - l.
      // Na rampa (pedaço 2) a normal tem componente y igual a ny: a diferença vertical é dividida por ela.
      const inclinada = (ny) =>
        [-1, 1].map((k) => {
          const l = (k * LARGURA_FITA) / 2;
          return [l, (borda(RAIO_LED, x - l) + folga - yLed) / ny + 0.0002];
        });
      const pedacos = caminhos.map((c, i) => {
        const perfilDaFita =
          i === 1 || i === 2
            ? inclinada(c.normal.y)
            : perfilFita(LARGURA_FITA, 0.0002);
        const m = criarCordao(c, perfilDaFita, matFita, { ladrilho: 0.05 });
        m.castShadow = false;
        raiz.add(m);
        const de = acumulado / total;
        acumulado += c.comprimento;
        return { c, m, de, ate: acumulado / total };
      });
      // O rolo (raio R_ROLO) não cabe no canto entre a parede e a borda do espelho. Ele rola na
      // parede até o ponto A, em que o rolo ainda não encosta na borda (centro R_ROLO + 2 mm acima
      // da placa do LED), passa por cima da borda sem encostar e volta a rolar no vidro a partir
      // do ponto B (alto do vidro). kA e kB: fração da tira nesses dois pontos.
      const yA = yLed + R_ROLO + 0.002;
      const kA = ((yLed + NA_PAREDE - yA) / NA_PAREDE) * pedacos[0].ate,
        kB = pedacos[3].de;
      const A = new THREE.Vector3(x, yA, ZPAREDE + folga),
        B = new THREE.Vector3(x, yVidro, ZVIDRO + folga);
      return { pedacos, kA, kB, A, B };
    });
    // Mostra a tira até a fração k (0 a 1) do comprimento e devolve onde ela termina:
    // { c: pedaço, s: posição dentro dele, i: índice do pedaço }.
    const mostrarTira = ({ pedacos }, k) => {
      let fim = { c: pedacos[0].c, s: 0, i: 0 };
      pedacos.forEach((p, i) => {
        const f = limita((k - p.de) / (p.ate - p.de));
        p.m.userData.mostrar(0, f);
        if (f > 0) fim = { c: p.c, s: f, i };
      });
      return fim;
    };
    // vetores reaproveitados a cada quadro (q recebe p, t, n e b de Caminho.em)
    const q = {},
      n = new THREE.Vector3(),
      t = new THREE.Vector3(),
      pA = new THREE.Vector3(),
      pB = new THREE.Vector3();
    // Ponto de contato do rolo quando a tira está na fração k: na parede até kA, no vidro a partir
    // de kB e, entre os dois, uma interpolação de A para B somada a um arco de 1,5 cm para fora
    // (+z), que mantém o rolo longe da quina do espelho. Na parede e no vidro a normal é +z e o
    // sentido é -y, então a orientação do rolo é a mesma o tempo todo.
    const contato = ({ pedacos, kA, kB, A, B }, k, sai) => {
      if (k <= kA) return sai.copy(pedacos[0].c.em(k / pedacos[0].ate, q).p);
      if (k >= kB) return sai.copy(pedacos[3].c.em((k - kB) / (1 - kB), q).p);
      const a = (k - kA) / (kB - kA);
      sai.lerpVectors(A, B, a);
      sai.z += 0.015 * Math.sin(Math.PI * a);
      return sai;
    };
    const NORMAL = new THREE.Vector3(0, 0, 1),
      SENTIDO = new THREE.Vector3(0, -1, 0);
    orientar(rolo, NORMAL, SENTIDO);
    // Coloca a ponta puxada (convenção do rolo: encosta na origem, sobe em +Y) no fim da tira,
    // virada no sentido do pedaço.
    const naFita = (obj, fim) => {
      fim.c.em(fim.s, q);
      obj.position.copy(q.p);
      orientar(obj, n.copy(q.n), t.copy(q.t));
    };

    // ---- valores iniciais das trilhas
    for (const nome of ["pistola", "pano"]) r.inicio(nome + ".vis", 0);
    for (const [k, v] of Object.entries({
      cura: 0,
      fitaA: 0,
      fitaB: 0,
      tiraA: 0,
      tiraB: 0,
      rolo: 0,
    }))
      r.inicio(k, v);

    // uso de uma ferramenta: aparece, sai do repouso até o começo do caminho (livre 1 -> 0) e, no
    // fim, recua 8 cm pelo próprio eixo e vai para a saída (livre 0 -> 1)
    const chegar = (nome) => r.mostra(nome).vai(nome + ".livre", 0, 1.1);
    const terminar = (nome) =>
      r
        .vai(nome + ".recuo", 0.08, 0.35)
        .vai(nome + ".livre", 1, 0.9)
        .mostra(nome, false)
        .vai(nome + ".recuo", 0, 0.01);

    // ---- roteiro
    r.etapa("porque").tomada("geral", 0.01);
    r.legenda(
      "O espelho é colado direto na parede, sem furar. O PL700 é perfeito para materiais sensíveis, como espelho e acrílico.",
    )
      .destaca(/sensíveis/)
      .espera(4.6);
    r.tomada("perto", 2.4);
    r.legenda(
      "Tem agarre imediato e, mesmo assim, dá até 10 minutos para ajustar a posição.",
    )
      .destaca(/Agarre/)
      .espera(4);
    r.legenda(
      "É transparente, veda e cola: também pode ser usado como selante.",
    )
      .destaca(/Veda/)
      .espera(4);

    r.etapa("aplicacao");
    r.legenda("Para colar, o PL700 vai no verso do espelho.").tomada(
      "fora",
      1.6,
    );
    r.vai("espelho.pos", fora, 1.6)
      .vai("espelho.rot", [0, Math.PI, 0], 1.8)
      .espera(0.4);
    r.tomada("verso", 1.6).legenda(
      "Limpe as superfícies: sem poeira, óleo ou graxa.",
    );
    chegar("pano");
    r.vai("pano.s", 1, 3.2, reto);
    terminar("pano");
    r.legenda(
      "Corte o bico em 45° e aplique o PL700 em cordões verticais.",
    );
    chegar("pistola");
    // nos cordões a ponta anda com velocidade constante; nos trechos pelo ar, com aceleração suave
    sCordao.forEach(([, s1], i) => {
      r.vai("pistola.s", s1, 2.4, reto);
      if (i < sCordao.length - 1) r.vai("pistola.s", sCordao[i + 1][0], 0.8);
    });
    terminar("pistola");
    r.tomada("fora", 1.4).legenda(
      "Posicione o espelho e pressione até o adesivo se espalhar por igual. Você tem até 10 minutos para ajustar.",
    );
    r.cura(0);
    r.vai("espelho.rot", [0, 0, 0], 1.8).tomada("volta", 1.6);
    r.vai("espelho.pos", [CX, CY, ZTRAS + 0.012], 1.2)
      .vai("espelho.pos", naParede, 0.6)
      .espera(1);
    r.tomada("fita", 1.4).legenda(
      "Em peças pesadas, use um apoio até a colagem firmar: aqui, tiras de fita crepe seguram o espelho.",
    );
    // rolo: 0 -> 1 encosta no alto da tira A; 1 -> 2 vai pelo ar até o alto da tira B;
    // 2 -> 3 encosta; 3 -> 4 sai
    r.vai("rolo", 1, 0.6)
      .vai("fitaA", 1, 1.6, reto)
      .vai("rolo", 2, 0.9)
      .vai("rolo", 3, 0.4)
      .vai("fitaB", 1, 1.6, reto)
      .vai("rolo", 4, 0.6)
      .espera(0.6);
    r.tomada("volta", 1.4).legenda(
      "Em 10 a 20 minutos o PL700 forma uma película.",
    );
    r.cura(1).vai("cura", 1, 3);
    r.legenda("A cura total leva de 24 a 72 horas.");
    r.cura(2).vai("cura", 2, 3);
    r.tomada("fita", 1.2).legenda("Com a colagem firme, tire as fitas.");
    r.espera(0.3)
      .vai("tiraA", 1, 1.5, reto)
      .espera(0.2)
      .vai("tiraB", 1, 1.5, reto)
      .espera(0.4);

    r.etapa("resultado").tomada("geral", 1.8);
    r.legenda("Espelho firme na parede, sem furar.").espera(3.6);
    r.legenda(
      "Agarre imediato, transparente, veda e cola: perfeito para espelho e acrílico.",
    )
      .destaca()
      .espera(4.4);

    // ---- a cada quadro
    r.liga((v) => {
      // cordões: cada um aparece de cima para baixo conforme a ponta do bico passa por ele
      const s = v("pistola.s");
      let feito = 0;
      cordoes.forEach((m, i) => {
        const f = fracao(s, sCordao[i]);
        m.userData.mostrar(0, f);
        feito += f / cordoes.length;
      });
      arma.userData.apertar(feito);
      // Achatamento: com o espelho de frente para a parede, o vão entre o verso e a parede é
      // z do pivô + VERSO - ZPAREDE. Quando fica menor que a altura do cordão, a altura passa a ser
      // o vão e a largura cresce na mesma proporção (a seção do cordão mantém a área).
      const vao = pivo.position.z + VERSO - ZPAREDE;
      const k = Math.min(1, vao / ALTURA_CORDAO);
      for (const m of cordoes) m.scale.set(1 / k, 1, k);
      pl.estado(v("cura"));

      // fitas: aparecem atrás do rolo, da parede para o vidro; saem no sentido contrário, puxadas
      // pela ponta que está no vidro
      const fimA = mostrarTira(tiras[0], v("fitaA") * (1 - v("tiraA")));
      const fimB = mostrarTira(tiras[1], v("fitaB") * (1 - v("tiraB")));
      const fr = v("rolo");
      rolo.visible = fr > 0.01 && fr < 3.99;
      if (rolo.visible) {
        // 0 -> 1 encosta (afastado 6 cm pela normal no começo); 1 -> 2 pelo ar até o alto da tira B
        // (interpolação suave); 2 -> 3 encosta; 3 -> 4 sai
        if (fr <= 1)
          contato(tiras[0], v("fitaA"), rolo.position).addScaledVector(
            NORMAL,
            0.06 * (1 - fr),
          );
        else if (fr < 2) {
          const a = fr - 1;
          contato(tiras[0], 1, pA).addScaledVector(NORMAL, 0.06);
          contato(tiras[1], 0, pB).addScaledVector(NORMAL, 0.06);
          rolo.position.lerpVectors(pA, pB, a * a * (3 - 2 * a));
        } else if (fr <= 3)
          contato(tiras[1], v("fitaB"), rolo.position).addScaledVector(
            NORMAL,
            0.06 * (3 - fr),
          );
        else
          contato(tiras[1], 1, rolo.position).addScaledVector(
            NORMAL,
            0.12 * (fr - 3),
          );
        rolo.userData.girar(-(v("fitaA") + v("fitaB")) * 40);
      }
      // ponta puxada: só na parede e no vidro (na borda do espelho não há espaço para ela)
      const ta = v("tiraA"),
        tb = v("tiraB"),
        fim = ta < 1 ? fimA : fimB;
      ponta.visible =
        ((ta > 0 && ta < 1) || (tb > 0 && tb < 1)) &&
        (fim.i === 0 || fim.i === 3);
      if (ponta.visible) naFita(ponta, fim);
    });
  },
};
