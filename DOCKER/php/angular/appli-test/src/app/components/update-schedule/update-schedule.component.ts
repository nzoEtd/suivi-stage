import { ChangeDetectorRef, Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { InitService } from '../../services/init.service';
import { LoadingComponent } from '../loading/loading.component';
import { AddUpdateScheduleComponent } from '../add-update-schedule/add-update-schedule.component';
import { ActivatedRoute } from '@angular/router';
import { Planning } from '../../models/planning.model';
import { Observable, forkJoin } from 'rxjs';
import { PlanningService } from '../../services/planning.service';
import { Salle } from '../../models/salle.model';
import { Soutenance } from '../../models/soutenance.model';
import { SalleService } from '../../services/salle.service';
import { SoutenanceService } from '../../services/soutenance.service';
import { ModaleSoutenanceComponent } from '../modale-soutenance/modale-soutenance.component';
import { StudentService } from '../../services/student.service';
import { StaffService } from '../../services/staff.service';
import { CompanyService } from '../../services/company.service';
import { Student } from '../../models/student.model';
import { Staff } from '../../models/staff.model';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-update-schedule',
  imports: [CommonModule, LoadingComponent, AddUpdateScheduleComponent,ModaleSoutenanceComponent],
  templateUrl: './update-schedule.component.html',
  styleUrls: ['./update-schedule.component.css']
})
export class UpdateScheduleComponent implements AfterViewInit {
  planning$?: Observable<Planning | undefined>;
  salle$!: Observable<Salle[]>;
  soutenance$!: Observable<Soutenance[]>;

  allSoutenances: Soutenance[] = [];
  allStudents: Student[] = [];
  allStaff: Staff[] = [];
  allCompanies: Company[] = [];
  planning!: Planning;
  id!: number;
  jours: Date[] = [];
  sallesDispo: number[] = [];
  slots: SlotItem[] = [];
  timeBlocks: TimeBlockConfig[] = [];

  currentUser?: any;
  currentUserRole?: string;
  allDataLoaded: boolean = false;

  isEditModalOpen: boolean = false;
  selectedSoutenance?: any;

  constructor(
    private readonly authService: AuthService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly initService: InitService,
    private readonly planningService: PlanningService,
    private readonly salleService: SalleService,
    private readonly soutenanceService: SoutenanceService,
    private readonly studentService: StudentService,
    private readonly staffService: StaffService,
    private readonly companyService: CompanyService,
    private route: ActivatedRoute
  ) {}
  async ngAfterViewInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.planning$ = this.planningService.getPlanningById(this.id);
    this.soutenance$ = this.soutenanceService.getSoutenances();
    this.salle$ = this.salleService.getSalles();
    const students$ = this.studentService.getStudents();
    const staff$ = this.staffService.getStaffs();
    const companies$ = this.companyService.getCompanies();
    forkJoin({
      salles: this.salle$,
      planning: this.planning$,
      soutenance: this.soutenance$,
      students: students$,
      staff: staff$,
      companies: companies$,
    }).subscribe(result => {
        this.planning = result.planning!;
        console.log("le planning",this.planning)
        this.jours = this.getDatesBetween(
          this.planning.dateDebut!, 
          this.planning.dateFin!
        );
        console.log("les jours",this.jours)
        this.allSoutenances = (result.soutenance.filter(s => s.idPlanning == this.planning.idPlanning));
        console.log("les soutenances",this.allSoutenances)

        this.sallesDispo = (result.salles.filter(s => s.estDisponible).map(s => s.nomSalle));
        
        this.allDataLoaded = true;
        this.cdRef.detectChanges(); 
    });
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
  }
  
  private getDatesBetween(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(start);
    const endDate = new Date(end);
  
    while (currentDate <= endDate) {
      const day = currentDate.getDay();
      if (day !== 0 && day !== 6) {      
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
  }

  openEditModal(slot: any) {
    this.selectedSoutenance = slot;
    console.log("le slot sélectionné : ",slot)
    this.isEditModalOpen = true;
  }

  onSoutenanceSaved(updatedSoutenance: any) {
    // Logique de sauvegarde
    this.isEditModalOpen = false;
    // Recharger les données si nécessaire
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