export class Soutenance {
    idSoutenance: number;
    date: Date | null;
    nomSalle: number | null;
    heureDebut: string | null;
    heureFin: string | null;
    idUPPA: string | null;
    idLecteur: number | null;
    idPlanning: number | null;
  
    constructor(
      idSoutenance: number = 0,
      date: Date = new Date(),
      nomSalle: number = 0,
      heureDebut: string = '',
      heureFin: string = '',
      idUPPA: string = '',
      idLecteur: number = 0,
      idPlanning: number = 0,
    ) {
      this.idSoutenance = idSoutenance;
      this.date = date;
      this.nomSalle = nomSalle;
      this.heureDebut = heureDebut;
      this.heureFin = heureFin;
      this.idUPPA = idUPPA;
      this.idLecteur = idLecteur;
      this.idPlanning = idPlanning;
    }
  }