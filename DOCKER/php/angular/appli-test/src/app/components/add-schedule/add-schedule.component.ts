import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import { InitService } from "../../services/init.service";
import { LoadingComponent } from "../loading/loading.component";
import { forkJoin, Observable, of } from "rxjs";
import { Planning } from "../../models/planning.model";
import { Salle } from "../../models/salle.model";
import { Soutenance } from "../../models/soutenance.model";
import { SoutenanceService } from "../../services/soutenance.service";
import { AddUpdateScheduleComponent } from "../add-update-schedule/add-update-schedule.component";
import { SlotItem } from "../../models/slotItem.model";
import { convertSoutenancesToSlots } from "../../utils/fonctions";
import { StaffService } from "../../services/staff.service";
import { Student } from "../../models/student.model";
import { StudentService } from "../../services/student.service";
import { CompanyService } from "../../services/company.service";
import { Staff } from "../../models/staff.model";
import { Company } from "../../models/company.model";
import { getDatesBetween, passWeekends } from "../../utils/timeManagement";
import { SalleService } from "../../services/salle.service";
import { CompanyTutorService } from "../../services/company-tutor.service";
import { StudentTrainingYearAcademicYearService } from "../../services/student-trainingYear-academicYear.service";
import { StudentStaffAcademicYearService } from "../../services/student-staff-academicYear.service";
import { AcademicYearService } from "../../services/academic-year.service";

@Component({
  selector: "app-add-schedule",
  imports: [CommonModule, LoadingComponent, AddUpdateScheduleComponent],
  templateUrl: "./add-schedule.component.html",
  styleUrls: ["./add-schedule.component.css"],
})
export class AddScheduleComponent implements OnInit {
  currentUser?: any;
  currentUserRole?: string;
  allDataLoaded: boolean = false;
  planning: Planning = new Planning();
  salles$!: Observable<Salle[]>;
  soutenance$!: Soutenance[];
  slots: SlotItem[] = [];
  allStudents: Student[] = [];
  allStaff: Staff[] = [];
  allCompanies: Company[] = [];
  id!: number;
  jours: Date[] = [];
  sallesDispo: number[] = [];
  daysToPass: number = 0;
  lastWeekend: Date = new Date(NaN);

  constructor(
    private readonly authService: AuthService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly initService: InitService,
    private readonly soutenanceService: SoutenanceService,
    private readonly staffService: StaffService,
    private readonly studentsService: StudentService,
    private readonly companyService: CompanyService,
    private readonly sallesService: SalleService,
    private readonly companyTutorService: CompanyTutorService,
    private readonly studentTrainingAcademicYearService: StudentTrainingYearAcademicYearService,
    private readonly referentService: StudentStaffAcademicYearService,
    private readonly academicYearService: AcademicYearService
  ) {}
  async ngOnInit() {
    const students$ = this.studentsService.getStudents();
    const staff$ = this.staffService.getStaffs();
    const companies$ = this.companyService.getCompanies();
    const companiesTutors$ = this.companyTutorService.getCompanyTutors();
    const studentTrainingAcademicYear$ =
      this.studentTrainingAcademicYearService.getStudentsTrainingYearsAcademicYears();
    const referents$ = this.referentService.getAllStudentTeachers();
    const academicYear$ = this.academicYearService.getAcademicYears();
    const state = history.state;
    const soutenance$ = state?.soutenances
      ? of(state.soutenances)
      : this.soutenanceService.getSoutenances();
    const salles$ = state?.salles
      ? of(state.salles as Salle[])
      : this.sallesService.getSalles();
    forkJoin({
      soutenances: soutenance$,
      students: students$,
      staff: staff$,
      companies: companies$,
      companiesTutors: companiesTutors$,
      salles: salles$,
      referents: referents$,
      academicYears: academicYear$,
      trainingAcademicYear: studentTrainingAcademicYear$,
    }).subscribe(async (result) => {
      this.soutenance$ = result.soutenances;
      this.planning = state?.newPlanning;
      console.log("dates avant : ", this.soutenance$)

      if (this.soutenance$.length > 0) {
        const dates = this.soutenance$
          .sort((a, b) => a.date!.getTime() - b.date!.getTime())
          .map((s) => { [s.date, this.daysToPass, this.lastWeekend] = passWeekends(s.date, this.daysToPass, this.lastWeekend);

          return {
            ...s,
            date: s.date
          };})
          .filter((d) => !isNaN(d.date.getTime()));
          console.log("les dates du planning : ",dates)

        this.planning.dateFin = new Date(
          Math.max(...dates.map((d) => d.date.getTime()))
        );
      }

      this.jours = getDatesBetween(
        this.planning.dateDebut!,
        this.planning.dateFin!
      );

      this.slots = await convertSoutenancesToSlots(
        this.soutenance$,
        result.students,
        result.staff,
        result.companies,
        result.companiesTutors,
        result.referents,
        result.trainingAcademicYear,
        this.planning.idAnneeUniversitaire
      );
      this.sallesDispo = result.salles
        .filter((s) => s.estDisponible)
        .map((s) => s.nomSalle);

      this.allDataLoaded = true;
      this.cdRef.detectChanges();
    });

    this.authService.getAuthenticatedUser().subscribe((currentUser) => {
      this.currentUser = currentUser;

      if (this.authService.isStudent(this.currentUser)) {
        this.currentUserRole = "STUDENT";
      } else if (this.authService.isStaff(this.currentUser)) {
        this.currentUserRole = "INTERNSHIP_MANAGER";
      }

      this.initService.setInitialized();
    });

    this.cdRef.detectChanges();
    this.allDataLoaded = true;
  }
}
