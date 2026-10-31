import {normalizeInstructorName} from '../src/data/lookup';
import type {LocalDataset,ProfessorRecord,ProfessorRating} from '../src/data/types';

export interface RosterProfileEvidence {readonly id:string;readonly displayName:string;readonly department?:string;readonly observedAt?:string;readonly rating?:ProfessorRating|null}
export interface ProfileDecision {readonly professorId:string;readonly previousId:string;readonly selectedId:string;readonly action:'replaced-wrong-link'|'retained-reviewed-profile'|'reselected-reviewed-profile';readonly reason:string;readonly alternateIds?:readonly string[]}
const replacements=[
 {name:'Wong, Thomas Hong Tsun',from:'1807235',fromName:'Tom Wong',fromDepartment:'Political Science',to:'3107722',toName:'Thomas Hong Tsun Wong',toDepartment:'Physics',course:'PHYS/1B'},
 {name:'Simpson, Junko Tokuda',from:'1003907',fromName:'Joseph Simpson',fromDepartment:'Chemistry',to:'2265866',toName:'Junko Tokuda Simpson',toDepartment:'Languages',course:'JAPN/137C'},
 {name:'Lee, Siu Hei',from:'1589053',fromName:'Seung Lee',fromDepartment:'Mathematics',to:'2173971',toName:'Siu Hei Lee',toDepartment:'Music',course:'MUS/4'},
 {name:'Moore, John C.',from:'155212',fromName:'Jim Moore',fromDepartment:'Anthropology',to:'570304',toName:'John C. Moore',toDepartment:'Linguistics',course:'LIGN/150'},
];
interface ReviewedGroup {name:string;course:string;members:readonly {id:string;name:string;department:string}[];existingSourceId?:string}
const groups:readonly ReviewedGroup[]=[
 {name:'Ho, Ching Wei',course:'MATH/20A',members:[{id:'3080826',name:'Ching Ho',department:'Mathematics'},{id:'3046145',name:'Ching Wei Ho',department:'Mathematics'}]},
 {name:'Tan, Tzer Han',course:'PHYS/2B',members:[{id:'3127092',name:'Tzer Tan',department:'Physics'},{id:'3137624',name:'Tzer Han Tan',department:'Physics'}]},
 {name:'Armour, Jon Christopher',course:'BIPN/105',members:[{id:'2256067',name:'Jon Armour',department:'Biology'},{id:'120826',name:'Chris Armour',department:'Science'}]},
 {name:'Lam, Tin Yiu',course:'CHEM/6A',members:[{id:'2186948',name:'Tin Lam',department:'Chemistry'},{id:'2275462',name:'Tin Yiu Lam',department:'Chemistry'}]},
 {name:'Lu, Li-Fan',course:'BICD/140',members:[{id:'1824878',name:'Lifan Lu',department:'Biology'},{id:'1965433',name:'Li-Fan Lu',department:'Biology'}]},
 {name:'Kozelka, Ellen Elizabeth',course:'GLBH/20',members:[{id:'2607627',name:'Ellen Kozelka',department:'Anthropology'},{id:'2659187',name:'Ellen Elizabeth Kozelka',department:'Health Science'}]},
 {name:'Del Alamo, Juan Carlos',course:'MAE/104',members:[{id:'1512231',name:'Juan Del Alamo',department:'Engineering'},{id:'2268445',name:'Juan Carlos Del alamo',department:'Engineering'}]},
 {name:'Lott, Margaret S.',course:'LISL/1D',members:[{id:'1116044',name:'Margaret Lott',department:'American Sign Language'},{id:'783702',name:'Peggy Lott',department:'Languages'}]},
 {name:'Frisch, Joshua R',course:'MATH/100A',members:[{id:'2966292',name:'Joshua Frisch',department:'Mathematics'},{id:'2987357',name:'Joshua R Frisch',department:'Mathematics'}]},
 {name:'Shalev, Aaron D',course:'CSE/29',members:[{id:'3050657',name:'Aaron Schulman',department:'Computer Science'},{id:'3157537',name:'Aaron Schulman',department:'Computer Science'}],existingSourceId:'reviewed-aaron-rmp'},
];
const currentId=(p:ProfessorRecord)=>p.sourceProfessorId??p.rating?.sourceProfessorId;
const key=normalizeInstructorName;
const matches=(p:RosterProfileEvidence|undefined,name:string,department:string)=>!!p&&key(p.displayName)===key(name)&&key(p.department??'')===key(department);
const fresh=(p:RosterProfileEvidence|undefined,stamp:string)=>!!p?.observedAt&&Number.isFinite(Date.parse(p.observedAt))&&p.observedAt>=stamp;

/** Offline, reviewed corrections only; grades and internal identities are never reassigned. */
export function selectReviewedProfiles(input:LocalDataset,profiles:readonly RosterProfileEvidence[],policy:'most-ratings'|'keep-current'='most-ratings'){
 const decisions:ProfileDecision[]=[],skippedProfileIds=new Set<string>();
 if(input.kind!=='development')return {dataset:input,decisions,skippedProfileIds};
 const byId=new Map(profiles.map(p=>[p.id,p]));
 const hasCourse=(p:ProfessorRecord,course:string)=>input.historicalCourseGrades.some(g=>g.professorId===p.id&&`${g.subjectCode.trim().toUpperCase()}/${g.catalogNumber.trim().toUpperCase().replace(/^0+(?=\d)/,'')}`===course);
 const professors=input.professors.map(p=>{
  const rule=replacements.find(r=>key(r.name)===key(p.displayName)&&r.from===currentId(p));
  if(!rule){
   const group=groups.find(g=>key(g.name)===key(p.displayName)&&g.members.some(m=>m.id===currentId(p)));
   if(!group||!hasCourse(p,group.course))return p;
   if(input.professors.some(other=>other.id!==p.id&&group.members.some(m=>m.id===currentId(other))))return p;
   const stamp=p.ratingUpdatedAt??p.rating?.updatedAt??'',candidates:RosterProfileEvidence[]=[];
   for(const member of group.members){
    let candidate=byId.get(member.id);
    // The explicitly reviewed Extended Studies observation keeps its original provenance.
    if(!candidate&&member.id===currentId(p)&&group.existingSourceId&&p.rating?.sourceId===group.existingSourceId
      &&input.sources.some(s=>s.id===group.existingSourceId&&s.homepageUrl===`https://www.ratemyprofessors.com/professor/${member.id}`))candidate={id:member.id,displayName:member.name,department:member.department,observedAt:stamp,rating:p.rating};
    if(!matches(candidate,member.name,member.department)||!fresh(candidate,stamp)||candidate?.rating===undefined)return p;
    if(candidate.rating&&(candidate.rating.sourceProfessorId!==candidate.id||candidate.rating.updatedAt!==candidate.observedAt))return p;
    candidates.push(candidate);
   }
   const current=currentId(p)!;
   const selected=policy==='keep-current'?candidates.find(c=>c.id===current)!:[...candidates].sort((a,b)=>(b.rating?.ratingCount??0)-(a.rating?.ratingCount??0)||Number(b.id===current)-Number(a.id===current)||a.id.localeCompare(b.id))[0];
   const alternateIds=candidates.filter(c=>c.id!==selected.id).map(c=>c.id);
   alternateIds.forEach(id=>skippedProfileIds.add(id));
   decisions.push({professorId:p.id,previousId:current,selectedId:selected.id,alternateIds,action:current===selected.id?'retained-reviewed-profile':'reselected-reviewed-profile',reason:policy==='keep-current'?'Reviewed same-person profiles; current profile retained.':'Reviewed same-person profiles; most reported ratings selected, current profile retained on ties. Aggregates are not pooled.'});
   return {...p,aliases:[...new Set([...p.aliases,...group.members.map(m=>m.name)])].filter(name=>name!==p.displayName),sourceProfessorId:selected.id,rating:selected.rating??null,ratingUpdatedAt:selected.observedAt!};
  }
  const from=byId.get(rule.from),to=byId.get(rule.to),stamp=p.ratingUpdatedAt??p.rating?.updatedAt??'';
  if(!matches(from,rule.fromName,rule.fromDepartment)||!matches(to,rule.toName,rule.toDepartment)||!fresh(from,stamp)||!fresh(to,stamp)||to?.rating===undefined)return p;
  if(to.rating&&(to.rating.sourceProfessorId!==to.id||to.rating.updatedAt!==to.observedAt))return p;
  if(input.professors.some(other=>other.id!==p.id&&currentId(other)===rule.to))return p;
  if(!hasCourse(p,rule.course))return p;
  decisions.push({professorId:p.id,previousId:rule.from,selectedId:rule.to,action:'replaced-wrong-link',reason:'Reviewed profile names, departments and local course identify the previous link as another instructor.'});
  return {...p,sourceProfessorId:to.id,rating:to.rating,ratingUpdatedAt:to.observedAt!};
 });
 return {dataset:decisions.length?{...input,professors}:input,decisions,skippedProfileIds};
}
