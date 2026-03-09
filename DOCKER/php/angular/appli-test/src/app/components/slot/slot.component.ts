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
  @Input() teacherInSlot: number[] = [];
  
  @Output() editSlot = new EventEmitter<SlotItem>();

  onSlotClick() {
    this.editSlot.emit(this.slot);
  }

  getBackgroundColor(slotId: number): string {
    return this.teacherInSlot.some(s => s === slotId) ? '#801a1a' : '#CFE9FF';
  }

  getTextColor(slotId: number): string {
    return this.teacherInSlot.some(s => s === slotId) ? '#ffffff' : '#000000';
  }
}
