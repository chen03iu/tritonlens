import {normalizeInstructorName as key} from '../src/data/lookup';
import type {LocalDataset,ProfessorRecord} from '../src/data/types';
import type {IdentityRemap} from './reconcile-direct-identities';
import type {RosterProfileEvidence} from './reviewed-profile-selection';
import type {ReviewedSourceNameGroup} from './reviewed-source-name-groups';

const current=(p:ProfessorRecord)=>p.sourceProfessorId??p.rating?.sourceProfessorId;
const stamp=(p:ProfessorRecord)=>p.ratingUpdatedAt??p.rating?.updatedAt??'';
const hasCourse=(input:LocalDataset,id:string,course:string)=>input.historicalCourseGrades.some(g=>g.professorId===id&&`${g.subjectCode}/${g.catalogNumber}`===course);

/** Only explicit reviewed owners and empty IDs may be prepared; histories never move. */
export function prepareReviewedProfileOwners(input:LocalDataset,profiles:readonly RosterProfileEvidence[],groups:readonly ReviewedSourceNameGroup[]){
 let professors=[...input.professors];const redirects={...input.professorIdRedirects},remaps:IdentityRemap[]=[],blockedGroups=new Set<string>();
 const byId=new Map(profiles.map(p=>[p.id,p]));
 for(const group of groups){
  if(!group.ownerId)continue;
  let owner=professors.find(p=>p.id===group.ownerId);
  const stubs=(group.stubs??[]).map(s=>({rule:s,record:professors.find(p=>p.id===s.id)})).filter((s):s is typeof s&{record:ProfessorRecord}=>!!s.record);
  if(owner&&!stubs.length)continue;
  blockedGroups.add(group.name);
  if(owner&&key(owner.displayName)!==key(group.name))continue;
  if(group.expectedOwnerProfileId!==undefined&&(owner?current(owner)??null:null)!==group.expectedOwnerProfileId)continue;
  if(group.course&&(!owner||!hasCourse(input,owner.id,group.course)))continue;
  if(owner&&current(owner)&&!group.members.some(m=>m.id===current(owner!)))continue;
  if(stubs.some(({rule,record})=>key(record.displayName)!==key(rule.name)||current(record)!==rule.sourceProfessorId||record.rmpProfiles?.length||input.historicalCourseGrades.some(g=>g.professorId===record.id)))continue;
  const allowedOwners=new Set([group.ownerId,...stubs.map(s=>s.record.id)]);
  const mergedNames=new Set([...(owner?[owner.displayName,...owner.aliases]:[]),...stubs.flatMap(s=>[s.record.displayName,...s.record.aliases])].map(key));
  if(stubs.length&&professors.some(p=>!allowedOwners.has(p.id)&&[p.displayName,...p.aliases].some(name=>mergedNames.has(key(name)))))continue;
  if(professors.some(p=>!allowedOwners.has(p.id)&&group.members.some(m=>current(p)===m.id||p.rmpProfiles?.some(r=>r.sourceProfessorId===m.id))))continue;
  const latest=[...(owner?[stamp(owner)]:[]),...stubs.map(s=>stamp(s.record))].sort().at(-1)??'';
  if(group.members.some(m=>{const r=byId.get(m.id);return !r||key(r.displayName)!==key(m.name)||key(r.department??'')!==key(m.department)||!r.observedAt||!Number.isFinite(Date.parse(r.observedAt))||r.observedAt<latest||r.rating===undefined||!!r.rating&&(r.rating.sourceProfessorId!==r.id||r.rating.updatedAt!==r.observedAt);}))continue;
  if(!owner){
   if(!group.createIfMissing||!group.allowNoHistory)continue;
   const names=new Set([group.name,...group.members.map(m=>m.name)].map(key));
   if(professors.some(p=>[p.displayName,...p.aliases].some(n=>names.has(key(n)))))continue;
   owner={id:group.ownerId,displayName:group.name,aliases:[],rating:null};professors.push(owner);
  }
  if(!stubs.length){blockedGroups.delete(group.name);continue;}
  const donors=stubs.map(s=>s.record).filter(p=>current(p)&&p.rating);
  if(!current(owner)&&donors.length>1)continue;
  const donor=!current(owner)?donors[0]:undefined;
  const aliases=[...new Set([...owner.aliases,...stubs.flatMap(s=>[s.record.displayName,...s.record.aliases])])].filter(n=>n!==owner!.displayName);
  const replacement={...owner,aliases,...(donor?{sourceProfessorId:current(donor)!,rating:donor.rating,ratingUpdatedAt:stamp(donor)}:{})};
  for(const {record} of stubs){
   remaps.push({fromId:record.id,toId:owner.id,fromName:record.displayName,toName:owner.displayName,sourceProfessorId:current(record)??null,reason:'Explicit primary-source identity evidence; retired record has no course histories.'});
   for(const retired of Object.keys(redirects))if(redirects[retired]===record.id)redirects[retired]=owner.id;
   redirects[record.id]=owner.id;
  }
  const retired=new Set(stubs.map(s=>s.record.id));professors=professors.filter(p=>!retired.has(p.id)).map(p=>p.id===owner!.id?replacement:p);
  blockedGroups.delete(group.name);
 }
 const changed=remaps.length>0||professors.length!==input.professors.length;
 return {dataset:changed?{...input,professors,...(Object.keys(redirects).length?{professorIdRedirects:redirects}:{})}:input,remaps,blockedGroups};
}
