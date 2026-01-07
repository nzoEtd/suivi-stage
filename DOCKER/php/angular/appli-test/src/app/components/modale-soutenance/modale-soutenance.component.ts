import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Soutenance } from '../../models/soutenance.model';
import { Staff } from '../../models/staff.model';
import { Company } from '../../models/company.model';
import { CompanyTutor } from '../../models/company-tutor.model';
import { SoutenanceService } from '../../services/soutenance.service';
import { StaffService } from '../../services/staff.service';
import { CompanyTutorService } from '../../services/company-tutor.service';
import { CompanyService } from '../../services/company.service';
import { SalleService } from '../../services/salle.service';
import { StudentStaffAcademicYearService } from '../../services/student-staff-academicYear.service';
import { PlanningService } from '../../services/planning.service';
import { Planning } from '../../models/planning.model';
import { StudentTrainingYearAcademicYearService } from '../../services/student-trainingYear-academicYear.service';
import { Student } from '../../models/student.model';
import { StudentService } from '../../services/student.service';
import { Salle } from '../../models/salle.model';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: "app-modale-soutenance",
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: "./modale-soutenance.component.html",
  styleUrl: "./modale-soutenance.component.css",
})

export class ModaleSoutenanceComponent implements OnInit {
  isSubmitting: boolean = false;
  dataLoaded: boolean = false;
  @Input() idSoutenance!: number;
  soutenanceData!: Soutenance | any;
  planning!: Planning | any;
  academicYearId!: number | any;
  etudiant!: Student | any;
  idEnseignantReferent!: number | any;
  enseignantReferent!: Staff | any;
  entreprise!: Company | any;
  tuteurEntreprise!: CompanyTutor | any;
  enseignantLecteur!: Staff | any;
  //enseignantsLecteurs: Staff[] = [];
  //sallesDisponibles: Salle[] = [];

  @Output() cancel = new EventEmitter<void>();

    constructor(
        private readonly soutenanceService: SoutenanceService,
        private readonly planningService: PlanningService,
        private readonly studentTrainingAcademicService: StudentTrainingYearAcademicYearService,
        private readonly studentService: StudentService,
        private readonly salleService: SalleService,
        private readonly attributionReferent: StudentStaffAcademicYearService,
        private readonly staffService: StaffService,
        private readonly tuteurService: CompanyTutorService,
        private readonly entrepriseService: CompanyService
    ) {}

    /**
     * Initializes component data, setting default values and fetching companies
    */
    ngOnInit() {
        //Récupération des infos de la soutenance
        if (this.idSoutenance) {
            this.loadSoutenanceData();
        }
    }

    formatDate(date_str: string): string {

        const [year, month, day] = date_str.split('-');
        return `${day}/${month}/${year}`;
    }

    loadSoutenanceData() {
        this.soutenanceService
            .getSoutenanceById(this.idSoutenance)
            .subscribe({
                next: (soutenance) => {
                    this.soutenanceData = soutenance;
                    
                    this.loadStudentData();
                    
                    this.loadLecteurData();
                    
                    this.loadReferentData();
                },
                error: (err) => console.error('Erreur durant la récupération des informations de la soutenance :', err)
        }); 
    };

    async loadStudentData() {
        this.studentService
        .getStudentById(this.soutenanceData.idUPPA)
        .subscribe({
            next: (etudiant) => {
                this.etudiant = etudiant;
                this.loadCompanyData();
                this.loadTuteurData();
            },
            error: (err) => console.error('Erreur durant la récupération des informations de l\'étudiant :', err)
        });
    }

    async loadReferentData() {
        //Récupération des infos du planning pour récupérer l'année de formation
        this.planningService
            .getPlanningById(this.soutenanceData.idPlanning)
            .subscribe({
                next: (planning) => {
                    this.planning = planning;
                    this.academicYearId = this.planning.idAnneeFormation - 1;
                    
                    this.attributionReferent
                        .getTutorByUppaAndYear(
                            this.soutenanceData.idUPPA, 
                            this.academicYearId
                        )
                        .subscribe({
                            next: (tutor) => {
                                this.idEnseignantReferent = tutor?.idPersonnel;
                                
                                this.staffService
                                    .getStaffById(this.idEnseignantReferent)
                                    .subscribe({
                                        next: (enseignant) => {
                                            this.enseignantReferent = enseignant;
                                        },
                                        error: (err) => console.error('Erreur durant la récupération des informations de l\'enseignant référent :', err)
                                    });
                            },
                            error: (err) => console.error('Erreur durant la récupération des informations du tuteur :', err)
                        });
                    },
                error: (err) => console.error('Erreur durant la récupération des informations du planning :', err)
            })
    };

    async loadLecteurData() {
        this.staffService
            .getStaffById(this.soutenanceData.idLecteur)
            .subscribe({
                next: (enseignant) => this.enseignantLecteur = enseignant,
                error: (err) => console.error('Erreur durant la récupération des informations de l\'enseignant lecteur : ', err)
        });
    }

    async loadCompanyData() {
        if (!this.etudiant.idEntreprise) return;
    
        this.entrepriseService.getCompanyById(this.etudiant.idEntreprise)
        .subscribe({
            next: (entreprise) => this.entreprise = entreprise,
            error: (err) => console.error('Erreur durant la récupération de l\'entreprise : ', err)
        });
    }

    loadTuteurData() {
        //Récupération du tuteur
        this.tuteurService
            .getCompanyTutorById(this.etudiant.idTuteur)
            .subscribe((tuteur) => {
                this.tuteurEntreprise = tuteur;
            });

        this.dataLoaded = true;
    }

    /**
     * Handles form submission by updating the soutenance
     */
    async onSubmit() {
        if (this.isFormValid()) {
            try {
                this.isSubmitting = true;

                this.soutenanceService.updateSoutenance(this.soutenanceData);

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
            this.soutenanceData.id &&
            this.soutenanceData.nomSalle!.trim() &&
            this.soutenanceData.date! &&
            this.soutenanceData.heureDebut! &&
            this.soutenanceData.heureFin!
        );
    }

    onCancel() {
        this.cancel.emit(); 
    }
}