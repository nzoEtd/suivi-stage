import { ChangeDetectorRef, Component, AfterViewInit } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
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
import {
  getAllSallesUsed,
  loadSoutenancesForPlanning,
} from "../../utils/fonctions";
import { getDatesBetween } from "../../utils/timeManagement";
import { CompanyTutorService } from "../../services/company-tutor.service";
import { CompanyTutor } from "../../models/company-tutor.model";
import { StudentStaffAcademicYearService } from "../../services/student-staff-academicYear.service";
import { StudentTrainingYearAcademicYearService } from "../../services/student-trainingYear-academicYear.service";
import { Student_TrainingYear_AcademicYear } from "../../models/student-trainingYear-academicYear.model";
import { AcademicYear } from "../../models/academic-year.model";
import { AcademicYearService } from "../../services/academic-year.service";
import { Student_Staff_AcademicYear_String } from "../../models/student-staff-academicYear-string.model";
import { ModaleSoutenanceComponent } from "../modale-soutenance/modale-soutenance.component";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
export class ScheduleComponent implements AfterViewInit {
  planning$!: Observable<Planning[]>;
  salle$!: Observable<Salle[]>;
  soutenance$!: Observable<Soutenance[]>;

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

  isExporting: boolean = false;

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
    private readonly companyService: CompanyService,
    private readonly tutorService: CompanyTutorService,
    private readonly referentService: StudentStaffAcademicYearService,
    private readonly studentTrainingAcademicYearService: StudentTrainingYearAcademicYearService,
    private readonly academicYearService: AcademicYearService,
    private datePipe: DatePipe
  ) {}

  async ngAfterViewInit() {
    this.soutenance$ = this.soutenanceService.getSoutenances();
    this.planning$ = this.planningService.getPlannings();
    this.salle$ = this.salleService.getSalles();
    const students$ = this.studentService.getStudents();
    const staff$ = this.staffService.getStaffs();
    const companies$ = this.companyService.getCompanies();
    const tutors$ = this.tutorService.getCompanyTutors();
    const studentTrainingAcademicYear$ =
      this.studentTrainingAcademicYearService.getStudentsTrainingYearsAcademicYears();
    const referent$ = this.referentService.getAllStudentTeachers();
    const academicYear$ = this.academicYearService.getAcademicYears();

    forkJoin({
      salles: this.salle$,
      planning: this.planning$,
      soutenance: this.soutenance$,
      students: students$,
      staff: staff$,
      companies: companies$,
      tutors: tutors$,
      trainingAcademicYears: studentTrainingAcademicYear$,
      referent: referent$,
      academicYear: academicYear$,
    }).subscribe((result) => {
      this.allPlannings = result.planning;
      this.allSoutenances = result.soutenance;
      this.allStudents = result.students;
      this.allStaff = result.staff;
      this.allCompanies = result.companies;
      this.allTutors = result.tutors;
      this.allTrainingAcademicYears = result.trainingAcademicYears;
      this.allAcademicYears = result.academicYear;
      this.allReferents = result.referent;
      console.log("les referents et autre :", this.allReferents);
      console.log("les academic year et autre :", this.allAcademicYears);

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
    //Recherche de toutes les salles réellement utilisées
    this.sallesAffiches = getAllSallesUsed(
      this.sallesDispo,
      this.selectedJour,
      this.slots
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

    for (const jour of this.jours) {
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.overflow = "visible";
      tempContainer.style.height = "auto";
      tempContainer.style.width = element.scrollWidth + "px";
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
      jourHeader.style.margin = "10px 0";
      jourHeader.style.padding = "10px 0";
      jourHeader.style.fontSize = "28px";
      jourHeader.style.fontWeight = "500";
      jourHeader.style.width = "100%";
      jourHeader.style.display = "block";
      jourHeader.style.letterSpacing = "0.5px";
      jourHeader.textContent = formattedJour;

      clone.insertBefore(jourHeader, clone.firstChild);

      clone.querySelectorAll<HTMLElement>(".jour").forEach((el) => {
        if (new Date(el.dataset["jour"]!)?.getTime() === jour.getTime()) {
          el.classList.add("selectedJour");
        } else {
          el.classList.remove("selectedJour");
        }
      });

      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);

      const canvas = await html2canvas(tempContainer, {
        scale: 1.5,
        useCORS: true,
        windowWidth: tempContainer.scrollWidth,
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

    const blobUrl = pdf.output("bloburl");
    window.open(blobUrl, "_blank");

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
    console.log("le slot sélectionné : ", slot);
    this.selectedSoutenance = slot!;
    this.idSoutenance = this.selectedSoutenance!.id;
    this.isModalSoutenanceOpen = true;
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
        this.cdRef
      );
      console.log("les slots ?", this.slots);
      //Recherche de toutes les salles réellement utilisées
      this.sallesAffiches = getAllSallesUsed(
        this.sallesDispo,
        this.selectedJour,
        this.slots
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
