import {it,expect} from 'vitest';
import {REVIEWED_SOURCE_NAME_GROUPS} from '../scripts/reviewed-source-name-groups';
import {selectReviewedProfiles} from '../scripts/reviewed-profile-selection';
import {validateLocalDataset} from '../src/data/validation';
import type {LocalDataset,ProfessorRecord} from '../src/data/types';

const date='2026-10-29';
const rating=(id:string)=>({sourceProfessorId:id,sourceId:'direct-rmp',updatedAt:date,overallRating:4,difficulty:3,ratingCount:5,wouldTakeAgainPercent:80});
const source={id:'direct-rmp',label:'RMP',category:'professor-ratings' as const,homepageUrl:null,termsUrl:null,retrievedAt:date,permissionStatus:'pending' as const,attribution:null};
const history=(id:string,course:string)=>({professorId:id,subjectCode:course.split('/')[0],catalogNumber:course.split('/')[1],averageGpa:3,sampleSize:null,offeringCount:1,gradeDistribution:{aPercent:50,bPercent:50,cPercent:0,dPercent:0,fPercent:0,wPercent:0,pPercent:0,npPercent:0},sourceId:'grades',updatedAt:date});

it('does not proceed with source selection after an explicit stub develops its own grade history',()=>{
 const group=REVIEWED_SOURCE_NAME_GROUPS.find(g=>g.name==='Prather, Lauren R')!;
 const owner:ProfessorRecord={id:group.ownerId!,displayName:group.name,aliases:['Lauren R Prather'],rating:null};
 const stub:ProfessorRecord={id:group.stubs![0].id,displayName:group.stubs![0].name,aliases:[],rating:null};
 const input:LocalDataset={schemaVersion:1,kind:'development',sources:[source,{...source,id:'grades',category:'historical-grades'}],professors:[owner,stub],historicalCourseGrades:[history(owner.id,group.course!),history(stub.id,'POLI/1')]};
 const records=group.members.map(m=>({id:m.id,displayName:m.name,department:m.department,observedAt:date,rating:null}));
 expect(validateLocalDataset(input).valid).toBe(true);
 expect(selectReviewedProfiles(input,records).dataset).toEqual(input);
});

it('does not take a reviewed alternate profile already held by another valid identity',()=>{
 const group=REVIEWED_SOURCE_NAME_GROUPS.find(g=>g.name==='Jones, Miles E')!,initial=group.initialProfileId!,otherProfile=group.members.find(m=>m.id!==initial)!;
 const owner:ProfessorRecord={id:'miles',displayName:group.name,aliases:[],sourceProfessorId:initial,ratingUpdatedAt:date,rating:rating(initial)};
 const observation=(id:string)=>({sourceProfessorId:id,displayName:'Reserved observation',schoolName:'University of California San Diego',department:null,sourceId:'direct-rmp',updatedAt:date,rating:rating(id)});
 const other:ProfessorRecord={id:'other',displayName:'Reserved owner',aliases:[],sourceProfessorId:'999',ratingUpdatedAt:date,rating:rating('999'),rmpProfiles:[observation('999'),observation(otherProfile.id)]};
 const input:LocalDataset={schemaVersion:1,kind:'development',sources:[source,{...source,id:'grades',category:'historical-grades'}],professors:[owner,other],historicalCourseGrades:[history(owner.id,group.course!)]};
 const records=group.members.map(m=>({id:m.id,displayName:m.name,department:m.department,observedAt:date,rating:rating(m.id)}));
 expect(validateLocalDataset(input).valid).toBe(true);
 const result=selectReviewedProfiles(input,records);expect(result.dataset).toEqual(input);expect(result.skippedProfileIds.size).toBe(0);
});

it('does not add a source-name alias that would collide with an unrelated retained identity',()=>{
 const group=REVIEWED_SOURCE_NAME_GROUPS.find(g=>g.name==='Jones, Miles E')!,initial=group.initialProfileId!;
 const owner:ProfessorRecord={id:'miles',displayName:group.name,aliases:[],sourceProfessorId:initial,ratingUpdatedAt:date,rating:rating(initial)};
 const input:LocalDataset={schemaVersion:1,kind:'development',sources:[source,{...source,id:'grades',category:'historical-grades'}],professors:[owner,{id:'unreviewed-duplicate',displayName:'Miles Jones',aliases:[],rating:null}],historicalCourseGrades:[history(owner.id,group.course!)]};
 const records=group.members.map(m=>({id:m.id,displayName:m.name,department:m.department,observedAt:date,rating:rating(m.id)}));
 expect(selectReviewedProfiles(input,records).dataset).toEqual(input);
});

it('does not carry a stub alias into an owner when it collides with another retained identity',()=>{
 const group=REVIEWED_SOURCE_NAME_GROUPS.find(g=>g.name==='Prather, Lauren R')!;
 const owner:ProfessorRecord={id:group.ownerId!,displayName:group.name,aliases:[],rating:null};
 const stub:ProfessorRecord={id:group.stubs![0].id,displayName:group.stubs![0].name,aliases:['Unrelated person'],rating:null};
 const input:LocalDataset={schemaVersion:1,kind:'development',sources:[source,{...source,id:'grades',category:'historical-grades'}],professors:[owner,stub,{id:'unrelated',displayName:'Unrelated person',aliases:[],rating:null}],historicalCourseGrades:[history(owner.id,group.course!)]};
 const records=group.members.map(m=>({id:m.id,displayName:m.name,department:m.department,observedAt:date,rating:null}));
 expect(selectReviewedProfiles(input,records).dataset).toEqual(input);
});

it.each(REVIEWED_SOURCE_NAME_GROUPS)('associates only the reviewed source-name group $name',group=>{
 const records=group.members.map(m=>({id:m.id,displayName:m.name,department:m.department,observedAt:date,rating:rating(m.id)}));
 const id=group.ownerId??'owner',initial=group.initialProfileId!,unlinked=!!group.ownerId&&group.name!=='Klemmer, Scott R';
 const owner:ProfessorRecord={id,displayName:group.name,aliases:['Original alias'],rating:unlinked?null:rating(initial),...(unlinked?{}:{sourceProfessorId:initial,ratingUpdatedAt:date})};
 const stubs:ProfessorRecord[]=(group.stubs??[]).map(s=>({id:s.id,displayName:s.name,aliases:[],rating:s.sourceProfessorId?rating(s.sourceProfessorId):null,...(s.sourceProfessorId?{sourceProfessorId:s.sourceProfessorId,ratingUpdatedAt:date}:{})}));
 const input:LocalDataset={schemaVersion:1,kind:'development',sources:[source,{...source,id:'grades',category:'historical-grades'}],professors:group.createIfMissing?[]:[owner,...stubs],historicalCourseGrades:group.course?[history(id,group.course)]:[]};
 const result=selectReviewedProfiles(input,records),selected=result.dataset.professors.find(p=>p.id===id)!;
 expect(selected?.rmpProfiles).toHaveLength(group.members.length);
 expect(result.dataset.historicalCourseGrades).toEqual(input.historicalCourseGrades);
 if(!group.createIfMissing)expect(selected.aliases).toContain('Original alias');
 for(const stub of stubs){expect(result.dataset.professors.some(p=>p.id===stub.id)).toBe(false);expect(result.dataset.professorIdRedirects?.[stub.id]).toBe(id);}
 expect(validateLocalDataset(result.dataset).valid).toBe(true);
 expect(selectReviewedProfiles(result.dataset,records).dataset).toEqual(result.dataset);
 const altered=records.map((r,i)=>i? r:{...r,department:'Unrelated department'});
 const rejected=selectReviewedProfiles(input,altered);
 expect(rejected.dataset.professors.map(p=>p.id)).toEqual(input.professors.map(p=>p.id));
 expect(rejected.dataset.professors.find(p=>p.id===id)?.rmpProfiles).toBeUndefined();
});

it.each([
 ['easy-a-young-mark-t-4516fe6851','Young, Mark T','WCWP/100','2066567','Mark Young','English'],
 ['easy-a-davidson-michael-r-1334bed5e3','Davidson, Michael R','MAE/107','2589536','Michael Davidson','Engineering'],
])('assigns the verified distinct-person source to %s without adding its colliding short alias',(id,name,course,profile,sourceName,department)=>{
 const p:ProfessorRecord={id,displayName:name,aliases:['Preserved full name'],rating:null};
 const input:LocalDataset={schemaVersion:1,kind:'development',sources:[source,{...source,id:'grades',category:'historical-grades'}],professors:[p],historicalCourseGrades:[history(id,course)]};
 const result=selectReviewedProfiles(input,[{id:profile,displayName:sourceName,department,observedAt:date,rating:rating(profile)}]);
 expect(result.dataset.professors[0].rating?.sourceProfessorId).toBe(profile);expect(result.dataset.professors[0].aliases).toEqual(p.aliases);
 expect(result.dataset.historicalCourseGrades).toEqual(input.historicalCourseGrades);expect(validateLocalDataset(result.dataset).valid).toBe(true);
 const protectedInput={...input,historicalCourseGrades:[]};expect(selectReviewedProfiles(protectedInput,[{id:profile,displayName:sourceName,department,observedAt:date,rating:rating(profile)}]).dataset).toEqual(protectedInput);
});
