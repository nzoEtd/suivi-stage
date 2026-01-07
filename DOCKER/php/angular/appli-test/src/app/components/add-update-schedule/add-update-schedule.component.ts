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

@Component({
  selector: 'app-add-update-schedule',
  imports: [ScheduleBoardComponent, CommonModule, LoadingComponent],
  templateUrl: './add-update-schedule.component.html',
  styleUrls: ['./add-update-schedule.component.css']
})
export class AddUpdateScheduleComponent implements AfterViewInit {
  @Input() isEditMode!: Boolean;
  @Input() planning: Planning | undefined;
  @Input() soutenances: Soutenance[] = [];
  @Input() salles: number[] = [];
  @Input() jours: Date[] = [];

  allStudents: Student[] = [];
  allStaff: Staff[] = [];
  allCompanies: Company[] = [];

  selectedJour?: Date;
  slots: SlotItem[] = [];
  timeBlocks: TimeBlockConfig[] = [];
  allDataLoaded: boolean = false;
  isModalOpen: boolean = false;
  
  constructor(
    private readonly cdRef: ChangeDetectorRef,
    private readonly studentService: StudentService,
    private readonly staffService: StaffService,
    private router: Router,
    private readonly companyService: CompanyService
  ) {}

  async ngAfterViewInit() {
    console.log("planning : ",this.planning)
    console.log("jours : ",this.jours)
    this.timeBlocks = [];
    const students$ = this.studentService.getStudents();
    const staff$ = this.staffService.getStaffs();
    const companies$ = this.companyService.getCompanies();

    forkJoin({
      students: students$,
      staff: staff$,
      companies: companies$,
    }).subscribe((result) => {
      this.allStudents = result.students;
      this.allStaff = result.staff;
      this.allCompanies =result.companies;
    });

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
      
      // Charger les soutenances pour ce planning
      await this.loadSoutenancesForPlanning(this.planning);
      this.allDataLoaded = true;
      this.cdRef.detectChanges();
    } else {
      this.selectedJour = undefined;
      this.slots = [];
      this.allDataLoaded = true;
    }
  }

  updateJour(jour: Date){
    this.selectedJour = jour;
  }
  
  private async loadSoutenancesForPlanning(planning: Planning) {
    try {
      console.log('Chargement des soutenances pour le planning:', planning.nom);
      const filteredSoutenances = this.soutenances.filter(s => 
        {return s.idPlanning === planning.idPlanning}
      );
      
      this.slots = await this.convertSoutenancesToSlots(filteredSoutenances);
      console.log("soutenances : ", this.slots)
      this.cdRef.detectChanges();
    } catch (error) {
      console.error('Erreur lors du chargement des soutenances:', error);
      this.slots = [];
    }
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

  openModal(): void {
    this.isModalOpen=true;
  }

  exit() {
    this.router.navigate(['/schedule']);
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