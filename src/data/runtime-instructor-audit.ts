import {createInstructorDataService} from './providers/instructor-data-service';
import {createLocalDatasetProviderSet} from './providers/local-dataset-providers';
import type {IdentityLookupResult,ProfessorRatingLookupResult,HistoricalGradesLookupResult} from './providers/types';
import type {LocalDataset} from './types';
import type {RenderedInstructorContext} from '../tss/instructor-context';

export interface RuntimeInstructorAuditEntry {
 readonly name:string;
 readonly course:string;
 readonly identity:IdentityLookupResult;
 readonly ratingStatus:ProfessorRatingLookupResult['status'];
 readonly historyStatus:HistoricalGradesLookupResult['status'];
 readonly sourceProfessorId:string|null;
 readonly offeringCount:number|null;
}

/** Offline diagnostics using the pending-permission snapshot's actual runtime policy. */
export function auditRuntimeInstructorMatches(
 dataset:LocalDataset,
 roster:Readonly<Record<string,readonly string[]>>,
){
 if(!roster||typeof roster!=='object'||Array.isArray(roster))throw new Error('Expected an instructor course-to-names roster.');
 const observations=new Map<string,{name:string;subjectCode:string;catalogNumber:string}>();
 for(const [rawCourse,names] of Object.entries(roster)){
  const course=/^\s*([A-Z][A-Z0-9]*)[\s-]+(\d+[A-Z0-9]*)\s*$/i.exec(rawCourse);
  if(!course||!Array.isArray(names)||names.some(name=>typeof name!=='string'||!name.trim()))throw new Error('Expected valid course keys and nonempty instructor names.');
  const subjectCode=course[1].toUpperCase();
  const catalogNumber=course[2].toUpperCase().replace(/^0+(?=\d)/,'');
  for(const rawName of names){
   const name=rawName.trim().replace(/\s+/g,' ');
   observations.set(JSON.stringify([name,subjectCode,catalogNumber]),{name,subjectCode,catalogNumber});
  }
 }
 if(!observations.size)throw new Error('The instructor roster contains no observations.');
 const service=createInstructorDataService({
  ...createLocalDatasetProviderSet(dataset),mode:'pending-permission-snapshot',modeLabel:'Offline snapshot audit',
 });
 const entries:RuntimeInstructorAuditEntry[]=[...observations.values()]
  .sort((a,b)=>a.name.localeCompare(b.name,'en-US')||`${a.subjectCode} ${a.catalogNumber}`.localeCompare(`${b.subjectCode} ${b.catalogNumber}`,'en-US'))
  .map(({name,subjectCode,catalogNumber})=>{
   // Local providers consume only these fields; no DOM, TSS session or credentials.
   const context={instructor:{displayName:name},course:{subjectCode,catalogNumber}} as RenderedInstructorContext;
   const insight=service.getInsight(context);
   return {
    name,course:`${subjectCode} ${catalogNumber}`,identity:insight.identity,
    ratingStatus:insight.professorRating.status,historyStatus:insight.historicalGrades.status,
    sourceProfessorId:insight.professorRating.status==='found'?insight.professorRating.data.rating.sourceProfessorId:null,
    offeringCount:insight.historicalGrades.status==='found'?insight.historicalGrades.data.record.offeringCount:null,
   };
  });
 return {
  mode:service.mode,
  counts:{
   names:new Set(entries.map(e=>e.name)).size,pairs:entries.length,
   identityFound:entries.filter(e=>e.identity.status==='found').length,
   identityAmbiguous:entries.filter(e=>e.identity.status==='ambiguous').length,
   identityNotFound:entries.filter(e=>e.identity.status==='not-found').length,
   ratingFound:entries.filter(e=>e.ratingStatus==='found').length,
   historyFound:entries.filter(e=>e.historyStatus==='found').length,
   historyAmbiguous:entries.filter(e=>e.historyStatus==='ambiguous').length,
   bothFound:entries.filter(e=>e.ratingStatus==='found'&&e.historyStatus==='found').length,
   matchedWithoutMetrics:entries.filter(e=>e.identity.status==='found'&&e.ratingStatus==='not-found'&&e.historyStatus==='not-found').length,
  },
  entries,
 };
}
