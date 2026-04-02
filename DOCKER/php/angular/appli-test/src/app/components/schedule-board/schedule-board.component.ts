import { CommonModule } from "@angular/common";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectorRef,
} from "@angular/core";
import { SlotComponent } from "../slot/slot.component";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatGridListModule } from "@angular/material/grid-list";
import { SlotItem } from "../../models/slotItem.model";
import { TimeBlock, TimeBlockConfig } from "../../models/timeBlock.model";
import { isSameDay } from "../../utils/timeManagement";
import { ToastrService } from "ngx-toastr";
import { CdkDrag, CdkDragDrop, CdkDropList } from "@angular/cdk/drag-drop";
import { Salle } from "../../models/salle.model";
import { SalleService } from "../../services/salle.service";
import { forkJoin } from "rxjs";
import { ModaleComponent } from "../modale/modale.component";
import { OverlayModule } from "@angular/cdk/overlay";
import { TrainingYear } from "../../models/training-year.model";
import { Student } from "../../models/student.model";
import { TrainingYearService } from "../../services/training-year.service";
import { StudentService } from "../../services/student.service";
import { AcademicYearService } from "../../services/academic-year.service";
import { Company } from "../../models/company.model";
import { CompanyTutor } from "../../models/company-tutor.model";
import { Student_Staff_AcademicYear_String } from "../../models/student-staff-academicYear-string.model";
import { CompanyService } from "../../services/company.service";
import { CompanyTutorService } from "../../services/company-tutor.service";
import { StudentStaffAcademicYearService } from "../../services/student-staff-academicYear.service";
import { createSlotsFromStudents, updateLecteur } from "../../utils/fonctions";
import { Staff } from "../../models/staff.model";
import { StaffService } from "../../services/staff.service";

@Component({
  selector: "app-schedule-board",
  imports: [
    CommonModule,
    SlotComponent,
    MatGridListModule,
    CdkDrag /*, 
    CdkDragPlaceholder*/,
    CdkDropList,
    ModaleComponent,
    OverlayModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: "./schedule-board.component.html",
  styleUrls: ["./schedule-board.component.css"],
})
export class ScheduleBoardComponent implements OnInit, OnChanges {
  @Input() jourActuel!: Date;
  @Input() slots!: SlotItem[];
  @Input() sallesDispo!: number[];
  @Input() timeBlocks!: TimeBlockConfig[];
  @Input() onlyDisplay!: boolean;
  @Input() planningByDay: Record<string, SlotItem[]> = {};
  @Input() idPromoActuelle: number | null = null;

  @Output() editSlot = new EventEmitter<SlotItem>();
  @Output() slotUpdated = new EventEmitter<{
    planningByDay: Record<string, SlotItem[]>;
    items: SlotItem[];
    itemsToAdd: SlotItem[];
  }>();

  toastr = inject(ToastrService);

  blocks: TimeBlock[] = [];
  PAUSE_HEIGHT = 15;
  slotDuration: number = 0;
  slotDurationTierTemps: number = 0;
  allStaff: Staff[] = [];

  //Variables pour les modales
  isModalOpen: boolean = false;
  modalStudent: boolean = true;
  dropdownOpen: boolean = false;
  submitted: boolean = false;
  isSubmitting: boolean = false;
  salles: Salle[] = [];
  selectedSalles: Salle[] = [];
  modalOpen: boolean = false;
  title: string = "";
  newItems: SlotItem[] = [];
  itemsToAdd: SlotItem[] = [];
  promos: TrainingYear[] = [];
  students: Student[] = [];
  selectedStudents: Student[] = [];
  planningForm!: FormGroup;
  currentAcademicYearId!: number;
  allCompanies: Company[] = [];
  allTutors: CompanyTutor[] = [];
  referents: Student_Staff_AcademicYear_String[] = [];
  hasValue: boolean = false;
  autoOpen: boolean = false;

  // Variables for drag and drop
  private slotsCache = new Map<TimeBlock, SlotItem[]>();
  items: SlotItem[] = [];
  dropError: string[] = [];
  isRendering: boolean = true;

  private pointerDown = false;
  private startX = 0;
  private startY = 0;

  // Ligne guide des heures
  isDragging: boolean = false;
  guideLineY: number = 0;
  guideLineTime: string = "";
  currentBlock: TimeBlock | null = null;

  teacherInSlot: number[] = [];

  constructor(
    private cdRef: ChangeDetectorRef,
    private salleService: SalleService,
    private trainingYearService: TrainingYearService,
    private studentService: StudentService,
    private fb: FormBuilder,
    private academicYearService: AcademicYearService,
    private companiesService: CompanyService,
    private tutorService: CompanyTutorService,
    private studentStaffService: StudentStaffAcademicYearService,
    private staffService: StaffService,
  ) {}

  async ngOnInit() {
    forkJoin({
      promos: this.trainingYearService.getTrainingYears(),
      academicYear: this.academicYearService.getCurrentAcademicYear(),
      allCompanies: this.companiesService.getCompanies(),
      allTutors: this.tutorService.getCompanyTutors(),
      referents: this.studentStaffService.getAllStudentTeachers(),
      staff: this.staffService.getStaffs(),
    }).subscribe(
      ({ promos, academicYear, allCompanies, allTutors, referents, staff }) => {
        this.promos = promos.filter(
          (p) => p.idAnneeFormation != this.idPromoActuelle,
        );
        this.currentAcademicYearId = academicYear?.idAnneeUniversitaire || 0;
        this.allCompanies = allCompanies;
        this.allTutors = allTutors;
        this.referents = referents;
        this.allStaff = staff;
      },
    );

    const PX_PER_HOUR = 100 /60;
    
    const converted = this.timeBlocks.map((b: TimeBlockConfig) => {
      const startMin = this.toMinutes(b.start);
      const endMin = this.toMinutes(b.end);
      const duration = endMin - startMin;
      const heightPx = duration * PX_PER_HOUR;

      return {
        ...b,
        startMin,
        endMin,
        duration,
        heightPx,
      };
    });

    // Total minutes (pauses exclues)
    // const totalMinutes =
    //   converted.reduce((sum, b) => sum + (b.duration ?? 0), 0);

    // Pourcentage de hauteur de chaque bloc
    this.blocks = converted/*.map((b) => ({
      ...b,
      heightPercent: (b.duration / totalMinutes) * 100,
    }))*/;

    this.blocks.forEach((block) => {
      this.slotsCache.set(
        block,
        this.calculateSlotsInBlock(
          block,
          this.planningByDay[this.jourActuel.toLocaleDateString('fr-CA').slice(0, 10)],
        ),
      );
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // Détecter si planningByDay a changé
    if (changes["planningByDay"] && !changes["planningByDay"].firstChange) {
      console.log(
        "planningByDay mis à jour dans l'enfant:",
        this.planningByDay,
      );

      // Reconstruire le cache avec les nouvelles données
      this.rebuildSlotsCache();
      this.cdRef.detectChanges();
    }
    // Détecter si jourActuel a changé et qu'il n'y a aucune soutenance dedans
    if (
      changes["jourActuel"] &&
      !changes["jourActuel"].firstChange &&
      this.sallesDispo.length == 0 &&
      !this.onlyDisplay
    ) {
      console.log("jourActuel:", this.jourActuel);

      // Ouvrir la modale d'ajout de salle
      this.autoOpen = true;
      this.openModalRoom();
    }
  }

  toMinutes(str: string): number {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  }

  getHours(startMin: number, endMin: number): string[] {
    const hours: string[] = [];

    const startH = Math.floor(startMin / 60);
    const endH = Math.floor(endMin / 60);

    for (let h = startH; h <= endH; h++) {
      hours.push(h.toString().padStart(2, "0"));
    }

    return hours;
  }

  // getQuarterHourMarks(block: TimeBlock): number {
  //   // Nombre de quarts d'heure dans le bloc (durée du bloc en minutes / 15)
  //   return Math.floor(block.duration / 15);
  // }

  getQuarterHourPositions(block: TimeBlock): { position: number; isHour: boolean }[] {
    const result: { position: number; isHour: boolean }[] = [];
    const startMin = block.startMin;
    const endMin = block.endMin;
    const duration = block.duration;
    
    // Trouver le premier quart d'heure après le début
    const firstQuarter = Math.ceil(startMin / 15) * 15;
    
    // Générer les positions de tous les quarts d'heure dans le bloc
    for (let min = firstQuarter; min <= endMin; min += 15) {
      const offsetFromStart = min - startMin;
      const percentage = (offsetFromStart / duration) * 100;
      result.push({
        position: percentage,
        isHour: min % 60 === 0,
      });
    }
    // console.log("quarter :", result)
    
    return result;
  }

  // Calculer la position et hauteur de chaque heure
  getHourPositions(block: TimeBlock): {hour: string, min?: string, top: number, height: number}[] {
    const positions: {hour: string, min?: string, top: number, height: number}[] = [];
    const startMin = block.startMin;
    const endMin = block.endMin;
    const duration = block.duration;
    
    const startH = Math.floor(startMin / 60);
    const endH = Math.floor(endMin / 60);

    let h = startH
    
    for (h; h <= endH; h++) {
      const hourStartMin = h * 60;
      const hourEndMin = (h + 1) * 60;
      
      // Calculer quelle portion de cette heure est visible dans le bloc
      const visibleStart = Math.max(hourStartMin, startMin);
      const visibleEnd = Math.min(hourEndMin, endMin);
      
      if (visibleEnd > visibleStart) {
        const top = ((visibleStart - startMin) / duration) * 100;
        const height = ((visibleEnd - visibleStart) / duration) * 100;
        
        if(h == startH && startMin % 60 != 0){
          positions.push({
            hour: h.toString().padStart(2, "0"),
            min: block.start.split(':')[1],
            top,
            height
          });
          if(Number(block.start.split(':')[1]) > 52){
            h++;
          }
        }
        else if(h + 1 >= endMin / 60){
          if(Number(block.end.split(':')[1]) > 7 || endMin % 60 == 0){
            positions.push({
              hour: h.toString().padStart(2, "0"),
              top,
              height
            });
          }
          positions.push({
            hour: block.end.split(':')[0],
            min: endMin % 60 != 0 ? block.end.split(':')[1] : "",
            top: top + height,
            height: 1
          });
        }
        else{
          positions.push({
            hour: h.toString().padStart(2, "0"),
            top,
            height
          });
        }
      }
    }
    // console.log("positions :", positions)
    
    return positions;
  }

  calculateSlotsInBlock(block: TimeBlock, slots: SlotItem[]): SlotItem[] {
    return slots
      .filter((slot) => {
        const startMin =
          slot.dateDebut!.getHours() * 60 + slot.dateDebut!.getMinutes();
        const endMin =
          slot.dateFin!.getHours() * 60 + slot.dateFin!.getMinutes();

        if (block.type === "morning" && endMin > block.endMin) {
          return false;
        }
        if (block.type === "afternoon" && startMin < block.startMin) {
          return false;
        }
        return startMin >= block.startMin && endMin <= block.endMin;
      })
      .map((slot) => {
        const startMin =
          slot.dateDebut!.getHours() * 60 + slot.dateDebut!.getMinutes();
        const endMin =
          slot.dateFin!.getHours() * 60 + slot.dateFin!.getMinutes();

        const top = startMin - block.startMin;
        const height = endMin - startMin;

        slot.topPercent = (top / block.duration) * 100;
        slot.heightPercent = (height / block.duration) * 100;

        return slot;
      });
  }

  slotsInBlock(block: TimeBlock): SlotItem[] {
    this.rebuildSlotsCache();
    return this.slotsCache.get(block) || [];
  }

  checkSameDay(date1: Date, date2: Date): boolean {
    return isSameDay(date1, date2);
  }

  onEditSlot(slot: SlotItem) {
    this.pointerDown = false;
    this.editSlot.emit(slot);
  }

  initFormRoom() {
    this.hasValue = false;
    this.planningForm = this.fb.group({
      salle: [null, Validators.required],
    });
  }

  initFormStudent() {
    this.hasValue = false;
    this.planningForm = this.fb.group({
      idAnneeFormation: [null, Validators.required],
    });
  }

  onStudentToggle(event: Event, student: Student) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedStudents.push(student);
    } else {
      this.selectedStudents = this.selectedStudents.filter(
        (s) => s !== student,
      );
    }
    this.selectedStudents.length
      ? (this.hasValue = true)
      : (this.hasValue = false);
  }

  get selectedStudentsText(): string {
    return this.selectedStudents.length
      ? this.selectedStudents.map((s) => s.nom + " " + s.prenom).join(", ")
      : "-- Sélectionner --";
  }

  get promoSelected(): boolean {
    return this.planningForm.get("idAnneeFormation")?.value != null;
  }

  closeModal() {
    if (this.autoOpen) {
      this.toastr.warning(
        "Aucune soutenance ne pourra être posée",
        "Attention, ce jour n'a pas de salle attribuée.",
      );
    }
    this.modalOpen = false;
    this.autoOpen = false;
  }

  openModalRoom() {
    this.initFormRoom();
    this.salles = [];
    this.selectedSalles = [];
    forkJoin({
      salles: this.salleService.getSalles(),
    }).subscribe(({ salles }) => {
      this.salles = salles.filter(
        (s) =>
          s.estDisponible &&
          !this.sallesDispo.some((salle) => s.nomSalle == salle),
      );
      console.log("salles selectionnables :", this.selectedSalles);
    });

    this.title = "Ajouter une salle pour ce jour";
    this.modalOpen = true;
    this.modalStudent = false;
  }

  addRoom() {
    console.log("salles sélectionnées fin : ", this.selectedSalles);
    this.selectedSalles.forEach((salle) => {
      if (!this.sallesDispo.some((s) => s == salle.nomSalle)) {
        this.sallesDispo.push(salle.nomSalle);
      }
    });

    this.rebuildSlotsCache();
    this.cdRef.detectChanges();
    this.modalOpen = false;
    this.submitted = false;
    this.toastr.warning(
      "Avant de changer de jour, veuillez ajouter un créneau dans la nouvelle salle.",
      "Attention, la salle n'est pas sauvegardée automatiquement",
    );
    this.autoOpen = false;
  }

  onSalleToggle(event: Event, salle: Salle) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedSalles.push(salle);
    } else {
      this.selectedSalles = this.selectedSalles.filter((s) => s !== salle);
    }
    this.selectedSalles.length
      ? (this.hasValue = true)
      : (this.hasValue = false);
  }

  get selectedSallesText(): string {
    return this.selectedSalles.length
      ? this.selectedSalles.map((s) => s.nomSalle).join(", ")
      : "-- Sélectionner --";
  }

  onSubmit() {
    this.submitted = true;
    // console.log("?????", this.planningForm.invalid, this.planningForm, this.selectedStudents, this.planningForm.value)
    if (this.modalStudent && this.planningForm.invalid) return;
    this.isSubmitting = true;
    this.modalStudent ? this.addStudent() : this.addRoom();
    this.isSubmitting = false;
  }

  openModalStudent() {
    this.initFormStudent();
    this.listenPromoChange();

    console.log("y a des slots au moins ?", this.slots);
    const basicSlot = this.slots.find((s) => s.tierTemps == false);
    console.log("un slot basique ?", basicSlot);
    const tierTempsSlot = this.slots.find((s) => s.tierTemps == true);
    console.log("un slot tier-temps ?", tierTempsSlot);
    this.slotDuration =
      basicSlot && basicSlot.dateDebut && basicSlot.dateFin
        ? basicSlot.dateFin.getTime() - basicSlot.dateDebut.getTime()
        : 0;
    this.slotDurationTierTemps =
      tierTempsSlot && tierTempsSlot.dateDebut && tierTempsSlot.dateFin
        ? tierTempsSlot.dateFin.getTime() - tierTempsSlot.dateDebut.getTime()
        : 0;
    console.log(
      "durée basique :",
      this.slotDuration,
      ", durée tier-temps :",
      this.slotDurationTierTemps,
    );

    this.title = "Ajouter une soutenance";
    // this.modalStudent = true;
    this.modalOpen = true;
    this.modalStudent = true;
    this.planningForm.get("idAnneeFormation")?.reset();
    this.students = [];
    this.selectedStudents = [];
  }

  listenPromoChange() {
    this.planningForm
      .get("idAnneeFormation")!
      .valueChanges.subscribe((idPromo) => {
        if (idPromo) {
          this.loadStudents(idPromo);
          console.log("des étudiants ?", this.students);
          this.planningForm.get("etudiants")?.setValue(this.students);
        } else {
          this.students = [];
          this.planningForm.get("etudiants")?.setValue([]);
        }
      });
  }

  loadStudents(idPromo: number) {
    this.studentService.getStudentsByPromo(idPromo).subscribe((students) => {
      this.students = students.filter(
        (s) =>
          !this.itemsToAdd.some((i) => s.idUPPA == i.idUPPA) &&
          !this.items.some((i) => s.idUPPA == i.idUPPA) &&
          !this.slots.some((i) => s.idUPPA == i.idUPPA),
      );
    });
  }

  addStudent() {
    this.newItems = [];
    const newSlots: SlotItem[] = createSlotsFromStudents(
      this.selectedStudents,
      this.allCompanies,
      this.allTutors,
      this.referents,
      this.currentAcademicYearId,
      this.slotDuration,
      this.slotDurationTierTemps,
    );
    console.log("les nouveaux slots :", newSlots);
    newSlots.forEach((slot) => {
      this.newItems.push(slot);
    });
    // this.planningItemsService.addToWaiting(this.newItems);
    this.items = [...this.items, ...this.newItems];
    this.itemsToAdd = [...this.itemsToAdd, ...this.newItems];
    console.log("slot ajoutés à enregistrer : ", this.itemsToAdd);
    this.modalOpen = false;
    this.submitted = false;
  }

  //Fonctions pour drag and drop
  //Fonctions principales
  onDrop(
    event: CdkDragDrop<any>,
    targetDay: Date,
    container: HTMLElement,
    block: TimeBlock,
  ) {
    const draggedSlot = event.item.data as SlotItem;
    const dayKey = targetDay.toLocaleDateString('fr-CA').slice(0, 10);
    this.planningByDay[dayKey] ??= [];

    const prevState = {
      dateDebut: draggedSlot.dateDebut,
      dateFin: draggedSlot.dateFin,
      salle: draggedSlot.salle,
      topPercent: draggedSlot.topPercent,
      heightPercent: draggedSlot.heightPercent,
      idLecteur: draggedSlot.idLecteur,
      lecteur: draggedSlot.lecteur,
    };

    let duration =
      draggedSlot.dateDebut && draggedSlot.dateFin
        ? draggedSlot.dateFin.getTime() - draggedSlot.dateDebut.getTime()
        : null;
    const lastDate = draggedSlot.dateDebut
      ? draggedSlot.dateDebut.toLocaleDateString('fr-CA').slice(0, 10)
      : null;

    if (container && targetDay && block) {
      const rect = container.getBoundingClientRect();

      // Recherche de la salle choisie (retourne null si le slot a été laché en dehors du planning)
      const newRoom = this.xToRoom(event.dropPoint.x);

      if (newRoom === null) {
        //Le slot est drag dans la zone d'attente s'il n'y a aucune salle
        if (!this.items.find((i) => i.id === draggedSlot.id)) {
          draggedSlot.duree = duration;
          draggedSlot.dateDebut = null;
          draggedSlot.dateFin = null;
          draggedSlot.salle = null;
          this.items.push(draggedSlot);

          //Enlever slot de planningByDay
          for (const key in this.planningByDay) {
            this.planningByDay[key] = this.planningByDay[key].filter(
              (s) => s.id !== draggedSlot.id,
            );
          }
        }

        this.rebuildSlotsCache();
        this.cdRef.detectChanges();
      } else if (newRoom == 0){
        console.log("Plage horaire introuvable")
        // Le slot revient à sa place
        this.toastr.error("Plage horaire introuvable", "Impossible de placer la soutenance.");

        this.isRendering = false;
        this.cdRef.detectChanges();

        // ça détruit et refait le planning donc c'est pas beau, chercher mieux
        setTimeout(() => {
          this.isRendering = true;
          this.rebuildSlotsCache();
          this.cdRef.detectChanges();
        }, 0);
        return;
      }
      else {
        // S'il y a une salle le slot est droppé dans la salle au bon endroit
        if (duration == null) {
          duration = draggedSlot.duree;
        }

        const containerTop = rect.top;
        const containerHeight = rect.height;

        // Nouvelles dates et heures du slot (dateDebut, dateFin)
        const [newStart, newBloc] = this.yToDate(
          event.dropPoint.y,
          containerTop,
          containerHeight,
          block.type,
          this.jourActuel,
          duration! / 60000, //durée de la soutenance en minutes
        );

        const newEnd = new Date(newStart.getTime() + duration!);

        // Nouvelle position du slot (topPercent)
        const top =
          newStart.getHours() * 60 + newStart.getMinutes() - newBloc.startMin;
        const newTop = (top / newBloc.duration) * 100;

        const existingSlots = this.planningByDay[dayKey].filter(
          (s) =>
            s.id !== draggedSlot.id &&
            (s.salle === newRoom ||
              (s.dateDebut! < newEnd && s.dateFin! > newStart)),
        );

        // Placement accepté
        draggedSlot.dateDebut = newStart;
        draggedSlot.dateFin = newEnd;
        draggedSlot.salle = newRoom;
        draggedSlot.topPercent = newTop;

        // Ajout/changement d'un lecteur
        let lecteur = updateLecteur(
          true,
          this.planningByDay,
          draggedSlot,
          this.allStaff,
        );
        console.log("y a vrm un lecteur ?", lecteur);
        if (lecteur) {
          draggedSlot.idLecteur = lecteur.idPersonnel;
          draggedSlot.lecteur = `${lecteur.prenom![0]}. ${lecteur.nom}`;
        } else {
          draggedSlot.idLecteur = 0;
          draggedSlot.lecteur = "";
        }
        console.log(
          "ça donne quoi le dragged slot ?",
          draggedSlot.idLecteur,
          draggedSlot.lecteur,
        );

        // Vérification de la disponibilité du créneau choisit et de la disponibilité des profs
        if (
          !this.canPlaceSlot(
            newStart,
            newEnd,
            draggedSlot.referent,
            draggedSlot.lecteur,
            newRoom,
            existingSlots,
          ) ||
          (prevState.dateDebut != null &&
            prevState.dateDebut!.getHours() * 60 +
              prevState.dateDebut!.getMinutes() ==
              newStart.getHours() * 60 + newStart.getMinutes() &&
            prevState.salle == newRoom)
        ) {
          // Le slot revient à sa place
          this.dropError.forEach((e) => {
            this.toastr.error(e, "Impossible de placer la soutenance.");
          });

          //Forcer le slot à se remettre à sa place
          draggedSlot.dateDebut = prevState.dateDebut;
          draggedSlot.dateFin = prevState.dateFin;
          draggedSlot.salle = prevState.salle;
          draggedSlot.topPercent = prevState.topPercent;
          draggedSlot.heightPercent = prevState.heightPercent;
          draggedSlot.idLecteur = prevState.idLecteur;
          draggedSlot.lecteur = prevState.lecteur;

          this.isRendering = false;
          this.cdRef.detectChanges();

          // ça détruit et refait le planning donc c'est pas beau, chercher mieux
          setTimeout(() => {
            this.isRendering = true;
            this.rebuildSlotsCache();
            this.cdRef.detectChanges();
          }, 0);
          return;
        }
        //Si aucune erreur n'est renvoyée alors le lecteur est présent, on averti l'utilisateur s'il a changé
        if (
          prevState.idLecteur != null &&
          prevState.idLecteur != draggedSlot.idLecteur
        ) {
          this.toastr.warning(
            "L'enseignant lecteur précédent n'est pas disponible sur ce créneau\nUn autre lecteur a été sélectionné automatiquement.",
            "Lecteur modifié",
          );
        }

        // Si slot peut être posé et qu'il était en liste d'attente on l'enlève
        this.items = this.items.filter((i) => i.id !== draggedSlot.id);
        // Si le slot a changé de date on le supprime de l'ancienne dans planningByDay
        if (lastDate != null && dayKey !== lastDate) {
          this.planningByDay[lastDate] = this.planningByDay[lastDate].filter(
            (s) => s.id !== draggedSlot.id,
          );
        }

        // Si le slot est pas encore dans planningByDay ou a été supprimé après avoir changé de date on l'y met
        if (!this.planningByDay[dayKey].find((s) => s.id === draggedSlot.id)) {
          this.planningByDay[dayKey].push(draggedSlot);
        }
        this.rebuildSlotsCache();
        this.cdRef.detectChanges();
      }
    }

    this.slotUpdated.emit({
      planningByDay: this.planningByDay,
      items: this.items,
      itemsToAdd: this.itemsToAdd,
    });
  }

  onPlanningDrop(event: CdkDragDrop<any>) {
    const planningEl = document.querySelector(".planning") as HTMLElement;

    if (!planningEl) {
      return;
    }

    // Trouver le bloc (morning / afternoon) et le timerow à partir du Y souris
    const result = this.findBlockAndRowFromY(event.dropPoint.y);

    if (!result) {
      // Le slot revient à sa place
      this.toastr.error("Plage horaire introuvable", "Impossible de placer la soutenance.");

      this.isRendering = false;
      this.cdRef.detectChanges();

      // ça détruit et refait le planning donc c'est pas beau, chercher mieux
      setTimeout(() => {
        this.isRendering = true;
        this.rebuildSlotsCache();
        this.cdRef.detectChanges();
      }, 0);
      return;
    }

    const { block, timeRow } = result;

    this.onDrop(event, this.jourActuel, timeRow, block);
  }

  //Fonctions secondaires
  findBlockAndRowFromY(
    mouseY: number,
  ): { block: TimeBlock; timeRow: HTMLElement } | null {
    const rows = Array.from(
      document.querySelectorAll<HTMLElement>(".time-row"),
    );

    for (let i = 0; i < rows.length; i++) {
      const rect = rows[i].getBoundingClientRect();
      if (mouseY >= rect.top && mouseY <= rect.bottom) {
        return {
          block: this.blocks[i],
          timeRow: rows[i],
        };
      }
    }

    return null;
  }

  overlaps(
    aStart: Date,
    aEnd: Date,
    aSalle: number,
    bStart: Date,
    bEnd: Date,
    bStudent: string,
    bSalle: number,
  ) {
    const hasOverlap = aStart < bEnd && aEnd > bStart && aSalle === bSalle;
    if (hasOverlap) {
      this.dropError.push(
        `La soutenance de ${bStudent} est déjà sur ce créneau dans la salle ${bSalle}.`,
      );
    }
    return hasOverlap;
  }

  teachersOk(
    aReferent: string,
    // aLecteur: string,
    aSalle: number,
    bReferent: string,
    bLecteur: string,
    bSalle: number,
  ) {
    if (aSalle === bSalle) {
      return true;
    }

    const referentOccupe = aReferent == bReferent || aReferent == bLecteur;
    // const lecteurOccupe = aLecteur == bReferent || aLecteur == bLecteur;
    if (referentOccupe) {
      const erreurReferent = `${aReferent} n'est pas disponible pour ce créneau (soutenance en salle ${bSalle}).`;
      if (!this.dropError.includes(erreurReferent)) {
        this.dropError.push(erreurReferent);
      }
    }
    // if (lecteurOccupe) {
    //   const erreurLecteur = `${aLecteur} n'est pas disponible pour ce créneau (soutenance en salle ${bSalle}).`;
    //   if (!this.dropError.includes(erreurLecteur)) {
    //     this.dropError.push(erreurLecteur);
    //   }
    // }
    return !referentOccupe /*&& !lecteurOccupe*/;
  }

  canPlaceSlot(
    start: Date,
    end: Date,
    referent: string,
    lecteur: string,
    salle: number,
    existingSlots: SlotItem[],
  ): boolean {
    this.dropError = [];
    if (lecteur == null || lecteur == "") {
      this.dropError.push("Pas de lecteur disponible pour ce créneau.");
      return false;
    }
    const hasOverlap = existingSlots.some((s) =>
      this.overlaps(
        start,
        end,
        salle,
        s.dateDebut!,
        s.dateFin!,
        s.etudiant,
        s.salle!,
      ),
    );
    if (hasOverlap) {
      return false;
    }
    const teacherAvailable = existingSlots.every((s) =>
      this.teachersOk(
        referent,
        // lecteur,
        salle,
        s.referent,
        s.lecteur,
        s.salle!,
      ),
    );
    return teacherAvailable;
  }

  yToDate(
    mouseY: number,
    containerTop: number,
    containerHeight: number,
    bloc: "morning" | "afternoon",
    day: Date,
    duree: number,
  ): [Date, TimeBlock] {
    let timeBloc = this.blocks.find((b) => b.type == bloc);
    
    if (!timeBloc) {
      throw new Error(`Bloc ${bloc} introuvable`);
    }
  
    const relativeY = mouseY - containerTop;
    const ratio = relativeY / containerHeight;
  
    // Calculer les minutes
    const startMin = timeBloc.startMin;
    const endMin = timeBloc.endMin;
    
    // Position en minutes dans le bloc
    const currentMin = startMin + ratio * (endMin - startMin);
    
    // Arrondir aux 5 minutes près
    let roundedMin = Math.round(currentMin / 5) * 5;
    
    // Vérifier que le slot ne dépasse pas la fin du bloc
    if (roundedMin + duree > endMin) {
      // Ajuster pour que la fin du slot soit à endMin
      roundedMin = endMin - duree;
      
      // Si ça dépasse quand même le début, c'est qu'il n'y a pas assez de place
      if (roundedMin < startMin) {
        roundedMin = startMin;
      }
    }
    
    // Limiter aux bornes du bloc
    roundedMin = Math.max(startMin, Math.min(endMin - duree, roundedMin));
    
    // Arrondir à nouveau aux 5 minutes après ajustement
    roundedMin = Math.round(roundedMin / 5) * 5;
  
    const h = Math.floor(roundedMin / 60);
    const m = roundedMin % 60;
  
    const d = new Date(day);
    d.setHours(h, m, 0, 0);
    
    return [d, timeBloc];
  }

  xToRoom(mouseX: number): number | null {
    // Récupérer toutes les cellules de salle
    const salleCells = Array.from(
      document.querySelectorAll<HTMLElement>(".salle-cell"),
    );
    let lastRect;

    for (const cell of salleCells) {
      const rect = cell.getBoundingClientRect();
      if (mouseX >= rect.left && mouseX <= rect.right) {
        return Number(cell.dataset["salle"]) ?? null;
      }
      lastRect = rect;
    }
    if(lastRect && mouseX > lastRect?.right){
      return 0;
    }

    return null;
  }

  rebuildSlotsCache() {
    this.slotsCache.clear();

    for (const block of this.blocks) {
      this.slotsCache.set(
        block,
        this.calculateSlotsInBlock(
          block,
          this.planningByDay[this.jourActuel.toLocaleDateString('fr-CA').slice(0, 10)],
        ),
      );
    }
  }

  neverEnter = () => false;

  onPointerDown(event: PointerEvent) {
    this.pointerDown = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
  }

  onPointerMove(event: PointerEvent) {
    if (!this.pointerDown || !this.onlyDisplay) return;

    const dx = Math.abs(event.clientX - this.startX);
    const dy = Math.abs(event.clientY - this.startY);

    // seuil pour considérer que c'est un drag
    if (dx > 5 || dy > 5) {
      this.pointerDown = false;
      this.toastr.error(
        "Veuillez cliquer sur le bouton \"modifier\".",
        "Le drag and drop n'est pas utilisable en mode affichage.",
      );
    }
  }

  // Ligne guide des heures et enseignants du slot sélectionné
  onDragStarted(event: any, slot: SlotItem) {
    this.isDragging = true; // Activer la ligne guide
    if (slot.idLecteur) {
      this.teacherInSlot.push(slot.idLecteur);
    }
    if (slot.idReferent) {
      this.teacherInSlot.push(slot.idReferent);
    }
  }

  onDragMoved(event: any, slot: SlotItem) {
    if (!this.isDragging) return;

    let duration =
      slot.dateDebut && slot.dateFin
        ? (slot.dateFin.getTime() - slot.dateDebut.getTime()) / 1000 / 60
        : null;

    const mouseY = event.pointerPosition.y;

    // Trouver le bloc (matin/après-midi) sous la souris
    const result = this.findBlockAndRowFromY(mouseY);

    if (!result) {
      this.currentBlock = null;
      return;
    }

    const { block, timeRow } = result;
    this.currentBlock = block;

    const rowRect = timeRow.getBoundingClientRect();

    // Position Y relative dans la time-row
    const relativeY = mouseY - rowRect.top;
    const ratio = relativeY / rowRect.height;

    // Calculer les minutes
    const startMin = block.startMin; 
    const endMin = block.endMin;   
    
    // Position en minutes dans le bloc
    let currentMin = startMin + ratio * (endMin - startMin);
    
    if (duration && currentMin >= endMin - duration) {
      currentMin = endMin - duration;
    }
    
    // Arrondir aux 5 minutes près
    const roundedMin = Math.round(currentMin / 5) * 5;
    
    // Limiter aux bornes du bloc
    const clampedMin = Math.max(startMin, Math.min(endMin, roundedMin));
    
    // Convertir en heures et minutes
    const h = Math.floor(clampedMin / 60);
    const m = clampedMin % 60;

    // Position Y de la ligne (relative au viewport)
    this.guideLineY = mouseY;

    // Formater l'heure
    this.guideLineTime = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  onDragEnded(event: any) {
    // Cacher la ligne guide
    this.isDragging = false;
    this.currentBlock = null;
    this.teacherInSlot = [];
  }
}
