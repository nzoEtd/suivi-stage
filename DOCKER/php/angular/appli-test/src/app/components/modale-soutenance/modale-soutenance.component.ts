import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { SlotItem } from "../../models/slotItem.model";
import { Staff } from "../../models/staff.model";
import { Soutenance } from "../../models/soutenance.model";
import { LoadingComponent } from "../loading/loading.component";
import { TimeBlockConfig } from "../../models/timeBlock.model";
import {
  buildDate,
  formatDate,
  formatStringDate,
  formatDateToYYYYMMDD,
  minutesToHHMM,
  timeStringToMinutes,
  dateToHeureStr,
} from "../../utils/timeManagement";
import { ToastrService } from "ngx-toastr";
import { CreneauDisponible } from "../../utils/types";
import { isOverlap, referentEstTechnique } from "../../utils/fonctions";

@Component({
  selector: "app-modale-soutenance",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: "./modale-soutenance.component.html",
  styleUrls: ["./modale-soutenance.component.css"],
})
export class ModaleSoutenanceComponent implements OnInit {
  initialFormValue: any;

  @Input() soutenance!: SlotItem;
  @Input() editMode: boolean = false;
  @Input() sallesDispo!: number[];
  @Input() soutenancesJour!: Record<string, SlotItem[]>;
  @Input() allStaff: Staff[] = [];
  @Input() timeBlocks: TimeBlockConfig[] = [];

  @Output() close = new EventEmitter<void>();

  toastr = inject(ToastrService);

  soutenanceForm!: FormGroup;
  enseignantsLecteurs: Staff[] = [];
  creneauxDisponibles: CreneauDisponible[] = [];
  newSoutenance: Soutenance = new Soutenance();

  isDataLoaded = false;
  isSubmitting = false;
  submitted = false;

  formatDate = formatDate;
  formatStringDate = formatStringDate;
  formatDateToYYYYMMDD = formatDateToYYYYMMDD;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.creneauxDisponibles = this.getCreneauxDisponibles();

    const currentCreneauKey = this.getCurrentCreneauValue();

    this.soutenanceForm = this.fb.group({
      creneau: [currentCreneauKey, Validators.required],
      lecteur: [Number(this.soutenance.idLecteur), Validators.required],
    });
    this.initialFormValue = this.soutenanceForm.value;

    this.soutenanceForm.get("creneau")?.valueChanges.subscribe((value) => {
      this.updateLecteursDisponibles(value, false);
    });

    this.updateLecteursDisponibles(currentCreneauKey, true);
    this.isDataLoaded = true;
  }

  getCurrentCreneauValue(): string {
    return `${formatDateToYYYYMMDD(this.soutenance.dateDebut!)}|${this.soutenance.salle}|${dateToHeureStr(this.soutenance.dateDebut!)}`;
  }

  // Génère tous les créneaux possibles par jour, salle et bloc
  private generateAllCreneaux(): {
    date: string;
    salle: number;
    heureDebut: string;
    heureFin: string;
    heureDebutDate: Date;
    heureFinDate: Date;
  }[] {
    const dureeMinutes =
      (this.soutenance.dateFin!.getTime() -
        this.soutenance.dateDebut!.getTime()) /
      60000;
    const pas = 30;

    return Object.entries(this.soutenancesJour).flatMap(
      ([date, soutenances]) => {
        const sallesDuJour = Array.from(
          new Set(
            soutenances
              .map((s) => s.salle)
              .filter((s): s is number => s != null),
          ),
        );

        return sallesDuJour.flatMap((salle) =>
          this.timeBlocks.flatMap((block) => {
            const blockStart = timeStringToMinutes(block.start);
            const blockEnd = timeStringToMinutes(block.end);
            const minutesList: number[] = [];
            for (let m = blockStart; m + dureeMinutes <= blockEnd; m += pas)
              minutesList.push(m);

            return minutesList.map((minutesDebut) => {
              const heureDebutStr = minutesToHHMM(minutesDebut);
              const heureFinStr = minutesToHHMM(minutesDebut + dureeMinutes);
              return {
                date,
                salle,
                heureDebut: heureDebutStr,
                heureFin: heureFinStr,
                heureDebutDate: buildDate(date, heureDebutStr),
                heureFinDate: buildDate(date, heureFinStr),
              };
            });
          }),
        );
      },
    );
  }

  // Filtre créneaux selon chevauchement, salle, référent et l'existance de lecteurs
  private filterCreneauxValides(
    creneaux: {
      date: string;
      salle: number;
      heureDebut: string;
      heureFin: string;
      heureDebutDate: Date;
      heureFinDate: Date;
    }[],
    autresSoutenances: SlotItem[],
  ): CreneauDisponible[] {
    return creneaux
      .filter(({ salle, heureDebutDate, heureFinDate }) => {
        const chevauchantes = autresSoutenances.filter((s) =>
          this.isOverlap(
            heureDebutDate,
            heureFinDate,
            s.dateDebut!,
            s.dateFin!,
          ),
        );

        // Salle occupée ?
        if (chevauchantes.some((s) => s.salle === salle)) return false;

        // Référent occupé ?
        const enseignantsOccupes = chevauchantes.flatMap((s) => [
          s.idLecteur,
          s.idReferent,
        ]);
        if (enseignantsOccupes.includes(this.soutenance.idReferent))
          return false;

        // Lecteurs disponibles ?
        if (this.getLecteursDisponibles(chevauchantes).length === 0)
          return false;

        return true;
      })
      .map(({ date, salle, heureDebut, heureFin }) => ({
        date,
        salle,
        heureDebut,
        heureFin,
      }));
  }

  getCreneauxDisponibles(): CreneauDisponible[] {
    const allCreneaux = this.generateAllCreneaux();

    // toutes les soutenances sauf celle actuelle
    const autresSoutenances = Object.values(this.soutenancesJour).flatMap(
      (sout) => sout.filter((s) => s.id !== this.soutenance.id),
    );

    // filtrage des créneaux valides
    let creneaux = this.filterCreneauxValides(allCreneaux, autresSoutenances);

    // ajouter le créneau actuel s’il n’est pas déjà présent
    const currentKey = this.getCurrentCreneauValue();
    if (
      !creneaux.some(
        (c) => `${c.date}|${c.salle}|${c.heureDebut}` === currentKey,
      )
    ) {
      creneaux.unshift({
        date: formatDateToYYYYMMDD(this.soutenance.dateDebut!),
        salle: this.soutenance.salle!,
        heureDebut: dateToHeureStr(this.soutenance.dateDebut!),
        heureFin: dateToHeureStr(this.soutenance.dateFin!),
      });
    }

    // tri final
    return sortCreneaux(creneaux);
  }

  getLecteursDisponibles(chevauchements: SlotItem[]): Staff[] {
    const idNonDisponibles = chevauchements.flatMap((s) => [
      s.idLecteur,
      s.idReferent,
    ]);

    const referentTechnique = referentEstTechnique(
      this.soutenance.idReferent,
      this.allStaff,
    );

    return this.allStaff.filter((s) => {
      if (idNonDisponibles.includes(s.idPersonnel)) return false;
      if (s.idPersonnel === this.soutenance.idReferent) return false;
      if (!referentTechnique && !s.estTechnique) return false;
      return true;
    });
  }

  updateLecteursDisponibles(creneauValue: string, keepCurrentLecteur = false) {
    const [date, salleStr, heureDebut] = creneauValue.split("|");
    const salle = Number(salleStr);
    const creneau = this.creneauxDisponibles.find(
      (c) =>
        c.date === date && c.salle === salle && c.heureDebut === heureDebut,
    );
    if (!creneau) return;

    const heureDebutDate = buildDate(creneau.date, creneau.heureDebut);
    const heureFinDate = buildDate(creneau.date, creneau.heureFin);

    const soutenances = this.soutenancesJour[date] || [];

    const chevauchements = soutenances.filter(
      (s) =>
        s.id !== this.soutenance.id &&
        isOverlap(heureDebutDate, heureFinDate, s.dateDebut!, s.dateFin!),
    );

    this.enseignantsLecteurs = this.getLecteursDisponibles(chevauchements);

    const lecteurCtrl = this.soutenanceForm?.get("lecteur");
    if (!lecteurCtrl) return;

    if (keepCurrentLecteur) {
      const lecteurActuelDispo = this.enseignantsLecteurs.some(
        (e) => e.idPersonnel === this.soutenance.idLecteur,
      );
      if (!lecteurActuelDispo) {
        lecteurCtrl.setValue(this.enseignantsLecteurs[0]?.idPersonnel ?? null);
      }
    } else {
      const currentLecteur = Number(lecteurCtrl.value);
      const toujoursDispo = this.enseignantsLecteurs.some(
        (e) => e.idPersonnel === currentLecteur,
      );
      if (!toujoursDispo) {
        lecteurCtrl.setValue(this.enseignantsLecteurs[0]?.idPersonnel ?? null);
        this.toastr.warning(
          "L'enseignant lecteur précédent n'est pas disponible sur ce créneau\nUn autre lecteur a été sélectionné automatiquement.",
          "Lecteur modifié",
        );
      }
    }
  }

  onCancel(event?: MouseEvent) {
    this.close.emit();
  }

  onSubmit() {
    this.submitted = true;
    if (!this.soutenanceForm.valid) return;

    const form = this.soutenanceForm.value;
    const [date, salleStr, heureDebut] = form.creneau.split("|");
    const salle = Number(salleStr);
    const creneau = this.creneauxDisponibles.find(
      (c) =>
        c.date === date && c.salle === salle && c.heureDebut === heureDebut,
    );
    if (!creneau) return;

    const dateChange =
      formatDateToYYYYMMDD(this.soutenance.dateDebut!) !== date;
    const currentDateStr = formatDateToYYYYMMDD(this.soutenance.dateDebut!);

    for (const slotsTab of Object.values(this.soutenancesJour)) {
      const i = slotsTab.findIndex((s) => s.id === this.soutenance.id);
      if (i === -1) continue;

      if (!dateChange) {
        this.soutenancesJour[currentDateStr][i] = {
          ...this.soutenancesJour[currentDateStr][i],
          dateDebut: buildDate(date, creneau.heureDebut),
          dateFin: buildDate(date, creneau.heureFin),
          idLecteur: form.lecteur,
          lecteur: this.getTeacherName(form.lecteur),
          salle,
        };
      } else {
        this.soutenancesJour[currentDateStr].splice(i, 1);
        if (!this.soutenancesJour[date]) this.soutenancesJour[date] = [];
        this.soutenancesJour[date].push({
          ...this.soutenance,
          dateDebut: buildDate(date, creneau.heureDebut),
          dateFin: buildDate(date, creneau.heureFin),
          idLecteur: form.lecteur,
          lecteur: this.getTeacherName(form.lecteur),
          salle,
        });
      }
      this.toastr.success("Les modifications ont bien été prises en comptes.");
      break;
    }

    this.soutenance.dateDebut = buildDate(date, creneau.heureDebut);
    this.soutenance.dateFin = buildDate(date, creneau.heureFin);
    this.soutenance.idLecteur = form.lecteur;
    this.soutenance.lecteur = this.getTeacherName(form.lecteur);
    this.soutenance.salle = salle;
    this.close.emit();
  }

  getTeacherName(id: number): string {
    const lecteur = this.allStaff.find((s) => s.idPersonnel === Number(id));
    if (lecteur) {
      return lecteur.prenom![0] + ". " + lecteur.nom!;
    } else {
      throw new Error("Enseignant non trouvé.");
    }
  }

  isFormChanged(): boolean {
    return (
      JSON.stringify(this.soutenanceForm.value) !==
      JSON.stringify(this.initialFormValue)
    );
  }
}
