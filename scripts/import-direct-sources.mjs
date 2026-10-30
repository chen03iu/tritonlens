import {readFile,writeFile,mkdir,stat,realpath,lstat,rename,unlink,copyFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
if(args.length<2||!args.includes('--allow-partial-archive'))throw Error('Usage: npm.cmd run import:direct -- <rmp.json> <browser-candidate.json> --allow-partial-archive [--outdir=<candidate directory>]');
if(args.slice(2).some(arg=>arg!=='--allow-partial-archive'&&!arg.startsWith('--outdir=')))throw Error('Unknown import option');
const outputArg=args.find(arg=>arg.startsWith('--outdir='));
const outdir=resolve(root,outputArg?outputArg.slice('--outdir='.length):'src/data');
const output=join(outdir,'direct-source-dataset.generated.json');
const reportDir=outputArg?outdir:join(root,'reports/data-sync');
const backup=outputArg?join(outdir,'direct-source-dataset.previous.json'):join(root,'.cache/tritonlens/direct-source-dataset.previous.json');
const reportPath=join(reportDir,'direct-source-import-report.json');
const reviewPath=join(reportDir,'direct-source-identity-review.md');
const legacyPath=join(root,'src/data/easy-a-dataset.generated.json');
const key=path=>process.platform==='win32'?path.toLowerCase():path;
const protectedPaths=await Promise.all([args[0],args[1],legacyPath].map(path=>realpath(resolve(path))));
async function prospective(path){try{return await realpath(path);}catch(error){if(error.code!=='ENOENT')throw error;const parent=dirname(path);if(parent===path)throw error;return join(await prospective(parent),path.slice(parent.length+1));}}
const targets=[output,backup,reportPath,reviewPath];
for(const path of targets){const target=key(await prospective(path));if(protectedPaths.some(input=>key(input)===target))throw Error('Output would overwrite a protected input');}
async function load(path){const info=await stat(path);if(!info.isFile()||info.size>64*1024*1024)throw Error('Input must be a JSON file smaller than 64 MB');const bytes=await readFile(path);if(bytes.length>64*1024*1024)throw Error('Input exceeds size limit');return {doc:JSON.parse(bytes.toString('utf8')),sha256:createHash('sha256').update(bytes).digest('hex')};}
const rmp=await load(args[0]),grades=await load(args[1]);
const bundle=await build({stdin:{contents:"export {EASY_A_DATASET} from './src/data/easy-a-dataset.ts'; export {transformDirectSources} from './scripts/direct-source-transform.ts'; export {validateLocalDataset} from './src/data/validation.ts';",resolveDir:root,loader:'ts'},bundle:true,write:false,platform:'node',format:'esm',logLevel:'silent'});
let imported;
try{imported=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));}catch(error){throw Error(`Unable to load baseline: ${error.message}`);}
const {EASY_A_DATASET,transformDirectSources,validateLocalDataset}=imported;
const existing=await stat(output).then(()=>true,error=>{if(error.code!=='ENOENT')throw error;return false;});
const baseline=existing?(await load(output)).doc:EASY_A_DATASET;
if(!validateLocalDataset(baseline).valid)throw Error('Current dataset failed validation; refusing to reset it');
let result;
try{result=transformDirectSources(baseline,rmp.doc,grades.doc);}catch(error){throw Error(`Direct source validation failed: ${error.message}`);}
const {dataset,report}=result;
report.inputHashes={rmp:rmp.sha256,ucsd:grades.sha256};
report.baselineSha256=createHash('sha256').update(JSON.stringify(baseline)).digest('hex');
report.datasetCounts={before:{professors:baseline.professors.length,grades:baseline.historicalCourseGrades.length},after:{professors:dataset.professors.length,grades:dataset.historicalCourseGrades.length}};
const baselineProfessors=new Map(baseline.professors.map(p=>[p.id,p]));
const updatedProfessors=new Map(dataset.professors.map(p=>[p.id,p]));
const gradeKey=g=>`${g.professorId}|${g.subjectCode.trim().toUpperCase()}|${g.catalogNumber.trim().toUpperCase().replace(/^0+(?=\d)/,'')}`;
const oldGradeKeys=new Set(baseline.historicalCourseGrades.map(gradeKey));
const newGradeKeys=new Set(dataset.historicalCourseGrades.map(gradeKey));
report.diff={
 addedProfessorIds:dataset.professors.filter(p=>!baselineProfessors.has(p.id)).map(p=>p.id),
 removedProfessorIds:baseline.professors.filter(p=>!updatedProfessors.has(p.id)).map(p=>p.id),
 ratingChanges:dataset.professors.filter(p=>baselineProfessors.has(p.id)&&JSON.stringify(p.rating)!==JSON.stringify(baselineProfessors.get(p.id).rating)).map(p=>({professorId:p.id,name:p.displayName,before:baselineProfessors.get(p.id).rating,after:p.rating})),
 missingRatingRegressions:dataset.professors.filter(p=>baselineProfessors.get(p.id)?.rating&&!p.rating).map(p=>p.id),
 addedCourseKeys:[...newGradeKeys].filter(k=>!oldGradeKeys.has(k)),removedCourseKeys:[...oldGradeKeys].filter(k=>!newGradeKeys.has(k)),
 collapsedDuplicateGradeEntries:baseline.historicalCourseGrades.length-oldGradeKeys.size,
 gradeSemantics:'Direct grade summaries use the latest actual term, replacing legacy unweighted aggregates; percentages are not pooled.'
};
if(report.diff.removedProfessorIds.length||report.diff.removedCourseKeys.length)throw Error('Import would remove a baseline identity or course history');
report.sourceDates=dataset.sources.map(({id,retrievedAt})=>({id,retrievedAt}));
const bytes=JSON.stringify(dataset)+'\n';
if(!validateLocalDataset(JSON.parse(bytes)).valid)throw Error('Serialized candidate failed validation');
report.outputSha256=createHash('sha256').update(bytes).digest('hex');
const groups=new Map();
for(const entry of report.identityReview){const id=JSON.stringify([entry.reason,entry.name,[...entry.candidateIds].sort()]);const group=groups.get(id)??{...entry,profiles:new Set(),courses:new Set(),terms:new Set()};if(entry.sourceProfessorId)group.profiles.add(entry.sourceProfessorId);if(entry.course)group.courses.add(entry.course);if(entry.term)group.terms.add(entry.term);groups.set(id,group);}
const escape=value=>String(value).replace(/[|\r\n]/g,' ');
const review=['# Direct source identity review','','These cases were held; no new identity decision was accepted. Existing observations retain their own provenance.','','| Name | Reason | Incoming profiles | Existing candidates | Courses / terms |','| --- | --- | --- | --- | --- |',...[...groups.values()].map(entry=>`| ${escape(entry.name)} | ${entry.reason} | ${[...entry.profiles].map(id=>`[${id}](https://www.ratemyprofessors.com/professor/${id})`).join(', ')||'—'} | ${entry.candidateIds.map(id=>{const p=baselineProfessors.get(id);return escape(`${p?.displayName??id} (${id}; RMP ${p?.sourceProfessorId??p?.rating?.sourceProfessorId??'unlinked'})`);}).join('; ')||'No unique existing identity'} | ${escape([...entry.courses].join(', '))} ${escape([...entry.terms].sort().join(', '))} |`),''];
await mkdir(outdir,{recursive:true});await mkdir(reportDir,{recursive:true});await mkdir(dirname(backup),{recursive:true});
for(const path of targets){const info=await lstat(path).catch(error=>{if(error.code!=='ENOENT')throw error;return null;});if(info?.isSymbolicLink()||info&& !info.isFile())throw Error('Import target must be a regular file');}
const temporary=join(outdir,`.direct-source-${randomUUID()}.tmp`);
try{
 await writeFile(temporary,bytes,{flag:'wx'});
 if(createHash('sha256').update(await readFile(temporary)).digest('hex')!==report.outputSha256)throw Error('Written candidate hash mismatch');
 await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
 await writeFile(reviewPath,review.join('\n'));
 const exists=await stat(output).then(()=>true,error=>{if(error.code!=='ENOENT')throw error;return false;});
 if(exists)await copyFile(output,backup);
 // Same-directory replacement preserves the previous snapshot if rename fails.
 await rename(temporary,output);
}finally{await unlink(temporary).catch(error=>{if(error.code!=='ENOENT')throw error;});}
console.log(`Imported ${report.ratings.refreshed} refreshed profiles and ${report.grades.matchedRows} source grade terms into ${output}.`);
console.log(`Historical coverage remains partial. Identity review entries: ${report.identityReview.length}. Report: ${reportPath}`);
