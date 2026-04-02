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
  dateToHoursStr,
} from "../../utils/timeManagement";
import { ToastrService } from "ngx-toastr";
import { AvailableSlot } from "../../utils/types";
import { isOverlap, referentIsTechnical } from "../../utils/fonctions";
import { sortSlots } from "../../utils/slotsUtils";
import { ModaleComponent } from "../modale/modale.component";

@Component({
  selector: "app-modale-soutenance",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingComponent,
    ModaleComponent,
  ],
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
  @Input() isModalOpen: boolean = false;

  @Output() close = new EventEmitter<void>();

  toastr = inject(ToastrService);

  soutenanceForm!: FormGroup;
  enseignantsLecteurs: Staff[] = [];
  availableSlots: AvailableSlot[] = [];
  newSoutenance: Soutenance = new Soutenance();
  title: string = "";

  isDataLoaded = false;
  isSubmitting = false;
  submitted = false;

  formatDate = formatDate;
  formatStringDate = formatStringDate;
  formatDateToYYYYMMDD = formatDateToYYYYMMDD;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.availableSlots = this.getAvailableSlots();

    const currentCreneauKey = this.getCurrentCreneauValue();

    this.soutenanceForm = this.fb.group({
      creneau: [currentCreneauKey, Validators.required],
      lecteur: [Number(this.soutenance.idLecteur), Validators.required],
    });
    this.initialFormValue = this.soutenanceForm.value;

    this.soutenanceForm.get("creneau")?.valueChanges.subscribe((value) => {
      this.updateAvailableReaders(value, false);
    });

    this.updateAvailableReaders(currentCreneauKey, true);
    this.title = `Soutenance ${formatDate(this.soutenance.dateDebut!, "Heure")} - ${formatDate(this.soutenance.dateFin!, "Heure")} S${this.soutenance.salle}`;
    this.isDataLoaded = true;
  }

  getCurrentCreneauValue(): string {
    return `${formatDateToYYYYMMDD(this.soutenance.dateDebut!)}|${this.soutenance.salle}|${dateToHoursStr(this.soutenance.dateDebut!)}`;
  }

  // Generates all possible time slots per day, room and block
  private generateAllSlots(): {
    date: string;
    salle: number;
    heureDebut: string;
    heureFin: string;
    heureDebutDate: Date;
    heureFinDate: Date;
  }[] {
    const durationInMinute =
      (this.soutenance.dateFin!.getTime() -
        this.soutenance.dateDebut!.getTime()) /
      60000;
    const pas = 30;

    return Object.entries(this.soutenancesJour).flatMap(
      ([date, soutenances]) => {
        const roomOfTheDay = Array.from(
          new Set(
            soutenances
              .map((s) => s.salle)
              .filter((s): s is number => s != null),
          ),
        );

        return roomOfTheDay.flatMap((salle) =>
          this.timeBlocks.flatMap((block) => {
            const blockStart = timeStringToMinutes(block.start);
            const blockEnd = timeStringToMinutes(block.end);
            const minutesList: number[] = [];
            for (let m = blockStart; m + durationInMinute <= blockEnd; m += pas)
              minutesList.push(m);

            return minutesList.map((minutesStart) => {
              const hoursStartStr = minutesToHHMM(minutesStart);
              const hoursEndStr = minutesToHHMM(
                minutesStart + durationInMinute,
              );
              return {
                date,
                salle,
                heureDebut: hoursStartStr,
                heureFin: hoursEndStr,
                heureDebutDate: buildDate(date, hoursStartStr),
                heureFinDate: buildDate(date, hoursEndStr),
              };
            });
          }),
        );
      },
    );
  }

  // Filter slots based on overlap, room, referent, and the existence of readers
  private filterValidSlots(
    slots: {
      date: string;
      salle: number;
      heureDebut: string;
      heureFin: string;
      heureDebutDate: Date;
      heureFinDate: Date;
    }[],
    otherSlots: SlotItem[],
  ): AvailableSlot[] {
    return slots
      .filter(({ salle, heureDebutDate, heureFinDate }) => {
        const overlapped = otherSlots.filter((s) =>
          isOverlap(heureDebutDate, heureFinDate, s.dateDebut!, s.dateFin!),
        );

        // Room available ?
        if (overlapped.some((s) => s.salle === salle)) return false;

        // Referent available ?
        const enseignantsOccupes = overlapped.flatMap((s) => [
          s.idLecteur,
          s.idReferent,
        ]);
        if (enseignantsOccupes.includes(this.soutenance.idReferent))
          return false;

        // Reader available ?
        if (this.getAvailableReaders(overlapped).length === 0) return false;

        return true;
      })
      .map(({ date, salle, heureDebut, heureFin }) => ({
        date,
        salle,
        heureDebut,
        heureFin,
      }));
  }

  // Get all available slots compare to the one chosen
  getAvailableSlots(): AvailableSlot[] {
    const allSlots = this.generateAllSlots();

    // All slots except the current one
    const otherSlots = Object.values(this.soutenancesJour).flatMap((sout) =>
      sout.filter((s) => s.id !== this.soutenance.id),
    );

    // Filter valid slots
    let validSlots = this.filterValidSlots(allSlots, otherSlots);

    // Add current slot if not already present
    this.addCurrentSlotIfMissing(validSlots);

    // Final sort
    return sortSlots(validSlots);
  }

  // Add current slot to the given list if not already present
  private addCurrentSlotIfMissing(validSlots: AvailableSlot[]): void {
    const currentKey = this.getCurrentCreneauValue();

    const isAlreadyPresent = validSlots.some(
      (c) => `${c.date}|${c.salle}|${c.heureDebut}` === currentKey,
    );

    if (!isAlreadyPresent) {
      validSlots.unshift({
        date: formatDateToYYYYMMDD(this.soutenance.dateDebut!),
        salle: this.soutenance.salle!,
        heureDebut: dateToHoursStr(this.soutenance.dateDebut!),
        heureFin: dateToHoursStr(this.soutenance.dateFin!),
      });
    }
  }

  // Get all reader available for the chosen slot
  getAvailableReaders(chevauchements: SlotItem[]): Staff[] {
    const idNonDisponibles = chevauchements.flatMap((s) => [
      s.idLecteur,
      s.idReferent,
    ]);

    const referentTechnique = referentIsTechnical(
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

  updateAvailableReaders(creneauValue: string, keepCurrentLecteur = false) {
    const [date, salleStr, heureDebut] = creneauValue.split("|");
    const salle = Number(salleStr);
    const creneau = this.availableSlots.find(
      (c) =>
        c.date === date && c.salle === salle && c.heureDebut === heureDebut,
    );
    if (!creneau) return;

    const hourStartDate = buildDate(creneau.date, creneau.heureDebut);
    const hourEndDate = buildDate(creneau.date, creneau.heureFin);

    const slots = this.soutenancesJour[date] || [];

    const overlaps = slots.filter(
      (s) =>
        s.id !== this.soutenance.id &&
        isOverlap(hourStartDate, hourEndDate, s.dateDebut!, s.dateFin!),
    );

    this.enseignantsLecteurs = this.getAvailableReaders(overlaps);

    const lecteurCtrl = this.soutenanceForm?.get("lecteur");
    if (!lecteurCtrl) return;

    if (keepCurrentLecteur) {
      const currentReaderAvailable = this.enseignantsLecteurs.some(
        (e) => e.idPersonnel === this.soutenance.idLecteur,
      );
      if (!currentReaderAvailable) {
        lecteurCtrl.setValue(this.enseignantsLecteurs[0]?.idPersonnel ?? null);
      }
    } else {
      const currentLecteur = Number(lecteurCtrl.value);
      const stillAvailable = this.enseignantsLecteurs.some(
        (e) => e.idPersonnel === currentLecteur,
      );
      if (!stillAvailable) {
        lecteurCtrl.setValue(this.enseignantsLecteurs[0]?.idPersonnel ?? null);
        this.toastr.warning(
          "L'enseignant lecteur précédent n'est pas disponible sur ce créneau\nUn autre lecteur a été sélectionné automatiquement.",
          "Lecteur modifié",
        );
      }
    }
  }

  onCancel() {
    this.close.emit();
  }

  onSubmit() {
    this.submitted = true;
    if (!this.soutenanceForm.valid) return;

    const form = this.soutenanceForm.value;
    const [date, salleStr, heureDebut] = form.creneau.split("|");
    const salle = Number(salleStr);
    const creneau = this.availableSlots.find(
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
      this.toastr.success("Les modifications ont bien été prises en compte.");
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
