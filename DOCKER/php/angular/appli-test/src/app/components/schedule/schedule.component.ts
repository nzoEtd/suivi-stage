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
      this.jours = this.getDatesBetween(
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
      await this.loadSoutenancesForPlanning(this.selectedPlanning);
      this.allDataLoaded = true;
    } else {
      this.jours = [];
      this.selectedJour = undefined;
      this.slots = [];
      this.allDataLoaded = true;
    }
  }

  private getDatesBetween(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(start);
    const endDate = new Date(end);

    while (currentDate <= endDate) {
      const day = currentDate.getDay();
      if (day !== 0 && day !== 6) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  private async loadSoutenancesForPlanning(planning: Planning) {
    try {
      console.log("Chargement des soutenances pour le planning:", planning.nom);
      const filteredSoutenances = this.allSoutenances.filter((s) => {
        return s.idPlanning === planning.idPlanning;
      });

      this.slots = await this.convertSoutenancesToSlots(filteredSoutenances);
      console.log("soutenances : ", this.slots);
      this.cdRef.detectChanges();
    } catch (error) {
      console.error("Erreur lors du chargement des soutenances:", error);
      this.slots = [];
    }
  }

  private async convertSoutenancesToSlots(
    soutenances: Soutenance[]
  ): Promise<SlotItem[]> {
    const validSoutenances = soutenances.filter(
      (s) =>
        s.date !== null &&
        s.heureDebut !== null &&
        s.heureFin !== null &&
        s.idLecteur !== null &&
        s.idUPPA != null &&
        s.nomSalle !== null &&
        s.idSoutenance
    );
     return validSoutenances.map(s => {
    const student = this.allStudents.find(st => st.idUPPA === s.idUPPA);
    const referent = student?.idTuteur 
      ? this.allStaff.find(f => f.idPersonnel === student.idTuteur)
      : null;

    const lecteur = this.allStaff.find(f => f.idPersonnel === s.idLecteur);

    const company = student?.idEntreprise 
      ? this.allCompanies.find(c => c.idEntreprise === student.idEntreprise)
      : null;

    return {
        id: s.idSoutenance,
        topPercent: 0,
        heightPercent: 0,
        dateDebut: this.getDateHeure(s.date!, s.heureDebut!),
        dateFin: this.getDateHeure(s.date!, s.heureFin!),
        etudiant: student ? `${student.nom} ${student.prenom}` : "Étudiant inconnu",
        referent: referent ? `${referent.prenom![0]}. ${referent.nom}` : "Pas de référent",
        lecteur: lecteur ? `${lecteur.prenom![0]}. ${lecteur.nom}` : "Lecteur inconnu",
        entreprise: company ? company.raisonSociale! : "Pas d'entreprise",
        salle: s.nomSalle!,
      } ;
  });
}

  private getDateHeure(date: Date, heure: string): Date {
    const [heures, minutes] = heure.split(":").map(Number);

    const dateFinale = new Date(date);
    dateFinale.setHours(heures, minutes, 0, 0);

    return dateFinale;
  }


}
