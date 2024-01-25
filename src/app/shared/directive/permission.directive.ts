import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from 'src/app/core/services/permission/permission.service';

@Directive({
  selector: '[appHasPermission]',
})
export class HasPermissionDirective {
  @Input() set appHasPermission( permissions: any ) {
    this.permissionService.hasPermission(permissions).then((hasPermission: boolean)=>{
      if(hasPermission){
        this.viewContainer.createEmbeddedView(this.templateRef);
      }else{
        this.viewContainer.clear();
      }
    })
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}
}
