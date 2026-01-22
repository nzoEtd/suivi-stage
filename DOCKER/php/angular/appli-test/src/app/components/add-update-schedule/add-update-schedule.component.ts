import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Planning, PlanningCreate } from "../../models/planning.model";
import { ScheduleBoardComponent } from "../schedule-board/schedule-board.component";
import { LoadingComponent } from "../loading/loading.component";
import { Router } from "@angular/router";
import { SlotItem } from "../../models/slotItem.model";
import { TimeBlockConfig } from "../../models/timeBlock.model";
import { ModaleSoutenanceComponent } from "../modale-soutenance/modale-soutenance.component";
import { getAllSallesUsed } from "../../utils/fonctions";
import { PlanningService } from "../../services/planning.service";
import { Soutenance, SoutenanceUpdate } from "../../models/soutenance.model";
import { Subject, switchMap, takeUntil } from "rxjs";
import { SoutenanceService } from "../../services/soutenance.service";
import { formatDateToYYYYMMDD } from "../../utils/timeManagement";
import { DataStoreService } from "../../services/data.service";
import { CdkDrag, CdkDropList, CdkDropListGroup, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: "app-add-update-schedule",
  imports: [
    ScheduleBoardComponent,
    CommonModule,
    LoadingComponent,
    ModaleSoutenanceComponent,
  ],
  templateUrl: "./add-update-schedule.component.html",
  styleUrls: ["./add-update-schedule.component.css"],
})
export class AddUpdateScheduleComponent implements OnChanges, OnDestroy {
  private destroy$ = new Subject<void>();

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
  selectedSoutenance?: SlotItem;
  idSoutenance?: number;
  sallesAffiches: number[] = [];
  finalSlots: SoutenanceUpdate[] = [];
  isValidating: boolean = false;

  //Variables drag and drop
  planningByDay: Record<string, SlotItem[]> = {};
  
  constructor(
    private readonly planningService: PlanningService,
    private readonly soutenanceService: SoutenanceService,
    private readonly dataStore: DataStoreService,
    private readonly cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes["planning"] || changes["jours"] || changes["soutenances"]) {
      console.log("planning : ", this.planning);
      console.log("jours : ", this.jours);
      console.log("soutenances finales : ", this.slots);

      this.timeBlocks = [];

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
        this.slots.forEach(slot => {
          const dayKey = slot.dateDebut ? slot.dateDebut.toISOString().slice(0,10) : "attente"; // "YYYY-MM-DD"
          if (!this.planningByDay[dayKey]) this.planningByDay[dayKey] = [];
          this.planningByDay[dayKey].push(slot);
        });
        console.log("les slots triés par jour",this.planningByDay)
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
    const dayKey = this.selectedJour.toISOString().slice(0,10);
    const slotsDuJour = this.planningByDay[dayKey] || [];
    console.log("slots du jour",slotsDuJour)

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
    console.log("le slot sélectionné : ", slot);
    this.selectedSoutenance = slot;
    this.idSoutenance = this.selectedSoutenance!.id;
    this.isModalOpen = true;
  }

  updateSoutenance(updatedSoutenance: any){
    this.isModalOpen = false;
  }

  onValidate() {
    this.isValidating = true;
    console.log("?????? ",this.isValidating)
    console.log("Validation du planning");
    this.finalSlots = this.convertSlotsToSoutenances();
    if (this.isEditMode) {
      // UPDATE
      console.log("UPDATING Planning:", this.planning);
      console.log("UPDATING Soutenances:", this.finalSlots);
      this.soutenanceService.updateManySoutenance(
        this.finalSlots
      )
      .subscribe({
        next: () => {
          console.log("Soutenances mises à jour");
            
          // Rafraîchir les données du store après la création
          this.dataStore.refreshKeys(["soutenances"]);

          this.router.navigate(["/schedule"]);
        },
        error: (err) => {
          console.error("Erreur lors de la création", err);
        },
      });
      this.isValidating = false;
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

            const soutenancesToCreate = this.soutenances.map(
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
            console.log("Planning + soutenances créés");
            
            // Rafraîchir les données du store après la création
            this.dataStore.refreshKeys(["plannings", "soutenances"]);
            
            this.router.navigate(["/schedule"]);
          },
          error: (err) => {
            console.error("Erreur lors de la création", err);
          },
        });
        this.isValidating = false;
    }
  }

  //Fonctions drag and drop
  onSlotUpdated(slot: SlotItem) {
    console.log("nouveau slot ?",slot)
    const dayKey = slot.dateDebut ? slot.dateDebut.toISOString().slice(0, 10) : "attente";
  
    // retirer de l'ancien jour si nécessaire
    for (const key in this.planningByDay) {
      this.planningByDay[key] = this.planningByDay[key].filter(s => s.id !== slot.id);
    }
  
    // ajouter au bon jour
    this.planningByDay[dayKey].push(slot);
  }
  
  getAllSlots(): SlotItem[] {
    return Object.values(this.planningByDay).flat();
  }

  convertSlotsToSoutenances(): SoutenanceUpdate[] {
    let soutenances: SoutenanceUpdate[] = [];
    const slots = this.getAllSlots();
    const planning = this.planning as Planning;
    const idPlanning = planning.idPlanning;

    slots.forEach(s => {
      s.dateDebut && s.dateFin ?
      soutenances.push({
        idSoutenance: s.id,
        date: s.dateDebut.toISOString().slice(0, 10),
        nomSalle: s.salle,
        heureDebut: s.dateDebut.getHours().toString().padStart(2, '0') + ":" + s.dateDebut.getMinutes().toString().padStart(2, '0'),
        heureFin: s.dateFin.getHours().toString().padStart(2, '0') + ":" + s.dateFin.getMinutes().toString().padStart(2, '0'),
        idUPPA: s.idUPPA,
        idLecteur: s.idLecteur,
        idPlanning: idPlanning
      })
      : console.log("attention tous les slots sont pas placés.")
      return [];
    })

    return soutenances;
  }
}