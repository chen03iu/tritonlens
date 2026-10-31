import {expect,it} from 'vitest';
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm,access,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';

const snapshot={schemaVersion:1,instructorSource:'Stored test roster',snapshotGenerated:'2026-07-23',instructorSnapshotSha256:'1'.repeat(64),entries:[{name:'David Jordan',courses:['ANTH 087','WCWP 100']}]};
const run=(input,output)=>execFileSync(process.execPath,['scripts/audit-runtime-matches.mjs',input,output],{stdio:'pipe',maxBuffer:1024*1024});

it('audits the bundled direct data through the actual runtime and preserves roster provenance',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'tritonlens-runtime-audit-'));
 try{
  const input=join(dir,'input.json'),output=join(dir,'report.json');
  await writeFile(input,JSON.stringify(snapshot));run(input,output);
  const first=await readFile(output,'utf8'),report=JSON.parse(first);
  expect(report).toMatchObject({schemaVersion:1,reportType:'runtime-instructor-audit',instructorSource:snapshot.instructorSource,snapshotGenerated:snapshot.snapshotGenerated,instructorSnapshotSha256:snapshot.instructorSnapshotSha256,mode:'pending-permission-snapshot',counts:{names:1,pairs:2,identityFound:1,identityNotFound:1,ratingFound:1,historyFound:1,bothFound:1}});
  const bytes=await readFile('src/data/direct-source-dataset.generated.json');
  expect(report.datasetSha256).toBe(createHash('sha256').update(bytes).digest('hex'));
  expect(report.inputReportSha256).toBe(createHash('sha256').update(await readFile(input)).digest('hex'));
  expect(report.entries.find(e=>e.course==='ANTH 87')).toMatchObject({sourceProfessorId:'32591',offeringCount:7});
  expect(report.note).toMatch(/not.*live TSS/i);
  run(input,output);expect(await readFile(output,'utf8')).toBe(first);
 }finally{await rm(dir,{recursive:true,force:true});}
});

it('refuses malformed, empty or unprovenanced input without producing a report',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'tritonlens-runtime-audit-'));
 try{
  const input=join(dir,'input.json'),output=join(dir,'report.json');
  for(const value of [{},{...snapshot,entries:[]},{...snapshot,instructorSnapshotSha256:null},{...snapshot,instructorSnapshotSha256:'z'.repeat(64)},{...snapshot,entries:[{name:'David Jordan',courses:['not a course']}] }]){
   await writeFile(input,JSON.stringify(value));expect(()=>run(input,output)).toThrow();await expect(access(output)).rejects.toThrow();
  }
 }finally{await rm(dir,{recursive:true,force:true});}
});

it('protects an input reached through a directory junction',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'tritonlens-runtime-audit-'));
 try{
  const input=join(dir,'input.json'),alias=join(dir,'alias');
  const original=JSON.stringify(snapshot);await writeFile(input,original);
  await symlink(dir,alias,process.platform==='win32'?'junction':'dir');
  expect(()=>run(input,join(alias,'input.json'))).toThrow(/resolves to a protected/);
  expect(await readFile(input,'utf8')).toBe(original);
 }finally{await rm(dir,{recursive:true,force:true});}
});

it('prints a concise validation error without dumping a bundled data URL',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'tritonlens-runtime-audit-'));
 try{
  const input=join(dir,'input.json'),output=join(dir,'report.json');
  await writeFile(input,JSON.stringify({...snapshot,entries:[{name:'David Jordan',courses:['not a course']}]}));
  let failure;
  try{run(input,output);}catch(error){failure=error;}
  expect(failure).toBeDefined();expect(failure.stderr.toString()).toMatch(/valid course keys/);
  expect(failure.stderr.length).toBeLessThan(1000);await expect(access(output)).rejects.toThrow();
 }finally{await rm(dir,{recursive:true,force:true});}
});

it('protects the roster, both generated datasets and unrelated existing JSON files',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'tritonlens-runtime-audit-'));
 try{
  const input=join(dir,'input.json'),unrelated=join(dir,'unrelated.json');
  await writeFile(input,JSON.stringify(snapshot));await writeFile(unrelated,'{"keep":true}');
  for(const target of [input,'src/data/direct-source-dataset.generated.json','src/data/easy-a-dataset.generated.json',unrelated]){
   const before=createHash('sha256').update(await readFile(target)).digest('hex');
   expect(()=>run(input,target)).toThrow();
   expect(createHash('sha256').update(await readFile(target)).digest('hex')).toBe(before);
  }
 }finally{await rm(dir,{recursive:true,force:true});}
});
