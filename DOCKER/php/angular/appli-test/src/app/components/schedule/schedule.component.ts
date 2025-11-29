import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { InitService } from '../../services/init.service';
import { LoadingComponent } from '../loading/loading.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScheduleBoardComponent } from '../schedule-board/schedule-board.component';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, LoadingComponent, FormsModule, ScheduleBoardComponent],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {
  currentUser?: any;
  currentUserRole?: string;
  allDataLoaded: boolean = false;
  optionSchedule: string[] = ["Sélectionner un planning existant", "nom du planning"];
  selectedOption: string = this.optionSchedule[1];
  jours: Date[] = [new Date(2026, 5, 22), new Date(2026, 5, 23)];

  selectedJour: Date = this.jours[0];  
  sallesDispo: number[] = [124, 125, 126, 127, 129, 131, 110];
  slots: SlotItem[] = [];
  timeBlocks: TimeBlockConfig[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly initService: InitService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.slots.push({
      topPercent:0,
      heightPercent:0,
      dateDebut: new Date(2026, 5, 22, 8),
      dateFin: new Date(2026, 5, 22, 9),
      etudiant: "Elève 1",
      referent: "Y. Carpentier",
      lecteur: "S. Voisin",
      entreprise: "Superinfo",
      salle: 124
    });
    this.jours.push(new Date(2026, 5, 24), new Date(2026, 5, 25), new Date(2026, 5, 26));
    const newTimeBlocks: TimeBlockConfig[] = [
      { start: "08:00", end: "12:00", type: "morning" },
      { start: "14:00", end: "17:00", type: "afternoon" }
    ];
    
    this.timeBlocks.push(...newTimeBlocks);
    
    this.authService.getAuthenticatedUser().subscribe(currentUser => {
      this.currentUser = currentUser;
      
      if (this.authService.isStudent(this.currentUser)) {
        this.currentUserRole = 'STUDENT';
      }
      else if (this.authService.isStaff(this.currentUser)) {
        this.currentUserRole = 'INTERNSHIP_MANAGER';
      }

      this.initService.setInitialized();
    });
    
    this.cdRef.detectChanges();
    this.allDataLoaded = true;
  }

  updateJour(jour: Date){
    this.selectedJour = jour;
  }

  export(){

  }

  goToAdd() {
    this.router.navigate(['/schedule/add-schedule']);
  }

  goToUpdate() {
    this.router.navigate(['/schedule/update-schedule']);
  }
}

interface TimeBlockConfig{
  start: string;  // "08:00"
  end: string;    // "12:00"
  type: string;
}

interface SlotItem {
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