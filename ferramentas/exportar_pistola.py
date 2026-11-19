# Exporta a pistola aplicadora (com o cartucho Banheiro e Cozinha) do ferramentas_cascola.blend
# para o site, já na pose que as demonstrações usam:
#   ponta do bico na origem, cartucho para +Y, cabo para +Z, rótulo virado para +X (eixos do glTF)
# Uso:
#   blender -b ferramentas_cascola.blend --python ferramentas/exportar_pistola.py -- saida/pistola.glb
# Depois: npm run ferramentas (comprime as texturas em WebP e a malha com meshopt).
import bpy, sys, os
from mathutils import Matrix

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
SAIDA = os.path.abspath(args[0] if args else '//pistola.glb')
os.makedirs(os.path.dirname(SAIDA), exist_ok=True)

raiz = bpy.data.objects['Pistola_Aplicadora']          # vazio na ponta do bico
# No espaço do próprio vazio a pistola já está na pose do site (cartucho +Z e cabo -Y do Blender,
# que viram +Y e +Z no glTF); na vitrine ele só está girado e deslocado. Basta zerar.
raiz.matrix_world = Matrix.Identity(4)
bpy.context.view_layer.update()

bpy.ops.object.select_all(action='DESELECT')
def marcar(o):
    o.hide_set(False); o.select_set(True)
    for f in o.children:
        marcar(f)
marcar(raiz)
bpy.ops.export_scene.gltf(filepath=SAIDA, export_format='GLB', use_selection=True, export_apply=True,
    export_extras=True, export_lights=False, export_cameras=False, export_yup=True,
    export_image_format='AUTO', export_animations=False, export_texcoords=True, export_normals=True)
print('pistola exportada:', SAIDA)
