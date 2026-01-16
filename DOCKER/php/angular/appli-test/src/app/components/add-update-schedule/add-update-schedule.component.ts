import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Planning } from '../../models/planning.model';
import { ScheduleBoardComponent } from '../schedule-board/schedule-board.component';
import { LoadingComponent } from '../loading/loading.component';
import { Router } from '@angular/router';
import { SlotItem } from '../../models/slotItem.model';
import { TimeBlockConfig } from '../../models/timeBlock.model';
import { ModaleSoutenanceComponent } from '../modale-soutenance/modale-soutenance.component';
import { getAllSallesUsed } from '../../utils/fonctions';

@Component({
  selector: 'app-add-update-schedule',
  imports: [ScheduleBoardComponent, CommonModule, LoadingComponent, ModaleSoutenanceComponent],
  templateUrl: './add-update-schedule.component.html',
  styleUrls: ['./add-update-schedule.component.css']
})
export class AddUpdateScheduleComponent implements OnChanges {
  @Input() isEditMode!: Boolean;
  @Input() planning: Planning | undefined;
  @Input() soutenances: SlotItem[] = [];
  @Input() salles: number[] = [];
  @Input() jours: Date[] = [];

  selectedJour?: Date;
  timeBlocks: TimeBlockConfig[] = [];
  allDataLoaded: boolean = false;
  isModalOpen: boolean = false;
  selectedSoutenance?: SlotItem;
  idSoutenance?: number;
  sallesAffiches: number[]= [];
  
  constructor(
    private readonly cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['planning'] || changes['jours'] || changes['soutenances']) {
      console.log("planning : ", this.planning);
      console.log("jours : ", this.jours);
      console.log("soutenances finales : ", this.soutenances);

      this.timeBlocks = [];

      if (
        this.planning && this.planning.dateDebut && this.planning.dateFin &&
        this.planning.heureDebutMatin && this.planning.heureFinMatin &&
        this.planning.heureDebutAprem && this.planning.heureFinAprem &&
        this.jours.length > 0
      ) {
        this.selectedJour = this.jours[0];

        const newTimeBlocks: TimeBlockConfig[] = [
          { start: this.planning.heureDebutMatin, end: this.planning.heureFinMatin, type: "morning" },
          { start: this.planning.heureDebutAprem, end: this.planning.heureFinAprem, type: "afternoon" }
        ];
        
        this.timeBlocks.push(...newTimeBlocks);
        this.sallesAffiches = getAllSallesUsed(this.salles, this.selectedJour, this.soutenances);
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


  updateJour(jour: Date){
    this.selectedJour = jour;
    this.sallesAffiches = getAllSallesUsed(this.salles, this.selectedJour, this.soutenances);
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  exit() {
    this.router.navigate(['/schedule']);
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
}

