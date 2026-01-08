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
import { StudentService } from '../../services/student.service';
import { StaffService } from '../../services/staff.service';
import { CompanyService } from '../../services/company.service';
import { Student } from '../../models/student.model';
import { Staff } from '../../models/staff.model';
import { Company } from '../../models/company.model';
import { SlotItem } from '../../models/slotItem.model';
import { TimeBlockConfig } from '../../models/timeBlock.model';

@Component({
  selector: 'app-update-schedule',
  imports: [CommonModule, LoadingComponent, AddUpdateScheduleComponent],
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

  // isEditModalOpen: boolean = false;
  // selectedSoutenance?: any;

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
    }).subscribe(async result => {
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
        this.allStudents = result.students;
        this.allStaff = result.staff;
        this.allCompanies =result.companies;
        console.log("les soutenances avant slot",this.allSoutenances)
        this.slots = await this.convertSoutenancesToSlots(this.allSoutenances);
        console.log("les slots",this.slots)
        
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
  
  private async convertSoutenancesToSlots(
    soutenances: Soutenance[]
  ): Promise<SlotItem[]> {
    console.log("soutenances ?",soutenances)
    const validSoutenances = soutenances.filter(
      (s) =>
        s.date !== null &&
        s.heureDebut !== null &&
        s.heureFin !== null &&
        s.idLecteur !== null &&
        s.idUPPA != null &&
        s.nomSalle !== null &&
        s.idSoutenance
    );
     return validSoutenances.map(s => {
      const student = this.allStudents.find(st => st.idUPPA === s.idUPPA);
      const referent = student?.idTuteur 
        ? this.allStaff.find(f => f.idPersonnel === student.idTuteur)
        : null;

      const lecteur = this.allStaff.find(f => f.idPersonnel === s.idLecteur);

      const company = student?.idEntreprise 
        ? this.allCompanies.find(c => c.idEntreprise === student.idEntreprise)
        : null;

      return {
          id: s.idSoutenance,
          topPercent: 0,
          heightPercent: 0,
          dateDebut: this.getDateHeure(s.date!, s.heureDebut!),
          dateFin: this.getDateHeure(s.date!, s.heureFin!),
          etudiant: student ? `${student.nom} ${student.prenom}` : "Étudiant inconnu",
          referent: referent ? `${referent.prenom![0]}. ${referent.nom}` : "Pas de référent",
          lecteur: lecteur ? `${lecteur.prenom![0]}. ${lecteur.nom}` : "Lecteur inconnu",
          entreprise: company ? company.raisonSociale! : "Pas d'entreprise",
          salle: s.nomSalle!,
        } ;
    });
  }

  private getDateHeure(date: Date, heure: string): Date{
    const [heures, minutes] = heure.split(':').map(Number);
  
    const dateFinale = new Date(date);
    dateFinale.setHours(heures, minutes, 0, 0);

    return dateFinale;
  }

  // openEditModal(slot: any) {
  //   this.selectedSoutenance = slot;
  //   console.log("le slot sélectionné : ",slot)
  //   this.isEditModalOpen = true;
  // }

  // onSoutenanceSaved(updatedSoutenance: any) {
  //   // Logique de sauvegarde
  //   this.isEditModalOpen = false;
  //   // Recharger les données si nécessaire
  // }
}
