import { SlotItem } from "../models/slotItem.model";

export function getDatesUsed(slot: SlotItem[]): Date[] {
  const dates: Date[] = [];
  
  slot.forEach(s => {
    const date = new Date(s.dateDebut!.toLocaleDateString('fr-CA').slice(0, 10));
    date.setHours(0, 0, 0, 0);
    if(!dates.some(d => d.getTime() == date.getTime())){
      dates.push(date);
    }
  });
  dates.sort((a, b) => a.getTime() - b.getTime());

  return dates;
}

export function getDateHeure(date: Date, heure: string): Date {
  const [heures, minutes] = heure.split(":").map(Number);

  const dateFinale = new Date(date);
  dateFinale.setHours(heures, minutes, 0, 0);

  return dateFinale;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDateToYYYYMMDD(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function passWeekends(
  date: Date | null,
  daysToPass: number,
  lastWeekend: Date,
): [Date, number, Date] {
  if (date) {
    console.log("avant passWeekends : ", date, daysToPass);
    let newDate = addDays(date, daysToPass);
    console.log("premier ajout de jour : ", newDate, daysToPass);
    if (newDate.getDay() == 6 && daysToPass == 0) {
      lastWeekend = date;
      console.log("premier samedi : ", lastWeekend);
      daysToPass = 2;
      newDate = addDays(date, daysToPass);
    } else if (newDate.getDay() == 0 && daysToPass == 0) {
      daysToPass = 1;
      newDate = addDays(date, daysToPass);
    } else if (
      newDate.getDay() == 6 &&
      daysToPass != 0 &&
      daysToPass != 1 &&
      lastWeekend
    ) {
      console.log("samedi suivant : ", lastWeekend);
      if (formatDateToYYYYMMDD(newDate) != formatDateToYYYYMMDD(lastWeekend)) {
        daysToPass += 2;
        newDate = addDays(date, daysToPass);
      }
    }
    console.log("après passWeekends : ", newDate, daysToPass, lastWeekend);

    return [newDate, daysToPass, lastWeekend];
  }
  return [new Date(NaN), daysToPass, lastWeekend];
}

export function dateToHoursStr(d: Date): string {
  return (
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  );
}

export function buildDate(dateStr: string, heureStr: string): Date {
  return new Date(`${dateStr}T${heureStr}:00`);
}

export function formatDate(pDate: Date, mode: "Date" | "Heure"): string {
  return mode === "Date" ? formatDateToYYYYMMDD(pDate) : dateToHoursStr(pDate);
}

export function formatStringDate(pDate: string): string {
  if (!pDate) return "";
  const [annee, mois, jour] = pDate.split("-");
  return `${jour}/${mois}/${annee}`;
}
