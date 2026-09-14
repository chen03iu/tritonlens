export type DatasetKind = 'mock' | 'development' | 'production';

export type DataPermissionStatus =
  | 'approved'
  | 'pending'
  | 'prohibited';

export type DataSourceCategory =
  | 'mock'
  | 'professor-ratings'
  | 'historical-grades';

export interface DataSourceReference {
  readonly id: string;
  readonly label: string;
  readonly category: DataSourceCategory;
  readonly homepageUrl: string | null;
  readonly termsUrl: string | null;
  readonly retrievedAt: string | null;
  readonly permissionStatus: DataPermissionStatus;
  readonly attribution: string | null;
}

/** Professor-level data. It must not be presented as course-specific data. */
export interface ProfessorRating {
  readonly overallRating: number;
  readonly difficulty: number | null;
  readonly ratingCount: number;
  readonly wouldTakeAgainPercent: number | null;
  readonly sourceId: string;
  readonly updatedAt: string;
  readonly sourceProfessorId: string | null;
}

export interface ProfessorRecord {
  readonly id: string;
  readonly displayName: string;
  readonly aliases: readonly string[];
  readonly rating: ProfessorRating | null;
}

export interface HistoricalGradeDistribution {
  readonly aPercent: number | null;
  readonly bPercent: number | null;
  readonly cPercent: number | null;
  readonly dPercent: number | null;
  readonly fPercent: number | null;
  readonly wPercent: number | null;
  readonly pPercent: number | null;
  readonly npPercent: number | null;
}

/** Historical course × professor data, not a prediction of future grades. */
export interface HistoricalCourseGradeRecord {
  readonly professorId: string;
  readonly subjectCode: string;
  readonly catalogNumber: string;
  readonly averageGpa: number;
  readonly sampleSize: number | null;
  readonly offeringCount: number;
  readonly gradeDistribution: HistoricalGradeDistribution;
  readonly sourceId: string;
  readonly updatedAt: string;
}

export interface LocalDataset {
  readonly schemaVersion: 1;
  readonly kind: DatasetKind;
  readonly sources: readonly DataSourceReference[];
  readonly professors: readonly ProfessorRecord[];
  readonly historicalCourseGrades:
    readonly HistoricalCourseGradeRecord[];
}
