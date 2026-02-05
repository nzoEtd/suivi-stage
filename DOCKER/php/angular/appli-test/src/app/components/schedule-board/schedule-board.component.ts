import { CommonModule } from "@angular/common";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { SlotComponent } from "../slot/slot.component";
import { MatGridListModule } from "@angular/material/grid-list";
import { SlotItem } from "../../models/slotItem.model";
import { TimeBlock, TimeBlockConfig } from "../../models/timeBlock.model";
import { isSameDay } from "../../utils/timeManagement";
import { ToastrService } from "ngx-toastr";
import { inject } from "@angular/core";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from "@angular/cdk/drag-drop";
import { ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "app-schedule-board",
  imports: [
    CommonModule,
    SlotComponent,
    MatGridListModule,
    CdkDrag /*, CdkDragPlaceholder*/,
    CdkDropList,
  ],
  standalone: true,
  templateUrl: "./schedule-board.component.html",
  styleUrls: ["./schedule-board.component.css"],
})
export class ScheduleBoardComponent implements OnInit {
  @Input() jourActuel!: Date;
  @Input() slots!: SlotItem[];
  @Input() sallesDispo!: number[];
  @Input() timeBlocks!: TimeBlockConfig[];
  @Input() onlyDisplay!: boolean;
  @Input() planningByDay: Record<string, SlotItem[]> = {};

  @Output() editSlot = new EventEmitter<SlotItem>();
  @Output() slotUpdated = new EventEmitter<{
    planningByDay: Record<string, SlotItem[]>;
    items: SlotItem[];
  }>();

  toastr = inject(ToastrService);

  blocks: TimeBlock[] = [];
  PAUSE_HEIGHT = 15;
  isModalOpen: boolean = false;

  // Variables for drag and drop
  private slotsCache = new Map<TimeBlock, SlotItem[]>();
  items: SlotItem[] = [];
  dropError: string[] = [];
  isRendering: boolean = true;

  // Ligne guide des heures
  isDragging: boolean = false;
  guideLineY: number = 0;
  guideLineTime: string = "";
  currentBlock: TimeBlock | null = null;

  constructor(private cdRef: ChangeDetectorRef) {}

  async ngOnInit() {
    // Toujours commencer les blocs à une heure 'pile' donc sans minutes
    const converted = this.timeBlocks.map((b: TimeBlockConfig) => {
      const startMin = this.toMinutes(b.start);
      const endMin =
        b.end.split(":").map(Number)[1] == 0
          ? this.toMinutes(b.end)
          : this.toMinutes(b.end) + 60;
      const duration = endMin - startMin;

      return {
        ...b,
        startMin,
        endMin,
        duration,
        heightPercent: 0,
      };
    });

    // Total minutes (pauses exclues)
    const totalMinutes =
      converted.reduce((sum, b) => sum + (b.duration ?? 0), 0) +
      this.PAUSE_HEIGHT;

    // Pourcentage de hauteur de chaque bloc
    this.blocks = converted.map((b) => ({
      ...b,
      heightPercent: (b.duration / totalMinutes) * 100,
    }));

    this.blocks.forEach((block) => {
      this.slotsCache.set(
        block,
        this.calculateSlotsInBlock(
          block,
          this.planningByDay[this.jourActuel.toISOString().slice(0, 10)],
        ),
      );
    });
  }

  toMinutes(str: string): number {
    const [h, m] = str.split(":").map(Number);
    return h * 60 /*+ m*/;
  }

  getHours(startMin: number, endMin: number): string[] {
    const hours: string[] = [];

    const startH = Math.floor(startMin / 60);
    const endH = Math.floor(endMin / 60);

    for (let h = startH; h <= endH; h++) {
      hours.push(h.toString().padStart(2, "0"));
    }

    return hours;
  }

  getQuarterHourMarks(block: TimeBlock): number {
    // Nombre de quarts d'heure dans le bloc (durée du bloc en minutes / 15)
    return Math.floor(block.duration / 15);
  }

  calculateSlotsInBlock(block: TimeBlock, slots: SlotItem[]): SlotItem[] {
    return slots
      .filter((slot) => {
        const startMin =
          slot.dateDebut!.getHours() * 60 + slot.dateDebut!.getMinutes();
        const endMin =
          slot.dateFin!.getHours() * 60 + slot.dateFin!.getMinutes();
        
        if (block.type === "morning" && endMin > block.endMin) {
          return false;
        }
        if (block.type === "afternoon" && startMin < block.startMin) {
          return false;
        }
        return startMin >= block.startMin && endMin <= block.endMin;
      })
      .map((slot) => {
        const startMin =
          slot.dateDebut!.getHours() * 60 + slot.dateDebut!.getMinutes();
        const endMin =
          slot.dateFin!.getHours() * 60 + slot.dateFin!.getMinutes();

        const top = startMin - block.startMin;
        const height = endMin - startMin;

        slot.topPercent = (top / block.duration) * 100;
        slot.heightPercent = (height / block.duration) * 100;

        return slot;
      });
  }

  slotsInBlock(block: TimeBlock): SlotItem[] {
    this.rebuildSlotsCache();
    return this.slotsCache.get(block) || [];
  }

  checkSameDay(date1: Date, date2: Date): boolean {
    return isSameDay(date1, date2);
  }

  onEditSlot(slot: SlotItem) {
    this.editSlot.emit(slot);
  }

  //Fonctions pour drag and drop
  //Fonctions principales
  onDrop(
    event: CdkDragDrop<any>,
    targetDay: Date,
    container: HTMLElement,
    block: TimeBlock,
  ) {
    const draggedSlot = event.item.data as SlotItem;
    const dayKey = targetDay.toISOString().slice(0, 10);
    this.planningByDay[dayKey] ??= [];

    const prevState = {
      dateDebut: draggedSlot.dateDebut,
      dateFin: draggedSlot.dateFin,
      salle: draggedSlot.salle,
      topPercent: draggedSlot.topPercent,
      heightPercent: draggedSlot.heightPercent,
    };

    let duration =
      draggedSlot.dateDebut && draggedSlot.dateFin
        ? draggedSlot.dateFin.getTime() - draggedSlot.dateDebut.getTime()
        : null;
    const lastDate = draggedSlot.dateDebut
      ? draggedSlot.dateDebut.toISOString().slice(0, 10)
      : null;

    if (container && targetDay && block) {
      const rect = container.getBoundingClientRect();

      // Recherche de la salle choisie (retourne null si le slot a été laché en dehors du planning)
      const newRoom = this.xToRoom(event.dropPoint.x);

      if (newRoom === null) {
        //Le slot est drag dans la zone d'attente s'il n'y a aucune salle
        if (!this.items.find((i) => i.id === draggedSlot.id)) {
          draggedSlot.duree = duration;
          draggedSlot.dateDebut = null;
          draggedSlot.dateFin = null;
          draggedSlot.salle = null;
          this.items.push(draggedSlot);

          //Enlever slot de planningByDay
          for (const key in this.planningByDay) {
            this.planningByDay[key] = this.planningByDay[key].filter(
              (s) => s.id !== draggedSlot.id,
            );
          }
        }

        this.rebuildSlotsCache();
        this.cdRef.detectChanges();
      } else {
        // S'il y a une salle le slot est droppé dans la salle au bon endroit
        duration == null
          ? (duration = draggedSlot.duree)
          : (duration = duration);

        const containerTop = rect.top;
        const containerHeight = rect.height;

        // Nouvelles dates et heures du slot (dateDebut, dateFin)
        const [newStart, newBloc] = this.yToDate(
          event.dropPoint.y,
          containerTop,
          containerHeight,
          block.type,
          this.jourActuel,
          duration! / 60000, //durée de la soutenance en minutes
        );

        const newEnd = new Date(newStart.getTime() + duration!);

        // Nouvelle position du slot (topPercent)
        const top =
          newStart.getHours() * 60 + newStart.getMinutes() - newBloc.startMin;
        const newTop = (top / newBloc.duration) * 100;

        const existingSlots = this.planningByDay[dayKey].filter(
          (s) =>
            s.id !== draggedSlot.id &&
            (s.salle === newRoom ||
              (s.dateDebut! < newEnd && s.dateFin! > newStart)),
        );

        // Vérification de la disponibilité du créneau choisit et de la disponibilité des profs
        if (
          !this.canPlaceSlot(
            newStart,
            newEnd,
            draggedSlot.referent,
            draggedSlot.lecteur,
            newRoom,
            existingSlots,
          )
        ) {
          // Le slot revient à sa place
          this.dropError.forEach((e) => {
            this.toastr.error(e, "Impossible de placer la soutenance.");
          });

          //Forcer le slot à se remettre à sa place
          draggedSlot.dateDebut = prevState.dateDebut;
          draggedSlot.dateFin = prevState.dateFin;
          draggedSlot.salle = prevState.salle;
          draggedSlot.topPercent = prevState.topPercent;
          draggedSlot.heightPercent = prevState.heightPercent;

          this.isRendering = false;
          this.cdRef.detectChanges();

          // ça détruit et refait le planning donc c'est pas beau, chercher mieux
          setTimeout(() => {
            this.isRendering = true;
            this.rebuildSlotsCache();
            this.cdRef.detectChanges();
          }, 0);
          return;
        }

        // Si slot peut être posé et qu'il était en liste d'attente on l'enlève
        this.items = this.items.filter((i) => i.id !== draggedSlot.id);

        // Placement accepté
        draggedSlot.dateDebut = newStart;
        draggedSlot.dateFin = newEnd;
        draggedSlot.salle = newRoom;
        draggedSlot.topPercent = newTop;
        // Si le slot a changé de date on le supprime de l'ancienne dans planningByDay
        if (lastDate != null && dayKey !== lastDate) {
          this.planningByDay[lastDate] = this.planningByDay[lastDate].filter(
            (s) => s.id !== draggedSlot.id,
          );
        }

        // Si le slot est pas encore dans planningByDay ou a été supprimé après avoir changé de date on l'y met
        if (!this.planningByDay[dayKey].find((s) => s.id === draggedSlot.id)) {
          this.planningByDay[dayKey].push(draggedSlot);
        }
        this.rebuildSlotsCache();
        this.cdRef.detectChanges();
      }
    }

    this.slotUpdated.emit({
      planningByDay: this.planningByDay,
      items: this.items,
    });
  }

  onPlanningDrop(event: CdkDragDrop<any>) {
    const planningEl = document.querySelector(".planning") as HTMLElement;

    if (!planningEl) {
      return;
    }

    // Trouver le bloc (morning / afternoon) et le timerow à partir du Y souris
    const result = this.findBlockAndRowFromY(event.dropPoint.y);

    if (!result) {
      return;
    }

    const { block, timeRow } = result;

    this.onDrop(event, this.jourActuel, timeRow, block);
  }

  //Fonctions secondaires
  findBlockAndRowFromY(
    mouseY: number,
  ): { block: TimeBlock; timeRow: HTMLElement } | null {
    const rows = Array.from(
      document.querySelectorAll<HTMLElement>(".time-row"),
    );

    for (let i = 0; i < rows.length; i++) {
      const rect = rows[i].getBoundingClientRect();
      if (mouseY >= rect.top && mouseY <= rect.bottom) {
        return {
          block: this.blocks[i],
          timeRow: rows[i],
        };
      }
    }

    return null;
  }

  overlaps(
    aStart: Date,
    aEnd: Date,
    aSalle: number,
    bStart: Date,
    bEnd: Date,
    bStudent: string,
    bSalle: number,
  ) {
    const hasOverlap = aStart < bEnd && aEnd > bStart && aSalle === bSalle;
    if (hasOverlap) {
      this.dropError.push(
        `La soutenance de ${bStudent} est déjà sur ce créneau dans la salle ${bSalle}.`,
      );
    }
    return hasOverlap;
  }

  teachersOk(
    aReferent: string,
    aLecteur: string,
    aSalle: number,
    bReferent: string,
    bLecteur: string,
    bSalle: number,
  ) {
    if (aSalle === bSalle) {
      return true;
    }

    const referentOccupe = aReferent == bReferent || aReferent == bLecteur;
    const lecteurOccupe = aLecteur == bReferent || aLecteur == bLecteur;
    if (referentOccupe) {
      const erreurReferent = `${aReferent} n'est pas disponible pour ce créneau (soutenance en salle ${bSalle}).`;
      if (!this.dropError.includes(erreurReferent)) {
        this.dropError.push(erreurReferent);
      }
    }
    if (lecteurOccupe) {
      const erreurLecteur = `${aLecteur} n'est pas disponible pour ce créneau (soutenance en salle ${bSalle}).`;
      if (!this.dropError.includes(erreurLecteur)) {
        this.dropError.push(erreurLecteur);
      }
    }
    return !referentOccupe && !lecteurOccupe;
  }

  canPlaceSlot(
    start: Date,
    end: Date,
    referent: string,
    lecteur: string,
    salle: number,
    existingSlots: SlotItem[],
  ): boolean {
    this.dropError = [];
    const hasOverlap = existingSlots.some((s) =>
      this.overlaps(
        start,
        end,
        salle,
        s.dateDebut!,
        s.dateFin!,
        s.etudiant,
        s.salle!,
      ),
    );
    if (hasOverlap) {
      return false;
    }
    const teacherAvailable = existingSlots.every((s) =>
      this.teachersOk(
        referent,
        lecteur,
        salle,
        s.referent,
        s.lecteur,
        s.salle!,
      ),
    );
    return teacherAvailable;
  }

  yToDate(
    mouseY: number,
    containerTop: number,
    containerHeight: number,
    bloc: "morning" | "afternoon",
    day: Date,
    duree: number,
  ): [Date, TimeBlock] {
    const blocConfig = {
      morning: {
        start: this.blocks.find((b) => b.type == "morning")?.startMin! / 60,
        end: this.blocks.find((b) => b.type == "morning")?.endMin! / 60,
      },
      afternoon: {
        start: this.blocks.find((b) => b.type == "afternoon")?.startMin! / 60,
        end: this.blocks.find((b) => b.type == "afternoon")?.endMin! / 60,
      },
    };

    const { start, end } = blocConfig[bloc];
    let timeBloc = this.blocks.find((b) => b.type == bloc);
    const relativeY = mouseY - containerTop;
    const ratio = relativeY / containerHeight;
    const hour = start! + ratio * (end! - start!);

    let h = Math.floor(hour);
    // Arrondissement à 5min (drop possible toutes les 5 minutes)
    let m = (Math.round(((hour - h) * 60) / 5) * 5) % 60;

    // Vérifications que les slots sont bien dans les bons blocs et ne dépasse pas
    // Réglage du matin pour éviter avant début (sécurité mais pas forcément utile)
    if (h < start && bloc == "morning") {
      h = start;
      m = 0;
    }
    // Passage du matin à l'après-midi
    else if (h >= end && bloc == "morning") {
      h = h + (blocConfig["afternoon"].start - end);
      timeBloc = this.blocks.find((b) => b.type == "afternoon");
    }
    // Passage de l'après-midi au matin
    else if (h < start && bloc == "afternoon") {
      h = h - (start - blocConfig["morning"].end);
      timeBloc = this.blocks.find((b) => b.type == "morning");
    }
    // Réglage pour éviter que le slot commence avant et finisse après la fin d'un bloc
    else if (h < end && h * 60 + duree + m > end * 60) {
      const hour = (end * 60 - duree) / 60;
      h = Math.floor(hour);
      m = (Math.round(((hour - h) * 60) / 5) * 5) % 60;
    }
    // Réglage de l'après-midi pour éviter qu'il commence après la fin du bloc (sécurité mais pas forcément utile)
    else if (h >= end && bloc == "afternoon") {
      const hour = (end * 60 - duree) / 60;
      h = Math.floor(hour);
      m = (Math.round(((hour - h) * 60) / 5) * 5) % 60;
    }

    const d = new Date(day);
    d.setHours(h, m, 0, 0);
    return [d, timeBloc!];
  }

  xToRoom(mouseX: number): number | null {
    // Récupérer toutes les cellules de salle
    const salleCells = Array.from(
      document.querySelectorAll<HTMLElement>(".salle-cell"),
    );

    for (const cell of salleCells) {
      const rect = cell.getBoundingClientRect();
      if (mouseX >= rect.left && mouseX <= rect.right) {
        return Number(cell.dataset["salle"]) ?? null;
      }
    }

    return null;
  }

  rebuildSlotsCache() {
    this.slotsCache.clear();

    for (const block of this.blocks) {
      this.slotsCache.set(
        block,
        this.calculateSlotsInBlock(
          block,
          this.planningByDay[this.jourActuel.toISOString().slice(0, 10)],
        ),
      );
    }
  }

  neverEnter = () => false;

  // Ligne guide des heures
  onDragStarted(event: any) {
    this.isDragging = true; // Activer la ligne guide
  }

  onDragMoved(event: any) {
    if (!this.isDragging) return;

    const mouseY = event.pointerPosition.y;

    // Trouver le bloc (matin/après-midi) sous la souris
    const result = this.findBlockAndRowFromY(mouseY);

    if (!result) {
      this.currentBlock = null;
      return;
    }

    const { block, timeRow } = result;
    this.currentBlock = block;

    const rowRect = timeRow.getBoundingClientRect();

    // Position Y relative dans la time-row
    const relativeY = mouseY - rowRect.top;
    const ratio = relativeY / rowRect.height;

    // Calculer l'heure
    const startH = block.startMin / 60;
    const endH = block.endMin / 60;
    const hour = startH + ratio * (endH - startH);

    let h = Math.floor(hour);
    let m = (Math.round(((hour - h) * 60) / 5) * 5) % 60; // Arrondi à 5 min

    // Ajuster si dépasse les limites
    if (h < startH) {
      h = startH;
      m = 0;
    } else if (h >= endH - 1) {
      h = endH - 1;
      m = 0;
    }

    // Position Y de la ligne (relative au viewport)
    this.guideLineY = mouseY;

    // Formater l'heure
    this.guideLineTime = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  onDragEnded(event: any) {
    // Cacher la ligne guide
    this.isDragging = false;
    this.currentBlock = null;
  }
}
