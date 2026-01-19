import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Soutenance, SoutenanceCreate, SoutenanceUpdate } from "../models/soutenance.model";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, catchError, tap, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SoutenanceService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  //Sélection des soutenances
  getSoutenances(fields?: string[]): Observable<Soutenance[]> {
    let params = new HttpParams();

    if (fields && fields.length > 0) {
      params = params.set("fields", fields.join(","));
    }

    return this.http
      .get<Soutenance[]>(`${this.apiUrl}/api/soutenance`, { params })
      .pipe(
        tap((response) => this.log(response)),
        catchError((error) => this.handleError(error, undefined))
      );
  }

  //Sélection de la soutenance correspondant à l'identifiant passé en paramètre
  getSoutenanceById(
    id: number,
    fields?: string[]
  ): Observable<Soutenance | undefined> {
    let params = new HttpParams();

    if (fields && fields.length > 0) {
      params = params.set("fields", fields.join(","));
    }

    return this.http
      .get<Soutenance>(`${this.apiUrl}/api/soutenance/${id}`, { params })
      .pipe(
        tap((response) => this.log(response)),
        catchError((error) => this.handleError(error, undefined))
      );
  }

  //Ajout d'une soutenance
  addSoutenance(soutenance: Soutenance): Observable<Soutenance> {
    const httpOptions = {
      headers: new HttpHeaders({ "Content-type": "application/json" }),
    };

    return this.http
      .post<Soutenance>(
        `${this.apiUrl}/api/soutenance`,
        soutenance,
        httpOptions
      )
      .pipe(
        tap((response) => this.log(response)),
        catchError((error) => this.handleError(error, null))
      );
  }

  // Ajout de plusieurs soutenances en une seule requête
  addManySoutenances(soutenances: SoutenanceCreate[]): Observable<Soutenance[]> {
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json" }),
    };

    return this.http
      .post<Soutenance[]>(
        `${this.apiUrl}/api/soutenance/create-many`,
        soutenances,
        httpOptions
      )
      .pipe(
        tap((response) => this.log(response)),
        catchError((error) => this.handleError(error, []))
      );
  }

  //Mise à jour d'une soutenance
  updateSoutenance(soutenance: Soutenance): Observable<null> {
    const httpOptions = {
      headers: new HttpHeaders({ "Content-type": "application/json" }),
    };

    return this.http
      .put(
        `${this.apiUrl}/api/soutenance/update/${soutenance.idSoutenance}`,
        soutenance,
        httpOptions
      )
      .pipe(
        tap((response) => this.log(response)),
        catchError((error) => this.handleError(error, null))
      );
  }

  //Mise à jour de plusieurs soutenance
  updateManySoutenance(soutenances: SoutenanceUpdate[]): Observable<null> {
    const httpOptions = {
      headers: new HttpHeaders({ "Content-type": "application/json" }),
    };
    const payload = { soutenances: soutenances };
    console.log(JSON.stringify(payload, null, 2));
    return this.http
      .put(
        `${this.apiUrl}/api/soutenance/update-many`,
        payload,
        httpOptions
      )
      .pipe(
        tap((response) => this.log(response)),
        catchError((error) => this.handleError(error, null))
      );
  }

  //Supression d'une soutenance
  deleteSoutenance(soutenance: Soutenance): Observable<null> {
    return this.http
      .delete(`${this.apiUrl}/api/soutenance/delete/${soutenance.idSoutenance}`)
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
