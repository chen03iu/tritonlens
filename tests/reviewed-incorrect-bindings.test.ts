import {expect,it} from 'vitest';
import decisions from '../scripts/reviewed-incorrect-profile-bindings.json';
import {reconcileDirectIdentities} from '../scripts/reconcile-direct-identities';
import {transformDirectSources} from '../scripts/direct-source-transform';
import {DIRECT_DATASET} from '../src/data/direct-dataset';
import {validateLocalDataset} from '../src/data/validation';
import type {LocalDataset} from '../src/data/types';

const stamp='2026-10-29';
function fixture(rule:typeof decisions.entries[number]){
 const saved=DIRECT_DATASET.professors.find(p=>p.id===rule.professorId)!;
 const rating={overallRating:3.7,difficulty:2.3,ratingCount:11,wouldTakeAgainPercent:70,sourceId:'direct-rmp',updatedAt:stamp,sourceProfessorId:rule.sourceProfessorId};
 const owner={...saved,sourceProfessorId:rule.sourceProfessorId,ratingUpdatedAt:stamp,rating};
 const history=DIRECT_DATASET.historicalCourseGrades.find(g=>g.professorId===owner.id&&g.subjectCode+'/'+g.catalogNumber===rule.course)!;
 const dataset:LocalDataset={...DIRECT_DATASET,professors:[owner],historicalCourseGrades:[history],professorIdRedirects:undefined};
 const source={id:rule.sourceProfessorId,displayName:rule.sourceDisplayName,department:rule.department,schoolName:'University of California San Diego',observedAt:stamp,rating};
 return {dataset,owner,history,source};
}

it.each(decisions.entries)('detaches only the reviewed singleton binding for $expectedName',rule=>{
 const {dataset,source,history}=fixture(rule),before=JSON.stringify(dataset);
 const result=reconcileDirectIdentities(dataset,[source]),corrected=result.dataset.professors[0];
 expect(result.withheldRatings).toMatchObject([{professorId:rule.professorId,sourceProfessorId:rule.sourceProfessorId}]);
 expect(corrected.rating).toBeNull();expect(corrected).not.toHaveProperty('sourceProfessorId');
 expect(corrected).not.toHaveProperty('ratingUpdatedAt');expect(corrected.aliases).toEqual(dataset.professors[0].aliases);
 expect(result.dataset.historicalCourseGrades).toEqual([history]);expect(result.remaps).toEqual([]);
 expect(JSON.stringify(dataset)).toBe(before);
 expect(reconcileDirectIdentities(result.dataset,[source]).dataset).toEqual(result.dataset);
});

it('stops an active reviewed correction if its retained or source evidence changes',()=>{
 const rule=decisions.entries[0],{dataset,source,owner,history}=fixture(rule);
 for(const profiles of [[],[source,source],[{...source,displayName:'Different name'}],[{...source,department:'Other department'}],[{...source,schoolName:'Other university'}],[{...source,observedAt:'2000-01-01'}],[{...source,observedAt:'invalid'}],[{...source,rating:undefined}],[{...source,rating:{...source.rating,sourceProfessorId:'999'}}]]){
  expect(()=>reconcileDirectIdentities(dataset,profiles)).toThrow(/Reviewed incorrect profile binding requires revalidation/);
 }
 for(const changed of [
  {...dataset,professors:[{...owner,displayName:'Different retained name'}]},
  {...dataset,professors:[{...owner,rating:{...owner.rating,sourceProfessorId:'999'}}]},
  {...dataset,historicalCourseGrades:[]},
  {...dataset,historicalCourseGrades:[history,history]},
 ])expect(()=>reconcileDirectIdentities(changed,[source])).toThrow(/requires revalidation/);
});

it('stops for review when another alternate observation would need a selection decision',()=>{
 const {dataset,source,owner}=fixture(decisions.entries[0]);
 const profile={sourceProfessorId:source.id,displayName:source.displayName,department:source.department,schoolName:source.schoolName,sourceId:'direct-rmp',updatedAt:stamp,rating:source.rating};
 const other={...profile,sourceProfessorId:'999',displayName:'Independent reviewed profile',rating:{...profile.rating,sourceProfessorId:'999'}};
 const changed={...dataset,professors:[{...owner,rmpProfiles:[profile,other]}]};
 expect(validateLocalDataset(changed).valid).toBe(true);
 const before=JSON.stringify(changed);
 expect(()=>reconcileDirectIdentities(changed,[source])).toThrow(/requires revalidation/);
 expect(JSON.stringify(changed)).toBe(before);
});

it('limits reviewed corrections to the fixed retained IDs and development data',()=>{
 const {dataset,source,owner,history}=fixture(decisions.entries[0]);
 for(const kind of ['production','mock'] as const){
  const changed={...dataset,kind};expect(reconcileDirectIdentities(changed,[source]).dataset).toBe(changed);
 }
 const other={...dataset,professors:[{...owner,id:'unreviewed-id'}],historicalCourseGrades:[{...history,professorId:'unreviewed-id'}]};
 expect(reconcileDirectIdentities(other,[source]).dataset).toBe(other);
});

it.each(decisions.entries.flatMap(rule=>[{rule,withAlternate:false},{rule,withAlternate:true}]))('imports $rule.sourceDisplayName separately with sole alternate=$withAlternate and retains every grade term',({rule,withAlternate})=>{
 const {dataset:base,source,history}=fixture(rule),term=history.terms![0];
 const dataset=withAlternate?{...base,professors:base.professors.map(p=>({...p,rmpProfiles:[{sourceProfessorId:source.id,displayName:source.displayName,department:source.department,schoolName:source.schoolName,sourceId:'direct-rmp',updatedAt:stamp,rating:source.rating}]}))}:base;
 expect(validateLocalDataset(dataset).valid).toBe(true);
 const buckets=['A','B','C','D','F','W','P','NP'],fields=['aPercent','bPercent','cPercent','dPercent','fPercent','wPercent','pPercent','npPercent'] as const;
 const grades=Object.fromEntries(buckets.map((key,index)=>[key,term.gradeDistribution[fields[index]]??0]));
 const rmp={coverage:{complete:true,recordCount:1},rows:[{legacyId:Number(source.id),displayName:source.displayName,department:source.department,schoolName:source.schoolName,schoolGraphId:'U2Nob29sLTEwNzk=',retrievedAt:stamp,rating:source.rating.overallRating,difficulty:source.rating.difficulty,ratingCount:source.rating.ratingCount,wouldTakeAgainPercent:source.rating.wouldTakeAgainPercent}]};
 const archive={schemaVersion:1,exporterVersion:'0.1.1',kind:'ucsd-browser-session-candidate',sourceUrl:'https://qa-as.ucsd.edu/Home/InstructorGradeArchive',retrievedAt:stamp,query:{quarter:'',year:'',instructor:'',subject:'',courseNumber:''},coverage:{complete:false,recordCount:1,query:'all-filters-blank',requiresPipelineValidation:true},parseIssues:[],rows:[{subject:history.subjectCode,courseNumber:history.catalogNumber,year:String(term.year),quarter:term.quarter,title:'Existing owned course',instructor:rule.expectedName,gpa:term.averageGpa,grades,sourceCells:{gpa:term.averageGpa===null?'':String(term.averageGpa),grades:Object.fromEntries(Object.entries(grades).map(([key,value])=>[key,String(value)+'%']))}}]};
 const result=transformDirectSources(dataset,rmp,archive);
 expect(result.dataset.professors.find(p=>p.id===rule.professorId)).toMatchObject({rating:null});
 expect(result.dataset.professors.find(p=>p.id==='direct-rmp-'+source.id)).toMatchObject({displayName:source.displayName,rating:source.rating,sourceProfessorId:source.id});
 expect(result.dataset.historicalCourseGrades).toEqual([history]);
 expect(transformDirectSources(result.dataset,rmp,archive).dataset).toEqual(result.dataset);
});

it('also separates the rejected binding when a correct source owner already exists',()=>{
 const rule=decisions.entries[0],{dataset,source}=fixture(rule);
 const native={id:'native-source-owner',displayName:source.displayName,aliases:[],rating:source.rating,sourceProfessorId:source.id,ratingUpdatedAt:stamp};
 const changed={...dataset,professors:[...dataset.professors,native]};
 const result=reconcileDirectIdentities(changed,[source]);
 expect(result.withheldRatings).toHaveLength(1);expect(result.remaps).toEqual([]);
 expect(result.dataset.professors.find(p=>p.id===native.id)).toEqual(native);
 expect(result.dataset.professors.find(p=>p.id===rule.professorId)?.rating).toBeNull();
 expect(result.dataset.historicalCourseGrades).toEqual(changed.historicalCourseGrades);
});

it('omits a sole rejected alternate instead of returning an invalid empty array',()=>{
 const {dataset,source,owner}=fixture(decisions.entries[0]);
 const changed={...dataset,professors:[{...owner,rmpProfiles:[{sourceProfessorId:source.id,displayName:source.displayName,department:source.department,schoolName:source.schoolName,sourceId:'direct-rmp',updatedAt:stamp,rating:source.rating}]}]};
 expect(validateLocalDataset(changed).valid).toBe(true);
 const result=reconcileDirectIdentities(changed,[source]);
 expect(result.dataset.professors[0]).not.toHaveProperty('rmpProfiles');
 expect(validateLocalDataset(result.dataset).valid).toBe(true);
});
