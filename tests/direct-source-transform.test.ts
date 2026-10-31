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
 it('records reviewed alternate profiles without creating duplicate teachers or holding their known IDs again',()=>{
  const old='3080826',next='3046145';
  const before:LocalDataset={...baseline(),sources:[source,{...source,id:'grades',category:'historical-grades'}],professors:[{id:'ho',displayName:'Ho, Ching Wei',aliases:['Ching Wei Ho'],rating:{...oldRating,sourceProfessorId:old}}],historicalCourseGrades:[{professorId:'ho',subjectCode:'MATH',catalogNumber:'20A',averageGpa:3.5,sampleSize:null,offeringCount:1,gradeDistribution:{aPercent:50,bPercent:50,cPercent:0,dPercent:0,fPercent:0,wPercent:0,pPercent:0,npPercent:0},sourceId:'grades',updatedAt:'2026-07-23'}]};
  const oldRow=teacher({legacyId:Number(old),displayName:'Ching Ho',department:'Mathematics',ratingCount:3});
  const input=roster([oldRow,teacher({legacyId:Number(next),displayName:'Ching Wei Ho',department:'Mathematics',ratingCount:58})]);
  const grades=archive([row({courseNumber:'20A',instructor:'Ho, Ching Wei'})]);
  const first=transformDirectSources(before,input,grades);
  expect(first.dataset.professors).toHaveLength(1);expect(first.dataset.professors[0].rating).toMatchObject({sourceProfessorId:next,ratingCount:58});
  expect(first.report.identityReview).toEqual([]);expect(first.report.identityReconciliation.profileDecisions[0].alternateIds).toEqual([old]);
  expect(transformDirectSources(first.dataset,input,grades).dataset).toEqual(first.dataset);
  const newer=roster([{...input.rows[1],rating:4.8,ratingCount:70,retrievedAt:'2026-10-30T00:00:00Z'}]);
  const refreshed=transformDirectSources(first.dataset,newer,grades);
  expect(refreshed.dataset.professors[0].rmpProfiles?.find(p=>p.sourceProfessorId===next)).toMatchObject({updatedAt:'2026-10-30',rating:{overallRating:4.8,ratingCount:70}});
  expect(refreshed.dataset.professors[0].rmpProfiles?.find(p=>p.sourceProfessorId===old)).toMatchObject({updatedAt:'2026-10-29',rating:{ratingCount:3}});
  expect(transformDirectSources(refreshed.dataset,newer,grades).dataset).toEqual(refreshed.dataset);
  const alternateUpdate=roster([{...oldRow,rating:3.3,ratingCount:80,retrievedAt:'2026-10-31T00:00:00Z'}]);
  const reselected=transformDirectSources(refreshed.dataset,alternateUpdate,grades);
  expect(reselected.dataset.professors[0].rating).toMatchObject({sourceProfessorId:old,overallRating:3.3,ratingCount:80});
  expect(reselected.dataset.professors[0].rmpProfiles?.find(p=>p.sourceProfessorId===next)).toMatchObject({updatedAt:'2026-10-30',rating:{ratingCount:70}});
  expect(transformDirectSources(reselected.dataset,input,grades).dataset).toEqual(reselected.dataset);
  expect(()=>transformDirectSources(before,roster([...input.rows,oldRow]),grades)).toThrow('Duplicate source profile');
  expect(()=>transformDirectSources(before,roster([{...oldRow,rating:99},input.rows[1]]),grades)).toThrow('Invalid source number');
 });
 it('replaces a reviewed link to another department without giving the other teacher its grades',()=>{
  const before:LocalDataset={...baseline(),sources:[source,{...source,id:'grades',category:'historical-grades'}],professors:[{id:'phys',displayName:'Wong, Thomas Hong Tsun',aliases:['Thomas Hong Tsun Wong'],rating:{...oldRating,sourceProfessorId:'1807235'}}],historicalCourseGrades:[{professorId:'phys',subjectCode:'PHYS',catalogNumber:'1B',averageGpa:3.5,sampleSize:null,offeringCount:1,gradeDistribution:{aPercent:50,bPercent:50,cPercent:0,dPercent:0,fPercent:0,wPercent:0,pPercent:0,npPercent:0},sourceId:'grades',updatedAt:'2026-07-23'}]};
  const input=roster([teacher({legacyId:1807235,displayName:'Tom Wong',department:'Political Science'}),teacher({legacyId:3107722,displayName:'Thomas Hong Tsun Wong',department:'Physics'})]);
  const grades=archive([row({subject:'PHYS',courseNumber:'1B',instructor:'Wong, Thomas Hong Tsun'})]);
  const first=transformDirectSources(before,input,grades);
  expect(first.report.identityReconciliation.profileDecisions).toContainEqual(expect.objectContaining({professorId:'phys',previousId:'1807235',selectedId:'3107722'}));
  expect(first.dataset.professors.find(p=>p.id==='phys')?.rating?.sourceProfessorId).toBe('3107722');
  expect(first.dataset.historicalCourseGrades.every(g=>g.professorId==='phys')).toBe(true);
  expect(first.dataset.professors.find(p=>p.sourceProfessorId==='1807235')?.id).not.toBe('phys');
  expect(transformDirectSources(first.dataset,input,grades).dataset).toEqual(first.dataset);
 });
 it('refreshes only a verified shared-profile owner and keeps the other instructor unrated on repeat imports',()=>{
  const shared={...oldRating,sourceProfessorId:'2421043'};
  const history=(id:string,subjectCode:string,catalogNumber:string)=>({professorId:id,subjectCode,catalogNumber,averageGpa:3.5,sampleSize:null,offeringCount:1,gradeDistribution:{aPercent:50,bPercent:50,cPercent:0,dPercent:0,fPercent:0,wPercent:0,pPercent:0,npPercent:0},sourceId:'grades',updatedAt:'2026-07-23'});
  const before:LocalDataset={...baseline(),sources:[source,{...source,id:'grades',category:'historical-grades'}],professors:[
   {id:'chem',displayName:'Young, Mark',aliases:['Mark Young'],rating:shared},
   {id:'writing',displayName:'Young, Mark T',aliases:['Mark T Young'],rating:shared},
  ],historicalCourseGrades:[history('chem','CHEM','6B'),history('writing','WCWP','10A')]};
  const input=roster([teacher({legacyId:2421043,displayName:'Mark Young',department:'Chemistry'})]);
  const grades=archive([row({instructor:'Young, Mark',subject:'CHEM',courseNumber:'6B'}),row({instructor:'Young, Mark T',subject:'WCWP',courseNumber:'10A'})]);
  const first=transformDirectSources(before,input,grades);
  expect(first.report.identityReconciliation.withheldRatings).toHaveLength(1);
  expect(first.dataset.professors.find(p=>p.id==='chem')?.rating).toMatchObject({overallRating:4.5,sourceProfessorId:'2421043'});
  expect(first.dataset.professors.find(p=>p.id==='writing')?.rating).toBeNull();
  expect(first.dataset.historicalCourseGrades).toHaveLength(2);
  expect(transformDirectSources(first.dataset,input,grades).dataset).toEqual(first.dataset);
  expect(before.professors[1].rating).toEqual(shared);
 });
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
 it('does not choose the first of two source profiles for an unlinked exact name',()=>{
  const original=baseline();const base={...original,professors:[{...original.professors[0],rating:null}]};
  const rows=[teacher(),teacher({legacyId:202,rating:1})];
  for(const items of [rows,[...rows].reverse()]){
   const result=transformDirectSources(base,roster(items),archive());
   expect(result.dataset.professors).toHaveLength(1);expect(result.dataset.professors[0].rating).toBeNull();
   expect(result.report.identityReview).toHaveLength(2);
  }
 });
 it('holds duplicate new source names instead of showing the first rating confidently',()=>{
  const rows=[teacher({legacyId:201,displayName:'New Person'}),teacher({legacyId:202,displayName:'New Person',rating:1})];
  const result=transformDirectSources(baseline(),roster(rows),archive());
  expect(result.dataset.professors.some(p=>p.displayName==='New Person')).toBe(false);
  expect(result.report.identityReview).toHaveLength(2);
 });
 it('does not use course overlap alone to resolve an ambiguous exact grade name',()=>{
  const original=baseline();const existingGrade=transformDirectSources(original,roster(),archive()).dataset.historicalCourseGrades[0];
  const base={...original,professors:[...original.professors,{...original.professors[0],id:'another-jane',rating:{...oldRating,sourceProfessorId:'202'}}],historicalCourseGrades:[existingGrade],sources:[...original.sources,{...source,id:'direct-ucsd-grades',category:'historical-grades' as const}]};
  const result=transformDirectSources(base,roster([]),archive());
  expect(result.report.grades.unmatchedRows).toBe(1);
  expect(result.report.identityReview).toContainEqual(expect.objectContaining({reason:'ambiguous-grade'}));
 });
 it('retains previously collected terms missing from a later partial response',()=>{
  const initial=transformDirectSources(baseline(),roster(),archive([row({year:'25',quarter:'FA'}),row()])).dataset;
  const later=archive();later.retrievedAt='2026-10-30T08:00:00Z';
  expect(transformDirectSources(initial,roster(),later).dataset.historicalCourseGrades[0].terms).toHaveLength(2);
 });
 it('reconciles an internal duplicate before refreshing its rating and assigning term rows',()=>{
  const original=baseline();const base={...original,professors:[...original.professors,{...original.professors[0],id:'duplicate',displayName:'Jane Mary Doe',aliases:[]}],historicalCourseGrades:[{professorId:'reviewed-jane',subjectCode:'MATH',catalogNumber:'10',averageGpa:3.2,sampleSize:null,offeringCount:1,gradeDistribution:{aPercent:50,bPercent:50,cPercent:0,dPercent:0,fPercent:0,wPercent:0,pPercent:0,npPercent:0},sourceId:'old',updatedAt:'2026-07-23'}]};
  const result=transformDirectSources(base,roster(),archive());
  expect(result.dataset.professors).toHaveLength(1);
  expect(result.dataset.professors[0].rating?.sourceId).toBe('direct-rmp');
  expect(result.dataset.historicalCourseGrades[0].terms).toHaveLength(1);
  expect(result.report.identityReconciliation.remaps).toHaveLength(1);
 });
 it('does not resurrect an older rating after a newer unrated observation',()=>{
  const initial=transformDirectSources(baseline(),roster([teacher({rating:null,ratingCount:0,difficulty:null,wouldTakeAgainPercent:null})]),archive()).dataset;
  const later=transformDirectSources(initial,roster([teacher({retrievedAt:'2026-10-01T08:00:00Z'})]),archive()).dataset;
  expect(later.professors[0].rating).toBeNull();
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
 it('does not let stale identity evidence revoke a newer profile and strand its next refresh',()=>{
  const original=baseline();const base={...original,professors:[{...original.professors[0],displayName:'Jane Doe',rating:{...oldRating,updatedAt:'2026-10-29'},ratingUpdatedAt:'2026-10-29'},{...original.professors[0],id:'mark',displayName:'Mark Brown',aliases:[]}]};
  const first=transformDirectSources(base,roster([teacher({displayName:'Mark Brown',retrievedAt:'2026-01-01T08:00:00Z'})]),archive()).dataset;
  const next=transformDirectSources(first,roster([teacher({displayName:'Jane Doe',retrievedAt:'2026-10-30T08:00:00Z'})]),archive()).dataset;
  expect(next.professors.find(p=>p.id==='reviewed-jane')?.rating).toMatchObject({overallRating:4.5,updatedAt:'2026-10-30',sourceProfessorId:'101'});
  expect(next.professors.find(p=>p.id==='mark')?.rating).toBeNull();
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
