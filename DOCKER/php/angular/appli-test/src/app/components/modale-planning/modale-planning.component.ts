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
  isSubmitting = false;

  promos: TrainingYear[] = [];
  salles: Salle[] = [];
  selectedSalles: Salle[] = [];
  dropdownOpen = false;

  currentAcademicYearId!: number;

  formErrors = {
    nom: false,
    promo: false,
    date: null as string | null,
    time: null as string | null,
    duree: false,
  };

  @Output() cancel = new EventEmitter<void>();

  constructor(
    private readonly router: Router,
    private readonly planningService: PlanningService,
    private readonly trainingYearService: TrainingYearService,
    private readonly salleService: SalleService,
    private readonly academicYearService: AcademicYearService,
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
      this.currentAcademicYearId = academicYear?.idAnneeUniversitaire || 0;
    });
  }

  // Sélection/désélection des salles
  onSalleToggle(event: Event, salle: Salle) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedSalles.push(salle);
    } else {
      this.selectedSalles = this.selectedSalles.filter((s) => s !== salle);
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  get selectedSallesText(): string {
    return this.selectedSalles.length > 0
      ? this.selectedSalles.map((s) => s.nomSalle).join(", ")
      : "-- Sélectionner --";
  }

  // Validation complète du formulaire
  validateForm(): boolean {
    this.formErrors = {
      nom: false,
      promo: false,
      date: null,
      time: null,
      duree: false,
    };
    let valid = true;

    if (!this.newPlanning.nom?.trim()) {
      this.formErrors.nom = true;
      valid = false;
    }

    if (!this.newPlanning.idAnneeFormation) {
      this.formErrors.promo = true;
      valid = false;
    }

    if (!this.newPlanning.dureeSoutenance) {
      this.formErrors.duree = true;
      valid = false;
    }

    if (!this.newPlanning.dateDebut || !this.newPlanning.dateFin) {
      valid = false;
    } else if (this.newPlanning.dateFin < this.newPlanning.dateDebut) {
      this.formErrors.date =
        "La date de fin doit être postérieure à la date de début.";
      valid = false;
    }

    const { heureDebutMatin, heureFinMatin, heureDebutAprem, heureFinAprem } =
      this.newPlanning;

    if (heureDebutMatin && heureFinMatin && heureDebutAprem && heureFinAprem) {
      const debutMatin = timeStringToMinutes(heureDebutMatin);
      const finMatin = timeStringToMinutes(heureFinMatin);
      const debutAprem = timeStringToMinutes(heureDebutAprem);
      const finAprem = timeStringToMinutes(heureFinAprem);

      if (finMatin <= debutMatin) {
        this.formErrors.time = "La fin du matin doit être supérieure au début.";
        valid = false;
      } else if (debutAprem <= finMatin) {
        this.formErrors.time =
          "Le début de l'après-midi doit être après la fin du matin.";
        valid = false;
      } else if (finAprem <= debutAprem) {
        this.formErrors.time =
          "La fin de l'après-midi doit être après le début.";
        valid = false;
      }
    } else {
      valid = false;
    }

    return valid;
  }

  get isFormValid(): boolean {
    return (
      !this.formErrors.nom &&
      !this.formErrors.promo &&
      !this.formErrors.date &&
      !this.formErrors.time &&
      !this.formErrors.duree
    );
  }

  // Soumission du formulaire
  async onSubmit() {
    if (!this.validateForm()) return;

    try {
      this.isSubmitting = true;

      const startMorningMinutes = timeStringToMinutes(
        this.newPlanning.heureDebutMatin!,
      );
      const endMorningMinutes = timeStringToMinutes(
        this.newPlanning.heureFinMatin!,
      );
      const startAfternoonMinutes = timeStringToMinutes(
        this.newPlanning.heureDebutAprem!,
      );
      const endAfternoonMinutes = timeStringToMinutes(
        this.newPlanning.heureFinAprem!,
      );

      this.newPlanning.idAnneeUniversitaire = this.currentAcademicYearId;

      this.planningService
        .runAlgorithmPlanning(
          startMorningMinutes,
          endMorningMinutes,
          startAfternoonMinutes,
          endAfternoonMinutes,
          this.newPlanning.dureeSoutenance!,
          this.newPlanning.dureeSoutenance! * 1.3,
          5,
          20 * 60,
          this.selectedSalles,
          this.newPlanning.idAnneeFormation!,
          this.currentAcademicYearId,
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
                  soutenances,
                  salles: this.salles,
                },
              });
            }
          },
          error: (error) => {
            console.error("Erreur lors de la génération du planning", error);
            this.isSubmitting = false;
          },
          complete: () => {
            this.isSubmitting = false;
          },
        });
    } catch (error) {
      console.error("Erreur lors de la création du planning :", error);
      this.isSubmitting = false;
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
