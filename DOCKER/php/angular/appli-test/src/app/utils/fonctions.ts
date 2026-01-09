import { ChangeDetectorRef } from "@angular/core";
import { Company } from "../models/company.model";
import { Planning } from "../models/planning.model";
import { SlotItem } from "../models/slotItem.model";
import { Soutenance } from "../models/soutenance.model";
import { Staff } from "../models/staff.model";
import { Student } from "../models/student.model";
import { getDateHeure } from "./timeManagement";




export async function loadSoutenancesForPlanning(planning: Planning, allSoutenances: Soutenance[], slots: SlotItem[], allStudents: Student[], allStaff: Staff[], allCompanies: Company[], cdRef: ChangeDetectorRef): Promise<SlotItem[]> {
    try {
      console.log("Chargement des soutenances pour le planning:", planning.nom);
      const filteredSoutenances = allSoutenances.filter((s) => {
        return s.idPlanning === planning.idPlanning;
      });

      slots = await convertSoutenancesToSlots(filteredSoutenances, allStudents, allStaff, allCompanies);
      console.log("soutenances : ", slots);
      cdRef.detectChanges();
    } catch (error) {
      console.error("Erreur lors du chargement des soutenances:", error);
      slots = [];
    }
    return slots;
  }

export async function convertSoutenancesToSlots(soutenances: Soutenance[], allStudents: Student[], allStaff: Staff[], allCompanies: Company[]): Promise<SlotItem[]> {
    const validSoutenances = soutenances.filter(
      (s) =>
        s.date !== null &&
        s.heureDebut !== null &&
        s.heureFin !== null &&
        s.idLecteur !== null &&
        s.idUPPA != null &&
        s.nomSalle !== null &&
        s.idSoutenance
    );
     return validSoutenances.map(s => {
    const student = allStudents.find(st => st.idUPPA === s.idUPPA);
    const referent = student?.idTuteur 
      ? allStaff.find(f => f.idPersonnel === student.idTuteur)
      : null;

    const lecteur = allStaff.find(f => f.idPersonnel === s.idLecteur);

    const company = student?.idEntreprise 
      ? allCompanies.find(c => c.idEntreprise === student.idEntreprise)
      : null;

    return {
        id: s.idSoutenance,
        topPercent: 0,
        heightPercent: 0,
        dateDebut: getDateHeure(s.date!, s.heureDebut!),
        dateFin: getDateHeure(s.date!, s.heureFin!),
        etudiant: student ? `${student.nom} ${student.prenom}` : "Étudiant inconnu",
        referent: referent ? `${referent.prenom![0]}. ${referent.nom}` : "Pas de référent",
        lecteur: lecteur ? `${lecteur.prenom![0]}. ${lecteur.nom}` : "Lecteur inconnu",
        entreprise: company ? company.raisonSociale! : "Pas d'entreprise",
        salle: s.nomSalle!,
      } ;
  });
}

