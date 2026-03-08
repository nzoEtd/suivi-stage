import { Component } from '@angular/core';

@Component({
  selector: 'app-data-dashboard-manager',
  imports: [],
  templateUrl: './data-dashboard-manager.component.html',
  styleUrl: './data-dashboard-manager.component.css'
})
export class DataDashboardManagerComponent {

  isModalOpen: boolean = false;

  openModal() {
    this.isModalOpen = true;
  }
  
}
