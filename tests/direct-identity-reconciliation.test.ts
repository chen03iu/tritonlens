import {it,expect} from 'vitest';
import {reconcileDirectIdentities} from '../scripts/reconcile-direct-identities';
import {lookupProfessor,lookupHistoricalCourseGrades} from '../src/data/lookup';
import {validateLocalDataset} from '../src/data/validation';
import type {LocalDataset,ProfessorRecord} from '../src/data/types';

const rating=(id:string)=>({overallRating:4,difficulty:3,ratingCount:5,wouldTakeAgainPercent:80,sourceId:'rmp',updatedAt:'2026-07-23',sourceProfessorId:id});
const person=(id:string,name:string,profile:string|null='101'):ProfessorRecord=>({id,displayName:name,aliases:[],rating:profile?rating(profile):null});
const distribution={aPercent:50,bPercent:50,cPercent:0,dPercent:0,fPercent:0,wPercent:0,pPercent:0,npPercent:0};
const grade=(professorId:string,subjectCode='MATH',catalogNumber='1')=>({professorId,subjectCode,catalogNumber,averageGpa:3.5,sampleSize:null,offeringCount:1,gradeDistribution:distribution,sourceId:'grades',updatedAt:'2026-07-23'});
const evidence=(id:string,displayName:string)=>({id,displayName,observedAt:'2026-10-29'});
function dataset(professors:ProfessorRecord[]):LocalDataset{return {schemaVersion:1,kind:'development',sources:[{id:'rmp',label:'RMP',category:'professor-ratings',homepageUrl:null,termsUrl:null,retrievedAt:'2026-07-23',permissionStatus:'pending',attribution:null},{id:'grades',label:'Grades',category:'historical-grades',homepageUrl:null,termsUrl:null,retrievedAt:'2026-07-23',permissionStatus:'pending',attribution:null}],professors,historicalCourseGrades:[]};}

it.each([
 ['3033351','Erik Johnson','Management','Johnson, Erik Barry','Johnson, Eric Lynn','MGT','160'],
 ['1967900','Elizabeth Miller','Writing','Miller, Elizabeth Deen','Miller, Elizabeth Anne','MCWP','50R'],
 ['762709','Xiao Wang','Languages','Wang, Xiao','Wang, Xiang','CHIN','20AM'],
 ['2421043','Mark Young','Chemistry','Young, Mark','Young, Mark T','CHEM','6B'],
 ['287742','John Blanco','Literature','Blanco, John D','Blanco, Juan Carlos','LTEN','28'],
 ['1505397','Chris Chambers','Economics','Chambers, Christopher P.','Chambers, Christina D','ECON','171'],
 ['103726','Michael Davidson','Literature','Davidson, R. Michael','Davidson, Michael R','LTEN','174'],
 ['110483','Joel Watson','Economics','Watson, Joel Christopher','John Watson','ECON','109'],
])('separates the externally verified owner of shared profile %s',(id,name,department,owner,wrong,subject,catalog)=>{
 const input={...dataset([person('owner',owner,id),person('wrong',wrong,id)]),historicalCourseGrades:[grade('owner',subject,catalog),grade('wrong','OTHER','1')]};
 const result=reconcileDirectIdentities(input,[{...evidence(id,name),department}]);
 expect(result.remaps).toEqual([]);expect(result.withheldRatings).toHaveLength(1);
 expect(result.dataset.professors.find(p=>p.id==='wrong')).toMatchObject({rating:null});
 expect(result.dataset.professors.find(p=>p.id==='wrong')?.sourceProfessorId).toBeUndefined();
 expect(result.dataset.professors.find(p=>p.id==='owner')?.rating).toEqual(input.professors[0].rating);
 expect(result.dataset.historicalCourseGrades).toEqual(input.historicalCourseGrades);
 for(const record of [{...evidence(id,name),department:'Unrelated'},evidence(id,name),{...evidence(id,name),department,observedAt:'2026-01-01'}])expect(reconcileDirectIdentities(input,[record]).withheldRatings).toEqual([]);
 const noOwnerCourse={...input,historicalCourseGrades:[grade('owner','OTHER','2'),grade('wrong','OTHER','1')]};
 expect(reconcileDirectIdentities(noOwnerCourse,[{...evidence(id,name),department}]).withheldRatings).toEqual([]);
});

it.each([
 ['983140','Tezcan, Faik','Akif Tezcan','Faik Akif Tezcan'],
 ['585032','Bandaru, Prabhakar','Bandaru, Prab','Prab Bandaru'],
 ['2439345','Styler, William Francis','Will Styler','William Styler'],
 ['3110381','Weng, Tsui-Wei (lily)','Lily Weng','Lily Weng'],
 ['1615201','Salehi Golsefidy, Alireza','Alireza Golsefidy','Alireza Salehi Golsefidy'],
 ['3160883','Jandaghi Semnani, Shabnam','Shabnam Semnani','Shabnam Semnani'],
 ['1423581','Bazargan-Forward, Saba','Bazargan, Saba','Saba Bazargan'],
 ['1422275','Power, Jade Yukana','Jade Power-Sotomayor','Jade Power'],
 ['1550608','Swanson, Steven James','Swanson, Steve','Steve Swanson'],
 ['1483312','Zhou, Yuan-Yuan','Yuanyuan Zhou','Yuanyuan Zhou'],
 ['2577289','You, Yizhuang','You, Yi-Zhuang','Yi-Zhuang You'],
 ['826389','Mc Culloch, Andrew Douglas','Andrew McCulloch','Andrew McCulloch'],
 ['3044664','Jahed Motlagh, Zeinab','Zeinab Jahed','Zeinab Jahed'],
 ['2989468','Naghizadeh Ardabili, Parinaz','Parinaz Naghizadeh','Parinaz Naghizadeh'],
 ['2554105','Soosai Raj, Adalbert Geral','Adalbert Gerald Soosai Raj','Adalbert Gerald Soosai Raj'],
 ['154631','Lugannani, Robert','Lugannani, Robert,','Robert, Lugannani'],
 ['289991','Larson, Philip Clarion','Larson, Phillip','Phillip Larson'],
 ['2942764','Molloie Jr., William H','Molloie, William','William Molloie'],
 ['2703985','Wright, Shelley Adams','Wright, Shelly Adams','Shelley Wright'],
 ['1897314','Oconnor, Joseph M.',"Joseph O'Connor",'Joseph Oconnor'],
 ['2321551','Pass, Natalye Joann','Pass, Natalye','Natalye Pass'],
 ['248395','Theodorakis, Emmanuel','Theodorakis, Emmanouil','Emmanuel Theodorakis'],
 ['2305714','Eliasson, Jenny Veronica','Eliasson, Veronica','Veronica Eliasson'],
])('reconciles externally corroborated names within profile %s',(id,canonical,preferred,source)=>{
 const input={...dataset([person('canonical',canonical,id),person('stub',preferred,id)]),historicalCourseGrades:[grade('canonical')]};
 const result=reconcileDirectIdentities(input,[evidence(id,source)]);
 expect(result.remaps).toHaveLength(1);
 for(const name of [canonical,preferred,source])expect(lookupProfessor(result.dataset,name)).toMatchObject({status:'found',record:{id:'canonical'}});
 expect(result.dataset.historicalCourseGrades).toEqual(input.historicalCourseGrades);
 expect(reconcileDirectIdentities(result.dataset,[evidence(id,source)]).dataset).toEqual(result.dataset);
});

it('reconciles the personally documented Alexander Niema / Niema identity within its existing profile',()=>{
 const input={...dataset([person('canonical','Moshiri, Alexander Niema','2279559'),person('short','Moshiri, Niema','2279559')]),historicalCourseGrades:[grade('canonical','CSE','100'),grade('short','CSE','185')]};
 const result=reconcileDirectIdentities(input,[evidence('2279559','Niema Moshiri')]);
 expect(result.remaps).toHaveLength(1);expect(result.dataset.historicalCourseGrades).toHaveLength(2);
 const full=lookupProfessor(result.dataset,'Moshiri, Alexander Niema'),short=lookupProfessor(result.dataset,'Moshiri, Niema');
 expect(full.status).toBe('found');expect(short.status).toBe('found');
 if(full.status==='found'&&short.status==='found')expect(full.record.id).toBe(short.record.id);
 const distinct={...input,professors:[input.professors[0],person('short','Moshiri, Niema','999')]};
 expect(reconcileDirectIdentities(distinct,[evidence('2279559','Niema Moshiri')]).remaps).toEqual([]);
});
it('preserves distinct terms of the same course when an explicitly verified identity spans both names',()=>{
 const a={...grade('a','CSE','100'),terms:[{year:2025,quarter:'FA' as const,averageGpa:3.5,gradeDistribution:distribution}]};
 const b={...grade('b','CSE','100'),terms:[{year:2026,quarter:'SP' as const,averageGpa:3.5,gradeDistribution:distribution}]};
 const input={...dataset([person('a','Moshiri, Alexander Niema','2279559'),person('b','Moshiri, Niema','2279559')]),historicalCourseGrades:[a,b]};
 const result=reconcileDirectIdentities(input,[evidence('2279559','Niema Moshiri')]);
 expect(result.remaps).toHaveLength(1);expect(result.dataset.historicalCourseGrades).toHaveLength(1);
 expect(result.dataset.historicalCourseGrades[0]).toMatchObject({offeringCount:2,sampleSize:null,terms:[{year:2026},{year:2025}]});
 expect(validateLocalDataset(result.dataset).valid).toBe(true);
 const conflicting={...input,historicalCourseGrades:[a,{...b,terms:[{...a.terms[0],averageGpa:2}]}]};
 expect(reconcileDirectIdentities(conflicting,[evidence('2279559','Niema Moshiri')]).remaps).toEqual([]);
});
it('does not pool preexisting aggregate-only duplicates while reconciling a verified empty stub',()=>{
 const canonical=person('a','Kadonaga, James','1315910'),stub=person('b','Jim Kadonaga','1315910');
 const input={...dataset([canonical,stub]),historicalCourseGrades:[grade('a'),{...grade('a'),averageGpa:2}]};
 const result=reconcileDirectIdentities(input,[evidence('1315910','James Kadonaga')]);
 expect(result.remaps).toHaveLength(1);expect(result.dataset.historicalCourseGrades).toHaveLength(2);
 expect(lookupHistoricalCourseGrades(result.dataset,'a','MATH','1').status).toBe('ambiguous');
});

it('merges exact same-profile duplicates inside a group containing an unrelated person',()=>{
 const input={...dataset([person('canonical','Doe, Jane'),person('stub','Jane Doe'),person('wrong','Other Person')]),historicalCourseGrades:[grade('canonical')]};
 const result=reconcileDirectIdentities(input,[evidence('101','Jane Doe')]);
 expect(result.dataset.professors.map(p=>p.id).sort()).toEqual(['canonical','wrong']);
 expect(lookupProfessor(result.dataset,'Jane Doe')).toMatchObject({status:'found',record:{id:'canonical'}});
 expect(result.dataset.professors.find(p=>p.id==='wrong')?.rating).toBeNull();
 expect(result.dataset.professorIdRedirects).toEqual({stub:'canonical'});
 expect(result.withheldRatings).toContainEqual(expect.objectContaining({professorId:'wrong',sourceProfessorId:'101'}));
});
it('supports a unique source-backed first initial without merging different given names',()=>{
 const input={...dataset([person('canonical','Carr, Jennifer Rose'),person('stub','J. Carr'),person('other','Carr, John')]),historicalCourseGrades:[grade('canonical','PHIL')]};
 const result=reconcileDirectIdentities(input,[{id:'101',displayName:'Jennifer Carr'}]);
 expect(lookupProfessor(result.dataset,'J. Carr')).toMatchObject({status:'found',record:{id:'canonical'}});
 expect(result.dataset.professors.some(p=>p.id==='other')).toBe(true);
});
it('does not bridge conflicting full middle names through an omitted middle name',()=>{
 const input=dataset([person('a','Carr, Jennifer Rose'),person('b','Carr, Jennifer Rachel'),person('short','Jennifer Carr')]);
 const result=reconcileDirectIdentities(input,[{id:'101',displayName:'Jennifer Carr'}]);
 expect(result.dataset.professors).toHaveLength(3);
});
it('does not merge distinct profile IDs even for the same name',()=>{
 const input=dataset([person('a','Jane Doe','101'),person('b','Doe, Jane','202')]);
 expect(reconcileDirectIdentities(input,[{id:'101',displayName:'Jane Doe'},{id:'202',displayName:'Jane Doe'}]).remaps).toEqual([]);
});
it('withholds an incompatible shared-profile donor before collapsing an exact declared empty stub',()=>{
 const input={...dataset([person('canonical','Miller, Pearson',null),person('stub','Pearson Miller','101'),person('actual','Miller, Amanda Pearl','101')]),historicalCourseGrades:[grade('canonical'),grade('actual','FMPH')]};
 const owner={...input.professors[0],aliases:['Pearson Miller']};
 const result=reconcileDirectIdentities({...input,professors:[owner,...input.professors.slice(1)]},[evidence('101','Amanda Miller')]);
 expect(result.dataset.professors.find(p=>p.id==='canonical')?.rating).toBeNull();
 expect(result.dataset.professors.some(p=>p.id==='stub')).toBe(false);
 expect(result.dataset.professors.find(p=>p.id==='actual')?.rating?.sourceProfessorId).toBe('101');
});
it('keeps possible first-name prefixes and reviewed aliases for further review',()=>{
 const prefix=dataset([person('a','Bandaru, Prab'),person('b','Bandaru, Prabhakar')]);
 expect(reconcileDirectIdentities(prefix,[{id:'101',displayName:'Prab Bandaru'}]).withheldRatings).toEqual([]);
 const middle=dataset([person('a','Tezcan, Faik Akif'),person('b','Akif Tezcan')]);
 expect(reconcileDirectIdentities(middle,[{id:'101',displayName:'Faik Akif Tezcan'}]).withheldRatings).toEqual([]);
 const renamed={...dataset([person('a','Oldsurname, Jane'),person('b','Different Person')]),professors:[{...person('a','Oldsurname, Jane'),aliases:['Jane Newsurname']},person('b','Different Person')]};
 expect(reconcileDirectIdentities(renamed,[{id:'101',displayName:'Jane Newsurname'}]).dataset.professors.find(p=>p.id==='a')?.rating).not.toBeNull();
});
it.each([
 ['Shelly Adams Wright','Shelley Wright','101'],
 ['Emmanouil Theodorakis','Emmanuel Theodorakis','101'],
 ['Robert Lugannani','Robert, Lugannani','101'],
 ['Yizhuang You','Yi-Zhuang You','101'],
 ['Jim Kadonaga','James Kadonaga','1315910'],
 ['Nadezhda Polikarpova','Nadia Polikarpova','2371412'],
])('does not revoke a plausible spelling/order or externally verified name variant: %s', (name,sourceName,id)=>{
 const input=dataset([person('a',name,id),person('b',sourceName,id)]);
 expect(reconcileDirectIdentities(input,[evidence(id,sourceName)]).withheldRatings).toEqual([]);
});
it('retains unreviewed renames and incompatible or conflicting historical identities',()=>{
 const hold=dataset([person('a','Harpin, Natalye','999'),person('b','Pass, Natalye','999')]);
 expect(reconcileDirectIdentities(hold,[{id:'999',displayName:'Natalye Pass'}]).dataset).toEqual(hold);
 const original=dataset([person('a','Doe, Jane'),person('b','Jane Doe')]);
 const differentSubjects={...original,historicalCourseGrades:[grade('a','MATH'),grade('b','PHIL')]};
 expect(reconcileDirectIdentities(differentSubjects,[{id:'101',displayName:'Jane Doe'}]).remaps).toEqual([]);
 const conflicting={...original,historicalCourseGrades:[grade('a'),{...grade('b'),averageGpa:2}]};
 expect(reconcileDirectIdentities(conflicting,[{id:'101',displayName:'Jane Doe'}]).remaps).toEqual([]);
});
it('resolves Natalye Harpin and Pass only under their primary-source-reviewed profile',()=>{
 const input=dataset([person('a','Harpin, Natalye','2321551'),person('b','Pass, Natalye','2321551')]);
 const result=reconcileDirectIdentities(input,[evidence('2321551','Natalye Pass')]);
 expect(result.remaps).toHaveLength(1);
 for(const name of ['Natalye Harpin','Natalye Pass','Natalye Joann Pass','Natalye Pass Harpin'])expect(lookupProfessor(result.dataset,name).status).toBe('found');
});
it('preserves every term/history, resolves retired IDs, and is pure/idempotent',()=>{
 const input={...dataset([person('a','Doe, Jane'),person('b','Jane Doe')]),historicalCourseGrades:[grade('a'),grade('b','MATH','2')]};
 const before=JSON.stringify(input);const result=reconcileDirectIdentities(input,[{id:'101',displayName:'Jane Doe'}]);
 expect(JSON.stringify(input)).toBe(before);expect(result.dataset.historicalCourseGrades).toHaveLength(2);
 expect(lookupHistoricalCourseGrades(result.dataset,'b','MATH','2').status).toBe('found');
 expect(reconcileDirectIdentities(result.dataset,[{id:'101',displayName:'Jane Doe'}]).dataset).toEqual(result.dataset);
 expect(validateLocalDataset(result.dataset).valid).toBe(true);
 expect(validateLocalDataset({...result.dataset,professorIdRedirects:{a:'missing'}}).valid).toBe(false);
 expect(validateLocalDataset({...result.dataset,professorIdRedirects:{a:'b',b:'a'}}).valid).toBe(false);
});
it('resolves legacy rounding conflicts only with a newer validated same-profile observation',()=>{
 const canonical={...person('a','Bergen, Leon'),rating:{...rating('101'),wouldTakeAgainPercent:62}};
 const stub={...person('b','Leon Bergen'),rating:{...rating('101'),wouldTakeAgainPercent:63}};
 const input={...dataset([canonical,stub]),historicalCourseGrades:[grade('a','LIGN')]};
 expect(reconcileDirectIdentities(input,[{id:'101',displayName:'Leon Bergen'}]).remaps).toEqual([]);
 const current={...rating('101'),wouldTakeAgainPercent:62.5,sourceId:'rmp',updatedAt:'2026-10-29'};
 const result=reconcileDirectIdentities(input,[{id:'101',displayName:'Leon Bergen',rating:current,observedAt:'2026-10-29'}]);
 expect(result.remaps).toHaveLength(1);expect(result.dataset.professors[0].rating?.wouldTakeAgainPercent).toBe(62.5);
});
it('does not revoke a newer stored profile link using stale or undated identity evidence',()=>{
 const recent={...person('jane','Jane Doe'),rating:{...rating('101'),updatedAt:'2026-10-29'},ratingUpdatedAt:'2026-10-29'};
 const input=dataset([recent,person('mark','Mark Brown')]);
 expect(reconcileDirectIdentities(input,[{id:'101',displayName:'Mark Brown',observedAt:'2026-01-01'}]).dataset.professors.find(p=>p.id==='jane')?.rating).toEqual(recent.rating);
 expect(reconcileDirectIdentities(input,[{id:'101',displayName:'Mark Brown'}]).withheldRatings).toEqual([]);
});
it('does not merge initials-only histories without a corroborated full-name member',()=>{
 const input={...dataset([person('a','J Carr'),person('b','Carr, J')]),historicalCourseGrades:[grade('a','PHIL','1'),grade('b','PHIL','2')]};
 expect(reconcileDirectIdentities(input,[]).remaps).toEqual([]);
 expect(reconcileDirectIdentities(input,[evidence('101','Other Person')]).remaps).toEqual([]);
});
