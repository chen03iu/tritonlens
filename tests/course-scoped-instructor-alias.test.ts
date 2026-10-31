import {it,expect} from 'vitest';
import {DIRECT_DATASET} from '../src/data/direct-dataset';
import {createLocalDatasetProviderSet} from '../src/data/providers/local-dataset-providers';
import {createInstructorDataService} from '../src/data/providers/instructor-data-service';
import type {LocalDataset} from '../src/data/types';
import type {RenderedInstructorContext} from '../src/tss/instructor-context';

const id='easy-a-jordan-david-k-6c0ae66fe9';
const owner=DIRECT_DATASET.professors.find(p=>p.id===id)!;
const history=DIRECT_DATASET.historicalCourseGrades.find(g=>g.professorId===id&&g.subjectCode==='ANTH'&&g.catalogNumber==='87')!;
const base:LocalDataset={...DIRECT_DATASET,professors:[owner],historicalCourseGrades:[history]};
function insight(dataset=base,subjectCode='ANTH',catalogNumber='087',displayName='David Jordan'){
 const service=createInstructorDataService({...createLocalDatasetProviderSet(dataset),mode:'pending-permission-snapshot',modeLabel:'Snapshot'});
 const context={instructor:{displayName},course:{subjectCode,catalogNumber}} as RenderedInstructorContext;
 return service.getInsight(context);
}

it('resolves the screenshot short name only through the reviewed ANTH87 identity and source',()=>{
 const result=insight(DIRECT_DATASET);
 expect(result.identity).toMatchObject({status:'found',identity:{id,matchMethod:'known-alias'}});
 expect(result.professorRating).toMatchObject({status:'found',data:{rating:owner.rating}});
 expect(result.historicalGrades).toMatchObject({status:'found',data:{record:history}});
 expect(owner.aliases).not.toContain('David Jordan');
});

it('normalizes only the declared alias and course identifiers without broad name guessing',()=>{
 expect(insight(base,' anth ','00087',' david   JORDAN ').identity.status).toBe('found');
 for(const [subject,catalog,name] of [['WCWP','100','David Jordan'],['ANTH','88','David Jordan'],['ANTH','87A','David Jordan'],['ANTH','87','Dave Jordan']]){
  const result=insight(base,subject,catalog,name);expect(result.professorRating.status).toBe('not-found');expect(result.historicalGrades.status).toBe('not-found');
 }
 expect(createLocalDatasetProviderSet(base).identityProvider.lookup('David Jordan').status).toBe('not-found');
});

it('refuses missing or contradictory retained identity, profile and history evidence',()=>{
 const changed=[
  {...base,professors:[{...owner,id:'different-retained-id'}]},
  {...base,professors:[{...owner,displayName:'Different person'}]},
  {...base,professors:[{...owner,sourceProfessorId:'2404677',rating:{...owner.rating!,sourceProfessorId:'2404677'}}]},
  {...base,historicalCourseGrades:[]},
  {...base,historicalCourseGrades:[history,history]},
  {...base,professors:[owner,{...owner,id:'second-profile-owner',displayName:'Another person',aliases:[]}]},
 ];
 for(const dataset of changed){const result=insight(dataset);expect(result.professorRating.status).toBe('not-found');expect(result.historicalGrades.status).toBe('not-found');}
});

it('does not override an ordinary name match belonging to someone else',()=>{
 const other={...owner,id:'writing-person',displayName:'David Jordan',aliases:[],sourceProfessorId:'2404677',rating:{...owner.rating!,sourceProfessorId:'2404677'}};
 const result=insight({...base,professors:[owner,other]});
 expect(result.identity.status).toBe('ambiguous');expect(result.professorRating.status).toBe('not-found');expect(result.historicalGrades.status).toBe('not-found');
 const duplicate={...other,id:'another-writing-person'};
 expect(insight({...base,professors:[owner,other,duplicate]}).identity.status).toBe('ambiguous');
});
