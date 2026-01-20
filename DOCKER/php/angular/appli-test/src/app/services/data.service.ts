import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, forkJoin, of } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";

import { StudentService } from "./student.service";
import { StaffService } from "./staff.service";
import { CompanyService } from "./company.service";
import { AcademicYearService } from "./academic-year.service";
import { StudentTrainingYearAcademicYearService } from "./student-trainingYear-academicYear.service";
import { SalleService } from "./salle.service";
import { SoutenanceService } from "./soutenance.service";
import { PlanningService } from "./planning.service";
import { CompanyTutorService } from "./company-tutor.service";
import { StudentStaffAcademicYearService } from "./student-staff-academicYear.service";

import { Student } from "../models/student.model";
import { Staff } from "../models/staff.model";
import { Company } from "../models/company.model";
import { CompanyTutor } from "../models/company-tutor.model";
import { Soutenance } from "../models/soutenance.model";
import { Planning } from "../models/planning.model";
import { Salle } from "../models/salle.model";
import { Student_TrainingYear_AcademicYear } from "../models/student-trainingYear-academicYear.model";
import { AcademicYear } from "../models/academic-year.model";
import { Student_Staff_AcademicYear_String } from "../models/student-staff-academicYear-string.model";


export type AppDataKeys =
  | "students"
  | "staff"
  | "companies"
  | "tutors"
  | "soutenances"
  | "plannings"
  | "salles"
  | "trainingAcademicYears"
  | "referents"
  | "academicYears";

interface AppData {
  students: Student[];
  staff: Staff[];
  companies: Company[];
  tutors: CompanyTutor[];
  soutenances: Soutenance[];
  plannings: Planning[];
  salles: Salle[];
  trainingAcademicYears: Student_TrainingYear_AcademicYear[];
  referents: Student_Staff_AcademicYear_String[];
  academicYears: AcademicYear[];
  loaded: boolean;
  loading: boolean;
  error: any;
}

type AppDataMap = {
  students: Student[];
  staff: Staff[];
  companies: Company[];
  tutors: CompanyTutor[];
  soutenances: Soutenance[];
  plannings: Planning[];
  salles: Salle[];
  trainingAcademicYears: Student_TrainingYear_AcademicYear[];
  referents: Student_Staff_AcademicYear_String[];
  academicYears: AcademicYear[];
};

type FetchResult = Partial<Pick<AppData, AppDataKeys>>;


@Injectable({ providedIn: "root" })
export class DataStoreService {
  private dataSubject = new BehaviorSubject<AppData>({
    students: [],
    staff: [],
    companies: [],
    tutors: [],
    soutenances: [],
    plannings: [],
    salles: [],
    trainingAcademicYears: [],
    referents: [],
    academicYears: [],
    loaded: false,
    loading: false,
    error: null,
  });

  public data$ = this.dataSubject.asObservable();

  // Pour savoir ce qui a déjà été chargé
  private loadedKeys = new Set<AppDataKeys>();

  constructor(
    private studentService: StudentService,
    private staffService: StaffService,
    private soutenanceService: SoutenanceService,
    private companyService: CompanyService,
    private planningService: PlanningService,
    private salleService: SalleService,
    private tutorService: CompanyTutorService,
    private studentTrainingAcademicYearService: StudentTrainingYearAcademicYearService,
    private referentService: StudentStaffAcademicYearService,
    private academicYearService: AcademicYearService
  ) {}


  // Charge les données initiales si pas chargées (sauf si forceRefresh)
  initializeData(forceRefresh = false): void {
    const currentData = this.dataSubject.value;

    if (currentData.loaded && !forceRefresh) {
      return;
    }

    this.fetchData([], forceRefresh);
  }

  
  // S'assurer que toutes les données nécessaires sont chargées
  ensureDataLoaded(keys: AppDataKeys[], forceRefresh = false): void {
    const keysToLoad = forceRefresh 
      ? keys 
      : keys.filter(k => !this.loadedKeys.has(k));

    if (keysToLoad.length === 0) {
      return;
    }

    this.fetchData(keysToLoad, true);
  }


  //Recharge certaines data qui auraient changées
  refreshKeys(keys: AppDataKeys[]): void {
    this.fetchData(keys, true);
  }


  //Recharge tout
  refreshAll(): void {
    this.fetchData([], true);
  }


  private fetchData(keys: AppDataKeys[] = [], forceRefresh = false): void {
    const currentData = this.dataSubject.value;

    // Si aucune clé spécifiée on charge tout
    const keysToFetch: AppDataKeys[] = keys.length === 0 
      ? [
          "students", "staff", "companies", "tutors", 
          "soutenances", "plannings", "salles", 
          "trainingAcademicYears", "referents", "academicYears"
        ]
      : keys;

    this.dataSubject.next({
      ...currentData,
      loading: true,
      error: null,
    });

    const observables: Partial<Record<AppDataKeys, Observable<any>>> = {};

    if (keysToFetch.includes("students"))
      observables.students = this.studentService
        .getStudents()
        .pipe(catchError(() => of([] as Student[])));

    if (keysToFetch.includes("staff"))
      observables.staff = this.staffService
        .getStaffs()
        .pipe(catchError(() => of([] as Staff[])));

    if (keysToFetch.includes("companies"))
      observables.companies = this.companyService
        .getCompanies()
        .pipe(catchError(() => of([] as Company[])));

    if (keysToFetch.includes("tutors"))
      observables.tutors = this.tutorService
        .getCompanyTutors()
        .pipe(catchError(() => of([] as CompanyTutor[])));

    if (keysToFetch.includes("soutenances"))
      observables.soutenances = this.soutenanceService
        .getSoutenances()
        .pipe(catchError(() => of([] as Soutenance[])));

    if (keysToFetch.includes("plannings"))
      observables.plannings = this.planningService
        .getPlannings()
        .pipe(catchError(() => of([] as Planning[])));

    if (keysToFetch.includes("salles"))
      observables.salles = this.salleService
        .getSalles()
        .pipe(catchError(() => of([] as Salle[])));

    if (keysToFetch.includes("trainingAcademicYears"))
      observables.trainingAcademicYears =
        this.studentTrainingAcademicYearService
          .getStudentsTrainingYearsAcademicYears()
          .pipe(catchError(() => of([] as Student_TrainingYear_AcademicYear[])));

    if (keysToFetch.includes("referents"))
      observables.referents = this.referentService
        .getAllStudentTeachers()
        .pipe(catchError(() => of([] as Student_Staff_AcademicYear_String[])));

    if (keysToFetch.includes("academicYears"))
      observables.academicYears = this.academicYearService
        .getAcademicYears()
        .pipe(catchError(() => of([] as AcademicYear[])));

    forkJoin(observables as Record<AppDataKeys, Observable<any>>)
      .pipe(
        tap((result: FetchResult) => {
          // Marquer les clés comme chargées
          keysToFetch.forEach(k => this.loadedKeys.add(k));

          this.dataSubject.next({
            ...currentData,
            ...result,
            loaded: true,
            loading: false,
            error: null,
          });
        }),
        catchError((err) => {
          this.dataSubject.next({
            ...currentData,
            loading: false,
            error: err,
          });
          return of(null);
        })
      )
      .subscribe();
  }

  // Observables pour chaque type de données
  students$() {
    return this.data$.pipe(map((d) => d.students));
  }

  staff$() {
    return this.data$.pipe(map((d) => d.staff));
  }

  companies$() {
    return this.data$.pipe(map((d) => d.companies));
  }

  tutors$() {
    return this.data$.pipe(map((d) => d.tutors));
  }

  soutenances$() {
    return this.data$.pipe(map((d) => d.soutenances));
  }

  plannings$() {
    return this.data$.pipe(map((d) => d.plannings));
  }

  salles$() {
    return this.data$.pipe(map((d) => d.salles));
  }

  trainingAcademicYears$() {
    return this.data$.pipe(map((d) => d.trainingAcademicYears));
  }

  referents$() {
    return this.data$.pipe(map((d) => d.referents));
  }

  academicYears$() {
    return this.data$.pipe(map((d) => d.academicYears));
  }

  loading$() {
    return this.data$.pipe(map((d) => d.loading));
  }

  error$() {
    return this.data$.pipe(map((d) => d.error));
  }


  // Récuperer des types de données
  getData<const K extends readonly AppDataKeys[]>(
    keys: K
  ): Observable<{ [P in K[number]]: AppDataMap[P] }> {
    return this.data$.pipe(
      map((data) => {
        const result = {} as { [P in K[number]]: AppDataMap[P] };

        for (const key of keys as readonly K[number][]) {
          result[key] = data[key];
        }

        return result;
      })
    );
  }




}