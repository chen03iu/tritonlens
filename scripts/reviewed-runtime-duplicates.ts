import type {ReviewedSourceNameGroup} from './reviewed-source-name-groups';

// Existing declared aliases corroborated against UCSD/RMP on 2026-10-31.
// Only these exact history-free records may be retired; grade ownership stays put.
// These are cleanup rules, not additional multi-profile selection groups.
export const REVIEWED_RUNTIME_DUPLICATES:readonly ReviewedSourceNameGroup[]=[
 {
  name:'Elgamal, Ahmed',ownerId:'easy-a-elgamal-ahmed-91acae5cb9',course:'SE/180',members:[],
  stubs:[{id:'easy-a-ahmed-waeil-elgamal-d76d2936bc',name:'Ahmed-Waeil Elgamal'}],
  evidence:['https://jacobsschool.ucsd.edu/faculty/profile?id=3'],
 },
 {
  name:'Mukku, Dhananjaya',ownerId:'easy-a-mukku-dhananjaya-b6b1b85f8c',course:'PSYC/171',
  members:[{id:'2739870',name:'Dhananjaya Mukku',department:'Psychology'}],
  stubs:[{id:'easy-a-dhananjay-bambah-mukku-ac86b94076',name:'Dhananjay Bambah-Mukku'}],
  evidence:['https://roosevelt.ucsd.edu/about/faculty.html','https://psychology.ucsd.edu/people/faculty.html','https://www.ratemyprofessors.com/professor/2739870'],
 },
 {
  name:'Porter, Leonard Emerson',ownerId:'easy-a-porter-leonard-emerson-513019c4be',expectedOwnerProfileId:null,course:'CSE/8A',
  members:[{id:'1992362',name:'Leo Porter',department:'Computer Science'}],
  stubs:[
   {id:'easy-a-leo-porter-c60262726f',name:'Leo Porter'},
   {id:'easy-a-leo-porter-fa90a62a23',name:'Leo Porter',sourceProfessorId:'1992362'},
  ],
  evidence:['https://profiles.ucsd.edu/leonard.porter','https://www.ratemyprofessors.com/professor/1992362'],
 },
];
