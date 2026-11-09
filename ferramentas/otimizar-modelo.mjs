// Prepara o Casa.glb exportado do Blender para a web:
//   node ferramentas/otimizar-modelo.mjs caminho/para/Casa.glb [tamanho-maximo-das-texturas]
//   (padrão 2048 px; use 1024 para um arquivo menor)
// 1) tira o que não vai para o site (carros fora do app e vazios soltos);
// 2) comprime texturas (WebP) e geometria (meshopt).
// Resultado: modelos/casa.glb. Depois rode `npm run build`.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REMOVER = ['Carro_Supra_NFS', 'CarroGenerico_Corpo', 'Carro_Corpo', 'A23D'];

const entrada = process.argv[2];
const TEXTURA = String(process.argv[3] || 2048);
if (!entrada) { console.error('Uso: node ferramentas/otimizar-modelo.mjs Casa.glb'); process.exit(1); }
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const saida = path.join(raiz, 'modelos/casa.glb');
const tmp = path.join(os.tmpdir(), 'casa_sem_carros.glb');

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(entrada);
const apagar = (n) => { n.listChildren().forEach(apagar); n.dispose(); };
for (const n of doc.getRoot().listNodes()) if (!n.isDisposed() && REMOVER.includes(n.getName())) apagar(n);
await doc.transform(prune());
await io.write(tmp, doc);

const cli = path.join(raiz, 'node_modules/@gltf-transform/cli/bin/cli.js');
const tmp2 = path.join(os.tmpdir(), 'casa_otimizada.glb');
// geometria e tamanho das texturas; a compressão WebP vem depois, com qualidade alta (92)
execFileSync(process.execPath, [cli, 'optimize', tmp, tmp2, '--compress', 'meshopt', '--texture-compress', 'false', '--texture-size', TEXTURA, '--join-named', 'false'], { stdio: 'inherit' });
execFileSync(process.execPath, [cli, 'webp', tmp2, saida, '--quality', '92', '--effort', '80'], { stdio: 'inherit' });
fs.rmSync(tmp); fs.rmSync(tmp2);
console.log('Pronto:', saida, (fs.statSync(saida).size / 1e6).toFixed(1), 'MB');
