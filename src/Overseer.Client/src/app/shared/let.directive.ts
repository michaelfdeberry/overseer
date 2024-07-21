import { Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";

interface LetContext <T> {
  appLet: T | null;
}

@Directive({
  selector: "[appLet]",
})
export class LetDirective <T> {
  private context: LetContext <T> = { appLet: null };

  constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef <LetContext <T> >) {
    viewContainer.createEmbeddedView(templateRef, this.context);
  }

  @Input()
  set appLet(value: T) {
    this.context.appLet = value;
  }
}
