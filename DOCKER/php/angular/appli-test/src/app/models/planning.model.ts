//ATTENTION
//Champ role implenté de manière à ne pouvoir attribuer qu'un seul role à un personnel en attendant
//d'implémenter la classe d'entité role et la classe d'association Posseder_Role
export class Planning {
  id: number;
  nom: string | null;
  idAnneeFormation: number | null;
  dateDebut: Date | null;
  dateFin: Date | null;
  heureDebutMatin: string | null;
  heureDebutAprem: string | null;
  heureFinMatin: string | null;
  heureFinAprem: string | null;
  dureeSoutenance: number | null;

  constructor(
    id: number = 0,
    nom: string = '',
    idAnneeFormation: number = 0,
    dateDebut: Date = new Date(),
    dateFin: Date = new Date(),
    heureDebutMatin: string = '',
    heureDebutAprem: string = '',
    heureFinMatin: string = '',
    heureFinAprem: string = '',
    dureeSoutenance: number = 0

  ) {
    this.id = id;
    this.nom = nom;
    this.idAnneeFormation = idAnneeFormation;
    this.dateDebut = dateDebut;
    this.dateFin = dateFin;
    this.heureDebutMatin = heureDebutMatin;
    this.heureDebutAprem = heureDebutAprem;
    this.heureFinMatin = heureFinMatin;
    this.heureFinAprem = heureFinAprem;
    this.dureeSoutenance = dureeSoutenance
  }
}