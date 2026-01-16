import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Soutenance } from '../../models/soutenance.model';
import { SoutenanceService } from '../../services/soutenance.service';
import { Staff } from '../../models/staff.model';
import { Salle } from '../../models/salle.model';

@Component({
  selector: "app-modale-soutenance",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./modale-soutenance.component.html",
  styleUrl: "./modale-soutenance.component.css",
})

export class ModaleSoutenanceComponent {
  isSubmitting: boolean = false;
  @Input() soutenance!: SlotItem;
  @Input() editMode: boolean = false;
  newSoutenance!: Soutenance;
  enseignantsLecteurs: Staff[] = [];
  @Input() sallesDispo!: Salle[];

  @Output() cancel = new EventEmitter<void>();

    constructor(private readonly soutenanceService: SoutenanceService) {}

    formatDate(pDate: Date, showDate: boolean=false, showHeure: boolean=false): string {
        
        if (pDate === null) return "";

        let date_str = pDate.toLocaleString("fr-FR");
        const [date, heure] = date_str.split(' ');

        if (showDate && !showHeure) {
            return `${date}`;
        }
        else if (!showDate && showHeure) {
            return heure.split(':')[0] + "h" + heure.split(':')[1];
        }
        else {
            return `le ${date} à ` + heure.split(':')[0] + "h" + heure.split(':')[1];
        }
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

                this.soutenanceService.updateSoutenance(this.newSoutenance);

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
        return !!(
            this.newSoutenance.nomSalle! &&
            this.newSoutenance.date! &&
            this.newSoutenance.heureDebut! &&
            this.newSoutenance.heureFin!
        );
    }
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
    tuteur: string;
    salle: number;
}