import { CreneauDisponible } from "./types";

// sort by day, then room, then hours
export function sortCreneaux(
  creneaux: CreneauDisponible[],
): CreneauDisponible[] {
  return creneaux.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.salle !== b.salle) return a.salle - b.salle;
    return a.heureDebut.localeCompare(b.heureDebut);
  });
}
