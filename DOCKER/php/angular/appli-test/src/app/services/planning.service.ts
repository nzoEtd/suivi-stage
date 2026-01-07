import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Planning } from '../models/planning.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  //Sélection des plannings
  getPlannings(fields?: string[]): Observable<Planning[]> {
    let params = new HttpParams();
    
    if (fields && fields.length > 0) {
      params = params.set('fields', fields.join(','));
    }

    return this.http.get<Planning[]>(`${this.apiUrl}/api/planning`, {params}).pipe(
      tap(response => this.log(response)),
      catchError(error => this.handleError(error, undefined))
    );
  }

  //Sélection du planning correspondant à l'identifiant passé en paramètre
  getPlanningById(id: number, fields?: string[]): Observable<Planning | undefined> {
    let params = new HttpParams();
    
    if (fields && fields.length > 0) {
      params = params.set('fields', fields.join(','));
    }

    return this.http.get<Planning>(`${this.apiUrl}/api/planning/${id}`, {params}).pipe(
      tap(response => this.log(response)),
      catchError(error => this.handleError(error, undefined))
    );
  }

  runAlgorithm(startMorningTime: number, endMorningTime: number, startAfternoonTime: number, endAfternoonTime: number, normalPresentationLength: number, accommodatedPresentationLength: number, inBetweenBreakLength: number, maxTeachersWeeklyWorkedTime: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/api/run-algo-planning/${startMorningTime}-${endMorningTime}-${startAfternoonTime}-${endAfternoonTime}-${normalPresentationLength}-${accommodatedPresentationLength}-${inBetweenBreakLength}-${maxTeachersWeeklyWorkedTime}`);
  }

  //Ajout d'un planning
  addPlanning(planning: Planning): Observable<Planning> {
    const httpOptions = {
      headers: new HttpHeaders({'Content-type': 'application/json'})
    };


    return this.http.post<Planning>(`${this.apiUrl}/api/planning/create`, planning, httpOptions).pipe(
      tap(response => this.log(response)),
      catchError(error => this.handleError(error, null))
    );
  }

  //Mise à jour d'un planning
  updatePlanning(planning: Planning): Observable<null> {
    const httpOptions = {
      headers: new HttpHeaders({'Content-type': 'application/json'})
    };

    return this.http.put(`${this.apiUrl}/api/planning/update/${planning.idPlanning}`, planning, httpOptions).pipe(
      tap(response => this.log(response)),
      catchError(error => this.handleError(error, null))
    );
  }

  //Supression d'un planning
  deletePlanning(planning: Planning): Observable<null> {
    return this.http.delete(`${this.apiUrl}/api/planning/delete/${planning.idPlanning}`).pipe(
      tap(response => this.log(response)),
      catchError(error => this.handleError(error, null))
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