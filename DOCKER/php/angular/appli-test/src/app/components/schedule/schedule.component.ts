import { ChangeDetectorRef, Component, AfterViewInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import { InitService } from "../../services/init.service";
import { LoadingComponent } from "../loading/loading.component";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ScheduleBoardComponent } from "../schedule-board/schedule-board.component";
import { Observable, forkJoin } from "rxjs";
import { Planning } from "../../models/planning.model";
import { Salle } from "../../models/salle.model";
import { Soutenance } from "../../models/soutenance.model";
import { SalleService } from "../../services/salle.service";
import { PlanningService } from "../../services/planning.service";
import { SoutenanceService } from "../../services/soutenance.service";
import { StudentService } from "../../services/student.service";
import { StaffService } from "../../services/staff.service";
import { CompanyService } from "../../services/company.service";
import { ModalePlanningComponent } from "../modale-planning/modale-planning.component";
import { Student } from "../../models/student.model";
import { Staff } from "../../models/staff.model";
import { Company } from "../../models/company.model";
import { SlotItem } from "../../models/slotItem.model";
import { TimeBlockConfig } from "../../models/timeBlock.model";
import { getDatesBetween, loadSoutenancesForPlanning } from "../../utils/fonctions";

@Component({
  selector: "app-schedule",
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    FormsModule,
    ScheduleBoardComponent,
    ModalePlanningComponent,
  ],
  templateUrl: "./schedule.component.html",
  styleUrls: ["./schedule.component.css"],
})
export class ScheduleComponent implements AfterViewInit {
  planning$!: Observable<Planning[]>;
  salle$!: Observable<Salle[]>;
  soutenance$!: Observable<Soutenance[]>;

  currentUser?: any;
  currentUserRole?: string;
  allDataLoaded: boolean = false;
  isModalOpen: boolean = false;

  allPlannings: Planning[] = [];
  allSoutenances: Soutenance[] = [];

  allStudents: Student[] = [];
  allStaff: Staff[] = [];
  allCompanies: Company[] = [];

  selectedPlanning?: Planning;
  optionSchedule: string[] = ["Sélectionner un planning existant"];
  selectedOption: string = this.optionSchedule[0];
  jours: Date[] = [];

  selectedJour?: Date;
  sallesDispo: number[] = [];
  slots: SlotItem[] = [];
  timeBlocks: TimeBlockConfig[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly initService: InitService,
    private router: Router,
    private readonly planningService: PlanningService,
    private readonly salleService: SalleService,
    private readonly soutenanceService: SoutenanceService,
    private readonly studentService: StudentService,
    private readonly staffService: StaffService,
    private readonly companyService: CompanyService
  ) {}

  async ngAfterViewInit() {
    this.soutenance$ = this.soutenanceService.getSoutenances();
    this.planning$ = this.planningService.getPlannings();
    this.salle$ = this.salleService.getSalles();
    const students$ = this.studentService.getStudents();
    const staff$ = this.staffService.getStaffs();
    const companies$ = this.companyService.getCompanies();

    forkJoin({
      salles: this.salle$,
      planning: this.planning$,
      soutenance: this.soutenance$,
      students: students$,
      staff: staff$,
      companies: companies$,
    }).subscribe((result) => {
      this.allPlannings = result.planning;
      this.allSoutenances = result.soutenance;
      this.allStudents = result.students;
      this.allStaff = result.staff;
      this.allCompanies =result.companies;

      this.sallesDispo = result.salles
        .filter((s) => s.estDisponible)
        .map((s) => s.nomSalle);

      const planningNames = result.planning
        .map((p) => p.nom)
        .filter((nom): nom is string => nom !== null);

      this.optionSchedule.push(...planningNames);
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
  }

  updateJour(jour: Date) {
    this.selectedJour = jour;
  }

  export() {}

  goToAdd() {
    this.isModalOpen = true;
  }

  goToUpdate() {
    this.router.navigate([
      "/schedule/update-schedule/" + this.selectedPlanning?.idPlanning,
    ]);
  }

  async onPlanningChange(planningName: string) {
    this.allDataLoaded = false;
    // Trouver le planning sélectionné
    this.selectedPlanning = this.allPlannings.find(
      (p) => p.nom === planningName
    );

    if (
      this.selectedPlanning &&
      this.selectedPlanning.dateDebut &&
      this.selectedPlanning.dateFin &&
      this.selectedPlanning.heureDebutMatin &&
      this.selectedPlanning.heureFinMatin &&
      this.selectedPlanning.heureDebutAprem &&
      this.selectedPlanning.heureFinAprem
    ) {
      // Générer les dates pour ce planning uniquement
      this.jours = getDatesBetween(
        this.selectedPlanning.dateDebut,
        this.selectedPlanning.dateFin
      );

      // Sélectionner le premier jour par défaut
      this.selectedJour = this.jours[0];

      //mettre en place les timeBlocks
      this.timeBlocks = [];
      const newTimeBlocks: TimeBlockConfig[] = [
        {
          start: this.selectedPlanning.heureDebutMatin,
          end: this.selectedPlanning.heureFinMatin,
          type: "morning",
        },
        {
          start: this.selectedPlanning.heureDebutAprem,
          end: this.selectedPlanning.heureFinAprem,
          type: "afternoon",
        },
      ];

      this.timeBlocks.push(...newTimeBlocks);

      // Charger les soutenances pour ce planning
      this.slots = await loadSoutenancesForPlanning(this.selectedPlanning, this.allSoutenances, this.slots, this.allStudents, this.allStaff, this.allCompanies, this.cdRef);
      console.log("les slots ?", this.slots)
      this.allDataLoaded = true;
    } else {
      this.jours = [];
      this.selectedJour = undefined;
      this.slots = [];
      this.allDataLoaded = true;
    }
  }
}
