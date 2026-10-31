import type {DataSourceReference,HistoricalCourseGradeRecord,HistoricalGradeDistribution,HistoricalGradeTerm,LocalDataset,ProfessorRating,ProfessorRecord} from '../src/data/types';
import {normalizeInstructorName} from '../src/data/lookup';
import {validateLocalDataset} from '../src/data/validation';
import {reconcileDirectIdentities} from './reconcile-direct-identities';
import {selectReviewedProfiles} from './reviewed-profile-selection';

const buckets=['A','B','C','D','F','W','P','NP'] as const;
const fields=['aPercent','bPercent','cPercent','dPercent','fPercent','wPercent','pPercent','npPercent'] as const;
const filters=['quarter','year','instructor','subject','courseNumber'];
const order={WI:0,SP:1,S1:2,SU:3,S2:4,FA:5};
type ObjectValue=Record<string,unknown>;
function assert(condition:unknown,message:string):asserts condition{if(!condition)throw new Error(message);}
function object(value:unknown):ObjectValue{assert(value!==null&&typeof value==='object'&&!Array.isArray(value),'Expected object');return value as ObjectValue;}
function text(value:unknown):string{assert(typeof value==='string'&&value.trim().length>0&&value.length<=2000,'Invalid text');return value.trim();}
function number(value:unknown,min:number,max:number):number{assert(typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max,'Invalid source number');return value;}
function date(value:unknown):string{const s=text(value);assert(Number.isFinite(Date.parse(s)),'Invalid source date');return new Date(s).toISOString().slice(0,10);}
const catalog=(value:string)=>value.trim().toUpperCase().replace(/^0+(?=\d)/,'');
const course=(subject:string,num:string)=>`${subject.trim().toUpperCase()}\0${catalog(num)}`;
function forms(name:string):string[]{const parts=name.split(',').map(s=>s.trim());return [...new Set([name,...(parts.length===2&&parts.every(Boolean)?[`${parts[1]} ${parts[0]}`]:[])].map(normalizeInstructorName))];}
function source(id:string,category:DataSourceReference['category'],retrievedAt:string,url:string,label:string):DataSourceReference{return {id,label,category,homepageUrl:url,termsUrl:category==='professor-ratings'?'https://www.ratemyprofessors.com/terms-of-use':'https://www.ucsd.edu/about/terms-of-use.html',retrievedAt,permissionStatus:'pending',attribution:category==='historical-grades'?'UCSD A.S. aggregate archive, QA environment; historical coverage incomplete.':'RateMyProfessors public aggregate profile snapshot.'};}

export function transformDirectSources(baseline:LocalDataset,rmpInput:unknown,gradeInput:unknown){
 assert(validateLocalDataset(baseline).valid,'Invalid baseline dataset');
 assert(baseline.kind==='development','Direct imports require a development snapshot');
 const rmp=object(rmpInput),archive=object(gradeInput);
 const rmpCoverage=object(rmp.coverage);
 assert(rmpCoverage.complete===true&&Array.isArray(rmp.rows)&&rmp.rows.length===rmpCoverage.recordCount,'Incomplete RMP roster');
 assert(archive.schemaVersion===1&&archive.exporterVersion==='0.1.1'&&archive.kind==='ucsd-browser-session-candidate','Unsupported browser export');
 assert(archive.sourceUrl==='https://qa-as.ucsd.edu/Home/InstructorGradeArchive','Unexpected archive source');
 const gradeDate=date(archive.retrievedAt),query=object(archive.query),coverage=object(archive.coverage);
 assert(Object.keys(query).length===5&&filters.every(k=>query[k]===''),'Filtered archive input');
 assert(Array.isArray(archive.parseIssues)&&archive.parseIssues.length===0,'Unresolved archive parsing');
 assert(Array.isArray(archive.rows)&&archive.rows.length>0&&archive.rows.length<=100000&&coverage.complete===false&&coverage.recordCount===archive.rows.length&&coverage.query==='all-filters-blank'&&coverage.requiresPipelineValidation===true,'Invalid archive coverage');
 const identities=rmp.rows.map(value=>{
  const row=object(value),legacy=number(row.legacyId,1,Number.MAX_SAFE_INTEGER);assert(Number.isInteger(legacy)&&row.schoolGraphId==='U2Nob29sLTEwNzk=','Invalid profile identity evidence');
  const id=String(legacy),displayName=text(row.displayName),observedAt=date(row.retrievedAt);
  const count=number(row.ratingCount,0,Number.MAX_SAFE_INTEGER);assert(Number.isInteger(count),'Invalid rating count');
  const overall=row.rating===null?null:number(row.rating,0,5),difficulty=row.difficulty===null?null:number(row.difficulty,0,5),again=row.wouldTakeAgainPercent===null?null:number(row.wouldTakeAgainPercent,0,100);
  assert(count===0?overall===null:overall!==null&&overall>=1,'Inconsistent rated profile');
  const rating:ProfessorRating|null=count>0&&overall!==null?{overallRating:overall,difficulty,ratingCount:count,wouldTakeAgainPercent:again,sourceId:'direct-rmp',updatedAt:observedAt,sourceProfessorId:id}:null;
  const department=typeof row.department==='string'&&row.department.trim()?text(row.department):undefined;
  const schoolName=row.schoolName===undefined?'University of California San Diego':text(row.schoolName);
  return {id,displayName,observedAt,rating,department,schoolName};
 });
 const reconciliation=reconcileDirectIdentities(baseline,identities);
 const selection=selectReviewedProfiles(reconciliation.dataset,identities);
 baseline=selection.dataset;
 const report={identityReconciliation:{remaps:reconciliation.remaps,withheldRatings:reconciliation.withheldRatings,profileDecisions:selection.decisions},ratings:{inputRows:rmp.rows.length,refreshed:0,addedProfiles:0,retained:0},grades:{inputRows:archive.rows.length,matchedRows:0,unmatchedRows:0,addedIdentities:0,courseRecords:0,allZeroRows:0,shortTotalRows:0},archive:{complete:false,environment:'qa',observedTerms:[] as string[]},identityReview:[] as {reason:string;sourceProfessorId?:string;name:string;candidateIds:string[];course?:string;term?:string}[]};
 let professors:ProfessorRecord[]=baseline.professors.map(p=>({...p,aliases:[...p.aliases]}));
 const byId=new Map(professors.map(p=>[p.id,p]));
 const sourceNames=new Map<string,Set<string>>();
 for(const row of identities){for(const form of forms(row.displayName)){const ids=sourceNames.get(form)??new Set<string>();ids.add(row.id);sourceNames.set(form,ids);}}
 const ratingNames=new Map<string,Set<string>>();
 function indexRatingName(p:ProfessorRecord){for(const alias of [p.displayName,...p.aliases])for(const form of forms(alias)){const ids=ratingNames.get(form)??new Set<string>();ids.add(p.id);ratingNames.set(form,ids);}}
 professors.forEach(indexRatingName);
 const rmpIds=new Set<string>(),rmpDates:string[]=[];
 for(const row of identities){
  const {id,rating}=row;assert(!rmpIds.has(id),'Duplicate source profile');rmpIds.add(id);
  const name=row.displayName,updatedAt=row.observedAt;rmpDates.push(updatedAt);
  if(selection.skippedProfileIds.has(id))continue;
  const linked=professors.filter(p=>(p.sourceProfessorId??p.rating?.sourceProfessorId)===id);
  const named=linked.length?linked:[...new Set(forms(name).flatMap(form=>[...(ratingNames.get(form)??[])]))].map(id=>byId.get(id)!);
  if(!linked.length){
   const names=[name,...named.flatMap(p=>[p.displayName,...p.aliases])];
   const competing=new Set(names.flatMap(n=>forms(n).flatMap(form=>[...(sourceNames.get(form)??[])])));
   if(competing.size>1){report.identityReview.push({reason:'ambiguous-source-name',sourceProfessorId:id,name,candidateIds:named.map(p=>p.id)});continue;}
  }
  if(named.length>1){report.identityReview.push({reason:'ambiguous-profile',sourceProfessorId:id,name,candidateIds:named.map(p=>p.id)});continue;}
  const existing=named[0];
  if(existing){
   const oldId=existing.sourceProfessorId??existing.rating?.sourceProfessorId;
   if(oldId&&oldId!==id){report.identityReview.push({reason:'conflicting-profile',sourceProfessorId:id,name,candidateIds:[existing.id]});continue;}
   if((existing.ratingUpdatedAt??existing.rating?.updatedAt??'')>updatedAt){report.ratings.retained++;continue;}
   const refreshed={...existing,sourceProfessorId:id,ratingUpdatedAt:updatedAt,rating,...(existing.rmpProfiles?{rmpProfiles:existing.rmpProfiles.map(profile=>profile.sourceProfessorId===id?{...profile,displayName:name,schoolName:row.schoolName,department:row.department??null,sourceId:'direct-rmp',updatedAt,rating}:profile)}:{})};
   professors=professors.map(p=>p.id===existing.id?refreshed:p);byId.set(existing.id,refreshed);report.ratings.refreshed++;
  }else{
   const added={id:`direct-rmp-${id}`,displayName:name,aliases:[],sourceProfessorId:id,ratingUpdatedAt:updatedAt,rating};
   professors.push(added);byId.set(added.id,added);indexRatingName(added);report.ratings.addedProfiles++;
  }
 }
 // Exact names and already reviewed aliases only; no new fuzzy identity rules.
 const groups=new Map<string,{professorId:string;subject:string;catalog:string;terms:HistoricalGradeTerm[]}>();
 const gradeNames=new Map<string,Map<string,ProfessorRecord>>();
 function indexGradeName(professor:ProfessorRecord){for(const alias of [professor.displayName,...professor.aliases])for(const form of forms(alias)){const entries=gradeNames.get(form)??new Map<string,ProfessorRecord>();entries.set(professor.id,professor);gradeNames.set(form,entries);}}
 professors.forEach(indexGradeName);
 const seen=new Set<string>(),observedTerms=new Set<string>();
 for(const value of archive.rows){
  const row=object(value);const subject=text(row.subject).toUpperCase(),num=catalog(text(row.courseNumber)),name=text(row.instructor),rawYear=text(row.year),quarter=text(row.quarter);
  assert(/^\d{2}(?:\d{2})?$/.test(rawYear)&&quarter in order,'Invalid archive term');
  const year=rawYear.length===2?2000+Number(rawYear):Number(rawYear);assert(year>=1900&&year<=2100,'Invalid archive year');
  const id=JSON.stringify([subject,num,name,year,quarter]);assert(!seen.has(id),'Duplicate grade term');seen.add(id);observedTerms.add(`${year}-${quarter}`);
  const grades=object(row.grades),raw=object(row.sourceCells),rawGrades=object(raw.grades);
  const gpa=row.gpa===null?null:number(row.gpa,0,4);
  const parseRaw=(value:unknown,percent:boolean,nullable=false)=>{assert(typeof value==='string','Missing raw source cell');if(nullable&&value==='')return null;const s=percent?value.replace(/\s*[%％]$/,'').trim():value;assert(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s),'Unknown source cell');return Number(s);};
  assert(parseRaw(raw.gpa,false,true)===gpa,'Source GPA mismatch');
  const values=buckets.map(k=>{const n=number(grades[k],0,100);assert(parseRaw(rawGrades[k],true)===n,'Source percentage mismatch');return n;});
  const total=values.reduce((a,b)=>a+b,0),letters=values.slice(0,5).reduce((a,b)=>a+b,0);
  if(total===0)report.grades.allZeroRows++;else if(total<99)report.grades.shortTotalRows++;
  const distribution=Object.fromEntries(fields.map((field,i)=>[field,total===0?null:values[i]])) as unknown as HistoricalGradeDistribution;
  const term:HistoricalGradeTerm={year,quarter:quarter as HistoricalGradeTerm['quarter'],averageGpa:total===0||(gpa===0&&letters===0)?null:gpa,gradeDistribution:distribution};
  let candidates=[...new Map(forms(name).flatMap(form=>[...(gradeNames.get(form)?.values()??[])].map(p=>[p.id,p] as const))).values()];
  if(candidates.length>1){report.grades.unmatchedRows++;report.identityReview.push({reason:'ambiguous-grade',name,candidateIds:candidates.map(p=>p.id),course:`${subject} ${num}`,term:`${year}-${quarter}`});continue;}
  let professor=candidates[0];
  if(!professor){
   // A reversible Unicode key avoids both runtime crypto dependencies and hash collisions.
   const nameId=Array.from(normalizeInstructorName(name)).map(char=>char.codePointAt(0)!.toString(36)).join('-');
   professor={id:`grade-name-${nameId}`,displayName:name,aliases:name.includes(',')?[name.split(',').map(s=>s.trim()).reverse().join(' ')]:[],rating:null};
   professors.push(professor);report.grades.addedIdentities++;
   indexGradeName(professor);
  }
  const groupId=`${professor.id}\0${course(subject,num)}`;
  const group=groups.get(groupId)??{professorId:professor.id,subject,catalog:num,terms:[]};
  assert(!group.terms.some(t=>t.year===year&&t.quarter===quarter),'Multiple source rows resolve to the same instructor/course/term');
  group.terms.push(term);groups.set(groupId,group);report.grades.matchedRows++;
 }
 const replacements:HistoricalCourseGradeRecord[]=[...groups.values()].map(group=>{
  const old=baseline.historicalCourseGrades.find(g=>g.professorId===group.professorId&&course(g.subjectCode,g.catalogNumber)===course(group.subject,group.catalog));
  const incoming=new Set(group.terms.map(term=>`${term.year}-${term.quarter}`));
  const terms=[...group.terms,...(old?.terms??[]).filter(term=>!incoming.has(`${term.year}-${term.quarter}`))].sort((a,b)=>b.year-a.year||order[b.quarter]-order[a.quarter]);
  return {professorId:group.professorId,subjectCode:group.subject,catalogNumber:group.catalog,averageGpa:terms[0].averageGpa,sampleSize:null,offeringCount:terms.length,gradeDistribution:terms[0].gradeDistribution,sourceId:'direct-ucsd-grades',updatedAt:gradeDate,terms};
 });
 const replaced=new Set(replacements.map(g=>`${g.professorId}\0${course(g.subjectCode,g.catalogNumber)}`));
 const retained=baseline.historicalCourseGrades.filter(g=>!replaced.has(`${g.professorId}\0${course(g.subjectCode,g.catalogNumber)}`)||g.updatedAt>gradeDate);
 const newer=new Set(retained.map(g=>`${g.professorId}\0${course(g.subjectCode,g.catalogNumber)}`));
 const latestDate=(id:string,incoming:string)=>[baseline.sources.find(s=>s.id===id)?.retrievedAt??'',incoming].sort().at(-1)!;
 const sources=[...baseline.sources.filter(s=>!['direct-rmp','direct-ucsd-grades'].includes(s.id)),source('direct-rmp','professor-ratings',latestDate('direct-rmp',rmpDates.sort().at(-1)??gradeDate),'https://www.ratemyprofessors.com/school/1079','RateMyProfessors'),source('direct-ucsd-grades','historical-grades',latestDate('direct-ucsd-grades',gradeDate),String(archive.sourceUrl),'UCSD A.S. grade archive (QA; partial coverage)')];
 const dataset:LocalDataset={...baseline,sources,professors:professors.sort((a,b)=>a.id.localeCompare(b.id)),historicalCourseGrades:[...retained,...replacements.filter(g=>!newer.has(`${g.professorId}\0${course(g.subjectCode,g.catalogNumber)}`))].sort((a,b)=>`${a.professorId}\0${course(a.subjectCode,a.catalogNumber)}`.localeCompare(`${b.professorId}\0${course(b.subjectCode,b.catalogNumber)}`))};
 report.grades.courseRecords=replacements.length;report.archive.observedTerms=[...observedTerms].sort();
 assert(validateLocalDataset(dataset).valid,'Transformed dataset failed validation');
 return {dataset,report};
}
