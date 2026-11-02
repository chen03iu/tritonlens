import {analyzeNameRelationship} from '../src/data/name-variants';
import incorrectBindings from './reviewed-incorrect-profile-bindings.json';
import {normalizeInstructorName} from '../src/data/lookup';
import type {LocalDataset,ProfessorRecord,ProfessorRating} from '../src/data/types';

interface ProfileEvidence {readonly id:string;readonly displayName:string;readonly observedAt?:string;readonly rating?:ProfessorRating|null;readonly department?:string;readonly schoolName?:string}
export interface IdentityRemap {readonly fromId:string;readonly toId:string;readonly fromName:string;readonly toName:string;readonly sourceProfessorId:string|null;readonly reason:string}
export interface WithheldRating {readonly professorId:string;readonly name:string;readonly sourceProfessorId:string;readonly sourceName:string;readonly reason:string}
// Primary sources corroborate these reviewed variants; profile IDs guard the scope.
const reviewedVariants=[
  {id:'1315910',names:['Jim Kadonaga','James Kadonaga'],evidence:'https://biology.ucsd.edu/research/faculty/jkadonaga.html'},
  {id:'2371412',names:['Nadia Polikarpova','Nadezhda Polikarpova'],evidence:'https://jacobsschool.ucsd.edu/people/profile/nadezhda-polikarpova'},
  {id:'2279559',names:['Alexander Niema Moshiri','Niema Moshiri'],evidence:'https://niema.net/'},
  {id:'983140',names:['Faik Tezcan','Akif Tezcan','Faik Akif Tezcan'],evidence:'https://chem-web.ucsd.edu/faculty/profiles/tezcan_faik_a.html'},
  {id:'585032',names:['Prabhakar Bandaru','Prab Bandaru'],evidence:'https://nanomaterials.ucsd.edu/'},
  {id:'2439345',names:['William Francis Styler','Will Styler','William Styler'],evidence:'https://wstyler.ucsd.edu/docs/personalbranding.html'},
  {id:'3110381',names:['Tsui-Wei (lily) Weng','Lily Weng'],evidence:'https://lilyweng.github.io/'},
  {id:'1615201',names:['Alireza Salehi Golsefidy','Alireza Golsefidy'],evidence:'https://roosevelt.ucsd.edu/about/faculty.html'},
  {id:'3160883',names:['Shabnam Jandaghi Semnani','Shabnam Semnani'],evidence:'https://jacobsschool.ucsd.edu/people/profile/shabnam-semnani'},
  {id:'1423581',names:['Saba Bazargan-Forward','Saba Bazargan'],evidence:'https://philosophy.ucsd.edu/people/faculty-sites/sbazargan.html'},
  {id:'1422275',names:['Jade Yukana Power','Jade Power-Sotomayor','Jade Power'],evidence:'https://theatre.ucsd.edu/people/faculty/performance-studies/jade-power-sotomayor.html'},
  {id:'1550608',names:['Steven James Swanson','Steve Swanson'],evidence:'https://jacobsschool.ucsd.edu/faculty/profile?id=259'},
  {id:'1483312',names:['Yuan-Yuan Zhou','Yuanyuan Zhou'],evidence:'https://cseweb.ucsd.edu/~yyzhou/'},
  {id:'2577289',names:['Yizhuang You','Yi-Zhuang You'],evidence:'https://everettyou.github.io/people/YZYou'},
  {id:'826389',names:['Andrew Douglas Mc Culloch','Andrew Douglas McCulloch','Andrew McCulloch'],evidence:'https://matsci.ucsd.edu/faculty/andrew-mcculloch'},
  {id:'3044664',names:['Zeinab Jahed Motlagh','Zeinab Jahed'],evidence:'https://profiles.ucsd.edu/zeinab.jahedmotlagh'},
  {id:'2989468',names:['Parinaz Naghizadeh Ardabili','Parinaz Naghizadeh'],evidence:'https://parinazn.com/teaching/'},
  {id:'2554105',names:['Adalbert Geral Soosai Raj','Adalbert Gerald Soosai Raj'],evidence:'https://cse.ucsd.edu/people/faculty-profiles/adalbert-gerald-soosai-raj'},
  {id:'154631',names:['Robert Lugannani','Lugannani, Robert,','Robert, Lugannani'],evidence:'https://jacobsschool.ucsd.edu/people/profile/robert-lugannani'},
  {id:'289991',names:['Philip Clarion Larson','Phillip Larson','Philip Larson'],evidence:'https://music-cms.ucsd.edu/people/faculty/emeritus_faculty/philip-larson/index.html'},
  {id:'2942764',names:['William H Molloie Jr.','William Molloie'],evidence:'https://rady.ucsd.edu/_files/faculty-research/cv/William-Molloie-CV.pdf'},
  {id:'2703985',names:['Shelley Adams Wright','Shelly Adams Wright','Shelley Wright','Shelly Wright'],evidence:'https://www.seti.org/news-archive/news-archive-detail?id=5013'},
  {id:'1897314',names:["Joseph M. O'Connor",'Joseph M. Oconnor',"Joseph O'Connor",'Joseph Oconnor'],evidence:'https://oconnorgroup.ucsd.edu/Joe.html'},
  {id:'2321551',names:['Natalye Pass','Natalye Joann Pass','Natalye Harpin','Natalye Pass Harpin'],evidence:'https://natalyeharpin.com/about-me'},
  {id:'248395',names:['Emmanouil Theodorakis','Emmanuel Theodorakis'],evidence:'https://theodorakisgroup.ucsd.edu/page5.html'},
  {id:'2305714',names:['Jenny Veronica Eliasson','Veronica Eliasson'],evidence:'https://eliasson.mines.edu/cv.html'},
];
// Reviewed ownership exclusions require the expected roster department and owner course.
const reviewedSeparations=[
  {id:'3033351',sourceName:'Erik Johnson',department:'Management',owner:'Johnson, Erik Barry',rejected:'Johnson, Eric Lynn',course:'MGT|160'},
  {id:'1967900',sourceName:'Elizabeth Miller',department:'Writing',owner:'Miller, Elizabeth Deen',rejected:'Miller, Elizabeth Anne',course:'MCWP|50R'},
  {id:'762709',sourceName:'Xiao Wang',department:'Languages',owner:'Wang, Xiao',rejected:'Wang, Xiang',course:'CHIN|20AM'},
  {id:'2421043',sourceName:'Mark Young',department:'Chemistry',owner:'Young, Mark',rejected:'Young, Mark T',course:'CHEM|6B'},
  {id:'287742',sourceName:'John Blanco',department:'Literature',owner:'Blanco, John D',rejected:'Blanco, Juan Carlos',course:'LTEN|28'},
  {id:'1505397',sourceName:'Chris Chambers',department:'Economics',owner:'Chambers, Christopher P.',rejected:'Chambers, Christina D',course:'ECON|171'},
  {id:'103726',sourceName:'Michael Davidson',department:'Literature',owner:'Davidson, R. Michael',rejected:'Davidson, Michael R',course:'LTEN|174'},
  {id:'110483',sourceName:'Joel Watson',department:'Economics',owner:'Watson, Joel Christopher',rejected:'John Watson',course:'ECON|109'},
];
const profile=(p:ProfessorRecord)=>p.sourceProfessorId??p.rating?.sourceProfessorId??null;
const natural=(name:string)=>{const parts=name.split(',').map(x=>x.trim());return parts.length===2?`${parts[1]} ${parts[0]}`:name;};
const tokens=(name:string)=>normalizeInstructorName(name.normalize('NFKD').replace(/\p{M}/gu,'').replace(/[‐‑‒–—―-]/g,' ').replace(/[^\p{L}\p{N}\s]/gu,'')).split(/\s+/).filter(Boolean);
const nameKey=(name:string)=>tokens(natural(name)).join(' ');
function parts(name:string){const comma=name.split(',');if(comma.length===2)return {given:tokens(comma[1]),surname:tokens(comma[0])};const full=tokens(name);return {given:full.slice(0,-1),surname:full.slice(-1)};}
function ordinary(left:string,right:string):boolean {
  if(nameKey(left)===nameKey(right))return true;
  const allowed=['exact-reordered','middle-omitted','middle-initial','orthographic-variant'];
  return allowed.includes(analyzeNameRelationship(left,right).kind)||allowed.includes(analyzeNameRelationship(right,left).kind);
}
function reviewedPair(id:string|null,left:string,right:string):boolean {
  const reviewed=reviewedVariants.find(entry=>entry.id===id);
  return !!reviewed&&[left,right].every(name=>reviewed.names.some(variant=>ordinary(name,variant)));
}
function supports(record:ProfessorRecord,sourceName:string):boolean{return [record.displayName,...record.aliases].some(name=>ordinary(name,sourceName)||reviewedPair(profile(record),name,sourceName));}
function editDistance(left:string,right:string):number {
  let prior=Array.from({length:right.length+1},(_,i)=>i);
  for(let i=1;i<=left.length;i++){const row=[i];for(let j=1;j<=right.length;j++)row[j]=Math.min(row[j-1]+1,prior[j]+1,prior[j-1]+Number(left[i-1]!==right[j-1]));prior=row;}
  return prior[right.length];
}
function possibleVariant(record:ProfessorRecord,sourceName:string):boolean {
  if(supports(record,sourceName))return true;
  const source=parts(sourceName);
  return [record.displayName,...record.aliases].some(name=>{
    const candidate=parts(name),a=candidate.given[0],b=source.given[0];
    if(tokens(natural(name)).sort().join(' ')===tokens(natural(sourceName)).sort().join(' ')
      ||nameKey(name).replace(/ /g,'')===nameKey(sourceName).replace(/ /g,''))return true;
    if(!a||!b||a===b||a.length===1||b.length===1)return true;
    if(candidate.surname.join(' ')===source.surname.join(' ')&&(source.given.includes(a)||candidate.given.includes(b)))return true;
    if(candidate.surname.join(' ')===source.surname.join(' ')){
      const distance=editDistance(a,b),minimum=Math.min(a.length,b.length);
      if(minimum>=4&&distance<=2)return true;
      if(minimum>=6&&a.slice(0,3)===b.slice(0,3)&&distance<=3)return true;
    }
    return candidate.surname.join(' ')===source.surname.join(' ')&&Math.min(a.length,b.length)>=3&&(a.startsWith(b)||b.startsWith(a));
  });
}
function initialMatches(initial:string,full:string):boolean {
  const a=parts(initial),b=parts(full);
  return a.given[0]?.length===1&&b.given[0]?.length>1&&a.surname.join(' ')===b.surname.join(' ')
    &&a.given.length<=b.given.length&&a.given.every((token,index)=>token===b.given[index]||(token.length===1&&b.given[index].startsWith(token)));
}
const courseKey=(grade:LocalDataset['historicalCourseGrades'][number])=>`${grade.subjectCode.trim().toUpperCase()}|${grade.catalogNumber.trim().toUpperCase().replace(/^0+(?=\d)/,'')}`;
function compatibleTerms(left:LocalDataset['historicalCourseGrades'][number],right:LocalDataset['historicalCourseGrades'][number]):boolean {
  if(!left.terms?.length||!right.terms?.length||left.sourceId!==right.sourceId||left.sampleSize!==null||right.sampleSize!==null)return false;
  const prior=new Map(left.terms.map(term=>[`${term.year}-${term.quarter}`,term]));
  return right.terms.every(term=>!prior.has(`${term.year}-${term.quarter}`)||JSON.stringify(prior.get(`${term.year}-${term.quarter}`))===JSON.stringify(term));
}

/** Offline only: same-profile clusters are not assumed to be one person. */
export function reconcileDirectIdentities(input:LocalDataset,profiles:readonly ProfileEvidence[]){
  const remaps:IdentityRemap[]=[],withheldRatings:WithheldRating[]=[];
  if(input.kind!=='development')return {dataset:input,remaps,withheldRatings};
  const sourceNames=new Map(profiles.map(p=>[p.id,p.displayName]));
  const sourceProfiles=new Map(profiles.map(p=>[p.id,p]));
  const originalGroups=new Map<string,ProfessorRecord[]>();
  const histories=new Map<string,LocalDataset['historicalCourseGrades'][number][]>();
  for(const g of input.historicalCourseGrades){const group=histories.get(g.professorId)??[];group.push(g);histories.set(g.professorId,group);}
  for(const p of input.professors){const id=profile(p);if(id){const group=originalGroups.get(id)??[];group.push(p);originalGroups.set(id,group);}}
  // Withhold ambiguous shared legacy links; never transfer their metrics to a namesake.
  let professors=input.professors.map(p=>{
    const id=profile(p),source=id?sourceProfiles.get(id):undefined,sourceName=source?.displayName;
    const incorrect=incorrectBindings.entries.find(rule=>rule.professorId===p.id&&rule.sourceProfessorId===id);
    if(incorrect){
      const observed=Date.parse(source?.observedAt??''),saved=Date.parse(p.ratingUpdatedAt??p.rating?.updatedAt??'');
      if(!source||profiles.filter(row=>row.id===id).length!==1||nameKey(p.displayName)!==nameKey(incorrect.expectedName)
        ||nameKey(source.displayName)!==nameKey(incorrect.sourceDisplayName)||normalizeInstructorName(source.department??'')!==normalizeInstructorName(incorrect.department)
        ||normalizeInstructorName(source.schoolName??'')!=='university of california san diego'
        ||!Number.isFinite(observed)||!Number.isFinite(saved)||observed<saved||source.rating===undefined
        ||p.rating&&p.rating.sourceProfessorId!==id
        ||p.rmpProfiles?.some(row=>row.sourceProfessorId!==id)
        ||source.rating&&(source.rating.sourceProfessorId!==id||source.rating.updatedAt!==source.observedAt)
        ||histories.get(p.id)?.filter(row=>courseKey(row)===incorrect.course.replace('/','|')).length!==1){
        throw new Error('Reviewed incorrect profile binding requires revalidation: '+p.displayName+'. Import stopped.');
      }
    }
    if(!id||!sourceName||!incorrect&&(originalGroups.get(id)?.length??0)<2)return p;
    const separation=reviewedSeparations.find(entry=>entry.id===id&&nameKey(entry.sourceName)===nameKey(sourceName)
      &&normalizeInstructorName(source?.department??'')===normalizeInstructorName(entry.department)
      &&nameKey(p.displayName)===nameKey(entry.rejected)
      &&originalGroups.get(id)!.some(owner=>nameKey(owner.displayName)===nameKey(entry.owner)
        &&histories.get(owner.id)?.some(row=>courseKey(row)===entry.course)));
    if(!incorrect&&!separation&&possibleVariant(p,sourceName))return p;
    if(!source?.observedAt||source.observedAt<(p.ratingUpdatedAt??p.rating?.updatedAt??''))return p;
    withheldRatings.push({professorId:p.id,name:p.displayName,sourceProfessorId:id,sourceName,reason:incorrect?'Reviewed primary-source evidence identifies this profile as a different instructor.':separation
      ?'Reviewed primary-source department and course evidence identifies a different owner of this profile.'
      :'Shared legacy profile has incompatible full-name evidence in the direct roster.'});
    const {sourceProfessorId:_,ratingUpdatedAt:__,...rest}=p;
    if(incorrect){const {rmpProfiles:_profiles,...withoutProfiles}=rest;return {...withoutProfiles,rating:null};}
    return {...rest,rating:null};
  });
  const replacements=new Map<string,string>();
  const coalesceTargets=new Set<string>();
  const resolve=(id:string):string=>{while(replacements.has(id))id=replacements.get(id)!;return id;};
  const history=(id:string)=>[...histories.entries()].filter(([key])=>resolve(key)===id).flatMap(([,rows])=>rows);
  function compatibleHistory(group:ProfessorRecord[]):boolean {
    const id=profile(group[0]);
    const verified=!!id&&group.every(a=>profile(a)===id&&group.every(b=>reviewedPair(id,a.displayName,b.displayName)));
    const rows=group.map(p=>history(p.id)).filter(rows=>rows.length);
    for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
      const subjects=new Set(rows[i].map(g=>g.subjectCode.trim().toUpperCase()));
      if(!rows[j].some(g=>subjects.has(g.subjectCode.trim().toUpperCase())))return false;
      const keys=new Set(rows[i].map(courseKey));
      for(const right of rows[j])if(keys.has(courseKey(right))){
        for(const left of rows[i].filter(g=>courseKey(g)===courseKey(right))){
          if(!verified||!compatibleTerms(left,right))return false;
        }
      }
    }
    return true;
  }
  function rawPair(a:ProfessorRecord,b:ProfessorRecord):boolean {
    const pa=profile(a),pb=profile(b);
    if(pa&&pb&&pa!==pb)return false;
    if(pa&&pa===pb&&reviewedPair(pa,a.displayName,b.displayName))return true;
    if(ordinary(a.displayName,b.displayName))return true;
    const sourceName=pa&&pa===pb?sourceNames.get(pa):undefined;
    return !!sourceName&&((initialMatches(a.displayName,b.displayName)&&supports(b,sourceName))||(initialMatches(b.displayName,a.displayName)&&supports(a,sourceName)));
  }
  function merge(group:ProfessorRecord[],reason:string):void {
    if(group.length<2||!compatibleHistory(group))return;
    if(group.some(p=>parts(p.displayName).given[0]?.length===1)
      &&!group.some(p=>parts(p.displayName).given[0]?.length>1&&!!sourceNames.get(profile(p)??'')&&supports(p,sourceNames.get(profile(p)??'')!)))return;
    const ids=new Set(group.map(profile).filter(Boolean));if(ids.size>1)return;
    // Without a shared profile, accept only a declared, empty full-name stub.
    if(group.some(p=>!profile(p))){
      const owners=group.filter(p=>history(p.id).length);
      if(owners.length!==1||group.some(p=>p.id!==owners[0].id&&(!owners[0].aliases.some(alias=>nameKey(alias)===nameKey(p.displayName))||history(p.id).length)))return;
      if(group.some(p=>nameKey(p.displayName)!==nameKey(owners[0].displayName)))return;
    }
    const priority=(a:ProfessorRecord,b:ProfessorRecord)=>history(b.id).length-history(a.id).length||Number(b.displayName.includes(','))-Number(a.displayName.includes(','))||a.id.localeCompare(b.id,'en-US');
    const keeper=[...group].sort(priority)[0];
    const stamp=(p:ProfessorRecord)=>p.ratingUpdatedAt??p.rating?.updatedAt??'';
    const newest=[...group].sort((a,b)=>stamp(b).localeCompare(stamp(a))||priority(a,b));
    const contenders=newest.filter(p=>stamp(p)===stamp(newest[0]));
    const metric=(p:ProfessorRecord)=>JSON.stringify(p.rating&&[p.rating.overallRating,p.rating.difficulty,p.rating.ratingCount,p.rating.wouldTakeAgainPercent,p.rating.sourceProfessorId]);
    let donor=newest[0];
    const shared=profile(donor)??[...ids][0]??null;
    if(new Set(contenders.map(metric)).size>1){
      const source=shared?sourceProfiles.get(shared):undefined;
      if(!source||source.rating===undefined||!source.observedAt||source.observedAt<=stamp(newest[0])
        ||group.some(p=>!possibleVariant(p,source.displayName))
        ||professors.some(p=>profile(p)===shared&&!group.some(member=>member.id===p.id)))return;
      donor={...keeper,rating:source.rating,sourceProfessorId:shared!,ratingUpdatedAt:source.observedAt};
    }
    const reviewed=shared&&group.every(a=>group.every(b=>reviewedPair(shared,a.displayName,b.displayName)))?reviewedVariants.find(entry=>entry.id===shared):undefined;
    const replacement:ProfessorRecord={...keeper,aliases:[...new Set([...(keeper.aliases),...(reviewed?.names??[]),...group.filter(p=>p.id!==keeper.id).flatMap(p=>[p.displayName,...p.aliases])])].filter(name=>name!==keeper.displayName),rating:donor.rating,...(shared?{sourceProfessorId:shared}:{}),...(stamp(donor)?{ratingUpdatedAt:stamp(donor)}:{})};
    if(reviewed)coalesceTargets.add(keeper.id);
    const groupIds=new Set(group.map(p=>p.id));
    professors=professors.filter(p=>!groupIds.has(p.id)||p.id===keeper.id).map(p=>p.id===keeper.id?replacement:p);
    for(const member of group)if(member.id!==keeper.id){replacements.set(member.id,keeper.id);remaps.push({fromId:member.id,toId:keeper.id,fromName:member.displayName,toName:keeper.displayName,sourceProfessorId:shared,reason});}
  }
  // Exact subclusters may be reconciled even when an unrelated name reused the same ID.
  const exact=new Map<string,ProfessorRecord[]>();
  for(const p of professors){const key=nameKey(p.displayName);const group=exact.get(key)??[];group.push(p);exact.set(key,group);}
  for(const group of exact.values())if(group.every((a,i)=>group.slice(i+1).every(b=>rawPair(a,b))))merge(group,'Exact full-name internal duplicate');
  const byProfile=new Map<string,ProfessorRecord[]>();
  for(const p of professors){const id=profile(p);if(id){const group=byProfile.get(id)??[];group.push(p);byProfile.set(id,group);}}
  for(const group of byProfile.values()){
    const ambiguous=new Set(group.filter(a=>{
      const targets=group.filter(b=>a.id!==b.id&&rawPair(a,b));
      return targets.some((b,i)=>targets.slice(i+1).some(c=>!rawPair(b,c)));
    }).map(p=>p.id));
    const clusters:ProfessorRecord[][]=[];
    for(const p of [...group].sort((a,b)=>a.id.localeCompare(b.id,'en-US'))){
      if(ambiguous.has(p.id)){clusters.push([p]);continue;}
      const possible=clusters.filter(cluster=>cluster.every(other=>!ambiguous.has(other.id)&&rawPair(p,other)));
      if(possible.length===1)possible[0].push(p);else clusters.push([p]);
    }
    for(const cluster of clusters)merge(cluster,'Same-profile compatible name with direct-source corroboration');
  }
  if(!remaps.length&&!withheldRatings.length)return {dataset:input,remaps,withheldRatings};
  const redirects=Object.fromEntries([...Object.entries(input.professorIdRedirects??{}),...replacements].map(([from,to])=>[from,resolve(to)]));
  const remapped=input.historicalCourseGrades.map(g=>replacements.has(g.professorId)?{...g,professorId:resolve(g.professorId)}:g);
  const combined:LocalDataset['historicalCourseGrades'][number][]=[],locations=new Map<string,number>();
  const verifiedTargets=new Set([...coalesceTargets].map(resolve));
  const quarterOrder={WI:0,SP:1,S1:2,SU:3,S2:4,FA:5};
  for(const row of remapped){
    const key=`${row.professorId}|${courseKey(row)}`,position=locations.get(key);
    if(position===undefined||!verifiedTargets.has(row.professorId)){locations.set(key,combined.length);combined.push(row);continue;}
    const prior=combined[position];
    if(!compatibleTerms(prior,row)){combined.push(row);continue;}
    const unique=new Map([...(prior.terms??[]),...(row.terms??[])].map(term=>[`${term.year}-${term.quarter}`,term]));
    const terms=[...unique.values()].sort((a,b)=>b.year-a.year||quarterOrder[b.quarter]-quarterOrder[a.quarter]);
    combined[position]={...prior,averageGpa:terms[0].averageGpa,gradeDistribution:terms[0].gradeDistribution,offeringCount:terms.length,sampleSize:null,updatedAt:[prior.updatedAt,row.updatedAt].sort().at(-1)!,terms};
  }
  const dataset:LocalDataset={...input,professors,professorIdRedirects:redirects,historicalCourseGrades:combined};
  return {dataset,remaps:remaps.map(entry=>({...entry,toId:resolve(entry.toId),toName:professors.find(p=>p.id===resolve(entry.toId))!.displayName})),withheldRatings};
}
