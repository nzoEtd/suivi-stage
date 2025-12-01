import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Planning } from '../../models/planning.model';
import { PlanningService } from '../../services/planning.service';
import { TrainingYearService } from '../../services/training-year.service';
import { TrainingYear } from '../../models/training-year.model';
import { Salle } from '../../models/salle.model';
import { SalleService } from '../../services/salle.service';

@Component({
  selector: 'app-modale-planning',
  imports: [CommonModule, FormsModule],
  templateUrl: './modale-planning.html',
  styleUrl: './modale-planning.css',
})
export class ModalePlanningComponent implements OnInit {
  newPlanning: Planning = new Planning();
  isSubmitting: boolean = false;
  promos: TrainingYear[] = [];
  salles: Salle[] = [];
  selectedSalles: Salle[] = [];

  @Output() cancel = new EventEmitter<void>();

  constructor(
    private readonly router: Router,
    private readonly planningService: PlanningService,
    private readonly trainingYearService: TrainingYearService,
    private readonly salleService: SalleService
  ) {}

    /**
     * Initializes component data, setting default values and fetching companies
     */
    ngOnInit() {
        //Récupération des promos
        this.trainingYearService.getTrainingYears(["libelle"])
        .subscribe(promos => {
            this.promos = promos;
        });
        
        //Récupération des salles
        this.salleService.getSalles(["nomSalle"])
        .subscribe(salles => {
            for (const salle of salles)
            {
                if (salle.estDispo)
                {
                    this.salles.push(salle);
                }
            }
        });
    }

    /**
     * Handles form submission by adding new internship search
     */
    async onSubmit() {
        if (this.isFormValid()) {
            try {
                this.isSubmitting = true;

                this.planningService.addPlanning(this.newPlanning);
                
                for (const salle of this.salles) {
                    if (!this.selectedSalles.includes(salle))
                    {
                        salle.estDispo = false;
                        this.salleService.updateSalle(salle);
                    } 
                }
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
            this.newPlanning.id &&
            this.newPlanning.nom!.trim() &&
            this.newPlanning.dateDebut! &&
            this.newPlanning.dateFin! &&
            this.newPlanning.heureDebutMatin! &&
            this.newPlanning.heureDebutAprem! &&
            this.newPlanning.heureFinMatin! &&
            this.newPlanning.heureFinAprem! &&
            this.newPlanning.dureeSoutenance! &&
            this.newPlanning.idAnneeFormation!
        );
    }

    onCancel() {
        this.cancel.emit(); 
    }
}
