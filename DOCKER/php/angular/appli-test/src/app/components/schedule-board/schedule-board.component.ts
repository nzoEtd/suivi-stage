import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { SlotComponent } from '../slot/slot.component';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-schedule-board',
  imports: [CommonModule, SlotComponent, MatGridListModule],
  standalone: true,
  templateUrl: './schedule-board.component.html',
  styleUrls: ['./schedule-board.component.css']
})
export class ScheduleBoardComponent implements OnInit {
  @Input() jourActuel!: Date;
  @Input() slots!: SlotItem[];
  @Input() sallesDispo!: number[];
  @Input() timeBlocks!: TimeBlockConfig[];

  blocks: TimeBlock[] = [];
  PAUSE_HEIGHT = 10;

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

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
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
}

interface TimeBlockConfig {
  start: string;  // "08:00"
  end: string;    // "12:00"
  type: string;
}

interface TimeBlock {
  start: string;  // "08:00"
  end: string;    // "12:00"
  type: string;
  startMin: number;
  endMin: number;
  duration: number;
  heightPercent: number;
}

interface SlotItem {
  topPercent: number;
  heightPercent: number;
  dateDebut: Date;
  dateFin: Date;
  etudiant: string;
  referent: string;
  lecteur: string;
  entreprise: string;
  salle: number;
}