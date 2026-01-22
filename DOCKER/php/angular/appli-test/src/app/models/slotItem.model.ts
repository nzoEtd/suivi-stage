
export interface SlotItem {
    id: number;
    topPercent: number;
    heightPercent: number;
    dateDebut: Date | null;
    dateFin: Date | null;
    idUPPA: string;
    etudiant: string;
    referent: string;
    idLecteur: number;
    lecteur: string;
    entreprise: string;
    tuteur: string;
    salle: number | null;
    // duree: number | null;
}