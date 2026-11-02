import reviews from './reviewed-runtime-aliases.json';
import {normalizeInstructorName as key} from '../src/data/lookup';
import type {LocalDataset} from '../src/data/types';
import type {RosterProfileEvidence} from './reviewed-profile-selection';

export interface ReviewedRuntimeAliasDecision {readonly professorId:string;readonly alias:string}
interface BlockedAlias extends ReviewedRuntimeAliasDecision {readonly reason:string}

// These relaxed forms only BLOCK a reviewed alias; they never create a match.
function conflictKeys(name:string):string[]{
 const parts=name.split(',').map(part=>part.trim()),words=name.trim().split(/\s+/);
 return [name,...(parts.length===2&&parts.every(Boolean)
  ?[`${parts[1]} ${parts[0]}`,`${parts[1].split(/\s+/)[0]} ${parts[0]}`]
  :[`${words[0]} ${words.at(-1)}`])].map(key);
}

/** Static reviewed bindings only; metrics, source metadata and histories stay untouched. */
export function applyReviewedRuntimeAliases(dataset:LocalDataset,profiles:readonly RosterProfileEvidence[]){
 const applied:ReviewedRuntimeAliasDecision[]=[],blocked:BlockedAlias[]=[];
 if(dataset.kind!=='development')return {dataset,applied,blocked};
 const names=new Map<string,Set<string>>(),owners=new Map<string,Set<string>>();
 const add=(map:Map<string,Set<string>>,name:string,id:string)=>{const ids=map.get(name)??new Set<string>();ids.add(id);map.set(name,ids);};
 for(const p of dataset.professors){
  for(const name of [p.displayName,...p.aliases])for(const form of conflictKeys(name))add(names,form,p.id);
  for(const id of [p.sourceProfessorId,p.rating?.sourceProfessorId,...(p.rmpProfiles??[]).map(r=>r.sourceProfessorId)])if(id)add(owners,id,p.id);
 }
 const aliases=new Map<string,string[]>();
 for(const rule of reviews.entries){
  const decision={professorId:rule.professorId,alias:rule.alias};
  const reviewedOwners=new Set([rule.professorId,dataset.professorIdRedirects?.[rule.professorId]].filter(Boolean));
  const previouslyApplied=dataset.professors.some(p=>reviewedOwners.has(p.id)&&p.aliases.some(name=>key(name)===key(rule.alias)));
  const reject=(reason:string)=>{
   blocked.push({...decision,reason});
   if(previouslyApplied)throw new Error(`Previously reviewed alias requires revalidation: ${rule.alias} (${reason}). Import stopped.`);
  };
  const candidates=dataset.professors.filter(p=>p.id===rule.professorId),p=candidates[0];
  if(candidates.length!==1||key(p.displayName)!==key(rule.expectedName)){reject('retained-identity-changed');continue;}
  if((p.sourceProfessorId??p.rating?.sourceProfessorId)!==rule.sourceProfessorId||p.rating&&p.rating.sourceProfessorId!==rule.sourceProfessorId){reject('source-binding-changed');continue;}
  const reviewedNames=new Set([key(rule.alias),key(rule.sourceDisplayName??rule.alias)]);
  const sourceRows=profiles.filter(row=>row.id===rule.sourceProfessorId),source=sourceRows[0];
  if(sourceRows.length!==1||key(source.displayName)!==key(rule.sourceDisplayName??rule.alias)||key(source.department??'')!==key(rule.department)||key(source.schoolName??'')!=='university of california san diego'){
   reject('source-evidence-changed');continue;
  }
  const observed=Date.parse(source.observedAt??''),saved=Date.parse(p.ratingUpdatedAt??p.rating?.updatedAt??'');
  if(!Number.isFinite(observed)||!Number.isFinite(saved)||observed<saved||source.rating===undefined||source.rating&&(source.rating.sourceProfessorId!==rule.sourceProfessorId||source.rating.updatedAt!==source.observedAt)){
   reject('missing-or-stale-observation');continue;
  }
  if(owners.get(rule.sourceProfessorId)?.size!==1||!owners.get(rule.sourceProfessorId)?.has(p.id)){
   reject('profile-ownership-conflict');continue;
  }
  const ownProfiles=new Set([rule.sourceProfessorId,...(p.rmpProfiles??[]).map(r=>r.sourceProfessorId)]);
  if(profiles.some(row=>reviewedNames.has(key(row.displayName))&&!ownProfiles.has(row.id))){reject('source-name-collision');continue;}
  if([...reviewedNames].some(name=>[...(names.get(name)??[])].some(id=>id!==p.id))){reject('name-collision');continue;}
  const [subject,catalog]=rule.course.split('/');
  if(dataset.historicalCourseGrades.filter(g=>g.professorId===p.id&&g.subjectCode===subject&&g.catalogNumber===catalog).length!==1){reject('course-ownership-changed');continue;}
  const current=aliases.get(p.id)??[...p.aliases];
  if([p.displayName,...current].some(name=>key(name)===key(rule.alias)))continue;
  aliases.set(p.id,[...current,rule.alias]);add(names,key(rule.alias),p.id);applied.push(decision);
 }
 return {dataset:applied.length?{...dataset,professors:dataset.professors.map(p=>aliases.has(p.id)?{...p,aliases:aliases.get(p.id)!}:p)}:dataset,applied,blocked};
}
