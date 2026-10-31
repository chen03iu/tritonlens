import {expect,it} from 'vitest';
import {selectReviewedProfiles} from '../scripts/reviewed-profile-selection';
import {auditRuntimeInstructorMatches} from '../src/data/runtime-instructor-audit';
import {DIRECT_DATASET} from '../src/data/direct-dataset';
import {MOCK_DATASET} from '../src/data/mock-dataset';
import {validateLocalDataset} from '../src/data/validation';
import type {LocalDataset,ProfessorRecord} from '../src/data/types';

const cases=[
 {name:'Ahmed-Waeil Elgamal',owner:'Elgamal, Ahmed',id:'easy-a-elgamal-ahmed-91acae5cb9',course:'SE 180',stubs:[{id:'easy-a-ahmed-waeil-elgamal-d76d2936bc',displayName:'Ahmed-Waeil Elgamal',aliases:[],rating:null}]},
 {name:'Dhananjay Bambah-Mukku',owner:'Mukku, Dhananjaya',id:'easy-a-mukku-dhananjaya-b6b1b85f8c',course:'PSYC 171',profile:'2739870',profileName:'Dhananjaya Mukku',department:'Psychology',stubs:[{id:'easy-a-dhananjay-bambah-mukku-ac86b94076',displayName:'Dhananjay Bambah-Mukku',aliases:[],rating:null}]},
 {name:'Leo Porter',owner:'Porter, Leonard Emerson',id:'easy-a-porter-leonard-emerson-513019c4be',course:'CSE 8A',profile:'1992362',profileName:'Leo Porter',department:'Computer Science',donorId:'easy-a-leo-porter-fa90a62a23',stubs:[{id:'easy-a-leo-porter-c60262726f',displayName:'Leo Porter',aliases:[],rating:null},{id:'easy-a-leo-porter-fa90a62a23',displayName:'Leo Porter',aliases:[],rating:null}]},
];
function fixture(rule:typeof cases[number]){
 const source={...MOCK_DATASET.sources[0],id:'direct-rmp',category:'professor-ratings' as const,permissionStatus:'pending' as const};
 const rating=rule.profile?{...MOCK_DATASET.professors[0].rating!,sourceProfessorId:rule.profile,sourceId:source.id,updatedAt:'2026-10-29'}:null;
 const owner:ProfessorRecord={id:rule.id,displayName:rule.owner,aliases:[rule.name],rating:rule.donorId?null:rating,...(rule.profile&&!rule.donorId?{sourceProfessorId:rule.profile,ratingUpdatedAt:'2026-10-29'}:{})};
 const stubs:ProfessorRecord[]=rule.stubs.map(stub=>({...stub,...(stub.id===rule.donorId?{rating,sourceProfessorId:rule.profile,ratingUpdatedAt:'2026-10-29'}:{})}));
 const [subjectCode,catalogNumber]=rule.course.split(' ');
 const history={...MOCK_DATASET.historicalCourseGrades[0],professorId:owner.id,subjectCode,catalogNumber,sourceId:'grades'};
 const dataset:LocalDataset={schemaVersion:1,kind:'development',sources:[source,{...source,id:'grades',category:'historical-grades'}],professors:[owner,...stubs],historicalCourseGrades:[history]};
 const profiles=rule.profile?[{id:rule.profile,displayName:rule.profileName!,department:rule.department,observedAt:'2026-10-29',rating}]:[];
 return {dataset,profiles,history};
}

it.each(cases)('retires only the reviewed history-free duplicates of $name',rule=>{
 const {dataset,profiles,history}=fixture(rule);
 expect(validateLocalDataset(dataset).valid).toBe(true);
 const before=auditRuntimeInstructorMatches(dataset,{[rule.course]:[rule.name]});expect(before.counts.identityAmbiguous).toBe(1);
 const result=selectReviewedProfiles(dataset,profiles),owner=result.dataset.professors.find(p=>p.id===rule.id)!;
 expect(result.dataset.professors).toHaveLength(1);expect(result.remaps).toHaveLength(rule.stubs.length);
 expect(owner.aliases).toContain(rule.name);expect(owner.rating).toEqual(profiles[0]?.rating??null);
 expect(result.dataset.historicalCourseGrades).toEqual([history]);
 for(const stub of rule.stubs)expect(result.dataset.professorIdRedirects?.[stub.id]).toBe(rule.id);
 expect(validateLocalDataset(result.dataset).valid).toBe(true);
 const after=auditRuntimeInstructorMatches(result.dataset,{[rule.course]:[rule.name]});
 expect(after.counts).toMatchObject({identityFound:1,identityAmbiguous:0,historyFound:1,ratingFound:rule.profile?1:0});
 expect(selectReviewedProfiles(result.dataset,profiles).dataset).toEqual(result.dataset);
});

it.each(cases)('keeps $name separate if a retired stub gains history or conflicting identity evidence',rule=>{
 const {dataset,profiles,history}=fixture(rule);
 const changes:LocalDataset[]=[
  {...dataset,historicalCourseGrades:[...dataset.historicalCourseGrades,{...history,professorId:rule.stubs[0].id}]},
  {...dataset,professors:dataset.professors.map(p=>p.id===rule.stubs[0].id?{...p,displayName:'Unreviewed name'}:p)},
  {...dataset,professors:[...dataset.professors,{id:'unreviewed-collision',displayName:rule.name,aliases:[],rating:null}]},
 ];
 for(const changed of changes)expect(selectReviewedProfiles(changed,profiles).dataset).toEqual(changed);
 if(rule.profile)expect(selectReviewedProfiles(dataset,profiles.map(p=>({...p,department:'Unrelated department'}))).dataset).toEqual(dataset);
});

it('does not retire the rated Leo donor if the retained owner already has a profile but no score',()=>{
 const rule=cases.find(rule=>rule.name==='Leo Porter')!;
 const {dataset,profiles}=fixture(rule);
 const changed:LocalDataset={...dataset,professors:dataset.professors.map(p=>p.id===rule.id?{...p,sourceProfessorId:'1992362',ratingUpdatedAt:'2026-10-29'}:p)};
 expect(validateLocalDataset(changed).valid).toBe(true);
 const result=selectReviewedProfiles(changed,profiles);
 expect(result.dataset).toEqual(changed);expect(result.remaps).toHaveLength(0);
});

it('resolves the three observed roster collisions in the bundled dataset without changing held identities',()=>{
 const result=auditRuntimeInstructorMatches(DIRECT_DATASET,Object.fromEntries(cases.map(rule=>[rule.course,[rule.name]])));
 expect(result.counts).toMatchObject({names:3,pairs:3,identityFound:3,identityAmbiguous:0,ratingFound:2,historyFound:3,bothFound:2});
 for(const rule of cases){
  const entry=result.entries.find(e=>e.name===rule.name)!;expect(entry.identity).toMatchObject({status:'found',identity:{id:rule.id}});
  expect(entry.sourceProfessorId).toBe(rule.profile??null);
 }
});
