export class Student_Staff_AcademicYear_String {
    idAnneeUniversitaire: number;
    anneeUniversitaire: string;
    idPersonnel: number;
    nomPersonnel: string;
    prenomPersonnel: string;
    idUPPA: string;
    nomEtudiant: string;
    prenomEtudiant: string;
  
    constructor(
        idAnneeUniversitaire: number,
        anneeUniversitaire: string,
        idPersonnel: number,
        nomPersonnel: string,
        prenomPersonnel: string,
        idUPPA: string,
        nomEtudiant: string,
        prenomEtudiant: string
    ) {
        this.idAnneeUniversitaire = idAnneeUniversitaire;
        this.anneeUniversitaire = anneeUniversitaire;
        this.idPersonnel = idPersonnel;
        this.nomPersonnel = nomPersonnel;
        this.prenomPersonnel = prenomPersonnel;
        this.idUPPA = idUPPA;
        this.nomEtudiant = nomEtudiant;
        this.prenomEtudiant = prenomEtudiant;
    }
}