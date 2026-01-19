import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Student_TrainingYear_AcademicYear } from "../models/student-trainingYear-academicYear.model";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, catchError, tap, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class StudentTrainingYearAcademicYearService {
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // Récupère toutes les relations étudiant / année de formation / année universitaire
  getStudentsTrainingYearsAcademicYears(
    fields?: string[]
  ): Observable<Student_TrainingYear_AcademicYear[]> {
    let params = new HttpParams();
    if (fields && fields.length > 0) {
      params = params.set("fields", fields.join(","));
    }

    return this.http
      .get<Student_TrainingYear_AcademicYear[]>(
        `${this.apiUrl}/api/etudiants-annee-formation`,
        { params }
      )
      .pipe(
        tap((response) => this.log(response)),
        catchError((error) => this.handleError(error, []))
      );
  }

  // Filtrer les relations selon idUPPA, idTrainingYear ou idAcademicYear
  filterStudentsTrainingYearsAcademicYears(
    paramsObj: Partial<Student_TrainingYear_AcademicYear>
  ): Observable<Student_TrainingYear_AcademicYear[]> {
    let params = new HttpParams();
    Object.keys(paramsObj).forEach((key) => {
      const value = (paramsObj as any)[key];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http
      .get<Student_TrainingYear_AcademicYear[]>(
        `${this.apiUrl}/api/etudiants-annee-formation/filter`,
        { params }
      )
      .pipe(
        tap((response) => this.log(response)),
        catchError((error) => this.handleError(error, []))
      );
  }

  // Créer une nouvelle relation étudiant / année de formation / année universitaire
  createStudentTrainingYearAcademicYear(
    payload: Student_TrainingYear_AcademicYear
  ): Observable<Student_TrainingYear_AcademicYear | null> {
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json" }),
    };

    return this.http
      .post<Student_TrainingYear_AcademicYear>(
        `${this.apiUrl}/api/etudiants-annee-formation`,
        payload,
        httpOptions
      )
      .pipe(
        tap((response) => this.log(response)),
        catchError((error) => this.handleError(error, null))
      );
  }

  // Supprime une relation étudiant / année de formation / année universitaire
  deleteStudentTrainingYearAcademicYear(
    payload: Student_TrainingYear_AcademicYear
  ): Observable<null> {
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json" }),
      body: payload,
    };

    return this.http
      .delete<null>(`${this.apiUrl}/api/etudiants-annee-formation`, httpOptions)
      .pipe(
        tap((response) => this.log(response)),
        catchError((error) => this.handleError(error, null))
      );
  }

  // Log la réponse de l'API
  private log(response: any) {
    console.table(response);
  }

  // Retourne l'erreur en cas de problème avec l'API
  private handleError(error: any, errorValue: any) {
    console.error("Erreur API StudentTrainingYearAcademicYearService :", error);
    return of(errorValue);
  }
}
