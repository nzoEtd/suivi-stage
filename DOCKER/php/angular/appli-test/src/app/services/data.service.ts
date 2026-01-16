import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, forkJoin, of } from "rxjs";
import { StudentService } from "./student.service";
import { StaffService } from "./staff.service";
import { CompanyService } from "./company.service";
import { Student } from "../models/student.model";
import { Staff } from "../models/staff.model";
import { Company } from "../models/company.model";
import { AcademicYearService } from "./academic-year.service";
import { StudentTrainingYearAcademicYearService } from "./student-trainingYear-academicYear.service";
import { SalleService } from "./salle.service";
import { SoutenanceService } from "./soutenance.service";
import { PlanningService } from "./planning.service";
import { CompanyTutorService } from "./company-tutor.service";
import { StudentStaffAcademicYearService } from "./student-staff-academicYear.service";
import { CompanyTutor } from "../models/company-tutor.model";
import { Soutenance } from "../models/soutenance.model";
import { Planning } from "../models/planning.model";
import { Salle } from "../models/salle.model";
import { Student_TrainingYear_AcademicYear } from "../models/student-trainingYear-academicYear.model";
import { Student_Staff_AcademicYear } from "../models/student-staff-academicYear.model";
import { AcademicYear } from "../models/academic-year.model";

interface AppData {
  students: Student[];
  staff: Staff[];
  companies: Company[];
  tutors: CompanyTutor[];
  soutenances: Soutenance[];
  plannings: Planning[];
  salles: Salle[];
  trainingAcademicYears: Student_TrainingYear_AcademicYear[];
  referents: Student_Staff_AcademicYear[];
  academicYears: AcademicYear[];
  loaded: boolean;
  loading: boolean;
  error: any;
}

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

  fetchAllData(forceRefresh: boolean = false) {
    if (this.dataSubject.value.loaded && !forceRefresh) {
      return;
    }

    this.dataSubject.next({
      ...this.dataSubject.value,
      loading: true,
      error: null,
    });

    forkJoin({
      soutenances: this.soutenanceService.getSoutenances(),
      plannings: this.planningService.getPlannings(),
      salles: this.salleService.getSalles(),
      students: this.studentService.getStudents(),
      staff: this.staffService.getStaffs(),
      companies: this.companyService.getCompanies(),
      tutors: this.tutorService.getCompanyTutors(),
      trainingAcademicYears:
        this.studentTrainingAcademicYearService.getStudentsTrainingYearsAcademicYears(),
      referents: this.referentService.getAllStudentTeachers(),
      academicYears: this.academicYearService.getAcademicYears(),
    }).subscribe({
      next: (result) => {
        this.dataSubject.next({
          ...result,
          loaded: true,
          loading: false,
          error: null,
        });
      },
      error: (err) => {
        this.dataSubject.next({
          ...this.dataSubject.value,
          loaded: false,
          loading: false,
          error: err,
        });
      },
    });
  }

  refreshData() {
    this.fetchAllData(true);
  }
}
