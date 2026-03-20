import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SlotItem } from "../models/slotItem.model";

@Injectable({ providedIn: 'root' })
export class PlanningItemsService {

  private itemsSubject = new BehaviorSubject<SlotItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  addToWaiting(newItems: SlotItem[]) {
    const current = this.itemsSubject.value;
    this.itemsSubject.next([...current, ...newItems]);
  }

  setItems(items: SlotItem[]) {
    this.itemsSubject.next(items);
  }
}