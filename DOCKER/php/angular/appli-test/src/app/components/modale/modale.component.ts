import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-modale',
  imports: [CommonModule],
  templateUrl: './modale.component.html',
  styleUrls: ['./modale.component.css']
})
export class ModaleComponent {

  @Input() title: string = '';
  @Input() hasValue: boolean = true;
  @Input() submitLabel: string = 'Valider';

  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit() {
    this.submit.emit();
  }

  onCancel() {
    this.cancel.emit(); 
}
}