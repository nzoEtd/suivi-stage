export class Salle {
    nomSalle: number;
    estDispo: boolean | null;
  
    constructor(
      nomSalle: number,
      estDispo: boolean
    ) {
      this.nomSalle = nomSalle;
      this.estDispo = estDispo;
    }
}