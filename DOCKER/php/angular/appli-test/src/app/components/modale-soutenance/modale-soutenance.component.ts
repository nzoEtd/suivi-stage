import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Soutenance } from '../../models/soutenance.model';
import { Staff } from '../../models/staff.model';
import { Company } from '../../models/company.model';
import { CompanyTutor } from '../../models/company-tutor.model';
import { ActivatedRoute } from '@angular/router';
import { SoutenanceService } from '../../services/soutenance.service';
import { firstValueFrom, forkJoin, tap } from 'rxjs';

@Component({
  selector: 'app-modale-soutenance',
  imports: [CommonModule, FormsModule],
  templateUrl: './modale-soutenance.html',
  styleUrl: './modale-soutenance.css',
})
export class ModaleSoutenanceComponent implements OnInit {
  newSoutenance: Soutenance = new Soutenance(); //Contient le jour, heure début, heure fin, enseignant lecteur
  isSubmitting: boolean = false;
  idSoutenance: number = 0;
  soutenanceData?: Soutenance;
  enseignantReferent!: Staff;
  entreprise!: Company;
  tuteurEntreprise!: CompanyTutor;
  newEnseignantLecteur!: Staff;
  enseignantsLecteurs: Staff[] = [];
  allDataLoaded: boolean = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() dataLoaded = new EventEmitter<void>();

    constructor(
      private readonly route: ActivatedRoute,
      private readonly soutenanceService: SoutenanceService
    ) {}

      /**
     * Initializes component data, setting default values and fetching companies
     */
    ngOnInit() {
      /*
        TO-DO :
          - Récupérer la liste des enseignants lecteurs qui peuvent être assignés à la soutenance
      */
        this.idSoutenance = Number(this.route.snapshot.paramMap.get('id'));

        //Récupération des infos de la soutenance
        this.loadData().then(() => {
            this.allDataLoaded = true
        });
    }

    /**
     * Loads soutenance data
     * @returns Promise that resolves when all data is loaded
     */
    loadData() {
        return firstValueFrom(
            forkJoin({
                data: this.soutenanceService.getSoutenanceById(this.idSoutenance)
            }).pipe(
                tap(({ data }) => {
                    this.soutenanceData = data;
                    this.dataLoaded.emit();
                })
            )
        )
    }

    /**
     * Handles form submission by adding new internship search
     */
    async onSubmit() {
        if (this.isFormValid()) {
            try {
                this.isSubmitting = true;

                this.soutenanceService.addSoutenance(this.newSoutenance);

                /*TO-DO
                    - Créer la soutenance
                    - Traiter toutes les salles pour décocher celles qui ne sont pas disponibles
                */
            } catch (error) {
                console.error('Erreur lors de l\'ajout du planning :', error);
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
        return !!(
            this.newSoutenance.idSoutenance &&
            this.newSoutenance.nomSalle! &&
            this.newSoutenance.date! &&
            this.newSoutenance.heureDebut! &&
            this.newSoutenance.heureFin!
        );
    }

    onCancel() {
        this.cancel.emit(); 
    }
}