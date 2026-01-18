import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SlotComponent } from '../slot/slot.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { SlotItem } from '../../models/slotItem.model';
import { TimeBlock, TimeBlockConfig } from '../../models/timeBlock.model';
import { isSameDay } from '../../utils/timeManagement';
import { CdkDrag,   CdkDragDrop,   CdkDragPlaceholder, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-schedule-board',
  imports: [CommonModule, SlotComponent, MatGridListModule, CdkDrag, CdkDragPlaceholder, CdkDropList],
  standalone: true,
  templateUrl: './schedule-board.component.html',
  styleUrls: ['./schedule-board.component.css']
})
export class ScheduleBoardComponent implements OnInit {
  @Input() jourActuel!: Date;
  @Input() slots!: SlotItem[];
  @Input() sallesDispo!: number[];
  @Input() timeBlocks!: TimeBlockConfig[];
  @Input() onlyDisplay!: boolean;
  @Input() planningByDay: Record<string, SlotItem[]> = {};

  @Output() editSlot = new EventEmitter<SlotItem>();
  @Output() slotUpdated = new EventEmitter<SlotItem>();

  blocks: TimeBlock[] = [];
  PAUSE_HEIGHT = 20;
  isModalOpen: boolean = false;

  private slotsCache = new Map<TimeBlock, SlotItem[]>();

  async ngOnInit() {
      const converted = this.timeBlocks.map((b: TimeBlockConfig) => {
      const startMin = this.toMinutes(b.start);
      const endMin = this.toMinutes(b.end);
      const duration = endMin - startMin;

      return {
        ...b,
        startMin,
        endMin,
        duration,
        heightPercent: 0
      };
    });

    // Total minutes (pauses exclues)
    const totalMinutes = converted.reduce((sum, b) => sum + (b.duration ?? 0), 0);

    // Pourcentage de hauteur de chaque bloc
    this.blocks = converted.map(b => ({
      ...b,
      heightPercent: b.duration / totalMinutes * 100
    }));

    this.blocks.forEach(block => {
      this.slotsCache.set(block, this.calculateSlotsInBlock(block, this.slots));
    });
  }

  toMinutes(str: string): number {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
  }

  getHours(startMin: number, endMin: number): string[] {
    const hours: string[] = [];

    const startH = Math.floor(startMin / 60);
    const endH = Math.floor(endMin / 60);

    for (let h = startH; h <= endH; h++) {
      hours.push(h.toString().padStart(2, '0'));
    }

    return hours;
  }

  getQuarterHourMarks(block: TimeBlock): number {
    // Nombre de quarts d'heure dans le bloc (duration en minutes / 15)
    return Math.floor(block.duration / 15);
  }

  calculateSlotsInBlock(block: TimeBlock, slots: SlotItem[]): SlotItem[] {
    return slots
    .filter(slot => {
      const startMin = slot.dateDebut.getHours() * 60 + slot.dateDebut.getMinutes();
      return startMin >= block.startMin && startMin < block.endMin;
    })
    .map(slot => {
      const startMin = slot.dateDebut.getHours() * 60 + slot.dateDebut.getMinutes();
      const endMin = slot.dateFin.getHours() * 60 + slot.dateFin.getMinutes();

      const top = startMin - block.startMin;
      const height = endMin - startMin;

      slot.topPercent = (top / block.duration) * 100;
      slot.heightPercent = (height / block.duration) * 100;

      return slot;
    });
  }

  slotsInBlock(block: TimeBlock): SlotItem[] {
    return this.slotsCache.get(block) || [];
  }

  checkSameDay(date1: Date, date2: Date): boolean{
    return isSameDay(date1, date2);
  }

  onEditSlot(slot: SlotItem) {
    console.log("slot cliqué, dans schedule board", slot)
    this.editSlot.emit(slot);
  }

  //Fonctions pour drag and drop
  onDrop(
    event: CdkDragDrop<any>,
    container: HTMLElement,
    targetDay: Date,
    targetSalleId: number,
    block: TimeBlock
  ) {
    console.log("salle : ",targetSalleId)
    const draggedSlot = event.item.data as SlotItem;
    console.log("slot dragué",draggedSlot)
    const rect = container.getBoundingClientRect();

    const containerTop = rect.top;
    const containerHeight = rect.height;

    const existingSlots = this.slots.filter(s =>
      s.id !== draggedSlot.id &&
      s.salle === targetSalleId &&
      isSameDay(s.dateDebut, targetDay)
    );
    
    // Nouvelles dates et heures du slot (dateDebut, dateFin)
    const newStart = this.yToDate(
      event.dropPoint.y,
      containerTop,
      containerHeight,
      block.type,
      this.jourActuel
    );
  
    const duration = draggedSlot.dateFin.getTime() - draggedSlot.dateDebut.getTime();
  
    const newEnd = new Date(newStart.getTime() + duration);

    // Nouvelle position du slot (topPercent)
    const top = (newStart.getHours() * 60 + newStart.getMinutes()) - block.startMin;
    const newTop = (top / block.duration) * 100;
    console.log("newTop : ",newTop)
  
    // Vérification de la disponibilité du créneau choisit
    if (!this.canPlaceSlot(newStart, newEnd, existingSlots)) {
      // Le slot revient à sa place
      return;
    }
  
    // Placement accepté
    draggedSlot.dateDebut = newStart;
    draggedSlot.dateFin = newEnd;
    draggedSlot.salle = targetSalleId;
    draggedSlot.topPercent = newTop;
    console.log("le slot drag droppé",draggedSlot)
    this.rebuildSlotsCache();

    this.slotUpdated.emit(draggedSlot);
  }
  
  overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
    return aStart < bEnd && aEnd > bStart;
  }
  
  canPlaceSlot(
    start: Date,
    end: Date,
    existingSlots: SlotItem[]
  ): boolean {
    return !existingSlots.some(s =>
      this.overlaps(start, end, s.dateDebut, s.dateFin)
    );
  }
  
  yToDate(
    mouseY: number,
    containerTop: number,
    containerHeight: number,
    bloc: "morning" | "afternoon",
    day: Date
  ): Date {
    const blocConfig = {
      "morning": { start: 8, end: 12 },
      "afternoon": { start: 13, end: 18 }
    };
  
    const { start, end } = blocConfig[bloc];
    const ratio = (mouseY - containerTop) / containerHeight;
    const hour = start + ratio * (end - start);
  
    const h = Math.floor(hour);
    // Arrondissement à 5min (drop possible toutes les 5 minutes)
    const m = Math.round((hour - h) * 60 / 5) * 5;
  
    const d = new Date(day);
    d.setHours(h, m, 0, 0);
    return d;
  }
    
  rebuildSlotsCache() {
    this.slotsCache.clear();
  
    for (const block of this.blocks) {
      this.slotsCache.set(
        block,
        this.calculateSlotsInBlock(block, this.slots)
      );
    }
  }
}

