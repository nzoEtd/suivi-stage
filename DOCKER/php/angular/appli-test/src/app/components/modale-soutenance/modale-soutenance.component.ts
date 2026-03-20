import { Component, EventEmitter, Output, Input, OnInit } from "@angular/core";
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

type CreneauDisponible = {
  date: string;
  salle: number;
  heureDebut: string;
  heureFin: string;
};

@Component({
  selector: "app-modale-soutenance",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: "./modale-soutenance.component.html",
  styleUrls: ["./modale-soutenance.component.css"],
})
export class ModaleSoutenanceComponent implements OnInit {
  @Input() soutenance!: SlotItem;
  @Input() editMode: boolean = false;
  @Input() sallesDispo!: number[];
  @Input() soutenancesJour!: Record<string, SlotItem[]>;
  @Input() allStaff: Staff[] = [];
  @Input() timeBlocks: TimeBlockConfig[] = [];

  @Output() close = new EventEmitter<void>();

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

    this.soutenanceForm.get("creneau")?.valueChanges.subscribe((value) => {
      this.updateLecteursDisponibles(value, false);
    });

    this.updateLecteursDisponibles(currentCreneauKey, true);
    this.isDataLoaded = true;
  }

  getCurrentCreneauValue(): string {
    return `${formatDateToYYYYMMDD(this.soutenance.dateDebut!)}|${this.soutenance.salle}|${dateToHeureStr(this.soutenance.dateDebut!)}`;
  }

  getCreneauxDisponibles(): CreneauDisponible[] {
    const dureeMs =
      this.soutenance.dateFin!.getTime() - this.soutenance.dateDebut!.getTime();
    const dureeMinutes = dureeMs / 60000;

    const pas = 30;
    const currentKey = this.getCurrentCreneauValue();
    const creneaux: CreneauDisponible[] = [];

    for (const [date, soutenances] of Object.entries(this.soutenancesJour)) {
      const autresSoutenances = soutenances.filter(
        (s) => s.id !== this.soutenance.id,
      );

      const sallesDuJour = [
        ...new Set(
          soutenances.map((s) => s.salle).filter((s): s is number => s != null),
        ),
      ];

      for (const salle of sallesDuJour) {
        for (const block of this.timeBlocks) {
          const blockStart = timeStringToMinutes(block.start);
          const blockEnd = timeStringToMinutes(block.end);

          for (
            let minutesDebut = blockStart;
            minutesDebut + dureeMinutes <= blockEnd;
            minutesDebut += pas
          ) {
            const heureDebutStr = minutesToHHMM(minutesDebut);
            const heureFinStr = minutesToHHMM(minutesDebut + dureeMinutes);

            const heureDebut = buildDate(date, heureDebutStr);
            const heureFin = buildDate(date, heureFinStr);

            const soutenancesChevauchantes = autresSoutenances.filter((s) =>
              this.isOverlap(heureDebut, heureFin, s.dateDebut!, s.dateFin!),
            );

            // Salle occupée
            if (soutenancesChevauchantes.some((s) => s.salle === salle))
              continue;

            // Enseignants occupés
            const enseignantsOccupes = soutenancesChevauchantes.flatMap((s) => [
              s.idLecteur,
              s.idReferent,
            ]);

            if (enseignantsOccupes.includes(this.soutenance.idReferent))
              continue;

            creneaux.push({
              date,
              salle,
              heureDebut: heureDebutStr,
              heureFin: heureFinStr,
            });
          }
        }
      }
    }

    // Tri par jour puis salle puis heure
    creneaux.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }

      if (a.salle !== b.salle) {
        return a.salle - b.salle;
      }
      return a.heureDebut.localeCompare(b.heureDebut);
    });

    const alreadyInList = creneaux.some(
      (c) => `${c.date}|${c.salle}|${c.heureDebut}` === currentKey,
    );

    if (!alreadyInList) {
      creneaux.unshift({
        date: formatDateToYYYYMMDD(this.soutenance.dateDebut!),
        salle: this.soutenance.salle!,
        heureDebut: dateToHeureStr(this.soutenance.dateDebut!),
        heureFin: dateToHeureStr(this.soutenance.dateFin!),
      });
    }

    return creneaux;
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

    const idNonDisponibles = soutenances
      .filter(
        (s) =>
          s.id !== this.soutenance.id &&
          this.isOverlap(
            heureDebutDate,
            heureFinDate,
            s.dateDebut!,
            s.dateFin!,
          ),
      )
      .flatMap((s) => [s.idLecteur, s.idReferent]);

    const referentTechnique = this.referentEstTechnique(
      this.soutenance.idReferent,
    );

    this.enseignantsLecteurs = this.allStaff.filter((s) => {
      if (idNonDisponibles.includes(s.idPersonnel)) {
        return false;
      }
      if (s.idPersonnel === this.soutenance.idReferent) {
        return false;
      }
      if (!referentTechnique && !s.estTechnique) {
        return false;
      }
      return true;
    });

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
      }
    }
  }

  referentEstTechnique(idReferent: number): boolean {
    const enseignant = this.allStaff.find((s) => s.idPersonnel === idReferent);
    return enseignant?.estTechnique || false;
  }

  isOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && end1 > start2;
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
}
