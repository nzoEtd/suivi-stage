import { Injectable } from "@angular/core";
import { TD, TDCreate } from "../models/td.model";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, catchError, tap, of } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class TDService {
  constructor(private http: HttpClient) {}
  apiUrl = environment.apiUrl;

  //Renvoit tous les TDs
  getTDs(fields?: string[]): Observable<TD[]> {
    let params = new HttpParams();

    if (fields && fields.length > 0) {
      params = params.set("fields", fields.join(","));
    }

    return this.http.get<TD[]>(`${this.apiUrl}/api/tds`, { params }).pipe(
      tap((response) => this.log(response)),
      catchError((error) => this.handleError(error, null)),
    );
  }

  //Sélection du TD correspondant à l'identifiant passé en paramètre
  getTDById(TDId: number, fields?: string[]): Observable<TD | undefined> {
    let params = new HttpParams();

    if (fields && fields.length > 0) {
      params = params.set("fields", fields.join(","));
    }

    return this.http.get<TD>(`${this.apiUrl}/api/tds/${TDId}`, { params }).pipe(
      tap((response) => this.log(response)),
      catchError((error) => this.handleError(error, null)),
    );
  }


  //Ajout d'un TD
  addTD(td: TDCreate): Observable<TD> {
    const httpOptions = {
      headers: new HttpHeaders({ "Content-type": "application/json" }),
    };

    return this.http.post<TD>(`${this.apiUrl}/api/tds`, td, httpOptions).pipe(
      tap((response) => this.log(response)),
      catchError((error) => this.handleError(error, null)),
    );
  }

  //Mise à jour d'un TD
  updateTD(td: TD): Observable<null> {
    const httpOptions = {
      headers: new HttpHeaders({ "Content-type": "application/json" }),
    };

    return this.http
      .put(`${this.apiUrl}/api/tds/update/${td.idTD}`, td, httpOptions)
      .pipe(
        tap((response) => this.log(response)),
        catchError((error) => this.handleError(error, null)),
      );
  }

  //Supression d'un TD
  deleteTD(td: TD): Observable<null> {
    return this.http.delete(`${this.apiUrl}/api/tds/delete/${td.idTD}`).pipe(
      tap((response) => this.log(response)),
      catchError((error) => this.handleError(error, null)),
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
