import {
  ChangeDetectorRef,
  Component,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { AuthService } from "../../services/auth.service";
import { InitService } from "../../services/init.service";
import { LoadingComponent } from "../loading/loading.component";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { ScheduleBoardComponent } from "../schedule-board/schedule-board.component";
import { Subject, takeUntil } from "rxjs";
import { Planning } from "../../models/planning.model";
import { Salle } from "../../models/salle.model";
import { Soutenance } from "../../models/soutenance.model";
import { ModalePlanningComponent } from "../modale-planning/modale-planning.component";
import { Student } from "../../models/student.model";
import { Staff } from "../../models/staff.model";
import { Company } from "../../models/company.model";
import { SlotItem } from "../../models/slotItem.model";
import { TimeBlockConfig } from "../../models/timeBlock.model";
import {
  getAllSallesUsed,
  loadSoutenancesForPlanning,
} from "../../utils/fonctions";
import { getDatesBetween } from "../../utils/timeManagement";
import { CompanyTutor } from "../../models/company-tutor.model";
import { Student_TrainingYear_AcademicYear } from "../../models/student-trainingYear-academicYear.model";
import { AcademicYear } from "../../models/academic-year.model";
import { Student_Staff_AcademicYear_String } from "../../models/student-staff-academicYear-string.model";
import { ModaleSoutenanceComponent } from "../modale-soutenance/modale-soutenance.component";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { DataStoreService } from "../../services/data.service";
// import { ToastrService } from 'ngx-toastr';
// import { inject } from '@angular/core';

@Component({
  selector: "app-schedule",
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    FormsModule,
    ScheduleBoardComponent,
    ModalePlanningComponent,
    ModaleSoutenanceComponent,
  ],
  providers: [DatePipe],
  templateUrl: "./schedule.component.html",
  styleUrls: ["./schedule.component.css"],
})
export class ScheduleComponent implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  // toastr = inject(ToastrService);

  currentUser?: any;
  currentUserRole?: string;
  allDataLoaded: boolean = false;
  isModalOpen: boolean = false;
  isModalSoutenanceOpen: boolean = false;

  allPlannings: Planning[] = [];
  allSoutenances: Soutenance[] = [];
  allStudents: Student[] = [];
  allStaff: Staff[] = [];
  allCompanies: Company[] = [];
  allTutors: CompanyTutor[] = [];
  allTrainingAcademicYears: Student_TrainingYear_AcademicYear[] = [];
  allAcademicYears: AcademicYear[] = [];
  allReferents: Student_Staff_AcademicYear_String[] = [];
  allSalles: Salle[] = [];

  selectedPlanning?: Planning;
  optionSchedule: string[] = ["Sélectionner un planning existant"];
  selectedOption: string = this.optionSchedule[0];
  jours: Date[] = [];

  selectedJour?: Date;
  sallesDispo: number[] = [];
  sallesAffiches: number[] = [];
  selectedSoutenance?: SlotItem;
  idSoutenance?: number;
  slots: SlotItem[] = [];
  timeBlocks: TimeBlockConfig[] = [];
  planningByDay: Record<string, SlotItem[]> = {};

  isExporting: boolean = false;

  constructor(
    private readonly authService: AuthService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly initService: InitService,
    private router: Router,
    private readonly dataStore: DataStoreService,
    private datePipe: DatePipe,
  ) {}

  async ngAfterViewInit() {
    this.dataStore.ensureDataLoaded([
      "plannings",
      "soutenances",
      "salles",
      "students",
      "staff",
      "companies",
      "tutors",
      "trainingAcademicYears",
      "referents",
      "academicYears",
    ]);

    this.dataStore.data$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (!data.loaded || data.loading) {
        this.allDataLoaded = false;
        return;
      }

      this.allPlannings = data.plannings;
      this.allSoutenances = data.soutenances;
      this.allStudents = data.students;
      this.allStaff = data.staff;
      this.allCompanies = data.companies;
      this.allTutors = data.tutors;
      this.allTrainingAcademicYears = data.trainingAcademicYears;
      this.allAcademicYears = data.academicYears;
      this.allReferents = data.referents;
      this.allSalles = data.salles;

      this.sallesDispo = data.salles
        .filter((s) => s.estDisponible)
        .map((s) => s.nomSalle);

      const planningNames = data.plannings
        .map((p) => p.nom)
        .filter((nom): nom is string => nom !== null);

      this.optionSchedule = [
        "Sélectionner un planning existant",
        ...planningNames,
      ];
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateJour(jour: Date) {
    this.selectedJour = jour;
    //Recherche de toutes les salles réellement utilisées
    this.sallesAffiches = getAllSallesUsed(
      this.sallesDispo,
      this.selectedJour,
      this.slots,
    );
  }
  
  async export() {
    if (!this.selectedPlanning || !this.jours.length) return;

    this.isExporting = true;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a3",
    });

    const element = document.getElementById("schedule-board-pdf");
    if (!element) return;

    const originalSelectedJour = this.selectedJour;

    for (const jour of this.jours) {
      this.updateJour(jour);

      this.cdRef.detectChanges();

      // Attendre que le DOM se maj
      await new Promise((resolve) => setTimeout(resolve, 100));

      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.overflow = "visible";
      tempContainer.style.height = "auto";
      tempContainer.style.width = "1400px";
      tempContainer.style.backgroundColor = "white";

      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.overflow = "visible";
      clone.style.height = "auto";
      clone.style.maxHeight = "none";

      // Jour en titre
      let formattedJour =
        this.datePipe.transform(jour, "EEEE dd MMMM yyyy", "", "fr") || "";
      formattedJour = formattedJour.replace(/\u00A0/g, " ");

      const jourHeader = document.createElement("h2");
      jourHeader.style.textAlign = "center";
      jourHeader.style.padding = "20px 0";
      jourHeader.style.fontSize = "28px";
      jourHeader.style.fontWeight = "500";
      jourHeader.style.display = "block";
      jourHeader.style.letterSpacing = "0.5px";
      jourHeader.textContent = formattedJour;

      clone.insertBefore(jourHeader, clone.firstChild);

      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      const canvas = await html2canvas(tempContainer, {
        scale: 1.5,
        useCORS: true,
        windowWidth: 1400,
        windowHeight: tempContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });

      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      if (jour !== this.jours[this.jours.length - 1]) {
        pdf.addPage();
      }
    }

    if (originalSelectedJour) this.updateJour(originalSelectedJour);

    this.cdRef.detectChanges();

    const planningName = this.selectedPlanning?.nom ?? "planning";
    const safeName = planningName.replace(/\s+/g, "_").replace(/[^\w\-]/g, "");

    pdf.save(`${safeName}.pdf`);

    this.isExporting = false;
  }

  goToAdd() {
    this.isModalOpen = true;
  }

  goToUpdate() {
    this.router.navigate([
      "/schedule/update-schedule/" + this.selectedPlanning?.idPlanning,
    ]);
  }

  openModal(slot: SlotItem) {
    this.selectedSoutenance = slot!;
    this.idSoutenance = this.selectedSoutenance!.id;
    this.isModalSoutenanceOpen = true;
  }

  async onPlanningChange(planningName: string) {
    this.allDataLoaded = false;
    // Trouver le planning sélectionné
    this.selectedPlanning = this.allPlannings.find(
      (p) => p.nom === planningName,
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
        this.selectedPlanning.dateFin,
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
      this.slots = await loadSoutenancesForPlanning(
        this.selectedPlanning,
        this.allSoutenances,
        this.slots,
        this.allStudents,
        this.allStaff,
        this.allCompanies,
        this.allTutors,
        this.allReferents,
        this.allTrainingAcademicYears,
        this.allAcademicYears,
        this.cdRef,
      );
      this.slots.forEach(slot => {
        const dayKey = slot.dateDebut ? slot.dateDebut.toISOString().slice(0,10) : "attente"; // "YYYY-MM-DD"
        if (!this.planningByDay[dayKey]) this.planningByDay[dayKey] = [];
        this.planningByDay[dayKey].push(slot);
      });
      //Recherche de toutes les salles réellement utilisées
      this.sallesAffiches = getAllSallesUsed(
        this.sallesDispo,
        this.selectedJour,
        this.slots,
      );
      this.allDataLoaded = true;
    } else {
      this.jours = [];
      this.selectedJour = undefined;
      this.slots = [];
      this.allDataLoaded = true;
    }
  }
}
