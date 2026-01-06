import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Student_TrainingYear_AcademicYear } from '../models/student-trainingYear-academicYear.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentTrainingYearAcademicYearService {
    apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    getStudentsTrainingYearsAcademicYears(fields?: string[]): Observable<Student_TrainingYear_AcademicYear[]> {
        let params = new HttpParams();

        if (fields && fields.length > 0) {
        params = params.set('fields', fields.join(','));
        }
        return this.http.get<Student_TrainingYear_AcademicYear[]>(`${this.apiUrl}/api/`, {params}).pipe(
            tap(response => this.log(response)),
            catchError(error => this.handleError(error, null))
        );
    }

    getAffectationByUppaAndTraining(studentId: string, trainingId: number, fields?: string[]): Observable<Student_TrainingYear_AcademicYear | null> {
        let params = new HttpParams();

        if (fields && fields.length > 0) {
            params = params.set('fields', fields.join(','));
        }

        return this.http.get<Student_TrainingYear_AcademicYear[]>(`${this.apiUrl}/api/`, {params}).pipe(
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