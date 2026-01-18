import { Component, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Planning } from '../../models/planning.model';
import { ScheduleBoardComponent } from '../schedule-board/schedule-board.component';
import { LoadingComponent } from '../loading/loading.component';
import { Router } from '@angular/router';
import { SlotItem } from '../../models/slotItem.model';
import { TimeBlockConfig } from '../../models/timeBlock.model';
import { ModaleSoutenanceComponent } from '../modale-soutenance/modale-soutenance.component';
import { getAllSallesUsed } from '../../utils/fonctions';
import { CdkDrag, CdkDropList, CdkDropListGroup, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PlanningService } from '../../services/planning.service';
import { SoutenanceService } from '../../services/soutenance.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-add-update-schedule',
  imports: [ScheduleBoardComponent, CommonModule, LoadingComponent, ModaleSoutenanceComponent, CdkDrag, CdkDropList, CdkDropListGroup],
  templateUrl: './add-update-schedule.component.html',
  styleUrls: ['./add-update-schedule.component.css']
})
export class AddUpdateScheduleComponent implements AfterViewInit {
  @Input() isEditMode!: Boolean;
  @Input() planning: Planning | undefined;
  @Input() slots: SlotItem[] = [];
  @Input() salles: number[] = [];
  @Input() jours: Date[] = [];

  selectedJour?: Date;
  timeBlocks: TimeBlockConfig[] = [];
  allDataLoaded: boolean = false;
  isModalOpen: boolean = false;
  selectedSoutenance?: SlotItem;
  idSoutenance?: number;
  sallesAffiches: number[]= [];

  //Variables drag and drop
  items: SlotItem[] = [];
  planningByDay: Record<string, SlotItem[]> = {};
  
  constructor(
    private readonly planningService: PlanningService,
    private readonly soutenanceService: SoutenanceService,
    private readonly cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngAfterViewInit() {
    console.log("planning : ",this.planning)
    console.log("jours : ",this.jours)
    console.log("soutenances finales : ",this.slots)
    this.timeBlocks = [];

    if (this.planning && this.planning.dateDebut && this.planning.dateFin 
      && this.planning.heureDebutMatin && this.planning.heureFinMatin
      && this.planning.heureDebutAprem && this.planning.heureFinAprem
      && this.jours) {
      this.selectedJour = this.jours[0];
      const newTimeBlocks: TimeBlockConfig[] = [
        { start: this.planning.heureDebutMatin, end: this.planning.heureFinMatin, type: "morning" },
        { start: this.planning.heureDebutAprem, end: this.planning.heureFinAprem, type: "afternoon" }
      ];
      
      this.timeBlocks.push(...newTimeBlocks);
      
      this.sallesAffiches = getAllSallesUsed(this.salles, this.selectedJour, this.slots);
      this.slots.forEach(slot => {
        const dayKey = slot.dateDebut.toISOString().slice(0,10); // "YYYY-MM-DD"
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
  }

  updateJour(jour: Date){
    this.selectedJour = jour;
    const dayKey = this.selectedJour.toISOString().slice(0,10);
    const slotsDuJour = this.planningByDay[dayKey] || [];
    console.log("slots du jour",slotsDuJour)

    this.sallesAffiches = getAllSallesUsed(this.salles, this.selectedJour, this.slots);
  }

  exit() {
    this.router.navigate(['/schedule']);
  }

  openEditModal(slot: SlotItem) {
    console.log("le slot sélectionné : ",slot)
    this.selectedSoutenance = slot!;
    this.idSoutenance = this.selectedSoutenance!.id;
    this.isModalOpen = true;
  }

  updateSoutenance(updatedSoutenance: any){
    this.isModalOpen = false;
  }

  //Fonctions drag and drop
  onSlotUpdated(slot: SlotItem) {
    console.log("nouveau slot ?",slot)
    const dayKey = slot.dateDebut.toISOString().slice(0, 10);
  
    // retirer de l'ancien jour si nécessaire
    for (const key in this.planningByDay) {
      this.planningByDay[key] = this.planningByDay[key].filter(s => s.id !== slot.id);
    }
  
    // ajouter au bon jour
    this.planningByDay[dayKey].push(slot);
  }
  
}
