import { ChangeDetectorRef } from "@angular/core";
import { Company } from "../models/company.model";
import { Planning } from "../models/planning.model";
import { SlotItem } from "../models/slotItem.model";
import { Soutenance, SoutenanceCreate } from "../models/soutenance.model";
import { Staff } from "../models/staff.model";
import { Student } from "../models/student.model";
import { buildDate, formatDate, getDateHeure, isSameDay } from "./timeManagement";
import { CompanyTutor } from "../models/company-tutor.model";
import { StudentStaffAcademicYearService } from "../services/student-staff-academicYear.service";
import { Student_TrainingYear_AcademicYear } from "../models/student-trainingYear-academicYear.model";
import { forkJoin } from "rxjs";
import { Student_Staff_AcademicYear } from "../models/student-staff-academicYear.model";
import { AcademicYear } from "../models/academic-year.model";
import { Student_Staff_AcademicYear_String } from "../models/student-staff-academicYear-string.model";
import { CreneauDisponible } from "./types";
import { FormGroup } from "@angular/forms";

export async function loadSoutenancesForPlanning(
  planning: Planning,
  allSoutenances: Soutenance[],
  slots: SlotItem[],
  allStudents: Student[],
  allStaff: Staff[],
  allCompanies: Company[],
  allTutors: CompanyTutor[],
  referents: Student_Staff_AcademicYear_String[],
  trainingAcademicYears: Student_TrainingYear_AcademicYear[],
  academicYears: AcademicYear[],
  cdRef: ChangeDetectorRef,
): Promise<SlotItem[]> {
  try {
    console.log("Chargement des soutenances pour le planning:", planning.nom);
    const filteredSoutenances = allSoutenances.filter((s) => {
      return s.idPlanning === planning.idPlanning;
    });

    slots = await convertSoutenancesToSlots(
      filteredSoutenances,
      allStudents,
      allStaff,
      allCompanies,
      allTutors,
      referents,
      trainingAcademicYears,
      planning.idAnneeUniversitaire,
    );
    console.log("soutenances : ", slots);
    cdRef.detectChanges();
  } catch (error) {
    console.error("Erreur lors du chargement des soutenances:", error);
    slots = [];
  }
  return slots;
}

export async function convertSoutenancesToSlots(
  soutenances: Soutenance[],
  allStudents: Student[],
  allStaff: Staff[],
  allCompanies: Company[],
  allTutors: CompanyTutor[],
  referents: Student_Staff_AcademicYear_String[],
  trainingAcademicYears: Student_TrainingYear_AcademicYear[],
  academicYearId: number | null,
): Promise<SlotItem[]> {
  const validSoutenances = soutenances.filter(
    (s) =>
      s.date !== null &&
      s.heureDebut !== null &&
      s.heureFin !== null &&
      s.idLecteur !== null &&
      s.idUPPA != null &&
      s.nomSalle !== null,
  );
  console.log(validSoutenances);
  return validSoutenances.map((s) => {
    const student = allStudents.find((st) => st.idUPPA === s.idUPPA);

    const referent = academicYearId
      ? referents.find(
          (r) =>
            r.idUPPA === student?.idUPPA &&
            r.idAnneeUniversitaire === academicYearId,
        )
      : undefined;

    const lecteur = allStaff.find((f) => f.idPersonnel === s.idLecteur);

    const company = student?.idEntreprise
      ? allCompanies.find((c) => c.idEntreprise === student.idEntreprise)
      : null;

    const tutor = student?.idTuteur
      ? allTutors.find((f) => f.idTuteur === student.idTuteur)
      : null;

    return {
      id: s.idSoutenance,
      topPercent: 0,
      heightPercent: 0,
      dateDebut: getDateHeure(s.date!, s.heureDebut!),
      dateFin: getDateHeure(s.date!, s.heureFin!),
      idUPPA: s.idUPPA ? s.idUPPA : "Numéro étudiant inconnu",
      etudiant: student
        ? `${student.nom} ${student.prenom}`
        : "Étudiant inconnu",
      idReferent: referent ? referent.idPersonnel : -1,
      referent: referent
        ? `${referent.prenomPersonnel![0]}. ${referent.nomPersonnel}`
        : "Pas de référent",
      idLecteur: s.idLecteur ? s.idLecteur : 0,
      lecteur: lecteur
        ? `${lecteur.prenom![0]}. ${lecteur.nom}`
        : "Lecteur inconnu",
      entreprise: company ? company.raisonSociale! : "Pas d'entreprise",
      tuteur: tutor
        ? `${tutor.nom} ${tutor.prenom}`
        : "Tuteur d'entreprise inconnu",
      salle: s.nomSalle!,
      duree: null,
      tierTemps: student ? student.tierTemps : false,
    };
  });
}

export function getAllSallesUsed(
  sallesDispo: number[],
  jour: Date,
  slots: SlotItem[],
  newSlots?: SlotItem[],
): number[] {
  const salles: number[] = [];
  slots.forEach((slot) => {
    sallesDispo.forEach((salle) => {
      if (
        salle === slot.salle &&
        !salles.includes(salle) &&
        isSameDay(slot.dateDebut!, jour)
      ) {
        salles.push(salle);
      }
    });
  });
  if(newSlots){
    newSlots.forEach((slot) => {
      sallesDispo.forEach((salle) => {
        if (
          salle === slot.salle &&
          !salles.includes(salle) &&
          isSameDay(slot.dateDebut!, jour)
        ) {
          salles.push(salle);
        }
      });
    });
  }
  return salles;
}

export function createSlotsFromStudents(allStudents: Student[], allCompanies: Company[], allTutors: CompanyTutor[], referents: Student_Staff_AcademicYear_String[], academicYearId: number|null, slotDuration: number, slotDurationTierTemps: number): SlotItem[] {
  const slots: SlotItem[] = [];
  allStudents.forEach(student => {
    const referent = academicYearId? referents.find(r => r.idUPPA === student?.idUPPA && r.idAnneeUniversitaire === academicYearId): undefined;
    const company = student?.idEntreprise 
      ? allCompanies.find(c => c.idEntreprise === student.idEntreprise)
      : null;
    const tutor = student?.idTuteur 
    ? allTutors.find(f => f.idTuteur === student.idTuteur)
    : null;
    
    const slot = {
      id: crypto.randomUUID(),
      topPercent: 0,
      heightPercent: 0,
      dateDebut: null,
      dateFin: null,
      idUPPA: student ? student.idUPPA : "Numéro étudiant inconnu",
      etudiant: student ? `${student.nom} ${student.prenom}` : "Étudiant inconnu",
      tierTemps: student?.tierTemps ? student.tierTemps : false,
      idReferent: referent ? referent?.idPersonnel : 0,
      referent: referent ? `${referent.prenomPersonnel![0]}. ${referent.nomPersonnel}` : "Pas de référent",
      idLecteur: -1,
      lecteur: "Pas de lecteur",
      entreprise: company ? company.raisonSociale! : "Pas d'entreprise",
      tuteur: tutor ? `${tutor.nom} ${tutor.prenom}` : "Tuteur d'entreprise inconnu",
      salle: null,
      duree: student?.tierTemps ? slotDurationTierTemps : slotDuration,
    };
    slots.push(slot);
  })
  return slots;
}

export function updateLecteur(keepCurrentLecteur = false, soutenancesJour: Record<string, SlotItem[]>, soutenance: SlotItem, allStaff: Staff[]): Staff | null {
  console.log("tt les trucs sont là ?", keepCurrentLecteur, soutenancesJour, soutenance, allStaff)
  const dateDeb = formatDate(soutenance.dateDebut!, "Date");
  const heureDeb = formatDate(soutenance.dateDebut!, "Heure");
  const heureFin = formatDate(soutenance.dateFin!, "Heure");
  console.log("les dates ?", dateDeb, heureDeb, heureFin)
  
  const heureDebutDate = buildDate(dateDeb, heureDeb);
  const heureFinDate = buildDate(dateDeb, heureFin);

  const soutenances = soutenancesJour[dateDeb] || [];

  const idNonDisponibles = soutenances
    .filter(
      (s) =>
        s.id !== soutenance.id &&
        isOverlap(
          heureDebutDate,
          heureFinDate,
          s.dateDebut!,
          s.dateFin!,
        ),
    )
    .flatMap((s) => [s.idLecteur, s.idReferent]);

  const referentTechnique = referentEstTechnique(
    soutenance.idReferent,
    allStaff,
  );

  let enseignantsLecteurs = allStaff.filter((s) => {
    if (idNonDisponibles.includes(s.idPersonnel)) {
      console.log("non dispo :", s.nom)
      return false;
    }
    if (s.idPersonnel === soutenance.idReferent) {
      console.log("c déjà le référent :", s.nom)
      return false;
    }
    if (!referentTechnique && !s.estTechnique) {
      console.log("le référent est pas technique et lui non plus :", s.nom)
      return false;
    }
    console.log("c tt bon :", s.nom)
    return true;
  });
  console.log("lecteurs après leur truc ?", enseignantsLecteurs)

  let lecteur = enseignantsLecteurs.find(
    (e) => e.idPersonnel === soutenance.idLecteur,
  ) ?? null;

  if (keepCurrentLecteur) {
    const lecteurActuelDispo = enseignantsLecteurs.some(
      (e) => e.idPersonnel === soutenance.idLecteur,
    );
    if (!lecteurActuelDispo) {
      lecteur = enseignantsLecteurs[0] ?? null;
    }
  } else {
    const toujoursDispo = enseignantsLecteurs.some(
      (e) => e.idPersonnel === lecteur?.idPersonnel,
    );
    if (!toujoursDispo) {
      lecteur = enseignantsLecteurs[0] ?? null;
    }
  }
  return lecteur;
}

export function isOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && end1 > start2;
}

export function referentEstTechnique(idReferent: number, allStaff: Staff[]): boolean {
  const enseignant = allStaff.find((s) => s.idPersonnel === idReferent);
  return enseignant?.estTechnique || false;
}