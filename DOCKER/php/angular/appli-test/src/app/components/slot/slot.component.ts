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
    @Input() dateDebut!: Date;
    @Input() dateFin!: Date;
    @Input() etudiant!: String;
    @Input() referent!: String;
    @Input() lecteur!: String;
    @Input() entreprise!: String;
}
