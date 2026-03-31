import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Student } from "../models/student.model";
import { Staff } from "../models/staff.model";
import { catchError, delay, Observable, of, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  apiUrl = environment.apiUrl;
  currentUser?: Student | Staff;

  constructor(private readonly http: HttpClient) {}

  getAuthenticatedUser(): Observable<Student | Staff | undefined> {
    // const savedUser = sessionStorage.getItem('currentUser');
    // if (savedUser && savedUser != "undefined") {
    //   this.currentUser = JSON.parse(savedUser);
    //   return of(this.currentUser);
    // }
    // else {
    //   return this.http.get<Student | Staff>(`${this.apiUrl}/api/get-authenticated-user`, { withCredentials: true }).pipe(
    //     tap(response => sessionStorage.setItem('currentUser', JSON.stringify(response))),
    //     tap(response => this.log(response)),
    //     catchError(error => this.handleError(error, []))
    //   );
    // }
    const currentUser: Staff = {
      idPersonnel: 1,
      role: "INTERNSHIP_MANAGER",
      nom: "LOPISTEGUY",
      prenom: "Philippe",
      adresse: "1 rue de l'université",
      ville: "Anglet",
      codePostal: "64600",
      telephone: "+33601020304",
      adresseMail: "philippe.lopisteguy@iutbayonne.univ-pau.fr",
      longitudeAdresse: "-1.5",
      latitudeAdresse: "43.5",
      quotaEtudiant: 16,
      estTechnique: true,
    };
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

    return of(currentUser).pipe(delay(300));
  }

  logout() {
    // Clear session storage first
    sessionStorage.removeItem("currentUser");
    this.currentUser = undefined;

    // First, clear cookies
    this.http
      .get(`${this.apiUrl}/api/logout`, { withCredentials: true })
      .subscribe({
        next: () => {
          window.location.href = `${this.apiUrl}/api/cas-logout`;
        },
        error: (error) => {
          console.error("Erreur lors de la déconnexion:", error);
        },
      });
  }

  isAuthenticated(): boolean {
    const savedUser = sessionStorage.getItem("currentUser");
    if (savedUser && savedUser != "undefined") {
      return true;
    }
    return false;
  }

  isStudent(user: Student | Staff | undefined): user is Student {
    return !!user && "idUPPA" in user;
  }

  isStaff(user: Student | Staff | undefined): user is Staff {
    return !!user && "idPersonnel" in user;
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
