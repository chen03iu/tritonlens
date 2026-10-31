import {it,expect} from 'vitest';
import {validateLocalDataset} from '../src/data/validation';
import {createLocalDatasetProviderSet} from '../src/data/providers/local-dataset-providers';
import {createInstructorDataService} from '../src/data/providers/instructor-data-service';
import {multipleProfileDataset,PRIMARY_PROFILE,ALTERNATE_PROFILE} from './fixtures/multiple-rmp-profiles';

it('delivers each reviewed profile with independent metrics and provenance',()=>{
 const dataset=multipleProfileDataset(),providers=createLocalDatasetProviderSet(dataset);
 expect(validateLocalDataset(dataset).valid).toBe(true);
 const identity={id:dataset.professors[0].id,displayName:'Libby Butler',matchMethod:'exact' as const};
 const result=providers.ratingProvider.lookup(identity);
 expect(result.profiles?.map(p=>({id:p.profile.sourceProfessorId,count:p.profile.rating?.ratingCount,source:p.source.id,primary:p.isPrimary}))).toEqual([{id:'101',count:58,source:'rmp-main',primary:true},{id:'202',count:3,source:'rmp-older',primary:false}]);
 expect(result.status==='found'&&result.data.rating.ratingCount).toBe(58);
});

it('validates alternate metrics, IDs, dates, sources, and primary consistency',()=>{
 const dataset=multipleProfileDataset(),teacher=dataset.professors[0];
 const invalid=[
  [PRIMARY_PROFILE,{...ALTERNATE_PROFILE,rating:{...ALTERNATE_PROFILE.rating,overallRating:99}}],
  [PRIMARY_PROFILE,{...ALTERNATE_PROFILE,sourceProfessorId:'javascript:alert(1)'}],
  [PRIMARY_PROFILE,{...ALTERNATE_PROFILE,updatedAt:'2026-02-30'}],
  [PRIMARY_PROFILE,{...ALTERNATE_PROFILE,sourceId:'missing'}],
  [PRIMARY_PROFILE,{...ALTERNATE_PROFILE,rating:{...ALTERNATE_PROFILE.rating,sourceProfessorId:'999'}}],
  [PRIMARY_PROFILE,PRIMARY_PROFILE],
  [ALTERNATE_PROFILE],
  [{...PRIMARY_PROFILE,rating:{...PRIMARY_PROFILE.rating,ratingCount:99}},ALTERNATE_PROFILE],
 ];
 for(const rmpProfiles of invalid){const candidate={...dataset,professors:[{...teacher,rmpProfiles}]};expect(validateLocalDataset(candidate).valid).toBe(false);}
 const duplicateOwner={...dataset,professors:[teacher,{...dataset.professors[1],sourceProfessorId:'202',rating:null}]};
 expect(validateLocalDataset(duplicateOwner).valid).toBe(false);
});

it('applies production source approval to alternate observations too',()=>{
 const dataset=multipleProfileDataset(),production={...dataset,kind:'production' as const,professors:[dataset.professors[0]],historicalCourseGrades:[]};
 expect(validateLocalDataset(production).issues).toContainEqual(expect.objectContaining({code:'source-not-approved',path:'professors[0].rmpProfiles[1].sourceId'}));
 const providers=createLocalDatasetProviderSet(dataset),identity=providers.identityProvider.lookup('Libby Butler');
 const service=createInstructorDataService({...providers,mode:'production-snapshot',modeLabel:'Snapshot'});
 const context={instructor:{displayName:'Libby Butler'},course:{subjectCode:'AAS',catalogNumber:'010R'}} as Parameters<typeof service.getInsight>[0];
 const result=service.getInsight(context).professorRating;
 expect(identity.status).toBe('found');expect(result.profiles?.map(p=>p.source.id)).toEqual(['rmp-main']);
});

it('preserves known unrated profiles but exposes no profile metrics for ambiguous identities',()=>{
 const dataset=multipleProfileDataset(),first=dataset.professors[0];
 const unrated={...dataset,professors:[{...first,rating:null,rmpProfiles:first.rmpProfiles!.map((p,i)=>i===0?{...p,rating:null}:p)}]};
 const provider=createLocalDatasetProviderSet(unrated).ratingProvider;
 const result=provider.lookup({id:first.id,displayName:first.displayName,matchMethod:'exact'});
 expect(result.status).toBe('not-found');expect(result.profiles).toHaveLength(2);expect(result.profiles?.[0].profile.rating).toBeNull();
 const ambiguous={...dataset,professors:[...dataset.professors,{id:'unrelated',displayName:'Libby Butler',aliases:[],rating:null}]};
 const service=createInstructorDataService({...createLocalDatasetProviderSet(ambiguous),mode:'development-snapshot',modeLabel:'Snapshot'});
 const context={instructor:{displayName:'Libby Butler'},course:{subjectCode:'AAS',catalogNumber:'010R'}} as Parameters<typeof service.getInsight>[0];
 expect(service.getInsight(context).professorRating).toEqual({status:'not-found'});
});
