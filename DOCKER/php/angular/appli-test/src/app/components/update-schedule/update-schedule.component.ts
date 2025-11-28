import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { InitService } from '../../services/init.service';
// import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-update-schedule',
  imports: [CommonModule/*, LoadingComponent*/],
  templateUrl: './update-schedule.component.html',
  styleUrls: ['./update-schedule.component.css']
})
export class UpdateScheduleComponent {
  currentUser?: any;
  currentUserRole?: string;
  allDataLoaded: boolean = false;

  constructor(
    private readonly authService: AuthService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly initService: InitService
  ) {}
  async ngOnInit() {
    
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
