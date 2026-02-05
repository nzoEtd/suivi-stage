import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Student_TD_AcademicYear } from '../models/student-td-academicYear.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentTdAcademicYearService {
    apiUrl = environment.apiUrl;
   
    constructor(private http: HttpClient) {}

    getStudentsTDsAcademicYears(fields?: string[]): Observable<Student_TD_AcademicYear[]> {
        let params = new HttpParams();

        if (fields && fields.length > 0) {
        params = params.set('fields', fields.join(','));
        }

        return this.http.get<Student_TD_AcademicYear[]>(`${this.apiUrl}/api/etudiants-td-annee-univ`, {params}).pipe(
        tap(response => this.log(response)),
        catchError(error => this.handleError(error, null))
        );
    }


      // Filtrer les relations selon idUPPA, idTrainingYear ou idAcademicYear
      filterStudentsTrainingYearsAcademicYears(
        paramsObj: Partial<Student_TD_AcademicYear>
      ): Observable<Student_TD_AcademicYear[]> {
        let params = new HttpParams();
        Object.keys(paramsObj).forEach((key) => {
          const value = (paramsObj as any)[key];
          if (value !== undefined && value !== null) {
            params = params.set(key, value.toString());
          }
        });
    
        return this.http
          .get<Student_TD_AcademicYear[]>(
            `${this.apiUrl}/api/etudiants-td-annee-univ/filter`,
            { params }
          )
          .pipe(
            tap((response) => this.log(response)),
            catchError((error) => this.handleError(error, []))
          );
      }
    
      // Créer une nouvelle relation étudiant / TD / année universitaire
      createStudentTrainingYearAcademicYear(
        payload: Student_TD_AcademicYear
      ): Observable<Student_TD_AcademicYear | null> {
        const httpOptions = {
          headers: new HttpHeaders({ "Content-Type": "application/json" }),
        };
    
        return this.http
          .post<Student_TD_AcademicYear>(
            `${this.apiUrl}/api/etudiants-td-annee-univ`,
            payload,
            httpOptions
          )
          .pipe(
            tap((response) => this.log(response)),
            catchError((error) => this.handleError(error, null))
          );
      }
    
      // Supprime une relation étudiant / TD / année universitaire
      deleteStudentTrainingYearAcademicYear(
        payload: Student_TD_AcademicYear
      ): Observable<null> {
        const httpOptions = {
          headers: new HttpHeaders({ "Content-Type": "application/json" }),
          body: payload,
        };
    
        return this.http
          .delete<null>(`${this.apiUrl}/api/etudiants-td-annee-univ`, httpOptions)
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