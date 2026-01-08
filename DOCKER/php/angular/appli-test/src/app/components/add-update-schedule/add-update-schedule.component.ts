import { Component, OnInit, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Planning } from '../../models/planning.model';
import { ScheduleBoardComponent } from '../schedule-board/schedule-board.component';
import { Soutenance } from '../../models/soutenance.model';
import { Salle } from '../../models/salle.model';
import { firstValueFrom, forkJoin } from 'rxjs';
import { LoadingComponent } from '../loading/loading.component';
import { StudentService } from '../../services/student.service';
import { StaffService } from '../../services/staff.service';
import { CompanyService } from '../../services/company.service';
import { Router } from '@angular/router';
import { Student } from '../../models/student.model';
import { Staff } from '../../models/staff.model';
import { Company } from '../../models/company.model';
import { ModaleSoutenanceComponent } from '../modale-soutenance/modale-soutenance.component';

@Component({
  selector: 'app-add-update-schedule',
  imports: [ScheduleBoardComponent, CommonModule, LoadingComponent, ModaleSoutenanceComponent],
  templateUrl: './add-update-schedule.component.html',
  styleUrls: ['./add-update-schedule.component.css']
})
export class AddUpdateScheduleComponent implements AfterViewInit {
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
  
  constructor(
    private readonly cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngAfterViewInit() {
    console.log("planning : ",this.planning)
    console.log("jours : ",this.jours)
    console.log("soutenances finales : ",this.soutenances)
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
      
      this.allDataLoaded = true;
      this.cdRef.detectChanges();
    } else {
      this.selectedJour = undefined;
      this.allDataLoaded = true;
    }
  }

  updateJour(jour: Date){
    this.selectedJour = jour;
  }

  openModal(): void {
    this.isModalOpen=true;
  }

  exit() {
    this.router.navigate(['/schedule']);
  }

  openEditModal(slot: SlotItem) {
    this.selectedSoutenance = slot;
    this.idSoutenance = this.selectedSoutenance.id;
    console.log("le slot sélectionné : ",slot)
    this.isModalOpen = true;
  }

  onSoutenanceSaved(updatedSoutenance: any) {
    // Logique de sauvegarde
    this.isModalOpen = false;
    // Recharger les données si nécessaire
  }
}

interface TimeBlockConfig{
  start: string;  // "08:00"
  end: string;    // "12:00"
  type: string;
}

interface SlotItem {
    id: number;
    topPercent: number;
    heightPercent: number;
    dateDebut: Date;
    dateFin: Date;
    etudiant: string;
    referent: string;
    lecteur: string;
    entreprise: string;
    salle: number;
}