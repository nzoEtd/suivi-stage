import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Soutenance } from '../../models/soutenance.model';
import { SoutenanceService } from '../../services/soutenance.service';
import { Staff } from '../../models/staff.model';
import { Salle } from '../../models/salle.model';
import { SlotItem } from '../../models/slotItem.model';
import { AuthService } from '../../services/auth.service';
import { LoadingComponent } from '../loading/loading.component';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { StaffService } from '../../services/staff.service';

@Component({
  selector: "app-modale-soutenance",
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: "./modale-soutenance.component.html",
  styleUrl: "./modale-soutenance.component.css",
})

export class ModaleSoutenanceComponent implements OnInit {
  currentUser?: any;
  currentUserRole?: string;
  isSubmitting: boolean = false;
  @Input() soutenance!: SlotItem;
  @Input() editMode: boolean = false;
  newSoutenance: Soutenance = new Soutenance();
  enseignantsLecteurs: Staff[] = [];
  @Input() sallesDispo!: Salle[];
  newDate!: string;


  @Output() cancel = new EventEmitter<void>();

  constructor(private readonly soutenanceService: SoutenanceService, 
              private readonly authService: AuthService,
              private readonly router: Router,
              private readonly staffService: StaffService) {}

  async ngOnInit(): Promise<void> {
    this.convertSlotToSoutenance(this.soutenance);

    this.authService.getAuthenticatedUser().subscribe(currentUser => {
      this.currentUser = currentUser;
      
      if (this.authService.isStaff(this.currentUser)) {
        this.currentUserRole = 'INTERNSHIP_MANAGER';
        this.editMode = true;
      }
    });

    let dateSoutenance = new Date(this.formatDate(this.soutenance.dateDebut, 'Date'));

    console.log("date soutenance", dateSoutenance);

    this.enseignantsLecteurs = await this.getFreeLecteurs(dateSoutenance, this.soutenance.idReferent, this.soutenance.idPlanning);

    console.log("enseignants lecteur potentiels : ", this.enseignantsLecteurs);

    this.newDate = this.formatDate(this.soutenance.dateDebut, 'Date');
  }

  convertSlotToSoutenance(slot: SlotItem) {
    this.newSoutenance.idSoutenance = slot.id;
    this.newSoutenance.date = new Date(this.formatDate(slot.dateFin, 'Date'));
    this.newSoutenance.nomSalle = slot.salle;
    this.newSoutenance.heureDebut = this.formatDate(slot.dateDebut, 'Heure');
    this.newSoutenance.heureFin = this.formatDate(slot.dateFin, 'Heure');
    this.newSoutenance.idUPPA = slot.idEtudiant;
    this.newSoutenance.idLecteur = slot.idLecteur;
    this.newSoutenance.idPlanning = slot.idPlanning;
  }

  async getFreeLecteurs(jour: Date, idEnseignantReferent: number, idPlanning: number): Promise<Staff[]> {
    let lecteursPotentiels: Staff[] = [];
  
    /**
     * Récupérer le planning et les soutenances pour le jour
     * Faire une liste de lecteurs à ne pas inclure avec
     * Récupérer la liste de tous les enseignants
     */
    let soutenancesJour = await this.loadSoutenancesPlanningJour(idPlanning, jour);

    const idLecteursNonPotentiels = this.getLecteursJour(soutenancesJour);

    console.log("id lecteurs non potentiels : ", idLecteursNonPotentiels);
  
    /**
     * Récupérer l'enseignant référent pour savoir s'il est technique
     * -> S'il est pas technique : l'enseignant lecteur doit être technique
     * -> S'il est technique : l'enseignant lecteur doit pas être technique
     * -> Chaque enseignant lecteur potentiel ne doit pas faire parti de la liste des lecteurs qui sont dans la même journée
     */
    const referentTechnique = this.referentEstTechnique(idEnseignantReferent);
    lecteursPotentiels = this.getAllPotentialLecteurs(idLecteursNonPotentiels);

    //Si le prof référent n'est pas technique, il faut absolument un enseignant lecteur technique
    if (!referentTechnique) {
      lecteursPotentiels = lecteursPotentiels.filter((l) => {
        return l.estTechnique === 1;
      });
    }

    return lecteursPotentiels;
  }

async loadSoutenancesPlanningJour(idPlanning: number, jour: Date): Promise<Soutenance[]> {
  try {
    const allSoutenances = await lastValueFrom(this.soutenanceService.getSoutenances());
    
    const filteredSoutenances = allSoutenances.filter((s) => {

      return s.date?.getDay() === jour?.getDay();
    });

    return filteredSoutenances;
  } catch (error) {
    console.error("Erreur lors du chargement des soutenances : ", error);
    return [];
  }
}

  getAllPotentialLecteurs(idLecteursBlacklist: number[]): Staff[] {
    let potentialTeachers: Staff[] = [];

    this.staffService.getStaffs().subscribe((teachers) => {
      potentialTeachers = teachers;
    });

    const filteredTeachers = potentialTeachers.filter((t) => {
      !idLecteursBlacklist.find(id => id === t.idPersonnel);
    });

    return filteredTeachers;

  }

  async referentEstTechnique(idReferent: number): Promise<boolean> {
  if (idReferent > -1) {
    try {
      const enseignant = await this.staffService.getStaffById(idReferent).toPromise();
      return enseignant?.estTechnique === 1;
    } 
    catch {
      return true;
    }
  } else {
    return true;
  }
}

  getLecteursJour(soutenances: Soutenance[]): number[] {
    let idLecteurs: number[] = [];
    
    for (const soutenance of soutenances) {
      idLecteurs.push(soutenance.idLecteur!);
    }

    return idLecteurs;
  }

  onJourChange(changed_date: string): void {
    this.newDate = changed_date;
  }

  onCancel() {
    this.cancel.emit(); 
  }

  /**
   * Handles form submission by updating the soutenance
   */
  async onSubmit() {
    if (this.isFormValid()) {
      try {
        this.isSubmitting = true;

        const response = await lastValueFrom(
          this.soutenanceService.updateSoutenance(this.newSoutenance)
        );

        console.log('Soutenance mise à jour avec succès : ', response);

        //Redirection vers la page des plannings
        this.router.navigateByUrl('/schedule');

      } catch (error) {
        console.error('Erreur lors de la mise à jour de la soutenance :', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  /**
   * Validates if all required fields in the internship search form are filled correctly
   * @returns Boolean indicating if the form is valid
   */
  isFormValid(): boolean {
    this.newSoutenance.date = new Date(this.newDate);
    this.newSoutenance.heureDebut = this.newSoutenance.heureDebut + ":00";
    this.newSoutenance.heureFin = this.newSoutenance.heureFin + ":00";

    return !!(
      this.newSoutenance.idSoutenance &&
      this.newSoutenance.nomSalle! &&
      this.newSoutenance.date! &&
      this.newSoutenance.heureDebut! &&
      this.newSoutenance.heureFin! &&
      this.newSoutenance.idLecteur!
    );
  }

  formatDate(pDate: Date, modeAffichage: TypeAffichage): string {
        
    if (pDate === null) return "Erreur de récupération de la date";

    const [jourSemaine, mois, jour, annee, heure] = pDate.toDateString().split(' ');
    let date_locale_str = pDate.toLocaleString("fr-FR");

    const [dateStr, heureStr] = date_locale_str.split(' ');
    let moisNb = dateStr.split('/')[1];
    let heure_formattee = heureStr.split(':')[0] + ":" + heureStr.split(':')[1];

    let result;

    switch (modeAffichage) {
      case 'Date':
        result = `${annee}-${moisNb}-${jour}`;
        break;

      case 'Heure':
        result = heure_formattee;
        break;

      case 'DateHeure':
        result = `${annee}-${moisNb}-${jour} ${heure_formattee}`;
        break;

      case 'DateToStr':
        result = `${dateStr}`;
        break;

      case 'HeureToStr':
        result = heureStr.split(':')[0] + "h" + heureStr.split(':')[1];
        break;

      case 'DateHeureToStr':
        result = `le ${dateStr} à ` + heureStr.split(':')[0] + "h" + heureStr.split(':')[1];
        break;
        
      default:
        result = date_locale_str;
        break;
    }

    return result;
  }
}

type TypeAffichage = 
  | 'Date'
  | 'Heure'
  | 'DateHeure'
  | 'DateToStr'
  | 'HeureToStr'
  | 'DateHeureToStr';