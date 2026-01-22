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
  @Output() slotUpdated = new EventEmitter<SlotItem>();

  blocks: TimeBlock[] = [];
  PAUSE_HEIGHT = 20;
  isModalOpen: boolean = false;

  // Variables for drag and drop
  private slotsCache = new Map<TimeBlock, SlotItem[]>();
  items: SlotItem[] = [];

  async ngOnInit() {
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
      this.slotsCache.set(block, this.calculateSlotsInBlock(block, this.slots));
    });
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
    targetSalleId?: number,
    block?: TimeBlock
  ) {
    console.log("salle : ",targetSalleId)
    const draggedSlot = event.item.data as SlotItem;
    console.log("slot dragué",draggedSlot)
    
    const duration = draggedSlot.dateFin!.getTime() - draggedSlot.dateDebut!.getTime();

    if (container && targetDay && targetSalleId && block) {
      console.log("transfert dans zone planning")
      // Le slot est drag dans la zone du planning
      if(event.previousContainer !== event.container){
        console.log("transfert dans zone planning depuis zone attente")
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
        );

        // Si slot était en liste d'attente on l'enlève
        this.items = this.items.filter(i => i.id !== draggedSlot.id);
      }
      const rect = container.getBoundingClientRect();

      const containerTop = rect.top;
      const containerHeight = rect.height;

      const existingSlots = this.planningByDay[targetDay.toISOString().slice(0,10)].filter(s =>
        s.id !== draggedSlot.id &&
        s.salle === targetSalleId
      );
      console.log("slots existants : ", existingSlots)
      
      // Nouvelles dates et heures du slot (dateDebut, dateFin)
      const [newStart, newBloc] = this.yToDate(
        event.dropPoint.y,
        containerTop,
        containerHeight,
        block.type,
        this.jourActuel, 
        duration / 60000 //durée de la soutenance en minutes
      );
      console.log("new heure deb et new bloc",newStart, newBloc)
    
      const newEnd = new Date(newStart.getTime() + duration);

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
      draggedSlot.salle = targetSalleId;
      draggedSlot.topPercent = newTop;
      console.log("le slot drag droppé",draggedSlot)
      this.rebuildSlotsCache();
    } else {
      //Le slot est drag dans la zone d'attente
      console.log("transfert dans zone attente")
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      draggedSlot.dateDebut = null;
      draggedSlot.dateFin = null;
      draggedSlot.salle = null;
      this.items.push(draggedSlot);

      //Enlever slot de planningByDay
      for (const key in this.planningByDay) {
        this.planningByDay[key] = this.planningByDay[key].filter(s => s.id !== draggedSlot.id);
      }

      this.rebuildSlotsCache();
    }
    console.log("liste d'items",this.items)
    console.log("liste planning by day",this.planningByDay)

    this.slotUpdated.emit(draggedSlot);
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
    
  rebuildSlotsCache() {
    this.slotsCache.clear();
  
    for (const block of this.blocks) {
      this.slotsCache.set(
        block,
        this.calculateSlotsInBlock(block, this.slots)
      );
    }
  }
}
