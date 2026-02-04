import { ChangeDetectorRef, Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { InitService } from '../../services/init.service';
import { LoadingComponent } from '../loading/loading.component';
import { AddUpdateScheduleComponent } from '../add-update-schedule/add-update-schedule.component';
import { ActivatedRoute } from '@angular/router';
import { Planning } from '../../models/planning.model';
import { Observable, forkJoin } from 'rxjs';
import { PlanningService } from '../../services/planning.service';
import { Salle } from '../../models/salle.model';
import { Soutenance } from '../../models/soutenance.model';
import { SalleService } from '../../services/salle.service';
import { SoutenanceService } from '../../services/soutenance.service';
import { StudentService } from '../../services/student.service';
import { StaffService } from '../../services/staff.service';
import { CompanyService } from '../../services/company.service';
import { Student } from '../../models/student.model';
import { Staff } from '../../models/staff.model';
import { Company } from '../../models/company.model';
import { SlotItem } from '../../models/slotItem.model';
import { TimeBlockConfig } from '../../models/timeBlock.model';
import { convertSoutenancesToSlots } from '../../utils/fonctions';
import { getDatesBetween } from '../../utils/timeManagement';
import { CompanyTutor } from '../../models/company-tutor.model';
import { CompanyTutorService } from '../../services/company-tutor.service';
import { StudentStaffAcademicYearService } from '../../services/student-staff-academicYear.service';
import { StudentTrainingYearAcademicYearService } from '../../services/student-trainingYear-academicYear.service';
import { Student_TrainingYear_AcademicYear } from '../../models/student-trainingYear-academicYear.model';
import { AcademicYear } from '../../models/academic-year.model';
import { Student_Staff_AcademicYear_String } from '../../models/student-staff-academicYear-string.model';
import { AcademicYearService } from '../../services/academic-year.service';

@Component({
  selector: 'app-update-schedule',
  imports: [CommonModule, LoadingComponent, AddUpdateScheduleComponent],
  templateUrl: './update-schedule.component.html',
  styleUrls: ['./update-schedule.component.css']
})
export class UpdateScheduleComponent implements AfterViewInit {
  planning$?: Observable<Planning | undefined>;
  salle$!: Observable<Salle[]>;
  soutenance$!: Observable<Soutenance[]>;

  allSoutenances: Soutenance[] = [];
  allStudents: Student[] = [];
  allStaff: Staff[] = [];
  allCompanies: Company[] = [];
  allTutors: CompanyTutor[] = [];
  allTrainingAcademicYears: Student_TrainingYear_AcademicYear[] = [];
  allAcademicYears: AcademicYear[] = [];
  allReferents: Student_Staff_AcademicYear_String[] = [];
  planning!: Planning;
  id!: number;
  jours: Date[] = [];
  sallesDispo: number[] = [];
  slots: SlotItem[] = [];
  timeBlocks: TimeBlockConfig[] = [];

  currentUser?: any;
  currentUserRole?: string;
  allDataLoaded: boolean = false;

  // isEditModalOpen: boolean = false;
  // selectedSoutenance?: any;

  constructor(
    private readonly authService: AuthService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly initService: InitService,
    private readonly planningService: PlanningService,
    private readonly salleService: SalleService,
    private readonly soutenanceService: SoutenanceService,
    private readonly studentService: StudentService,
    private readonly staffService: StaffService,
    private readonly companyService: CompanyService,
    private readonly tutorService: CompanyTutorService,
    private route: ActivatedRoute,
    private readonly referentService: StudentStaffAcademicYearService,
    private readonly studentTrainingAcademicYearService: StudentTrainingYearAcademicYearService,
    private readonly academicYearService: AcademicYearService
  ) {}

  async ngAfterViewInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.planning$ = this.planningService.getPlanningById(this.id);
    this.soutenance$ = this.soutenanceService.getSoutenances();
    this.salle$ = this.salleService.getSalles();
    const students$ = this.studentService.getStudents();
    const staff$ = this.staffService.getStaffs();
    const companies$ = this.companyService.getCompanies();
    const tutors$ = this.tutorService.getCompanyTutors();
    const studentTrainingAcademicYear$ = this.studentTrainingAcademicYearService.getStudentsTrainingYearsAcademicYears();
    const referent$ = this.referentService.getAllStudentTeachers();
    const academicYear$ = this.academicYearService.getAcademicYears();
    forkJoin({
      salles: this.salle$,
      planning: this.planning$,
      soutenance: this.soutenance$,
      students: students$,
      staff: staff$,
      companies: companies$,
      tutors: tutors$,
      trainingAcademicYears: studentTrainingAcademicYear$,
      referent: referent$,
      academicYear: academicYear$
    }).subscribe(async result => {
        this.planning = result.planning!;
        this.allTutors = result.tutors;
        this.allTrainingAcademicYears = result.trainingAcademicYears;
        this.allAcademicYears = result.academicYear;
        this.allReferents = result.referent;
        this.jours = getDatesBetween(
          this.planning.dateDebut!, 
          this.planning.dateFin!
        );
        console.log("les jours",this.jours)
        this.allSoutenances = (result.soutenance.filter(s => s.idPlanning == this.planning.idPlanning));

        this.sallesDispo = (result.salles.filter(s => s.estDisponible).map(s => s.nomSalle));
        this.allStudents = result.students;
        this.allStaff = result.staff;
        this.allCompanies =result.companies;
        this.slots = await convertSoutenancesToSlots(this.allSoutenances, this.allStudents, this.allStaff, this.allCompanies,this.allTutors, this.allReferents, this.allTrainingAcademicYears, this.planning.idAnneeUniversitaire);
        
        this.allDataLoaded = true;
        this.cdRef.detectChanges(); 
    });
    this.authService.getAuthenticatedUser().subscribe(currentUser => {
      this.currentUser = currentUser;
      
      if (this.authService.isStudent(this.currentUser)) {
        this.currentUserRole = 'STUDENT';
      }
      else if (this.authService.isStaff(this.currentUser)) {
        this.currentUserRole = 'INTERNSHIP_MANAGER';
      }

      this.initService.setInitialized();
    });
  }
}
