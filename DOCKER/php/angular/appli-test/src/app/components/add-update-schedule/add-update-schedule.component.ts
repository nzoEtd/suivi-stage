import { Component, OnInit, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Planning } from '../../models/planning.model';
import { ScheduleBoardComponent } from '../schedule-board/schedule-board.component';
import { Soutenance } from '../../models/soutenance.model';
import { Salle } from '../../models/salle.model';
import { firstValueFrom } from 'rxjs';
import { LoadingComponent } from '../loading/loading.component';
import { StudentService } from '../../services/student.service';
import { StaffService } from '../../services/staff.service';
import { CompanyService } from '../../services/company.service';

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

  selectedJour?: Date;
  slots: SlotItem[] = [];
  timeBlocks: TimeBlockConfig[] = [];
  allDataLoaded: boolean = false;
  isModalOpen: boolean = false;
  
  constructor(
    private readonly cdRef: ChangeDetectorRef,
    private readonly studentService: StudentService,
    private readonly staffService: StaffService,
    private readonly companyService: CompanyService
  ) {}

  async ngAfterViewInit() {
    console.log("planning : ",this.planning)
    console.log("jours : ",this.jours)
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
      
      // Charger les soutenances pour ce planning
      await this.loadSoutenancesForPlanning(this.planning);
      this.allDataLoaded = true;
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
        id: s.idSoutenance,
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
        if(referent){
          return referent ? `${referent.prenom![0]}. ${referent.nom}` : "Référent inconnu";
        }
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
      return lecteur ? `${lecteur.prenom![0]}. ${lecteur.nom}` : "Lecteur inconnu";
    } catch (error) {
      console.error('Erreur lors de la récupération du lecteur:', error);
      return "Lecteur inconnu";
    }
  }

  openModal(): void {
    this.isModalOpen=true;
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