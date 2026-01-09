import { ChangeDetectorRef } from "@angular/core";
import { Company } from "../models/company.model";
import { Planning } from "../models/planning.model";
import { SlotItem } from "../models/slotItem.model";
import { Soutenance } from "../models/soutenance.model";
import { Staff } from "../models/staff.model";
import { Student } from "../models/student.model";
import { CompanyTutor } from "../models/company-tutor.model";


export function getDatesBetween(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(start);
    const endDate = new Date(end);

    while (currentDate <= endDate) {
      const day = currentDate.getDay();
      if (day !== 0 && day !== 6) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

export async function loadSoutenancesForPlanning(planning: Planning, allSoutenances: Soutenance[], slots: SlotItem[], allStudents: Student[], allStaff: Staff[], allCompanies: Company[], allTutors: CompanyTutor[], cdRef: ChangeDetectorRef): Promise<SlotItem[]> {
    try {
      console.log("Chargement des soutenances pour le planning:", planning.nom);
      const filteredSoutenances = allSoutenances.filter((s) => {
        return s.idPlanning === planning.idPlanning;
      });

      slots = await convertSoutenancesToSlots(filteredSoutenances, allStudents, allStaff, allCompanies, allTutors);
      console.log("soutenances : ", slots);
      cdRef.detectChanges();
    } catch (error) {
      console.error("Erreur lors du chargement des soutenances:", error);
      slots = [];
    }
    return slots;
  }

export async function convertSoutenancesToSlots(soutenances: Soutenance[], allStudents: Student[], allStaff: Staff[], allCompanies: Company[], allTutors: CompanyTutor[]): Promise<SlotItem[]> {
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

    const tutor = allTutors.find(t => t.idEntreprise === company?.idEntreprise);

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
        tuteur: tutor ? `${tutor.nom} ${tutor.prenom}` : "Tuteur d'entreprise inconnu",
        salle: s.nomSalle!,
      } ;
  });
}

export function getDateHeure(date: Date, heure: string): Date {
    const [heures, minutes] = heure.split(":").map(Number);

    const dateFinale = new Date(date);
    dateFinale.setHours(heures, minutes, 0, 0);

    return dateFinale;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

export function getAllSallesUsed(sallesDispo: number[], jour:Date, slots: SlotItem[]): number[] {
  const salles: number[] = [];
  slots.forEach(slot => {
    sallesDispo.forEach(salle => {
      if(salle === slot.salle && !salles.includes(salle) && isSameDay(slot.dateDebut, jour)){
        salles.push(salle);
      }
    });
  });

  return salles;
}