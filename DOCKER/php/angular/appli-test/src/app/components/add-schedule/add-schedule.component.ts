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
import { getDatesBetween } from "../../utils/timeManagement";
import { SalleService } from "../../services/salle.service";

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

  constructor(
    private readonly authService: AuthService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly initService: InitService,
    private readonly soutenanceService: SoutenanceService,
    private readonly staffService: StaffService,
    private readonly studentsService: StudentService,
    private readonly companyService: CompanyService,
    private readonly sallesService: SalleService
  ) {}
  async ngOnInit() {
    const students$ = this.studentsService.getStudents();
    const staff$ = this.staffService.getStaffs();
    const companies$ = this.companyService.getCompanies();
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
      salles: salles$,
    }).subscribe(async (result) => {
      this.soutenance$ = result.soutenances;
      this.planning = state?.newPlanning;

      if (this.soutenance$.length > 0) {
        const dates = this.soutenance$
          .map((s) => new Date(s.date || ""))
          .filter((d) => !isNaN(d.getTime()));

        this.planning.dateFin = new Date(
          Math.max(...dates.map((d) => d.getTime()))
        );
      }

      this.jours = getDatesBetween(
        this.planning.dateDebut!,
        this.planning.dateFin!
      );

      this.allStudents = result.students;
      this.allStaff = result.staff;
      this.allCompanies = result.companies;

      this.slots = await convertSoutenancesToSlots(
        this.soutenance$,
        this.allStudents,
        this.allStaff,
        this.allCompanies
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
