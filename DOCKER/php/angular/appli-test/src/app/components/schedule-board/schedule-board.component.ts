import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { SlotComponent } from '../slot/slot.component';
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-schedule-board',
  imports: [CommonModule, SlotComponent, MatGridListModule],
  standalone: true,
  templateUrl: './schedule-board.component.html',
  styleUrls: ['./schedule-board.component.css']
})
export class ScheduleBoardComponent implements OnInit {
  @Input() jourActuel!: Date;
  timeBlocks: TimeBlockConfig[] = [
    { start: "08:00", end: "12:00", type: "morning" },
    { start: "14:00", end: "17:00", type: "afternoon" }
  ];
  
  blocks: TimeBlock[] = [];
  
  PAUSE_HEIGHT = 20; 
  startDay = 8 * 60;
  totalMinutes = 10 * 60;

  jours: Date[] = [new Date(2026, 5, 22), new Date(2026, 5, 23)];
  selectedJour: Date = this.jours[0];
  sallesDispo: number[] = [124, 125, 126, 127, 129, 131, 110];

  dateDebut: Date = new Date(2026, 5, 22, 8);
  dateFin: Date = new Date(2026, 5, 22, 9);
  etudiant: String = "Elève 1";
  referent: String = "Y. Carpentier";
  lecteur: String = "S. Voisin";
  entreprise: String = "Superinfo";
  salleSoutenance: number = 124;

  async ngOnInit() {
    const converted = this.timeBlocks.map((b: TimeBlockConfig) => {
      const startMin = this.toMinutes(b.start);
      const endMin = this.toMinutes(b.end);
      const duration = endMin - startMin;
      console.log(startMin + " - " + endMin + " - " + duration)

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

// eventsInBlock(block: TimeBlock, allEvents: EventItem[]): EventItem[] {
//   if (!block.startMin || !block.endMin || !block.duration) return [];

//   return allEvents
//     .filter(evt => evt.start >= block.startMin! && evt.start < block.endMin!)
//     .map(evt => {
//       const top = evt.start - block.startMin!;
//       const height = evt.end - evt.start;

//       return {
//         ...evt,
//         topPercent: (top / block.duration!) * 100,
//         heightPercent: (height / block.duration!) * 100
//       };
//     });
// }
}

interface TimeBlockConfig{
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

// interface EventItem {
//   title: string;
//   start: number; // minutes
//   end: number;   // minutes
//   topPercent?: number;
//   heightPercent?: number;
// }