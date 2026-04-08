import { Component } from '@angular/core';
import { ResetConfirmationModalComponent } from '../reset-confirmation-modal/reset-confirmation-modal.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-data-dashboard-manager',
  imports: [ResetConfirmationModalComponent, CommonModule, RouterModule],
  templateUrl: './data-dashboard-manager.component.html',
  styleUrl: './data-dashboard-manager.component.css'
})
export class DataDashboardManagerComponent {

  isModalOpen: boolean = false;

  openModal() {
    this.isModalOpen = true;
  }
  
}
