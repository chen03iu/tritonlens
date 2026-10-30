import {describe,it,expect} from 'vitest';
import {transformDirectSources} from '../scripts/direct-source-transform';
import type {LocalDataset} from '../src/data/types';
import {validateLocalDataset} from '../src/data/validation';

const stamp='2026-10-29T08:00:00.000Z';
const source={id:'old',label:'Old snapshot',category:'professor-ratings',homepageUrl:null,termsUrl:null,retrievedAt:'2026-07-23',permissionStatus:'pending',attribution:null} as const;
const oldRating={overallRating:2,difficulty:3,ratingCount:4,wouldTakeAgainPercent:50,sourceId:'old',updatedAt:'2026-07-23',sourceProfessorId:'101'};
function baseline():LocalDataset{return {schemaVersion:1,kind:'development',sources:[source],professors:[{id:'reviewed-jane',displayName:'Doe, Jane Mary',aliases:['Jane Doe','Jane Mary Doe'],rating:oldRating}],historicalCourseGrades:[]};}
function teacher(overrides={}){return {legacyId:101,displayName:'Jane Doe',firstName:'Jane',lastName:'Doe',schoolGraphId:'U2Nob29sLTEwNzk=',schoolName:'University of California San Diego',department:'Mathematics',rating:4.5,difficulty:2,ratingCount:20,wouldTakeAgainPercent:80,retrievedAt:stamp,...overrides};}
function roster(rows=[teacher()]){return {coverage:{complete:true,recordCount:rows.length},rows};}
function row(overrides={}){const grades={A:60,B:20,C:0,D:0,F:0,W:0,P:0,NP:0};return {subject:'MATH',courseNumber:'010',year:'26',quarter:'SP',title:'Example',instructor:'Doe, Jane Mary',gpa:3.6,grades,sourceCells:{gpa:'3.6',grades:Object.fromEntries(Object.entries(grades).map(([key,value])=>[key,`${value}%`]))},...overrides};}
function archive(rows=[row()]){return {schemaVersion:1,exporterVersion:'0.1.1',kind:'ucsd-browser-session-candidate',sourceUrl:'https://qa-as.ucsd.edu/Home/InstructorGradeArchive',retrievedAt:stamp,query:{quarter:'',year:'',instructor:'',subject:'',courseNumber:''},coverage:{complete:false,recordCount:rows.length,query:'all-filters-blank',requiresPipelineValidation:true},parseIssues:[],rows};}

describe('direct-source transformation',()=>{
 it('refreshes an existing profile while preserving reviewed IDs and aliases',()=>{
  const before=baseline();const {dataset,report}=transformDirectSources(before,roster(),archive());
  expect(dataset.professors[0]).toMatchObject({id:'reviewed-jane',aliases:before.professors[0].aliases,rating:{overallRating:4.5,sourceProfessorId:'101',sourceId:'direct-rmp',updatedAt:'2026-10-29'}});
  expect(before.professors[0].rating).toEqual(oldRating);
  expect(report.ratings.refreshed).toBe(1);expect(report.archive.complete).toBe(false);
 });
 it('keeps terms separate and uses the latest term instead of averaging percentages',()=>{
  const {dataset}=transformDirectSources(baseline(),roster(),archive([row({year:'25',quarter:'FA'}),row()]));
  expect(dataset.historicalCourseGrades[0]).toMatchObject({professorId:'reviewed-jane',catalogNumber:'10',averageGpa:3.6,sampleSize:null,offeringCount:2,gradeDistribution:{aPercent:60},terms:[{year:2026,quarter:'SP'},{year:2025,quarter:'FA'}]});
 });
 it('does not merge a different profile with an existing same-name identity',()=>{
  const {dataset,report}=transformDirectSources(baseline(),roster([teacher({legacyId:202})]),archive());
  expect(dataset.professors[0].rating).toEqual(oldRating);expect(dataset.professors).toHaveLength(1);
  expect(report.identityReview).toContainEqual(expect.objectContaining({reason:'conflicting-profile',sourceProfessorId:'202'}));
 });
 it('retains a newer baseline observation and an out-of-roster profile',()=>{
  const original=baseline();const base={...original,professors:[{...original.professors[0],rating:{...oldRating,updatedAt:'2026-10-30'}}]};
  expect(transformDirectSources(base,roster(),archive()).dataset.professors[0].rating).toEqual(base.professors[0].rating);
  expect(transformDirectSources(baseline(),roster([]),archive()).dataset.professors[0].rating).toEqual(oldRating);
 });
 it('adds a distinct roster identity without assigning it another instructor history',()=>{
  const {dataset}=transformDirectSources(baseline(),roster([teacher({legacyId:202,displayName:'Other Person',firstName:'Other',lastName:'Person'})]),archive());
  expect(dataset.professors.find(p=>p.id==='direct-rmp-202')?.rating?.overallRating).toBe(4.5);
  expect(dataset.historicalCourseGrades[0].professorId).toBe('reviewed-jane');
 });
 it('leaves same-name candidate conflicts for review',()=>{
  const original=baseline();const base={...original,professors:[...original.professors,{...original.professors[0],id:'second-jane',rating:null}]};
  const {dataset,report}=transformDirectSources(base,roster([]),archive());
  expect(dataset.historicalCourseGrades).toEqual([]);expect(report.grades.unmatchedRows).toBe(1);
 });
 it('marks zero distributions and pass-only zero GPA unavailable without inventing weights',()=>{
  const zero={A:0,B:0,C:0,D:0,F:0,W:0,P:0,NP:0};const zeros=Object.fromEntries(Object.keys(zero).map(k=>[k,'0%']));
  const {dataset}=transformDirectSources(baseline(),roster(),archive([row({gpa:0,grades:zero,sourceCells:{gpa:'0',grades:zeros}})]));
  expect(dataset.historicalCourseGrades[0]).toMatchObject({averageGpa:null,sampleSize:null,gradeDistribution:{aPercent:null},terms:[{averageGpa:null,gradeDistribution:{aPercent:null}}]});
  const pass={...zero,P:100};const raw={...zeros,P:'100%'};
  expect(transformDirectSources(baseline(),roster(),archive([row({gpa:0,grades:pass,sourceCells:{gpa:'0',grades:raw}})])).dataset.historicalCourseGrades[0].averageGpa).toBeNull();
 });
 it.each([
  (a:ReturnType<typeof archive>)=>{a.rows[0].gpa=9;},
  (a:ReturnType<typeof archive>)=>{a.rows[0].grades.A=50;},
  (a:ReturnType<typeof archive>)=>{a.rows.push(a.rows[0]);a.coverage.recordCount++;},
  (a:ReturnType<typeof archive>)=>{a.sourceUrl='https://other.example/';},
  (a:ReturnType<typeof archive>)=>{a.query.year='26';},
 ])('rejects malformed, mismatched, duplicate, or filtered archive input',mutate=>{
  const candidate=archive();mutate(candidate);expect(()=>transformDirectSources(baseline(),roster(),candidate)).toThrow();
 });
 it('rejects incomplete or wrong-school RMP rosters',()=>{
  expect(()=>transformDirectSources(baseline(),{...roster(),coverage:{complete:false,recordCount:1}},archive())).toThrow();
  expect(()=>transformDirectSources(baseline(),roster([teacher({schoolGraphId:'wrong-school'})]),archive())).toThrow();
 });
 it('validates all saved terms and requires the summary to match the latest term',()=>{
  const {dataset}=transformDirectSources(baseline(),roster(),archive());
  const grade=dataset.historicalCourseGrades[0];
  expect(validateLocalDataset({...dataset,historicalCourseGrades:[{...grade,terms:[{...grade.terms![0],averageGpa:9}]}]}).valid).toBe(false);
  expect(validateLocalDataset({...dataset,historicalCourseGrades:[{...grade,terms:[grade.terms![0],grade.terms![0]]}]}).valid).toBe(false);
  expect(validateLocalDataset({...dataset,historicalCourseGrades:[{...grade,averageGpa:2}]}).valid).toBe(false);
  expect(validateLocalDataset({...dataset,historicalCourseGrades:[{...grade,professorId:'nonexistent'}]}).valid).toBe(false);
 });
});

export {baseline,teacher,roster,row,archive};
