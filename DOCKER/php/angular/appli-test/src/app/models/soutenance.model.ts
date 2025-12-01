export class Soutenance {
    idSoutenance: number;
    date: Date | null;
    nomSalle: string | null;
    heureDebut: string | null;
    heureFin: string | null;
    idUPPA: number | null;
    idLecteur: number | null;
    idPlanning: number | null;
  
    constructor(
      idSoutenance: number = 0,
      date: Date = new Date(),
      nomSalle: string = '',
      heureDebut: string = '',
      heureFin: string = '',
      idUPPA: number = 0,
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