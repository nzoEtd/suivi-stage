import { ChangeDetectorRef, Component } from '@angular/core';
import { Salle } from '../../models/salle.model';
import { Student } from '../../models/student.model';
import { Staff } from '../../models/staff.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { StaffService } from '../../services/staff.service';
import { SalleService } from '../../services/salle.service';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../loading/loading.component';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department.model';
import { CompanyService } from '../../services/company.service';
import { CompanyTutorService } from '../../services/company-tutor.service';
import { Company } from '../../models/company.model';
import { CompanyTutor } from '../../models/company-tutor.model';

@Component({
  selector: 'app-data-category-manager',
  imports: [RouterLink, CommonModule, LoadingComponent],
  templateUrl: './data-category-manager.component.html',
  styleUrl: './data-category-manager.component.css'
})
export class DataCategoryManagerComponent {
  categorie: string = '';
  data: Student[] | Staff[] | Salle[] = [];
  cols: string[] = [];
  cols_labels: string[] = [];
  departments: Department[] = [];
  companies: Company[] = [];
  tutors: CompanyTutor[] = [];

  loading: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private staffService: StaffService,
    private salleService: SalleService,
    private departService: DepartmentService,
    private entrepriseService: CompanyService,
    private tuteurService: CompanyTutorService,
    private readonly cdRef: ChangeDetectorRef
  ){};

  ngOnInit() {
    this.route.params.subscribe(async params => {
      this.categorie = params['category'];

      await this.loadData();
    });
  }

  async loadData() {
    this.loading = true;
    
    switch(this.categorie) {
      case 'etudiants':
        //Récupération de données liées aux étudiants
        this.departService.getDepartments().subscribe({
          next: (data) => {
            this.departments = data;
            this.cdRef.detectChanges();
          },
          error: (err) => {
            console.error('Error loading departements:', err);
            this.loading = false;
          }
        });
        this.entrepriseService.getCompanies().subscribe({
          next: (data) => {
            this.companies = data;
            this.cdRef.detectChanges();
          },
          error: (err) => {
            console.error('Error loading entreprises:', err);
            this.loading = false;
          }          
        });
        this.tuteurService.getCompanyTutors().subscribe({
          next: (data) => {
            this.tutors = data;
            this.cdRef.detectChanges();
          },
          error: (err) => {
            console.error('Error loading tuteurs:', err);
            this.loading = false;
          }          
        });

        //Récupération des étudiants
        this.studentService.getStudents().subscribe({
          next: (data) => {
            this.data = data;
            
            if (this.data.length > 0) {
              this.cols = Object.keys(this.data[0]);
              this.cols_labels = [" ", "Login", "Nom", "Prénom", "Adresse", "Ville", "Code postal", "Téléphone", "Adresse mail", "Tier-temps", "Département", "Entreprise", "Tuteur"];
            }

            this.loading = false;
            this.cdRef.detectChanges();
          },
          error: (err) => {
            console.error('Error loading etudiants:', err);
            this.loading = false;
          }
        });

        break;

      case 'personnel':
        this.staffService.getStaffs().subscribe({
          next: (data) => {
            this.data = data;

            if (this.data.length > 0) {
              this.cols = Object.keys(this.data[0]);
              this.cols_labels = [" ", "Login", "Rôle(s)", "Nom", "Prénom", "Adresse", "Ville", "Code postal", "Téléphone", "Adresse mail", "Quota étudiant", "Est informaticien"];
            }

            this.loading = false;
            this.cdRef.detectChanges();
          },
          error: (err) => {
            console.error('Error loading personnel:', err);
            this.loading = false;
          }
        });
        break;
        
      case 'salles':
        this.salleService.getSalles().subscribe({
          next: (data) => {
            this.data = data;

            if (this.data.length > 0) {
              this.cols = Object.keys(this.data[0]);
              this.cols_labels = ["Numéro", "Est disponible"];
            }

            this.loading = false;
            this.cdRef.detectChanges();
          },
          error: (err) => {
            console.error('Error loading salles:', err);
            this.loading = false;
          }
        });
        break;
    }
  }

  /**
   * 
   * @param id Identifiant 
   * @param data Données fournies
   * @returns 
   */
  getLibelleByIdAndData(id: number, data: any[]): string {
    let found_data = data.find((line) => Object.values(line)[0] === id);

    console.log(found_data);

    if (found_data) return found_data.libelle || found_data.nom || found_data.raisonSociale;

    return id.toString();
  }
}