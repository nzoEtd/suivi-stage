import { CommonModule } from "@angular/common";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { SlotComponent } from "../slot/slot.component";
import { MatGridListModule } from "@angular/material/grid-list";
import { SlotItem } from "../../models/slotItem.model";
import { TimeBlock, TimeBlockConfig } from "../../models/timeBlock.model";
import { isSameDay } from "../../utils/timeManagement";
import { CdkDrag,   CdkDragDrop,   CdkDragPlaceholder, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: "app-schedule-board",
  imports: [CommonModule, SlotComponent, MatGridListModule, CdkDrag/*, CdkDragPlaceholder*/, CdkDropList],
  standalone: true,
  templateUrl: "./schedule-board.component.html",
  styleUrls: ["./schedule-board.component.css"],
})
export class ScheduleBoardComponent implements OnInit {
  @Input() jourActuel!: Date;
  @Input() slots!: SlotItem[];
  @Input() sallesDispo!: number[];
  @Input() timeBlocks!: TimeBlockConfig[];
  @Input() onlyDisplay!: boolean;
  @Input() planningByDay: Record<string, SlotItem[]> = {};

  @Output() editSlot = new EventEmitter<SlotItem>();
  @Output() slotUpdated = new EventEmitter<Record<string, SlotItem[]>>();

  blocks: TimeBlock[] = [];
  PAUSE_HEIGHT = 15;
  isModalOpen: boolean = false;

  // Variables for drag and drop
  private slotsCache = new Map<TimeBlock, SlotItem[]>();
  items: SlotItem[] = [];

  async ngOnInit() {
    console.log("planningbyday au tt début ds schedule-board", this.planningByDay)
      console.log("RECUP",this.slots,this.sallesDispo)
      const converted = this.timeBlocks.map((b: TimeBlockConfig) => {
      const startMin = this.toMinutes(b.start);
      const endMin = this.toMinutes(b.end);
      const duration = endMin - startMin;

      return {
        ...b,
        startMin,
        endMin,
        duration,
        heightPercent: 0,
      };
    });

    // Total minutes (pauses exclues)
    const totalMinutes = converted.reduce(
      (sum, b) => sum + (b.duration ?? 0),
      0
    );

    // Pourcentage de hauteur de chaque bloc
    this.blocks = converted.map((b) => ({
      ...b,
      heightPercent: (b.duration / totalMinutes) * 100,
    }));

    this.blocks.forEach((block) => {
      this.slotsCache.set(block, this.calculateSlotsInBlock(block, this.planningByDay[this.jourActuel.toISOString().slice(0,10)]));
    });
    console.log("planningbyday au début ds schedule-board", this.planningByDay)
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

  getQuarterHourMarks(block: TimeBlock): number {
    // Nombre de quarts d'heure dans le bloc (duration en minutes / 15)
    return Math.floor(block.duration / 15);
  }

  calculateSlotsInBlock(block: TimeBlock, slots: SlotItem[]): SlotItem[] {
    return slots
    .filter(slot => {
        const startMin = slot.dateDebut!.getHours() * 60 + slot.dateDebut!.getMinutes();
        return startMin >= block.startMin && startMin < block.endMin;
    })
    .map((slot) => {
      const startMin = slot.dateDebut!.getHours() * 60 + slot.dateDebut!.getMinutes();
      const endMin = slot.dateFin!.getHours() * 60 + slot.dateFin!.getMinutes();

      const top = startMin - block.startMin;
      const height = endMin - startMin;

      slot.topPercent = (top / block.duration) * 100;
      slot.heightPercent = (height / block.duration) * 100;

      return slot;
    });
  }

  slotsInBlock(block: TimeBlock): SlotItem[] {
    console.log("dans slots in block")
    this.rebuildSlotsCache();
    return this.slotsCache.get(block) || [];
  }

  checkSameDay(date1: Date, date2: Date): boolean{
    return isSameDay(date1, date2);
  }

  onEditSlot(slot: SlotItem) {
    console.log("slot cliqué, dans schedule board", slot);
    this.editSlot.emit(slot);
  }

  //Fonctions pour drag and drop
  //Fonctions principales
  onDrop(
    event: CdkDragDrop<any>,
    container?: HTMLElement,
    targetDay?: Date,
    block?: TimeBlock
  ) {
    const draggedSlot = event.item.data as SlotItem;
    console.log("slot dragué",draggedSlot)
    console.log("jour droppé ? ", targetDay)
    
    let duration = draggedSlot.dateDebut && draggedSlot.dateFin ? draggedSlot.dateFin.getTime() - draggedSlot.dateDebut.getTime() : null;
    const lastDate = draggedSlot.dateDebut ? draggedSlot.dateDebut.toISOString().slice(0,10) : null;

    if (container && targetDay && block) {
      const rect = container.getBoundingClientRect();

      // Nouvelle salle ?
      const newRoom = this.xToRoom(event.dropPoint.x);
      console.log("nouvelle salle ? ", newRoom)

      if(newRoom === null){
        //Le slot est drag dans la zone d'attente s'il n'y a aucune salle
        console.log("transfert dans zone attente")
        // draggedSlot.duree = duration;
        draggedSlot.dateDebut = null;
        draggedSlot.dateFin = null;
        draggedSlot.salle = null;
        this.items.push(draggedSlot);
        console.log("zone attente : ", this.items)

        //Enlever slot de planningByDay
        for (const key in this.planningByDay) {
          this.planningByDay[key] = this.planningByDay[key].filter(s => s.id !== draggedSlot.id);
        }
        console.log("new planning by day: ",this.planningByDay)

        this.rebuildSlotsCache();
      }
      else{
        // S'il y a une salle le slot est droppé dans la salle au bon endroit
        console.log("transfert dans zone planning")
        // duration == null ? duration = draggedSlot.duree : duration = duration;

        // Si slot était en liste d'attente on l'enlève
        this.items = this.items.filter(i => i.id !== draggedSlot.id);
        
        const containerTop = rect.top;
        const containerHeight = rect.height;

        const existingSlots = this.planningByDay[targetDay.toISOString().slice(0,10)].filter(s =>
          s.id !== draggedSlot.id &&
          s.salle === newRoom
        );
        console.log("slots existants : ", existingSlots)
        
        // Nouvelles dates et heures du slot (dateDebut, dateFin)
        const [newStart, newBloc] = this.yToDate(
          event.dropPoint.y,
          containerTop,
          containerHeight,
          block.type,
          this.jourActuel, 
          duration! / 60000 //durée de la soutenance en minutes
        );
        console.log("new heure deb et new bloc",newStart, newBloc)
      
        const newEnd = new Date(newStart.getTime() + duration!);

        // Nouvelle position du slot (topPercent)
        const top = (newStart.getHours() * 60 + newStart.getMinutes()) - newBloc.startMin;
        const newTop = (top / newBloc.duration) * 100;
        console.log("newTop : ",newTop)
      
        // Vérification de la disponibilité du créneau choisit
        if (!this.canPlaceSlot(newStart, newEnd, existingSlots)) {
          // Le slot revient à sa place
          console.log("la place est déjà prise")
          return;
        }
      
        // Placement accepté
        draggedSlot.dateDebut = newStart;
        draggedSlot.dateFin = newEnd;
        draggedSlot.salle = newRoom;
        draggedSlot.topPercent = newTop;
        console.log("le slot drag droppé",draggedSlot)
        // Si le slot a changé de date on le supprime de l'ancienne dans planningByDay
        if(lastDate != null && this.planningByDay[targetDay.toISOString().slice(0,10)].find(s => s.id === draggedSlot.id)){
          this.planningByDay[targetDay.toISOString().slice(0,10)].filter(s => s.id !== draggedSlot.id)
        }

        // Si le slot est pas encore dans planningByDay ou a été supprimé après avoir changé de date on l'y met
        if (!this.planningByDay[targetDay.toISOString().slice(0,10)].find(s => s.id === draggedSlot.id)) {
          this.planningByDay[targetDay.toISOString().slice(0,10)].push(draggedSlot);
        }
        this.rebuildSlotsCache();
      }
    }
    console.log("liste d'items",this.items)
    console.log("liste planning by day",this.planningByDay)

    this.slotUpdated.emit(this.planningByDay);
  }
  
  //Fonctions secondaires
  overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
    return aStart < bEnd && aEnd > bStart;
  }
  
  canPlaceSlot(
    start: Date,
    end: Date,
    existingSlots: SlotItem[]
  ): boolean {
    return !existingSlots.some(s =>
      this.overlaps(start, end, s.dateDebut!, s.dateFin!)
    );
  }
  
  yToDate(
    mouseY: number,
    containerTop: number,
    containerHeight: number,
    bloc: "morning" | "afternoon",
    day: Date,
    duree: number
  ): [Date, TimeBlock] {
    const blocConfig = {
      "morning": { start: this.blocks.find(b => b.type == 'morning')?.startMin!/60, end: this.blocks.find(b => b.type == 'morning')?.endMin!/60 },
      "afternoon": { start: this.blocks.find(b => b.type == 'afternoon')?.startMin!/60, end: this.blocks.find(b => b.type == 'afternoon')?.endMin!/60 }
    };
  
    const { start, end } = blocConfig[bloc];
    let timeBloc = this.blocks.find(b => b.type == bloc);
    const ratio = (mouseY - containerTop) / containerHeight;
    const hour = start! + ratio * (end! - start!);
  
    let h = Math.floor(hour);
    // Arrondissement à 5min (drop possible toutes les 5 minutes)
    let m = (Math.round((hour - h) * 60 / 5) * 5) % 60;
    console.log("debut fin  ytodate: ", start, end)
    console.log("heure ytodate: ", h, m, duree)


    // Vérifications que les slots sont bien dans les bons blocs et ne dépasse pas
    // Réglage du matin pour éviter avant début
    if(h < start && bloc == "morning"){
      console.log("hour dépasse le début du bloc morning")
      h = start;
    }
    // Réglage pour éviter que le slot finisse après la fin du matin
    // Passage du matin à l'après-midi
    else if(h >= end && bloc == "morning"){
      console.log("hour dépasse la fin du bloc morning")
      h = h + (blocConfig["afternoon"].start - end);
      timeBloc = this.blocks.find(b => b.type == "afternoon");
    }
    // Passage de l'après-midi au matin
    else if(h < start && bloc == "afternoon"){
      console.log("hour dépasse le début du bloc afternoon")
      h = h - (start - blocConfig["morning"].end);
      console.log("new hour : ", h)
      timeBloc = this.blocks.find(b => b.type == "morning");
    }
    // Réglage de l'après-midi pour éviter après fin
    else if(h >= end && bloc == "afternoon"){
      console.log("hour dépasse la fin du bloc afternoon")
      h = end - 1;
    }
    // Réglage pour éviter que le slot finisse après la fin de l'après-midi
  
    const d = new Date(day);
    d.setHours(h, m, 0, 0);
    return [d, timeBloc!];
  }

  xToRoom(mouseX: number): number | null {
    // Récupérer toutes les cellules de salle
    const salleCells = document.querySelectorAll('.salle-cell');
    
    for (let i = 0; i < salleCells.length / 2; i++) {
      const cell = salleCells[i] as HTMLElement;
      const rect = cell.getBoundingClientRect();
      
      // Vérifier si la souris est dans cette cellule
      if (mouseX >= rect.left && mouseX <= rect.right) {
        return this.sallesDispo[i] || null;
      }
    }
    
    return null;
  }
    
  rebuildSlotsCache() {
    this.slotsCache.clear();
    console.log("planningbyday ds rebuildslotcache",this.planningByDay)
  
    for (const block of this.blocks) {
      this.slotsCache.set(
        block,
        this.calculateSlotsInBlock(block, this.planningByDay[this.jourActuel.toISOString().slice(0,10)])
      );
    }
  }
}
