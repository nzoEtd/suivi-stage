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
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private staffService: StaffService,
    private salleService: SalleService,
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
        this.studentService.getStudents().subscribe({
          next: (data) => {
            this.data = data;
            
            if (this.data.length > 0) {
              this.cols = Object.keys(this.data[0]);
              this.cols_labels = ["Identifiant", "Login", "Nom", "Prénom", "Adresse", "Ville", "Code postal", "Téléphone", "Adresse mail", "Tier-temps", "ID Département", "ID Entreprise", "ID Tuteur"];
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
              this.cols_labels = ["Identifiant", "Login", "Rôle(s)", "Nom", "Prénom", "Adresse", "Ville", "Code postal", "Téléphone", "Adresse mail", "Longitude adresse", "Latitude adresse", "Quota étudiant", "Est technique"];
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

    console.log(this.data);
    console.log(this.cols);
  }

  capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}


