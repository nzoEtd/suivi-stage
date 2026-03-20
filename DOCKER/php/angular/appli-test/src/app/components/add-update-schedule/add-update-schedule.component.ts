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
  ReactiveFormsModule,
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
import {
  createSlotsFromStudents,
  getAllSallesUsed,
} from "../../utils/fonctions";
import { PlanningService } from "../../services/planning.service";
import {
  Soutenance,
  SoutenanceCreate,
  SoutenanceUpdate,
} from "../../models/soutenance.model";
import { Subject, forkJoin, switchMap, takeUntil } from "rxjs";
import { SoutenanceService } from "../../services/soutenance.service";
import { formatDateToYYYYMMDD } from "../../utils/timeManagement";
import { DataStoreService } from "../../services/data.service";
import { ToastrService } from "ngx-toastr";
import { inject } from "@angular/core";
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
import { Staff } from "../../models/staff.model";

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
    ReactiveFormsModule,
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
  title: string = "";
  selectedSoutenance?: SlotItem;
  idSoutenance?: number | string;
  sallesAffiches: number[] = [];
  finalSlots: SoutenanceUpdate[] = [];
  isValidating: boolean = false;
  allStaff: Staff[] = [];

  //Variables pour les modales
  dropdownOpen: boolean = false;
  submitted: boolean = false;
  isSubmitting: boolean = false;
  newDay: { date: string } | null = null;
  planningForm!: FormGroup;

  //Variables drag and drop
  planningByDay: Record<string, SlotItem[]> = {};
  items: SlotItem[] = [];
  itemsToAdd: SlotItem[] = [];

  constructor(
    private readonly planningService: PlanningService,
    private readonly soutenanceService: SoutenanceService,
    private readonly dataStore: DataStoreService,
    private readonly cdRef: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder,
    private planningItemsService: PlanningItemsService,
  ) {}

  ngOnInit(): void {
    this.dataStore.ensureDataLoaded(["staff"]);
    this.dataStore
      .staff$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((s) => {
        this.allStaff = s;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["planning"] || changes["jours"] || changes["soutenances"]) {
      console.log("planning : ", this.planning);
      console.log("jours : ", this.jours);
      console.log("soutenances finales : ", this.slots);

      this.timeBlocks = [];
      this.planningForm = this.fb.group({
        date: [null, Validators.required],
      });

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
          this.slots,
        );
        let idSlotTemp = 0;
        this.slots.forEach((slot) => {
          idSlotTemp++;
          slot.id == -1 ? (slot.id = idSlotTemp) : (slot.id = slot.id);
          const dayKey = slot.dateDebut
            ? slot.dateDebut.toISOString().slice(0, 10)
            : "attente"; // "YYYY-MM-DD"
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateJour(jour: Date) {
    this.selectedJour = jour;
    this.sallesAffiches = getAllSallesUsed(
      this.salles,
      this.selectedJour,
      this.slots,
    );
  }

  exit() {
    this.router.navigate(["/schedule"]);
  }

  openEditModal(slot: SlotItem) {
    const isInWaitingList = this.items.some((i) => i.id === slot.id);
    if (isInWaitingList) {
      return;
    }
    this.selectedSoutenance = slot;
    this.idSoutenance = this.selectedSoutenance!.id;
    this.isModalOpen = true;
  }

  updateSoutenance() {
    this.isModalOpen = false;
  }

  openModalJour() {
    this.title = "Ajouter un jour";
    this.modalOpen = true;
  }

  addJour() {
    this.newDay = this.planningForm.value;
    console.log("test newDay :", this.newDay);
    if (this.newDay) {
      const date = new Date(this.newDay.date);
      this.planningByDay = {
        ...this.planningByDay,
        [date.toLocaleDateString("fr-CA")]:
          this.planningByDay[date.toLocaleDateString("fr-CA")] || [],
      };
      console.log(this.planningByDay);
      this.cdRef.detectChanges();
    }
    this.modalOpen = false;
  }

  onValidate() {
    this.isValidating = true;
    let slotToAdd: SoutenanceCreate[];
    [this.finalSlots, slotToAdd] = this.convertSlotsToSoutenances();
    if (this.finalSlots.length == 0) {
      this.toastr.error(
        "Toutes les soutenances ne sont pas placées",
        "Impossible d'enregistrer le planning.",
      );
      this.isValidating = false;
      return;
    }
    if (this.isEditMode) {
      // AJOUT DES NOUVEAUX SLOTS
      if (slotToAdd.length != 0) {
        const soutenancesToCreate = slotToAdd.map(
          ({ date, ...soutenance }) => ({
            ...soutenance,
            date: formatDateToYYYYMMDD(date!),
          }),
        );

        console.log("CREATING Soutenances:", soutenancesToCreate);
        this.soutenanceService
          .addManySoutenances(soutenancesToCreate)
          .subscribe({
            next: () => {
              this.toastr.success(
                "L'ajout a bien été prises en comptes.",
                "Nouvelles soutenances enregistré.",
              );
            },
            error: (err) => {
              this.toastr.error(
                err,
                "Impossible d'enregistrer les nouvelles soutenances.",
              );
            },
          });
      }
      // UPDATE
      console.log("UPDATING Planning:", this.planning);
      console.log("UPDATING Soutenances:", this.finalSlots);
      this.soutenanceService.updateManySoutenance(this.finalSlots).subscribe({
        next: () => {
          // Rafraîchir les données du store après la création
          this.dataStore.refreshKeys(["soutenances"]);
          this.isValidating = false;
          this.toastr.success(
            "Les modifications ont bien été prises en comptes.",
            "Planning enregistré.",
          );

          this.exit();
        },
        error: (err) => {
          this.isValidating = false;
          this.toastr.error(err, "Impossible d'enregistrer le planning.");
        },
      });
    } else {
      //CREATE
      const slotsToCreate: SoutenanceCreate[] = [
        ...this.finalSlots,
        ...slotToAdd,
      ];
      console.log(slotsToCreate);
      const { idPlanning, ...plannToCreate } = this.planning as Planning;

      const planningToCreate: PlanningCreate = {
        ...plannToCreate,
        dateDebut: formatDateToYYYYMMDD(plannToCreate.dateDebut!),
        dateFin: formatDateToYYYYMMDD(plannToCreate.dateFin!!),
      };

      console.log("CREATING Planning:", planningToCreate);

      this.planningService
        .addPlanning(planningToCreate)
        .pipe(
          takeUntil(this.destroy$),
          switchMap((createdPlanning) => {
            const planningId = createdPlanning.idPlanning;
            console.log("Planning créé avec id:", planningId);

            const soutenancesToCreate = slotsToCreate.map(
              ({ date, ...soutenance }) => ({
                ...soutenance,
                date: formatDateToYYYYMMDD(date!),
                idPlanning: planningId,
              }),
            );

            console.log("CREATING Soutenances:", soutenancesToCreate);
            return this.soutenanceService.addManySoutenances(
              soutenancesToCreate,
            );
          }),
        )
        .subscribe({
          next: () => {
            // Rafraîchir les données du store après la création
            this.dataStore.refreshKeys(["plannings", "soutenances"]);
            this.isValidating = false;
            this.toastr.success(
              "L'ajout a bien été prises en comptes.",
              "Planning enregistré.",
            );

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
  onSlotUpdated(event: {
    planningByDay: Record<string, SlotItem[]>;
    items: SlotItem[];
    itemsToAdd: SlotItem[];
  }) {
    this.items = event.items;
    this.planningByDay = event.planningByDay;
    this.itemsToAdd = event.itemsToAdd;
    this.planningItemsService.setItems(this.items);
  }

  getAllSlots(): SlotItem[] {
    return Object.values(this.planningByDay).flat();
  }

  convertSlotsToSoutenances(): [SoutenanceUpdate[], SoutenanceCreate[]] {
    let soutenances: SoutenanceUpdate[] = [];
    let soutenancesToAdd: SoutenanceCreate[] = [];
    const slots = this.getAllSlots();
    const planning = this.planning as Planning;
    const idPlanning = planning.idPlanning;
    console.log("slots avant", slots);

    if (this.items.length == 0) {
      slots.forEach((s) => {
        if (!this.itemsToAdd.some((i) => i.id == s.id)) {
          soutenances.push({
            idSoutenance: s.id as number,
            date: s.dateDebut!.toISOString().slice(0, 10),
            nomSalle: s.salle,
            heureDebut:
              s.dateDebut!.getHours().toString().padStart(2, "0") +
              ":" +
              s.dateDebut!.getMinutes().toString().padStart(2, "0"),
            heureFin:
              s.dateFin!.getHours().toString().padStart(2, "0") +
              ":" +
              s.dateFin!.getMinutes().toString().padStart(2, "0"),
            idUPPA: s.idUPPA,
            idLecteur: s.idLecteur,
            idPlanning: idPlanning,
          });
        }
      });
      console.log("et après", soutenances);
      if (this.itemsToAdd.length != 0) {
        this.itemsToAdd.forEach((i) => {
          soutenancesToAdd.push({
            date: i.dateDebut!.toISOString().slice(0, 10),
            nomSalle: i.salle,
            heureDebut:
              i.dateDebut!.getHours().toString().padStart(2, "0") +
              ":" +
              i.dateDebut!.getMinutes().toString().padStart(2, "0"),
            heureFin:
              i.dateFin!.getHours().toString().padStart(2, "0") +
              ":" +
              i.dateFin!.getMinutes().toString().padStart(2, "0"),
            idUPPA: i.idUPPA,
            idLecteur: i.idLecteur,
            idPlanning: idPlanning,
          });
        });
      }

      return [soutenances, soutenancesToAdd];
    }
    return [[], []];
  }
}
