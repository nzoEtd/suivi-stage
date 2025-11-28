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

  constructor(
    private readonly authService: AuthService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly initService: InitService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.jours.push(new Date(2026, 5, 24), new Date(2026, 5, 25), new Date(2026, 5, 26));
    
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