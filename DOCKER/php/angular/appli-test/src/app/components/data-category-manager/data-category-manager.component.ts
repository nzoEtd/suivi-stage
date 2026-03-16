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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-category-manager',
  imports: [RouterLink, CommonModule, LoadingComponent, FormsModule],
  templateUrl: './data-category-manager.component.html',
  styleUrl: './data-category-manager.component.css'
})
export class DataCategoryManagerComponent {
  categorie!: Category;
  fullData: any[] = [];
  data: any[] = [];
  cols: string[] = [];
  cols_labels: string[] = [];
  departments: Department[] = [];
  companies: Company[] = [];
  tutors: CompanyTutor[] = [];
  searchTerm: string = '';
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

  /**
   * Load data needed for the component to work properly
   */
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
            this.fullData = data;
            
            if (this.data.length > 0) {
              this.cols = Object.keys(this.data[0]);
              this.cols_labels = ["ID UPPA", "Login", "Nom", "Prénom", "Adresse", "Ville", "Code postal", "Téléphone", "Adresse mail", "Tier-temps", "Département", "Entreprise", "Tuteur"];
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
            this.fullData = data;

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
            this.fullData = data;

            if (this.data.length > 0) {
              this.cols = Object.keys(this.data[0]);
              this.cols_labels = [" ", "Est disponible"];
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

    if (found_data) return found_data.libelle || found_data.nom || found_data.raisonSociale;

    return id.toString();
  }

  /**
   * Handles search input changes
   * Triggers debounced search term subject
   * @param event Input event containing the search term
   */
  onSearchTermChange(event: Event) {
    const target = event.target as HTMLInputElement;

    if (target) {
      this.searchTerm = target.value;
      this.applyFilters();
    }
  }

  /**
   * Resets the search term and triggers a new search
   */
  clearSearchTerm() {
    this.data = this.fullData;

    this.searchTerm = '';
  }

  tableConfigs: {
  etudiants: { searchFields: string[]; relations: string[] };
  personnel: { searchFields: string[]; relations: string[] };
  salles: { searchFields: string[]; relations: string[] };
  } = {
    etudiants: {
      searchFields: ["idUPPA", "login", "nom", "prenom", "adresse", "ville", "codePostal", "telephone", "adresseMail"],
      relations: ["departement", "entreprise", "tuteur"]
    },
    personnel: {
      searchFields: ["login", "nom", "prenom", "adresse", "ville", "codePostal", "telephone", "adresseMail", "quotaEtudiant"],
      relations: []
    },
    salles: {
      searchFields: ["nomSalle"],
      relations: []
    }
  };

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.data = this.fullData;
      return;
    }

    const config = this.tableConfigs[this.categorie];

    const deptMap = config.relations.includes("departement")
      ? new Map(this.departments.map(d => [d.idDepartement, d.libelle.toLowerCase()]))
      : new Map();

    const compMap = config.relations.includes("entreprise")
      ? new Map(this.companies.map(c => [c.idEntreprise, c.raisonSociale!.toLowerCase()]))
      : new Map();

    const tutorMap = config.relations.includes("tuteur")
      ? new Map(this.tutors.map(t => [t.idTuteur, t.nom.toLowerCase()]))
      : new Map();

    this.data = this.fullData.filter(item => {

      const fieldValMatch = config.searchFields.some(field => {
        const value = item[field];
        return value?.toString().toLowerCase().includes(term);
      });

      const relationValMatch = config.relations.some(rel => {
        switch (rel) {
          case "departement":
            return deptMap.get(item.idDepartement)?.includes(term);
          case "entreprise":
            return compMap.get(item.idEntreprise)?.includes(term);
          case "tuteur":
            return tutorMap.get(item.idTuteur)?.includes(term);
          default:
            return false;
        }
      });

      return fieldValMatch || relationValMatch;
    });
  }
}

type Category = "etudiants" | "personnel" | "salles";