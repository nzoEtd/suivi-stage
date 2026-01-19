import { ChangeDetectorRef } from "@angular/core";
import { Company } from "../models/company.model";
import { Planning } from "../models/planning.model";
import { SlotItem } from "../models/slotItem.model";
import { Soutenance } from "../models/soutenance.model";
import { Staff } from "../models/staff.model";
import { Student } from "../models/student.model";
import { getDateHeure, isSameDay } from "./timeManagement";
import { CompanyTutor } from "../models/company-tutor.model";
import { StudentStaffAcademicYearService } from "../services/student-staff-academicYear.service";
import { Student_TrainingYear_AcademicYear } from "../models/student-trainingYear-academicYear.model";
import { forkJoin } from "rxjs";
import { Student_Staff_AcademicYear } from "../models/student-staff-academicYear.model";
import { AcademicYear } from "../models/academic-year.model";
import { Student_Staff_AcademicYear_String } from "../models/student-staff-academicYear-string.model";

export async function loadSoutenancesForPlanning(planning: Planning, allSoutenances: Soutenance[], slots: SlotItem[], allStudents: Student[], allStaff: Staff[], allCompanies: Company[], allTutors: CompanyTutor[], referents: Student_Staff_AcademicYear_String[], trainingAcademicYears: Student_TrainingYear_AcademicYear[], academicYears: AcademicYear[], cdRef: ChangeDetectorRef): Promise<SlotItem[]> {
    try {
      console.log("Chargement des soutenances pour le planning:", planning.nom);
      const filteredSoutenances = allSoutenances.filter((s) => {
        return s.idPlanning === planning.idPlanning;
      });

      slots = await convertSoutenancesToSlots(filteredSoutenances, allStudents, allStaff, allCompanies, allTutors, referents, trainingAcademicYears, academicYears);
      console.log("soutenances : ", slots);
      cdRef.detectChanges();
    } catch (error) {
      console.error("Erreur lors du chargement des soutenances:", error);
      slots = [];
    }
    return slots;
  }

export async function convertSoutenancesToSlots(soutenances: Soutenance[], allStudents: Student[], allStaff: Staff[], allCompanies: Company[], allTutors: CompanyTutor[], referents: Student_Staff_AcademicYear_String[], trainingAcademicYears: Student_TrainingYear_AcademicYear[], academicYears: AcademicYear[]): Promise<SlotItem[]> {
    const validSoutenances = soutenances.filter(
      (s) =>
        s.date !== null &&
        s.heureDebut !== null &&
        s.heureFin !== null &&
        s.idLecteur !== null &&
        s.idUPPA != null &&
        s.nomSalle !== null &&
        s.idSoutenance &&
        s.idPlanning
    );
     return validSoutenances.map(s => {
    const student = allStudents.find(st => st.idUPPA === s.idUPPA);
    const studentYear = trainingAcademicYears.find(a => a.idUPPA === s.idUPPA);
    const academicYear = academicYears.find(a => a.idAnneeUniversitaire === studentYear?.idAcademicYear);
    const referent = referents.find(r => r.idUPPA === student?.idUPPA && r.idAnneeUniversitaire === studentYear?.idAcademicYear);

    const lecteur = allStaff.find(f => f.idPersonnel === s.idLecteur);

    const company = student?.idEntreprise 
      ? allCompanies.find(c => c.idEntreprise === student.idEntreprise)
      : null;

    const tutor = student?.idTuteur 
    ? allTutors.find(f => f.idTuteur === student.idTuteur)
    : null;

    return {
        id: s.idSoutenance,
        topPercent: 0,
        heightPercent: 0,
        dateDebut: getDateHeure(s.date!, s.heureDebut!),
        dateFin: getDateHeure(s.date!, s.heureFin!),
        idEtudiant: s.idUPPA!,
        etudiant: student ? `${student.nom} ${student.prenom}` : "Étudiant inconnu",
        idReferent: referent ? referent.idPersonnel : -1,
        referent: referent ? `${referent.prenomPersonnel![0]}. ${referent.nomPersonnel}` : "Pas de référent",
        idLecteur: lecteur ? lecteur.idPersonnel : -1,
        lecteur: lecteur ? `${lecteur.prenom![0]}. ${lecteur.nom}` : "Lecteur inconnu",
        entreprise: company ? company.raisonSociale! : "Pas d'entreprise",
        tuteur: tutor ? `${tutor.nom} ${tutor.prenom}` : "Tuteur d'entreprise inconnu",
        salle: s.nomSalle!,
        idPlanning: s.idPlanning!
      } ;
  });
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