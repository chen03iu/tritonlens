import {it,expect} from 'vitest';
import {reconcileDirectIdentities} from '../scripts/reconcile-direct-identities';
import {lookupProfessor,lookupHistoricalCourseGrades} from '../src/data/lookup';
import {validateLocalDataset} from '../src/data/validation';
import type {LocalDataset,ProfessorRecord} from '../src/data/types';

const rating=(id:string)=>({overallRating:4,difficulty:3,ratingCount:5,wouldTakeAgainPercent:80,sourceId:'rmp',updatedAt:'2026-07-23',sourceProfessorId:id});
const person=(id:string,name:string,profile:string|null='101'):ProfessorRecord=>({id,displayName:name,aliases:[],rating:profile?rating(profile):null});
const distribution={aPercent:50,bPercent:50,cPercent:0,dPercent:0,fPercent:0,wPercent:0,pPercent:0,npPercent:0};
const grade=(professorId:string,subjectCode='MATH',catalogNumber='1')=>({professorId,subjectCode,catalogNumber,averageGpa:3.5,sampleSize:null,offeringCount:1,gradeDistribution:distribution,sourceId:'grades',updatedAt:'2026-07-23'});
const evidence=(id:string,displayName:string)=>({id,displayName,observedAt:'2026-10-29'});
function dataset(professors:ProfessorRecord[]):LocalDataset{return {schemaVersion:1,kind:'development',sources:[{id:'rmp',label:'RMP',category:'professor-ratings',homepageUrl:null,termsUrl:null,retrievedAt:'2026-07-23',permissionStatus:'pending',attribution:null},{id:'grades',label:'Grades',category:'historical-grades',homepageUrl:null,termsUrl:null,retrievedAt:'2026-07-23',permissionStatus:'pending',attribution:null}],professors,historicalCourseGrades:[]};}

it('merges exact same-profile duplicates inside a group containing an unrelated person',()=>{
 const input={...dataset([person('canonical','Doe, Jane'),person('stub','Jane Doe'),person('wrong','Other Person')]),historicalCourseGrades:[grade('canonical')]};
 const result=reconcileDirectIdentities(input,[evidence('101','Jane Doe')]);
 expect(result.dataset.professors.map(p=>p.id).sort()).toEqual(['canonical','wrong']);
 expect(lookupProfessor(result.dataset,'Jane Doe')).toMatchObject({status:'found',record:{id:'canonical'}});
 expect(result.dataset.professors.find(p=>p.id==='wrong')?.rating).toBeNull();
 expect(result.dataset.professorIdRedirects).toEqual({stub:'canonical'});
 expect(result.withheldRatings).toContainEqual(expect.objectContaining({professorId:'wrong',sourceProfessorId:'101'}));
});
it('supports a unique source-backed first initial without merging different given names',()=>{
 const input={...dataset([person('canonical','Carr, Jennifer Rose'),person('stub','J. Carr'),person('other','Carr, John')]),historicalCourseGrades:[grade('canonical','PHIL')]};
 const result=reconcileDirectIdentities(input,[{id:'101',displayName:'Jennifer Carr'}]);
 expect(lookupProfessor(result.dataset,'J. Carr')).toMatchObject({status:'found',record:{id:'canonical'}});
 expect(result.dataset.professors.some(p=>p.id==='other')).toBe(true);
});
it('does not bridge conflicting full middle names through an omitted middle name',()=>{
 const input=dataset([person('a','Carr, Jennifer Rose'),person('b','Carr, Jennifer Rachel'),person('short','Jennifer Carr')]);
 const result=reconcileDirectIdentities(input,[{id:'101',displayName:'Jennifer Carr'}]);
 expect(result.dataset.professors).toHaveLength(3);
});
it('does not merge distinct profile IDs even for the same name',()=>{
 const input=dataset([person('a','Jane Doe','101'),person('b','Doe, Jane','202')]);
 expect(reconcileDirectIdentities(input,[{id:'101',displayName:'Jane Doe'},{id:'202',displayName:'Jane Doe'}]).remaps).toEqual([]);
});
it('withholds an incompatible shared-profile donor before collapsing an exact declared empty stub',()=>{
 const input={...dataset([person('canonical','Miller, Pearson',null),person('stub','Pearson Miller','101'),person('actual','Miller, Amanda Pearl','101')]),historicalCourseGrades:[grade('canonical'),grade('actual','FMPH')]};
 const owner={...input.professors[0],aliases:['Pearson Miller']};
 const result=reconcileDirectIdentities({...input,professors:[owner,...input.professors.slice(1)]},[evidence('101','Amanda Miller')]);
 expect(result.dataset.professors.find(p=>p.id==='canonical')?.rating).toBeNull();
 expect(result.dataset.professors.some(p=>p.id==='stub')).toBe(false);
 expect(result.dataset.professors.find(p=>p.id==='actual')?.rating?.sourceProfessorId).toBe('101');
});
it('keeps possible first-name prefixes and reviewed aliases for further review',()=>{
 const prefix=dataset([person('a','Bandaru, Prab'),person('b','Bandaru, Prabhakar')]);
 expect(reconcileDirectIdentities(prefix,[{id:'101',displayName:'Prab Bandaru'}]).withheldRatings).toEqual([]);
 const middle=dataset([person('a','Tezcan, Faik Akif'),person('b','Akif Tezcan')]);
 expect(reconcileDirectIdentities(middle,[{id:'101',displayName:'Faik Akif Tezcan'}]).withheldRatings).toEqual([]);
 const renamed={...dataset([person('a','Oldsurname, Jane'),person('b','Different Person')]),professors:[{...person('a','Oldsurname, Jane'),aliases:['Jane Newsurname']},person('b','Different Person')]};
 expect(reconcileDirectIdentities(renamed,[{id:'101',displayName:'Jane Newsurname'}]).dataset.professors.find(p=>p.id==='a')?.rating).not.toBeNull();
});
it.each([
 ['Shelly Adams Wright','Shelley Wright','101'],
 ['Emmanouil Theodorakis','Emmanuel Theodorakis','101'],
 ['Robert Lugannani','Robert, Lugannani','101'],
 ['Yizhuang You','Yi-Zhuang You','101'],
 ['Jim Kadonaga','James Kadonaga','1315910'],
 ['Nadezhda Polikarpova','Nadia Polikarpova','2371412'],
])('does not revoke a plausible spelling/order or externally verified name variant: %s', (name,sourceName,id)=>{
 const input=dataset([person('a',name,id),person('b',sourceName,id)]);
 expect(reconcileDirectIdentities(input,[evidence(id,sourceName)]).withheldRatings).toEqual([]);
});
it('retains held rename and incompatible or conflicting historical identities',()=>{
 const hold=dataset([person('a','Harpin, Natalye','2321551'),person('b','Pass, Natalye','2321551')]);
 expect(reconcileDirectIdentities(hold,[{id:'2321551',displayName:'Natalye Pass'}]).dataset).toEqual(hold);
 const original=dataset([person('a','Doe, Jane'),person('b','Jane Doe')]);
 const differentSubjects={...original,historicalCourseGrades:[grade('a','MATH'),grade('b','PHIL')]};
 expect(reconcileDirectIdentities(differentSubjects,[{id:'101',displayName:'Jane Doe'}]).remaps).toEqual([]);
 const conflicting={...original,historicalCourseGrades:[grade('a'),{...grade('b'),averageGpa:2}]};
 expect(reconcileDirectIdentities(conflicting,[{id:'101',displayName:'Jane Doe'}]).remaps).toEqual([]);
});
it('preserves every term/history, resolves retired IDs, and is pure/idempotent',()=>{
 const input={...dataset([person('a','Doe, Jane'),person('b','Jane Doe')]),historicalCourseGrades:[grade('a'),grade('b','MATH','2')]};
 const before=JSON.stringify(input);const result=reconcileDirectIdentities(input,[{id:'101',displayName:'Jane Doe'}]);
 expect(JSON.stringify(input)).toBe(before);expect(result.dataset.historicalCourseGrades).toHaveLength(2);
 expect(lookupHistoricalCourseGrades(result.dataset,'b','MATH','2').status).toBe('found');
 expect(reconcileDirectIdentities(result.dataset,[{id:'101',displayName:'Jane Doe'}]).dataset).toEqual(result.dataset);
 expect(validateLocalDataset(result.dataset).valid).toBe(true);
 expect(validateLocalDataset({...result.dataset,professorIdRedirects:{a:'missing'}}).valid).toBe(false);
 expect(validateLocalDataset({...result.dataset,professorIdRedirects:{a:'b',b:'a'}}).valid).toBe(false);
});
it('resolves legacy rounding conflicts only with a newer validated same-profile observation',()=>{
 const canonical={...person('a','Bergen, Leon'),rating:{...rating('101'),wouldTakeAgainPercent:62}};
 const stub={...person('b','Leon Bergen'),rating:{...rating('101'),wouldTakeAgainPercent:63}};
 const input={...dataset([canonical,stub]),historicalCourseGrades:[grade('a','LIGN')]};
 expect(reconcileDirectIdentities(input,[{id:'101',displayName:'Leon Bergen'}]).remaps).toEqual([]);
 const current={...rating('101'),wouldTakeAgainPercent:62.5,sourceId:'rmp',updatedAt:'2026-10-29'};
 const result=reconcileDirectIdentities(input,[{id:'101',displayName:'Leon Bergen',rating:current,observedAt:'2026-10-29'}]);
 expect(result.remaps).toHaveLength(1);expect(result.dataset.professors[0].rating?.wouldTakeAgainPercent).toBe(62.5);
});
it('does not revoke a newer stored profile link using stale or undated identity evidence',()=>{
 const recent={...person('jane','Jane Doe'),rating:{...rating('101'),updatedAt:'2026-10-29'},ratingUpdatedAt:'2026-10-29'};
 const input=dataset([recent,person('mark','Mark Brown')]);
 expect(reconcileDirectIdentities(input,[{id:'101',displayName:'Mark Brown',observedAt:'2026-01-01'}]).dataset.professors.find(p=>p.id==='jane')?.rating).toEqual(recent.rating);
 expect(reconcileDirectIdentities(input,[{id:'101',displayName:'Mark Brown'}]).withheldRatings).toEqual([]);
});
it('does not merge initials-only histories without a corroborated full-name member',()=>{
 const input={...dataset([person('a','J Carr'),person('b','Carr, J')]),historicalCourseGrades:[grade('a','PHIL','1'),grade('b','PHIL','2')]};
 expect(reconcileDirectIdentities(input,[]).remaps).toEqual([]);
 expect(reconcileDirectIdentities(input,[evidence('101','Other Person')]).remaps).toEqual([]);
});
