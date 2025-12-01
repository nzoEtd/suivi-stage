import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { InitService } from '../../services/init.service';
import { LoadingComponent } from '../loading/loading.component';
import { Observable } from 'rxjs';
import { Planning } from '../../models/planning.model';
import { Salle } from '../../models/salle.model';
import { Soutenance } from '../../models/soutenance.model';
import { SalleService } from '../../services/salle.service';
import { PlanningService } from '../../services/planning.service';
import { SoutenanceService } from '../../services/soutenance.service';

@Component({
  selector: 'app-add-schedule',
  imports: [CommonModule, LoadingComponent],
  templateUrl: './add-schedule.component.html',
  styleUrls: ['./add-schedule.component.css']
})
export class AddScheduleComponent implements OnInit {
  currentUser?: any;
  currentUserRole?: string;
  allDataLoaded: boolean = false;
  planning$!: Observable<Planning[]>;
  salle$!: Observable<Salle[]>;
  soutenance$!: Observable<Soutenance[]>;

  constructor(
    private readonly authService: AuthService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly initService: InitService,
    private readonly planningService: PlanningService,
    private readonly salleService: SalleService,
    private readonly soutenanceService: SoutenanceService
  ) {}
  async ngOnInit() {
  this.soutenance$ = this.soutenanceService.getSoutenances();
  this.planning$ = this.planningService.getPlannings();
  this.salle$ = this.salleService.getSalles();
    
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
}
