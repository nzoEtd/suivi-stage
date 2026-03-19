import { ChangeDetectorRef, Component } from '@angular/core';
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
  cols: {db_name: string, label: string}[] = [];
  departments: Department[] = [];
  companies: Company[] = [];
  tutors: CompanyTutor[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  sortedCols: { name: string; order: SortOrder}[] = []

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

    //Loading sortedCols
    this.sortedCols = this.cols.map(col => ({ name: col.db_name, order: ' ' }));
  }

  /**
   * Load data needed for the component to work properly
   */
  async loadData() {
    this.loading = true;

    let cols_labels: string[];
    
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
              cols_labels = ["ID UPPA", "Login", "Nom", "Prénom", "Adresse", "Ville", "Code postal", "Téléphone", "Adresse mail", "Tier-temps", "Département", "Entreprise", "Tuteur"];
              this.initCols(cols_labels);
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
              cols_labels = [" ", "Login", "Rôle(s)", "Nom", "Prénom", "Adresse", "Ville", "Code postal", "Téléphone", "Adresse mail", "Quota étudiant", "Est informaticien"];
              this.initCols(cols_labels);
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
              cols_labels = [" ", "Est disponible"];
              this.initCols(cols_labels);
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
   * @returns Le libellé correspondant à id ou l'identifiant en string si le libellé n'a pas été trouvé
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

  applySort(col: string, newOrder: SortOrder) {
    this.sortedCols.find(s => s.name === col);

    this.sortedCols.map((sortedCol) => {
      if (sortedCol.name === col) {
        sortedCol.order = newOrder;
      }
    });

    this.cdRef.detectChanges();

    if (newOrder !== ' ')
    {
    this.data = [...this.data].sort((a, b) => {
      let aVal = a[col];
      let bVal = b[col];

      if (col === "idDepartement") {
        aVal = this.getLibelleByIdAndData(aVal, this.departments);
        bVal = this.getLibelleByIdAndData(bVal, this.departments);
      }
      else if (col === "idEntreprise") {
        aVal = this.getLibelleByIdAndData(aVal, this.companies);
        bVal = this.getLibelleByIdAndData(bVal, this.companies);        
      }
      else if (col === "idTuteur") {
        aVal = this.getLibelleByIdAndData(aVal, this.tutors);
        bVal = this.getLibelleByIdAndData(bVal, this.tutors);        
      }
      else if (col === "tierTemps" || col === "estDisponible" || col === "estTechnique") {
        aVal === 1 ? "Oui" : "Non";
        bVal === 1 ? "Oui" : "Non";        
      }
      
      let comparison = 0;
      
      //One or both compared values are false
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      
      /**
       * Comparisons :
       *  Number
       *  String
       *  //Date
       *  Boolean
       *  Default
       */
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      }

      else if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      }

      // else if (aVal instanceof Date && bVal instanceof Date) {
      //   comparison = aVal.getTime() - bVal.getTime();
      // }

      else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        comparison = (aVal === bVal) ? 0 : aVal ? 1 : -1;
      }

      else {
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;
      }
      
      return newOrder === 'asc' ? comparison : -comparison;
      });
    }
    else {
      this.data = this.fullData;
    }

  }

  getSortIcon(col: string): string {
    const sort = this.sortedCols.find(s => s.name === col);
    if (!sort) return ' ';
    if (sort.order === 'asc') return '▲';
    if (sort.order === 'desc') return '▼';
    else return ' ';
  }

  sortCol(col: {db_name: string, label: string}) {
      const colFound = this.sortedCols.find(s => s.name === col.db_name);

      const oldSort = colFound?.order;
      let newOrder: SortOrder = ' ';
        
      if (oldSort === ' ') {
        newOrder = 'asc';
      }
      else if (oldSort === 'asc') {
        newOrder = 'desc';
      }
      else {
        newOrder = ' ';
      }
      
      this.applySort(col.db_name, newOrder);
    }

  initCols(labels: string[]) {
    this.cols = Object.keys(this.data[0])
    .filter(key => key !== 'longitudeAdresse' && key !== 'latitudeAdresse')
    .map((key, i) => ({
      db_name: key,
      label: labels[i] ?? key
    }));
    this.cols.map((col) => {this.sortedCols.push({name: col.db_name, order: ' '})});
  }
}

type Category = "etudiants" | "personnel" | "salles";
type SortOrder = ' ' | 'asc' | 'desc';