export class Salle {
    nomSalle: number;
    estDisponible: boolean | null;
  
    constructor(
      nomSalle: number,
      estDisponible: boolean
    ) {
      this.nomSalle = nomSalle;
      this.estDisponible = estDisponible;
    }
}