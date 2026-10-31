import {expect,it} from 'vitest';
import reviews from '../scripts/reviewed-runtime-aliases.json';
import {applyReviewedRuntimeAliases} from '../scripts/reviewed-runtime-aliases';
import {DIRECT_DATASET} from '../src/data/direct-dataset';
import {lookupProfessor,normalizeInstructorName} from '../src/data/lookup';
import {auditRuntimeInstructorMatches} from '../src/data/runtime-instructor-audit';
import {transformDirectSources} from '../scripts/direct-source-transform';
import type {LocalDataset} from '../src/data/types';

function fixture(rule:typeof reviews.entries[number]){
 const saved=DIRECT_DATASET.professors.find(p=>p.id===rule.professorId)!;
 const owner={...saved,aliases:saved.aliases.filter(n=>normalizeInstructorName(n)!==normalizeInstructorName(rule.alias))};
 const history=DIRECT_DATASET.historicalCourseGrades.find(g=>g.professorId===owner.id&&`${g.subjectCode}/${g.catalogNumber}`===rule.course)!;
 const dataset:LocalDataset={...DIRECT_DATASET,professors:[owner],historicalCourseGrades:[history],professorIdRedirects:undefined};
 const source={id:rule.sourceProfessorId,displayName:rule.alias,department:rule.department,schoolName:'University of California San Diego',observedAt:owner.rating!.updatedAt,rating:owner.rating};
 return {dataset,source,owner,history};
}

it.each(reviews.entries)('adds only the evidence-backed alias $alias and preserves all observations',rule=>{
 const {dataset,source}=fixture(rule),before=JSON.stringify(dataset);
 expect(lookupProfessor(dataset,rule.alias).status).toBe('not-found');
 const result=applyReviewedRuntimeAliases(dataset,[source]);
 expect(result.applied).toContainEqual({professorId:rule.professorId,alias:rule.alias});
 expect(lookupProfessor(result.dataset,rule.alias)).toMatchObject({status:'found',record:{id:rule.professorId}});
 expect(result.dataset.professors[0].rating).toEqual(dataset.professors[0].rating);
 expect(result.dataset.professors[0].rmpProfiles).toEqual(dataset.professors[0].rmpProfiles);
 expect(result.dataset.historicalCourseGrades).toBe(dataset.historicalCourseGrades);
 expect(result.dataset.sources).toBe(dataset.sources);expect(JSON.stringify(dataset)).toBe(before);
 expect(applyReviewedRuntimeAliases(result.dataset,[source]).dataset).toBe(result.dataset);
});

it('accepts a later metric refresh without pinning or changing the new rating values',()=>{
 const rule=reviews.entries[0],{dataset,source,owner}=fixture(rule);
 const date=new Date(Date.parse(owner.rating!.updatedAt)+86400000).toISOString().slice(0,10);
 const rating={...owner.rating!,overallRating:5,difficulty:1,ratingCount:owner.rating!.ratingCount+1,updatedAt:date};
 const updated={...dataset,professors:[{...owner,rating,ratingUpdatedAt:date}]};
 const result=applyReviewedRuntimeAliases(updated,[{...source,rating,observedAt:date}]);
 expect(result.applied).toHaveLength(1);expect(result.dataset.professors[0].rating).toEqual(rating);
});

it('rejects changed retained identity, source binding or required owned course',()=>{
 const rule=reviews.entries[0],{dataset,source,owner}=fixture(rule);
 for(const changed of [
  {...dataset,professors:[{...owner,id:'different-retained-id'}]},
  {...dataset,professors:[{...owner,displayName:'Different retained name'}]},
  {...dataset,professors:[{...owner,sourceProfessorId:'999',rating:{...owner.rating!,sourceProfessorId:'999'}}]},
  {...dataset,historicalCourseGrades:[]},
  {...dataset,historicalCourseGrades:[...dataset.historicalCourseGrades,...dataset.historicalCourseGrades]},
  {...dataset,professors:[owner,{...owner,id:'another-source-owner',displayName:'Other owner',aliases:[]}]},
  {...dataset,professors:[owner,{id:'alternate-source-owner',displayName:'Other owner',aliases:[],rating:null,rmpProfiles:[{sourceProfessorId:rule.sourceProfessorId,displayName:rule.alias,department:rule.department,schoolName:source.schoolName,sourceId:'direct-rmp',updatedAt:source.observedAt,rating:owner.rating}]}]},
 ])expect(applyReviewedRuntimeAliases(changed,[source]).dataset).toBe(changed);
});

it('rejects missing, duplicate, stale or conflicting source evidence',()=>{
 const {dataset,source}=fixture(reviews.entries[0]);
 for(const sources of [[],[source,source],[{...source,id:'999'}],[{...source,displayName:'Different name'}],[{...source,department:'Unrelated department'}],[{...source,schoolName:'Another university'}],[{...source,observedAt:'invalid'}],[{...source,observedAt:'2000-01-01'}],[{...source,rating:undefined}],[{...source,rating:{...source.rating!,sourceProfessorId:'999'}}],[source,{...source,id:'999'}]]){
  expect(applyReviewedRuntimeAliases(dataset,sources).dataset).toBe(dataset);
 }
});

it('blocks aliases conflicting with exact names or other full names whose middle names may be omitted',()=>{
 const rule=reviews.entries.find(e=>e.alias==='Mary Boyle')!,{dataset,source}=fixture(rule);
 for(const displayName of ['Mary Boyle','Boyle, Mary X.','Mary Another Boyle']){
  const changed={...dataset,professors:[...dataset.professors,{id:'unreviewed-other-person',displayName,aliases:[],rating:null}]};
  const result=applyReviewedRuntimeAliases(changed,[source]);expect(result.dataset).toBe(changed);
  expect(result.blocked.find(e=>e.alias===rule.alias)?.reason).toBe('name-collision');
 }
});

it('does not apply rules to production or mock data',()=>{
 const {dataset,source}=fixture(reviews.entries[0]);
 for(const kind of ['mock','production'] as const){const changed={...dataset,kind};expect(applyReviewedRuntimeAliases(changed,[source]).dataset).toBe(changed);}
});

it('stops a refresh when a previously promoted alias no longer passes its evidence guards',()=>{
 const rule=reviews.entries.find(e=>e.alias==='Mary Boyle')!,{dataset,source}=fixture(rule);
 const promoted=applyReviewedRuntimeAliases(dataset,[source]).dataset,before=JSON.stringify(promoted);
 for(const sources of [[],[{...source,displayName:'Different instructor'}],[{...source,observedAt:'2000-01-01'}]]){
  expect(()=>applyReviewedRuntimeAliases(promoted,sources)).toThrow(/Previously reviewed alias requires revalidation/);
 }
 const collision={...promoted,professors:[...promoted.professors,{id:'other-mary',displayName:'Boyle, Mary X.',aliases:[],rating:null}]};
 expect(()=>applyReviewedRuntimeAliases(collision,[source])).toThrow(/requires revalidation/);
 const redirected:LocalDataset={...promoted,professors:promoted.professors.map(p=>({...p,id:'retained-new-id'})),professorIdRedirects:{[rule.professorId]:'retained-new-id'}};
 expect(()=>applyReviewedRuntimeAliases(redirected,[source])).toThrow(/requires revalidation/);
 expect(JSON.stringify(promoted)).toBe(before);
});

it('preflights promoted aliases before source reconciliation or grade identity matching',()=>{
 const rule=reviews.entries.find(e=>e.alias==='Mary Boyle')!,{dataset,source,history}=fixture(rule);
 const promoted=applyReviewedRuntimeAliases(dataset,[source]).dataset;
 const rmp={coverage:{complete:true,recordCount:1},rows:[{legacyId:Number(source.id),displayName:'Different instructor',schoolGraphId:'U2Nob29sLTEwNzk=',schoolName:source.schoolName,department:source.department,rating:4,difficulty:2,ratingCount:5,wouldTakeAgainPercent:80,retrievedAt:source.observedAt}]};
 const grades={A:60,B:20,C:10,D:5,F:5,W:0,P:0,NP:0};
 const archive={schemaVersion:1,exporterVersion:'0.1.1',kind:'ucsd-browser-session-candidate',sourceUrl:'https://qa-as.ucsd.edu/Home/InstructorGradeArchive',retrievedAt:source.observedAt,query:{quarter:'',year:'',instructor:'',subject:'',courseNumber:''},coverage:{complete:false,recordCount:1,query:'all-filters-blank',requiresPipelineValidation:true},parseIssues:[],rows:[{subject:history.subjectCode,courseNumber:history.catalogNumber,year:'26',quarter:'SP',title:'Example',instructor:rule.alias,gpa:3.4,grades,sourceCells:{gpa:'3.4',grades:Object.fromEntries(Object.entries(grades).map(([k,v])=>[k,`${v}%`]))}}]};
 expect(()=>transformDirectSources(promoted,rmp,archive)).toThrow(/Previously reviewed alias requires revalidation.*source-evidence-changed/);
});

it('records primary evidence without storing frozen rating values in the alias manifest',()=>{
 expect(reviews.entries).toHaveLength(31);expect(new Set(reviews.entries.map(e=>e.alias)).size).toBe(31);
 for(const entry of reviews.entries){
  expect(entry.evidence.some(url=>new URL(url).hostname.endsWith('.ucsd.edu'))).toBe(true);
  expect(entry.evidence).toContain(`https://www.ratemyprofessors.com/professor/${entry.sourceProfessorId}`);
  expect(entry).not.toHaveProperty('rating');
 }
});

it('bundles all reviewed names through the actual runtime with their own rating and course history',()=>{
 for(const rule of reviews.entries){
  const result=auditRuntimeInstructorMatches(DIRECT_DATASET,{[rule.course.replace('/',' ')]:[rule.alias]});
  expect(result.counts,rule.alias).toMatchObject({pairs:1,identityFound:1,ratingFound:1,historyFound:1,bothFound:1});
  expect(result.entries[0],rule.alias).toMatchObject({identity:{status:'found',identity:{id:rule.professorId}},sourceProfessorId:rule.sourceProfessorId});
 }
});
