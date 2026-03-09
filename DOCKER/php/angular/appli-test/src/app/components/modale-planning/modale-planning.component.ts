import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
} from "@angular/forms";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';

import { PlanningService } from "../../services/planning.service";
import { TrainingYearService } from "../../services/training-year.service";
import { SalleService } from "../../services/salle.service";
import { AcademicYearService } from "../../services/academic-year.service";

import { TrainingYear } from "../../models/training-year.model";
import { Salle } from "../../models/salle.model";
import { Soutenance } from "../../models/soutenance.model";
import { OverlayModule, ConnectedPosition } from "@angular/cdk/overlay";

import {
  addDays,
  minutesToHHMM,
  timeStringToMinutes,
} from "../../utils/timeManagement";
import { Planning } from "../../models/planning.model";

@Component({
  selector: "app-modale-planning",
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OverlayModule],
  templateUrl: "./modale-planning.component.html",
  styleUrls: ["./modale-planning.component.css"],
})
export class ModalePlanningComponent implements OnInit {
  @Output() cancel = new EventEmitter<void>();
  toastr = inject(ToastrService);

  planningForm!: FormGroup;
  submitted = false;
  isSubmitting = false;
  newPlanning: Planning = new Planning();
  promos: TrainingYear[] = [];
  salles: Salle[] = [];
  selectedSalles: Salle[] = [];
  dropdownOpen = false;

  currentAcademicYearId!: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private planningService: PlanningService,
    private trainingYearService: TrainingYearService,
    private salleService: SalleService,
    private academicYearService: AcademicYearService,
  ) {}

  ngOnInit(): void {
    this.initForm();

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

  initForm() {
    this.planningForm = this.fb.group(
      {
        nom: ["", Validators.required],
        idAnneeFormation: [null, Validators.required],
        dateDebut: [null, Validators.required],
        dateFin: [null, Validators.required],
        heureDebutMatin: [null, Validators.required],
        heureFinMatin: [null, Validators.required],
        heureDebutAprem: [null, Validators.required],
        heureFinAprem: [null, Validators.required],
        dureeSoutenance: [null, Validators.required],
      },
      {
        validators: [
          this.dateOrderValidator,
          this.matinOrderValidator,
          this.apremStartValidator,
          this.apremOrderValidator,
        ],
      },
    );
  }

  dateOrderValidator: ValidatorFn = (form: AbstractControl) => {
    const debut = form.get("dateDebut")?.value;
    const fin = form.get("dateFin")?.value;
    if (!debut || !fin) return null;
    return fin >= debut ? null : { dateOrder: true };
  };

  matinOrderValidator: ValidatorFn = (form: AbstractControl) => {
    const debut = form.get("heureDebutMatin")?.value;
    const fin = form.get("heureFinMatin")?.value;
    if (!debut || !fin) return null;
    return fin > debut ? null : { matinOrder: true };
  };

  apremStartValidator: ValidatorFn = (form: AbstractControl) => {
    const finMatin = form.get("heureFinMatin")?.value;
    const debutAprem = form.get("heureDebutAprem")?.value;
    if (!finMatin || !debutAprem) return null;
    return debutAprem > finMatin ? null : { apremStart: true };
  };

  apremOrderValidator: ValidatorFn = (form: AbstractControl) => {
    const debut = form.get("heureDebutAprem")?.value;
    const fin = form.get("heureFinAprem")?.value;
    if (!debut || !fin) return null;
    return fin > debut ? null : { apremOrder: true };
  };

  onSalleToggle(event: Event, salle: Salle) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedSalles.push(salle);
    } else {
      this.selectedSalles = this.selectedSalles.filter((s) => s !== salle);
    }
  }

  get selectedSallesText(): string {
    return this.selectedSalles.length
      ? this.selectedSalles.map((s) => s.nomSalle).join(", ")
      : "-- Sélectionner --";
  }

  // Soumission du formulaire
  async onSubmit() {
    this.submitted = true;

    if (this.planningForm.invalid) return;
    try {
      this.isSubmitting = true;
      this.newPlanning = this.planningForm.value;

      // Transformation des heures au format attendu par l'algo
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

      // Execution de l'algo
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
            this.toastr.error(error, "Erreur lors de la génération du planning.");
            this.isSubmitting = false;
          },
          complete: () => {
            this.isSubmitting = false;
          },
        });
    } catch (error: any) {
      this.toastr.error(error, "Erreur lors de la création du planning.");
      this.isSubmitting = false;
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
