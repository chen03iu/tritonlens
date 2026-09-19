import { readFile, writeFile } from 'node:fs/promises';

// SVG image previews cannot rely on sibling files being loaded by the viewer.
const templateUrl = new URL('../assets/tritonlens-trident-preview.svg', import.meta.url);
const sourceUrl = new URL('../assets/tritonlens-icon-source.png', import.meta.url);
const outputUrl = new URL('../assets/tritonlens-trident-preview-standalone.svg', import.meta.url);
const template = await readFile(templateUrl, 'utf8');
const source = await readFile(sourceUrl);
const reference = 'href="tritonlens-icon-source.png"';
if (!template.includes(reference)) {
  throw new Error('Expected original lens reference in the SVG template.');
}
await writeFile(outputUrl, template.replace(
  reference,
  `href="data:image/png;base64,${source.toString('base64')}"`,
));
console.log('Exported self-contained TritonLens icon preview.');
