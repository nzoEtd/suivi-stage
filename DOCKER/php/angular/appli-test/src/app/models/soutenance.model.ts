//ATTENTION
//Champ role implenté de manière à ne pouvoir attribuer qu'un seul role à un personnel en attendant
//d'implémenter la classe d'entité role et la classe d'association Posseder_Role
export class Soutenance {
  id: number;
  date: Date | null;
  nomSalle: string | null;
  heureDebut: string | null;
  heureFin: string | null;
  idUPPA: number | null;
  idLecteur: number | null;
  idPlanning: number | null;

  constructor(
    id: number = 0,
    date: Date = new Date(),
    nomSalle: string = '',
    heureDebut: string = '',
    heureFin: string = '',
    idUPPA: number = 0,
    idLecteur: number = 0,
    idPlanning: number = 0,
  ) {
    this.id = id;
    this.date = date;
    this.nomSalle = nomSalle;
    this.heureDebut = heureDebut;
    this.heureFin = heureFin;
    this.idUPPA = idUPPA;
    this.idLecteur = idLecteur;
    this.idPlanning = idPlanning;
  }
}