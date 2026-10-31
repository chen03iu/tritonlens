import {expect,it} from 'vitest';
import {auditRuntimeInstructorMatches} from '../src/data/runtime-instructor-audit';
import {MOCK_DATASET} from '../src/data/mock-dataset';
import {DIRECT_DATASET} from '../src/data/direct-dataset';
import type {LocalDataset} from '../src/data/types';

it('separates identity matching from rating and course-specific history availability',()=>{
 const unrated={id:'unrated',displayName:'Unrated Person',aliases:[],rating:null};
 const dataset:LocalDataset={...MOCK_DATASET,professors:[...MOCK_DATASET.professors,unrated]};
 const result=auditRuntimeInstructorMatches(dataset,{
  'AAS 010R':['Libby Butler','Unrated Person','Missing Person'],
  'AAS 198':['Libby Butler'],
 });
 expect(result.counts).toEqual({names:3,pairs:4,identityFound:3,identityAmbiguous:0,identityNotFound:1,ratingFound:2,historyFound:1,historyAmbiguous:0,bothFound:1,matchedWithoutMetrics:1});
 expect(result.entries.find(e=>e.name==='Libby Butler'&&e.course==='AAS 10R')).toMatchObject({identity:{status:'found',identity:{id:'demo-libby-butler'}},ratingStatus:'found',historyStatus:'found',offeringCount:4});
 expect(result.entries.find(e=>e.name==='Libby Butler'&&e.course==='AAS 198')).toMatchObject({identity:{status:'found'},ratingStatus:'found',historyStatus:'not-found',offeringCount:null});
 expect(result.entries.find(e=>e.name==='Unrated Person')).toMatchObject({identity:{status:'found'},ratingStatus:'not-found',historyStatus:'not-found'});
});

it('withholds both metrics for ambiguous identities and never guesses shortened names',()=>{
 const dataset:LocalDataset={...MOCK_DATASET,professors:[...MOCK_DATASET.professors,{...MOCK_DATASET.professors[0],id:'another-libby'}]};
 const result=auditRuntimeInstructorMatches(dataset,{'AAS 010R':['Libby Butler','Libby B.','Chad Campbell']});
 expect(result.counts).toMatchObject({identityAmbiguous:1,identityNotFound:2,ratingFound:0,historyFound:0});
 expect(result.entries.find(e=>e.name==='Libby Butler')).toMatchObject({identity:{status:'ambiguous'},ratingStatus:'not-found',historyStatus:'not-found'});
});

it('deduplicates equivalent course keys and whitespace while keeping distinct courses',()=>{
 const result=auditRuntimeInstructorMatches(MOCK_DATASET,{' aas-0010r ':[' Libby   Butler ','Libby Butler'],'AAS 010R':['Libby Butler'],'AAS 198':['Libby Butler']});
 expect(result.counts).toMatchObject({names:1,pairs:2,ratingFound:2,historyFound:1});
 expect(result.entries.map(e=>e.course)).toEqual(['AAS 10R','AAS 198']);
});

it('rejects malformed rosters rather than writing misleading zero-coverage reports',()=>{
 for(const value of [null,[],{}, {'AAS 010R':'Libby Butler'},{'AAS 010R':['']},{'Not a course':['Libby Butler']}]){
  expect(()=>auditRuntimeInstructorMatches(MOCK_DATASET,value as never)).toThrow();
 }
});

it('uses the real course-scoped David Jordan rule without linking the held Writing profile',()=>{
 const result=auditRuntimeInstructorMatches(DIRECT_DATASET,{'ANTH 087':['David Jordan'],'WCWP 100':['David Jordan']});
 const anth=result.entries.find(e=>e.course==='ANTH 87')!;
 expect(anth).toMatchObject({identity:{status:'found',identity:{id:'easy-a-jordan-david-k-6c0ae66fe9'}},ratingStatus:'found',historyStatus:'found',sourceProfessorId:'32591',offeringCount:7});
 expect(result.entries.find(e=>e.course==='WCWP 100')).toMatchObject({identity:{status:'not-found'},ratingStatus:'not-found',historyStatus:'not-found'});
});

it('reports duplicate course histories as ambiguous instead of available',()=>{
 const dataset:LocalDataset={...MOCK_DATASET,historicalCourseGrades:[MOCK_DATASET.historicalCourseGrades[0],MOCK_DATASET.historicalCourseGrades[0]]};
 const result=auditRuntimeInstructorMatches(dataset,{'AAS 010R':['Libby Butler']});
 expect(result.counts).toMatchObject({identityFound:1,ratingFound:1,historyFound:0,historyAmbiguous:1,bothFound:0});
});
