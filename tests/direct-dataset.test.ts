import {it,expect} from 'vitest';
import {DIRECT_DATASET} from '../src/data/direct-dataset';
import {EASY_A_DATASET} from '../src/data/easy-a-dataset';
import {lookupProfessor,lookupHistoricalCourseGrades} from '../src/data/lookup';
import {validateLocalDataset} from '../src/data/validation';

it('uses validated direct metrics while preserving all baseline identities and reviewed aliases',()=>{
 expect(validateLocalDataset(DIRECT_DATASET).valid).toBe(true);
 const ids=new Map(DIRECT_DATASET.professors.map(p=>[p.id,p]));
 for(const p of EASY_A_DATASET.professors){const current=ids.get(DIRECT_DATASET.professorIdRedirects?.[p.id]??p.id);expect(current).toBeDefined();for(const alias of p.aliases)expect([current!.displayName,...current!.aliases]).toContain(alias);expect([current!.displayName,...current!.aliases]).toContain(p.displayName);}
 for(const name of ['Mark Anderson','Keiko Nomura','Justin Opatkiewicz','Aaron Shalev','Daphne Taylor García','Linnea Wilder','Nathan Delson']){
  const before=lookupProfessor(EASY_A_DATASET,name),after=lookupProfessor(DIRECT_DATASET,name);
  expect(before.status).toBe('found');expect(after.status).toBe('found');
  if(before.status==='found'&&after.status==='found')expect(after.record.id).toBe(before.record.id);
 }
 expect(DIRECT_DATASET.professors.filter(p=>p.rating?.sourceId==='direct-rmp').length).toBeGreaterThan(2500);
});
it('stores individual grade terms with accurate partial provenance and no invented enrollment',()=>{
 const rows=DIRECT_DATASET.historicalCourseGrades.filter(g=>g.sourceId==='direct-ucsd-grades');
 expect(rows.reduce((n,g)=>n+(g.terms?.length??0),0)).toBeGreaterThan(29000);
 for(const row of rows){expect(row.sampleSize).toBeNull();expect(row.averageGpa).toBe(row.terms?.[0].averageGpa);}
 expect(DIRECT_DATASET.sources.find(s=>s.id==='direct-ucsd-grades')).toMatchObject({retrievedAt:'2026-10-29',permissionStatus:'pending',homepageUrl:'https://qa-as.ucsd.edu/Home/InstructorGradeArchive',label:expect.stringContaining('partial')});
 const libby=lookupProfessor(DIRECT_DATASET,'Libby Butler');expect(libby.status).toBe('found');
 if(libby.status==='found')expect(lookupHistoricalCourseGrades(DIRECT_DATASET,libby.record.id,'AAS','010').status).toBe('found');
});
