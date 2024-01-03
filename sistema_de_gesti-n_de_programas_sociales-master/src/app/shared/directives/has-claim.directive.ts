import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { SecurityService } from 'src/app/core/services/security.service';

@Directive({
  selector: '[appHasClaim]'
})
export class HasClaimDirective {  

  @Input() set appHasClaim(claimType: string) {
    if (this.securityService.hasClaim(claimType)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private securityService: SecurityService
  ) { }
  
}