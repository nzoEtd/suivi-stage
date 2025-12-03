import { ChangeDetectorRef, Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { InitService } from '../../services/init.service';
import { LoadingComponent } from '../loading/loading.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ScheduleBoardComponent } from '../schedule-board/schedule-board.component';
import { Observable, firstValueFrom, forkJoin } from 'rxjs';
import { Planning } from '../../models/planning.model';
import { Salle } from '../../models/salle.model';
import { Soutenance } from '../../models/soutenance.model';
import { SalleService } from '../../services/salle.service';
import { PlanningService } from '../../services/planning.service';
import { SoutenanceService } from '../../services/soutenance.service';
import { StudentService } from '../../services/student.service';
import { StaffService } from '../../services/staff.service';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, LoadingComponent, FormsModule, ScheduleBoardComponent],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements AfterViewInit {
  planning$!: Observable<Planning[]>;
  salle$!: Observable<Salle[]>;
  soutenance$!: Observable<Soutenance[]>;

  currentUser?: any;
  currentUserRole?: string;
  allDataLoaded: boolean = false;

  allPlannings: Planning[] = [];
  allSoutenances: Soutenance[] = [];
  
  selectedPlanning?: Planning;
  optionSchedule: string[] = ["Sélectionner un planning existant"];
  selectedOption: string = this.optionSchedule[0];
  jours: Date[] = [];

  selectedJour?: Date;  
  sallesDispo: number[] = [];
  slots: SlotItem[] = [];
  timeBlocks: TimeBlockConfig[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly initService: InitService,
    private router: Router,
    private readonly planningService: PlanningService,
    private readonly salleService: SalleService,
    private readonly soutenanceService: SoutenanceService,
    private readonly studentService: StudentService,
    private readonly staffService: StaffService,
    private readonly companyService: CompanyService
  ) {}

  async ngAfterViewInit() {
    this.soutenance$ = this.soutenanceService.getSoutenances();
    this.planning$ = this.planningService.getPlannings();
    this.salle$ = this.salleService.getSalles();
    
    forkJoin({
      salles: this.salle$,
      planning: this.planning$,
      soutenance: this.soutenance$
    }).subscribe(result => {
        this.allPlannings = result.planning;
        this.allSoutenances = result.soutenance;

        this.sallesDispo = (result.salles.filter(s => s.estDisponible).map(s => s.nomSalle));

        const planningNames = result.planning
          .map(p => p.nom)
          .filter((nom): nom is string => nom !== null);
        
        this.optionSchedule.push(...planningNames);
        
        console.log("jours de soutenance : " + this.jours);
        console.log("optionSchedule : " + this.optionSchedule);
        console.log("selectedOption : " + this.selectedOption);
        console.log("sallesDispo : " + this.sallesDispo);
        console.log("timeBlocks : " + this.timeBlocks);
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

  onPlanningChange(planningName: string) {
    // Trouver le planning sélectionné
    this.selectedPlanning = this.allPlannings.find(p => p.nom === planningName);
    
    if (this.selectedPlanning && this.selectedPlanning.dateDebut && this.selectedPlanning.dateFin 
      && this.selectedPlanning.heureDebutMatin && this.selectedPlanning.heureFinMatin
      && this.selectedPlanning.heureDebutAprem && this.selectedPlanning.heureFinAprem) {
      // Générer les dates pour ce planning uniquement
      this.jours = this.getDatesBetween(
        this.selectedPlanning.dateDebut, 
        this.selectedPlanning.dateFin
      );
      
      // Sélectionner le premier jour par défaut
      this.selectedJour = this.jours[0];
    
      //mettre en place les timeBlocks
      this.timeBlocks = [];
      const newTimeBlocks: TimeBlockConfig[] = [
        { start: this.selectedPlanning.heureDebutMatin, end: this.selectedPlanning.heureFinMatin, type: "morning" },
        { start: this.selectedPlanning.heureDebutAprem, end: this.selectedPlanning.heureFinAprem, type: "afternoon" }
      ];
      
      this.timeBlocks.push(...newTimeBlocks);
      
      // Charger les soutenances pour ce planning
      this.loadSoutenancesForPlanning(this.selectedPlanning);
    } else {
      this.jours = [];
      this.selectedJour = undefined;
      this.slots = [];
    }
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
  
  private async loadSoutenancesForPlanning(planning: Planning) {
    try {
      console.log('Chargement des soutenances pour le planning:', planning.nom);
      console.log('ID du planning:', planning.idPlanning);
      const filteredSoutenances = this.allSoutenances.filter(s => 
        {return s.idPlanning === planning.idPlanning}
      );
      
      this.slots = await this.convertSoutenancesToSlots(filteredSoutenances);
      console.log("soutenance : " + this.slots)
      this.cdRef.detectChanges();
    } catch (error) {
      console.error('Erreur lors du chargement des soutenances:', error);
      this.slots = [];
    }
  }
  
  private async convertSoutenancesToSlots(soutenances: Soutenance[]): Promise<SlotItem[]> {
    const validSoutenances = soutenances.filter(s => 
      s.date !== null && 
      s.heureDebut !== null && 
      s.heureFin !== null &&
      s.idLecteur !== null &&
      s.idUPPA != null &&
      s.nomSalle !== null
    );
    return await Promise.all(
      validSoutenances.map(async (s) => ({
        topPercent: 0,
        heightPercent: 0,
        dateDebut: this.getDateHeure(s.date!, s.heureDebut!),
        dateFin: this.getDateHeure(s.date!, s.heureFin!),
        etudiant: await this.getStudentName(s.idUPPA!),
        referent: await this.getReferentFromStudent(s.idUPPA!),
        lecteur: await this.getLecteurName(s.idLecteur!),
        entreprise: await this.getEntrepriseFromStudent(s.idUPPA!),
        salle: s.nomSalle!
      }))
    );
  }

  private getDateHeure(date: Date, heure: string): Date{
    const [heures, minutes] = heure.split(':').map(Number);
  
    const dateFinale = new Date(date);
    dateFinale.setHours(heures, minutes, 0, 0);

    return dateFinale;
  }

  private async getStudentName(idStudent: string): Promise<string> {
    try {
      const student = await firstValueFrom(this.studentService.getStudentById(idStudent));
      return student ? `${student.nom} ${student.prenom}` : "Étudiant inconnu";
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'étudiant:', error);
      return "Étudiant inconnu";
    }
  }

  private async getReferentFromStudent(idStudent: string): Promise<string> {
    try {
      const student = await firstValueFrom(this.studentService.getStudentById(idStudent));
      
      if (student?.idTuteur) {
        const referent = await firstValueFrom(this.staffService.getStaffById(student.idTuteur));
        return referent ? `${referent.nom} ${referent.prenom}` : "Référent inconnu";
      }
      
      return "Pas de référent";
    } catch (error) {
      console.error('Erreur lors de la récupération du référent:', error);
      return "Référent inconnu";
    }
  }

  private async getEntrepriseFromStudent(idStudent: string): Promise<string> {
    try {
      const student = await firstValueFrom(this.studentService.getStudentById(idStudent));
      
      if (student?.idEntreprise) {
        const company = await firstValueFrom(this.companyService.getCompanyById(student.idEntreprise));
        return company?.raisonSociale ?? "Entreprise inconnue";
      }
      
      return "Pas d'entreprise";
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'entreprise:', error);
      return "Entreprise inconnue";
    }
  }

  private async getLecteurName(idLecteur: number): Promise<string> {
  try {
    const lecteur = await firstValueFrom(this.staffService.getStaffById(idLecteur));
    return lecteur ? `${lecteur.nom} ${lecteur.prenom}` : "Lecteur inconnu";
  } catch (error) {
    console.error('Erreur lors de la récupération du lecteur:', error);
    return "Lecteur inconnu";
  }
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