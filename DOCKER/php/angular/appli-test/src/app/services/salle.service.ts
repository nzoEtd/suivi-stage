import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Salle } from "../models/salle.model";
import { catchError, Observable, of, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SalleService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  //Sélection de toutes les salles
  getSalles(): Observable<Salle[]> {
    return this.http.get<Salle[]>(`${this.apiUrl}/api/salle`).pipe(
      tap((response) => this.log(response)),
      catchError((error) => this.handleError(error, null))
    );
  }

  //Retourne oui ou non selon si la salle est disponible
  getDisponibiliteSalle(nomSalle: number): Observable<Salle | undefined> {
    let params = new HttpParams();

    params = params.set("fields", nomSalle);

    return this.http
      .get<Salle>(`${this.apiUrl}/api/salle/${nomSalle}`, { params })
      .pipe(
        tap((response) => this.log(response)),
        catchError((error) => this.handleError(error, undefined))
      );
  }

  //Mise à jour d'une salle
  updateSalle(salle: Salle): Observable<null> {
    const httpOptions = {
      headers: new HttpHeaders({ "Content-type": "application/json" }),
    };

    return this.http
      .put(
        `${this.apiUrl}/api/salle/update/${salle.nomSalle}`,
        salle,
        httpOptions
      )
      .pipe(
        tap((response) => this.log(response)),
        catchError((error) => this.handleError(error, null))
      );
  }

  //Log la réponse de l'API
  private log(response: any) {
    console.table(response);
  }

  //Retourne l'erreur en cas de problème avec l'API
  private handleError(error: Error, errorValue: any) {
    console.error(error);
    return of(errorValue);
  }
}
