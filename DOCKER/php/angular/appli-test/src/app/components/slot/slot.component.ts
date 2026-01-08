import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slot',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.css']
})
export class SlotComponent {
  @Input() slot!: SlotItem;
  
  @Output() editSlot = new EventEmitter<SlotItem>();

  onSlotClick() {
    console.log("slot cliqué", this.slot)
    this.editSlot.emit(this.slot);
  }
}

interface SlotItem {
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
}
