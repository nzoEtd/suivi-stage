'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">stage-management-iut documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="index.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AddFactsheetComponent.html" data-type="entity-link" >AddFactsheetComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AddFactsheets1Component.html" data-type="entity-link" >AddFactsheets1Component</a>
                            </li>
                            <li class="link">
                                <a href="components/AddFactsheets2Component.html" data-type="entity-link" >AddFactsheets2Component</a>
                            </li>
                            <li class="link">
                                <a href="components/AddFactsheets3Component.html" data-type="entity-link" >AddFactsheets3Component</a>
                            </li>
                            <li class="link">
                                <a href="components/AddFactsheets4Component.html" data-type="entity-link" >AddFactsheets4Component</a>
                            </li>
                            <li class="link">
                                <a href="components/AddFactsheets5Component.html" data-type="entity-link" >AddFactsheets5Component</a>
                            </li>
                            <li class="link">
                                <a href="components/AddFactsheets6Component.html" data-type="entity-link" >AddFactsheets6Component</a>
                            </li>
                            <li class="link">
                                <a href="components/AddFactsheets7Component.html" data-type="entity-link" >AddFactsheets7Component</a>
                            </li>
                            <li class="link">
                                <a href="components/AddFactsheets8Component.html" data-type="entity-link" >AddFactsheets8Component</a>
                            </li>
                            <li class="link">
                                <a href="components/AddFactsheets9Component.html" data-type="entity-link" >AddFactsheets9Component</a>
                            </li>
                            <li class="link">
                                <a href="components/AddScheduleComponent.html" data-type="entity-link" >AddScheduleComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AddSearchFormComponent.html" data-type="entity-link" >AddSearchFormComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AddUpdateScheduleComponent.html" data-type="entity-link" >AddUpdateScheduleComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AppComponent.html" data-type="entity-link" >AppComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BackConfirmationModalComponent.html" data-type="entity-link" >BackConfirmationModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/BreadcrumbComponent.html" data-type="entity-link" >BreadcrumbComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardComponent.html" data-type="entity-link" >DashboardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DeleteConfirmationModalComponent.html" data-type="entity-link" >DeleteConfirmationModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FactsheetsComponent.html" data-type="entity-link" >FactsheetsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FactsheetsStudentTabComponent.html" data-type="entity-link" >FactsheetsStudentTabComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ListStudentTabComponent.html" data-type="entity-link" >ListStudentTabComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoadingComponent.html" data-type="entity-link" >LoadingComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ModaleComponent.html" data-type="entity-link" >ModaleComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ModalePlanningComponent.html" data-type="entity-link" >ModalePlanningComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ModaleSoutenanceComponent.html" data-type="entity-link" >ModaleSoutenanceComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/NavigationTabsComponent.html" data-type="entity-link" >NavigationTabsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ScheduleBoardComponent.html" data-type="entity-link" >ScheduleBoardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ScheduleComponent.html" data-type="entity-link" >ScheduleComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SearchDetailsComponent.html" data-type="entity-link" >SearchDetailsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SearchesStudentTabComponent.html" data-type="entity-link" >SearchesStudentTabComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SheetDetailsComponent.html" data-type="entity-link" >SheetDetailsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SlotComponent.html" data-type="entity-link" >SlotComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StatsCardsComponent.html" data-type="entity-link" >StatsCardsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StudentDashboardManagerComponent.html" data-type="entity-link" >StudentDashboardManagerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/StudentFactsheetsManagerComponent.html" data-type="entity-link" >StudentFactsheetsManagerComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TutorAttributionModalComponent.html" data-type="entity-link" >TutorAttributionModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UnderDevelopmentComponent.html" data-type="entity-link" >UnderDevelopmentComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UpdateFactsheet1Component.html" data-type="entity-link" >UpdateFactsheet1Component</a>
                            </li>
                            <li class="link">
                                <a href="components/UpdateFactsheetComponent.html" data-type="entity-link" >UpdateFactsheetComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UpdateFactsheets2Component.html" data-type="entity-link" >UpdateFactsheets2Component</a>
                            </li>
                            <li class="link">
                                <a href="components/UpdateFactsheets3Component.html" data-type="entity-link" >UpdateFactsheets3Component</a>
                            </li>
                            <li class="link">
                                <a href="components/UpdateFactsheets4Component.html" data-type="entity-link" >UpdateFactsheets4Component</a>
                            </li>
                            <li class="link">
                                <a href="components/UpdateFactsheets5Component.html" data-type="entity-link" >UpdateFactsheets5Component</a>
                            </li>
                            <li class="link">
                                <a href="components/UpdateFactsheets6Component.html" data-type="entity-link" >UpdateFactsheets6Component</a>
                            </li>
                            <li class="link">
                                <a href="components/UpdateFactsheets7Component.html" data-type="entity-link" >UpdateFactsheets7Component</a>
                            </li>
                            <li class="link">
                                <a href="components/UpdateFactsheets8Component.html" data-type="entity-link" >UpdateFactsheets8Component</a>
                            </li>
                            <li class="link">
                                <a href="components/UpdateFactsheets9Component.html" data-type="entity-link" >UpdateFactsheets9Component</a>
                            </li>
                            <li class="link">
                                <a href="components/UpdateScheduleComponent.html" data-type="entity-link" >UpdateScheduleComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UpdateSearchComponent.html" data-type="entity-link" >UpdateSearchComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/WelcomeComponent.html" data-type="entity-link" >WelcomeComponent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AcademicYear.html" data-type="entity-link" >AcademicYear</a>
                            </li>
                            <li class="link">
                                <a href="classes/Career.html" data-type="entity-link" >Career</a>
                            </li>
                            <li class="link">
                                <a href="classes/Company.html" data-type="entity-link" >Company</a>
                            </li>
                            <li class="link">
                                <a href="classes/CompanyTutor.html" data-type="entity-link" >CompanyTutor</a>
                            </li>
                            <li class="link">
                                <a href="classes/Factsheets.html" data-type="entity-link" >Factsheets</a>
                            </li>
                            <li class="link">
                                <a href="classes/InternshipSearch.html" data-type="entity-link" >InternshipSearch</a>
                            </li>
                            <li class="link">
                                <a href="classes/Planning.html" data-type="entity-link" >Planning</a>
                            </li>
                            <li class="link">
                                <a href="classes/Salle.html" data-type="entity-link" >Salle</a>
                            </li>
                            <li class="link">
                                <a href="classes/Soutenance.html" data-type="entity-link" >Soutenance</a>
                            </li>
                            <li class="link">
                                <a href="classes/Staff.html" data-type="entity-link" >Staff</a>
                            </li>
                            <li class="link">
                                <a href="classes/Student.html" data-type="entity-link" >Student</a>
                            </li>
                            <li class="link">
                                <a href="classes/Student_Staff_AcademicYear.html" data-type="entity-link" >Student_Staff_AcademicYear</a>
                            </li>
                            <li class="link">
                                <a href="classes/Student_Staff_AcademicYear_String.html" data-type="entity-link" >Student_Staff_AcademicYear_String</a>
                            </li>
                            <li class="link">
                                <a href="classes/Student_TD_AcademicYear.html" data-type="entity-link" >Student_TD_AcademicYear</a>
                            </li>
                            <li class="link">
                                <a href="classes/Student_TrainingYear_AcademicYear.html" data-type="entity-link" >Student_TrainingYear_AcademicYear</a>
                            </li>
                            <li class="link">
                                <a href="classes/TD.html" data-type="entity-link" >TD</a>
                            </li>
                            <li class="link">
                                <a href="classes/TrainingYear.html" data-type="entity-link" >TrainingYear</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AcademicYearService.html" data-type="entity-link" >AcademicYearService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CareerService.html" data-type="entity-link" >CareerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CompanyService.html" data-type="entity-link" >CompanyService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CompanyTutorService.html" data-type="entity-link" >CompanyTutorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DataStoreService.html" data-type="entity-link" >DataStoreService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FactsheetsService.html" data-type="entity-link" >FactsheetsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FormDataService.html" data-type="entity-link" >FormDataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InitService.html" data-type="entity-link" >InitService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InternshipSearchService.html" data-type="entity-link" >InternshipSearchService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NavigationService.html" data-type="entity-link" >NavigationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PlanningService.html" data-type="entity-link" >PlanningService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SalleService.html" data-type="entity-link" >SalleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SoutenanceService.html" data-type="entity-link" >SoutenanceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StaffService.html" data-type="entity-link" >StaffService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StudentService.html" data-type="entity-link" >StudentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StudentStaffAcademicYearService.html" data-type="entity-link" >StudentStaffAcademicYearService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StudentTdAcademicYearService.html" data-type="entity-link" >StudentTdAcademicYearService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StudentTrainingYearAcademicYearService.html" data-type="entity-link" >StudentTrainingYearAcademicYearService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TDService.html" data-type="entity-link" >TDService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TrainingYearService.html" data-type="entity-link" >TrainingYearService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/algorithmResponse.html" data-type="entity-link" >algorithmResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AppData.html" data-type="entity-link" >AppData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BreadcrumbItem.html" data-type="entity-link" >BreadcrumbItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ExcelResponse.html" data-type="entity-link" >ExcelResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PlanningCreate.html" data-type="entity-link" >PlanningCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PlanningUpdate.html" data-type="entity-link" >PlanningUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SlotItem.html" data-type="entity-link" >SlotItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SoutenanceCreate.html" data-type="entity-link" >SoutenanceCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SoutenanceUpdate.html" data-type="entity-link" >SoutenanceUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TDCreate.html" data-type="entity-link" >TDCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimeBlock.html" data-type="entity-link" >TimeBlock</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimeBlockConfig.html" data-type="entity-link" >TimeBlockConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TrainingYearCreate.html" data-type="entity-link" >TrainingYearCreate</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});