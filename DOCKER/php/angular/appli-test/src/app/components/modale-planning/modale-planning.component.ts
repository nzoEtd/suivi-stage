import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Planning } from "../../models/planning.model";
import { PlanningService } from "../../services/planning.service";
import { TrainingYearService } from "../../services/training-year.service";
import { TrainingYear } from "../../models/training-year.model";
import { Salle } from "../../models/salle.model";
import { SalleService } from "../../services/salle.service";
import {
  addDays,
  minutesToHHMM,
  timeStringToMinutes,
} from "../../utils/timeManagement";
import { Soutenance } from "../../models/soutenance.model";
import { AcademicYearService } from "../../services/academic-year.service";
import { forkJoin } from "rxjs";

@Component({
  selector: "app-modale-planning",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./modale-planning.component.html",
  styleUrls: ["./modale-planning.component.css"],
})
export class ModalePlanningComponent implements OnInit {
  newPlanning: Planning = new Planning();
  isSubmitting: boolean = false;
  promos: TrainingYear[] = [];
  salles: Salle[] = [];
  selectedSalles: Salle[] = [];
  currentAcademicYearId!: number;
  dropdownOpen: boolean = false;

  @Output() cancel = new EventEmitter<void>();

  constructor(
    private readonly router: Router,
    private readonly planningService: PlanningService,
    private readonly trainingYearService: TrainingYearService,
    private readonly salleService: SalleService,
    private readonly academicYearService: AcademicYearService
  ) {}

  ngOnInit() {
    forkJoin({
      promos: this.trainingYearService.getTrainingYears(["libelle"]),
      salles: this.salleService.getSalles(),
      academicYear: this.academicYearService.getCurrentAcademicYear(),
    }).subscribe(({ promos, salles, academicYear }) => {
      this.promos = promos;
      this.salles = salles.filter((s) => s.estDisponible);
      this.selectedSalles = [...this.salles];
      if (academicYear) {
        this.currentAcademicYearId = academicYear.idAnneeUniversitaire;
      }
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onSalleToggle(event: Event, salle: Salle) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedSalles.push(salle);
    } else {
      this.selectedSalles = this.selectedSalles.filter((s) => s !== salle);
    }
  }

  get selectedSallesText(): string {
    return this.selectedSalles.length > 0
      ? this.selectedSalles.map((s) => s.nomSalle).join(", ")
      : "-- Sélectionner --";
  }

  /**
   * Handles form submission by adding new internship search
   */
  async onSubmit() {
    console.log("onsubmit", this.isFormValid());
    if (this.isFormValid()) {
      try {
        this.isSubmitting = true;
        const startMorningMinutes = timeStringToMinutes(
          this.newPlanning.heureDebutMatin!
        );
        const endMorningMinutes = timeStringToMinutes(
          this.newPlanning.heureFinMatin!
        );
        const startAfternoonMinutes = timeStringToMinutes(
          this.newPlanning.heureDebutAprem!
        );
        const endAfternoonMinutes = timeStringToMinutes(
          this.newPlanning.heureFinAprem!
        );

        this.planningService
          .runAlgorithmPlanning(
            startMorningMinutes,
            endMorningMinutes,
            startAfternoonMinutes,
            endAfternoonMinutes,
            this.newPlanning.dureeSoutenance!,
            this.newPlanning.dureeSoutenance! * 1.3,
            5, //break
            20 * 60, //tps profs
            this.selectedSalles,
            this.newPlanning.idAnneeFormation!,
            this.currentAcademicYearId
          )
          .subscribe({
            next: (result: any) => {
              if (result.status === "success") {
                const parsed = JSON.parse(result.output) as any[];
                const soutenances: Soutenance[] = parsed.map((item) => ({
                  idSoutenance: -1,
                  date: addDays(this.newPlanning.dateDebut!, item.date),
                  nomSalle: Number(item.nomSalle),
                  heureDebut: minutesToHHMM(item.heureDebut),
                  heureFin: minutesToHHMM(item.heureFin),
                  idUPPA: item.idUPPA.toString(),
                  idLecteur: item.idLecteur,
                  idPlanning: null,
                }));
                this.router.navigate(["/schedule/add-schedule"], {
                  state: {
                    newPlanning: this.newPlanning,
                    soutenances: soutenances,
                    salles: this.salles,
                  },
                });
              }
            },
            error: (error) => {
              console.error("Erreur lors de la génération du planning", error);
              this.isSubmitting = true;
            },
            complete: () => {
              this.isSubmitting = true;
            },
          });
        // this.planningService.addPlanning(this.newPlanning);

        // for (const salle of this.salles) {
        //   if (!this.selectedSalles.includes(salle)) {
        //     salle.estDisponible = false;
        //     this.salleService.updateSalle(salle);
        //   }
        // }
      } catch (error) {
        console.error("Erreur lors de la création du planning :", error);
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
    console.log("Check validty", this.newPlanning);
    return !!(
      this.newPlanning.nom!.trim() &&
      this.newPlanning.dateDebut! &&
      this.newPlanning.dateFin! &&
      this.newPlanning.heureDebutMatin! &&
      this.newPlanning.heureDebutAprem! &&
      this.newPlanning.heureFinMatin! &&
      this.newPlanning.heureFinAprem! &&
      this.newPlanning.dureeSoutenance != null &&
      this.newPlanning.idAnneeFormation != null
    );
  }

  onCancel() {
    this.cancel.emit();
  }
}
