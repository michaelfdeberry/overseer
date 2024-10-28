import { CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18NextModule } from 'angular-i18next';
import { Machine } from '../../models/machine.model';
import { MachinesService } from '../../services/machines.service';

@Component({
  selector: 'app-list-machines',
  templateUrl: './list-machines.component.html',
  standalone: true,
  imports: [I18NextModule, RouterLink, CdkDropList, CdkDragHandle],
})
export class ListMachinesComponent {
  private machinesService = inject(MachinesService);
  machines = signal<Machine[]>([]);

  constructor() {
    this.machinesService.getMachines().subscribe((machines) => this.machines.set(machines));
  }

  moveUp(index: number) {
    if (index <= 0) return;
    this.move(index, --index);
  }

  moveDown(index: number) {
    if (index >= this.machines().length) return;
    this.move(index, ++index);
  }

  move(previousIndex: number, currentIndex: number) {
    const machines = this.machines();
    if (!machines?.length) return;

    moveItemInArray(machines, previousIndex, currentIndex);
    this.machinesService.sortMachines(machines.map((m) => m.id)).subscribe(() => this.machines.set(machines));
  }

  drop(event: CdkDragDrop<string[]>) {
    this.move(event.previousIndex, event.currentIndex);
  }
}
