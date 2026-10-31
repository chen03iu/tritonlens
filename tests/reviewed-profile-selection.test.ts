import {it,expect} from 'vitest';
import {selectReviewedProfiles} from '../scripts/reviewed-profile-selection';
import {validateLocalDataset} from '../src/data/validation';
import type {LocalDataset} from '../src/data/types';

const rated=(id:string,count=5)=>({overallRating:4,difficulty:3,ratingCount:count,wouldTakeAgainPercent:80,sourceId:'direct-rmp',sourceProfessorId:id,updatedAt:'2026-10-29'});
const profile=(id:string,displayName:string,department:string,count=5)=>({id,displayName,department,observedAt:'2026-10-29',rating:count?rated(id,count):null});
function baseline(name:string,id:string,subjectCode:string,catalogNumber:string):LocalDataset{return {schemaVersion:1,kind:'development',sources:[{id:'direct-rmp',label:'RMP',category:'professor-ratings',homepageUrl:null,termsUrl:null,retrievedAt:'2026-10-29',permissionStatus:'pending',attribution:null},{id:'grades',label:'Grades',category:'historical-grades',homepageUrl:null,termsUrl:null,retrievedAt:'2026-10-29',permissionStatus:'pending',attribution:null}],professors:[{id:'teacher',displayName:name,aliases:['Preserved alias'],sourceProfessorId:id,rating:rated(id),ratingUpdatedAt:'2026-10-29'}],historicalCourseGrades:[{professorId:'teacher',subjectCode,catalogNumber,averageGpa:3,sampleSize:null,offeringCount:1,gradeDistribution:{aPercent:50,bPercent:50,cPercent:0,dPercent:0,fPercent:0,wPercent:0,pPercent:0,npPercent:0},sourceId:'grades',updatedAt:'2026-10-29'}]};}

it.each([
 ['Wong, Thomas Hong Tsun','1807235','Tom Wong','Political Science','3107722','Thomas Hong Tsun Wong','Physics','PHYS','1B'],
 ['Simpson, Junko Tokuda','1003907','Joseph Simpson','Chemistry','2265866','Junko Tokuda Simpson','Languages','JAPN','137C'],
 ['Lee, Siu Hei','1589053','Seung Lee','Mathematics','2173971','Siu Hei Lee','Music','MUS','4'],
 ['Moore, John C.','155212','Jim Moore','Anthropology','570304','John C. Moore','Linguistics','LIGN','150'],
])('replaces only the reviewed wrong profile for %s',(name,old,oldName,oldDept,next,nextName,nextDept,subject,catalog)=>{
 const input=baseline(name,old,subject,catalog),evidence=[profile(old,oldName,oldDept),profile(next,nextName,nextDept)];
 const result=selectReviewedProfiles(input,evidence);
 expect(result.dataset.professors[0]).toMatchObject({id:'teacher',aliases:input.professors[0].aliases,sourceProfessorId:next,rating:{sourceProfessorId:next}});
 expect(result.dataset.historicalCourseGrades).toEqual(input.historicalCourseGrades);
 expect(result.decisions).toContainEqual(expect.objectContaining({previousId:old,selectedId:next,action:'replaced-wrong-link'}));
 expect(validateLocalDataset(result.dataset).valid).toBe(true);
 for(const records of [evidence.slice(1),[evidence[0],{...evidence[1],department:'Other'}],[evidence[0],{...evidence[1],observedAt:'2026-01-01'}]])expect(selectReviewedProfiles(input,records).dataset).toEqual(input);
 const noHistory={...input,historicalCourseGrades:[]};
 expect(selectReviewedProfiles(noHistory,evidence).dataset).toEqual(noHistory);
 expect(selectReviewedProfiles(result.dataset,evidence).dataset).toEqual(result.dataset);
});

it.each([
 ['Ho, Ching Wei','3080826','Ching Ho','Mathematics',3,'3046145','Ching Wei Ho','Mathematics',58,'MATH','20A'],
 ['Tan, Tzer Han','3127092','Tzer Tan','Physics',6,'3137624','Tzer Han Tan','Physics',11,'PHYS','2B'],
 ['Armour, Jon Christopher','2256067','Jon Armour','Biology',1,'120826','Chris Armour','Science',89,'BIPN','105'],
 ['Lam, Tin Yiu','2186948','Tin Lam','Chemistry',56,'2275462','Tin Yiu Lam','Chemistry',150,'CHEM','6A'],
 ['Lu, Li-Fan','1824878','Lifan Lu','Biology',17,'1965433','Li-Fan Lu','Biology',11,'BICD','140'],
 ['Kozelka, Ellen Elizabeth','2607627','Ellen Kozelka','Anthropology',3,'2659187','Ellen Elizabeth Kozelka','Health Science',1,'GLBH','20'],
 ['Del Alamo, Juan Carlos','1512231','Juan Del Alamo','Engineering',2,'2268445','Juan Carlos Del alamo','Engineering',1,'MAE','104'],
 ['Lott, Margaret S.','1116044','Margaret Lott','American Sign Language',1,'783702','Peggy Lott','Languages',6,'LISL','1D'],
 ['Frisch, Joshua R','2966292','Joshua Frisch','Mathematics',19,'2987357','Joshua R Frisch','Mathematics',0,'MATH','100A'],
])('selects one independent reviewed aggregate for %s',(name,old,oldName,oldDept,oldCount,next,nextName,nextDept,nextCount,subject,catalog)=>{
 const input=baseline(name,old,subject,catalog),records=[profile(old,oldName,oldDept,oldCount),profile(next,nextName,nextDept,nextCount)];
 const expected=nextCount>oldCount?next:old,result=selectReviewedProfiles(input,records);
 expect(result.dataset.professors[0].rating).toMatchObject({sourceProfessorId:expected,ratingCount:Math.max(oldCount,nextCount)});
 expect([...result.skippedProfileIds]).toEqual([expected===old?next:old]);
 expect(result.dataset.historicalCourseGrades).toEqual(input.historicalCourseGrades);
 expect(result.dataset.professors[0].aliases).toEqual(expect.arrayContaining(['Preserved alias',oldName,nextName]));
 expect(result.dataset.professors[0].rmpProfiles?.map(p=>({id:p.sourceProfessorId,count:p.rating?.ratingCount??0,observed:p.updatedAt}))).toEqual([{id:old,count:oldCount,observed:'2026-10-29'},{id:next,count:nextCount,observed:'2026-10-29'}]);
 expect(selectReviewedProfiles(result.dataset,records).dataset).toEqual(result.dataset);
 const keep=selectReviewedProfiles(input,records,'keep-current');expect(keep.dataset.professors[0].rating?.sourceProfessorId).toBe(old);
 const tie=selectReviewedProfiles(input,records.map(p=>profile(p.id,p.displayName,p.department!,5)));expect(tie.dataset.professors[0].rating?.sourceProfessorId).toBe(old);
 expect(selectReviewedProfiles(input,[records[0],{...records[1],department:'Other'}]).dataset).toEqual(input);
 const stale=[records[0],{...records[1],observedAt:'2026-10-28',rating:records[1].rating?{...records[1].rating,updatedAt:'2026-10-28'}:null}];
 expect(selectReviewedProfiles(input,stale).dataset).toEqual(input);expect(selectReviewedProfiles(input,stale).skippedProfileIds.size).toBe(0);
});

it('retains the explicitly reviewed Aaron observation over an unrated main-campus alternate without refreshing its date',()=>{
 const original=baseline('Shalev, Aaron D','3050657','CSE','29');
 const input={...original,sources:[...original.sources,{...original.sources[0],id:'reviewed-aaron-rmp',homepageUrl:'https://www.ratemyprofessors.com/professor/3050657',retrievedAt:'2026-09-15'}],professors:[{...original.professors[0],ratingUpdatedAt:'2026-09-15',rating:{...rated('3050657',3),sourceId:'reviewed-aaron-rmp',updatedAt:'2026-09-15'}}]};
 const records=[profile('3157537','Aaron Schulman','Computer Science',0)];
 const result=selectReviewedProfiles(input,records);
 expect(result.dataset.professors[0].rating).toEqual(input.professors[0].rating);expect([...result.skippedProfileIds]).toEqual(['3157537']);
 expect(result.dataset.professors[0].ratingUpdatedAt).toBe('2026-09-15');
 expect(result.dataset.professors[0].rmpProfiles?.[0]).toMatchObject({sourceId:'reviewed-aaron-rmp',updatedAt:'2026-09-15',schoolName:'UC San Diego Extended Studies'});
 expect(selectReviewedProfiles(input,[profile('3157537','Aaron Schulman','Computer Science',8)]).dataset.professors[0].rating?.sourceProfessorId).toBe('3157537');
 const unreviewed={...input,professors:[{...input.professors[0],rating:{...input.professors[0].rating,sourceId:'direct-rmp'}}]};
 expect(selectReviewedProfiles(unreviewed,records).skippedProfileIds.size).toBe(0);
 for(const sources of [input.sources.filter(s=>s.id!=='reviewed-aaron-rmp'),input.sources.map(s=>s.id==='reviewed-aaron-rmp'?{...s,homepageUrl:'https://www.ratemyprofessors.com/professor/999'}:s)])expect(selectReviewedProfiles({...input,sources},records).skippedProfileIds.size).toBe(0);
});
