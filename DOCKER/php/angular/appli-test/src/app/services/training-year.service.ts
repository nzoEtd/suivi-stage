import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { TrainingYear, TrainingYearCreate } from '../models/training-year.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainingYearService {
    apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    //Récupérer toutes les années de formation
    getTrainingYears(fields?: string[]): Observable<TrainingYear[]> {
        let params = new HttpParams();

        if (fields && fields.length > 0) {
        params = params.set('fields', fields.join(','));
        }

        return this.http.get<TrainingYear[]>(`${this.apiUrl}/api/anneeForm`, {params}).pipe(
        tap(response => this.log(response)),
        catchError(error => this.handleError(error, null))
        );

    }

    // Selection de l'année de formation correspondant à l'id fourni
    getTrainingYearById(TrainingYearId: number, fields?: string[]): Observable<TrainingYear | undefined> {
        let params = new HttpParams();

        if (fields && fields.length > 0) {
        params = params.set('fields', fields.join(','));
        }

        return this.http.get<TrainingYear>(`${this.apiUrl}/api/anneeForm/${TrainingYearId}`, {params}).pipe(
        tap(response => this.log(response)),
        catchError(error => this.handleError(error, null))
        );
    }
    
    
      //Ajout d'une année de formation
      addTrainingYear(ty: TrainingYearCreate): Observable<TrainingYear> {
        const httpOptions = {
          headers: new HttpHeaders({ "Content-type": "application/json" }),
        };
    
        return this.http.post<TrainingYear>(`${this.apiUrl}/api/anneeForm`, ty, httpOptions).pipe(
          tap((response) => this.log(response)),
          catchError((error) => this.handleError(error, null)),
        );
      }
    
      //Mise à jour d'une année de formation
      updateTrainingYear(ty: TrainingYear): Observable<null> {
        const httpOptions = {
          headers: new HttpHeaders({ "Content-type": "application/json" }),
        };
    
        return this.http
          .put(`${this.apiUrl}/api/anneeForm/update/${ty.idAnneeFormation}`, ty, httpOptions)
          .pipe(
            tap((response) => this.log(response)),
            catchError((error) => this.handleError(error, null)),
          );
      }
    
      //Supression d'une année de formation
      deleteTrainingYear(ty: TrainingYear): Observable<null> {
        return this.http.delete(`${this.apiUrl}/api/anneeForm/delete/${ty.idAnneeFormation}`).pipe(
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