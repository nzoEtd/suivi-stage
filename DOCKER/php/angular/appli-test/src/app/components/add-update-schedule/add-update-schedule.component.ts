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
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';
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
  selectedSoutenance?: SlotItem;
  idSoutenance?: number;
  sallesAffiches: number[] = [];
  finalSlots: SoutenanceUpdate[] = [];
  isValidating: boolean = false;

  //Variables drag and drop
  planningByDay: Record<string, SlotItem[]> = {};
  items: SlotItem[] = [];
  
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
    console.log('les slots finaux ',this.finalSlots, this.finalSlots.length)
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
          console.log("Soutenances mises à jour");
            
          // Rafraîchir les données du store après la création
          this.dataStore.refreshKeys(["soutenances"]);
          this.isValidating = false;
          this.toastr.success("Les modifications ont bien été prises en comptes.", "Planning enregistré.");

          this.exit();
        },
        error: (err) => {
          this.isValidating = false;
          console.error("Erreur lors de la création", err);
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
            this.isValidating = false;
            this.toastr.success("L'ajout a bien été prises en comptes.", "Planning enregistré.");
            
            this.exit();
          },
          error: (err) => {
            this.isValidating = false;
            console.error("Erreur lors de la création", err);
            this.toastr.error(err, "Impossible d'enregistrer le planning.");
          },
        });
    }
  }

  //Fonctions drag and drop
  onSlotUpdated(event: {planningByDay: Record<string, SlotItem[]>, items: SlotItem[]}) {
    console.log("nouveau planning ?",event.planningByDay)
    console.log("des items non placés ?", event.items)
  
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
    console.log("les slots items dans items à la fin : ", this.items)

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