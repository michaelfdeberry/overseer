import { Component, HostBinding, inject, Input, OnChanges, SimpleChanges, ViewContainerRef } from '@angular/core';
import { SvgService } from '../../services/svg.service';

@Component({
  selector: 'app-svg',
  standalone: true,
  template: '',
  styles: [':host { display: flex; } svg { height: 100%; width: 100%; }'],
  providers: [SvgService],
})
export class SvgComponent implements OnChanges {
  private svgService: SvgService = inject(SvgService);
  private viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

  @HostBinding('class') className: string = '';

  @Input() name!: string;

  ngOnChanges(changes: SimpleChanges): void {
    const nameChange = changes['name'];
    if (nameChange.firstChange || nameChange.previousValue !== nameChange.currentValue) {
      this.className = nameChange.currentValue;
      this.loadSvg(nameChange.currentValue);
    }
  }

  async loadSvg(name: string): Promise<void> {
    const svg = await this.svgService.getSvg(name);
    if (!svg) return;

    this.viewContainerRef.clear();
    this.viewContainerRef.element.nativeElement.innerHTML = svg;
  }
}
