import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  FormsModule, 
  ReactiveFormsModule
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { Planning, PlanningCreate } from "../../models/planning.model";
import { ScheduleBoardComponent } from "../schedule-board/schedule-board.component";
import { LoadingComponent } from "../loading/loading.component";
import { Router } from "@angular/router";
import { SlotItem } from "../../models/slotItem.model";
import { TimeBlockConfig } from "../../models/timeBlock.model";
import { ModaleSoutenanceComponent } from "../modale-soutenance/modale-soutenance.component";
import { ModaleComponent } from "../modale/modale.component";
import { createSlotsFromStudents, getAllSallesUsed } from "../../utils/fonctions";
import { PlanningService } from "../../services/planning.service";
import { Soutenance, SoutenanceCreate, SoutenanceUpdate } from "../../models/soutenance.model";
import { Subject, forkJoin, switchMap, takeUntil } from "rxjs";
import { SoutenanceService } from "../../services/soutenance.service";
import { formatDateToYYYYMMDD } from "../../utils/timeManagement";
import { DataStoreService } from "../../services/data.service";
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';
import { OverlayModule } from "@angular/cdk/overlay";
import { TrainingYear } from "../../models/training-year.model";
import { Student } from "../../models/student.model";
import { TrainingYearService } from "../../services/training-year.service";
import { StudentService } from "../../services/student.service";
import { AcademicYearService } from "../../services/academic-year.service";
import { Company } from "../../models/company.model";
import { CompanyTutor } from "../../models/company-tutor.model";
import { Student_Staff_AcademicYear_String } from "../../models/student-staff-academicYear-string.model";
import { CompanyService } from "../../services/company.service";
import { CompanyTutorService } from "../../services/company-tutor.service";
import { StudentStaffAcademicYearService } from "../../services/student-staff-academicYear.service";
import { PlanningItemsService } from "../../services/planning-items.service";

@Component({
  selector: "app-add-update-schedule",
  imports: [
    ScheduleBoardComponent,
    CommonModule,
    LoadingComponent,
    ModaleSoutenanceComponent,
    ModaleComponent,
    OverlayModule,
    FormsModule, 
    ReactiveFormsModule
  ],
  templateUrl: "./add-update-schedule.component.html",
  styleUrls: ["./add-update-schedule.component.css"],
})
export class AddUpdateScheduleComponent implements OnChanges, OnDestroy {
  private destroy$ = new Subject<void>();
  toastr = inject(ToastrService);

  @Input() isEditMode!: Boolean;
  @Input() planning: Planning | PlanningCreate | undefined;
  @Input() slots: SlotItem[] = [];
  @Input() salles: number[] = [];
  @Input() jours: Date[] = [];
  @Input() soutenances: Soutenance[] = [];

  selectedJour?: Date;
  timeBlocks: TimeBlockConfig[] = [];
  allDataLoaded: boolean = false;
  isModalOpen: boolean = false;
  modalOpen: boolean = false;
  modalStudent: boolean = true;
  title: string = "";
  selectedSoutenance?: SlotItem;
  idSoutenance?: number;
  sallesAffiches: number[] = [];
  finalSlots: SoutenanceUpdate[] = [];
  isValidating: boolean = false;

  //Variables pour les modales
  dropdownOpen: boolean = false;
  submitted: boolean = false;
  isSubmitting: boolean = false;
  newItems: SlotItem[] = [];
  newDay: { date: string } | null = null;
  promos: TrainingYear[] = [];
  students: Student[] = [];
  selectedStudents: Student[] = [];
  planningForm!: FormGroup;
  currentAcademicYearId!: number;
  allCompanies: Company[] = [];
  allTutors: CompanyTutor[] = [];
  referents: Student_Staff_AcademicYear_String[] = [];

  //Variables drag and drop
  planningByDay: Record<string, SlotItem[]> = {};
  items: SlotItem[] = [];
  
  constructor(
    private readonly planningService: PlanningService,
    private readonly soutenanceService: SoutenanceService,
    private readonly dataStore: DataStoreService,
    private readonly cdRef: ChangeDetectorRef,
    private router: Router,
    private trainingYearService: TrainingYearService,
    private studentService: StudentService,
    private fb: FormBuilder,
    private academicYearService: AcademicYearService,
    private companiesService: CompanyService,
    private tutorService: CompanyTutorService,
    private studentStaffService: StudentStaffAcademicYearService,
    private planningItemsService: PlanningItemsService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes["planning"] || changes["jours"] || changes["soutenances"]) {
      console.log("planning : ", this.planning);
      console.log("jours : ", this.jours);
      console.log("soutenances finales : ", this.slots);

      this.timeBlocks = [];

      forkJoin({
        promos: this.trainingYearService.getTrainingYears(),
        academicYear: this.academicYearService.getCurrentAcademicYear(),
        allCompanies: this.companiesService.getCompanies(),
        allTutors: this.tutorService.getCompanyTutors(),
        referents: this.studentStaffService.getAllStudentTeachers(),
      }).subscribe(({ promos, academicYear, allCompanies, allTutors, referents }) => {
        this.promos = promos;
        this.currentAcademicYearId = academicYear?.idAnneeUniversitaire || 0;
        this.allCompanies = allCompanies;
        this.allTutors = allTutors;
        this.referents = referents;
      });
      this.planningItemsService.items$
        .subscribe(items => this.items = items);

      if (
        this.planning &&
        this.planning.dateDebut &&
        this.planning.dateFin &&
        this.planning.heureDebutMatin &&
        this.planning.heureFinMatin &&
        this.planning.heureDebutAprem &&
        this.planning.heureFinAprem &&
        this.jours.length > 0
      ) {
        this.selectedJour = this.jours[0];

        const newTimeBlocks: TimeBlockConfig[] = [
          {
            start: this.planning.heureDebutMatin,
            end: this.planning.heureFinMatin,
            type: "morning",
          },
          {
            start: this.planning.heureDebutAprem,
            end: this.planning.heureFinAprem,
            type: "afternoon",
          },
        ];

        this.timeBlocks.push(...newTimeBlocks);
        this.sallesAffiches = getAllSallesUsed(
          this.salles,
          this.selectedJour,
          this.slots
        );
        let idSlotTemp = 0;
        this.slots.forEach(slot => {
          idSlotTemp++;
          slot.id == -1 ? slot.id = idSlotTemp: slot.id = slot.id;
          const dayKey = slot.dateDebut ? slot.dateDebut.toISOString().slice(0,10) : "attente"; // "YYYY-MM-DD"
          if (!this.planningByDay[dayKey]) this.planningByDay[dayKey] = [];
          this.planningByDay[dayKey].push(slot);
        });
        this.allDataLoaded = true;
        this.cdRef.detectChanges();
      } else {
        this.selectedJour = undefined;
        this.allDataLoaded = true;
      }

      this.allDataLoaded = true;
      this.cdRef.detectChanges();
    }
  }

  initFormStudent() {
    this.planningForm = this.fb.group(
      {
        idAnneeFormation: [null, Validators.required],
        // etudiants: [[], Validators.required]
      },
    );
  }

  initFormDay() {
    this.planningForm = this.fb.group(
      {
        date: [null, Validators.required],
      },
    );
  }

  onStudentToggle(event: Event, student: Student) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedStudents.push(student);
    } else {
      this.selectedStudents = this.selectedStudents.filter((s) => s !== student);
    }
  }

  get selectedStudentsText(): string {
    return this.selectedStudents.length
      ? this.selectedStudents.map((s) => s.nom + " " + s.prenom).join(", ")
      : "-- Sélectionner --";
  }

  get promoSelected(): boolean {
    return this.planningForm.get('idAnneeFormation')?.value != null;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateJour(jour: Date) {
    this.selectedJour = jour;

    this.sallesAffiches = getAllSallesUsed(
      this.salles,
      this.selectedJour,
      this.slots
    );
  }

  exit() {
    this.router.navigate(["/schedule"]);
  }

  openEditModal(slot: SlotItem) {
    this.selectedSoutenance = slot;
    this.idSoutenance = this.selectedSoutenance!.id;
    this.isModalOpen = true;
  }

  updateSoutenance(updatedSoutenance: any){
    this.isModalOpen = false;
  }

  onSubmit(){
    this.submitted = true;
    console.log("?????", this.planningForm.invalid, this.planningForm, this.selectedStudents, this.planningForm.value)
    if (this.planningForm.invalid) return;
    this.isSubmitting = true;
    this.modalStudent ? this.addStudent() : this.addJour();
    this.isSubmitting = false;
  }

  openModalJour(){
    this.initFormDay();
    this.title = "Ajouter un jour";
    this.modalStudent = false;
    this.modalOpen = true;
  }

  addJour(){
    this.newDay = this.planningForm.value;
    console.log("test newDay :", this.newDay)
    if(this.newDay) {
      const date = new Date(this.newDay.date)
      this.planningByDay[date.toLocaleDateString('fr-CA')] = [];
      console.log(this.planningByDay)
      this.cdRef.detectChanges();
    }
  }

  openModalStudent(){
    this.initFormStudent();
    this.listenPromoChange();

    this.title = "Ajouter un étudiant";
    this.modalStudent = true;
    this.modalOpen = true;
  }

  listenPromoChange() {
    this.planningForm.get('idAnneeFormation')!
      .valueChanges
      .subscribe(idPromo => {
  
        if (idPromo) {
          this.loadStudents(idPromo);
          console.log("des étudiants ?", this.students);
          this.planningForm.get('etudiants')?.setValue(this.students);
        } else {
          this.students = [];
          this.planningForm.get('etudiants')?.setValue([]);
        }
  
      });
  }

  loadStudents(idPromo: number) {
    this.studentService.getStudentsByPromo(idPromo)
      .subscribe(students => {
        this.students = students;
      });
  }

  addStudent(){
    this.newItems = [];
    const newSlots: SlotItem[] = createSlotsFromStudents(this.selectedStudents, this.allCompanies, this.allTutors, this.referents, this.currentAcademicYearId);
    console.log("les nouveaux slots :",newSlots);
    newSlots.forEach(slot => {
      this.newItems.push(slot);
    })
    this.planningItemsService.addToWaiting(this.newItems);
    this.modalOpen = false;
  }

  onValidate() {
    this.isValidating = true;
    this.finalSlots = this.convertSlotsToSoutenances();
    if(this.finalSlots.length == 0) {
      this.toastr.error("Toutes les soutenances ne sont pas placées", "Impossible d'enregistrer le planning.");
      this.isValidating = false;
      return;
    }
    if (this.isEditMode) {
      // UPDATE
      console.log("UPDATING Planning:", this.planning);
      console.log("UPDATING Soutenances:", this.finalSlots);
      this.soutenanceService.updateManySoutenance(
        this.finalSlots
      )
      .subscribe({
        next: () => {
          // Rafraîchir les données du store après la création
          this.dataStore.refreshKeys(["soutenances"]);
          this.isValidating = false;
          this.toastr.success("Les modifications ont bien été prises en comptes.", "Planning enregistré.");

          this.exit();
        },
        error: (err) => {
          this.isValidating = false;
          this.toastr.error(err, "Impossible d'enregistrer le planning.");
        },
      });
    } else {
      //CREATE
      const { idPlanning, ...plannToCreate } = this.planning as Planning;

      const planningToCreate: PlanningCreate = {
        ...plannToCreate,
        dateDebut: formatDateToYYYYMMDD(plannToCreate.dateDebut),
        dateFin: formatDateToYYYYMMDD(plannToCreate.dateFin),
      };

      console.log("CREATING Planning:", planningToCreate);

      this.planningService
        .addPlanning(planningToCreate)
        .pipe(
          takeUntil(this.destroy$),
          switchMap((createdPlanning) => {
            const planningId = createdPlanning.idPlanning;
            console.log("Planning créé avec id:", planningId);

            const soutenancesToCreate = this.finalSlots.map(
              ({ idSoutenance, date, ...soutenance }) => ({
                ...soutenance,
                date: formatDateToYYYYMMDD(date),
                idPlanning: planningId,
              })
            );

            console.log("CREATING Soutenances:", soutenancesToCreate);
            return this.soutenanceService.addManySoutenances(
              soutenancesToCreate
            );
          })
        )
        .subscribe({
          next: () => {
            // Rafraîchir les données du store après la création
            this.dataStore.refreshKeys(["plannings", "soutenances"]);
            this.isValidating = false;
            this.toastr.success("L'ajout a bien été prises en comptes.", "Planning enregistré.");
            
            this.exit();
          },
          error: (err) => {
            this.isValidating = false;
            this.toastr.error(err, "Impossible d'enregistrer le planning.");
          },
        });
    }
  }

  //Fonctions drag and drop
  onSlotUpdated(event: {planningByDay: Record<string, SlotItem[]>, items: SlotItem[]}) {
    this.items = event.items;
    this.planningByDay = event.planningByDay;
  }
  
  getAllSlots(): SlotItem[] {
    return Object.values(this.planningByDay).flat();
  }

  convertSlotsToSoutenances(): SoutenanceUpdate[] {
    let soutenances: SoutenanceUpdate[] = [];
    const slots = this.getAllSlots();
    const planning = this.planning as Planning;
    const idPlanning = planning.idPlanning;

    if(this.items.length == 0){
      slots.forEach(s => {
        soutenances.push({
          idSoutenance: s.id,
          date: s.dateDebut!.toISOString().slice(0, 10),
          nomSalle: s.salle,
          heureDebut: s.dateDebut!.getHours().toString().padStart(2, '0') + ":" + s.dateDebut!.getMinutes().toString().padStart(2, '0'),
          heureFin: s.dateFin!.getHours().toString().padStart(2, '0') + ":" + s.dateFin!.getMinutes().toString().padStart(2, '0'),
          idUPPA: s.idUPPA,
          idLecteur: s.idLecteur,
          idPlanning: idPlanning
        });
      })

      return soutenances;
    }
    return [];
  }
}