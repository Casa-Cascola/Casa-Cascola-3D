# "Assa" a luz do banheiro no Cycles: calcula uma vez a luz e a sombra (com os rebatimentos de luz
# entre as paredes) e grava numa imagem, o lightmap. No site, paredes, piso, louça e móveis só leem
# essa imagem, sem calcular luz nem sombra a cada quadro.
#
# Uso (no terminal, com o Blender 5.x; na pasta do site):
#   blender -b caminho/banheiro.blend --python ferramentas/assar_banheiro.py -- pasta_de_saida [resolucao] [amostras] [pasta_do_site]
#   (padrão: 2048 px e 256 amostras. Aqui, num computador de 2 núcleos sem placa de vídeo,
#    2048 px com 128 amostras levou cerca de uma hora; num notebook com placa de vídeo, ligue a
#    placa em Preferências > Sistema > Cycles e use 256 amostras ou mais)
# Grava na pasta de saída:
#   banheiro.glb           o banheiro para o site, com a segunda UV (a do lightmap)
#   banheiro_luz.exr       o lightmap, em cores lineares
#   banheiro_luz.webp      o lightmap sem ruído, em 8 bits (ferramentas/tratar_luz.py)
#   banheiro_assado.blend  a cópia usada no bake (modificadores aplicados, UV "Luz", imagem)
# Com a pasta do site no fim, já copia o WebP para modelos/comodos/ e anota a escala em
# fonte/demo/luzes-assadas.js. Depois: npm run comodos -- pasta_de_saida  e  npm run build.
# O banheiro.blend original não é alterado.
#
# O que é assado: tudo que é opaco e não é metal. Ficam com a luz calculada no site (sem bake):
# vidros, espelho, metais cromados, o LED do espelho, as folhas da planta, a água do vaso e os
# cordões de silicone (que as demonstrações escondem: assados, deixariam a sombra deles na parede).
import bpy, bmesh, sys, os, re, math, time

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
SAIDA = os.path.abspath(args[0] if args else '//assado')
RES = int(args[1]) if len(args) > 1 else 2048
AMOSTRAS = int(args[2]) if len(args) > 2 else 256
os.makedirs(SAIDA, exist_ok=True)

NAO_ASSA = re.compile(r'Vidro|Espelho$|Led|FolhaEspada|Agua|Cordao')
COLECAO = 'Interior_Banheiro'

def assavel(m):
    if not m or NAO_ASSA.search(m.name):
        return False
    b = next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None) if m.use_nodes else None
    if not b:
        return False
    met = b.inputs['Metallic']
    return met.is_linked or met.default_value < 0.9

t0 = time.time()
sc = bpy.context.scene
camada = bpy.context.view_layer
dg = bpy.context.evaluated_depsgraph_get()
col = bpy.data.collections[COLECAO]

# 1) modificadores aplicados (o Bevel cria faces novas com a UV esticada entre ilhas, o que
#    estragaria o lightmap). A geometria que vai para o site é a mesma: o exportador aplica os
#    modificadores de qualquer jeito.
malhas = [o for o in col.all_objects if o.type == 'MESH']
for o in malhas:
    if not o.modifiers:
        if o.data.users > 1:
            o.data = o.data.copy()
        continue
    nova = bpy.data.meshes.new_from_object(o.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
    nova.name = o.data.name + '_aplicada'
    o.modifiers.clear()
    o.data = nova

# 2) quem é assado: objetos com algum material assável
assar = [o for o in malhas if any(assavel(m) for m in o.data.materials) and not NAO_ASSA.search(o.name)]
mats = {m for o in assar for m in o.data.materials if m}
print(f'assando {len(assar)} objetos, {len(mats)} materiais')

# 3) segunda UV ("Luz"), sem sobreposição, todas as peças numa imagem só.
#    As faces de fora do cômodo (lado de fora das paredes, em cima do forro, embaixo do piso) não
#    aparecem no site: ficam fora da imagem, e o espaço todo vai para o que se vê lá dentro.
#    Caixa do cômodo (a mesma de fonte/demo/comodos.js), em coordenadas do Blender (Z para cima).
CAIXA = ((2.15, 1.75, 3.15), (4.85, 3.85, 5.85))
FOLGA = 0.01

def de_fora(o, p):
    c = o.matrix_world @ p.center
    n = (o.matrix_world.to_3x3() @ p.normal).normalized()
    for eixo in range(3):
        if c[eixo] > CAIXA[1][eixo] + FOLGA and n[eixo] > 0.5:
            return True
        if c[eixo] < CAIXA[0][eixo] - FOLGA and n[eixo] < -0.5:
            return True
    return False

def desdobrar(descartar):
    """UV "Luz" só das faces que aparecem; as de `descartar` (e as de fora) ficam fora da imagem."""
    fora = {}
    for o in assar:
        uv = o.data.uv_layers.get('Luz') or o.data.uv_layers.new(name='Luz')
        o.data.uv_layers.active = uv            # o bake e o desdobramento usam a UV ativa
        for i, l in enumerate(o.data.uv_layers):
            l.active_render = (i == 0)          # as texturas continuam na UV original
        fora[o.name] = {p.index for p in o.data.polygons if de_fora(o, p)} | descartar.get(o.name, set())
    bpy.ops.object.select_all(action='DESELECT')
    for o in assar:
        o.hide_set(False); o.select_set(True)
    camada.objects.active = assar[0]
    bpy.context.tool_settings.mesh_select_mode = (False, False, True)
    bpy.ops.object.mode_set(mode='EDIT')
    # as faces de fora ficam escondidas: não entram na UV nem no empacotamento
    for o in assar:
        bm = bmesh.from_edit_mesh(o.data)
        bm.faces.ensure_lookup_table()
        for f in bm.faces:
            f.hide_set(False)
            f.select_set(f.index not in fora[o.name])
        for f in bm.faces:
            if f.index in fora[o.name]:
                f.hide_set(True)
        bmesh.update_edit_mesh(o.data)
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.0, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)
    bpy.ops.uv.select_all(action='SELECT')
    bpy.ops.uv.average_islands_scale()
    bpy.ops.uv.pack_islands(rotate=True, margin=0.004)
    bpy.ops.mesh.reveal(select=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    # as faces descartadas vão para um ponto fora da imagem: o bake não escreve nada por elas
    for o in assar:
        uv = o.data.uv_layers['Luz']
        for i in fora[o.name]:
            for li in o.data.polygons[i].loop_indices:
                uv.data[li].uv = (1.5, 1.5)
    return sum(len(v) for v in fora.values())

# 4) a imagem do bake e um nó de imagem ativo em cada material
def preparar_imagem(nome, res):
    img = bpy.data.images.get(nome) or bpy.data.images.new(nome, res, res, float_buffer=True, alpha=False)
    if img.size[0] != res:
        img.scale(res, res)
    for m in {m for o in assar for m in o.data.materials if m}:
        nt = m.node_tree
        no = nt.nodes.get('Luz_Bake') or nt.nodes.new('ShaderNodeTexImage')
        no.name = no.label = 'Luz_Bake'
        no.image = img
        no.location = (-900, -600)
        nt.nodes.active = no
        if assavel(m):
            m['cascola_assado'] = 1            # vai para o site (extras do glTF)
    return img

# 5) cena do bake: as luzes de prévia do teto, o LED do espelho e o céu pela janela.
#    O sol fica desligado: no site ele vem do outro lado da casa e não entra pela janela.
for o in bpy.data.objects:
    if o.type == 'LIGHT' and o.data.type == 'SUN':
        o.hide_render = True
    if re.search(r'Cordao', o.name):
        o.hide_render = True
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.max_bounces = 8
sc.cycles.diffuse_bounces = 4
sc.cycles.glossy_bounces = 2
sc.cycles.transmission_bounces = 8
sc.cycles.transparent_max_bounces = 8
sc.cycles.caustics_reflective = False
sc.cycles.caustics_refractive = False
sc.cycles.sample_clamp_indirect = 4.0
sc.render.bake.margin_type = 'EXTEND'
sc.render.bake.use_clear = True

def assar_luz(img, amostras, margem):
    sc.cycles.samples = amostras
    sc.render.bake.margin = margem
    bpy.ops.object.select_all(action='DESELECT')
    for o in assar:
        o.select_set(True)
    camada.objects.active = assar[0]
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT', 'INDIRECT'}, margin=margem, use_clear=True)

# primeira passada, pequena: faces sem luz nenhuma estão enterradas (atrás do gabinete, dentro do
# forro, embaixo do vaso). Elas também saem da imagem, e o espaço vai para o que aparece.
import numpy as np
n = desdobrar({})
previa = preparar_imagem('Luz_Previa', 256)
assar_luz(previa, 8, 2)
px = np.array(previa.pixels[:], dtype=np.float32).reshape(256, 256, 4)[:, :, :3].mean(axis=2)
enterradas = {}
for o in assar:
    uv = o.data.uv_layers['Luz']
    for p in o.data.polygons:
        us = [uv.data[li].uv for li in p.loop_indices]
        if us[0][0] > 1.2:
            continue
        cu = sum(u[0] for u in us) / len(us); cv = sum(u[1] for u in us) / len(us)
        pontos = [(cu, cv)] + [((u[0] * 2 + cu) / 3, (u[1] * 2 + cv) / 3) for u in us[:4]]
        luz = max(px[min(255, max(0, int(v * 256))), min(255, max(0, int(u * 256)))] for u, v in pontos)
        if luz < 0.004:
            enterradas.setdefault(o.name, set()).add(p.index)
print('faces de fora do cômodo:', n, '| enterradas (sem luz):', sum(len(v) for v in enterradas.values()))
desdobrar(enterradas)
print(f'UV pronta em {time.time() - t0:.0f} s')

img = preparar_imagem('Luz_Banheiro', RES)
t1 = time.time()
assar_luz(img, AMOSTRAS, max(4, RES // 256))
print(f'bake pronto em {time.time() - t1:.0f} s ({RES} px, {AMOSTRAS} amostras)')

img.filepath_raw = os.path.join(SAIDA, 'banheiro_luz.exr')
img.file_format = 'OPEN_EXR'
img.save()

# 6) o banheiro para o site, com a UV "Luz" (vira TEXCOORD_1 no glTF). O nó do bake sai dos
#    materiais antes, para o exportador não confundir com uma textura.
for o in bpy.data.objects:
    if re.search(r'Cordao', o.name):
        o.hide_render = False
for m in bpy.data.materials:
    if m.use_nodes and m.node_tree.nodes.get('Luz_Bake'):
        m.node_tree.nodes.remove(m.node_tree.nodes['Luz_Bake'])
bpy.ops.object.select_all(action='DESELECT')
for c in (COLECAO, 'Pontos_Aplicacao'):
    for o in bpy.data.collections[c].all_objects:
        if o.type in ('LIGHT', 'CAMERA'):
            continue
        o.hide_set(False); o.select_set(True)
bpy.ops.export_scene.gltf(filepath=os.path.join(SAIDA, 'banheiro.glb'), export_format='GLB', use_selection=True,
    export_apply=True, export_extras=True, export_lights=False, export_cameras=False, export_yup=True,
    export_image_format='AUTO', export_animations=False, export_texcoords=True, export_normals=True)

img.pack()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SAIDA, 'banheiro_assado.blend'), copy=True)

# 7) o lightmap para o site: sem ruído, em WebP, com a escala anotada
SITE = os.path.abspath(args[3]) if len(args) > 3 else None
aqui = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.path.join(SITE or '.', 'ferramentas')
sys.path.insert(0, aqui)
import tratar_luz
webp = os.path.join(SITE, 'modelos', 'comodos', 'banheiro_luz.webp') if SITE else os.path.join(SAIDA, 'banheiro_luz.webp')
modulo = os.path.join(SITE, 'fonte', 'demo', 'luzes-assadas.js') if SITE else None
tratar_luz.tratar(os.path.join(SAIDA, 'banheiro_luz.exr'), webp, modulo, 'banheiro', url='modelos/comodos/banheiro_luz.webp')
print(f'tudo pronto em {time.time() - t0:.0f} s -> {SAIDA}')
