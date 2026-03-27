import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../loading/loading.component';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department.model';
import { Company } from '../../models/company.model';
import { CompanyTutor } from '../../models/company-tutor.model';
import { FormsModule } from '@angular/forms';
import { StudentTrainingYearAcademicYearService } from '../../services/student-trainingYear-academicYear.service';
import { TrainingYearService } from '../../services/training-year.service';
import { TrainingYear } from '../../models/training-year.model';
import { AcademicYear } from '../../models/academic-year.model';
import { filter, firstValueFrom, forkJoin, Subject } from 'rxjs';
import { DataStoreService } from '../../services/data.service';
import { InitService } from '../../services/init.service';

/**
 * Guide d'ajout d'une nouvelle catégorie :
 * 
 * 1. Ajouter la nouvelle catégorie dans le type Category en bas du fichier
 * 2. Dans loadData(), ajouter un nouvel case et faire appel aux services nécessaires en respectant la même structure nécessaire
 * 3. Dans le case du loadData(), mettre dans cols_labels un tableau des libellés des colonnes qui seront affichées à la tête du tableau
 * 4. Dans tableConfigs, ajouter la configuration du modèle de la catégorie
 * 5. Dans applySearch(), ajouter un nouvel Map pour tout nouvel champ d'une clé étrangère, appelé relation dans ce composant
 * Ajouter le code qui utilise le nouvel Map dans un nouvel case du switch
 * 6. Dans applySort(), ajouter chaque relation dans le if
 * 7. Faire des modifications dans pluralizeLabel() si besoin
 */
@Component({
  selector: 'app-data-category-manager',
  imports: [RouterLink, CommonModule, LoadingComponent, FormsModule],
  templateUrl: './data-category-manager.component.html',
  styleUrl: './data-category-manager.component.css'
})
export default class DataCategoryManagerComponent implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  categorie!: Category;
  fullData: any[] = [];
  data: any[] = [];
  cols: {db_name: string, label: string}[] = [];
  departments: Department[] = [];
  companies: Company[] = [];
  tutors: CompanyTutor[] = [];
  trainingYears: TrainingYear[] = [];
  academicYears: AcademicYear[] = [];
  searchTerm: string = '';
  sortedCols: { name: string; order: SortOrder}[] = [];
  additionalData: any[] = [];
  filters: { name: string; vals: string[] }[] = [];
  selectedFilters: Record<string, any> = {};

  allDataLoaded: boolean = false;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private studentTrainingAcademicYears: StudentTrainingYearAcademicYearService,
    private trainingService: TrainingYearService,
    private departService: DepartmentService,
    private dataStore: DataStoreService,
    private readonly initService: InitService,
    private readonly cdRef: ChangeDetectorRef
  ){};

  ngAfterViewInit() {
    this.route.params.subscribe(async params => {
      this.categorie = params['category'];

      await this.loadData();

      console.log(this.data);
    });

    this.sortedCols = this.cols.map(col => ({ name: col.db_name, order: ' ' }));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  mergeData<T, U>(
    data: T[],
    additionalData: U[],
    mainKey: keyof T,
    additionalKey: keyof U,
  ) : (T & Partial<U>)[] {
    const map = new Map<any, U>(
      additionalData.map(item => [item[additionalKey], item])
    );

    return data.map(item => ({
      ...item,
      ...(map.get(item[mainKey]) || {})
    }));
  }

  /**
   * Load data needed for the component to work properly
   */
  async loadData() {

    let cols_labels;
    let data: any;

    const category = (this.categorie ?? '');
    
    switch(category) {

      case 'etudiants': {
        this.dataStore.ensureDataLoaded([
          'students','companies','tutors','academicYears'
        ]);

        data = await firstValueFrom(
          this.dataStore.data$.pipe(
            filter(d => d.loaded === true && d.loading === false)
          )
        );

        this.fullData = data.students ?? [];
        this.companies = data.companies ?? [];
        this.tutors = data.tutors ?? [];
        this.academicYears = data.academicYears ?? [];

        this.cdRef.detectChanges();

        await firstValueFrom(
          forkJoin({
            deps: this.departService.getDepartments(),
            add: this.studentTrainingAcademicYears.getStudentsTrainingYearsAcademicYears(),
            training: this.trainingService.getTrainingYears()
          })
        ).then(({ deps, training }) => {
          this.departments = deps;
          this.trainingYears = training;
          this.allDataLoaded = true;
          this.cdRef.detectChanges();
        }).catch(err => console.error(err));

        if (this.fullData && this.fullData.length > 0) {
          const merged = this.mergeData(this.fullData, this.additionalData, 'idUPPA', 'idUPPA');
          this.fullData = merged;
          this.data = [...merged];

          const cols_labels = ["ID UPPA", "Login", "Nom", "Prénom", "Adresse", "Ville", "Code postal", "Téléphone", "Adresse mail", "Tier-temps", "Département", "Entreprise", "Tuteur", "Promo"];
          this.initCols(cols_labels);
          this.initFilters();
          this.cdRef.detectChanges();
        }

        this.initService.setInitialized();

        break;
      };

      case 'personnel':
        this.dataStore.ensureDataLoaded(['staff']);

        data = await firstValueFrom(
          this.dataStore.data$.pipe(
            filter(d => d.loaded === true && d.loading === false)
          )
        );

        this.fullData = data.staff ?? [];
        this.data = this.fullData;

        this.allDataLoaded = true;
        this.cdRef.detectChanges();

        cols_labels = [" ", "Login","Rôle(s)", "Nom", "Prénom", "Adresse", "Ville", "Code postal", "Téléphone", "Adresse mail", "Quota étudiant", "Est informaticien"];
        
        this.initCols(cols_labels);
        this.initFilters();

        this.initService.setInitialized();

        break;
        
      case 'salles':
        this.dataStore.ensureDataLoaded(['salles']);

        data = await firstValueFrom(
          this.dataStore.data$.pipe(
            filter(d => d.loaded === true && d.loading === false)
          )
        );

        this.fullData = data.salles ?? [];
        this.data = this.fullData;

        this.allDataLoaded = true;
        this.cdRef.detectChanges();

        cols_labels = ["Numéro", "Est disponible"];
        
        this.initCols(cols_labels);
        this.initFilters();

        this.cdRef.detectChanges();

        this.initService.setInitialized();

        break;
    }

    this.loading = false;
  }

  /**
   * 
   * @param id Data ID
   * @param data Data to search the ID in
   * @returns Label of the corresponding data item
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
      this.applySearch();
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
        relations: ["departement", "entreprise", "tuteur", "trainingYear"]
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

  /**
   * Search the term amongst data and display corresponding data
   */
  applySearch() {
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

  /**
   * Sort a column by set order
   * @param col Column name
   * @param newOrder New order sort
   */
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

  /**
   * Give a sort icon next to the column name depending on its order
   * @param col Column name
   * @returns Icon
   */
  getSortIcon(col: string): string {
    const sort = this.sortedCols.find(s => s.name === col);
    if (!sort) return ' ';
    if (sort.order === 'asc') return '▲';
    if (sort.order === 'desc') return '▼';
    else return ' ';
  }

  /**
   * Sort the col data in the next order (if no sort -> asc, if asc -> desc, if desc -> no sort)
   * @param col Col object containing its database name and its label
   */
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

  /**
   * Initialize columns on the table
   * @param labels Column labels
   */
  initCols(labels: string[]) {
    if (!labels) labels = [];

    const data = [...this.data];

    this.cols = Object.keys(data[0])
    .filter(key => key !== 'longitudeAdresse' && key !== 'latitudeAdresse' && key !== 'idAnneeUniversitaire')
    .map((key, i) => ({
      db_name: key,
      label: labels[i] ?? key
    }));

    this.cols.map((col) => {this.sortedCols.push({name: col.db_name, order: ' '})});
  }

  /**
   * Initialize filters
   */
  initFilters() {
    this.filters = this.cols.map((col) => {
      const champ = col;
      const vals = this.data.map((item) => item[champ.db_name]).filter(v => v !== null && v !== undefined);

      const options = [...new Set(vals)];

      return {
        name: champ.label,
        vals: options
      };
    });

    if (this.categorie === "personnel") this.filters = this.filters.slice(1);

    this.filters.map((filter) => {
      this.selectedFilters[filter.name] = "";
    })
  }

  /**
   * Apply selected filters to data
   */
  applyFilters() {
    let filteredData = [...this.fullData];

    for (const [key, value] of Object.entries(this.selectedFilters)) {
      if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) continue;

      const field = this.cols.find((col) => col.label === key);
      
      if (!field) continue;

      const dbKey = field.db_name;

      filteredData = filteredData.filter((item) => {
        const valData = item[dbKey];

        return String(value) === String(valData);
      });
    }

    this.data = filteredData;
  }

  /**
   * Retourne le pluriel du label de filtre
   * @param label Nom du filtre
   * @returns Pluriel du nom
   */
  pluralizeLabel(label: string): string {

    if (!label) return "";
    var [first, last] = label.split(' ');
    let newString = "";

    first = (first.endsWith('s') || first.endsWith('(s)') || first === 'Est') ? first : first + 's';

    if (last) {
      last = last.endsWith('al') ? last.replace('al', 'aux') : last;

      newString = first + ' ' + last;
    }
    else {
      newString = first;
    }
    
    return newString;
  }
}

type Category = "etudiants" | "personnel" | "salles";
type SortOrder = ' ' | 'asc' | 'desc';