import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Department } from '../models/department.model';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, tap, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDepartments(fields?: string[]): Observable<Department[]> {
    let params = new HttpParams();

    if (fields && fields.length > 0) {
      params = params.set('fields', fields.join(','));
    }

    return this.http.get<Department[]>(`${this.apiUrl}/api/departements`, {params}).pipe(
      tap(response => this.log(response)),
      catchError(error => this.handleError(error, []))
    );
  }

  getDepartmentById(idDepartment: number, fields?: string[]): Observable<Department | undefined> {
    let params = new HttpParams();

    if (fields && fields.length > 0) {
      params = params.set('fields', fields.join(','));
    }

    return this.http.get<Department>(`${this.apiUrl}/api/departements/${idDepartment}`, {params}).pipe(
      tap(response => this.log(response)),
      catchError((error) => this.handleError(error, undefined))
    );
  }

  addDepartment(department: Department): Observable<Department> {
    const httpOptions = {
      headers: new HttpHeaders({'Content-type': 'application/json'})
    };

    return this.http.post<Department>(`${this.apiUrl}/api/departements/create`, department, httpOptions).pipe(
      tap(response => this.log(response)),
      catchError(error => this.handleError(error, undefined))
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