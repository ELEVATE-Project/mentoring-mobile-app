import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { environment } from 'src/environments/environment';

@Directive({
  selector: '[allowTemplateView]',
})
export class AllowTemplateViewDirective {
  @Input() set allowTemplateView( pageId: any ) {
    if(!window['env']['restictedPages'].includes(pageId)){
      this.viewContainer.createEmbeddedView(this.templateRef);
    }else{
      this.viewContainer.clear();
    }
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
  ) {}
}
