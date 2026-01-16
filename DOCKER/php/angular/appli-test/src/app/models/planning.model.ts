export class Planning {
    idPlanning: number;
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
    idPlanning: number = 0,
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
      this.idPlanning = idPlanning;
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


  export interface PlanningCreate {
  nom: string | null;
  idAnneeFormation: number | null;
  dateDebut: string | null;
  dateFin: string | null;
  heureDebutMatin: string | null;
  heureDebutAprem: string | null;
  heureFinMatin: string | null;
  heureFinAprem: string | null;
  dureeSoutenance: number | null;
}
