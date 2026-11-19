// Prepara as ferramentas exportadas do Blender (pistola com o cartucho) para a web:
//   node ferramentas/otimizar-ferramentas.mjs pasta/com/os/glb
// Grava em modelos/ferramentas/<arquivo>.glb, com geometria meshopt e texturas WebP.
// O rótulo do cartucho fica com até 2048 px (precisa dar para ler de perto); o resto, 512 px.
// Os nomes e os pivôs das peças (haste, gatilho, trava) ficam iguais: a animação depende deles.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, prune, textureCompress, reorder, quantize } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pasta = process.argv[2];
if (!pasta) { console.error('Uso: node ferramentas/otimizar-ferramentas.mjs pasta/com/os/glb'); process.exit(1); }
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const saida = path.join(raiz, 'modelos/ferramentas');
fs.mkdirSync(saida, { recursive: true });

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
for (const arquivo of fs.readdirSync(pasta).filter((f) => f.endsWith('.glb')).sort()) {
  const doc = await io.read(path.join(pasta, arquivo));
  await doc.transform(
    dedup(), prune(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', pattern: /^rotulo_/, resize: [2048, 2048], quality: 90 }),
    textureCompress({ encoder: sharp, targetFormat: 'webp', pattern: /^(?!rotulo_)/, resize: [512, 512], quality: 85 }),
    reorder({ encoder: MeshoptEncoder }),
    quantize({ pattern: /^(NORMAL|TANGENT)$/ }),
  );
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
  const destino = path.join(saida, arquivo);
  await io.write(destino, doc);
  console.log(`${arquivo}: ${(fs.statSync(path.join(pasta, arquivo)).size / 1e6).toFixed(1)} MB -> ${(fs.statSync(destino).size / 1e6).toFixed(2)} MB`);
}
