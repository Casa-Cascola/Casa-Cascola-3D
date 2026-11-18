// Diminui a memória de vídeo que um .glb já otimizado ocupa, sem mexer na cor:
//   node ferramentas/aliviar-texturas.mjs modelos/casa.glb [saida.glb]
// Os mapas de relevo (normal) e de rugosidade/metal vão com metade do tamanho (no mínimo 512 px).
// Na placa de vídeo cada textura ocupa largura x altura x 4 bytes, seja qual for o tamanho do
// arquivo: a casa tinha 60 texturas de 1024 px, cerca de 366 MB, e o tablet não tem tudo isso.
// Vista de longe (a câmera fica a 7 m ou mais), a diferença no relevo e no brilho não aparece.
// Sem o segundo argumento, grava por cima do próprio arquivo.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { textureCompress } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'node:fs';

const [entrada, saida = entrada] = process.argv.slice(2);
if (!entrada) { console.error('Uso: node ferramentas/aliviar-texturas.mjs modelos/casa.glb [saida.glb]'); process.exit(1); }
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(entrada);

const memoria = () => doc.getRoot().listTextures().reduce((t, x) => { const s = x.getSize(); return t + (s ? s[0] * s[1] : 0); }, 0) * 4 * 1.33 / 1048576;
const antes = memoria();
// cada textura de relevo ou rugosidade vai para a metade do próprio tamanho (2048 -> 1024, 1024 -> 512)
const SLOTS = /^(normalTexture|metallicRoughnessTexture)$/;
const tamanhos = new Set();
for (const t of doc.getRoot().listTextures()) {
  const s = t.getSize();
  if (s && Math.max(...s) > 512) tamanhos.add(Math.max(...s));
}
for (const lado of [...tamanhos].sort((a, b) => b - a)) {
  const alvo = Math.max(512, lado / 2);
  const nomes = new Set(doc.getRoot().listTextures().filter((t) => { const s = t.getSize(); return s && Math.max(...s) === lado; }).map((t) => t.getName() || t.getURI()));
  await doc.transform(textureCompress({
    encoder: sharp, targetFormat: 'webp', quality: 86, slots: SLOTS, resize: [alvo, alvo],
    pattern: new RegExp('^(' + [...nomes].map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')$'),
  }));
}
// a geometria continua comprimida como estava
if (doc.getRoot().listExtensionsUsed().some((e) => e.extensionName === 'EXT_meshopt_compression')) {
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
}
await io.write(saida, doc);
console.log(`${saida}: memória de vídeo das texturas ${antes.toFixed(0)} MB -> ${memoria().toFixed(0)} MB, arquivo ${(fs.statSync(saida).size / 1e6).toFixed(1)} MB`);
