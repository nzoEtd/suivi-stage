import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Soutenance } from '../../models/soutenance.model';
import { Staff } from '../../models/staff.model';
import { SlotItem } from '../../models/slotItem.model';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: "app-modale-soutenance",
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: "./modale-soutenance.component.html",
  styleUrl: "./modale-soutenance.component.css",
})

export class ModaleSoutenanceComponent implements OnInit {
  //Loading
  isDataLoaded: boolean = false;
  isSubmitting: boolean = false;
  //Paramètres de la modale
  @Input() soutenance!: SlotItem;
  @Input() editMode: boolean = false;
  @Input() sallesDispo!: number[];
  @Input() soutenancesJour: Record<string, SlotItem[]> = {
    "2026-06-11": [
      {
        id: 1,
        topPercent: 12.5,
        heightPercent: 25,
        dateDebut: new Date("2026-06-11T06:30:00.000Z"),
        dateFin: new Date("2026-06-11T07:30:00.000Z"),
        idEtudiant: "611107",
        etudiant: "HERRMANN Anthony",
        idReferent: 3,
        referent: "Y. CARPENTIER",
        idLecteur: 1,
        lecteur: "P. LOPISTEGUY",
        entreprise: "Geek Tonic",
        tuteur: "BAGIEU Pascal",
        salle: 126,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 2,
        topPercent: 14.583333333333334,
        heightPercent: 25,
        dateDebut: new Date("2026-06-11T11:35:00.000Z"),
        dateFin: new Date("2026-06-11T12:35:00.000Z"),
        idEtudiant: "610580",
        etudiant: "LOHIER Marylou",
        idReferent: 6,
        referent: "C. MARQUESUZAA",
        idLecteur: 1,
        lecteur: "P. LOPISTEGUY",
        entreprise: "BCM Informatique",
        tuteur: "DARRIEUTORT Alban",
        salle: 126,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 3,
        topPercent: 41.66666666666667,
        heightPercent: 25,
        dateDebut: new Date("2026-06-11T07:40:00.000Z"),
        dateFin: new Date("2026-06-11T08:40:00.000Z"),
        idEtudiant: "641387",
        etudiant: "DUTOURNIER Candice",
        idReferent: 2,
        referent: "Y. DOURISBOURE",
        idLecteur: 2,
        lecteur: "Y. DOURISBOURE",
        entreprise: "IUT de Bayonne",
        tuteur: "DUPONT Jean",
        salle: 124,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 23,
        topPercent: 12.5,
        heightPercent: 29.166666666666668,
        dateDebut: new Date("2026-06-11T06:30:00.000Z"),
        dateFin: new Date("2026-06-11T07:40:00.000Z"),
        idEtudiant: "641110",
        etudiant: "HAMID Enzo",
        idReferent: 7,
        referent: "C. DUTOURNIER",
        idLecteur: 4,
        lecteur: "S. VOISIN",
        entreprise: "CDG 33",
        tuteur: "GUIDICE Dorian",
        salle: 127,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 24,
        topPercent: 43.75,
        heightPercent: 25,
        dateDebut: new Date("2026-06-11T07:45:00.000Z"),
        dateFin: new Date("2026-06-11T08:45:00.000Z"),
        idEtudiant: "641353",
        etudiant: "DAVAUD Zelie",
        idReferent: 3,
        referent: "Y. CARPENTIER",
        idLecteur: 5,
        lecteur: "M. BORTHWICK",
        entreprise: "CGI Bordeaux",
        tuteur: "GUILLOT Romain",
        salle: 127,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 25,
        topPercent: 70.83333333333334,
        heightPercent: 25,
        dateDebut: new Date("2026-06-11T08:50:00.000Z"),
        dateFin: new Date("2026-06-11T09:50:00.000Z"),
        idEtudiant: "641387",
        etudiant: "DUTOURNIER Candice",
        idReferent: 2,
        referent: "Y. DOURISBOURE",
        idLecteur: 6,
        lecteur: "C. MARQUESUZAA",
        entreprise: "IUT de Bayonne",
        tuteur: "DUPONT Jean",
        salle: 127,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 26,
        topPercent: 12.5,
        heightPercent: 25,
        dateDebut: new Date("2026-06-11T11:30:00.000Z"),
        dateFin: new Date("2026-06-11T12:30:00.000Z"),
        idEtudiant: "583303",
        etudiant: "GOUMEAUX Gauthier",
        idReferent: 7,
        referent: "C. DUTOURNIER",
        idLecteur: 7,
        lecteur: "C. DUTOURNIER",
        entreprise: "Geek Tonic",
        tuteur: "BAGIEU Pascal",
        salle: 127,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 27,
        topPercent: 39.58333333333333,
        heightPercent: 29.166666666666668,
        dateDebut: new Date("2026-06-11T12:35:00.000Z"),
        dateFin: new Date("2026-06-11T13:45:00.000Z"),
        idEtudiant: "610000",
        etudiant: "MONTOURO Maxime",
        idReferent: 6,
        referent: "C. MARQUESUZAA",
        idLecteur: 1,
        lecteur: "P. LOPISTEGUY",
        entreprise: "ZERO ET L'INFINI",
        tuteur: "NAVAUD Pierre-Louis",
        salle: 127,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 28,
        topPercent: 66.66666666666666,
        heightPercent: 25,
        dateDebut: new Date("2026-06-11T13:40:00.000Z"),
        dateFin: new Date("2026-06-11T14:40:00.000Z"),
        idEtudiant: "610459",
        etudiant: "VERNIS Gabriel",
        idReferent: 5,
        referent: "M. BORTHWICK",
        idLecteur: 2,
        lecteur: "Y. DOURISBOURE",
        entreprise: "BCM Informatique",
        tuteur: "DARRIEUTORT Alban",
        salle: 127,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 29,
        topPercent: 12.5,
        heightPercent: 25,
        dateDebut: new Date("2026-06-11T06:30:00.000Z"),
        dateFin: new Date("2026-06-11T07:30:00.000Z"),
        idEtudiant: "610001",
        etudiant: "CONGUISTI Nicolas",
        idReferent: 6,
        referent: "C. MARQUESUZAA",
        idLecteur: 2,
        lecteur: "Y. DOURISBOURE",
        entreprise: "CGI Bordeaux",
        tuteur: "GUILLOT Romain",
        salle: 129,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 30,
        topPercent: 39.58333333333333,
        heightPercent: 29.166666666666668,
        dateDebut: new Date("2026-06-11T07:35:00.000Z"),
        dateFin: new Date("2026-06-11T08:45:00.000Z"),
        idEtudiant: "610123",
        etudiant: "CRUSSIERE Lucas",
        idReferent: 5,
        referent: "M. BORTHWICK",
        idLecteur: 3,
        lecteur: "Y. CARPENTIER",
        entreprise: "IUT de Bayonne",
        tuteur: "DUPONT Jean",
        salle: 129,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 31,
        topPercent: 70.83333333333334,
        heightPercent: 29.166666666666668,
        dateDebut: new Date("2026-06-11T08:50:00.000Z"),
        dateFin: new Date("2026-06-11T10:00:00.000Z"),
        idEtudiant: "610124",
        etudiant: "LAVERGNE Elsa",
        idReferent: 4,
        referent: "S. VOISIN",
        idLecteur: 4,
        lecteur: "S. VOISIN",
        entreprise: "CGI Bordeaux",
        tuteur: "GUILLOT Romain",
        salle: 129,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 32,
        topPercent: 12.5,
        heightPercent: 25,
        dateDebut: new Date("2026-06-11T11:30:00.000Z"),
        dateFin: new Date("2026-06-11T12:30:00.000Z"),
        idEtudiant: "610459",
        etudiant: "VERNIS Gabriel",
        idReferent: 5,
        referent: "M. BORTHWICK",
        idLecteur: 5,
        lecteur: "M. BORTHWICK",
        entreprise: "BCM Informatique",
        tuteur: "DARRIEUTORT Alban",
        salle: 129,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 33,
        topPercent: 39.58333333333333,
        heightPercent: 25,
        dateDebut: new Date("2026-06-11T12:35:00.000Z"),
        dateFin: new Date("2026-06-11T13:35:00.000Z"),
        idEtudiant: "610580",
        etudiant: "LOHIER Marylou",
        idReferent: 6,
        referent: "C. MARQUESUZAA",
        idLecteur: 6,
        lecteur: "C. MARQUESUZAA",
        entreprise: "BCM Informatique",
        tuteur: "DARRIEUTORT Alban",
        salle: 129,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 34,
        topPercent: 66.66666666666666,
        heightPercent: 25,
        dateDebut: new Date("2026-06-11T13:40:00.000Z"),
        dateFin: new Date("2026-06-11T14:40:00.000Z"),
        idEtudiant: "611000",
        etudiant: "CONSTANS Fanny",
        idReferent: 3,
        referent: "Y. CARPENTIER",
        idLecteur: 4,
        lecteur: "S. VOISIN",
        entreprise: "Geek Tonic",
        tuteur: "ROCQUES Lionel",
        salle: 129,
        idPlanning: 1,
        allStaff: []
      }
  ],
  "2026-06-10": [
      {
        id: 4,
        topPercent: 0,
        heightPercent: 0,
        dateDebut: new Date("2026-06-10T06:00:00.000Z"),
        dateFin: new Date("2026-06-10T07:00:00.000Z"),
        idEtudiant: "583303",
        etudiant: "GOUMEAUX Gauthier",
        idReferent: 6,
        referent: "C. MARQUESUZAA",
        idLecteur: 1,
        lecteur: "P. LOPISTEGUY",
        entreprise: "Geek Tonic",
        tuteur: "BAGIEU Pascal",
        salle: 124,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 5,
        topPercent: 0,
        heightPercent: 0,
        dateDebut: new Date("2026-06-10T07:05:00.000Z"),
        dateFin: new Date("2026-06-10T08:15:00.000Z"),
        idEtudiant: "610000",
        etudiant: "MONTOURO Maxime",
        idReferent: 1,
        referent: "P. LOPISTEGUY",
        idLecteur: 1,
        lecteur: "P. LOPISTEGUY",
        entreprise: "ZERO ET L'INFINI",
        tuteur: "NAVAUD Pierre-Louis",
        salle: 124,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 6,
        topPercent: 62.5,
        heightPercent: 25,
        dateDebut: new Date("2026-06-10T08:30:00.000Z"),
        dateFin: new Date("2026-06-10T09:30:00.000Z"),
        idEtudiant: "610001",
        etudiant: "CONGUISTI Nicolas",
        idReferent: 7,
        referent: "C. DUTOURNIER",
        idLecteur: 2,
        lecteur: "Y. DOURISBOURE",
        entreprise: "CGI Bordeaux",
        tuteur: "GUILLOT Romain",
        salle: 124,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 7,
        topPercent: 12.5,
        heightPercent: 25,
        dateDebut: new Date("2026-06-10T11:30:00.000Z"),
        dateFin: new Date("2026-06-10T12:30:00.000Z"),
        idEtudiant: "610123",
        etudiant: "CRUSSIERE Lucas",
        idReferent: 6,
        referent: "C. MARQUESUZAA",
        idLecteur: 2,
        lecteur: "Y. DOURISBOURE",
        entreprise: "IUT de Bayonne",
        tuteur: "DUPONT Jean",
        salle: 124,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 8,
        topPercent: 39.58333333333333,
        heightPercent: 25,
        dateDebut: new Date("2026-06-10T12:35:00.000Z"),
        dateFin: new Date("2026-06-10T13:35:00.000Z"),
        idEtudiant: "610124",
        etudiant: "LAVERGNE Elsa",
        idReferent: 7,
        referent: "C. DUTOURNIER",
        idLecteur: 3,
        lecteur: "Y. CARPENTIER",
        entreprise: "CGI Bordeaux",
        tuteur: "GUILLOT Romain",
        salle: 124,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 9,
        topPercent: 66.66666666666666,
        heightPercent: 29.166666666666668,
        dateDebut: new Date("2026-06-10T13:40:00.000Z"),
        dateFin: new Date("2026-06-10T14:50:00.000Z"),
        idEtudiant: "611082",
        etudiant: "MARTIN Solène",
        idReferent: 6,
        referent: "C. MARQUESUZAA",
        idLecteur: 5,
        lecteur: "M. BORTHWICK",
        entreprise: "ESTIA",
        tuteur: "BAGIEU Pascal",
        salle: 124,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 10,
        topPercent: 12.5,
        heightPercent: 25,
        dateDebut: new Date("2026-06-10T06:30:00.000Z"),
        dateFin: new Date("2026-06-10T07:30:00.000Z"),
        idEtudiant: "611107",
        etudiant: "HERRMANN Anthony",
        idReferent: 4,
        referent: "S. VOISIN",
        idLecteur: 1,
        lecteur: "P. LOPISTEGUY",
        entreprise: "Geek Tonic",
        tuteur: "BAGIEU Pascal",
        salle: 125,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 11,
        topPercent: 39.58333333333333,
        heightPercent: 29.166666666666668,
        dateDebut: new Date("2026-06-10T07:35:00.000Z"),
        dateFin: new Date("2026-06-10T08:45:00.000Z"),
        idEtudiant: "610000",
        etudiant: "MONTOURO Maxime",
        idReferent: 1,
        referent: "P. LOPISTEGUY",
        idLecteur: 2,
        lecteur: "Y. DOURISBOURE",
        entreprise: "ZERO ET L'INFINI",
        tuteur: "NAVAUD Pierre-Louis",
        salle: 125,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 12,
        topPercent: 70.83333333333334,
        heightPercent: 25,
        dateDebut: new Date("2026-06-10T08:50:00.000Z"),
        dateFin: new Date("2026-06-10T09:50:00.000Z"),
        idEtudiant: "610001",
        etudiant: "CONGUISTI Nicolas",
        idReferent: 7,
        referent: "C. DUTOURNIER",
        idLecteur: 3,
        lecteur: "Y. CARPENTIER",
        entreprise: "CGI Bordeaux",
        tuteur: "GUILLOT Romain",
        salle: 125,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 13,
        topPercent: 12.5,
        heightPercent: 25,
        dateDebut: new Date("2026-06-10T11:30:00.000Z"),
        dateFin: new Date("2026-06-10T12:30:00.000Z"),
        idEtudiant: "610123",
        etudiant: "CRUSSIERE Lucas",
        idReferent: 6,
        referent: "C. MARQUESUZAA",
        idLecteur: 4,
        lecteur: "S. VOISIN",
        entreprise: "IUT de Bayonne",
        tuteur: "DUPONT Jean",
        salle: 125,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 14,
        topPercent: 39.58333333333333,
        heightPercent: 29.166666666666668,
        dateDebut: new Date("2026-06-10T12:35:00.000Z"),
        dateFin: new Date("2026-06-10T13:45:00.000Z"),
        idEtudiant: "610124",
        etudiant: "LAVERGNE Elsa",
        idReferent: 7,
        referent: "C. DUTOURNIER",
        idLecteur: 5,
        lecteur: "M. BORTHWICK",
        entreprise: "CGI Bordeaux",
        tuteur: "GUILLOT Romain",
        salle: 125,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 15,
        topPercent: 70.83333333333334,
        heightPercent: 25,
        dateDebut: new Date("2026-06-10T13:50:00.000Z"),
        dateFin: new Date("2026-06-10T14:50:00.000Z"),
        idEtudiant: "610580",
        etudiant: "LOHIER Marylou",
        idReferent: 1,
        referent: "P. LOPISTEGUY",
        idLecteur: 6,
        lecteur: "C. MARQUESUZAA",
        entreprise: "BCM Informatique",
        tuteur: "DARRIEUTORT Alban",
        salle: 125,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 16,
        topPercent: 12.5,
        heightPercent: 25,
        dateDebut: new Date("2026-06-10T06:30:00.000Z"),
        dateFin: new Date("2026-06-10T07:30:00.000Z"),
        idEtudiant: "610459",
        etudiant: "VERNIS Gabriel",
        idReferent: 5,
        referent: "M. BORTHWICK",
        idLecteur: 6,
        lecteur: "C. MARQUESUZAA",
        entreprise: "BCM Informatique",
        tuteur: "DARRIEUTORT Alban",
        salle: 126,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 17,
        topPercent: 39.58333333333333,
        heightPercent: 25,
        dateDebut: new Date("2026-06-10T07:35:00.000Z"),
        dateFin: new Date("2026-06-10T08:35:00.000Z"),
        idEtudiant: "610580",
        etudiant: "LOHIER Marylou",
        idReferent: 1,
        referent: "P. LOPISTEGUY",
        idLecteur: 7,
        lecteur: "C. DUTOURNIER",
        entreprise: "BCM Informatique",
        tuteur: "DARRIEUTORT Alban",
        salle: 126,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 18,
        topPercent: 66.66666666666666,
        heightPercent: 29.166666666666668,
        dateDebut: new Date("2026-06-10T08:40:00.000Z"),
        dateFin: new Date("2026-06-10T09:50:00.000Z"),
        idEtudiant: "611000",
        etudiant: "CONSTANS Fanny",
        idReferent: 5,
        referent: "M. BORTHWICK",
        idLecteur: 1,
        lecteur: "P. LOPISTEGUY",
        entreprise: "Geek Tonic",
        tuteur: "ROCQUES Lionel",
        salle: 126,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 19,
        topPercent: 12.5,
        heightPercent: 25,
        dateDebut: new Date("2026-06-10T11:30:00.000Z"),
        dateFin: new Date("2026-06-10T12:30:00.000Z"),
        idEtudiant: "611082",
        etudiant: "MARTIN Solène",
        idReferent: 6,
        referent: "C. MARQUESUZAA",
        idLecteur: 2,
        lecteur: "Y. DOURISBOURE",
        entreprise: "ESTIA",
        tuteur: "BAGIEU Pascal",
        salle: 126,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 20,
        topPercent: 39.58333333333333,
        heightPercent: 25,
        dateDebut: new Date("2026-06-10T12:35:00.000Z"),
        dateFin: new Date("2026-06-10T13:35:00.000Z"),
        idEtudiant: "613453",
        etudiant: "LORIDANT Julien",
        idReferent: 6,
        referent: "C. MARQUESUZAA",
        idLecteur: 3,
        lecteur: "Y. CARPENTIER",
        entreprise: "CDG 33",
        tuteur: "GUIDICE Dorian",
        salle: 126,
        idPlanning: 1,
        allStaff: []          
      },
      {
        id: 21,
        topPercent: 66.66666666666666,
        heightPercent: 25,
        dateDebut: new Date("2026-06-10T13:40:00.000Z"),
        dateFin: new Date("2026-06-10T14:40:00.000Z"),
        idEtudiant: "611107",
        etudiant: "HERRMANN Anthony",
        idReferent: 4,
        referent: "S. VOISIN",
        idLecteur: 4,
        lecteur: "S. VOISIN",
        entreprise: "Geek Tonic",
        tuteur: "BAGIEU Pascal",
        salle: 126,
        idPlanning: 1,
        allStaff: []
      },
      {
        id: 22,
        topPercent: 18.75,
        heightPercent: 25,
        dateDebut: new Date("2026-06-10T11:45:00.000Z"),
        dateFin: new Date("2026-06-10T12:45:00.000Z"),
        idEtudiant: "641353",
        etudiant: "DAVAUD Zelie",
        idReferent: 6,
        referent: "C. MARQUESUZAA",
        idLecteur: 6,
        lecteur: "C. MARQUESUZAA",
        entreprise: "CGI Bordeaux",
        tuteur: "GUILLOT Romain",
        salle: 127,
        idPlanning: 1,
        allStaff: []          
      }
  ],
  "2026-06-12": [
      {
        id: 35,
        topPercent: 12.5,
        heightPercent: 25,
        dateDebut: new Date("2026-06-12T06:30:00.000Z"),
        dateFin: new Date("2026-06-12T07:30:00.000Z"),
        idEtudiant: "611000",
        etudiant: "CONSTANS Fanny",
        idReferent: 3,
        referent: "Y. CARPENTIER",
        idLecteur: 7,
        lecteur: "C. DUTOURNIER",
        entreprise: "Geek Tonic",
        tuteur: "ROCQUES Lionel",
        salle: 131,
        idPlanning: 1,
        allStaff: []          
      },
      {
        id: 36,
        topPercent: 39.58333333333333,
        heightPercent: 29.166666666666668,
        dateDebut: new Date("2026-06-12T07:35:00.000Z"),
        dateFin: new Date("2026-06-12T08:45:00.000Z"),
        idEtudiant: "611082",
        etudiant: "MARTIN Solène",
        idReferent: 3,
        referent: "Y. CARPENTIER",
        idLecteur: 1,
        lecteur: "P. LOPISTEGUY",
        entreprise: "ESTIA",
        tuteur: "BAGIEU Pascal",
        salle: 131,
        idPlanning: 1,
        allStaff: []          
      },
      {
        id: 37,
        topPercent: 70.83333333333334,
        heightPercent: 25,
        dateDebut: new Date("2026-06-12T08:50:00.000Z"),
        dateFin: new Date("2026-06-12T09:50:00.000Z"),
        idEtudiant: "611107",
        etudiant: "HERRMANN Anthony",
        idReferent: 3,
        referent: "Y. CARPENTIER",
        idLecteur: 2,
        lecteur: "Y. DOURISBOURE",
        entreprise: "Geek Tonic",
        tuteur: "BAGIEU Pascal",
        salle: 131,
        idPlanning: 1,
        allStaff: []          
      },
      {
        id: 38,
        topPercent: 12.5,
        heightPercent: 25,
        dateDebut: new Date("2026-06-12T11:30:00.000Z"),
        dateFin: new Date("2026-06-12T12:30:00.000Z"),
        idEtudiant: "613453",
        etudiant: "LORIDANT Julien",
        idReferent: 1,
        referent: "P. LOPISTEGUY",
        idLecteur: 3,
        lecteur: "Y. CARPENTIER",
        entreprise: "CDG 33",
        tuteur: "GUIDICE Dorian",
        salle: 131,
        idPlanning: 1,
        allStaff: []          
      },
      {
        id: 39,
        topPercent: 39.58333333333333,
        heightPercent: 25,
        dateDebut: new Date("2026-06-12T12:35:00.000Z"),
        dateFin: new Date("2026-06-12T13:35:00.000Z"),
        idEtudiant: "641110",
        etudiant: "HAMID Enzo",
        idReferent: 7,
        referent: "C. DUTOURNIER",
        idLecteur: 4,
        lecteur: "S. VOISIN",
        entreprise: "CDG 33",
        tuteur: "GUIDICE Dorian",
        salle: 131,
        idPlanning: 1,
        allStaff: []          
      },
      {
        id: 40,
        topPercent: 66.66666666666666,
        heightPercent: 25,
        dateDebut: new Date("2026-06-12T13:40:00.000Z"),
        dateFin: new Date("2026-06-12T14:40:00.000Z"),
        idEtudiant: "641353",
        etudiant: "DAVAUD Zelie",
        idReferent: 3,
        referent: "Y. CARPENTIER",
        idLecteur: 5,
        lecteur: "M. BORTHWICK",
        entreprise: "CGI Bordeaux",
        tuteur: "GUILLOT Romain",
        salle: 131,
        idPlanning: 1,
        allStaff: []          
      }
  ]
};
  //Infos de la soutenance
  newSoutenance: Soutenance = new Soutenance();
  dateSoutenance: string = '';
  heureDebut: string = '';
  heureFin: string = '';
  enseignantsLecteurs: Staff[] = [];
  newDate!: string;
  allStaff: Staff[] = [];
  //Ce que la modale renvoie
  @Output() cancel = new EventEmitter<void>();

  constructor() {}

  async ngOnInit(): Promise<void> {
    this.convertSlotToSoutenanceData(this.soutenance);
    
    this.allStaff = this.soutenance.allStaff;

    this.dateSoutenance = this.formatDate(this.soutenance.dateDebut, 'Date');

    this.heureDebut = this.formatDate(this.soutenance.dateDebut, 'Heure');
    this.heureFin = this.formatDate(this.soutenance.dateFin, 'Heure');

    this.enseignantsLecteurs = this.getFreeLecteurs(this.soutenance.idReferent, this.dateSoutenance);

    this.newDate = this.formatDate(this.soutenance.dateDebut, 'Date');

    this.isDataLoaded = true;
  }

  convertSlotToSoutenanceData(slot: SlotItem): Soutenance {

    const soutenanceData: Soutenance = {
      idSoutenance: slot.id,
      date: new Date(this.formatDate(slot.dateFin, 'Date')),
      nomSalle: slot.salle,
      heureDebut: this.formatDate(slot.dateDebut, 'Heure'),
      heureFin: this.formatDate(slot.dateFin, 'Heure'),
      idUPPA: slot.idEtudiant,
      idLecteur: slot.idLecteur,
      idPlanning: slot.idPlanning
    };

    return soutenanceData;
  }

  /**
   * Retourne une liste des enseignants qui peuvent remplacer l'enseignant lecteur actuel
   * @param idEnseignantReferent 
   * @param dateSoutenance 
   * @returns Staff[]
   */
  getFreeLecteurs(idEnseignantReferent: number, dateSoutenance: string): Staff[] {
    /*
     * Récupérer les soutenances pour le jour
     * Faire une liste de lecteurs à ne pas inclure avec
     * Faire une liste finale des enseignants qui peuvent remplacer
     */
    let soutenancesDuJour = this.getSoutenancesDuJour(dateSoutenance);

    const idLecteursNonPotentiels = this.getLecteursNonDispo(soutenancesDuJour);
    console.log("idLecteursNonPotentiels : ", idLecteursNonPotentiels);
  
    /**
     * Récupérer l'enseignant référent pour savoir s'il est technique
     * -> S'il est pas technique : l'enseignant lecteur doit être technique
     * -> S'il est technique : l'enseignant lecteur doit pas être technique
     * -> Chaque enseignant lecteur potentiel ne doit pas faire parti de la liste des lecteurs qui sont dans la même journée
     */
    const referentTechnique = this.referentEstTechnique(idEnseignantReferent);
    var lecteursPotentiels: Staff[] = this.getAllPotentialLecteurs(idLecteursNonPotentiels);

    //Si le prof référent n'est pas technique, il faut absolument un enseignant lecteur technique
    if (!referentTechnique) {
      lecteursPotentiels = lecteursPotentiels.filter((l) => l.estTechnique === 1);
    }
    
    lecteursPotentiels = lecteursPotentiels.filter((l) => this.soutenance.idReferent !== l.idPersonnel);
    console.log("lecteurs potentiels : ", lecteursPotentiels);

    return lecteursPotentiels;
  }

  /**
   * Retourne la liste des soutenances pour un jour donné
   * @param dateSoutenance 
   * @returns SlotItem[]
   */
  getSoutenancesDuJour(dateSoutenance: string): SlotItem[] {
    return this.soutenancesJour[dateSoutenance];
  }

  /**
   * Retourne une liste d'identifiants d'enseignants qui ne peuvent pas remplacer le lecteur de la soutenance
   * @param soutenances 
   * @returns number[]
   */
  getLecteursNonDispo(soutenances: SlotItem[]): number[] {

    /**
     * Pour qu'un enseignant ne soit pas en capacité d'en remplacer un autre, 
     * l'heure de fin de sa soutenance doit être inférieure ou égale à l'heure de fin de la soutenance
     * et il ne doit pas être l'enseignant référent ou lecteur actuel de la soutenance
     */
    const heureFin = this.soutenance.dateFin;
    const heureDebut = this.soutenance.dateDebut;

    var idEnseignants: number[] = [];

    for (const s of soutenances) {
      const finS = s.dateFin;
      const debutS = s.dateDebut;
      console.log("id soutenance : ", s.id);

      if (finS >= heureDebut && heureFin >= debutS)
      {
        console.log("id Enseignants insérés : ", s.idLecteur, s.idReferent);
        idEnseignants.push(s.idLecteur);
        idEnseignants.push(s.idReferent);
      }
    }

    idEnseignants = idEnseignants.filter((id, index, tab) => tab.indexOf(id) === index); //Supprime les doublons

    return idEnseignants;
  }

  referentEstTechnique(idReferent: number): boolean {
    if (idReferent > -1) {
      const enseignant = this.allStaff.find(s => s.idPersonnel === idReferent);
      return enseignant?.estTechnique === 1;
    }
    return true;
  }

  getAllPotentialLecteurs(idLecteursBlacklist: number[]): Staff[] {
    if (idLecteursBlacklist.length === 0) return this.allStaff;
    
    return this.allStaff.filter((t) =>
      idLecteursBlacklist.every((lecteur) =>
        lecteur !== t.idPersonnel
    ));
  }

  onJourChange(changed_date: string): void {
    this.newDate = changed_date;
  }

  onCancel() {
    this.cancel.emit(); 
  }

  /**
   * Handles form submission by updating  soutenancesJour
   */
  async onSubmit() {
    if (this.isFormValid()) {
      this.isSubmitting = true;

      let dateChange = false;
      let newSoutenanceDate = this.newSoutenance.date!.toString();

      if (this.newSoutenance.idSoutenance === this.soutenance.id) {
        //heureDebut, heureFin & jour
        if (this.newSoutenance.heureDebut !== this.formatDate(this.soutenance.dateDebut, 'Heure') || this.newSoutenance.heureFin !== this.formatDate(this.soutenance.dateFin, 'Heure'))
        {
          let dateDebut = this.formatDate(this.newSoutenance.date!, 'Date') + " " + this.newSoutenance.heureDebut;
          let dateFin = this.formatDate(this.newSoutenance.date!, 'Date') + " " + this.newSoutenance.heureFin;
          this.soutenance.dateDebut = new Date(dateDebut);
          this.soutenance.dateFin = new Date(dateFin);

          if (this.formatDate(this.soutenance.dateDebut, 'Date') !== newSoutenanceDate)
          {
            dateChange = true;
          }
        }
        //Lecteur
        if (this.newSoutenance.idLecteur !== this.soutenance.idLecteur)
        {
          this.soutenance.idLecteur = this.newSoutenance.idLecteur!;
          this.soutenance.lecteur = await this.loadTeacherData(this.newSoutenance.idLecteur!);
        }
        //Salle
        if (this.newSoutenance.nomSalle = this.soutenance.salle)
        {
          this.soutenance.salle = this.newSoutenance.nomSalle;
        }
      }

      for (const slotsTab of Object.values(this.soutenancesJour)) {
        const i = slotsTab.findIndex(soutenance => soutenance.id === this.soutenance.id);
        if (i !== -1 && !dateChange) {
          slotsTab[i] = this.soutenance;
          break;
        }
        if (i !== -1 && dateChange) //Si la date a changé, on enlève la soutenance du planning
        {
          slotsTab.splice(i, 1);
          this.soutenancesJour[newSoutenanceDate].push(this.soutenance);
        }
      }

      this.isSubmitting = false;
    }
  }

  /**
   * Validates if all required fields in the internship search form are filled correctly
   * @returns Boolean indicating if the form is valid
   */
  isFormValid(): boolean {
    this.newSoutenance.date = new Date(this.newDate);
    this.newSoutenance.heureDebut = this.newSoutenance.heureDebut + ":00";
    this.newSoutenance.heureFin = this.newSoutenance.heureFin + ":00";

    return !!(
      this.newSoutenance.idSoutenance &&
      this.newSoutenance.nomSalle! &&
      this.newSoutenance.date! &&
      this.newSoutenance.heureDebut! &&
      this.newSoutenance.heureFin! &&
      this.newSoutenance.idLecteur!
    );
  }

  async loadTeacherData(idLecteur: number): Promise<string> {
    try {
      const lecteur = this.allStaff.find(s => s.idPersonnel === idLecteur);
      
      if (lecteur) {
        return lecteur.nom! + lecteur.prenom;
      } else {
        throw new Error("Enseignant non trouvé.");
      }
    } catch (error) {
      throw new Error("Enseignant non trouvé.");
    }
  }

  formatDate(pDate: Date, modeAffichage: TypeAffichage): string {
        
    if (pDate === null) return "Erreur de récupération de la date";

    const [jourSemaine, mois, jour, annee, heure] = pDate.toDateString().split(' ');
    let date_locale_str = pDate.toLocaleString("fr-FR");

    const [dateStr, heureStr] = date_locale_str.split(' ');
    let moisNb = dateStr.split('/')[1];
    let heure_formattee = heureStr.split(':')[0] + ":" + heureStr.split(':')[1];

    let result;

    switch (modeAffichage) {
      case 'Date':
        result = `${annee}-${moisNb}-${jour}`;
        break;

      case 'Heure':
        result = heure_formattee;
        break;

      case 'DateHeure':
        result = `${annee}-${moisNb}-${jour} ${heure_formattee}`;
        break;

      case 'DateToStr':
        result = `${dateStr}`;
        break;

      case 'HeureToStr':
        result = heureStr.split(':')[0] + "h" + heureStr.split(':')[1];
        break;

      case 'DateHeureToStr':
        result = `le ${dateStr} à ` + heureStr.split(':')[0] + "h" + heureStr.split(':')[1];
        break;
        
      default:
        result = date_locale_str;
        break;
    }

    return result;
  }
}

type TypeAffichage = 
  | 'Date'
  | 'Heure'
  | 'DateHeure'
  | 'DateToStr'
  | 'HeureToStr'
  | 'DateHeureToStr';

interface SoutenanceLecteur {
	idLecteur: number,
	heureDebut: string,
	heureFin: string
}