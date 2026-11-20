# Prepara o lightmap assado para o site: tira o ruído do bake, grava em WebP e anota a escala.
# Roda sozinho, no Blender (que lê EXR e grava WebP):
#   blender -b --python ferramentas/tratar_luz.py -- banheiro_luz.exr modelos/comodos/banheiro_luz.webp fonte/demo/luzes-assadas.js banheiro
# O assar_banheiro.py já chama este script no fim; use este só para refazer a conversão.
#
# O bake guarda a luz em números lineares sem limite (um canto escuro dá 0,02, perto da luz dá 8).
# O WebP tem 8 bits: a luz é dividida por uma escala (o ponto mais claro que importa), passa para
# sRGB (mais degraus nos escuros, onde o olho percebe) e o site multiplica de volta pela escala.
import bpy, sys, os, json
import numpy as np


ESCURO_DEMAIS = 0.02      # luz linear do bake abaixo disso = ponto enterrado

# teste
def srgb(x):
    return np.where(x <= 0.0031308, 12.92 * x, 1.055 * np.power(np.clip(x, 0.0031308, None), 1 / 2.4) - 0.055)


def tirar_pontos(rgb, coberto, raio=2, limite=1.6):
    """Tira os vagalumes do bake (pontos muito mais claros ou mais escuros que a vizinhança, comuns
    nos cantos pouco iluminados): o ponto que foge da mediana dos vizinhos volta para a mediana,
    mantendo a cor dele. Faz por faixas de linhas para não estourar a memória."""
    lum = np.where(coberto, np.log(rgb.mean(axis=2) + 1e-4), np.nan).astype(np.float32)
    h = lum.shape[0]; med = np.empty_like(lum); faixa = 256
    for y0 in range(0, h, faixa):
        y1 = min(h, y0 + faixa)
        pedaco = np.take(lum, range(y0 - raio, y1 + raio), axis=0, mode='wrap')
        pilha = np.stack([np.roll(np.roll(pedaco, dy, 0), dx, 1) for dy in range(-raio, raio + 1) for dx in range(-raio, raio + 1)])
        with np.errstate(all='ignore'):
            med[y0:y1] = np.nanmedian(pilha, axis=0)[raio:raio + (y1 - y0)]
    fora = coberto & (np.abs(lum - med) > np.log(limite))
    fator = np.where(fora, np.exp(med - lum), 1.0)
    print(f'  vagalumes corrigidos: {fora.sum()} ({100 * fora.sum() / max(1, coberto.sum()):.2f}% dos pontos)')
    return rgb * fator[..., None]


def tirar_ruido(rgb, coberto, passadas=3, raio=4, sigma_espaco=2.2, sigma_luz=0.35):
    """Filtro bilateral: média dos vizinhos que têm luz parecida (em escala log). Alisa o ruído do
    bake e preserva a borda das sombras e das ilhas da UV. Só usa vizinhos que o bake pintou."""
    for _ in range(passadas):
        lum = np.log(rgb.mean(axis=2) + 1e-3)
        soma = np.zeros_like(rgb); peso = np.zeros(rgb.shape[:2], np.float32)
        for dy in range(-raio, raio + 1):
            for dx in range(-raio, raio + 1):
                d2 = dx * dx + dy * dy
                if d2 > raio * raio:
                    continue
                viz = np.roll(np.roll(rgb, dy, 0), dx, 1)
                lv = np.roll(np.roll(lum, dy, 0), dx, 1)
                cv = np.roll(np.roll(coberto, dy, 0), dx, 1)
                w = np.exp(-d2 / (2 * sigma_espaco ** 2)) * np.exp(-((lv - lum) ** 2) / (2 * sigma_luz ** 2)) * cv
                soma += viz * w[..., None]; peso += w
        rgb = np.where(coberto[..., None], soma / np.maximum(peso, 1e-6)[..., None], rgb)
    return rgb


def balancear(rgb, coberto, alvo=(1.0, 0.9, 0.8)):
    """Balanço de branco: a cor média da luz assada passa a ser `alvo` (a mesma luz quente-clara do
    teto no site), sem mudar o brilho. Sem isso a louça branca fica creme: no bake a luz das
    lâmpadas de prévia é bem amarela e ainda rebate na madeira e no bege do cômodo."""
    media = rgb[coberto].mean(axis=0)
    alvo = np.array(alvo, np.float32)
    ganho = (alvo / alvo[0]) / (media / media[0])
    pesos = np.array([0.2126, 0.7152, 0.0722], np.float32)       # brilho (Rec. 709)
    ganho = ganho * (pesos @ media) / (pesos @ (media * ganho))
    print(f'  balanço de branco: média {np.round(media, 3)} -> ganhos {np.round(ganho, 3)}')
    return rgb * ganho


def preencher(rgb, coberto, passadas=24):
    """Espalha a luz das ilhas para o espaço vazio em volta (dilatação). Sem isso, ao ver a peça de
    longe (mipmaps) ou bem na borda da ilha, a placa de vídeo mistura a luz com o cinza de fora e
    aparece um contorno escuro nas quinas."""
    rgb = rgb.copy(); feito = coberto.copy()
    for _ in range(passadas):
        soma = np.zeros_like(rgb); n = np.zeros(feito.shape, np.float32)
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)):
            f = np.roll(np.roll(feito, dy, 0), dx, 1)
            soma += np.roll(np.roll(rgb, dy, 0), dx, 1) * f[..., None]; n += f
        novos = ~feito & (n > 0)
        if not novos.any():
            break
        rgb[novos] = soma[novos] / n[novos][:, None]
        feito |= novos
    rgb[~feito] = np.median(rgb[coberto], axis=0)
    return rgb


def tratar(exr, webp, modulo_js=None, nome='banheiro', url=None):
    img = bpy.data.images.load(exr, check_existing=False)
    w, h = img.size
    px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)[..., :3]
    # Pontos quase pretos (60 vezes mais escuros que a luz típica do cômodo) são do bake, não de
    # sombra: o centro do pixel caiu dentro de outra peça (onde a cuba encosta na bancada, nas
    # quinas do gabinete). Eles saem e são preenchidos com a luz dos vizinhos, como o espaço vazio.
    coberto = px.mean(axis=2) > ESCURO_DEMAIS
    print(f'  pontos de dentro das peças: {int(((px.max(axis=2) > 0) & ~coberto).sum())}')
    limpo = tirar_pontos(tirar_pontos(px, coberto), coberto, raio=3, limite=1.45)
    limpo = tirar_ruido(limpo, coberto)
    limpo = balancear(limpo, coberto)
    lum = limpo.mean(axis=2)[coberto]
    escala = float(np.percentile(lum, 99.7)) * 1.15          # um pouco de folga acima do mais claro
    v = srgb(np.clip(preencher(limpo, coberto) / escala, 0, 1))
    saida = bpy.data.images.new('luz_8bits', w, h, alpha=False)
    rgba = np.concatenate([v, np.ones((h, w, 1), np.float32)], axis=2)
    saida.pixels.foreach_set(rgba.ravel())
    saida.filepath_raw = webp
    saida.file_format = 'WEBP'
    bpy.context.scene.render.image_settings.quality = 92
    saida.save()
    info = {'arquivo': url or 'modelos/comodos/' + os.path.basename(webp), 'escala': round(escala, 5), 'largura': w}
    print(f'lightmap: {webp} ({w} px), escala {escala:.4f}, mediana {np.median(lum):.3f}')
    if modulo_js:
        atual = {}
        if os.path.exists(modulo_js):
            txt = open(modulo_js, encoding='utf-8').read()
            ini = txt.find('{'); fim = txt.rfind('}')
            try:
                atual = json.loads(txt[ini:fim + 1])
            except Exception:
                atual = {}
        atual[nome] = info
        with open(modulo_js, 'w', encoding='utf-8') as f:
            f.write('// Gerado por ferramentas/tratar_luz.py: a luz assada de cada cômodo (lightmap) e a escala\n'
                    '// para voltar dos 8 bits do WebP para a luz do bake. Não precisa editar.\n'
                    'export const LUZES_ASSADAS = ' + json.dumps(atual, ensure_ascii=False, indent=2) + ';\n')
    return info


if __name__ == '__main__' and '--' in sys.argv:
    a = sys.argv[sys.argv.index('--') + 1:]
    if len(a) >= 2 and a[0].endswith('.exr'):
        tratar(a[0], os.path.abspath(a[1]), os.path.abspath(a[2]) if len(a) > 2 else None, a[3] if len(a) > 3 else 'banheiro',
               url='modelos/comodos/' + os.path.basename(a[1]))
