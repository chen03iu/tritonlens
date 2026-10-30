// @vitest-environment jsdom
import {afterEach,it,expect} from 'vitest';
import {MOCK_DATASET} from '../src/data/mock-dataset';
import {createLocalDatasetProviderSet} from '../src/data/providers/local-dataset-providers';
import {createInstructorDataService} from '../src/data/providers/instructor-data-service';
import {enhanceVisibleInstructorLinks} from '../src/instructor-badges';
import {closeProfessorDetailCard} from '../src/professor-detail-card';
import type {HistoricalGradeTerm,LocalDataset} from '../src/data/types';
import type {RenderedInstructorContext} from '../src/tss/instructor-context';

const original=MOCK_DATASET.historicalCourseGrades[0];
function mount(terms:HistoricalGradeTerm[],withoutRating=false){
 document.body.innerHTML='<table><tbody><tr><td data-sap-ui-column="socColInstructor"><a id="socEventInstructorLink">Libby Butler</a></td></tr></tbody></table>';
 const link=document.querySelector<HTMLAnchorElement>('a')!;
 const context:RenderedInstructorContext={link,instructor:{displayName:'Libby Butler'},course:{subjectCode:'AAS',catalogNumber:'010R',title:'Example'},term:null,packageCode:'P-001-001',section:{sectionCode:'001-000',eventId:null,teachingMethod:'Lecture',scheduleText:'',locationText:'',deliveryMode:'unknown',instructors:[{displayName:'Libby Butler'}]}};
 const dataset:LocalDataset={...MOCK_DATASET,professors:withoutRating?MOCK_DATASET.professors.map(p=>({...p,rating:null})):MOCK_DATASET.professors,historicalCourseGrades:[{...original,sampleSize:null,averageGpa:terms[0].averageGpa,gradeDistribution:terms[0].gradeDistribution,offeringCount:terms.length,terms}]};
 const service=createInstructorDataService({mode:'pending-permission-snapshot',modeLabel:'Data snapshot',...createLocalDatasetProviderSet(dataset)});
 enhanceVisibleInstructorLinks(document,[context],service);const button=document.querySelector<HTMLButtonElement>('.tritonlens-rating-badge')!;button.click();return {button,card:document.querySelector<HTMLElement>('.tritonlens-detail-card')!};
}
afterEach(()=>{closeProfessorDetailCard();document.body.replaceChildren();});
it('shows latest term by default and switches to exact older-term GPA and percentages',()=>{
 const {card}=mount([{year:2026,quarter:'SP',averageGpa:3.6,gradeDistribution:{...original.gradeDistribution,aPercent:61.23}},{year:2025,quarter:'FA',averageGpa:2.1,gradeDistribution:{...original.gradeDistribution,aPercent:20}}]);
 expect(card.textContent).toContain('Term GPA');expect(card.textContent).toContain('3.60');
 const select=card.querySelector<HTMLSelectElement>('select[aria-label="Historical term"]')!;
 expect(select.options[0].textContent).toBe('Spring 2026');expect(select.options[1].textContent).toBe('Fall 2025');
 expect(card.querySelector('[data-tritonlens-grade="A"]')?.getAttribute('aria-label')).toBe('A: 61.23%');
 select.value='1';select.dispatchEvent(new Event('change',{bubbles:true}));
 expect(card.textContent).toContain('2.10');expect(card.textContent).not.toContain('3.60');
 expect(card.querySelector('[data-tritonlens-grade="A"]')?.getAttribute('aria-label')).toBe('A: 20%');
 document.body.click();expect(document.querySelector('.tritonlens-detail-card')).toBeNull();
});
it('shows unavailable GPA and no chart for a zero-information term without crashing badge creation',()=>{
 const empty=Object.fromEntries(Object.keys(original.gradeDistribution).map(k=>[k,null])) as unknown as typeof original.gradeDistribution;
 const {button,card}=mount([{year:2026,quarter:'SP',averageGpa:null,gradeDistribution:empty}]);
 expect(button.dataset.tritonlensAverageGpa).toBeUndefined();expect(card.textContent).toContain('Unavailable');
 expect(card.textContent).toContain('No grade percentages were reported for this term.');
 expect(card.querySelector('.tritonlens-grade-distribution')).toBeNull();expect(card.textContent).not.toContain('0.00');
});
it('reports short totals without filling the remainder or rescaling chart bars',()=>{
 const dist={aPercent:50,bPercent:30,cPercent:0,dPercent:0,fPercent:0,wPercent:0,pPercent:0,npPercent:0};
 const {card}=mount([{year:2026,quarter:'SP',averageGpa:3.6,gradeDistribution:dist}]);
 expect(card.textContent).toContain('Reported percentages total 80%');
 expect(card.textContent).toContain('The archive does not identify the remaining share.');
 expect(card.querySelector('[data-tritonlens-grade="A"]')?.getAttribute('aria-label')).toBe('A: 50%');
});
it('does not advertise available grades when every stored term has no usable metrics',()=>{
 const empty=Object.fromEntries(Object.keys(original.gradeDistribution).map(k=>[k,null])) as unknown as typeof original.gradeDistribution;
 const {button}=mount([{year:2026,quarter:'SP',averageGpa:null,gradeDistribution:empty}],true);
 expect(button.textContent).toBe('Rating unavailable');
});
