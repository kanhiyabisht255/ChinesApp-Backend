import { createHash } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gzipSync } from 'zlib';
import cedict from 'cc-cedict';

const SHARD_COUNT = 64;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const outputDirectory = path.join(projectRoot, 'resources', 'cedict');
const statusPath = path.join(projectRoot, 'node_modules', 'cc-cedict', 'data', 'status.json');

const bucketFor = word => createHash('sha256').update(word).digest()[0] % SHARD_COUNT;
const buckets = Array.from({ length: SHARD_COUNT }, () => Object.create(null));

for (const rawEntry of cedict.data.all) {
  const expanded = cedict.expandValue(rawEntry, rawEntry[4].length > 0);
  const compact = [
    expanded.traditional,
    expanded.simplified,
    expanded.pinyin,
    expanded.english,
    expanded.classifiers,
    expanded.variant_of.map(variant => [variant.traditional, variant.simplified, variant.pinyin]),
    expanded.is_variant ? 1 : 0,
  ];

  for (const word of new Set([expanded.simplified, expanded.traditional])) {
    const bucket = buckets[bucketFor(word)];
    bucket[word] ??= [];
    bucket[word].push(compact);
  }
}

mkdirSync(outputDirectory, { recursive: true });
let compressedBytes = 0;
for (let index = 0; index < SHARD_COUNT; index += 1) {
  const sortedBucket = Object.fromEntries(
    Object.entries(buckets[index]).sort(([left], [right]) => left.localeCompare(right, 'zh'))
  );
  const compressed = gzipSync(JSON.stringify(sortedBucket), { level: 9 });
  const filename = `${index.toString(16).padStart(2, '0')}.json.gz`;
  writeFileSync(path.join(outputDirectory, filename), compressed);
  compressedBytes += compressed.length;
}

const packageStatus = JSON.parse(readFileSync(statusPath, 'utf8'));
const manifest = {
  formatVersion: 1,
  shardCount: SHARD_COUNT,
  entries: cedict.data.all.length,
  source: 'CC-CEDICT',
  sourceUrl: 'https://www.mdbg.net/chinese/dictionary?page=cc-cedict',
  license: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  library: 'cc-cedict',
  libraryVersion: '1.1.1',
  dataUpdatedAt: packageStatus.updated_at,
  generatedAt: new Date().toISOString(),
};
writeFileSync(path.join(outputDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(JSON.stringify({
  entries: manifest.entries,
  shards: SHARD_COUNT,
  compressedMB: Number((compressedBytes / 1024 / 1024).toFixed(2)),
  dataUpdatedAt: manifest.dataUpdatedAt,
}, null, 2));
