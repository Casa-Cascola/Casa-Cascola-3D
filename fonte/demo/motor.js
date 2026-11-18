// Roteiro: a linha do tempo de uma demonstração.
// Tudo é função do tempo. Por isso dá para pausar, voltar e arrastar a barra:
// a cena é sempre recalculada para o instante pedido, sem "lembrar" do quadro anterior.
//
//   r.inicio('pano.pos', [0, 1, 0])       valor antes de tudo
//   r.vai('pano.pos', [1, 1, 0], 2)       anima em 2 s e avança o cursor
//   r.anima('pano.rot', [0, 1, 0], 2)     anima sem avançar o cursor (acontece junto com o próximo)
//   r.espera(1)                           avança o cursor
//   r.etapa('aplicacao') / r.legenda('…') / r.tomada('perto') / r.cura(1)   marcas no tempo
//   r.destaca(/mofo/, /garantia/)         acende no painel os diferenciais do produto que batem com o texto
//   r.objeto('pano', malha)               liga um objeto 3D às trilhas pano.pos / .rot / .esc / .vis
//   r.liga((v, t) => { … })               código que roda a cada quadro, lendo v('chave')

export const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const reto = (t) => t;
export const freia = (t) => 1 - Math.pow(1 - t, 3);
export const arranca = (t) => t * t;
export const limita = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const mistura = (a, b, k) => (typeof a === 'number' ? a + (b - a) * k : a.map((v, i) => v + (b[i] - v) * k));
// 0 antes de `a`, 1 depois de `b`, suave no meio
export const degrau = (a, b, v) => { const k = limita((v - a) / (b - a)); return k * k * (3 - 2 * k); };

export class Roteiro {
  constructor() {
    this.t = 0;            // cursor de montagem
    this.dur = 0;          // duração total
    this.trilhas = new Map();
    this.etapas = []; this.legendas = []; this.tomadas = []; this.curas = []; this.destaques = [];
    this.ligacoes = [];
  }

  // ---------------------------------------------------------------- montagem
  trilha(chave) {
    if (!this.trilhas.has(chave)) this.trilhas.set(chave, { inicial: null, trechos: [] });
    return this.trilhas.get(chave);
  }
  inicio(chave, valor) { this.trilha(chave).inicial = valor; return this; }
  anima(chave, para, dur = 0, curva = suave) {
    this.trilha(chave).trechos.push({ t0: this.t, t1: this.t + dur, para, curva });
    this.dur = Math.max(this.dur, this.t + dur);
    return this;
  }
  vai(chave, para, dur = 0, curva = suave) { this.anima(chave, para, dur, curva); return this.espera(dur); }
  espera(d) { this.t += d; this.dur = Math.max(this.dur, this.t); return this; }
  mostra(nome, sim = true) { return this.anima(nome + '.vis', sim ? 1 : 0, 0); }
  etapa(id) { this.etapas.push({ id, t: this.t }); return this; }
  legenda(texto) { this.legendas.push({ t: this.t, texto }); return this; }
  // `reto`: a câmera vai da tomada anterior até esta em velocidade constante, durante `dur` (acompanha uma ferramenta)
  tomada(nome, dur = 1.6, reto = false) { this.tomadas.push({ t: this.t, nome, dur, reto }); return this; }
  cura(i) { this.curas.push({ t: this.t, i }); return this; }
  // os diferenciais (de dados.js) que acendem neste instante e ficam acesos dali em diante;
  // sem argumento, acende todos
  destaca(...padroes) { this.destaques.push({ t: this.t, padroes }); return this; }
  liga(fn) { this.ligacoes.push(fn); return this; }

  // último valor já programado para a chave (o ponto de partida do próximo movimento)
  fimDe(chave) {
    const tr = this.trilha(chave);
    return tr.trechos.length ? tr.trechos[tr.trechos.length - 1].para : tr.inicial;
  }

  // Liga um objeto 3D: a posição, a rotação (Euler XYZ, em radianos), a escala e a
  // visibilidade dele passam a vir das trilhas `nome.pos`, `nome.rot`, `nome.esc`, `nome.vis`.
  objeto(nome, obj, { pos, rot, vis } = {}) {
    this.inicio(nome + '.pos', pos || obj.position.toArray());
    this.inicio(nome + '.rot', rot || [obj.rotation.x, obj.rotation.y, obj.rotation.z]);
    this.inicio(nome + '.esc', obj.scale.toArray());
    this.inicio(nome + '.vis', vis === false ? 0 : 1);
    return this.liga((v) => {
      obj.position.fromArray(v(nome + '.pos'));
      const e = v(nome + '.rot'); obj.rotation.set(e[0], e[1], e[2]);
      obj.scale.fromArray(v(nome + '.esc'));
      obj.visible = v(nome + '.vis') > 0.5;
    });
  }

  // Leva uma ferramenta de onde está até `pos`: sobe, viaja e desce, para não atravessar nada.
  viaja(nome, pos, rot, { dur = 1.6, sobe = 0.14 } = {}) {
    const de = this.fimDe(nome + '.pos');
    const alto = Math.max(de[1], pos[1]) + sobe;
    this.vai(nome + '.pos', [de[0], alto, de[2]], dur * 0.25);
    if (rot) this.anima(nome + '.rot', rot, dur * 0.5);
    this.vai(nome + '.pos', [pos[0], alto, pos[2]], dur * 0.5);
    return this.vai(nome + '.pos', pos, dur * 0.25);
  }

  // Depois de montar: ordena os trechos e encadeia o valor de partida de cada um.
  fecha() {
    for (const tr of this.trilhas.values()) {
      tr.trechos.sort((a, b) => a.t0 - b.t0);
      let ant = tr.inicial ?? tr.trechos[0]?.para;
      tr.inicial = ant;
      for (const s of tr.trechos) { s.de = ant; ant = s.para; }
    }
    this.dur += 0.001;
    return this;
  }

  // ---------------------------------------------------------------- leitura
  valor(chave, t) {
    const tr = this.trilhas.get(chave);
    if (!tr) return undefined;
    let s = null;
    for (let i = tr.trechos.length - 1; i >= 0; i--) if (tr.trechos[i].t0 <= t) { s = tr.trechos[i]; break; }
    if (!s) return tr.inicial;
    const k = s.t1 > s.t0 ? limita((t - s.t0) / (s.t1 - s.t0)) : 1;
    return k >= 1 ? s.para : mistura(s.de, s.para, s.curva(k));
  }
  aplica(t) {
    const v = (chave) => this.valor(chave, t);
    for (const fn of this.ligacoes) fn(v, t);
  }
  // a última marca que já passou (etapa, legenda, tomada ou cura)
  ultima(lista, t) {
    let m = null;
    for (const x of lista) if (x.t <= t + 1e-6) m = x;
    return m;
  }
}
