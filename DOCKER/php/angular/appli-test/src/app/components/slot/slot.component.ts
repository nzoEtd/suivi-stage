import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timestamp } from 'rxjs';

@Component({
  selector: 'app-slot',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.css']
})
export class SlotComponent {
  @Input() slot!: {
    id: number;
    topPercent: number;
    heightPercent: number;
    dateDebut: Date;
    dateFin: Date;
    etudiant: string;
    referent: string;
    lecteur: string;
    entreprise: string;
    salle: number;
  };
  @Input() openModal!: Function;
}
