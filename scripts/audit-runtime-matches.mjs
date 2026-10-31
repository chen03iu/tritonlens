import {readFile,mkdir,writeFile,realpath} from 'node:fs/promises';
import {resolve,dirname,basename,join,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';

async function main(){
// Offline diagnostics only: no network, source imports, alias writes or session data.
if(!process.argv[2])throw new Error('Usage: npm.cmd run audit:runtime -- <instructor-audit.json> [runtime-report.json]');
const inputPath=resolve(process.argv[2]);
const outputPath=resolve(process.argv[3]??'reports/data-sync/runtime-instructor-audit.json');
const datasetPath=resolve('src/data/direct-source-dataset.generated.json');
const protectedPaths=[inputPath,datasetPath,resolve('src/data/easy-a-dataset.generated.json')];
const key=path=>process.platform==='win32'?path.toLowerCase():path;
if(extname(outputPath).toLowerCase()!=='.json'||protectedPaths.some(path=>key(path)===key(outputPath))){
 throw new Error('The JSON report must not overwrite the roster or a generated dataset.');
}
const inputText=await readFile(inputPath,'utf8');
const prior=JSON.parse(inputText);
if(prior?.schemaVersion!==1||typeof prior.instructorSnapshotSha256!=='string'||! /^[a-f\d]{64}$/i.test(prior.instructorSnapshotSha256)||
 !Array.isArray(prior.entries)||!prior.entries.length||prior.entries.some(entry=>
  typeof entry?.name!=='string'||!entry.name.trim()||!Array.isArray(entry.courses)||!entry.courses.length||
  entry.courses.some(course=>typeof course!=='string'||!course.trim()))){
 throw new Error('Expected a nonempty instructor audit roster with original snapshot provenance.');
}
const roster=Object.create(null);
for(const entry of prior.entries)for(const course of entry.courses)(roster[course]??=[]).push(entry.name);

await mkdir(dirname(outputPath),{recursive:true});
const canonicalOutput=await realpath(outputPath).catch(async error=>{
 if(error.code!=='ENOENT')throw error;
 return join(await realpath(dirname(outputPath)),basename(outputPath));
});
for(const path of protectedPaths){
 if(key(await realpath(path))===key(canonicalOutput))throw new Error('Report output resolves to a protected input or dataset.');
}
try{
 const existing=JSON.parse(await readFile(outputPath,'utf8'));
 if(existing?.reportType!=='runtime-instructor-audit')throw new Error('Refusing to overwrite unrelated JSON.');
}catch(error){if(error.code!=='ENOENT')throw error;}

const datasetBytes=await readFile(datasetPath);
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const datasetSha256=digest(datasetBytes);
const bundle=await build({
 stdin:{contents:"export {auditRuntimeInstructorMatches} from './src/data/runtime-instructor-audit.ts'; export {DIRECT_DATASET} from './src/data/direct-dataset.ts';",resolveDir:resolve('.'),loader:'ts'},
 bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent',
});
const {auditRuntimeInstructorMatches,DIRECT_DATASET}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
console.log(`Checking ${prior.entries.length} stored instructor names against the bundled snapshot...`);
const result=auditRuntimeInstructorMatches(DIRECT_DATASET,roster);
if(digest(await readFile(datasetPath))!==datasetSha256)throw new Error('Dataset changed during the audit; rerun against one stable snapshot.');
const report={
 schemaVersion:1,reportType:'runtime-instructor-audit',
 instructorSource:typeof prior.instructorSource==='string'?prior.instructorSource:'Stored instructor-audit roster',
 snapshotGenerated:prior.snapshotGenerated??null,
 instructorSnapshotSha256:prior.instructorSnapshotSha256,inputReportSha256:digest(inputText),
 datasetSha256,datasetKind:DIRECT_DATASET.kind,
 datasetSources:DIRECT_DATASET.sources.map(({id,retrievedAt,permissionStatus})=>({id,retrievedAt,permissionStatus})),
 note:'Stored snapshot names, not observed live TSS failures. Name/course pairs are deduplicated. Found history means a course-specific record exists; GPA or percentages can still be unavailable. This checks pending-permission snapshot lookup, not source approval, release readiness or identity proof.',
 ...result,
};
await writeFile(outputPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(result.counts));
console.log(`Wrote ${outputPath}. No aliases, source metrics or held-profile decisions were changed.`);
}

main().catch(error=>{
 // A bundled data URL can contain the full snapshot; never print its stack.
 console.error(error instanceof Error?error.message:String(error));
 process.exitCode=1;
});
