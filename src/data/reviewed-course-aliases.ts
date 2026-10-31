import {lookupHistoricalCourseGrades,normalizeInstructorName} from './lookup';
import type {ProfessorLookupResult} from './lookup';
import type {LocalDataset,ProfessorRecord} from './types';

export interface InstructorCourseKey {
  readonly subjectCode:string;
  readonly catalogNumber:string;
}

// UCSD explicitly lists David Jordan / dkjordan@ucsd.edu teaching ANTH87:
// https://anthropology.ucsd.edu/people/visiting/index.html
// RMP32591 is Anthropology and has ANTH87 reviews. Writing2404677 stays separate.
const reviewedAliases=[{
  alias:'David Jordan',
  professorId:'easy-a-jordan-david-k-6c0ae66fe9',
  expectedName:'Jordan, David K.',
  sourceProfessorId:'32591',
  subjectCode:'ANTH',
  catalogNumber:'87',
}];

const catalog=(value:string)=>value.trim().toUpperCase().replace(/^0+(?=\d)/,'');
const ownsProfile=(record:ProfessorRecord,id:string)=>
  (record.sourceProfessorId??record.rating?.sourceProfessorId)===id||
  !!record.rmpProfiles?.some(profile=>profile.sourceProfessorId===id);

/** Explicit reviewed course aliases only; course overlap does not infer an identity. */
export function lookupReviewedCourseAlias(
  dataset:LocalDataset,
  displayName:string,
  course:InstructorCourseKey|undefined,
  ordinary:ProfessorLookupResult,
):ProfessorLookupResult {
  if(!course)return ordinary;
  const rule=reviewedAliases.find(entry=>normalizeInstructorName(entry.alias)===normalizeInstructorName(displayName)&&entry.subjectCode===course.subjectCode.trim().toUpperCase()&&entry.catalogNumber===catalog(course.catalogNumber));
  if(!rule||ordinary.status==='ambiguous')return ordinary;
  const targets=dataset.professors.filter(record=>record.id===rule.professorId);
  if(ordinary.status==='found'&&ordinary.record.id!==rule.professorId)return {status:'ambiguous',candidates:[ordinary.record,...targets]};
  const target=targets[0];
  if(targets.length!==1||!target||normalizeInstructorName(target.displayName)!==normalizeInstructorName(rule.expectedName)||!ownsProfile(target,rule.sourceProfessorId))return {status:'not-found'};
  const owners=dataset.professors.filter(record=>ownsProfile(record,rule.sourceProfessorId));
  if(owners.length!==1)return {status:'ambiguous',candidates:owners};
  if(lookupHistoricalCourseGrades(dataset,target.id,course.subjectCode,course.catalogNumber).status!=='found')return {status:'not-found'};
  return ordinary.status==='found'?ordinary:{status:'found',matchMethod:'known-alias',record:target};
}
