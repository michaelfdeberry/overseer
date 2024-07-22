import { Component, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgProgressComponent } from 'ngx-progressbar';
import { Subscription } from 'rxjs';
import { NavigationComponent } from './navigation/navigation.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent, NgProgressComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  themeSubscription?: Subscription;

  constructor(
    private themeService: ThemeService,
    private renderer: Renderer2,
  ) {}

  get primaryColor() {
    return this.themeService.primaryColor;
  }

  ngOnInit() {
    this.themeSubscription = this.themeService.theme$.subscribe((theme) => {
      if (theme.previous) {
        this.renderer.removeClass(document.body, theme.previous);
      }
      this.renderer.addClass(document.body, theme.current);
    });
  }

  ngOnDestroy() {
    this.themeSubscription?.unsubscribe();
  }
}
