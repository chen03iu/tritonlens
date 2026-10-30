import {mkdtemp,writeFile,readFile,rm,mkdir,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {it,expect,afterEach} from 'vitest';

const root=new URL('../',import.meta.url);
const temporary=[];
async function setup(){const dir=await mkdtemp(join(tmpdir(),'tritonlens-direct-'));temporary.push(dir);const rmp=join(dir,'rmp.json'),grades=join(dir,'grades.json');await writeFile(rmp,JSON.stringify({coverage:{complete:true,recordCount:0},rows:[]}));await writeFile(grades,JSON.stringify({schemaVersion:1,exporterVersion:'0.1.1',kind:'ucsd-browser-session-candidate',sourceUrl:'https://qa-as.ucsd.edu/Home/InstructorGradeArchive',retrievedAt:'2026-10-29T08:00:00Z',query:{quarter:'',year:'',instructor:'',subject:'',courseNumber:''},coverage:{complete:false,recordCount:1,query:'all-filters-blank',requiresPipelineValidation:true},parseIssues:[],rows:[{subject:'AAS',courseNumber:'10',year:'26',quarter:'SP',title:'Example',instructor:'Butler, Elizabeth Annette',gpa:3.2,grades:{A:40,B:40,C:20,D:0,F:0,W:0,P:0,NP:0},sourceCells:{gpa:'3.2',grades:{A:'40%',B:'40%',C:'20%',D:'0%',F:'0%',W:'0%',P:'0%',NP:'0%'}}}]}));return {dir,rmp,grades,output:join(dir,'output')};}
function run(s,...flags){return execFileSync(process.execPath,['scripts/import-direct-sources.mjs',s.rmp,s.grades,...flags,`--outdir=${s.output}`],{cwd:root,encoding:'utf8',stdio:'pipe'});}
afterEach(async()=>{await Promise.all(temporary.splice(0).map(p=>rm(p,{recursive:true,force:true})));});
it('requires explicit acknowledgment of partial historical coverage',async()=>{const s=await setup();expect(()=>run(s)).toThrow(/allow-partial-archive/);});
it('imports offline, hashes inputs, and retains a rollback copy on replacement',async()=>{
 const s=await setup();expect(run(s,'--allow-partial-archive')).toContain('Imported');
 const out=JSON.parse(await readFile(join(s.output,'direct-source-dataset.generated.json'),'utf8'));
 const grade=out.historicalCourseGrades.find(g=>g.subjectCode==='AAS'&&g.catalogNumber==='10'&&g.sourceId==='direct-ucsd-grades');
 expect(grade).toMatchObject({averageGpa:3.2,sampleSize:null,terms:[{year:2026,quarter:'SP'}]});
 const report=JSON.parse(await readFile(join(s.output,'direct-source-import-report.json'),'utf8'));
 expect(report.inputHashes.rmp).toMatch(/^[a-f0-9]{64}$/);expect(report.archive.complete).toBe(false);
 expect(JSON.stringify(out)).not.toContain('sourceCells');
 run(s,'--allow-partial-archive');expect(await readFile(join(s.output,'direct-source-dataset.previous.json'),'utf8')).toBe(JSON.stringify(out)+'\n');
 const history=await readdir(join(s.output,'history'));
 const audits=await Promise.all(history.map(file=>readFile(join(s.output,'history',file),'utf8')));
 expect(audits.some(bytes=>JSON.parse(bytes).baselineSha256===report.baselineSha256)).toBe(true);
});
it('preserves the prior dataset when validation fails',async()=>{
 const s=await setup();await mkdir(s.output);const output=join(s.output,'direct-source-dataset.generated.json');await writeFile(output,'previous valid snapshot');
 await writeFile(s.grades,'{}');expect(()=>run(s,'--allow-partial-archive')).toThrow();expect(await readFile(output,'utf8')).toBe('previous valid snapshot');
});
it('refuses to overwrite an input through output-path aliases',async()=>{
 const s=await setup();await mkdir(s.output);s.rmp=join(s.output,'direct-source-dataset.generated.json');const bytes=JSON.stringify({coverage:{complete:true,recordCount:0},rows:[]});await writeFile(s.rmp,bytes);
 expect(()=>run(s,'--allow-partial-archive')).toThrow();expect(await readFile(s.rmp,'utf8')).toBe(bytes);
});
it('preserves newer direct ratings and grades when older files are imported later',async()=>{
 const s=await setup();const teacher={legacyId:1410511,displayName:'Libby Butler',schoolGraphId:'U2Nob29sLTEwNzk=',rating:4.8,difficulty:2,ratingCount:40,wouldTakeAgainPercent:90,retrievedAt:'2026-10-29T08:00:00Z'};
 await writeFile(s.rmp,JSON.stringify({coverage:{complete:true,recordCount:1},rows:[teacher]}));
 run(s,'--allow-partial-archive');
 const older=JSON.parse(await readFile(s.grades,'utf8'));older.retrievedAt='2026-10-01T08:00:00Z';older.rows[0].gpa=1.2;older.rows[0].sourceCells.gpa='1.2';
 await writeFile(s.grades,JSON.stringify(older));await writeFile(s.rmp,JSON.stringify({coverage:{complete:true,recordCount:1},rows:[{...teacher,rating:1,retrievedAt:older.retrievedAt}]}));
 run(s,'--allow-partial-archive');const out=JSON.parse(await readFile(join(s.output,'direct-source-dataset.generated.json'),'utf8'));
 expect(out.professors.find(p=>p.rating?.sourceProfessorId==='1410511').rating).toMatchObject({overallRating:4.8,updatedAt:'2026-10-29'});
 expect(out.historicalCourseGrades.find(g=>g.subjectCode==='AAS'&&g.catalogNumber==='10'&&g.sourceId==='direct-ucsd-grades').averageGpa).toBe(3.2);
 expect(out.sources.find(s=>s.id==='direct-rmp').retrievedAt).toBe('2026-10-29');
});
