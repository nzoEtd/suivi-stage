import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Soutenance } from '../../models/soutenance.model';
import { Staff } from '../../models/staff.model';
import { SlotItem } from '../../models/slotItem.model';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: "app-modale-soutenance",
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: "./modale-soutenance.component.html",
  styleUrl: "./modale-soutenance.component.css",
})

export class ModaleSoutenanceComponent implements OnInit {
  //Loading
  isDataLoaded: boolean = false;
  isSubmitting: boolean = false;

  //Paramètres de la modale
  @Input() soutenance!: SlotItem;
  @Input() editMode: boolean = false;
  @Input() sallesDispo!: number[];
  @Input() soutenancesJour: Record<string, SlotItem[]>;
  
  //Infos de la soutenance
  newSoutenance: Soutenance = new Soutenance();
  dateSoutenance: string = '';
  heureDebutS: string = '';
  heureFinS: string = '';
  enseignantsLecteurs: Staff[] = [];
  datesAcceptees: string[] = [];
  newDate!: string;
  allStaff: Staff[] = [];

  //Ce que la modale renvoie
  @Output() cancel = new EventEmitter<void>();

  constructor() {}

  async ngOnInit(): Promise<void> {
    this.newSoutenance = this.convertSlotToSoutenanceData(this.soutenance);
    
    this.allStaff = this.soutenance.allStaff;
    
    this.datesAcceptees = Object.keys(this.soutenancesJour);

    this.dateSoutenance = this.formatDate(this.soutenance.dateDebut, 'Date');

    const i = this.datesAcceptees.findIndex(d => d === this.dateSoutenance);
    if (i !== -1) {
      this.datesAcceptees.splice(i, 1);
    }

    this.heureDebutS = this.formatDate(this.soutenance.dateDebut, 'Heure');
    this.heureFinS = this.formatDate(this.soutenance.dateFin, 'Heure');

    this.enseignantsLecteurs = this.getFreeLecteurs(this.soutenance.idReferent, this.dateSoutenance);

    this.newDate = this.dateSoutenance;

    this.isDataLoaded = true;
  }

  convertSlotToSoutenanceData(slot: SlotItem): Soutenance {

    const soutenanceData: Soutenance = {
      idSoutenance: slot.id,
      date: new Date(this.formatDate(slot.dateFin, 'Date')),
      nomSalle: slot.salle,
      heureDebut: this.formatDate(slot.dateDebut, 'Heure'),
      heureFin: this.formatDate(slot.dateFin, 'Heure'),
      idUPPA: slot.idEtudiant,
      idLecteur: slot.idLecteur,
      idPlanning: slot.idPlanning
    };

    return soutenanceData;
  }

  /**
   * Retourne une liste des enseignants qui peuvent remplacer l'enseignant lecteur actuel
   * @param idEnseignantReferent 
   * @param dateSoutenance 
   * @returns Staff[]
   */
  getFreeLecteurs(idEnseignantReferent: number, dateSoutenance: string): Staff[] {
    /*
     * Récupérer les soutenances pour le jour
     * Faire une liste de lecteurs à ne pas inclure avec
     * Faire une liste finale des enseignants qui peuvent remplacer
     */
    let soutenancesDuJour = this.soutenancesJour[dateSoutenance];

    const idLecteursNonPotentiels = this.getLecteursNonDispo(soutenancesDuJour);
  
    /**
     * Récupérer l'enseignant référent pour savoir s'il est technique
     * -> S'il est pas technique : l'enseignant lecteur doit être technique
     * -> S'il est technique : l'enseignant lecteur doit pas être technique
     * -> Chaque enseignant lecteur potentiel ne doit pas faire parti de la liste des lecteurs qui sont dans la même journée
     */
    const referentTechnique = this.referentEstTechnique(idEnseignantReferent);
    var lecteursPotentiels: Staff[] = this.getAllPotentialLecteurs(idLecteursNonPotentiels);

    //Si le prof référent n'est pas technique, il faut absolument un enseignant lecteur technique
    if (!referentTechnique) {
      lecteursPotentiels = lecteursPotentiels.filter((l) => l.estTechnique === 1);
    }
  
    lecteursPotentiels = lecteursPotentiels.filter((l) => this.soutenance.idReferent !== l.idPersonnel);

    return lecteursPotentiels;
  }

  /**
   * Retourne une liste d'identifiants d'enseignants qui ne peuvent pas remplacer le lecteur de la soutenance
   * @param soutenances 
   * @returns number[]
   */
  getLecteursNonDispo(soutenances: SlotItem[]): number[] {

    /**
     * Pour qu'un enseignant ne soit pas en capacité d'en remplacer un autre, 
     * l'heure de fin de sa soutenance doit être inférieure ou égale à l'heure de fin de la soutenance
     * et il ne doit pas être l'enseignant référent ou lecteur actuel de la soutenance
     */
    const heureFin = this.soutenance.dateFin;
    const heureDebut = this.soutenance.dateDebut;

    var idEnseignants: number[] = [];

    for (const s of soutenances) {
      const finS = s.dateFin;
      const debutS = s.dateDebut;

      if (finS >= heureDebut && heureFin >= debutS)
      {
        idEnseignants.push(s.idLecteur);
        idEnseignants.push(s.idReferent);
      }
    }

    idEnseignants = idEnseignants.filter((id, index, tab) => tab.indexOf(id) === index); //Supprime les doublons

    return idEnseignants;
  }

  referentEstTechnique(idReferent: number): boolean {
    if (idReferent > -1) {
      const enseignant = this.allStaff.find(s => s.idPersonnel === idReferent);
      return enseignant?.estTechnique === 1;
    }
    return true;
  }

  getAllPotentialLecteurs(idLecteursBlacklist: number[]): Staff[] {
    if (idLecteursBlacklist.length === 0) return this.allStaff;
    
    return this.allStaff.filter((t) =>
      idLecteursBlacklist.every((lecteur) =>
        lecteur !== t.idPersonnel
    ));
  }

  onJourChange(changed_date: string): void {
    this.newDate = changed_date;
  }

  onCancel() {
    this.cancel.emit(); 
  }

  /**
   * Handles form submission by updating soutenancesJour
   */
  async onSubmit() {
    if (this.isFormValid()) {
      this.isSubmitting = true;

      let dateChange = false;
      let currentSoutenanceDate = this.formatDate(this.soutenance.dateDebut, 'Date');
      let newSoutenanceDate = this.formatDate(this.newSoutenance.date!, 'Date');

      if (this.newSoutenance.idSoutenance === this.soutenance.id) {

        //heureDebut, heureFin & jour
        if (this.newSoutenance.heureDebut !== this.formatDate(this.soutenance.dateDebut, 'Heure') || 
            this.newSoutenance.heureFin !== this.formatDate(this.soutenance.dateFin, 'Heure'))
        {
          let dateDebut = this.formatDate(this.newSoutenance.date!, 'Date') + " " + this.newSoutenance.heureDebut;
          let dateFin = this.formatDate(this.newSoutenance.date!, 'Date') + " " + this.newSoutenance.heureFin;
          this.soutenance.dateDebut = new Date(dateDebut);
          this.soutenance.dateFin = new Date(dateFin);

          if (currentSoutenanceDate !== newSoutenanceDate)
          {
            dateChange = true;
          }
        }
        //Lecteur
        if (this.newSoutenance.idLecteur !== this.soutenance.idLecteur)
        {
          this.soutenance.idLecteur = this.newSoutenance.idLecteur!;
          this.soutenance.lecteur = this.getTeacherName(this.newSoutenance.idLecteur!);
        }
        //Salle
        if (this.newSoutenance.nomSalle = this.soutenance.salle)
        {
          this.soutenance.salle = this.newSoutenance.nomSalle;
        }
      }

      for (var slotsTab of Object.values(this.soutenancesJour)) {
        const i = slotsTab.findIndex(soutenance => soutenance.id === this.soutenance.id);
        //Si la date n'a pas changée, je mets à jour les infos de la soutenance dans le tableau
        if (i !== -1 && !dateChange) {
          const soutenanceAMaj = this.soutenancesJour[newSoutenanceDate].find(s => s.id === this.soutenance.id);
          if (soutenanceAMaj) {
            Object.assign(soutenanceAMaj, this.soutenance);
          }
          break;
        }
        //Si la date a changé, on enlève la soutenance de la liste des soutenances du jour et on la met dans la liste des soutenances du nouveau jour
        if (i !== -1 && dateChange)
        {
          this.soutenancesJour[currentSoutenanceDate].splice(i, 1);
          this.soutenancesJour[newSoutenanceDate].push(this.soutenance);
          break;
        }
      }

      console.log(this.soutenancesJour);

      this.isSubmitting = false;
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
    this.newSoutenance.idLecteur = parseInt(this.newSoutenance.idLecteur!.toString());

    return !!(
      this.newSoutenance.idSoutenance &&
      this.newSoutenance.nomSalle! &&
      this.newSoutenance.date! &&
      this.newSoutenance.heureDebut! &&
      this.newSoutenance.heureFin! &&
      this.newSoutenance.heureDebut! < this.newSoutenance.heureFin! &&
      this.newSoutenance.idLecteur!
    );
  }

  getTeacherName(id: number): string {

    const lecteur = this.allStaff.find(s => s.idPersonnel == id);

    if (lecteur) {
      return lecteur.prenom![0] + ". " + lecteur.nom!;
    } 
    else {
      throw new Error("Enseignant non trouvé.");
    }
  }

  formatStringDate(pDate: string): string {
    if (pDate === null) return "Erreur de récupération de la date";
    
    const [annee, mois, jour] = pDate.split('-');

    return `${jour}/${mois}/${annee}`;
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