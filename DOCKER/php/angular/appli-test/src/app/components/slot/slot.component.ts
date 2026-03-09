import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlotItem } from '../../models/slotItem.model';

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
    this.editSlot.emit(this.slot);
  }
}
