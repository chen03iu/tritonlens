import type { DataSourceReference, LocalDataset, ProfessorRating, ProfessorRecord } from './types';
import { applyReviewedShortNames } from './reviewed-short-names';

interface ReviewedProfileMember {
  readonly id: string;
  readonly displayName: string;
  readonly sourceProfessorId: string | null;
  readonly courses: readonly string[];
}

interface ReviewedProfileCorrection {
  readonly keeperId: string;
  readonly selectedRatingId: string;
  readonly members: readonly ReviewedProfileMember[];
}

// Compact fingerprints pin every reviewed member to the exact source snapshot that
// was manually verified. If Easy-A Radar changes an alias, metric, or provenance,
// the correction fails closed and returns to the audit queue instead of guessing.
const reviewedMemberFingerprints: Readonly<Record<string, string>> = {
  'easy-a-zhang-danna-14fad79d5b': '["Danna Zhang"]|4.3|3.1|29|82|easy-a-radar-rmp|2026-07-23|2276558',
  'easy-a-danna-zhang-f1da2036bb': '[]|3.7|2.9|11|0|easy-a-radar-rmp|2026-07-23|1294356',
  'easy-a-meyer-florian-745c97d7a2': '["Florian Meyer"]|4|3.8|4|75|easy-a-radar-rmp|2026-07-23|3051803',
  'easy-a-florian-meyer-81e9f22ef5': '[]|2.5|3|1|null|easy-a-radar-rmp|2026-07-23|1005716',
  'easy-a-cohen-jonathan-david-06d2fbeb38': '["Jonathan David Cohen"]|3.1|3.3|39|44|easy-a-radar-rmp|2026-07-23|362637',
  'easy-a-jonathan-cohen-011aa750fe': '[]|3.1|3.3|39|44|easy-a-radar-rmp|2026-07-23|362637',
  'easy-a-jonathan-cohen-13dbad143a': '[]|3.4|2.5|34|60|easy-a-radar-rmp|2026-07-23|99372',
  'easy-a-del-alamo-juan-carlos-f64ff74b00': '["Juan Carlos Del Alamo"]|5|3.5|2|100|easy-a-radar-rmp|2026-07-23|1512231',
  'easy-a-juan-carlos-del-alamo-a29365a4c0': '[]|3|3|1|100|easy-a-radar-rmp|2026-07-23|2268445',
  'easy-a-yang-k-wayne-6f149bfdd6': '["K. Wayne Yang"]|4.7|2.6|41|100|easy-a-radar-rmp|2026-07-23|1121831',
  'easy-a-k-wayne-yang-2cfeb78294': '[]|4.7|2.6|41|100|easy-a-radar-rmp|2026-07-23|1121831',
  'easy-a-k-wayne-yang-e24b945349': '[]|2.9|1.6|7|43|easy-a-radar-rmp|2026-07-23|2232051',
  'easy-a-kovaka-karen-0332221e19': '["Karen Kovaka"]|3.5|3.5|14|53|easy-a-radar-rmp|2026-07-23|2855730',
  'easy-a-karen-kovaka-b6a17e462f': '[]|3.5|3.5|14|53|easy-a-radar-rmp|2026-07-23|2855730',
  'easy-a-karen-kovaka-cad88a5ca5': '[]|3|3|3|33|easy-a-radar-rmp|2026-07-23|2915175',
  'easy-a-kovaka-karenc-dd8662128c': '["Karen Kovaka","Karenc Kovaka"]|3|3|3|33|easy-a-radar-rmp|2026-07-23|2915175',
  'easy-a-nomura-kenji-e632677927': '["Kenji Nomura"]|3|2.8|4|50|easy-a-radar-rmp|2026-07-23|2449656',
  'easy-a-kenji-nomura-e2e496ee72': '[]|3|2.8|4|50|easy-a-radar-rmp|2026-07-23|2449656',
  'easy-a-kenji-nomura-478bd51b6a': '[]|4|3.5|57|52|easy-a-radar-rmp|2026-07-23|377111',
  'easy-a-fox-patrick-keolu-ozer-408907bc92': '["Patrick Keolu Ozer Fox"]|4.5|4|1|null|easy-a-radar-rmp|2026-07-23|1695836',
  'easy-a-keolu-fox-abf434d80c': '[]|3.4|2.5|14|53|easy-a-radar-rmp|2026-07-23|2778643',
  'easy-a-keolu-fox-65dc458d41': '[]|4.5|4|1|null|easy-a-radar-rmp|2026-07-23|1695836',
  'easy-a-lu-li-fan-0d3391c9af': '["Li-Fan Lu"]|2.9|4.6|11|40|easy-a-radar-rmp|2026-07-23|1965433',
  'easy-a-li-fan-lu-621ef83f11': '[]|2.9|4.3|17|42|easy-a-radar-rmp|2026-07-23|1824878',
  'easy-a-li-fan-lu-6354e3021e': '[]|2.9|4.6|11|40|easy-a-radar-rmp|2026-07-23|1965433',
  'easy-a-johnson-monte-d06a7fc664': '["Monte Johnson"]|4.3|3.3|39|82|easy-a-radar-rmp|2026-07-23|999601',
  'easy-a-monte-johnson-dfbe55d3ec': '[]|4.3|3.3|39|82|easy-a-radar-rmp|2026-07-23|999601',
  'easy-a-monte-johnson-c749b7fcaa': '[]|4.2|3.1|138|82|easy-a-radar-rmp|2026-07-23|128225',
  'easy-a-johnson-erik-barry-519ec984ef': '["Erik Barry Johnson"]|4.4|2.2|5|80|easy-a-radar-rmp|2026-07-23|3033351',
  'easy-a-erik-johnson-97105d8be8': '[]|4.8|1.5|4|100|easy-a-radar-rmp|2026-07-23|2881727',
  'easy-a-alyssa-taylor-87c4b18577': '[]|null|null|null|null|null|null|null',
  'easy-a-alyssa-taylor-d6c2383b42': '[]|4.5|2.5|2|100|easy-a-radar-rmp|2026-07-23|2972062',
  'easy-a-taylor-amos-alyssa-c-d5e1b0e4d0': '["Alyssa C Taylor Amos","Alyssa Taylor"]|4.5|2.5|2|100|easy-a-radar-rmp|2026-07-23|2972062',
  'easy-a-mir-arabbaygi-siavash-f11007ef65': '["Siavash Arabbaygi","Siavash Mir Arabbaygi","Siavash Mirarab"]|3.6|4.4|5|67|easy-a-radar-rmp|2026-07-23|2781321',
  'easy-a-siavash-mirarab-22774e6c50': '[]|null|null|null|null|null|null|null',
  'easy-a-erbe-tom-a55f2d573d': '["Thomas Erbe","Tom Erbe"]|4.8|2.6|11|0|easy-a-radar-rmp|2026-07-23|573969',
  'easy-a-thomas-erbe-062db8d3c6': '[]|null|null|null|null|null|null|null',
  'easy-a-gentner-tim-16a5b2f0e0': '["Tim Gentner","Timothy Gentner"]|3.6|3.2|41|75|easy-a-radar-rmp|2026-07-23|632694',
  'easy-a-timothy-gentner-edda21903c': '[]|null|null|null|null|null|null|null',
  'easy-a-anderson-cheryl-d74aff9ec5': '["Cheryl Anderson"]|4.1|3.3|15|78|easy-a-radar-rmp|2026-07-23|1882283',
  'easy-a-cheryl-anderson-fee998359a': '[]|4.1|3.3|15|78|easy-a-radar-rmp|2026-07-23|1882283',
  'easy-a-anderson-cheryl-ann-marie-c56c3564db': '["Cheryl Ann Marie Anderson"]|4.1|3.3|15|78|easy-a-radar-rmp|2026-07-23|1882283',
};

// Exact, evidence-backed corrections for conflicts in the 2026-07-23 source snapshot.
// Evidence and the selected-profile rationale are recorded in REVIEWED_IDENTITIES.md.
const profileCorrections: readonly ReviewedProfileCorrection[] = [
  {
    keeperId: 'easy-a-zhang-danna-14fad79d5b', selectedRatingId: 'easy-a-zhang-danna-14fad79d5b',
    members: [
      { id: 'easy-a-zhang-danna-14fad79d5b', displayName: 'Zhang, Danna', sourceProfessorId: '2276558', courses: ['MATH181A', 'MATH181B', 'MATH181E'] },
      { id: 'easy-a-danna-zhang-f1da2036bb', displayName: 'Danna Zhang', sourceProfessorId: '1294356', courses: [] },
    ],
  },
  {
    keeperId: 'easy-a-meyer-florian-745c97d7a2', selectedRatingId: 'easy-a-meyer-florian-745c97d7a2',
    members: [
      { id: 'easy-a-meyer-florian-745c97d7a2', displayName: 'Meyer, Florian', sourceProfessorId: '3051803', courses: ['ECE161A', 'ECE175B'] },
      { id: 'easy-a-florian-meyer-81e9f22ef5', displayName: 'Florian Meyer', sourceProfessorId: '1005716', courses: [] },
    ],
  },
  {
    keeperId: 'easy-a-cohen-jonathan-david-06d2fbeb38', selectedRatingId: 'easy-a-cohen-jonathan-david-06d2fbeb38',
    members: [
      { id: 'easy-a-cohen-jonathan-david-06d2fbeb38', displayName: 'Cohen, Jonathan David', sourceProfessorId: '362637', courses: ['PHIL14', 'PHIL134', 'PHIL136', 'PHIL143', 'PHIL150'] },
      { id: 'easy-a-jonathan-cohen-011aa750fe', displayName: 'Jonathan Cohen', sourceProfessorId: '362637', courses: [] },
      { id: 'easy-a-jonathan-cohen-13dbad143a', displayName: 'Jonathan Cohen', sourceProfessorId: '99372', courses: [] },
    ],
  },
  {
    keeperId: 'easy-a-del-alamo-juan-carlos-f64ff74b00', selectedRatingId: 'easy-a-del-alamo-juan-carlos-f64ff74b00',
    members: [
      { id: 'easy-a-del-alamo-juan-carlos-f64ff74b00', displayName: 'Del Alamo, Juan Carlos', sourceProfessorId: '1512231', courses: ['MAE104'] },
      { id: 'easy-a-juan-carlos-del-alamo-a29365a4c0', displayName: 'Juan Carlos Del Alamo', sourceProfessorId: '2268445', courses: [] },
    ],
  },
  {
    keeperId: 'easy-a-yang-k-wayne-6f149bfdd6', selectedRatingId: 'easy-a-yang-k-wayne-6f149bfdd6',
    members: [
      { id: 'easy-a-yang-k-wayne-6f149bfdd6', displayName: 'Yang, K. Wayne', sourceProfessorId: '1121831', courses: ['CAT3', 'ETHN2', 'ETHN100C', 'ETHN115', 'MUIR90H'] },
      { id: 'easy-a-k-wayne-yang-2cfeb78294', displayName: 'K Wayne Yang', sourceProfessorId: '1121831', courses: [] },
      { id: 'easy-a-k-wayne-yang-e24b945349', displayName: 'K Wayne Yang', sourceProfessorId: '2232051', courses: [] },
    ],
  },
  {
    keeperId: 'easy-a-kovaka-karen-0332221e19', selectedRatingId: 'easy-a-kovaka-karen-0332221e19',
    members: [
      { id: 'easy-a-kovaka-karen-0332221e19', displayName: 'Kovaka, Karen', sourceProfessorId: '2855730', courses: ['PHIL12'] },
      { id: 'easy-a-karen-kovaka-b6a17e462f', displayName: 'Karen Kovaka', sourceProfessorId: '2855730', courses: [] },
      { id: 'easy-a-karen-kovaka-cad88a5ca5', displayName: 'Karen Kovaka', sourceProfessorId: '2915175', courses: [] },
      { id: 'easy-a-kovaka-karenc-dd8662128c', displayName: 'Kovaka, Karenc', sourceProfessorId: '2915175', courses: ['PHIL12', 'PHIL51', 'PHIL145', 'PHIL147', 'PHIL148'] },
    ],
  },
  {
    keeperId: 'easy-a-nomura-kenji-e632677927', selectedRatingId: 'easy-a-nomura-kenji-e632677927',
    members: [
      { id: 'easy-a-nomura-kenji-e632677927', displayName: 'Nomura, Kenji', sourceProfessorId: '2449656', courses: ['ECE103', 'ECE139'] },
      { id: 'easy-a-kenji-nomura-e2e496ee72', displayName: 'Kenji Nomura', sourceProfessorId: '2449656', courses: [] },
      { id: 'easy-a-kenji-nomura-478bd51b6a', displayName: 'Kenji Nomura', sourceProfessorId: '377111', courses: [] },
    ],
  },
  {
    keeperId: 'easy-a-fox-patrick-keolu-ozer-408907bc92', selectedRatingId: 'easy-a-keolu-fox-abf434d80c',
    members: [
      { id: 'easy-a-fox-patrick-keolu-ozer-408907bc92', displayName: 'Fox, Patrick Keolu Ozer', sourceProfessorId: '1695836', courses: ['ANBI100', 'ANBI117', 'ANBI118', 'ANBI121', 'ANTH102', 'DSGN119'] },
      { id: 'easy-a-keolu-fox-abf434d80c', displayName: 'Keolu Fox', sourceProfessorId: '2778643', courses: [] },
      { id: 'easy-a-keolu-fox-65dc458d41', displayName: 'Keolu Fox', sourceProfessorId: '1695836', courses: [] },
    ],
  },
  {
    keeperId: 'easy-a-lu-li-fan-0d3391c9af', selectedRatingId: 'easy-a-li-fan-lu-621ef83f11',
    members: [
      { id: 'easy-a-lu-li-fan-0d3391c9af', displayName: 'Lu, Li-Fan', sourceProfessorId: '1965433', courses: ['BICD140', 'BIMM194'] },
      { id: 'easy-a-li-fan-lu-621ef83f11', displayName: 'Li-Fan Lu', sourceProfessorId: '1824878', courses: [] },
      { id: 'easy-a-li-fan-lu-6354e3021e', displayName: 'Li-Fan Lu', sourceProfessorId: '1965433', courses: [] },
    ],
  },
  {
    keeperId: 'easy-a-johnson-monte-d06a7fc664', selectedRatingId: 'easy-a-johnson-monte-d06a7fc664',
    members: [
      { id: 'easy-a-johnson-monte-d06a7fc664', displayName: 'Johnson, Monte', sourceProfessorId: '999601', courses: ['PHIL1', 'PHIL31', 'PHIL32', 'PHIL101', 'PHIL102', 'PHIL105', 'PHIL110'] },
      { id: 'easy-a-monte-johnson-dfbe55d3ec', displayName: 'Monte Johnson', sourceProfessorId: '999601', courses: [] },
      { id: 'easy-a-monte-johnson-c749b7fcaa', displayName: 'Monte Johnson', sourceProfessorId: '128225', courses: [] },
    ],
  },
  {
    keeperId: 'easy-a-johnson-erik-barry-519ec984ef', selectedRatingId: 'easy-a-johnson-erik-barry-519ec984ef',
    members: [
      { id: 'easy-a-johnson-erik-barry-519ec984ef', displayName: 'Johnson, Erik Barry', sourceProfessorId: '3033351', courses: ['MGT160'] },
      { id: 'easy-a-erik-johnson-97105d8be8', displayName: 'Erik Johnson', sourceProfessorId: '2881727', courses: [] },
    ],
  },
  {
    keeperId: 'easy-a-taylor-amos-alyssa-c-d5e1b0e4d0', selectedRatingId: 'easy-a-taylor-amos-alyssa-c-d5e1b0e4d0',
    members: [
      { id: 'easy-a-alyssa-taylor-87c4b18577', displayName: 'Alyssa Taylor', sourceProfessorId: null, courses: [] },
      { id: 'easy-a-alyssa-taylor-d6c2383b42', displayName: 'Alyssa Taylor', sourceProfessorId: '2972062', courses: [] },
      { id: 'easy-a-taylor-amos-alyssa-c-d5e1b0e4d0', displayName: 'Taylor Amos, Alyssa C', sourceProfessorId: '2972062', courses: ['BENG100', 'BENG119A', 'BENG119B', 'BENG126A', 'BENG126B', 'BENG129A', 'BENG129B', 'BENG148A', 'BENG148B', 'BENG152', 'BENG169A', 'BENG169B', 'BENG179A', 'BENG179B', 'BENG187A', 'BENG187D', 'BENG188B'] },
    ],
  },
  {
    keeperId: 'easy-a-mir-arabbaygi-siavash-f11007ef65', selectedRatingId: 'easy-a-mir-arabbaygi-siavash-f11007ef65',
    members: [
      { id: 'easy-a-mir-arabbaygi-siavash-f11007ef65', displayName: 'Mir Arabbaygi, Siavash', sourceProfessorId: '2781321', courses: ['ECE30'] },
      { id: 'easy-a-siavash-mirarab-22774e6c50', displayName: 'Siavash Mirarab', sourceProfessorId: null, courses: [] },
    ],
  },
  {
    keeperId: 'easy-a-erbe-tom-a55f2d573d', selectedRatingId: 'easy-a-erbe-tom-a55f2d573d',
    members: [
      { id: 'easy-a-erbe-tom-a55f2d573d', displayName: 'Erbe, Tom', sourceProfessorId: '573969', courses: ['MUS43', 'MUS95D', 'MUS143', 'MUS160A', 'MUS160B', 'MUS170', 'MUS172', 'MUS174A', 'MUS174B', 'MUS174C', 'MUS176', 'MUS177'] },
      { id: 'easy-a-thomas-erbe-062db8d3c6', displayName: 'Thomas Erbe', sourceProfessorId: null, courses: [] },
    ],
  },
  {
    keeperId: 'easy-a-gentner-tim-16a5b2f0e0', selectedRatingId: 'easy-a-gentner-tim-16a5b2f0e0',
    members: [
      { id: 'easy-a-gentner-tim-16a5b2f0e0', displayName: 'Gentner, Tim', sourceProfessorId: '632694', courses: ['BIPN189', 'PSYC102', 'PSYC189'] },
      { id: 'easy-a-timothy-gentner-edda21903c', displayName: 'Timothy Gentner', sourceProfessorId: null, courses: [] },
    ],
  },
  {
    keeperId: 'easy-a-anderson-cheryl-d74aff9ec5', selectedRatingId: 'easy-a-anderson-cheryl-d74aff9ec5',
    members: [
      { id: 'easy-a-anderson-cheryl-d74aff9ec5', displayName: 'Anderson, Cheryl', sourceProfessorId: '1882283', courses: ['FMPH40'] },
      { id: 'easy-a-cheryl-anderson-fee998359a', displayName: 'Cheryl Anderson', sourceProfessorId: '1882283', courses: [] },
      { id: 'easy-a-anderson-cheryl-ann-marie-c56c3564db', displayName: 'Anderson, Cheryl Ann Marie', sourceProfessorId: '1882283', courses: ['FPMU40'] },
    ],
  },
];

function courseKey(subjectCode: string, catalogNumber: string): string {
  return `${subjectCode.trim().toUpperCase()}${catalogNumber.trim().toUpperCase()}`;
}

function reviewedMemberFingerprint(record: ProfessorRecord): string {
  const rating = record.rating;
  return [
    JSON.stringify(record.aliases),
    rating?.overallRating ?? 'null',
    rating?.difficulty ?? 'null',
    rating?.ratingCount ?? 'null',
    rating?.wouldTakeAgainPercent ?? 'null',
    rating?.sourceId ?? 'null',
    rating?.updatedAt ?? 'null',
    rating?.sourceProfessorId ?? 'null',
  ].join('|');
}

function applyReviewedProfileCorrections(dataset: LocalDataset): LocalDataset {
  let professors = dataset.professors;
  let historicalCourseGrades = dataset.historicalCourseGrades;

  for (const correction of profileCorrections) {
    const records = correction.members.map(member => professors.filter(record => record.id === member.id));
    // A partial or changed upstream group needs a fresh review; never guess around it.
    if (records.some(matches => matches.length !== 1)) continue;
    const group = records.map(matches => matches[0]);
    const shapeMatches = correction.members.every((member, index) => {
      const record = group[index];
      const courses = historicalCourseGrades
        .filter(grade => grade.professorId === member.id)
        .map(grade => courseKey(grade.subjectCode, grade.catalogNumber))
        .sort();
      return record.displayName === member.displayName &&
        (record.rating?.sourceProfessorId ?? null) === member.sourceProfessorId &&
        reviewedMemberFingerprint(record) === reviewedMemberFingerprints[member.id] &&
        JSON.stringify(courses) === JSON.stringify([...member.courses].sort());
    });
    if (!shapeMatches) continue;

    const keeper = group.find(record => record.id === correction.keeperId);
    const ratingDonor = group.find(record => record.id === correction.selectedRatingId);
    if (!keeper || !ratingDonor?.rating) continue;
    const memberIds = new Set(correction.members.map(member => member.id));
    const aliases = [...new Set(group.flatMap(record => [record.displayName, ...record.aliases]))]
      .filter(name => name !== keeper.displayName);
    const replacement: ProfessorRecord = { ...keeper, aliases, rating: ratingDonor.rating };

    professors = professors
      .filter(record => !memberIds.has(record.id) || record.id === keeper.id)
      .map(record => record.id === keeper.id ? replacement : record);
    historicalCourseGrades = historicalCourseGrades.map(grade =>
      memberIds.has(grade.professorId) && grade.professorId !== keeper.id
        ? { ...grade, professorId: keeper.id }
        : grade,
    );
  }

  return professors === dataset.professors && historicalCourseGrades === dataset.historicalCourseGrades
    ? dataset
    : { ...dataset, professors, historicalCourseGrades };
}

// Explicit identities only. Evidence is recorded in REVIEWED_IDENTITIES.md.
const identities = [
  {
    id: 'easy-a-opatkiewicz-justin-paul-823ddc3a91',
    displayName: 'Opatkiewicz, Justin Paul',
    aliases: ['Justin Opatkiewicz', 'Justin P. Opatkiewicz'],
  },
  {
    id: 'easy-a-nomura-keiko-k-719c7f4b1c',
    displayName: 'Nomura, Keiko K.',
    aliases: ['Keiko Nomura'],
  },
  {
    id: 'easy-a-jones-miles-e-f6900194f3',
    displayName: 'Jones, Miles E',
    aliases: ['Miles Jones', 'Miles Eli Jones'],
  },
  {
    id: 'easy-a-shalev-aaron-d-1ef0bedf0d',
    displayName: 'Shalev, Aaron D',
    aliases: ['Aaron Shalev', 'Aaron Schulman', 'Aron Shalev', 'Aaron Shaleve'],
  },
  {
    id: 'easy-a-wilder-linnea-lorene-d9d040d7f2',
    displayName: 'Wilder, Linnea Lorene',
    aliases: ['Linnea Wilder', 'Linnea L. Wilder'],
  },
  {
    id: 'easy-a-taylor-garcia-daphne-33ba9d49d2',
    displayName: 'Taylor-Garcia, Daphne',
    aliases: ['Daphne Taylor García', 'Daphne Taylor Garcia', 'Daphne Taylor-García'],
  },
  {
    id: 'easy-a-delson-nathan-joseph-e5b4df8331',
    displayName: 'Delson, Nathan Joseph',
    aliases: ['Nathan Delson', 'Nathan J. Delson'],
  },
] as const;

const aaronSource: DataSourceReference = {
  id: 'reviewed-aaron-rmp',
  label: 'RMP reported totals (UC San Diego Extended Studies; inconsistent review count)',
  category: 'professor-ratings',
  homepageUrl: 'https://www.ratemyprofessors.com/professor/3050657',
  termsUrl: 'https://www.ratemyprofessors.com/terms-of-use',
  retrievedAt: '2026-09-15',
  permissionStatus: 'pending',
  attribution: 'RateMyProfessors, Aaron Schulman profile 3050657; reported aggregate totals, not recomputed from reviews.',
};

const aaronRating: ProfessorRating = {
  overallRating: 5,
  difficulty: 3,
  ratingCount: 3,
  wouldTakeAgainPercent: 100,
  sourceId: aaronSource.id,
  updatedAt: '2026-09-15',
  sourceProfessorId: '3050657',
};

function consolidateIsabella(
  dataset: LocalDataset,
  professors: readonly ProfessorRecord[],
): readonly ProfessorRecord[] {
  const fullId = 'easy-a-maita-isabella-vincenza-4852998842';
  const shortId = 'easy-a-isabella-maita-1cf20dd783';
  const full = professors.filter(professor => professor.displayName === 'Maita, Isabella Vincenza');
  const short = professors.filter(professor => professor.displayName === 'Isabella Maita');
  if (full.length !== 1 || full[0].id !== fullId ||
      professors.filter(professor => professor.id === fullId).length !== 1 ||
      professors.filter(professor => professor.id === shortId).length > 1 ||
      (full[0].rating !== null && full[0].rating.sourceProfessorId !== '2987635')) {
    return professors;
  }

  // Only consolidate the reviewed empty stub. Preserve future substantive data.
  if (short.length > 1 || (short.length === 1 &&
      (short[0].id !== shortId || short[0].rating !== null || short[0].aliases.length !== 0 ||
       dataset.historicalCourseGrades.some(record => record.professorId === shortId)))) {
    return professors;
  }
  // A renamed record under the old ID needs a fresh review, not deletion.
  if (short.length === 0 && professors.some(professor => professor.id === shortId)) return professors;

  return professors
    .filter(professor => professor.id !== shortId)
    .map(professor => professor.id === fullId ? {
      ...professor,
      aliases: [...new Set([...professor.aliases, 'Isabella Maita'])],
    } : professor);
}

export function applyReviewedCorrections(dataset: LocalDataset): LocalDataset {
  // A development observation must never be promoted by changing dataset kind.
  if (dataset.kind !== 'development') return dataset;

  const profileCorrectedDataset = applyReviewedShortNames(applyReviewedProfileCorrections(dataset));
  let addedRating = false;
  const professors = profileCorrectedDataset.professors.map(professor => {
    const identity = identities.find(entry => entry.id === professor.id && entry.displayName === professor.displayName);
    if (!identity || profileCorrectedDataset.professors.filter(entry => entry.displayName === identity.displayName).length !== 1) {
      return professor;
    }

    const canAddRating = identity.id === 'easy-a-shalev-aaron-d-1ef0bedf0d' && professor.rating === null &&
      !profileCorrectedDataset.sources.some(source => source.id === aaronSource.id) &&
      !profileCorrectedDataset.professors.some(entry => entry.rating?.sourceProfessorId === aaronRating.sourceProfessorId);
    if (canAddRating) addedRating = true;
    return {
      ...professor,
      aliases: [...new Set([...professor.aliases, ...identity.aliases])],
      rating: canAddRating ? aaronRating : professor.rating,
    };
  });

  return {
    ...profileCorrectedDataset,
    professors: consolidateIsabella(profileCorrectedDataset, professors),
    sources: addedRating ? [...profileCorrectedDataset.sources, aaronSource] : profileCorrectedDataset.sources,
  };
}
