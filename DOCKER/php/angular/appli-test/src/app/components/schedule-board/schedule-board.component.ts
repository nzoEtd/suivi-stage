import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SlotComponent } from '../slot/slot.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { SlotItem } from '../../models/slotItem.model';
import { TimeBlock, TimeBlockConfig } from '../../models/timeBlock.model';
import { isSameDay } from '../../utils/timeManagement';
import { CdkDrag,   CdkDragPlaceholder } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-schedule-board',
  imports: [CommonModule, SlotComponent, MatGridListModule, CdkDrag, CdkDragPlaceholder],
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

  @Output() editSlot = new EventEmitter<SlotItem>();

  blocks: TimeBlock[] = [];
  PAUSE_HEIGHT = 20;
  isModalOpen: boolean = false;

  private slotsCache = new Map<TimeBlock, SlotItem[]>();

  async ngOnInit() {
      const converted = this.timeBlocks.map((b: TimeBlockConfig) => {
      const startMin = this.toMinutes(b.start);
      const endMin = this.toMinutes(b.end);
      const duration = endMin - startMin;
      // console.log(startMin + " - " + endMin + " - " + duration)

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

    let i = 0;
    this.blocks.forEach(block => {
      this.slotsCache.set(block, this.calculateSlotsInBlock(block, this.slots));
      console.log("slot height et top: ", this.slots[i].heightPercent, this.slots[i].topPercent)
      console.log("slotCache height et top: ", this.slotsCache)
      console.log("block height: ", block.heightPercent)
      i++;
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
      .map(slot => {
        const startMin = slot.dateDebut.getHours() * 60 + slot.dateDebut.getMinutes();
        const endMin = slot.dateFin.getHours() * 60 + slot.dateFin.getMinutes();

        return {
          ...slot,
          startMin,
          endMin
        };
      })
      .filter(slot => {return (slot as any).startMin >= block.startMin && (slot as any).startMin < block.endMin})
      .map(slot => {
        const top = slot.startMin - block.startMin;
        const height = slot.endMin - slot.startMin;
        console.log("top slot : ",top, (top / block.duration) * 100)
        console.log("height slot : ",height, (height / block.duration) * 100)

        return {
          ...slot,
          topPercent: (top / block.duration) * 100,
          heightPercent: (height / block.duration) * 100
        };
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
}

