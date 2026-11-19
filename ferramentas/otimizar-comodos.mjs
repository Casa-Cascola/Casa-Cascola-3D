// Prepara os cômodos exportados do Blender (um .glb por cômodo) para a web:
//   node ferramentas/otimizar-comodos.mjs pasta/com/os/glb [tamanho-maximo-das-texturas]
// Grava em modelos/comodos/<arquivo>.glb, com geometria meshopt e texturas WebP.
// Os nomes dos objetos e a posição de cada um ficam iguais: as animações dependem deles.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, prune, weld, textureCompress, reorder, quantize } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// texturas das peças pequenas ou lisas (pelo nome da imagem no .blend)
const MIUDAS = /^(inox|felpudo|granulado|parede)_/;
const GRANDES = /^(?!(inox|felpudo|granulado|parede)_)/;
const pasta = process.argv[2];
const TEXTURA = Number(process.argv[3] || 1024);
if (!pasta) { console.error('Uso: node ferramentas/otimizar-comodos.mjs pasta/com/os/glb [1024]'); process.exit(1); }
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const saida = path.join(raiz, 'modelos/comodos');
fs.mkdirSync(saida, { recursive: true });

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

for (const arquivo of fs.readdirSync(pasta).filter((f) => f.endsWith('.glb')).sort()) {
  const doc = await io.read(path.join(pasta, arquivo));
  await doc.transform(
    dedup(),
    prune({ keepLeaves: true, keepAttributes: true }),   // mantém a segunda UV (TEXCOORD_1): o lightmap usa, mas ela não é textura do glTF
    weld(),
    // Na placa de vídeo cada textura ocupa largura x altura x 4 bytes (mais 1/3 das reduções), seja
    // qual for o tamanho do arquivo: uma de 1024 px ocupa 5,6 MB. Por isso:
    // - relevo (normal) e rugosidade são detalhe fino: vão com metade do tamanho;
    // - as peças pequenas ou lisas (metais, toalhas, forro, vaso da planta) vão com metade em tudo;
    // - só a cor das superfícies grandes, que a câmera vê de perto, fica com o tamanho cheio.
    textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^(normalTexture|metallicRoughnessTexture)$/, resize: [TEXTURA / 2, TEXTURA / 2], quality: 80 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^(?!normalTexture$|metallicRoughnessTexture$)/, pattern: MIUDAS, resize: [TEXTURA / 2, TEXTURA / 2], quality: 86 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', slots: /^(?!normalTexture$|metallicRoughnessTexture$)/, pattern: GRANDES, resize: [TEXTURA, TEXTURA], quality: 86 }),
    reorder({ encoder: MeshoptEncoder }),
    // só normais e tangentes são arredondadas: arredondar as posições mudaria a origem das peças,
    // e as animações giram e encaixam cada peça pela origem dela
    quantize({ pattern: /^(NORMAL|TANGENT)$/ }),
  );
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
  const destino = path.join(saida, arquivo);
  await io.write(destino, doc);
  console.log(arquivo.padEnd(22), (fs.statSync(path.join(pasta, arquivo)).size / 1e6).toFixed(1).padStart(5), 'MB  ->', (fs.statSync(destino).size / 1e6).toFixed(2), 'MB');
}
