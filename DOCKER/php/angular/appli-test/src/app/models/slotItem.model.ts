import { Staff } from "./staff.model";

export interface SlotItem {
    id: number;
    topPercent: number;
    heightPercent: number;
    dateDebut: Date;
    dateFin: Date;
    idUPPA: string;
    etudiant: string;
    tierTemps: boolean;
    referent: string;
    idLecteur: number;
    lecteur: string;
    entreprise: string;
    tuteur: string;
    idPlanning: number;
    allStaff: Staff[];
    salle: number | null;
    duree: number | null;
}