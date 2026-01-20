import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
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
import { Soutenance } from "../../models/soutenance.model";
import { switchMap } from "rxjs";
import { SoutenanceService } from "../../services/soutenance.service";
import { formatDateToYYYYMMDD } from "../../utils/timeManagement";

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
export class AddUpdateScheduleComponent implements OnChanges {
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

  constructor(
    private readonly planningService: PlanningService,
    private readonly soutenanceService: SoutenanceService,
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

  updateJour(jour: Date) {
    this.selectedJour = jour;
    this.sallesAffiches = getAllSallesUsed(
      this.salles,
      this.selectedJour,
      this.slots
    );
  }

  openModal(): void {
    this.isModalOpen = true;
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

  onSoutenanceSaved(updatedSoutenance: any) {
    this.isModalOpen = false;
  }

  onValidate() {
    console.log("Validation du planning");
    if (this.isEditMode) {
      // UPDATE
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
            this.router.navigate(["/schedule"]);
          },
          error: (err) => {
            console.error("Erreur lors de la création", err);
          },
        });
    }
  }
}
